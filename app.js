// 根据 NODE_ENV 加载相应的 .env 文件
const nodeEnv = process.env.NODE_ENV || 'development';
const {join} = require("path");
require('dotenv').config({
  path: join(__dirname, `.env.${nodeEnv}`),
});
const TelegramBot = require('node-telegram-bot-api');
const baiduTTS = require('./baidu-tts');
const token = process.env.TELEGRAM_TOKEN;
class BotManager {

  constructor(bot) {
    this.bot = bot;
  }


  doHelp(msg) {
    const bot = this.bot;
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'hello,just send my any text');
  }

  doSpeak(msg) {
    const bot = this.bot;
    const chatId = msg.chat.id;
    baiduTTS(msg.text).then(res => {
      bot.sendAudio(chatId, res);
    }).catch(err => {
      bot.sendMessage(chatId, `sorry, something wrong\n${err.message}`);
    });
  }

  init() {
    /**
     * 除了回复的消息及指令信息外，视为关键词进行GitHub issue检索
     */
    bot.on('message', async (msg) => {
      if (msg.text.match(/\/(help|start)$/)) {
        return this.doHelp(msg);
      }
      return this.doSpeak(msg);
    });
  }
}

const bot = new TelegramBot(token, {
  polling: true
});

new BotManager(bot).init();
