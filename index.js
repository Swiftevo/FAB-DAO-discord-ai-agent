require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');const fs = require('fs');
const path = require('path');
const { handleAIRequest } = require('./logic');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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
            // 確認使用者是否有管理員權限
            const isReviewer = message.member?.roles.cache.some(role => role.name === REVIEWER_ROLE_NAME) || false;

            // 🧠 將邏輯外包給 logic.js 處理
            const response = await handleAIRequest(userPrompt, isReviewer);

            // 回傳結果
            await message.reply(response);

        } catch (error) {
            console.error("❌ 快樂鼠運行出錯：", error);
            await message.reply("哎呀，我的腦袋打結了（讀取資料或 API 出錯），請稍後再試！");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
