const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { handleWalletRequest, formatUnits } = require('./safe-wallet');
const { getGrantTransactionContext } = require('./safe-snapshot');

const actionSafe = '0x4B04936DE3bb0a32DfeDb73816E231CFeF0707C4';
const artSafe = '0x4DC816b76C7155C6b79b94174688Adc26193c169';
const hash = `0x${'a'.repeat(64)}`;

function response(data) {
    return { ok: true, json: async () => data };
}

test('formats token base units without floating-point rounding', () => {
    assert.equal(formatUnits('289911511', 6), '289.911511');
    assert.equal(formatUnits('5500066360000000000', 18), '5.50006636');
});

test('asks for a group when several wallets are registered', async () => {
    assert.match(await handleWalletRequest('錢包餘額'), /請指定小組/);
});

test('reads only the named group balance and labels filtered assets', async () => {
    const calls = [];
    const result = await handleWalletRequest('行動客廳 錢包餘額', {
        apiKey: 'test-key',
        fetcher: async url => {
            calls.push(url);
            return response({ results: [
                { tokenAddress: null, token: null, balance: '5500066360000000000' },
                { tokenAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', token: { symbol: 'USDT', decimals: 6 }, balance: '289911511' }
            ] });
        }
    });
    assert.equal(calls.length, 1);
    assert.match(calls[0], new RegExp(actionSafe));
    assert.match(result, /5\.50006636 ETH/);
    assert.match(result, /289\.911511 USDT/);
    assert.match(result, /已信任、非垃圾代幣/);
});

test('finds a requested executed transaction in its group', async () => {
    const result = await handleWalletRequest(`藝術銀行 查詢交易 ${hash}`, {
        apiKey: 'test-key',
        fetcher: async url => {
            assert.match(url, new RegExp(artSafe));
            return response({ next: null, results: [{
                txHash: hash,
                executionDate: '2026-10-09T15:06:51Z',
                transfers: [{ from: artSafe, to: actionSafe, value: '2500000', tokenAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', tokenInfo: { symbol: 'USDT', decimals: 6, trusted: true } }]
            }] });
        }
    });
    assert.match(result, /藝術銀行｜指定交易/);
    assert.match(result, /支出 2\.5 USDT/);
    assert.match(result, new RegExp(hash));
});

test('shows a Safe origin note on a live transaction', async () => {
    const result = await handleWalletRequest(`藝術銀行 查詢交易 ${hash}`, {
        apiKey: 'test-key',
        fetcher: async () => response({ next: null, results: [{
            txHash: hash, executionDate: '2026-10-09T15:06:51Z',
            origin: JSON.stringify({ note: 'GRANTS round4 測試標籤' }),
            transfers: []
        }] })
    });
    assert.match(result, /Safe 備註（鏈下標籤）：GRANTS round4 測試標籤/);
});

test('answers a known action living room transaction from the snapshot without API access', async () => {
    const result = await handleWalletRequest('行動客廳 查詢交易 0x767152c6002634fcb1a441c918172b319d1c4fb4eb623adc0b98b1cfb318af29', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.match(result, /支出 90 USDT/);
    assert.match(result, /GRANTS round4 孤勇者計畫 \(60%\)/);
    assert.match(result, /快照日期：2026-10-22/);
});

test('finds the same saved transfer by its Safe transaction hash', async () => {
    const result = await handleWalletRequest('行動客廳 查詢交易 0x65867b0fe8919493b8f04f9ad8314c530c4546afd5b1b9907f8a9b9da878027d', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.match(result, /支出 90 USDT/);
});

test('does not mislabel a no-transfer Safe action as a payment', async () => {
    const result = await handleWalletRequest('行動客廳 查詢交易 0x1aef8504b75fc6d3292b088048d67289b0db5a160ef93d0ae005afebf54fa860', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.match(result, /沒有可辨識的資產轉移/);
    assert.doesNotMatch(result, /支出 0/);
});

test('grant context selects the project grant and does not count the separate bounty', () => {
    const result = getGrantTransactionContext('孤勇者計劃已撥款了嗎？');
    assert.match(result, /90 USDT/);
    assert.match(result, /0x767152c6002634fcb1a441c918172b319d1c4fb4eb623adc0b98b1cfb318af29/);
    assert.doesNotMatch(result, /BOUNTY|50 USDT/);
    assert.equal(getGrantTransactionContext('羽球社最近更新是何時？'), '');
});

test('grant context excludes a Safe note explicitly marked as test', () => {
    const result = getGrantTransactionContext('大量交織已撥款了嗎？');
    assert.match(result, /1142\.802 USDT/);
    assert.doesNotMatch(result, /1\.868 USDT/);
});

test('funding context separates a test transfer, project grant and contact bounty', () => {
    const grant = getGrantTransactionContext('大量交織已撥款了嗎？');
    assert.match(grant, /1142\.802 USDT/);
    assert.doesNotMatch(grant, /1\.868 USDT/);
    const testTransfer = getGrantTransactionContext('大量交織測試交易是幾多？');
    assert.match(testTransfer, /測試轉帳（非正式分期）｜1\.868 USDT/);
    const bounty = getGrantTransactionContext('孤勇者聯絡人 bounty 已支付嗎？');
    assert.match(bounty, /Bounty｜50 USDT/);
    assert.doesNotMatch(bounty, /90 USDT/);
});

test('funding context keeps Ghost Object rounds separate and finds unindexed DeSci payments', () => {
    const ghost = getGrantTransactionContext('不可能物件有甚麼撥款？');
    for (const amount of ['960', '640', '870']) assert.match(ghost, new RegExp(`${amount} USDT`));
    assert.match(ghost, /round5/);
    assert.match(ghost, /round6/);
    assert.match(getGrantTransactionContext('desci-Taiwan 已撥款？'), /90 USDT/);
    assert.match(getGrantTransactionContext('FIP-3 bounty 支出？'), /263\.3 USDT/);
});

test('project funding links resolve to executed action living room transactions', () => {
    const snapshot = require('./data/action_living_room_safe_snapshot.json');
    const hashes = new Set(snapshot.transactions.map(item => item.safe_tx_hash?.toLowerCase()));
    for (let i = 1; i <= 7; i++) {
        const record = require(`./data/records/APP_00${i}.json`);
        const notes = record.funding_discussion_2026;
        assert.ok(notes, `${record.id} has no funding discussion note`);
        assert.ok(fs.existsSync(path.join(__dirname, notes.source_file)));
        for (const hash of notes.related_safe_tx_hashes || []) {
            assert.ok(hashes.has(hash.toLowerCase()), `${record.id}: unknown Safe hash ${hash}`);
        }
    }
});

test('reads the GreenSofa snapshot without a Safe API key', async () => {
    const result = await handleWalletRequest('GreenSofa 最近交易', { apiKey: '', fetcher: () => { throw new Error('must not fetch'); } });
    assert.match(result, /最近已收錄交易/);
    assert.match(result, /客廳＋綠沙發＋頂加/);
    assert.match(result, /快照日期：2026-10-22/);
});

test('accepts a registered wallet address as the group selector', async () => {
    const result = await handleWalletRequest(`${artSafe} 餘額`, {
        apiKey: 'test-key', fetcher: async () => response({ results: [] })
    });
    assert.match(result, /藝術銀行/);
});

for (const [name, address, savedHash] of [
    ['FAB DAO 總金庫', '0x5A3200fbcB70b64475d63D73e5439c1F0c7ad97b', '0x513337fe83951f8c7e5f4b080305098761662812bd5293280f2b70598133a417'],
    ['GreenSofa', '0x18c4A9Fe8347F1938DD8a9157205f46479AdF169', '0x8fe4d5495361dc226c21d85eea382ed15b7f5f61a1ff83132a226028d101907b'],
    ['藝術銀行', artSafe, '0x513337fe83951f8c7e5f4b080305098761662812bd5293280f2b70598133a417'],
    ['頂加實驗室', '0x455D502e22209cD4dAd06B23268921397F0A5656', '0x8fe4d5495361dc226c21d85eea382ed15b7f5f61a1ff83132a226028d101907b']
]) {
    test(`${name} serves history locally but reads balances and explicitly live history from Safe`, async () => {
        const calls = [];
        const fetcher = async url => {
            calls.push(url);
            assert.match(url, /\/tx-service\/oeth\/api\//);
            assert.ok(url.toLowerCase().includes(address.toLowerCase()));
            if (url.includes('/balances/')) return response({ results: [
                { tokenAddress: null, balance: '1000000000000000000' }
            ] });
            return response({ next: null, results: [{
                txHash: hash, executionDate: '2026-10-09T15:06:51Z',
                transfers: [{ from: address, to: actionSafe, value: '1000000000000000000', tokenAddress: null }]
            }] });
        };
        const options = { apiKey: 'test-key', fetcher };
        assert.match(await handleWalletRequest(`${name} 錢包餘額`, options), /1 ETH/);
        const callsAfterBalance = calls.length;
        assert.match(await handleWalletRequest(`${name} 最近交易`, options), new RegExp(savedHash));
        assert.match(await handleWalletRequest(`${name} 查詢交易 ${savedHash}`, options), /已收錄快照/);
        assert.equal(calls.length, callsAfterBalance);
        assert.match(await handleWalletRequest(`${name} 即時最近交易`, options), new RegExp(hash));
        assert.match(await handleWalletRequest(`${name} 查詢交易 ${hash}`, options), /指定交易/);
        assert.equal(calls.length, callsAfterBalance + 2);
    });
}

test('preserves two identical transfers in one Safe operation', async () => {
    const result = await handleWalletRequest('FAB DAO 總金庫 查詢交易 0x513337fe83951f8c7e5f4b080305098761662812bd5293280f2b70598133a417', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.equal((result.match(/支出 2\.5 ETH/g) || []).length, 2);
    assert.match(result, /藝術銀行活動＋聯絡人工作費/);
});

test('marks unsolicited assets as untrusted', async () => {
    const result = await handleWalletRequest('GreenSofa 最近交易', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.match(result, /未核實代幣/);
    assert.doesNotMatch(result, /www\.base1\.cfd/);
});

test('searches saved Safe notes locally by keyword', async () => {
    const result = await handleWalletRequest('頂加實驗室 備註 hypercert dashboard', {
        apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
    });
    assert.match(result, /頂加實驗室 hypercert dashboard development 第一期經費/);
    assert.match(result, /0x036e7061d7fb0e335b34b38a95b584dd17cf15dfd516a4d914727fee4393bf27/);
    assert.doesNotMatch(result, /Jan 2026 Taiwan Hypercerts Dashboard management cost/);
});

test('recorded history and notes fit one Discord message for all five wallets', async () => {
    for (const name of ['行動客廳', 'FAB DAO 總金庫', '頂加實驗室', 'GreenSofa', '藝術銀行']) {
        for (const query of ['最近交易', '備註']) {
            const result = await handleWalletRequest(`${name} ${query}`, {
                apiKey: '', fetcher: () => { throw new Error('must not fetch'); }
            });
            assert.ok(result.length < 2000, `${name} ${query} is too long for Discord`);
        }
    }
});
