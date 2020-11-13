import { TelegrafContext } from 'telegraf/typings/context';
import { Markup } from 'telegraf';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import Prismic from 'prismic-javascript';
import { CallbackButton, InlineKeyboardButton } from 'telegraf/typings/markup';
import {
  EventDocument,
  getEventDocument,
  getEventNames,
  splitArray
} from '../helpers/helpers';

export const eventsMiddleware = async ({ reply }: TelegrafContext) => {
  let api: ResolvedApi = await Prismic.api(process.env.API_ENDPOINT || '');
  const eventDocument = await getEventDocument(api);

  if (eventDocument) {
    const events: string[] | undefined = await getEventNames(
      <EventDocument>eventDocument
    );

    if (events) {
      const buttons = events.map<CallbackButton>((eventName: string) => {
        return Markup.callbackButton(
          eventName,
          `{"type": "events", "data": "${eventName}"}`
        );
      });

      const inlineKeyboardButton = splitArray<InlineKeyboardButton>(buttons, 2);

      return reply(
        'Предыдущие встречи',
        Markup.inlineKeyboard(inlineKeyboardButton).oneTime().resize().extra()
      );
    }
  }

  return reply('Что-то пошло не так...');
};
