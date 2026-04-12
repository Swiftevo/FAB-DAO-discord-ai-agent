const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 初始化 OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 輔助函式：讀取 Prompt 設定檔
 * 直接從 prompts/happy_rat.txt 讀取個性設定
 */
function getPrompt(fileName) {
    const filePath = path.join(__dirname, 'prompts', fileName);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    console.warn(`警告：找不到設定檔 ${fileName}，請檢查路徑。`);
    return ""; 
}

/**
 * 核心 AI 處理函數 (支援雙平台共用)
 * @param {string} userPrompt 使用者輸入的文字
 * @param {boolean} isReviewer 是否具備管理員權限
 * @returns {Promise<string>} 回傳要回覆給使用者的文字
 */
async function handleAIRequest(userPrompt, isReviewer) {
    let databaseContext = "";

    try {
        // 1. 取得基本個性設定 (來自 happy_rat.txt)
        const baseSystemContent = getPrompt('happy_rat.txt');

        // --- 第一層：讀取基礎摘要 (固定載入) ---
        const summaryPath = path.join(__dirname, 'data', 'summary.json');
        if (fs.existsSync(summaryPath)) {
            const summary = fs.readFileSync(summaryPath, 'utf8');
            databaseContext += `\n【目前所有申請案摘要】：\n${summary}\n`;
        }

        // --- 第二層：偵測 ID 並讀取細節 ---
        const appIdMatch = userPrompt.match(/APP_\d+/i);
        let appId = appIdMatch ? appIdMatch[0].toUpperCase() : null;

        if (appId) {
            const recordPath = path.join(__dirname, 'data', 'records', `${appId}.json`);
            if (fs.existsSync(recordPath)) {
                const record = fs.readFileSync(recordPath, 'utf8');
                databaseContext += `\n【${appId} 里程碑細節】：\n${record}\n`;
            }

            // --- 第三層：權限檢查 (查看原始檔案 / 深度分析) ---
            if (userPrompt.includes("查看原始檔案") || userPrompt.includes("深度分析")) {
                if (isReviewer) {
                    const arcPath = path.join(__dirname, 'data', 'archive', `${appId}_full.txt`);
                    if (fs.existsSync(arcPath)) {
                        const fullText = fs.readFileSync(arcPath, 'utf8');
                        // 管理員直接回傳全文，不經過 AI 總結，避免重複回覆
                        return `📜 **${appId} 原始卷宗全文**：\n\n${fullText.substring(0, 1500)}...`;
                    } else {
                        return `❌ 找不到 ${appId} 的原始檔案。`;
                    }
                } else {
                    return `❌ **存取失敗**：查看原始檔案僅限「行動客廳小組」或授權成員使用。`;
                }
            }
        }

        // --- 第四層：呼叫 OpenAI ---
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: `${baseSystemContent}\n\n實時資料庫內容：\n${databaseContext}` 
                },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });

        let replyContent = completion.choices[0].message.content;

        // --- 第五層：輸出處理 (1900字截斷機制) ---
        if (replyContent.length > 1900) {
            return replyContent.substring(0, 1900) + "\n\n（回答過長，已截斷）";
        } else {
            return replyContent;
        }

    } catch (err) {
        console.error("Logic Error:", err);
        return "哎呀，我的大腦在讀取資料時發生了點錯誤，請稍後再試！";
    }
}

module.exports = { handleAIRequest };
