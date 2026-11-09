# 快樂鼠 HappyRat - FAB DAO 補助金 FAQ 助手

快樂鼠 HappyRat 是為 FAB DAO 行動客廳補助金設計的 Discord / Telegram AI 助手。現階段的產品定位是「補助金 FAQ 助手」：協助社群成員理解補助金規則、查詢已整理的申請案摘要與進度，減少人工重複回覆。

重要原則：快樂鼠不能替委員會做決定，也不能宣告申請案通過或不通過。遇到審查、核准、資金撥付等判斷時，必須回到 FAB DAO 補助金委員會審查。

## 首要限制：20 人 MVP

本專案只以約 20 位活躍 FAB DAO 成員的實際使用為衡量門檻，不追求商業化、大型社群、多租戶或企業級架構。所有開發工作必須先通過 [MVP_SCOPE.md](MVP_SCOPE.md) 的範圍判斷；達成其中 7 項驗收標準後停止擴建，改為收集真實使用回饋。

## 目前範圍

目前以既有功能與文件整理為主；維護者另批准指定 Discord 留言的手動收錄試行，詳見下文。

- 回答補助金 FAQ
- 回答申請流程、級距、時程、基本規則
- 根據資料庫摘要回覆申請案狀態
- 對一般使用者提供摘要化、去私隱化資訊
- 對具權限者提供較完整的卷宗資訊
- Discord 與 Telegram 長期並行支援

暫時不做：

- 不自動做審查決定
- 不保留跨回合對話記憶
- 除已批准的定點收錄外，不擴充其他新指令或新工作流
- 不做 Discord 訊息自動同步或全伺服器掃描

## 核心使用情境

預期常見問題包括：

- 查 APP_001 進度
- 列出待審案
- 幫我初審這份申請
- 產生委員會摘要
- 提醒某案快到 deadline

其中「初審」與「委員會摘要」只能作為資料整理與提醒，不得取代委員會判斷。

## 系統架構

```text
index.js                 Discord 入口，處理 mention、角色權限與回覆
telegram.js              Telegram 入口，處理私訊、群組 tag 與白名單
logic.js                 共用 AI 邏輯，讀取 prompt、資料檔並呼叫 OpenAI
prompts/happy_rat.txt    快樂鼠角色與補助金規則設定
data/org_profile.json    FAB DAO 組織背景
data/fip/                FAB DAO FIP 1/2/3 里程碑資料庫
data/groups/             FAB DAO 工作組資料庫
data/summary.json        申請案摘要總表
data/records/            單一申請案里程碑資料
data/discord_updates/    維護者合併後的 Discord 指定留言來源
data/archive/            原始卷宗文字檔
package.json             Node.js 啟動與依賴設定
```

更完整的架構說明請見 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 資料與引用原則

快樂鼠回答時應優先根據以下資料來源：

1. `prompts/happy_rat.txt` 的補助金規則與語氣設定
2. `data/org_profile.json` 的 FAB DAO 背景
3. `data/fip/index.json` 與 `data/fip/summaries/` 的 FAB DAO 里程碑文件概要
4. `data/groups/` 的 FAB DAO 工作組背景、聯絡人、錢包、資助計畫與來源
5. `data/summary.json` 的申請案摘要
6. `data/records/APP_xxx.json` 的里程碑資料
7. `data/archive/APP_xxx_full.txt` 的原始卷宗
8. `data/fip/raw/` 的 FIP 1/2/3 Snapshot 原文

未來回答應盡量標示資料來源，例如：`來源：data/summary.json` 或 `來源：data/records/APP_001.json`。一般使用者查詢時，應避免輸出個人聯絡方式、完整原始卷宗或其他私隱資訊。

## 權限原則

目前：

- Discord 使用角色名稱 `行動客廳小組` 判斷是否具備 reviewer 權限
- Telegram 使用白名單 `swiftevo`

未來需要更細的權限模型，但暫時列入 TODO，不在本階段實作。

## 安裝與執行

需要環境變數：

```bash
DISCORD_TOKEN=
TELEGRAM_TOKEN=
OPENAI_API_KEY=
```

安裝依賴：

```bash
npm install
```

本地執行：

```bash
npm start
```

目前 `npm start` 執行 `node index.js`；`index.js` 內會同時載入 `telegram.js`，因此 Discord 與 Telegram 會一起啟動。

## 部署狀態

目前正式部署平台是 Render。

Railway 曾經使用過，但目前已過期，不再是正式部署平台。代碼中仍可看到兩個平台的歷史痕跡：

- README 舊版與里程碑曾提到 Railway
- `index.js` 有為 Render keep-alive 加入的 HTTP server 註解
- 目前 repo 沒有 `railway.json`、`render.yaml`、`Procfile` 或 `Dockerfile`

維護部署時，應以 Render 的服務設定與環境變數為準。

## 目前最高優先事項

詳見 [TODO.md](TODO.md)。目前最高優先是：成功把快樂鼠 agent 加入 FAB DAO Discord，並完成最小可用測試。

## Discord 指定留言收錄（待部署啟用）

這項功能只接受具備 `行動客廳小組` 角色的成員，在已登記且允許收錄的專案頻道使用：

1. 回覆一則專案更新，輸入 `@快樂鼠 收錄到 APP_003`（也可用唯一的專案名稱）。
2. 在專案討論串輸入 `@快樂鼠 收錄這串到 APP_003`，擷取指令之前最多 20 則文字留言。
3. 快樂鼠顯示來源與內容預覽。確認可放進公開 GitHub 後，回覆該預覽並輸入 `@快樂鼠 確認收錄`。
4. 快樂鼠建立 GitHub 草稿 PR。維護者核對專案、資料真偽及可公開內容，合併後 bot 才會把這些留言當作查詢來源。留言陳述不等同獨立核實的撥款或成果。

Render 環境變數需設定 `DISCORD_INGEST_ENABLED=true`、`DISCORD_INGEST_CHANNEL_IDS`（逗號分隔、明確允許的專案頻道 ID）、`GITHUB_INGEST_TOKEN`，以及視需要設定 `GITHUB_INGEST_REPOSITORY`、`GITHUB_INGEST_BASE_BRANCH`。GitHub 憑證僅給該 repository 的 Contents、Pull requests 寫入權限，勿貼在 Discord 或提交到 Git。預設關閉；啟用前確認所列頻道內容適合提交至公開 repository。這個流程只讀取 Discord 文字，附件及外部連結不會自動讀入。

Render 免費服務的執行中檔案不是持久儲存。正式資料以合併後的 GitHub 檔案為準，收錄後部署到 Render 才會用於回答。本功能使用專案名稱和檔案檢索，沒有向量資料庫。

## 更新日記

本項目從 2026-06-15 起開始記錄更新日記，方便日後系統升級、回溯架構決策與理解每次變更目的。詳見 [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md)。

## 維護者

核心開發：swiftevo

## 開源許可

本專案採用 [MIT License](LICENSE) 授權。
