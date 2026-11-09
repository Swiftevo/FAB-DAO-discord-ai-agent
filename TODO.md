# TODO

最後更新：2026-11-09

## 首要限制：20 人 MVP

所有 TODO 都受 [MVP_SCOPE.md](MVP_SCOPE.md) 約束。只有直接影響 8 項 MVP 驗收標準，或約 20 位實際使用者已遇到的問題，才進入當前開發。驗收通過後停止擴建。

- [ ] Discord 只有在 bot 被 mention 時才回答
- [ ] 連續約 20 次常見問題測試不崩潰
- [ ] 一般成員不能直接取得原始申請卷宗
- [ ] `行動客廳小組` reviewer 權限判定正常
- [ ] 回答引用既有資料來源，且不替補助金委員會作決定
- [ ] Render 重新啟動後能自行恢復服務
- [ ] OpenAI 帳戶已設定合理的使用預算上限

以下 P3 至 P7 是已知方向，不是目前承諾。除非維護者根據真實需求明確解除凍結，不進行實作。

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
- [x] 補充「回答需要引用來源」的格式規範
- [ ] 補充維護者如何更新 `data/summary.json`、`records`、`archive`

## P2 - 行動客廳資料補全

- [ ] 確認 FAB DAO Grant 官方級距在 150 USD 與 900 USD 邊界的歸類方式
- [ ] 確認 Google Form 是否可提供不需登入的公開填寫 URL
- [ ] 確認 Web3 羽球社 2026-06-12 大同運動中心場次是否成團及實際舉辦
- [ ] 補充 `APP_004` 事水 Instagram 帳號連結
- [ ] 追蹤 `APP_004` 事水 361.89 USDT 啟動資金是否完成轉帳
- [ ] 追蹤 `APP_006` 藝術銀行合作、焦點聚會補助與作品購藏是否另行核定
- [ ] 由 Notion 舊會議記錄頁面選擇 `Export → Markdown & CSV`
- [ ] Notion 匯出時勾選 `Include subpages`，保留原始頁面與資料庫內容
- [ ] 將 Notion 匯出 ZIP 匯入 `data/groups/action_living_room/raw/`
- [ ] 從 Notion 原文建立會議 index、摘要、決議與待辦 records
- [ ] 補充目前補助金委員會成員名單與 Discord ID
- [ ] 補充行動客廳 Bounty 規則、項目及進度資料
- [ ] 定期核對 Optimism Safe 的餘額、owner、3/5 threshold 與重要交易
- [ ] 在 `wallets.json` 更新 `balance_last_checked_at` 與核對結果

## Safe API 唯讀查詢驗收（當前）

- [x] 2026-10-17 已核對 FAB DAO 總金庫、GreenSofa、藝術銀行、頂加實驗室的 Safe 狀態、餘額、最近交易及指定交易 hash；不把浮動餘額寫成固定預期值。
- [x] 2026-10-17 已在 Discord 逐一驗證上述四個小組的餘額及最近交易回覆；以下呈現問題不算作財務摘要驗收通過。
- [x] 2026-10-17 已在 Discord 用頂加實驗室的已知 hash 驗證指定交易查詢路徑，回覆 1 ETH 流入。
- [ ] 上述接入測試完成後，顯示交易對手地址與已登記錢包名稱；已登記 DAO 錢包之間標為「內部轉帳」，其他只標「流入／流出」，不自動判定會計收入或支出。
- [ ] 上述測試完成後，讓交易列表區分原生 ETH（`tokenAddress=null`）與名稱相似的代幣；GreenSofa、藝術銀行、頂加實驗室均出現合約 `0xfAf5fCe33B906F289dB974Efdbf7bf77d5Fe7F31` 的 `EṬH`，不是原生 ETH（例：GreenSofa 交易 `0x0d9acd55b786c3a2b7ee8d556b4ede15e535dc6cac6bba04d0561ef5e058d633`）。
- [ ] 上述測試完成後，對 `transfers=[]` 的 Safe 操作顯示「未解析到資產轉移」及可用操作類型，避免與資金收支混淆。
- [ ] 上述測試完成後，交易超過三筆轉移時顯示尚有幾筆未列出；頂加實驗室交易 `0xa8864050369c32cdaa397f135d3e4785c80d70c5a8b54965351dcf734c35b90d` 有六筆 DAI 轉出，但 bot 只列前三筆。

## P3 - Discord 語音會議 AI 記錄（凍結）

- [ ] 制定錄音前的參與者知情與同意流程
- [ ] 選定 Discord 語音錄音與轉錄方式
- [ ] 每場會議記錄 Discord guild / voice channel / thread ID、日期與參與者
- [ ] 保存未修改的 raw transcript，並標示資料可見性與保存期限
- [ ] 由 AI 產生會議摘要、決議、待辦、負責人及期限
- [ ] 人工確認會議記錄後才寫入正式 records
- [ ] 定義錄音、逐字稿及個人資料的存取權限

## P4 - 未來資料同步（凍結）

常駐同步仍凍結；僅下列已批准的定點收錄路徑進入試行。

- [ ] 從 Discord 訊息同步資料庫
- [x] 2026-11-09 已建立授權者手動指定留言／討論串、預覽確認及 GitHub 待審變更的最小路徑；正式使用待 Render 設定與 Discord 實測。
- [ ] 研究並試行「回覆指定留言／提供訊息連結 + tag 快樂鼠 + 收錄到指定專案」：只讀取指定留言或有上限的同一討論串，不掃描整個伺服器。
- [ ] 收錄前顯示摘要、來源連結與目標專案，檢查重複和可見範圍；由授權維護者審核後，才寫入可持續保存的正式資料並供查詢使用。
- [ ] 確定 Render 免費方案下的持久儲存方式；不可只寫入運行中的本機 JSON，因重啟或重新部署後會遺失。
- [ ] 定義哪些 Discord 頻道可作為資料來源
- [ ] 定義訊息同步是否需要人工確認
- [ ] 定義資料清洗、摘要、引用來源與版本紀錄
- [ ] 定義申請人、委員、一般成員的資料可見範圍

## P5 - 未來權限模型（凍結）

目前不做，只記錄方向。

- [ ] 一般成員
- [ ] 申請人
- [ ] 委員
- [ ] 管理員
- [ ] 開發者
- [ ] Discord role 與 bot 權限對應表
- [ ] Telegram 長期支援下的身份映射方式

## P6 - 未來操作能力（凍結）

目前不做，只記錄需求。

- [ ] 查 APP_001 進度
- [ ] 列出待審案
- [ ] 幫我初審這份申請
- [ ] 產生委員會摘要
- [ ] 提醒某案快到 deadline

注意：「初審」與「委員會摘要」只應做資料整理，不應輸出通過或駁回決定。

## P7 - FAB DAO 文章與補助金觀點（凍結）

供約 20–50 人社群日後試行；現階段只記錄方向，不啟用自動審查。

- [ ] 挑選少量具代表性的 FAB DAO 文章，為每篇記錄作者、日期、連結、主要主張，以及「正式共識／作者觀點」來源性質。
- [ ] 以 FIP 1–3 與現行補助金規則為優先依據，整理可操作的價值問題；文章作為解釋及案例，不自動升格為規則。
- [ ] 提案建議固定區分資料事實、FAB DAO 角度、待釐清問題及具體下一步；逐項引用來源，保留委員會決策權。
- [ ] 用約 10 份既有提案人工檢查引用、建議具體度及重複提問的一致性，再決定是否開放使用。
