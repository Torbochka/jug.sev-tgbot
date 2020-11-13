import { config } from 'dotenv';
import { Telegraf } from 'telegraf';
import { startCommand } from './commands/start';
import { eventsMiddleware } from './middlewares/events';
import { eventMiddleware } from './middlewares/event';

config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');

/**
 * Commands
 */
bot.start(startCommand);

/**
 * Handlers
 */
bot.hears('Встречи', eventsMiddleware);
bot.on('callback_query', eventMiddleware);

bot.launch();
