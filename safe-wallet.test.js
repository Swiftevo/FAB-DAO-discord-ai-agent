const test = require('node:test');
const assert = require('node:assert/strict');
const { handleWalletRequest, formatUnits } = require('./safe-wallet');

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
                transfers: [{ from: artSafe, to: actionSafe, value: '2500000', tokenAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', tokenInfo: { symbol: 'USDT', decimals: 6 } }]
            }] });
        }
    });
    assert.match(result, /藝術銀行｜指定交易/);
    assert.match(result, /支出 2\.5 USDT/);
    assert.match(result, new RegExp(hash));
});

test('does not fetch without a Safe API key', async () => {
    const result = await handleWalletRequest('GreenSofa 最近交易', { apiKey: '', fetcher: () => { throw new Error('must not fetch'); } });
    assert.match(result, /SAFE_API_KEY/);
});

test('accepts a registered wallet address as the group selector', async () => {
    const result = await handleWalletRequest(`${artSafe} 餘額`, {
        apiKey: 'test-key', fetcher: async () => response({ results: [] })
    });
    assert.match(result, /藝術銀行/);
});

for (const [name, address] of [
    ['FAB DAO 總金庫', '0x5A3200fbcB70b64475d63D73e5439c1F0c7ad97b'],
    ['GreenSofa', '0x18c4A9Fe8347F1938DD8a9157205f46479AdF169'],
    ['藝術銀行', artSafe],
    ['頂加實驗室', '0x455D502e22209cD4dAd06B23268921397F0A5656']
]) {
    test(`${name} routes balance, recent and specified-hash queries to its Safe`, async () => {
        const fetcher = async url => {
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
        assert.match(await handleWalletRequest(`${name} 最近交易`, options), new RegExp(hash));
        assert.match(await handleWalletRequest(`${name} 查詢交易 ${hash}`, options), /指定交易/);
    });
}
