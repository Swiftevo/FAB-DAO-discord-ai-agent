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
