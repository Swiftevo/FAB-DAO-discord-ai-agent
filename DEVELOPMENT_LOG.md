# 更新日記

本文件用來記錄快樂鼠 HappyRat 的系統更新、架構判斷與重要待辦，方便日後升級或回溯。

## 2026-06-15

### 背景

本次整理的目的不是新增功能，而是收斂項目意圖與文件，讓後續開發能清楚知道快樂鼠目前應該扮演什麼角色。

使用者確認：

- 目前先做好補助金 FAQ 助手角色
- 不做功能擴充，不加入新功能
- 快樂鼠不能做決定，只能交由委員會審查
- 未來希望讀取 Discord 訊息並同步資料庫
- 未來需要更細權限，但現在只列入 TODO
- AI 回答陌生人查問時，要摘要化、去私隱化
- Discord 與 Telegram 都長期支援
- 回答應引用資料來源
- 暫時不需要保留對話記憶
- 目前優先事項是成功把 agent 加入 FAB DAO Discord

### 本次觀察

讀取了主要文件與代碼：

- `README.md`
- `package.json`
- `index.js`
- `telegram.js`
- `logic.js`
- `prompts/happy_rat.txt`
- `data/org_profile.json`
- `data/summary.json`
- `data/records/APP_001.json`
- `data/archive/APP_001_full.txt`

確認目前架構：

- Discord 與 Telegram 共用 `logic.js`
- `npm start` 執行 `node index.js`
- `index.js` 會載入 `telegram.js`，因此兩個平台會一起啟動
- OpenAI 使用 `gpt-4o`
- 資料層位於 `data/`
- 權限目前以 Discord role 與 Telegram 白名單處理

### 部署判斷

代碼與文件中同時存在 Railway 與 Render 痕跡：

- 舊 README 提到 Railway
- `index.js` 有 Render keep-alive server 註解
- repo 沒有 `railway.json`、`render.yaml`、`Procfile` 或 `Dockerfile`

初步結論：需要從部署平台 dashboard 或維護者記憶確認目前正式平台。文件暫不宣稱唯一平台。

後續確認：維護者確認 Railway 是曾經使用的平台，目前已過期；現在正式部署平台是 Render。後續部署檢查、環境變數與啟動指令應以 Render 為準。

### 本次文件更新

- 重寫 `README.md`，把定位改成補助金 FAQ 助手
- 新增 `ARCHITECTURE.md`
- 新增 `TODO.md`
- 新增本文件 `DEVELOPMENT_LOG.md`

### 後續最高優先

先把快樂鼠成功加入 FAB DAO Discord，並完成最小可用測試：

- bot 能進 server
- mention 時才回覆
- 一般成員看到摘要化回答
- reviewer 權限判斷正確
- 雲端部署 token 與平台狀態清楚

## 2026-06-15 Discord 接入修正

### 問題

使用原始 Discord OAuth URL 授權時，Discord 顯示成功，但 bot 沒有實際以機器人成員身份加入 FAB DAO Discord。後續改用包含 `bot` 與 `applications.commands` scope 的 invite URL 後，bot 成功加入 server。

之後在 Discord tag bot 時，Render log 顯示 bot 已收到使用者訊息，也已讀取資料並準備回覆，但 Discord API 回傳 `DiscordAPIError[50001]: Missing Access`。log 中出現 `ThreadChannel.send`，判斷測試位置是 Discord thread / forum post，bot 缺少 `Send Messages in Threads` 權限。

### 處理

- 使用包含 `bot` scope 的 invite URL 重新授權
- 補上 `Send Messages in Threads` 權限
- 確認 bot 已加入 FAB DAO Discord 並在線
- 釐清 `Missing Access` 不是 OpenAI、Render token 或 Message Content Intent 問題，而是 Discord channel/thread 權限問題
- 在 `index.js` 加入 `safeReply`，避免回覆失敗時 catch 區塊再次回覆失敗，導致 Render instance crash

### 後續

部署此修正後，若 Discord 再回傳 `Missing Access`，Render 應只記錄錯誤，不應讓 Node process crash。仍需在 Render 部署後再次於一般文字頻道與 thread 各測一次 mention 回覆。

## 2026-06-16 FIP 里程碑資料庫

### 背景

使用者要求 agent 具備 FAB DAO 過往歷史、相關部門與價值脈絡，並指定三份重要 Snapshot 里程碑文件：

- FIP-1 - DAO 化工程
- FIP-2, 2nd Formosa Art Bank DAO Improvement Proposals
- FIP-3, 3rd Formosa Art Bank DAO Improvement Proposals

### 處理

- 從 Snapshot GraphQL API 讀取 FIP-1、FIP-2、FIP-3 proposal body 與 metadata
- 建立 `data/fip/raw/`，存放 Snapshot proposal body 原文
- 建立 `data/fip/metadata/`，存放 Snapshot proposal metadata
- 建立 `data/fip/summaries/`，整理三份 agent 可讀概要
- 建立 `data/fip/index.json`，作為 FIP 里程碑索引
- 更新 `logic.js`，讓 agent 固定讀取 FIP index 與 summaries
- 當使用者指定 FIP-1/2/3 並要求原文、全文、深度或細節查找時，agent 會讀取本地 `data/fip/raw/` 原文，不需再依賴 Snapshot

### 里程碑理解

- FIP-1：建立 FAB DAO 的 DAO 化工程、組織精神、客廳 / 廚房架構、行動客廳、藝術銀行、超證應用等初始小組。
- FIP-2：補完百岳資金使用原則、工作組授權、任期、多簽管理，並正式定義行動客廳補助金委員會。
- FIP-3：將 FAB DAO 轉向永續導向，更新資金池、年度預算、聯絡人會議制度，並加入頂加實驗室與 GreenSofa 綠沙發脈絡。

## 2026-06-22 行動客廳資料庫

### 背景

開始以 `data/groups/` 結構建立四個 FAB DAO 工作組資料庫，第一個實作組別為行動客廳。

### 資料

- Optimism Safe：`0x4B04936DE3bb0a32DfeDb73816E231CFeF0707C4`
- Safe URL：`https://app.safe.global/home?safe=oeth:0x4B04936DE3bb0a32DfeDb73816E231CFeF0707C4`
- 簽署門檻：3/5
- 多簽管理人：天天晴朗 - penghui、青苔Yian、很睏宜品（台灣人）、當我開始 - 偷偷、FL YANG

地址與 Discord ID 以 `public_governance_data` 標記存入公開 repo。不得在 repo 儲存私鑰、助記詞、Bot token 或 Safe 簽署憑證。

### 結構化連接

- 建立行動客廳 profile、summary、contacts、wallets、programs、sources、records 與 raw 結構。
- 將 `APP_001` 至 `APP_005` 標記為行動客廳轄下 `fab_dao_grant` 補助金專案。
- 將 Grant 連接至 `grant_committee`，並標明最終決策只能由人類委員會作出。
- 建立 Bounty placeholder，等待後續資料。
- 更新 `logic.js`，只在相關問題出現時載入行動客廳詳細資料。

### 後續

- Notion 舊會議記錄需由維護者匯出 Markdown & CSV，再匯入 raw 與 records。
- Discord 語音會議不會自然保留內容；需要知情同意、錄音、轉錄、AI 摘要及人工確認流程。
- 多簽目前採人工核對，未來再評估鏈上監測。

### 今日完成紀錄

- 維護者確認行動客廳 Optimism Safe 地址與五名多簽管理人的 Discord ID 均屬公開治理資料，可存入公開 GitHub repo。
- 驗證 11 份相關 JSON 可正常解析，`logic.js` 通過 Node 語法檢查。
- 確認 `APP_001` 至 `APP_005` 均已連接至 `action_living_room → fab_dao_grant → grant_committee`。
- Commit：`3e42c97 feat: add action living room database`
- Branch：`codex/add-action-living-room-database`
- 建立 draft PR：`https://github.com/Swiftevo/FAB-DAO-discord-ai-agent/pull/5`
- GitHub CLI `gh` 開 PR 流程已驗證可用；後續可由 Codex 完成 commit、push 與 draft PR，merge 仍由維護者決定。

## 2026-06-22 Web3 羽球社資料更新

### 更新內容

- 補充專案負責人 MN 與公開 Discord ID。
- 記錄營運模式由自行租場、揪人及收款，改為參加運動中心既有羽球暢打團。
- 保留 Web3 元素：加密貨幣 / 法幣付款選項、Fluidkey 收款、POAP 出席紀錄與裝備獎勵方向。
- 記錄 Signal 群組、275 NTD 參加費用、台北市大同運動中心及 2026-06-12 條件式活動資訊。
- 更新 `APP_001` 結構化 record、申請案 summary 及行動客廳 sources。
- 將維護者提供的原始文字保存於 `data/archive/APP_001_update_2026-06-12.md`。

### 資料判斷

更新文字只說明若大同運動中心於 6/11 開團，負責人才會替成員報名；沒有提供 6/12 最終成團或活動完成結果。因此資料庫暫標記為 `outcome_unconfirmed`，並加入 TODO 等待確認。
