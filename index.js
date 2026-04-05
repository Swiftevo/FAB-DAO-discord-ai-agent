require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 讀取 Prompt 設定檔的函式
function getPrompt(fileName) {
    const filePath = path.join(__dirname, 'prompts', fileName);
    return fs.readFileSync(filePath, 'utf8');
}

client.once('ready', () => {
    console.log(`✅ 快樂鼠機器人已上線：${client.user.tag}`);
});

// --- 訊息處理邏輯 ---
client.on('messageCreate', async (message) => {
    console.log(`收到訊息 ID: ${message.id} | 作者: ${message.author.tag} | 是Bot: ${message.author.bot}`);
    if (message.author.bot) return;

    // 只有在提到機器人時才觸發回應
    if (message.mentions.has(client.user)) {
        console.log(`收到來自 [${message.author.tag}] 的召喚: ${message.content}`);
        
        // 移除 Mention 標籤，取得純文字指令
        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();
        const REVIEWER_ROLE_NAME = "行動客廳小組";

        try {
            // 1. 取得基本個性設定
            const baseSystemContent = getPrompt('happy_rat.txt');

            // 2. 初始化動態資料庫 (databaseContext)
            let databaseContext = "";

            // --- 第一層：讀取摘要 (固定載入) ---
            const summaryPath = path.join(__dirname, 'data', 'summary.json');
            if (fs.existsSync(summaryPath)) {
                const summaryData = fs.readFileSync(summaryPath, 'utf8');
                databaseContext += `\n【目前所有申請案摘要】：\n${summaryData}\n`;
            }

            // --- 第二層：偵測專案 ID (提到 APP_XXX 才載入細節) ---
            const appIdMatch = userPrompt.match(/APP_\d+/i);
            if (appIdMatch) {
                const appId = appIdMatch[0].toUpperCase();
                const recordPath = path.join(__dirname, 'data', 'records', `${appId}.json`);
                
                if (fs.existsSync(recordPath)) {
                    const record = fs.readFileSync(recordPath, 'utf8');
                    databaseContext += `\n【${appId} 里程碑細節】：\n${record}\n`;
                }

                // --- 第三層：權限檢查（查看原始檔案） ---
                if (userPrompt.includes("查看原始檔案") || userPrompt.includes("深度分析")) {
                    const isReviewer = message.member.roles.cache.some(role => role.name === REVIEWER_ROLE_NAME);
                    
                    if (isReviewer) {
                        const arcPath = path.join(__dirname, 'data', 'archive', `${appId}_full.txt`);
                        if (fs.existsSync(arcPath)) {
                            const fullText = fs.readFileSync(arcPath, 'utf8');
                            databaseContext += `\n【管理員授權：${appId} 原始全文內容】：\n${fullText}\n`;
                            return await message.reply(`🔍 **權限確認**：已為您調閱 ${appId} 原始全文：\n\n${fullText.substring(0, 1500)}...`);
                        }
                    } else {
                        return message.reply(`❌ **存取失敗**：查看原始檔案僅限「${REVIEWER_ROLE_NAME}」成員使用。`);
                    }
                }
            }

            // 3. 呼叫 OpenAI API
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: `${baseSystemContent}\n\n實時資料庫內容：\n${databaseContext}` 
                    },
                    { role: "user", content: userPrompt }
                ],
            });

            // 4. 回傳 AI 答案
            await message.reply(completion.choices[0].message.content);

        } catch (error) {
            console.error("❌ 快樂鼠運行出錯：", error);
            await message.reply("哎呀，我的腦袋打結了（讀取資料或 API 出錯），請稍後再試！");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
