# 快樂鼠 HappyRat - FAB DAO 專案治理與分配助手 (AI Agent)

## 🎯 專案簡介
本專案是為 FAB DAO (Formosa Art Bank DAO) 社群量身打造的 AI Agent，旨在解決資助計畫中「專案追蹤」與「信息透明度」的高摩擦問題。透過分層記憶檢索技術，幫助社群成員快速掌握專案進度。

在 FAB DAO 社區，我們正推行一個名為「行動客廳補助金」的計劃。希望由補助金，讓有行動力的建設者推動不同專案的啟動，讓有趣的人和事都聚集起來。

🐭 補助級距
快樂鼠｜5,000 NTD (150 USD) 以下
小鼠｜5,000 - 30,000 NTD (150 - 900 USD)
大鼠｜30,000 - 60,000 NTD (900 - 1800 USD)
累鼠｜60,000 NTD (1800 USD) 以上，單案最高 10 萬 NTD！
＊請評估行動規模，申請對應之補助級距

⏰ 申請時間：每月 1 日開放提案，25 日審核，快樂鼠隨到隨審！2/1 - 2/25 為 Round4，期待大家的投件！

🙌 更多資訊請參照申請辦法：
https://docs.google.com/document/d/1kLIC6qiF-Zf5JcbMedd2OiMI2Wmq2zLmeZmzg6dSzB0/edit?usp=sharing
✍️ 申請超簡單！只要完成提案表單：
https://bit.ly/fabdaogrant

這個 AI Agent 目前希望先由快樂鼠級別協助人類評審，例如回應關於補助金的問題、跟進已通過專案的進度，減輕在 Public Goods Funding 上的行政時間。
期望未來，我們將一步步按需求，把 AI Agent 的資料庫及靈魂進一步深化，可以做出專業級別的評審。

目前總結︰

## 🚀 核心賽道：分配 (Allocation) & 工作流優化
- **結構化記憶 (RAG)**：自動讀取並解析專案里程碑數據。
- **上下文感知 (Context-Aware)**：根據 Discord 身份組提供不同深度的數據訪問權限。
- **透明治理**：降低成員理解複雜提案與專案歷史的門檻。

## 🛠️ 技術架構
- **開發語言**：Node.js (Discord.js)
- **AI 大腦**：OpenAI GPT-4o
- **部署平台**：Railway
- **記憶模式**：三層結構化資料檢索 (Summary / Records / Archive)

未來預期︰
在正式投入 FAB DAO 的治理使用的三個月內，先按需要作出調整。
三個月後，將深化快樂鼠的提示詞，形成更細緻關於 Public Goods 的認知以及更新關於 FAB DAO 的背景。

## 📜 開源許可
本專案採用 [MIT License](LICENSE) 授權。
