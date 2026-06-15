// 為了讓 Render 保持運行而加入的簡易伺服器
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Happy Rat is running!\n');
}).listen(port, () => {
  console.log(`Web server listening on port ${port}`);
});

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

async function safeReply(message, content) {
    try {
        await message.reply(content);
    } catch (replyError) {
        console.error("❌ Discord reply failed:", {
            code: replyError.code,
            status: replyError.status,
            message: replyError.message,
            channelId: message.channelId,
            guildId: message.guildId
        });
    }
}

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
            await safeReply(message, response);

        } catch (error) {
            console.error("❌ 快樂鼠運行出錯：", error);
            await safeReply(message, "哎呀，我的腦袋打結了（讀取資料或 API 出錯），請稍後再試！");
        }
    }
});

// 啟動 Discord
client.login(process.env.DISCORD_TOKEN);

// --- 啟動 Telegram ---
require('./telegram.js');
