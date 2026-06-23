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
        // 新增這行來除錯
        console.log("嘗試讀取組織設定檔路徑:", orgPath);

            if (!fs.existsSync(orgPath)) {
            console.warn("⚠️ 找不到組織設定檔，請檢查路徑:", orgPath);
            return "";
        }

        const rawData = fs.readFileSync(orgPath, 'utf8');
        // 🌟 新增：檢查原始字串長度
        console.log("原始 JSON 長度:", rawData.length);

        const data = JSON.parse(rawData);
        // 🌟 新增：確認解析後的組織名稱
        console.log("解析成功，組織名稱:", data.organization.name);

        let context = `\n【重要：你是 ${data.organization.name} 的專屬助理】\n`;
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
 * 輔助函式：讀取 FAB DAO FIP 里程碑資料庫
 */
function getFipContext(userPrompt) {
    let context = "";

    try {
        const fipDir = path.join(__dirname, 'data', 'fip');
        const indexPath = path.join(fipDir, 'index.json');

        if (!fs.existsSync(indexPath)) {
            return "";
        }

        const fipIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        context += `\n【FAB DAO 里程碑文件索引】:\n${JSON.stringify(fipIndex, null, 2)}\n`;

        fipIndex.forEach(fip => {
            const summaryPath = path.join(__dirname, fip.summary_file);
            if (fs.existsSync(summaryPath)) {
                const summary = fs.readFileSync(summaryPath, 'utf8');
                context += `\n【${fip.id} 概要】:\n${summary}\n`;
            }
        });

        const fipMatch = userPrompt.match(/FIP[-_\s]?([123])/i);
        const deepLookup = /原文|全文|完整|深度|細節|raw/i.test(userPrompt);

        if (fipMatch && deepLookup) {
            const fipId = `FIP_${fipMatch[1]}`;
            const selectedFip = fipIndex.find(fip => fip.id === fipId);

            if (selectedFip) {
                const rawPath = path.join(__dirname, selectedFip.raw_file);
                if (fs.existsSync(rawPath)) {
                    const rawText = fs.readFileSync(rawPath, 'utf8');
                    context += `\n【${fipId} 原始全文】:\n${rawText}\n`;
                }
            }
        }

        return context;
    } catch (err) {
        console.error("無法讀取 FIP 里程碑資料庫:", err);
        return "";
    }
}

/**
 * 輔助函式：依問題載入 FAB DAO 工作組資料
 */
function getGroupContext(userPrompt) {
    let context = "";

    try {
        const groupsDir = path.join(__dirname, 'data', 'groups');
        const indexPath = path.join(groupsDir, 'index.json');

        if (!fs.existsSync(indexPath)) {
            return "";
        }

        const groupIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        context += `\n【FAB DAO 工作組索引】:\n${JSON.stringify(groupIndex, null, 2)}\n`;

        const actionLivingRoomLookup = /行動客廳|補助金|補助金委員會|grant|bounty|懸賞|多簽|錢包|APP_\d+/i.test(userPrompt);
        const selectedGroups = groupIndex.filter(group => {
            if (group.database_status !== 'active') return false;
            if (group.id === 'action_living_room' && actionLivingRoomLookup) return true;

            return [group.name, ...(group.aliases || [])]
                .some(alias => userPrompt.toLowerCase().includes(alias.toLowerCase()));
        });

        selectedGroups.forEach(group => {
            const groupDir = path.join(groupsDir, group.id);
            const files = [
                ['profile.md', '組別背景'],
                ['summary.md', '目前摘要'],
                ['grant_program.md', 'FAB DAO Grant 官方規則摘要'],
                ['contacts.json', '聯絡人與治理角色'],
                ['wallets.json', '錢包資料'],
                ['programs.json', '資助計畫與治理關聯'],
                ['sources.json', '資料來源']
            ];

            files.forEach(([fileName, label]) => {
                const filePath = path.join(groupDir, fileName);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    context += `\n【${group.name} - ${label}】:\n${content}\n`;
                }
            });

            const deepGrantLookup = /原文|全文|完整|深度|細節|raw/i.test(userPrompt)
                && /補助金|grant|申請辦法|級距|審核|撥款/i.test(userPrompt);

            if (group.id === 'action_living_room' && deepGrantLookup) {
                const rawRulesPath = path.join(groupDir, 'raw', 'FAB_DAO_Grant_application_rules_2026-04-21.md');
                if (fs.existsSync(rawRulesPath)) {
                    const rawRules = fs.readFileSync(rawRulesPath, 'utf8');
                    context += `\n【FAB DAO Grant 申請辦法原文】:\n${rawRules}\n`;
                }
            }
        });

        return context;
    } catch (err) {
        console.error("無法讀取工作組資料庫:", err);
        return "";
    }
}

function isGrantSourceRequired(userPrompt) {
    return /補助金|grant|申請規範|申請方法|申請辦法|申請表|級距|審核|撥款|成果報告/i.test(userPrompt);
}

function ensureGrantSources(userPrompt, replyContent) {
    if (!isGrantSourceRequired(userPrompt)) {
        return replyContent;
    }

    const hasOfficialRules = replyContent.includes('docs.google.com/document/d/1kLIC6qiF-Zf5JcbMedd2OiMI2Wmq2zLmeZmzg6dSzB0')
        || replyContent.includes('data/groups/action_living_room/grant_program.md');
    const hasApplicationForm = replyContent.includes('docs.google.com/forms/d/1AGjmuaDiQUnwSk88MloVrt2VaCYToPdFk20Tm9kPbbY')
        || replyContent.includes('bit.ly/fabdaogrant');

    if (hasOfficialRules && hasApplicationForm) {
        return replyContent;
    }

    return `${replyContent.trim()}\n\n資料來源：\n- FAB DAO Grant 行動客廳補助金｜申請辦法（2026-04-21）：https://docs.google.com/document/d/1kLIC6qiF-Zf5JcbMedd2OiMI2Wmq2zLmeZmzg6dSzB0/edit?tab=t.0#heading=h.9hr25oz2cr64\n- 申請表：https://docs.google.com/forms/d/1AGjmuaDiQUnwSk88MloVrt2VaCYToPdFk20Tm9kPbbY/viewform?edit_requested=true`;
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

        // 2.5 取得 FAB DAO FIP 里程碑脈絡
        const fipContext = getFipContext(userPrompt);

        // 2.6 依問題取得 FAB DAO 工作組脈絡
        const groupContext = getGroupContext(userPrompt);

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
                    const archiveCandidates = [
                        path.join(__dirname, 'data', 'archive', `${appId}_full.txt`),
                        path.join(__dirname, 'data', 'archive', `${appId}_full.md`)
                    ];
                    const arcPath = archiveCandidates.find(candidate => fs.existsSync(candidate));
                    if (arcPath) {
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
                    content: `${baseSystemContent}\n\n### 組織背景資訊(必須優先參考):\n${orgContext}\n\n### FAB DAO 里程碑文件資料庫(必須優先參考):\n${fipContext}\n\n### FAB DAO 工作組資料庫(依問題載入):\n${groupContext}\n\n### 實時資料庫內容：\n${databaseContext}`
                },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });

        let replyContent = completion.choices[0].message.content;
        replyContent = ensureGrantSources(userPrompt, replyContent);

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
