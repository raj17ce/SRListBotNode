const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const config = require('./config.js');
const service = require('./service.js');

const bot = new Telegraf(config.BOT_TOKEN);

bot.start((ctx) => {
    service.emptyAlert(ctx.update.message.from.id);
    ctx.reply(`Hey ${ctx.chat.first_name}, The Bot is started. Forward all the alerts.`);
});

bot.help((ctx) => {
    ctx.reply("/start\t\t- Start the Bot\n/help\t\t- Get help in using the Bot\n/list\t\t- Get the list for forwarded alerts\n/close\t\t- Close the Bot");
});

bot.command("close", (ctx) => {
    service.emptyAlert(ctx.update.message.from.id);
    ctx.reply("The Bot is closed. use /start command to start again.");
});

bot.command("list", async (ctx) => {
    if (service.alerts[ctx.update.message.from.id] === undefined) {
        ctx.reply("Please forward alerts to get the List.");
    }
    else {
        let response = await service.getList(ctx.update.message.from.id);
        ctx.reply(response);
    }
});

bot.on(message('sticker'), (ctx) => {
    ctx.reply('✅');
});

bot.on(message('text'), (ctx) => {
    service.appendAlert(ctx.update.message.from.id, ctx.update.message.text);
});

bot.launch();