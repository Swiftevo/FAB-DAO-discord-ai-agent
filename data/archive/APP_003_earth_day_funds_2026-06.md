# APP_003 大量交織：2026 年六月 Earth Day 資助流轉

來源：維護者轉交的六月及 06/29 更新、[Arbitrum 交易](https://arbiscan.io/tx/0xcb3463c451a6084cae1748feec7e9d4d188be3b7f257b21f810800db283889fe)、[GreenSofa Celo Safe 連結](https://app.safe.global/transactions/tx?safe=celo:0x18c4A9Fe8347F1938DD8a9157205f46479AdF169&id=multisig_0x18c4A9Fe8347F1938DD8a9157205f46479AdF169_0xed2a4ab516e060a19efb7d0c195fe14053d10164f2f99bb7c8dd06b870e2547b)。這筆 Greenpill 資助與行動客廳 Round 4 的 1,142.802 USDT 是**不同款項、不同鏈**。

## 160 USDC 到 GreenSofa 指定地址

- Arbitrum 鏈上交易於 **2026-06-03 16:05 UTC** 成功執行 `withdraw`，有一筆 **160 USDC** 轉至 `0x13126B6859FB72D3956797d94c99078B40294679`；[代幣轉帳紀錄](https://arbitrum.blockscout.com/api/v2/transactions/0xcb3463c451a6084cae1748feec7e9d4d188be3b7f257b21f810800db283889fe/token-transfers)。維護者稱此為 GreenSofa 錢包，但鏈上收款地址**不是**先前登記的 GreenSofa Safe `0x18c4A9Fe8347F1938DD8a9157205f46479AdF169`；目前未獨立核實 `0x13126B…4679` 的持有人或後續橋接路徑。
- 維護者說明分配：**10% = 16 USDC** 作為 GreenSofa 行政費，**90% = 144 USDC** 應轉給大量交織。這是分配規則，不能直接視作兩筆已完成鏈上轉帳。

## 144 USDC 給大量交織：團隊確認，鏈上待核實

- 維護者提供的 Safe 連結指向 **Celo** 網絡的 GreenSofa Safe，Safe 交易 ID 為 `0xed2a4ab516e060a19efb7d0c195fe14053d10164f2f99bb7c8dd06b870e2547b`，並稱已啟動 144 USDC 多簽轉帳。
- 維護者轉交 06/29 更新：大量交織例會確認 `0x4203e77F2951E4190961BcB448e3AAfbFb64Bd3d` **收到 144 USDC**。這是**團隊回報**，不是已核對的 Celo 執行交易。
- 2026-10-18 唯讀查核時，[Safe Celo 交易 API](https://api.safe.global/tx-service/celo/api/v1/multisig-transactions/0xed2a4ab516e060a19efb7d0c195fe14053d10164f2f99bb7c8dd06b870e2547b/)未找到該 Safe 交易 ID；[該地址的 Celo 代幣轉帳紀錄](https://celo.blockscout.com/api/v2/addresses/0x4203e77F2951E4190961BcB448e3AAfbFb64Bd3d/token-transfers)也未顯示 144 USDC。GreenSofa Celo Safe 在 06/29 可查到的另一筆執行交易是 **USDGLO**，不是此筆 USDC。故暫不把提供的 Safe 連結標為「已執行 144 USDC」。
- 待補：實際執行的 Celo 交易 hash／可核對的收款轉帳連結，或更正網絡與收款地址。收到後再修正鏈上驗證狀態。
