const snapshots = {
    action_living_room: require('./data/action_living_room_safe_snapshot.json'),
    fab_dao_treasury: require('./data/fab_dao_treasury_safe_snapshot.json'),
    rooftop_labs: require('./data/rooftop_labs_safe_snapshot.json'),
    greensofa: require('./data/greensofa_safe_snapshot.json'),
    art_bank: require('./data/art_bank_safe_snapshot.json')
};

const ACTION_LIVING_ROOM_SAFE = '0x4b04936de3bb0a32dfedb73816e231cfef0707c4';
const USDT_TOKEN = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58';

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

function snapshotFor(wallet) {
    if (wallet.chain_prefix !== 'oeth') return null;
    return Object.values(snapshots).find(item =>
        item.wallet.split(':')[1].toLowerCase() === wallet.address.toLowerCase()) || null;
}

function findSnapshotTransaction(wallet, hash) {
    const snapshot = snapshotFor(wallet);
    if (!snapshot) return null;
    const transaction = snapshot.transactions.find(item =>
        item.transaction_hash?.toLowerCase() === hash.toLowerCase() ||
        item.safe_tx_hash?.toLowerCase() === hash.toLowerCase());
    return transaction ? { snapshot, transaction } : null;
}

function safeNote(note, length = 200) {
    return String(note).replace(/\s+/g, ' ').replace(/@/g, '＠').slice(0, length);
}

function hongKongTime(value) {
    return new Intl.DateTimeFormat('zh-HK', {
        timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(value));
}

function transferLabel(transfer, wallet, includeCounterparty) {
    const address = wallet.address.toLowerCase();
    const outgoing = transfer.from?.toLowerCase() === address;
    const incoming = transfer.to?.toLowerCase() === address;
    const direction = outgoing ? '支出' : incoming ? '收入' : '相關轉帳';
    const amount = formatUnits(transfer.amount_raw, transfer.asset_decimals);
    const asset = transfer.asset_trusted === true
        ? (transfer.asset_symbol || '未知資產')
        : '未核實代幣';
    const counterparty = outgoing ? transfer.to : transfer.from;
    return `${direction} ${amount} ${asset}` +
        (includeCounterparty && counterparty ? `｜${outgoing ? '至' : '來自'} ${counterparty}` : '');
}

function snapshotTransactionSummary(match, wallet) {
    const { snapshot, transaction } = match;
    const transfers = transaction.transfers || [];
    const description = transaction.is_successful === false
        ? '執行失敗；不能當作已撥款'
        : transfers.length
            ? transfers.map(item => `- ${transferLabel(item, wallet, true)}`).join('\n')
            : '已執行，但沒有可辨識的資產轉移；不能當作撥款。';
    const notes = (transaction.notes || []).map(note => safeNote(note)).join('；');
    const safeLink = transaction.safe_tx_hash
        ? `\nSafe：https://app.safe.global/transactions/tx?safe=${snapshot.wallet}&id=multisig_${wallet.address}_${transaction.safe_tx_hash}`
        : '';
    return `${hongKongTime(transaction.executed_at)}（香港時間）\n${description}` +
        `${notes ? `\nSafe 備註（鏈下標籤）：${notes}` : ''}` +
        `\n交易：${transaction.transaction_hash}\n${wallet.explorer_tx_url_prefix}${transaction.transaction_hash}` +
        safeLink +
        `\n快照日期：${snapshot.snapshot_at.slice(0, 10)}；快照後交易請用「即時交易」查詢。`;
}

function snapshotRecentTransactions(wallet, limit = 5) {
    const snapshot = snapshotFor(wallet);
    if (!snapshot) return null;
    const lines = snapshot.transactions.slice(0, limit).map(transaction => {
        const transfers = transaction.transfers || [];
        const description = transaction.is_successful === false ? '執行失敗' :
            transfers.length ? transfers.map(item => transferLabel(item, wallet, false)).join('；') :
                '無可辨識的資產轉移';
        const note = (transaction.notes || []).map(item => safeNote(item, 120)).join('；');
        return `${hongKongTime(transaction.executed_at)}｜${description}` +
            `${note ? `\nSafe 備註（鏈下標籤）：${note}` : ''}` +
            `\n交易：${transaction.transaction_hash}`;
    });
    return `${lines.join('\n\n') || '尚無已執行交易'}\n\n快照日期：${snapshot.snapshot_at.slice(0, 10)}；` +
        `新交易請用「即時交易」查詢。\n來源：${wallet.safe_url}`;
}

function snapshotNoteSearch(wallet, keyword = '') {
    const snapshot = snapshotFor(wallet);
    if (!snapshot) return null;
    const term = keyword.trim().toLowerCase();
    const matches = snapshot.transactions.filter(transaction =>
        (transaction.notes || []).some(note => note.toLowerCase().includes(term)));
    const lines = matches.slice(0, 10).map(transaction => {
        const description = transaction.is_successful === false ? '執行失敗' :
            transaction.transfers.length ? transaction.transfers.map(item => transferLabel(item, wallet, false)).join('；') :
                '無可辨識的資產轉移';
        return `${hongKongTime(transaction.executed_at)}｜${description}` +
            `\nSafe 備註（鏈下標籤）：${transaction.notes.map(item => safeNote(item)).join('；')}` +
            `\n交易：${transaction.transaction_hash}`;
    });
    return `${lines.join('\n\n') || '未找到相符的 Safe 備註'}\n\n` +
        `相符 ${matches.length} 筆${matches.length > 10 ? '（只列出最近 10 筆）' : ''}；` +
        `快照日期：${snapshot.snapshot_at.slice(0, 10)}。`;
}

function getGrantTransactionContext(prompt) {
    if (!/撥款|補助|資助|轉帳|支付|發放|交易|資金|經費|測試|bounty|懸賞|grant|funding/i.test(prompt)) return '';
    const projects = [
        { prompt: /APP_003|大量交織/i, note: /大量交織/ },
        { prompt: /APP_004|事水/i, note: /事水/ },
        { prompt: /APP_006|不可能物件|ghost.object/i, note: /不可能物件/ },
        { prompt: /APP_007|孤勇者/i, note: /孤勇者/ },
        { prompt: /desci.onboarding.hub/i, note: /desci-onboarding-hub/i },
        { prompt: /desci.taiwan/i, note: /desci-Taiwan/i },
        { prompt: /FIP.?3/i, note: /FIP\s*-?\s*3/i }
    ];
    const project = projects.find(item => item.prompt.test(prompt));
    if (!project) return '';

    const snapshot = snapshots.action_living_room;
    const wantsBounty = /聯絡人|bounty|懸賞|FIP.?3/i.test(prompt);
    const wantsTest = /測試|\btest\b/i.test(prompt);
    const entries = snapshot.transactions.flatMap(transaction => {
        const note = (transaction.notes || []).find(item => {
            const normalized = item.replace(/⼤/g, '大');
            return project.note.test(normalized) &&
                ((wantsBounty && /^BOUNTY\b/i.test(item)) ||
                (!wantsBounty && /^GRANTS\b/i.test(item) &&
                    (wantsTest || !/\btest\b/i.test(item))));
        });
        if (!note || transaction.is_successful === false) return [];
        return (transaction.transfers || []).filter(transfer =>
            transfer.from?.toLowerCase() === ACTION_LIVING_ROOM_SAFE &&
            transfer.asset_address?.toLowerCase() === USDT_TOKEN &&
            transfer.asset_trusted === true).map(transfer => ({ transaction, transfer, note }));
    });
    if (!entries.length) return '';

    const lines = entries.map(({ transaction, transfer, note }) =>
        `- ${transaction.executed_at}｜${/^BOUNTY\b/i.test(note) ? 'Bounty' : /\btest\b/i.test(note) ? '測試轉帳（非正式分期）' : 'Grant'}｜${formatUnits(transfer.amount_raw, transfer.asset_decimals)} USDT｜收款地址 ${transfer.to}｜Safe Note: ${safeNote(note)}｜` +
        `鏈上 https://optimistic.etherscan.io/tx/${transaction.transaction_hash}` +
        `${transaction.safe_tx_hash ? `｜Safe 備註 https://app.safe.global/transactions/tx?safe=${snapshot.wallet}&id=multisig_${snapshot.wallet.split(':')[1]}_${transaction.safe_tx_hash}` : ''}`);
    return `\n【行動客廳 Safe 已執行交易快照（截至 ${snapshot.snapshot_at.slice(0, 10)}）】\n${lines.join('\n')}\n` +
        'Note 是提案者填寫的鏈下用途標籤；轉帳金額及地址來自已執行交易。不同 Round 不合計；標為 test 的交易不當作正式分期撥款。快照沒有某筆交易不等於其他錢包沒有轉帳。\n';
}

module.exports = {
    findSnapshotTransaction, snapshotTransactionSummary, snapshotRecentTransactions, snapshotNoteSearch,
    getGrantTransactionContext
};
