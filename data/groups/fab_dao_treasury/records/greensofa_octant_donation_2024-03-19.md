# FAB DAO 總金庫參與 GreenSofa GreenPill × Octant QF（2024-03）

最後整理：2026-11-06。這是總金庫支出與後續捐款操作的對照，並非行動客廳 Grant 或 2026 年 GreenSofa 多簽交易。

## 對話與用途

- 2024-03-18 20:16，Swift Evo 在 Discord 提議討論由 FAB DAO 多簽支持 GreenSofa 參與 GreenPill × Octant QF；提及豆泥在 Telegram 的提案。這是提案線索，不單獨證明投票結果。
- 2024-03-19 00:38–01:00，對話稱多簽已簽署並完成轉帳，接下來由豆泥執行捐款。
- 2024-03-19 01:04，豆泥貼出[捐款交易](https://optimism.blockscout.com/tx/0x3852b0e6227bc6ca2e5941aeda0b56c42085eee26110ce91d713d349648c8c1d)，表示代表 FAB DAO 向 GreenSofa 捐 **0.015 ETH**，並稱是 FAB DAO DAO 化後首次完成的多簽捐贈。貼文當時估值 **52 USD**，未獨立核實匯率。

## 鏈上對照

- **2024-03-19 00:37:55 香港時間**，FAB DAO 總金庫 Optimism Safe `0x5A3200fbcB70b64475d63D73e5439c1F0c7ad97b` 在[已執行 Safe 交易](https://app.safe.global/transactions/tx?safe=oeth:0x5A3200fbcB70b64475d63D73e5439c1F0c7ad97b&id=multisig_0x5A3200fbcB70b64475d63D73e5439c1F0c7ad97b_0x3636264d3bf3824589f3867dc1e910e08cb5546d1856a41935296c71ba91c9af)轉出 **0.015 ETH** 至 `0xab51AD23d222fD0afB4e29F3244402af9aa3C420`；[鏈上交易](https://optimism.blockscout.com/tx/0x3935ce729a683c124bd97dffa3b3f138f994b3aa065314b74bbf74ad97308999)。Safe Note 為空。
- **2024-03-19 01:03:39 香港時間**，上述收款地址向 Gitcoin 合約提交成功的 `vote` 操作；[鏈上交易](https://optimism.blockscout.com/tx/0x3852b0e6227bc6ca2e5941aeda0b56c42085eee26110ce91d713d349648c8c1d)的總 `value` 是 **0.017 ETH**。Blockscout 解碼的 `votes` 含 **0.015 ETH** 給 `0x13126B6859FB72D3956797d94c99078B40294679`，另有 **0.002 ETH** 給另一個項目；該 `0x13126B…4679` 地址見於[GreenSofa 官方介紹](https://hackmd.io/@greensofa/home)的 EOA 清單。交易對應[GreenPill × Octant QF 的 GreenSofa 項目](https://explorer.gitcoin.co/#/round/10/0xe9459565709c5e856ffbc3cc8715824945d92de7/6)。
- 因此 FAB DAO 總金庫支出記 **0.015 ETH**，GreenSofa 獲支持的投票額亦為 **0.015 ETH**；不能把 Gitcoin 單筆操作的全部 **0.017 ETH** 記成 FAB DAO 支出，也不能把這筆記成轉入 GreenSofa Safe 的直接款項。額外 0.002 ETH 的資金來源及用途不屬本次 FAB DAO 總金庫已核實紀錄。

來源：維護者貼出的 2024-03-18 至 03-19 Discord 對話；FAB DAO 總金庫 Safe 官方 API 快照；Blockscout 兩筆交易與解碼輸入；GreenSofa 官方 HackMD。原 Discord 訊息連結未提供。
