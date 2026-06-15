# 快樂鼠架構文件

最後更新：2026-06-15

## 產品定位

快樂鼠 HappyRat 目前定位為 FAB DAO 行動客廳補助金 FAQ 助手。

它的責任是：

- 回答補助金規則、流程、時程與常見問題
- 根據已整理資料回覆申請案摘要與進度
- 協助把資訊整理成委員會可讀的摘要
- 在一般使用者查詢時保護私隱，避免輸出完整原始資料

它的非責任是：

- 不替委員會做補助決策
- 不宣告申請案通過或駁回
- 不取代人類審查
- 暫時不保留對話記憶
- 暫時不新增自動化功能

## 執行入口

### `index.js`

Discord 入口。

目前行為：

- 建立簡易 HTTP server，回覆 `Happy Rat is running!`，用途是讓雲端平台保持服務存活
- 建立 Discord client
- 監聽 `messageCreate`
- 忽略 bot 訊息
- 只有在訊息 mention bot 時才回應
- 移除 Discord mention 後，把文字送入 `handleAIRequest`
- 透過 Discord 角色名稱 `行動客廳小組` 判斷 reviewer 權限
- 在檔案結尾載入 `telegram.js`，因此 `npm start` 會同時啟動 Telegram bot

### `telegram.js`

Telegram 入口。

目前行為：

- 建立 Telegraf bot
- 私訊直接處理文字訊息
- 群組或 supergroup 需要 tag bot 才會回應
- 移除 Telegram tag 後，把文字送入 `handleAIRequest`
- 透過白名單 `swiftevo` 判斷 reviewer 權限

### `logic.js`

共用 AI 邏輯。

目前行為：

- 讀取 `prompts/happy_rat.txt`
- 讀取 `data/org_profile.json`
- 固定載入 `data/summary.json`
- 偵測使用者訊息中的 `APP_###`
- 若有申請案 ID，讀取 `data/records/APP_###.json`
- 若 reviewer 要求查看原始檔案或深度分析，讀取 `data/archive/APP_###_full.txt`
- 呼叫 OpenAI Chat Completions API，模型為 `gpt-4o`
- 若回覆超過 1900 字，截斷回覆

## 資料層

```text
data/
  org_profile.json       FAB DAO 組織背景、部門、連結與原則
  summary.json           所有申請案的摘要索引
  fip/
    index.json           FAB DAO FIP 1/2/3 里程碑索引
    summaries/           FIP 1/2/3 概要，供 agent 日常回答使用
    raw/                 Snapshot 提案原文，供深層查找使用
    metadata/            Snapshot proposal metadata
  records/
    APP_001.json         單案里程碑資料
  archive/
    APP_001_full.txt     單案原始卷宗
```

### `data/summary.json`

一般查詢的主要資料來源。適合回答：

- 有哪些申請案
- 某案目前狀態
- 預算、時程、申請人、摘要里程碑

### `data/records/`

單一申請案的里程碑細節。適合回答：

- APP_001 的階段任務
- deadline
- current phase 對應的進度脈絡

### `data/archive/`

原始卷宗。包含更完整的專案背景、來源連結、技術細節、預算等。這一層應被視為較高敏感度資料，一般使用者查詢時應摘要化、去私隱化。

### `data/fip/`

FAB DAO 里程碑資料庫。包含 FIP-1、FIP-2、FIP-3 的 Snapshot 原始正文、metadata 與 agent 可讀概要。

- `index.json`：提案標題、Snapshot URL、投票期間、結果、原始檔與概要檔路徑。
- `summaries/`：人工整理的治理脈絡概要，讓 agent 理解 FAB DAO 歷史、部門與價值。
- `raw/`：從 Snapshot proposal body 擷取的一字不改原文。當使用者需要原文、全文、深度或細節查找時，agent 應讀取本地 raw 檔，不需再依賴 Snapshot。
- `metadata/`：Snapshot API 回傳的 proposal metadata，如投票結果、分數、作者與區塊資訊。

## 權限與私隱

目前權限實作很簡單：

- Discord：使用角色名稱 `行動客廳小組`
- Telegram：使用白名單 `swiftevo`

現階段文件約束：

- 一般使用者只應收到摘要化資料
- 不應直接輸出 email、完整原始卷宗、私人聯絡方式或未必要公開的細節
- reviewer 可以要求較完整資料，但 AI 仍不得替委員會做決定

未來 TODO：

- 更細的身份模型
- Discord 原生權限與頻道權限整合
- 私隱欄位遮蔽策略
- 回答引用來源

## 部署判斷

目前從代碼可見：

- `package.json` 的 `start` 是 `node index.js`
- `index.js` 有簡易 HTTP server，註解指向 Render keep-alive 用途
- README 舊版提到 Railway
- repo 內沒有 `railway.json`、`render.yaml`、`Procfile`、`Dockerfile`

維護者已確認：Railway 是曾經使用的平台，目前已過期；現在正式部署平台是 Render。後續部署與環境變數檢查應以 Render 為準。

## 目前主要風險

- README 舊版曾宣稱 AI 可協助審查，容易讓人誤解為能做決策
- 目前回覆未穩定標示資料來源
- 一般使用者與 reviewer 的資料邊界需要更明確
- `index.js` 同時啟動 Telegram，對部署者不一定直觀
- 沒有自動測試或健康檢查流程
- Discord Message Content intent、bot invite 權限、server role 名稱都需要在正式加入 FAB DAO Discord 前確認

## 下一步原則

短期不擴功能。先完成：

1. 文件收斂：明確定位為 FAQ 助手
2. Render 部署確認：檢查 Render service、環境變數與啟動指令
3. Discord 接入：成功把 agent 加入 FAB DAO Discord 並完成 mention 測試
4. 私隱與來源：在後續版本加入更明確的引用與遮蔽策略
