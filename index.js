async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);
  const channelUsername = "@bjsbotmaket"; // Replace with your actual channel username

  // Function to check if the user is a member of the channel
  const checkMembership = async (ctx) => {
    try {
      const chatMember = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
      return ['member', 'administrator', 'creator'].includes(chatMember.status);
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  };

  bot.start(async (ctx) => {
    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nI can Download Files from Terabox.\n\nMade with ❤️ by @Shahil44\n\nBefore you can use the bot, please join our channel:`,
        Markup.inlineKeyboard([
          Markup.button.url("Join Channel", "https://t.me/bjsbotmaker"),
        ])
      );
    } catch (e) {
      console.error(e);
    }
  });

  bot.on("message", async (ctx) => {
    if (ctx.message && ctx.message.text) {
      // Check if user is a member of the channel
      const isMember = await checkMembership(ctx);
      
      if (!isMember) {
        return ctx.reply(
          `Please join our channel first to use the bot.`,
          Markup.inlineKeyboard([
            Markup.button.url("Join Channel", "https://t.me/bjsbotmaker"),
            Markup.button.callback("Joined ✅", "check_join")
          ])
        );
      }

      const messageText = ctx.message.text;
      if (
        messageText.includes("terabox.com") ||
        messageText.includes("teraboxapp.com")
      ) {
        const details = await getDetails(messageText);
        if (details && details.direct_link) {
          try {
            ctx.reply(`Sending Files Please Wait.!!`);
            sendFile(details.direct_link, ctx);
          } catch (e) {
            console.error(e); // Log the error for debugging
          }
        } else {
          ctx.reply('Something went wrong 🙃');
        }
        console.log(details);
      } else {
        ctx.reply("Please send a valid Terabox link.");
      }
    }
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
