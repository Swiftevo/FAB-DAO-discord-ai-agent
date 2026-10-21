const snapshot = require('./data/action_living_room_safe_snapshot.json');

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

function findSnapshotTransaction(wallet, hash) {
    if (wallet.chain_prefix !== 'oeth' || wallet.address.toLowerCase() !== ACTION_LIVING_ROOM_SAFE) {
        return null;
    }
    return snapshot.entries.find(entry =>
        entry.transaction_hash.toLowerCase() === hash.toLowerCase() ||
        entry.safe_tx_hash?.toLowerCase() === hash.toLowerCase()) || null;
}

function snapshotTransactionSummary(entry, wallet) {
    if (entry.entry_kind === 'contract_interaction_no_transfer') {
        return `此筆 Safe 操作已執行，但匯出資料沒有可辨識的資產轉移；不能當作撥款。` +
            `\n交易：${entry.transaction_hash}\n${wallet.explorer_tx_url_prefix}${entry.transaction_hash}` +
            `\n快照日期：${snapshot.snapshot_date}。`;
    }
    const outgoing = entry.from.toLowerCase() === wallet.address.toLowerCase();
    const amount = formatUnits(entry.amount_raw, entry.asset_decimals);
    const note = typeof entry.note === 'string' ? entry.note.replace(/\s+/g, ' ').replace(/@/g, '＠').slice(0, 200) : null;
    const safeLink = entry.safe_tx_hash
        ? `\nSafe：https://app.safe.global/transactions/tx?safe=oeth:${wallet.address}&id=multisig_${wallet.address}_${entry.safe_tx_hash}`
        : '';
    const trustedAsset = (!entry.asset_address && entry.asset_symbol === 'ETH') ||
        entry.asset_address?.toLowerCase() === USDT_TOKEN;
    const assetLabel = trustedAsset ? entry.asset_symbol : `${entry.asset_symbol || '未知資產'}（未核實代幣）`;
    const date = new Intl.DateTimeFormat('zh-HK', {
        timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(entry.executed_at));
    return `${date}（香港時間）｜${outgoing ? '支出' : '收入'} ${amount} ${assetLabel}` +
        `${note ? `\nSafe 備註（鏈下標籤）：${note}` : ''}` +
        `\n交易：${entry.transaction_hash}\n${wallet.explorer_tx_url_prefix}${entry.transaction_hash}` +
        safeLink +
        `\n快照日期：${snapshot.snapshot_date}；餘額與快照後交易仍以 Safe 即時資料為準。`;
}

function getGrantTransactionContext(prompt) {
    if (!/撥款|補助|資助|轉帳|支付|發放|grant|funding/i.test(prompt)) return '';
    const projects = [
        { prompt: /APP_003|大量交織/i, note: /大量交織/ },
        { prompt: /APP_006|不可能物件|ghost.object/i, note: /不可能物件/ },
        { prompt: /APP_007|孤勇者/i, note: /孤勇者/ }
    ];
    const project = projects.find(item => item.prompt.test(prompt));
    if (!project) return '';

    const entries = snapshot.entries.filter(entry =>
        entry.from.toLowerCase() === ACTION_LIVING_ROOM_SAFE &&
        entry.asset_address?.toLowerCase() === USDT_TOKEN &&
        /^GRANTS\b/i.test(entry.note || '') &&
        !/\btest\b/i.test(entry.note) &&
        project.note.test(entry.note.replace(/⼤/g, '大')));
    if (!entries.length) return '';

    const lines = entries.map(entry =>
        `- ${entry.executed_at}｜${formatUnits(entry.amount_raw, entry.asset_decimals)} USDT｜收款地址 ${entry.to}｜Safe Note: ${entry.note}｜` +
        `鏈上 https://optimistic.etherscan.io/tx/${entry.transaction_hash}` +
        `${entry.safe_tx_hash ? `｜Safe 備註 https://app.safe.global/transactions/tx?safe=${snapshot.wallet}&id=multisig_${snapshot.wallet.split(':')[1]}_${entry.safe_tx_hash}` : ''}`);
    return `\n【行動客廳 Safe 已執行交易快照（截至 ${snapshot.snapshot_date}）】\n${lines.join('\n')}\n` +
        'Note 是提案者填寫的鏈下用途標籤；轉帳金額及地址來自已執行交易。不同 Round 不合計；標為 test 的交易不當作正式分期撥款。快照沒有某筆交易不等於其他錢包沒有轉帳。\n';
}

module.exports = { findSnapshotTransaction, snapshotTransactionSummary, getGrantTransactionContext };
