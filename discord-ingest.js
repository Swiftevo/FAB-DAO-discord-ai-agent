const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const MAX_THREAD_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_BATCH_LENGTH = 12000;

function normalized(value) {
    return String(value || '').toLowerCase().replace(/[\s+＋:：_\-]/g, '');
}

function loadProjects() {
    const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'summary.json'), 'utf8'));
    return projects.map(project => {
        const recordFile = path.join(DATA_DIR, 'records', `${project.id}.json`);
        if (!fs.existsSync(recordFile)) return project;
        const record = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
        return {
            ...project,
            full_title: project.full_title || record.full_title,
            aliases: [...new Set([...(project.aliases || []), record.project_name].filter(Boolean))],
            discord_channel_url: project.discord_channel_url || record.links?.discord_channel
        };
    });
}

function projectNames(project) {
    return [project.id, project.project, project.full_title, ...(project.aliases || []),
        String(project.project || '').split(/[+＋:：]/)[0]].filter(Boolean);
}

function resolveProject(name, projects = loadProjects()) {
    const key = normalized(name);
    if (!key) return null;
    const matches = projects.filter(project => projectNames(project).some(alias => normalized(alias) === key));
    return matches.length === 1 ? matches[0] : null;
}

function parseIngestCommand(prompt) {
    const text = String(prompt || '').trim();
    let match = text.match(/^(?:收錄|更新)(?:到|至)?\s+(.+?)\s*$/i);
    if (match) return { projectName: match[1].trim(), mode: 'reply' };
    match = text.match(/^(?:收錄|更新)這串到\s+(.+?)\s*$/i);
    if (match) return { projectName: match[1].trim(), mode: 'thread' };
    return null;
}

function projectChannelId(project) {
    const match = String(project.discord_channel_url || '').match(/discord(?:app)?\.com\/channels\/\d+\/(\d+)/);
    return match ? match[1] : null;
}

function isAllowedChannel(channel, project, allowedIds) {
    const projectId = projectChannelId(project);
    return Boolean(projectId && allowedIds.includes(projectId)
        && (channel.id === projectId || channel.parentId === projectId));
}

function sourceEntry(message) {
    const content = String(message.content || '').trim();
    if (!content || message.author?.bot) return null;
    if (content.length > MAX_MESSAGE_LENGTH) throw new Error('source_too_long');
    return {
        message_id: message.id,
        posted_at: message.createdAt?.toISOString() || new Date(message.createdTimestamp).toISOString(),
        source_url: message.url,
        content
    };
}

async function collectMessages(commandMessage, mode) {
    if (mode === 'reply') {
        if (!commandMessage.reference?.messageId) throw new Error('reply_required');
        const target = await commandMessage.fetchReference();
        if (target.channelId !== commandMessage.channelId) throw new Error('wrong_channel');
        const entry = sourceEntry(target);
        if (!entry) throw new Error('empty_source');
        if (entry.content.length > MAX_BATCH_LENGTH) throw new Error('batch_too_long');
        return [entry];
    }
    if (!commandMessage.channel.isThread()) throw new Error('thread_required');
    const fetched = await commandMessage.channel.messages.fetch({ limit: MAX_THREAD_MESSAGES, before: commandMessage.id });
    const entries = [...fetched.values()]
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map(sourceEntry)
        .filter(Boolean);
    if (!entries.length) throw new Error('empty_source');
    if (entries.reduce((total, entry) => total + entry.content.length, 0) > MAX_BATCH_LENGTH) {
        throw new Error('batch_too_long');
    }
    return entries;
}

function buildRecord(project, commandMessage, entries) {
    const first = entries[0];
    const last = entries[entries.length - 1];
    return {
        schema_version: 1,
        project_id: project.id,
        project_name: project.project,
        source_type: 'discord_messages',
        source_channel_id: commandMessage.channelId,
        source_message_ids: entries.map(entry => entry.message_id),
        range_start: first.posted_at,
        range_end: last.posted_at,
        captured_at: new Date().toISOString(),
        status: 'source_posts_not_independently_verified',
        entries
    };
}

function recordPath(record) {
    const latestId = record.source_message_ids[record.source_message_ids.length - 1];
    return `data/discord_updates/${record.project_id}/${latestId}.json`;
}

function sourceDigest(record) {
    return crypto.createHash('sha256').update(JSON.stringify({
        project_id: record.project_id,
        source_message_ids: record.source_message_ids,
        entries: record.entries
    })).digest('hex').slice(0, 16);
}

function relevantUpdates(prompt, projects = loadProjects(), dataDir = DATA_DIR) {
    const query = normalized(prompt);
    const matching = projects.filter(project => projectNames(project)
        .some(alias => normalized(alias).length >= 2 && query.includes(normalized(alias))));
    const candidates = [];
    for (const project of matching) {
        const directory = path.join(dataDir, 'discord_updates', project.id);
        if (!fs.existsSync(directory)) continue;
        const projectQuery = projectNames(project).reduce((text, name) =>
            text.replaceAll(normalized(name), ''), query);
        const terms = [...new Set([
            ...(projectQuery.match(/[a-z0-9]{2,}/g) || []),
            ...((projectQuery.match(/[\u3400-\u9fff]+/g) || []).flatMap(run =>
                Array.from({ length: Math.max(0, run.length - 1) }, (_, index) => run.slice(index, index + 2))))
        ])].filter(term => !['更新', '最近', '進度', '甚麼', '什么', '時候', '何時'].includes(term));
        for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.json'))) {
            const record = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
            if (record.project_id !== project.id) continue;
            const excerpt = record.entries.map(entry => `${entry.posted_at} | ${entry.source_url}\n${entry.content}`).join('\n\n');
            const searchable = normalized(excerpt);
            const score = terms.reduce((count, term) => count + (searchable.includes(term) ? 1 : 0), 0);
            candidates.push({ project, record, excerpt, score });
        }
    }
    candidates.sort((a, b) => b.score - a.score || b.record.range_end.localeCompare(a.record.range_end));
    const result = [];
    const seen = new Set();
    let used = 0;
    for (const { project, record } of candidates) {
        const entries = record.entries.filter(entry => !seen.has(entry.message_id));
        const excerpt = entries.map(entry => `${entry.posted_at} | ${entry.source_url}\n${entry.content}`).join('\n\n');
        if (!excerpt || used + excerpt.length > 16000) continue;
        entries.forEach(entry => seen.add(entry.message_id));
        used += excerpt.length;
        result.push(`【${project.project} Discord 更新；發文者陳述，未獨立核實】\n${excerpt}`);
    }
    return result.join('\n\n');
}

async function githubRequest(apiPath, method, body, config) {
    const response = await config.fetch(`https://api.github.com/repos/${config.repository}${apiPath}`, {
        method,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'FAB-DAO-discord-ai-agent',
            'X-GitHub-Api-Version': '2022-11-28'
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`github_http_${response.status}`);
    return response.json();
}

async function createDraftPullRequest(record, commandId, config = {}) {
    const settings = {
        token: config.token || process.env.GITHUB_INGEST_TOKEN,
        repository: config.repository || process.env.GITHUB_INGEST_REPOSITORY || 'Swiftevo/FAB-DAO-discord-ai-agent',
        base: config.base || process.env.GITHUB_INGEST_BASE_BRANCH || 'main',
        fetch: config.fetch || global.fetch
    };
    if (!settings.token) throw new Error('github_not_configured');
    const filePath = recordPath(record);
    const baseRef = await githubRequest(`/git/ref/heads/${settings.base}`, 'GET', undefined, settings);
    const existing = await settings.fetch(`https://api.github.com/repos/${settings.repository}/contents/${filePath}?ref=${settings.base}`, {
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${settings.token}`, 'User-Agent': 'FAB-DAO-discord-ai-agent' }
    });
    if (existing.ok) throw new Error('already_recorded');
    if (existing.status !== 404) throw new Error(`github_http_${existing.status}`);
    const branch = `discord-update-${commandId}`;
    await githubRequest('/git/refs', 'POST', { ref: `refs/heads/${branch}`, sha: baseRef.object.sha }, settings);
    await githubRequest(`/contents/${filePath}`, 'PUT', {
        message: `docs: capture Discord source for ${record.project_id}`,
        content: Buffer.from(`${JSON.stringify(record, null, 2)}\n`).toString('base64'),
        branch
    }, settings);
    const pull = await githubRequest('/pulls', 'POST', {
        title: `收錄 ${record.project_name} Discord 更新`,
        body: `來源訊息：${record.entries.map(entry => entry.source_url).join('\n')}\n\n請核對資料、可公開範圍及專案對應後再合併。這些是發文者陳述，不能單憑留言認定撥款或成果完成。`,
        head: branch,
        base: settings.base,
        draft: true
    }, settings);
    return pull.html_url;
}

async function handleIngestCommand(message, command, isReviewer, options = {}) {
    if (!isReviewer) return '只有「行動客廳小組」可提交收錄。';
    if (process.env.DISCORD_INGEST_ENABLED !== 'true') return 'Discord 收錄尚未啟用；需要先設定允許的頻道與 GitHub 寫入憑證。';
    const allowedIds = String(process.env.DISCORD_INGEST_CHANNEL_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    const project = resolveProject(command.projectName, options.projects);
    if (!project) return '找不到唯一的專案名稱。請使用 APP_### 或資料庫中的專案名稱。';
    if (!isAllowedChannel(message.channel, project, allowedIds)) return '這個頻道未獲准收錄到該專案。';
    try {
        const entries = await collectMessages(message, command.mode);
        const record = buildRecord(project, message, entries);
        const digest = sourceDigest(record);
        if (!options.submit) {
            const sample = entries.map(entry => entry.content).join(' ').slice(0, 350);
            return `[待審收錄:${digest}] ${project.project}｜${entries.length} 則留言\n來源範圍：${entries[0].source_url}${entries.length > 1 ? ` 至 ${entries[entries.length - 1].source_url}` : ''}\n內容預覽：${sample}${sample.length === 350 ? '…' : ''}\n確認內容可放進公開 GitHub 後，請回覆這則訊息並輸入「@快樂鼠 確認收錄」。`;
        }
        if (options.expectedDigest !== digest) return '來源留言在預覽後有變動，請重新下達收錄指令。';
        const pullUrl = await createDraftPullRequest(record, message.id, options.github);
        return `已擷取 ${entries.length} 則 Discord 留言，提交為待審 GitHub 變更：${pullUrl}\n核對後合併，快樂鼠才會用於回答。`;
    } catch (error) {
        const known = {
            reply_required: '請先回覆要收錄的留言，再 tag 快樂鼠下達收錄指令。',
            thread_required: '「收錄這串」只適用於 Discord 討論串。',
            wrong_channel: '只能收錄目前專案頻道中的留言。',
            empty_source: '指定範圍沒有可收錄的文字留言。',
            source_too_long: '其中一則留言超過 4,000 字元；請改為單則收錄。',
            batch_too_long: '這組留言合計超過 12,000 字元；請縮小範圍或改為逐則收錄。',
            github_not_configured: 'GitHub 收錄憑證尚未設定。',
            already_recorded: '這組留言已在正式資料中。'
        };
        if (!known[error.message]) console.error('Discord ingest failed:', error.message);
        return known[error.message] || '收錄未完成，請維護者查看服務記錄。';
    }
}

async function handleIngestConfirmation(message, isReviewer, options = {}) {
    if (!isReviewer) return '只有「行動客廳小組」可確認收錄。';
    if (!message.reference?.messageId) return '請回覆快樂鼠的「待審收錄」預覽訊息。';
    try {
        const preview = await message.fetchReference();
        const previewMatch = preview.content?.match(/^\[待審收錄:([a-f0-9]{16})\]/);
        if (preview.author?.id !== message.client.user.id || !previewMatch) {
            return '請回覆快樂鼠的「待審收錄」預覽訊息。';
        }
        const original = await preview.fetchReference();
        if (original.channelId !== message.channelId) return '只能在原本的專案頻道確認收錄。';
        const prompt = original.content.replace(/<@!?\d+>/g, '').trim();
        const command = parseIngestCommand(prompt);
        if (!command) return '原本的收錄指令已無法辨識。';
        return handleIngestCommand(original, command, isReviewer, { ...options, submit: true, expectedDigest: previewMatch[1] });
    } catch (error) {
        console.error('Discord ingest confirmation failed:', error.message);
        return '無法讀取待審收錄訊息，請重新下達收錄指令。';
    }
}

module.exports = {
    parseIngestCommand, resolveProject, isAllowedChannel, collectMessages, buildRecord,
    recordPath, relevantUpdates, createDraftPullRequest, handleIngestCommand, handleIngestConfirmation
};
