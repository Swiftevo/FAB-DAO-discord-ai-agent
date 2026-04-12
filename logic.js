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
 * 輔助函式：將 org_profile.json 轉換為 AI 系統背景
 */
function getOrganizationContext() {
    try {
        const orgPath = path.join(__dirname, 'data', 'org_profile.json');
        if (!fs.existsSync(orgPath)) return "";

        const data = JSON.parse(fs.readFileSync(orgPath, 'utf8'));
        let context = `\n【組織背景：${data.organization.name}】\n`;
        context += `願景：${data.organization.vision}\n`;
        context += `核心原則：${data.organization.core_principles.join('、')}\n\n`;
        
        context += `各部門介紹與連結：\n`;
        data.departments.forEach(dept => {
            context += `- ${dept.name}：${dept.description}\n`;
            if (dept.link) context += `  🔗 官方連結：${dept.link}\n`;
            if (dept.links) context += `  🔗 相關連結：${dept.links.join(', ')}\n`;
            if (dept.sub_units) {
                for (let unit in dept.sub_units) {
                    context += `  * ${unit}：${dept.sub_units[unit]}\n`;
                }
            }
        });
        return context;
    } catch (err) {
        console.error("無法讀取 org_profile.json:", err);
        return "";
    }
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


        // 2. 取得組織背景
        const orgContext = getOrganizationContext();

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
                    content: `${baseSystemContent}\n${orgContext}\n\n實時資料庫內容：\n${databaseContext}\n\指令：請優先根據組織背景回答。若涉及特定部門，請務必提供連結。`
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
