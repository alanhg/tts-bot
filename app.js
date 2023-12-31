// 根据 NODE_ENV 加载相应的 .env 文件
const TelegramBot = require('node-telegram-bot-api');
const openaiTTS = require('./openai-tts');
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

  async doSpeak(msg) {
    const bot = this.bot;
    const chatId = msg.chat.id;
    const sended = await bot.sendMessage(chatId, '正在生成语音文件⏳...');
    openaiTTS(msg.text).then(res => {
      bot.editMessageText('音频生成完毕', {
        chat_id: chatId,
        message_id: sended.message_id
      });
      bot.sendAudio(chatId, res);
    }).catch(err => {
      bot.editMessageText(`音频生成出错\n${err.message}`, {
        chat_id: chatId,
        message_id: sended.message_id
      });
    });
  }

  init() {
    /**
     * 除了回复的消息及指令信息外，视为关键词进行GitHub issue检索
     */
    bot.on('message', async (msg) => {
      if (msg.text?.match(/\/(help|start)$/)) {
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
