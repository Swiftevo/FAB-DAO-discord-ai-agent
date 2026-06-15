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

## P1 - 文件與治理邊界

- [x] README 改成「補助金 FAQ 助手」定位
- [x] 明確記錄 AI 不能替委員會做決定
- [x] 建立架構文件
- [x] 建立更新日記
- [ ] 補充「AI 回答陌生人時應摘要化、去私隱化」的具體例子
- [ ] 補充「回答需要引用來源」的格式規範
- [ ] 補充維護者如何更新 `data/summary.json`、`records`、`archive`

## P2 - 未來資料同步

目前不做，只記錄方向。

- [ ] 從 Discord 訊息同步資料庫
- [ ] 定義哪些 Discord 頻道可作為資料來源
- [ ] 定義訊息同步是否需要人工確認
- [ ] 定義資料清洗、摘要、引用來源與版本紀錄
- [ ] 定義申請人、委員、一般成員的資料可見範圍

## P3 - 未來權限模型

目前不做，只記錄方向。

- [ ] 一般成員
- [ ] 申請人
- [ ] 委員
- [ ] 管理員
- [ ] 開發者
- [ ] Discord role 與 bot 權限對應表
- [ ] Telegram 長期支援下的身份映射方式

## P4 - 未來操作能力

目前不做，只記錄需求。

- [ ] 查 APP_001 進度
- [ ] 列出待審案
- [ ] 幫我初審這份申請
- [ ] 產生委員會摘要
- [ ] 提醒某案快到 deadline

注意：「初審」與「委員會摘要」只應做資料整理，不應輸出通過或駁回決定。
