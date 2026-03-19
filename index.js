require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const cron = require('node-cron');
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

function getPrompt(fileName) {
    const filePath = path.join(__dirname, 'prompts', fileName);
    return fs.readFileSync(filePath, 'utf8');
}

// --- 訊息處理邏輯 ---
client.on('messageCreate', async (message) => {
    // 偵錯用：看看機器人有沒有聽到聲音
    console.log(`收到訊息 [${message.author.tag}]: ${message.content}`);

    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        const userPrompt = message.content.replace(/<@!\d+>/g, '').trim();
        
        try {
            const systemContent = getPrompt('happy_rat.txt');
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemContent },
                    { role: "user", content: userPrompt }
                ],
            });
            message.reply(completion.choices[0].message.content);
        } catch (error) {
            console.error("錯誤:", error);
            message.reply("抱歉，我現在連不上大腦...");
        }
    }
});

client.once('ready', () => {
    console.log(`✅ 快樂鼠機器人已上線：${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
