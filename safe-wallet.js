const fs = require('fs');
const path = require('path');
const { findSnapshotTransaction, snapshotTransactionSummary, snapshotRecentTransactions, snapshotNoteSearch } = require('./safe-snapshot');

const GROUPS_DIR = path.join(__dirname, 'data', 'groups');
const API_ORIGIN = 'https://api.safe.global';
const HASH_PATTERN = /0x[a-fA-F0-9]{64}\b/;
const WALLET_PATTERN = /錢包|多簽|safe|wallet/i;
const BALANCE_PATTERN = /餘額|結餘|資金|資產|balance|還有多少|有幾多/i;
const HISTORY_PATTERN = /交易|出入|收支|轉帳|流水|transaction|\btx\b|history/i;
const NOTE_PATTERN = /備註|note/i;
const LIVE_HISTORY_PATTERN = /即時|實時|实时|live\s*(?:transaction|tx|history)|real.?time/i;

function getConfiguredGroups() {
    const groups = JSON.parse(fs.readFileSync(path.join(GROUPS_DIR, 'index.json'), 'utf8'));
    return groups.map(group => {
        const filePath = path.join(GROUPS_DIR, group.id, 'wallets.json');
        if (!fs.existsSync(filePath)) return { ...group, wallets: [] };
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return { ...group, wallets: data.wallets || [], visibility: data.visibility };
    });
}

function identifyGroup(prompt, groups) {
    const lower = prompt.toLowerCase();
    return groups.find(group =>
        [group.name, ...(group.aliases || [])].some(name => lower.includes(name.toLowerCase())) ||
        group.wallets.some(wallet => lower.includes(wallet.address.toLowerCase())));
}

function formatUnits(raw, decimals) {
    if (!/^\d+$/.test(String(raw)) || !Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
        return `${raw} 原始單位`;
    }
    const base = 10n ** BigInt(decimals);
    const amount = BigInt(raw);
    const whole = amount / base;
    const fraction = (amount % base).toString().padStart(decimals, '0').replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : String(whole);
}

function timestamp(value) {
    if (!value) return '時間未提供';
    return new Intl.DateTimeFormat('zh-HK', {
        timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(value)) + '（香港時間）';
}

function walletBase(wallet) {
    if (!/^[a-z0-9]+$/.test(wallet.chain_prefix) || !/^0x[a-fA-F0-9]{40}$/.test(wallet.address)) {
        throw new Error('Invalid configured Safe wallet');
    }
    return `${API_ORIGIN}/tx-service/${wallet.chain_prefix}/api`;
}

async function safeGet(url, fetcher, apiKey) {
    const response = await fetcher(url, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
        const error = new Error(`Safe API HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function tokenAmount(transfer, wallet) {
    const native = !transfer.tokenAddress;
    const decimals = native ? 18 : transfer.tokenInfo?.decimals;
    const symbol = native ? (wallet.native_token_symbol || '原生代幣')
        : transfer.tokenInfo?.trusted === true ? (transfer.tokenInfo?.symbol || transfer.tokenAddress)
            : '未核實代幣';
    return `${formatUnits(transfer.value, decimals)} ${symbol}`;
}

function transactionNote(tx) {
    try {
        const origin = typeof tx.origin === 'string' ? JSON.parse(tx.origin) : tx.origin;
        const note = origin?.note;
        return typeof note === 'string' && note.trim()
            ? note.replace(/\s+/g, ' ').replace(/@/g, '＠').slice(0, 200) : null;
    } catch {
        return null;
    }
}

function transactionSummary(tx, wallet) {
    const address = wallet.address.toLowerCase();
    const transfers = (tx.transfers || []).filter(item =>
        item.from?.toLowerCase() === address || item.to?.toLowerCase() === address);
    const description = transfers.length ? transfers.slice(0, 3).map(item => {
        const incoming = item.to?.toLowerCase() === address;
        return `${incoming ? '收入' : '支出'} ${tokenAmount(item, wallet)}`;
    }).join('；') : (tx.isSuccessful === false ? '執行失敗' : '無可辨識的資產轉移');
    const hash = tx.transactionHash || tx.txHash || tx.safeTxHash;
    const explorer = wallet.explorer_tx_url_prefix && hash
        ? `${wallet.explorer_tx_url_prefix}${hash}` : wallet.safe_url;
    const note = transactionNote(tx);
    return `${timestamp(tx.executionDate)}｜${description}` +
        `${note ? `\nSafe 備註（鏈下標籤）：${note}` : ''}` +
        `\n交易：${hash || '未提供'}\n${explorer}`;
}

async function readBalances(group, wallet, fetcher, apiKey) {
    const url = `${walletBase(wallet)}/v2/safes/${wallet.address}/balances/?trusted=true&exclude_spam=true&limit=200`;
    const data = await safeGet(url, fetcher, apiKey);
    const lines = (data.results || []).map(item => {
        const native = !item.tokenAddress;
        const symbol = native ? (wallet.native_token_symbol || '原生代幣')
            : (item.token?.symbol || item.tokenAddress);
        return `- ${formatUnits(item.balance, native ? 18 : item.token?.decimals)} ${symbol}`;
    });
    return `【${group.name}｜${wallet.name || '多簽錢包'}】\n` +
        `${lines.length ? lines.join('\n') : '未查到已信任代幣餘額'}\n` +
        `查詢時間：${timestamp(new Date())}\n` +
        `範圍：Safe API 已信任、非垃圾代幣；其他資產請核對 Safe 頁面。\n${wallet.safe_url}`;
}

async function readTransactions(group, wallet, requestedHash, fetcher, apiKey) {
    const base = `${walletBase(wallet)}/v2/safes/${wallet.address}/all-transactions/`;
    if (!requestedHash) {
        const data = await safeGet(`${base}?limit=5`, fetcher, apiKey);
        const transactions = (data.results || []).filter(tx => tx.executionDate).slice(0, 5);
        return `【${group.name}｜最近交易】\n` +
            (transactions.length ? transactions.map(tx => transactionSummary(tx, wallet)).join('\n\n') : '尚無已執行交易') +
            `\n\n查詢時間：${timestamp(new Date())}\n來源：${wallet.safe_url}`;
    }

    const hash = requestedHash.toLowerCase();
    for (let offset = 0; offset < 1000; offset += 100) {
        const data = await safeGet(`${base}?limit=100&offset=${offset}`, fetcher, apiKey);
        const match = (data.results || []).find(tx =>
            [tx.transactionHash, tx.txHash, tx.safeTxHash]
                .some(value => value?.toLowerCase() === hash));
        if (match) {
            return `【${group.name}｜指定交易】\n${transactionSummary(match, wallet)}\n` +
                `查詢時間：${timestamp(new Date())}`;
        }
        if (!data.next) break;
    }
    return `在 ${group.name} 的已執行交易紀錄中找不到 ${requestedHash}。` +
        `若交易仍待簽署，或早於已查詢的 1,000 筆，請到 Safe 核對：${wallet.safe_url}`;
}

async function handleWalletRequest(prompt, options = {}) {
    const groups = getConfiguredGroups();
    const group = identifyGroup(prompt, groups);
    const requestedHash = prompt.match(HASH_PATTERN)?.[0];
    const isWalletQuestion = WALLET_PATTERN.test(prompt) ||
        (group && (BALANCE_PATTERN.test(prompt) || HISTORY_PATTERN.test(prompt) || NOTE_PATTERN.test(prompt))) ||
        (requestedHash && (HISTORY_PATTERN.test(prompt) || /查詢|找|搜尋/.test(prompt)));
    if (!isWalletQuestion) return null;

    if (group && !group.wallets.length) {
        return `${group.name} 尚未登記 Safe 多簽錢包地址；請由小組維護者提供鏈別與地址。`;
    }
    const configured = groups.filter(item => item.wallets.length);
    const selectedGroup = group || (configured.length === 1 ? configured[0] : null);
    if (!selectedGroup) {
        return `請指定小組：${configured.map(item => item.name).join('、') || '目前沒有已登記的錢包'}。`;
    }
    const wallet = selectedGroup.wallets.length === 1 ? selectedGroup.wallets[0] :
        selectedGroup.wallets.find(item => prompt.toLowerCase().includes((item.name || item.id).toLowerCase()));
    if (!wallet) return `請指定 ${selectedGroup.name} 的錢包：${selectedGroup.wallets.map(item => item.name || item.id).join('、')}。`;
    if (selectedGroup.visibility !== 'public_governance_data') {
        return `${selectedGroup.name} 的錢包資料尚未標記為可公開查詢。`;
    }
    if (!BALANCE_PATTERN.test(prompt) && !HISTORY_PATTERN.test(prompt) && !NOTE_PATTERN.test(prompt) && !requestedHash) {
        return `可查詢「${selectedGroup.name} 錢包餘額」、「${selectedGroup.name} 最近交易」、「${selectedGroup.name} 備註 關鍵字」，或提供交易 hash。\n${wallet.safe_url}`;
    }
    if (requestedHash) {
        const saved = findSnapshotTransaction(wallet, requestedHash);
        if (saved) {
            return `【${selectedGroup.name}｜指定交易（已收錄快照）】\n${snapshotTransactionSummary(saved, wallet)}`;
        }
    }
    if (NOTE_PATTERN.test(prompt)) {
        const keyword = (prompt.match(/(?:備註|note)\s*[:：]?\s*([^\n]*)/i)?.[1] || '')
            .replace(/[？?。！!]+$/, '').replace(/^(?:查詢|搜尋|找|關於)\s*/, '')
            .replace(/(?:有哪些|有什麼|是什麼|是甚麼|嗎|呢)$/, '').trim();
        const saved = snapshotNoteSearch(wallet, keyword);
        if (saved) return `【${selectedGroup.name}｜已收錄 Safe 備註${keyword ? `：${keyword}` : ''}】\n${saved}`;
    }
    if (!requestedHash && HISTORY_PATTERN.test(prompt) && !LIVE_HISTORY_PATTERN.test(prompt)) {
        const saved = snapshotRecentTransactions(wallet);
        if (saved) return `【${selectedGroup.name}｜最近已收錄交易】\n${saved}`;
    }
    const apiKey = options.apiKey ?? process.env.SAFE_API_KEY;
    if (!apiKey) return 'Safe 查詢尚未啟用：請維護者在部署環境設定 SAFE_API_KEY。';
    const fetcher = options.fetcher || fetch;
    try {
        if (requestedHash || HISTORY_PATTERN.test(prompt)) {
            return await readTransactions(selectedGroup, wallet, requestedHash, fetcher, apiKey);
        }
        return await readBalances(selectedGroup, wallet, fetcher, apiKey);
    } catch (error) {
        console.error('Safe read failed:', error.status || error.message);
        return `暫時無法讀取 ${selectedGroup.name} 的 Safe 資料；請稍後重試或直接查看：${wallet.safe_url}`;
    }
}

module.exports = { handleWalletRequest, formatUnits };
