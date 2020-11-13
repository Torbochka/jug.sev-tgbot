import { Markup } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';

export const startCommand = async ({ reply }: TelegrafContext) => {
  return reply(
    'Встречи',
    Markup.keyboard(['Встречи']).oneTime().resize().extra()
  );
};
