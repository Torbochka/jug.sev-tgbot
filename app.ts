import { config } from 'dotenv';
import Prismic from 'prismic-javascript';
import { Markup, Telegraf } from 'telegraf';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import ApiSearchResponse from 'prismic-javascript/types/ApiSearchResponse';
import { Document } from 'prismic-javascript/types/documents';
import { KeyboardButton } from 'telegraf/typings/markup';

config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');
let api: ResolvedApi;

bot.start(async ({ reply }) => {
  api = await Prismic.api('https://jug-sev.prismic.io/api/v2');
  console.log(api);

  return reply(
    '🤟Встречи',
    Markup.keyboard(['🤟Встречи']).oneTime().resize().extra()
  );
});

const splitArray = (array: String[], chunks: number): String[][] => {
  const subarray = [];
  for (let i = 0; i < Math.ceil(array.length / chunks); i++) {
    subarray[i] = array.slice(i * chunks, i * chunks + chunks);
  }
  return subarray;
};

bot.hears('🤟Встречи', async ({ reply }) => {
  const eventDocument = await getEventDocument(api);
  if (eventDocument) {
    const events = await getEventNames(<EventDocument>eventDocument);
    const keyboardButton = splitArray(events, 2);

    return reply(
      'Предыдущие встречи',
      // TODO нужно приводить к типу?
      Markup.keyboard(<KeyboardButton[][]>keyboardButton)
        .oneTime()
        .resize()
        .extra()
    );
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

const getEventNames = (document: EventDocument): String[] | [] => {
  const events: Event[] = document.data.body;

  if (Array.isArray(events) && !events.length) {
    return [];
  }

  return events.map((event: Event) => {
    return event.primary['meeting-title'][0].text;
  });
};
