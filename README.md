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

## 🚀 重要里程碑
[2026-04-12] 成功達成雙平台同步部署：透過 Railway 雲端伺服器，解決了本地 Telegram API 連線限制。

大腦與身體分離 (Logic Decoupling)：成功將 AI 處理邏輯抽離至 logic.js，實現了一套程式碼、多個介面的高效率開發模式。

權限管理系統：實作了 Discord 身分組（行動客廳小組）與 Telegram 白名單（swiftevo）雙軌權限控制。

資料庫整合：完整串接 summary.json 與 archive/ 資料夾，讓 AI 具備即時讀取申請案卷宗的能力。

## 🛠️ 核心功能
1. 跨平台智慧對話
Discord：在標記（Mention）機器人後觸發。

Telegram：支援直接私訊或在群組中對話。

共享邏輯：無論在平台詢問，得到的資訊都是最新、一致的。

2. 管理員卷宗讀取權限
摘要回覆：一般使用者詢問時，AI 僅根據 summary.json 提供簡短摘要。

原始檔案讀取：具備管理員權限者，可要求 AI 讀取 archive/ 內的完整 Markdown 卷宗。

字數自動優化：當卷宗內容過長時（超過 1900 字），系統會自動進行二次摘要，確保不超過通訊軟體的訊息長度限制。

3. 專案進度追蹤
AI 能根據 summary.json 中的各個標籤（如 APP_001）回報專案當前的審查進度與狀態。

## 🏗️ 系統架構
Plaintext
├── index.js        # Discord 介面層：處理訊息監聽與權限判斷
├── telegram.js     # Telegram 介面層：處理訊息監聽與白名單過濾
├── logic.js        # 核心大腦：負責檔案讀取、OpenAI API 串接與內容優化
├── package.json    # 啟動腳本配置 (node index.js & node telegram.js)
├── prompts/        # 存儲 AI 的人格與角色設定檔
└── archive/        # 存放所有申請案的原始 Markdown 卷宗

## 🛠️ 技術架構
- **開發語言**：Node.js
- **AI 大腦**：OpenAI GPT-4o
- **部署平台**：Railway
- **記憶模式**：三層結構化資料檢索 (Summary / Records / Archive)

## 📖 安裝與部署
環境變數配置：
在 .env 或雲端平台（如 Railway）中設定：

DISCORD_TOKEN

TELEGRAM_TOKEN

OPENAI_API_KEY

## 本地執行：

Bash
npm install
node index.js & node telegram.js

## 雲端部署：
將代碼推送到 GitHub，並確保啟動指令為 npm start。

## 👥 維護者
核心開發：swiftevo

未來預期︰
在正式投入 FAB DAO 的治理使用的三個月內，先按需要作出調整。
三個月後，將深化快樂鼠的提示詞，形成更細緻關於 Public Goods 的認知以及更新關於 FAB DAO 的背景。

## 📜 開源許可
本專案採用 [MIT License](LICENSE) 授權。
