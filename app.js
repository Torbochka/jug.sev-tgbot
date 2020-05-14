require('dotenv').config();
const axios = require('./axios');
const { Telegraf } = require('telegraf');

const Markup = require('telegraf/markup');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(Telegraf.log());

bot.start(({ reply }) => {
  return reply(
    '🤟Встречи',
    Markup.keyboard(['🤟Встречи']).oneTime().resize().extra()
  );
});

bot.hears('🤟Встречи', ({ reply }) => {
  return reply(
    'Предыдущие встречи',
    Markup.keyboard([
      ['Встреча 1', 'Встреча 2'],
      ['Встреча 3', '📞Встреча 4']
    ])
      .oneTime()
      .resize()
      .extra()
  );
});

bot.launch();

const getMeetups = () => {
  return [];
};
