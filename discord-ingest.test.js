const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
    parseIngestCommand, resolveProject, isAllowedChannel, collectMessages, buildRecord, recordPath,
    relevantUpdates, createDraftPullRequest, handleIngestCommand, handleIngestConfirmation
} = require('./discord-ingest');

const project = {
    id: 'APP_003', project: '大量交織+地球公物', aliases: ['MEGAWEAVING'],
    discord_channel_url: 'https://discord.com/channels/999/123'
};

function source(id, content) {
    return {
        id, content, channelId: '123', author: { bot: false },
        createdAt: new Date('2026-06-05T10:00:00Z'), createdTimestamp: 1780653600000,
        url: `https://discord.com/channels/999/123/${id}`
    };
}

test('recognizes only explicit collection commands and unique project names', () => {
    assert.deepEqual(parseIngestCommand('收錄到 大量交織'), { projectName: '大量交織', mode: 'reply' });
    assert.deepEqual(parseIngestCommand('收錄這串到 APP_003'), { projectName: 'APP_003', mode: 'thread' });
    assert.equal(parseIngestCommand('大量交織最近更新是甚麼？'), null);
    assert.equal(resolveProject('大量交織', [project]).id, 'APP_003');
    assert.equal(resolveProject('不存在', [project]), null);
});

test('uses registered project channels from detailed records when the summary lacks them', () => {
    const shishui = resolveProject('事水');
    assert.equal(shishui.id, 'APP_004');
    assert.equal(isAllowedChannel({ id: '1477867968380796969' }, shishui, ['1477867968380796969']), true);
    assert.equal(isAllowedChannel({ id: 'other' }, shishui, ['1477867968380796969']), false);
});

test('reply capture uses only the referenced message; thread capture has a fixed bound', async () => {
    const original = source('456', '網站測試已完成');
    const command = {
        id: '789', channelId: '123', reference: { messageId: '456' },
        fetchReference: async () => original
    };
    assert.equal((await collectMessages(command, 'reply'))[0].content, '網站測試已完成');

    let fetchOptions;
    command.channel = {
        isThread: () => true,
        messages: { fetch: async options => {
            fetchOptions = options;
            return new Map([['456', original], ['bot', { ...source('457', 'bot text'), author: { bot: true } }]]);
        } }
    };
    assert.equal((await collectMessages(command, 'thread')).length, 1);
    assert.deepEqual(fetchOptions, { limit: 20, before: '789' });
});

test('preview requires allowed project channel and does not publish', async () => {
    const oldEnabled = process.env.DISCORD_INGEST_ENABLED;
    const oldChannels = process.env.DISCORD_INGEST_CHANNEL_IDS;
    process.env.DISCORD_INGEST_ENABLED = 'true';
    process.env.DISCORD_INGEST_CHANNEL_IDS = '123';
    try {
        const message = {
            id: '789', channelId: '123', channel: { id: '123' },
            reference: { messageId: '456' }, fetchReference: async () => source('456', '網站測試已完成')
        };
        const reply = await handleIngestCommand(message, parseIngestCommand('收錄到 APP_003'), true, { projects: [project] });
        assert.match(reply, /\[待審收錄:[a-f0-9]{16}\]/);
        assert.match(reply, /確認收錄/);
        message.channel.id = '999';
        assert.match(await handleIngestCommand(message, parseIngestCommand('收錄到 APP_003'), true, { projects: [project] }), /未獲准/);
    } finally {
        if (oldEnabled === undefined) delete process.env.DISCORD_INGEST_ENABLED;
        else process.env.DISCORD_INGEST_ENABLED = oldEnabled;
        if (oldChannels === undefined) delete process.env.DISCORD_INGEST_CHANNEL_IDS;
        else process.env.DISCORD_INGEST_CHANNEL_IDS = oldChannels;
    }
});

test('approved records are retrieved only for the matching project with source links', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fab-discord-'));
    try {
        const record = buildRecord(project, { channelId: '123' }, [{
            message_id: '456', posted_at: '2026-06-05T10:00:00.000Z',
            source_url: 'https://discord.com/channels/999/123/456', content: '網站測試已完成'
        }]);
        const filePath = path.join(root, recordPath(record));
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(record));
        const dataDir = path.join(root, 'data');
        assert.match(relevantUpdates('大量交織有甚麼進度？', [project], dataDir), /網站測試已完成/);
        assert.match(relevantUpdates('APP_003 進度', [project], dataDir), /discord\.com\/channels/);
        assert.equal(relevantUpdates('羽球社進度', [project], dataDir), '');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});

test('retrieval favors an older relevant update over a newer unrelated one', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fab-discord-'));
    try {
        const directory = path.join(root, 'data', 'discord_updates', 'APP_003');
        fs.mkdirSync(directory, { recursive: true });
        const older = buildRecord(project, { channelId: '123' }, [{
            message_id: '456', posted_at: '2026-06-05T10:00:00.000Z',
            source_url: 'https://discord.com/channels/999/123/456', content: '私訊圖片功能已完成'
        }]);
        const newer = buildRecord(project, { channelId: '123' }, [{
            message_id: '999', posted_at: '2026-10-05T10:00:00.000Z',
            source_url: 'https://discord.com/channels/999/123/999', content: '首頁標題已修改'
        }]);
        fs.writeFileSync(path.join(directory, '456.json'), JSON.stringify(older));
        fs.writeFileSync(path.join(directory, '999.json'), JSON.stringify(newer));
        const context = relevantUpdates('大量交織私訊圖片功能進度', [project], path.join(root, 'data'));
        assert.ok(context.indexOf('私訊圖片功能已完成') < context.indexOf('首頁標題已修改'));
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});

test('GitHub draft flow writes to a branch and leaves main unchanged', async () => {
    const record = buildRecord(project, { channelId: '123' }, [{
        message_id: '456', posted_at: '2026-06-05T10:00:00.000Z',
        source_url: 'https://discord.com/channels/999/123/456', content: '網站測試已完成'
    }]);
    const calls = [];
    const fakeFetch = async (url, options = {}) => {
        calls.push({ url, options });
        if (url.includes('/git/ref/heads/main')) return { ok: true, json: async () => ({ object: { sha: 'base-sha' } }) };
        if (url.includes('/contents/') && options.method !== 'PUT') return { ok: false, status: 404 };
        if (url.endsWith('/pulls')) return { ok: true, json: async () => ({ html_url: 'https://github.com/example/pull/1' }) };
        return { ok: true, json: async () => ({}) };
    };
    const url = await createDraftPullRequest(record, '789', {
        token: 'test-token', repository: 'Swiftevo/FAB-DAO-discord-ai-agent', base: 'main', fetch: fakeFetch
    });
    assert.equal(url, 'https://github.com/example/pull/1');
    const write = calls.find(call => call.options.method === 'PUT');
    assert.equal(JSON.parse(write.options.body).branch, 'discord-update-789');
    assert.equal(Buffer.from(JSON.parse(write.options.body).content, 'base64').toString().includes('網站測試已完成'), true);
    assert.equal(JSON.parse(calls.find(call => call.url.endsWith('/pulls')).options.body).draft, true);
});

test('confirmation must reply to this bot preview before writing', async () => {
    const oldEnabled = process.env.DISCORD_INGEST_ENABLED;
    const oldChannels = process.env.DISCORD_INGEST_CHANNEL_IDS;
    process.env.DISCORD_INGEST_ENABLED = 'true';
    process.env.DISCORD_INGEST_CHANNEL_IDS = '123';
    try {
        const original = {
            id: '789', content: '<@1234> 收錄到 APP_003', channelId: '123',
            channel: { id: '123' }, reference: { messageId: '456' },
            fetchReference: async () => source('456', '網站測試已完成')
        };
        const previewText = await handleIngestCommand(original, parseIngestCommand('收錄到 APP_003'), true, { projects: [project] });
        const preview = {
            author: { id: '1234' }, content: previewText,
            fetchReference: async () => original
        };
        const confirmation = {
            channelId: '123', client: { user: { id: '1234' } },
            reference: { messageId: 'preview' }, fetchReference: async () => preview
        };
        const calls = [];
        const fakeFetch = async (url, options = {}) => {
            calls.push(url);
            if (url.includes('/git/ref/heads/main')) return { ok: true, json: async () => ({ object: { sha: 'base-sha' } }) };
            if (url.includes('/contents/') && options.method !== 'PUT') return { ok: false, status: 404 };
            if (url.endsWith('/pulls')) return { ok: true, json: async () => ({ html_url: 'https://github.com/example/pull/2' }) };
            return { ok: true, json: async () => ({}) };
        };
        const options = { projects: [project], github: { token: 'test-token', fetch: fakeFetch } };
        assert.match(await handleIngestConfirmation(confirmation, true, options), /pull\/2/);
        assert.ok(calls.some(url => url.endsWith('/pulls')));
        preview.author.id = 'another-bot';
        assert.match(await handleIngestConfirmation(confirmation, true, options), /請回覆/);
    } finally {
        if (oldEnabled === undefined) delete process.env.DISCORD_INGEST_ENABLED;
        else process.env.DISCORD_INGEST_ENABLED = oldEnabled;
        if (oldChannels === undefined) delete process.env.DISCORD_INGEST_CHANNEL_IDS;
        else process.env.DISCORD_INGEST_CHANNEL_IDS = oldChannels;
    }
});
