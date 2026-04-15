const { Telegraf } = require('telegraf');
const { handleAIRequest } = require('./logic'); // 🧠 呼叫與 Discord 相同的大腦
require('dotenv').config();

// 初始化 Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
console.log("目前的 Token 檢查:", process.env.TELEGRAM_TOKEN ? "已讀取" : "未讀取");

// 管理員白名單 (Telegram 使用者名稱，不含 @)
const WHITE_LIST = ['swiftevo']; 

bot.on('text', async (ctx) => {
    if (ctx.from.is_bot) return; // 忽略來自其他機器人的訊息

    // 取得發言者的資訊
    const username = ctx.from.username || ctx.from.first_name;
    const userPrompt = ctx.message.text;

    // 判斷是否為白名單成員
    const isReviewer = WHITE_LIST.includes(username);

    console.log(`[Telegram] 收到來自 @${username} 的訊息: ${userPrompt}`);

    try {
        // 在 Telegram 頂部顯示「正在輸入...」的狀態
        await ctx.sendChatAction('typing');

        // 🧠 將邏輯外包給 logic.js 處理
        const response = await handleAIRequest(userPrompt, isReviewer);

        // 回覆訊息 (建議使用預設格式，避免 Markdown 語法解析錯誤導致發不出訊息)
        await ctx.reply(response);

    } catch (error) {
        console.error("❌ Telegram 運行出錯：", error);
        await ctx.reply("哎呀，我的 Telegram 接收器有點問題，請稍後再試！");
    }
});

// 啟動機器人
bot.launch({
    allowedUpdates: ['message'], // 🌟 只監聽訊息，減少伺服器負擔
}).then(() => {
    console.log("🚀 Telegram 快樂鼠已成功連接至伺服器！");
}).catch((err) => {
    console.error("❌ Telegram 啟動失敗:", err);
});

// 優雅停機處理 (防止程式強制關閉導致錯誤)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
