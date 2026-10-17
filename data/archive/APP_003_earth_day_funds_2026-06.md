# APP_003 大量交織：2026 年六月 Earth Day 資助流轉

來源：維護者轉交的六月及 06/29 更新、[Arbitrum 160 USDC 交易](https://arbiscan.io/tx/0xcb3463c451a6084cae1748feec7e9d4d188be3b7f257b21f810800db283889fe)、後續補充的 [Ethereum 144 USDC 交易](https://etherscan.io/tx/0xf99b9568255b4cdb43c8c68fdc25c20e1a541542912660c49611e25bffb389ac)。這筆 Greenpill 資助與行動客廳 Round 4 的 1,142.802 USDT 是**不同款項**。

## 160 USDC 到 GreenSofa 指定地址

- Arbitrum 鏈上交易於 **2026-06-03 16:05 UTC** 成功執行 `withdraw`，有一筆 **160 USDC** 轉至 `0x13126B6859FB72D3956797d94c99078B40294679`；[代幣轉帳紀錄](https://arbitrum.blockscout.com/api/v2/transactions/0xcb3463c451a6084cae1748feec7e9d4d188be3b7f257b21f810800db283889fe/token-transfers)。維護者稱此為 GreenSofa 錢包，但鏈上收款地址**不是**先前登記的 GreenSofa Safe `0x18c4A9Fe8347F1938DD8a9157205f46479AdF169`；目前未獨立核實 `0x13126B…4679` 的持有人或後續橋接路徑。
- 維護者說明分配：**10% = 16 USDC** 作為 GreenSofa 行政費，**90% = 144 USDC** 應轉給大量交織。這是分配規則，不能直接視作兩筆已完成鏈上轉帳。

## 144 USDC 給大量交織：Ethereum 鏈上已核實

- 維護者轉交 06/29 更新：大量交織例會確認 `0x4203e77F2951E4190961BcB448e3AAfbFb64Bd3d` 收到 **144 USDC**。後續提供的 [Ethereum 主網交易](https://etherscan.io/tx/0xf99b9568255b4cdb43c8c68fdc25c20e1a541542912660c49611e25bffb389ac)已核實此事：**2026-06-29 11:50:23 UTC**，`0x13126B6859FB72D3956797d94c99078B40294679` → 該大量交織地址，**144 USDC**；[代幣轉帳資料](https://eth.blockscout.com/api/v2/transactions/0xf99b9568255b4cdb43c8c68fdc25c20e1a541542912660c49611e25bffb389ac/token-transfers)。發款地址與六月 Arbitrum 160 USDC 收款地址相同，但這兩筆交易本身不證明中間如何跨鏈。
- 先前提供的 [GreenSofa Celo Safe 連結](https://app.safe.global/transactions/tx?safe=celo:0x18c4A9Fe8347F1938DD8a9157205f46479AdF169&id=multisig_0x18c4A9Fe8347F1938DD8a9157205f46479AdF169_0xed2a4ab516e060a19efb7d0c195fe14053d10164f2f99bb7c8dd06b870e2547b)保留作來源歷史，但**不是這筆已核實的 Ethereum 入帳交易**；先前 Celo API 查不到該 Safe 交易 ID，亦不能把它標成 Celo 已執行 144 USDC。
