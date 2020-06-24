import { config } from 'dotenv';
import Prismic from 'prismic-javascript';
import { Markup, Telegraf } from 'telegraf';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import ApiSearchResponse from 'prismic-javascript/types/ApiSearchResponse';
import { Document } from 'prismic-javascript/types/documents';
import { CallbackButton, InlineKeyboardButton } from 'telegraf/typings/markup';
import { TelegrafContext } from 'telegraf/typings/context';

config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');
let api: ResolvedApi;

bot.start(async ({ reply }) => {
  api = await Prismic.api('https://jug-sev.prismic.io/api/v2');

  return reply(
    'Встречи',
    Markup.keyboard(['Встречи']).oneTime().resize().extra()
  );
});

const splitArray = <T>(array: T[], chunks: number): T[][] => {
  const subarray = [];
  for (let i = 0; i < Math.ceil(array.length / chunks); i++) {
    subarray[i] = array.slice(i * chunks, i * chunks + chunks);
  }
  return subarray;
};

bot.hears('Встречи', async ({ reply }) => {
  const eventDocument = await getEventDocument(api);

  if (eventDocument) {
    const events: string[] = await getEventNames(<EventDocument>eventDocument);
    const buttons = events.map<CallbackButton>((eventName: string) =>
      Markup.callbackButton(eventName, eventName)
    );

    const inlineKeyboardButton = splitArray<InlineKeyboardButton>(buttons, 2);

    return reply(
      'Предыдущие встречи',
      Markup.inlineKeyboard(inlineKeyboardButton).oneTime().resize().extra()
    );
  }

  return reply('Что-то пошло не так...');
});

bot.on('callback_query', async (ctx: TelegrafContext) => {
  const messageText = 'Предыдущие встречи';

  if (
    ctx.callbackQuery &&
    ctx.callbackQuery.message &&
    ctx.callbackQuery.message.text &&
    ctx.callbackQuery.message.text === messageText &&
    ctx.callbackQuery.data
  ) {
    const eventDocument = await getEventDocument(api);
    if (eventDocument) {
      const event = getEventByName(ctx.callbackQuery.data, eventDocument);
      if (event) {
        const speakers = getEventSpeakers(event);
        const titles: string[] = getSpeakerTitles(speakers);
        const buttons = titles.map<CallbackButton>((title: string) => {
          return Markup.callbackButton(title, '');
        });

        const inlineKeyboardButton = splitArray<InlineKeyboardButton>(
          buttons,
          1
        );

        console.log(inlineKeyboardButton);

        return ctx.reply(
          'Доклады',
          Markup.inlineKeyboard(inlineKeyboardButton).oneTime().resize().extra()
        );
      }
    }

    return ctx.reply('Что-то пошло не так...');
  }
});

bot.launch();

const getEventDocument = async (
  api: ResolvedApi
): Promise<EventDocument | undefined> => {
  try {
    const queryForGetEvents = await Prismic.Predicates.at(
      'document.type',
      'events'
    );

    const apiSearchResponse: ApiSearchResponse = await api.query(
      queryForGetEvents,
      { lang: 'ru' }
    );

    // TODO что делать с undefined?
    return <EventDocument>apiSearchResponse.results[0];
  } catch (e) {
    console.error(e);
  }
};

export interface EventDocument extends Document {
  type: 'events';
  data: EventDataDocument;
}

const getEventNames = (document: EventDocument): string[] => {
  // if (!document.data.hasOwnProperty('body')) {
  //   return undefined;
  // }

  const events: Event[] = document.data.body;

  return events.map((event: Event) => {
    return event.primary['meeting-title'][0].text;
  });
};

const getEventByName = (
  eventName: string,
  document: EventDocument
): Event | undefined => {
  // if (!document.data.hasOwnProperty('body')) {
  //   return undefined;
  // }

  const events: Event[] = document.data.body;

  return events.find(
    (event: Event) => event.primary['meeting-title'][0].text === eventName
  );
};

const getEventSpeakers = (event: Event): Speaker[] => {
  return event.items;
};

const getSpeakerTitles = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['report-title'][0].text);
};
