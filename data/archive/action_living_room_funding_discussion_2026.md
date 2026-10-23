# 行動客廳資金討論與 Safe 交易對照（2026）

來源：維護者於 2026-10-23 提供的 Discord 摘錄；原始 Discord 訊息 permalink 未提供。原貼文日期採日／月／年。鏈上核對來源：Optimism Safe Transaction Service；下表的執行時間為 UTC，所有 15 筆 Safe 操作於 2026-10-23 查詢時均顯示 `isSuccessful: true`。完整轉帳資料與 Note 亦見 `data/action_living_room_safe_snapshot.json`（2026-10-22 快照）。Note 是鏈下標籤，不單獨證明受款用途。

## 會議與貼文，不當成已付款

- 02/03 例會（02/05 17:05 貼文）：稱補助金專案聯絡人尚有 8 個月待撥，輪替後須重議發放流程。原文把「很睏宜品」與 Web3 羽球社、拒然不要及 400 U 並列；「心之俳句-Stanley」與星光藝術計畫及 200 U 並列；「FL YANG」與大量交織及 200 U 並列。沒有提供這些款項的逐筆付款證據；400 U 對兩個項目的分配方式不明。這是當時的聯絡人名單，不覆蓋較後資料中的負責人。
- 05/12 21:34 貼文：Round 4 啟動款當時待撥：大量交織 1,142.802 USDT（60,000 TWD 的估算 60%）、孤勇者 90 USDT（150 USD 的 60%）、事水 361.89 USDT。貼文以 19,000 TWD 計算事水；現有 APP_004 核准總額記為 25,000 TWD、其中 19,000 TWD 是中期預算，來源口徑不一致，待委員會核對；不得改寫既有核准額。
- 05/19 21:59 貼文：列行動客廳當時的多簽管理人；姓名見 `data/groups/action_living_room/contacts.json`。原文中「天天晴朗 - penghui」與「青苔Yian」排版相連。這不是各人的鏈上 owner 地址配對證據。
- 05/21、05/26、05/28、06/09、08/12、08/25、10/06 的貼文提供 Safe 提案連結；實際執行日期以下表為準，不以貼文日期代替。
- 10/06 貼文將大量交織測試款寫作 **1.686 USDT**，但 10/09 已執行交易為 **1.868 USDT**，Safe Note 含 `test`。貼文另稱確認後再撥 760 + 1010；截至 2026-10-22 的行動客廳快照，這兩個宣布的後續額度沒有可直接對應的正式撥款紀錄，不得計入已付款。

## 已執行的 Grant（逐筆來源）

| 關聯 | Safe tx hash | 執行 UTC | 鏈上交易 | 金額與 Safe Note |
| --- | --- | --- | --- | --- |
| APP_007 孤勇者／Round 4 | `0x65867b0fe8919493b8f04f9ad8314c530c4546afd5b1b9907f8a9b9da878027d` | 05/26 14:38 | [鏈上](https://optimistic.etherscan.io/tx/0x767152c6002634fcb1a441c918172b319d1c4fb4eb623adc0b98b1cfb318af29) | 90 USDT；`GRANTS round4 孤勇者計畫 (60%)` |
| APP_003 大量交織／Round 4 | `0x9ef19d23481bd7b27388ed64c599754de46efe393da702746610cb39387591f4` | 06/02 03:38 | [鏈上](https://optimistic.etherscan.io/tx/0xf150168778d1024eea7ad81a5d87314269df1758d3ec3e13db7a0fb77ed0d103) | 1,142.802 USDT；`GRANTS round4 ⼤量交織＋地球公物 (60%)` |
| APP_006 不可能物件／Round 5 | `0x5a5f0d97443991cc7621b1b90135ecddb0780de4e721cebb28f4a43cc9c98fb5` | 06/09 14:35 | [鏈上](https://optimistic.etherscan.io/tx/0xe9b5292934baedeb2a4931278e0ccd42af2c8f94d24aa76854dd3f19c376bedc) | 960 USDT；`GRANTS round5 ghost-object-不可能物件＿2026展覽計畫(60%)` |
| 未編入 APP：desci-onboarding-hub／Round 6 | `0x3e7d41b6b90cbb1d9546ecbc5ca7aa1b53c58f87c4a74949df254e5bed891b3e` | 08/18 14:26 | [鏈上](https://optimistic.etherscan.io/tx/0xaafeba9fd21ef7b7366723c14eb42070bd0cf7bf673b1a7750e23e86b8af8cea) | 90 USDT；`GRANTS round6 desci-onboarding-hub (60%)` |
| APP_006 不可能物件／Round 6（與 Round 5 分開） | `0xc797059cef792562de5420ffb4d37a2c80ef70c8cc97c2fa72151aa41e83b0b6` | 09/03 14:57 | [鏈上](https://optimistic.etherscan.io/tx/0xe5d3780231b01a48365e1ff507877eee2469cfdfe20dee93271c60d6265a68a7) | 870 USDT；`GRANTS round6 ghost-object-不可能物件＿2026展覽計畫(60%)` |
| APP_006 不可能物件／Round 5 | `0xbb39c243e1bd67a6f69269b40d346d66f38641bd86522d26375418d48bbcc989` | 09/03 14:59 | [鏈上](https://optimistic.etherscan.io/tx/0xf657d0ef9d3ebb3e948d5a37e8efdbfe051b32fa8b26dd0705caa52f012cd9a6) | 640 USDT；`GRANTS round5 ghost-object-不可能物件＿2026展覽計畫(40%)` |
| 未編入 APP：desci-Taiwan／Round 6 | `0xa4843e774998bee851a16c2959662347bd2671eab51463b0729a2aa3609321ae` | 10/09 14:28 | [鏈上](https://optimistic.etherscan.io/tx/0x69665e84446d06ba7c5cd72ab912bfc53dbfb9d6de06509d7241964e2fef3750) | 90 USDT；`GRANTS round6 desci-Taiwan (60%)` |
| APP_003 大量交織／測試，不計正式 40% | `0xfab07f01d1f60b756e59c8524b3938c27be269f19e4a27de3baab21670553712` | 10/09 14:29 | [鏈上](https://optimistic.etherscan.io/tx/0xa3321562407fdb714da5978e6fba10bf005963004c14e9b9bb3875e8834f09f8) | 1.868 USDT；`GRANTS round4 ⼤量交織＋地球公物 (40%) test` |

## 已執行的 Bounty（與 Grant 分開）

| 關聯 | Safe tx hash | 執行 UTC | 鏈上交易 | 金額與 Safe Note |
| --- | --- | --- | --- | --- |
| FIP-3 出席 hypercert 鑄造 | `0x367eb7f334f169e52ca5b284e0df04af42ef152ba79f0f164fb02f02dc137cb8` | 05/26 14:39 | [鏈上](https://optimistic.etherscan.io/tx/0xac6de8d84527e15a79febbbb66114e368664aa5fb0d3b13ce950d5ed99095d27) | 100 USDT；`BOUNTY ｜FIP - 3 出席 hypercerts 證明鑄造` |
| FIP-3 前置工作 | `0xac1992a2ae6dbd901281fbba855166076cb1eab506b22bf1dae32e51b168f258` | 06/11 02:24 | [鏈上](https://optimistic.etherscan.io/tx/0x5f78c394121daab657b33b930b95a06be87b2b6595232b0f97da1734f7a0bfac) | 10 USDT；`BOUNTY ｜FIP-3 前置工作` |
| 行動客廳規則撰寫 | `0x9b5d12447102f46359df97f6358c4a3d40e574b0f58f9dacb246362017a4fad7` | 06/11 02:25 | [鏈上](https://optimistic.etherscan.io/tx/0xea3f63e283988b246db83a2430f35021eade18566fdd87ae5928d4ec3b05203b) | 20 USDT；`BOUNTY ｜新版行動客廳運作規則撰寫` |
| FIP-3 實體會議 | `0x0f600515096f72563c093ad13d7fa157eaf0655b4e5b27f8f2260762a51af923` | 06/11 02:25 | [鏈上](https://optimistic.etherscan.io/tx/0xefe966d8a8266623dfb655af6c1df6cb9442064f24df6378e56d4df43ce88913) | 263.3 USDT；`BOUNTY ｜FIP-3 實體會議！3/22 (日) 下午`；貼文稱後續拆分，未提供拆分結果 |
| APP_007 孤勇者專案聯絡人 | `0x73e4fd2ac1583ba3e869e56c8f57862b8c8e9a44509a1dfa5a909409dd292a1f` | 06/11 02:26 | [鏈上](https://optimistic.etherscan.io/tx/0x56de8aa790625653d6772630f9f79dc255908a22a657fc2bb6849bedad5fd21e) | 50 USDT；`BOUNTY ｜FAB DAO Grants 補助金專案聯絡人-孤勇者計畫 專案啟動` |
| APP_004 事水專案聯絡人 | `0x051793247b101e254a806ede8f62c87914b60a4c8de7f7479c8b17ec475b99c1` | 06/11 02:26 | [鏈上](https://optimistic.etherscan.io/tx/0xb5bdd701ee4681f88421b04450a26b29589df1a15fccb8dc5d89311fb3bb5796) | 50 USDT；`BOUNTY ｜FAB DAO Grants 補助金專案聯絡人-事水 專案啟動` |
| APP_006 不可能物件專案聯絡人 | `0xa9ed1b12210b4dd9d5dd4c201c2af8f5e101d3fbc6f06ec7300d4c997a3d7c65` | 06/11 02:27 | [鏈上](https://optimistic.etherscan.io/tx/0xb48de93646bd71c72206337c84d0f3c47ec02065589dc271021d67de66d182d0) | 50 USDT；`BOUNTY ｜FAB DAO Grants 補助金專案聯絡人-不可能物件_2026展覽計畫 專案啟動` |

以上金額是已執行交易的轉帳數字；是否達成補助里程碑或完成後續分配，仍須以委員會和專案資料判斷。
