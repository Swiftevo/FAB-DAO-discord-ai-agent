# Safe 錢包查詢（20 人 MVP）

五個錢包地址見 `data/groups/*/wallets.json`。地址由維護者提供；2026-10-17 已用 Safe Optimism Transaction Service 核實為 Safe。這些是公開鏈上查詢資料，不代表 Agent 擁有簽署權。

Discord 要 mention bot，然後可問：

- `@bot 行動客廳 錢包餘額`
- `@bot GreenSofa 最近交易`
- `@bot 藝術銀行 查詢交易 0x...`（完整 66 字元交易 hash）
- `@bot 頂加實驗室 多簽餘額`
- `@bot FAB DAO 總金庫 最近交易`

部署時在環境變數設定 `SAFE_API_KEY`（Safe Developer API key）；不要貼到 Discord 或提交至 Git。查詢直接讀取 Safe API，不使用 OpenAI 推算金額。餘額只列出 Safe API 標記為 trusted、非 spam 的代幣；指定 hash 只搜尋該錢包最近 1,000 筆已執行交易。找不到時應回 Safe 頁面核對，不等同證明交易不存在。此功能不提供歷史某一時點的餘額、完整會計分類或跨鏈資產總額。

資料來源：[Safe Transaction Service API](https://docs.safe.global/core-api/transaction-service-reference/optimism)。
