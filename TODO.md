# TODO

最後更新：2026-06-15

## P0 - 成功把 agent 加入 FAB DAO Discord

目標：讓快樂鼠能在 FAB DAO Discord 中被 mention，並穩定回答補助金 FAQ。

- [ ] 確認 Discord Developer Portal 中的 bot application
- [ ] 確認 `DISCORD_TOKEN` 是目前正式 bot token
- [ ] 確認 bot 已開啟必要 intents：Guilds、Guild Messages、Message Content
- [ ] 產生 Discord bot invite link
- [ ] 邀請 bot 加入 FAB DAO Discord server
- [ ] 確認 bot 權限至少包含讀取訊息、發送訊息、讀取訊息歷史
- [ ] 確認 `行動客廳小組` Discord 角色名稱是否與程式碼完全一致
- [ ] 在測試頻道 mention bot，確認它只在被 mention 時回覆
- [ ] 測試一般成員查詢 APP_001，只回覆摘要化資訊
- [ ] 測試 reviewer 查詢 APP_001，確認權限判斷符合預期
- [ ] 確認錯誤回覆不會洩漏 token、stack trace 或私隱資訊
- [ ] 確認雲端部署環境有 `DISCORD_TOKEN`、`TELEGRAM_TOKEN`、`OPENAI_API_KEY`
- [x] 確認目前正式部署平台是 Render，Railway 已過期並列為歷史平台
- [x] 使用包含 `bot` scope 的 invite link 將 bot 加入 FAB DAO Discord
- [x] 補上 `Send Messages in Threads` 權限，讓 bot 可在討論串 / forum post 回覆
- [ ] 部署 `safeReply` 修正，避免 Discord 回覆失敗時造成 Render instance crash

## P1 - 文件與治理邊界

- [x] README 改成「補助金 FAQ 助手」定位
- [x] 明確記錄 AI 不能替委員會做決定
- [x] 建立架構文件
- [x] 建立更新日記
- [x] 建立 FAB DAO FIP 1/2/3 里程碑資料庫
- [x] 建立行動客廳 group database 骨架
- [x] 將 APP_001 至 APP_005 結構化連接至行動客廳、FAB DAO Grant 與補助金委員會
- [ ] 補充「AI 回答陌生人時應摘要化、去私隱化」的具體例子
- [ ] 補充「回答需要引用來源」的格式規範
- [ ] 補充維護者如何更新 `data/summary.json`、`records`、`archive`

## P2 - 行動客廳資料補全

- [ ] 確認 FAB DAO Grant 官方級距在 150 USD 與 900 USD 邊界的歸類方式
- [ ] 確認 Google Form 是否可提供不需登入的公開填寫 URL
- [ ] 確認 Web3 羽球社 2026-06-12 大同運動中心場次是否成團及實際舉辦
- [ ] 追蹤 `APP_006` 藝術銀行合作、焦點聚會補助與作品購藏是否另行核定
- [ ] 由 Notion 舊會議記錄頁面選擇 `Export → Markdown & CSV`
- [ ] Notion 匯出時勾選 `Include subpages`，保留原始頁面與資料庫內容
- [ ] 將 Notion 匯出 ZIP 匯入 `data/groups/action_living_room/raw/`
- [ ] 從 Notion 原文建立會議 index、摘要、決議與待辦 records
- [ ] 補充目前補助金委員會成員名單與 Discord ID
- [ ] 補充行動客廳 Bounty 規則、項目及進度資料
- [ ] 定期核對 Optimism Safe 的餘額、owner、3/5 threshold 與重要交易
- [ ] 在 `wallets.json` 更新 `balance_last_checked_at` 與核對結果

## P3 - Discord 語音會議 AI 記錄

- [ ] 制定錄音前的參與者知情與同意流程
- [ ] 選定 Discord 語音錄音與轉錄方式
- [ ] 每場會議記錄 Discord guild / voice channel / thread ID、日期與參與者
- [ ] 保存未修改的 raw transcript，並標示資料可見性與保存期限
- [ ] 由 AI 產生會議摘要、決議、待辦、負責人及期限
- [ ] 人工確認會議記錄後才寫入正式 records
- [ ] 定義錄音、逐字稿及個人資料的存取權限

## P4 - 未來資料同步

目前不做，只記錄方向。

- [ ] 從 Discord 訊息同步資料庫
- [ ] 定義哪些 Discord 頻道可作為資料來源
- [ ] 定義訊息同步是否需要人工確認
- [ ] 定義資料清洗、摘要、引用來源與版本紀錄
- [ ] 定義申請人、委員、一般成員的資料可見範圍

## P5 - 未來權限模型

目前不做，只記錄方向。

- [ ] 一般成員
- [ ] 申請人
- [ ] 委員
- [ ] 管理員
- [ ] 開發者
- [ ] Discord role 與 bot 權限對應表
- [ ] Telegram 長期支援下的身份映射方式

## P6 - 未來操作能力

目前不做，只記錄需求。

- [ ] 查 APP_001 進度
- [ ] 列出待審案
- [ ] 幫我初審這份申請
- [ ] 產生委員會摘要
- [ ] 提醒某案快到 deadline

注意：「初審」與「委員會摘要」只應做資料整理，不應輸出通過或駁回決定。
