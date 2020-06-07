import { config } from 'dotenv';
import Prismic from 'prismic-javascript';
import { Markup, Telegraf } from 'telegraf';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import ApiSearchResponse from 'prismic-javascript/types/ApiSearchResponse';
import { Document } from 'prismic-javascript/types/documents';

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

bot.hears('🤟Встречи', async ({ reply }) => {
  const eventDocument = await getEventDocument(api);
  if (eventDocument && isEventDocument(eventDocument)) {
    console.log(await getEventNames(<EventDocument>eventDocument));

    const events = await getEventNames(<EventDocument>eventDocument);

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
  }
});

bot.launch();

export interface Photo {
  dimensions: {
    width: number;
    height: number;
  };
  alt?: string;
  copyright?: string;
  url: string;
}

export interface Heading<T> {
  type: T;
  text: string;
  spans: [];
}

type Heading1 = Heading<'heading1'>[];
type Paragraph = Heading<'paragraph'>[];
export interface Speaker {
  'speaker-photo': Photo;
  'speaker-photo-second': Photo | {};
  'speaker-photo-third': Photo | {};
  'report-title': Heading1;
  'speaker-name': Heading1;
  'speaker-name-second': Heading1;
  'speaker-name-third': Heading1;
  'report-description': Paragraph;
  'youtube-code': Heading1;
  'youtube-code-2': Heading1;
  'youtube-code-3': Heading1;
  'anchor-report-section': Heading1;
}

export interface Metting {
  'meeting-title': Heading1;
  'meeting-description': Paragraph;
  'section-report-title': Heading1;
  'reports-list': Paragraph;
  anchor: Heading1;
}

export interface Event {
  slice_type: 'event';
  slice_label?: string;
  items: Speaker[];
  primary: Metting;
}

export interface EventDataDocument {
  title: Heading1;
  description: Paragraph;
  body: Event[];
}

export interface EventDocument extends Document {
  type: 'events';
  data: EventDataDocument;
}

const getEventDocument = async (
  api: ResolvedApi
): Promise<Document | undefined> => {
  try {
    const queryForGetEvents = await Prismic.Predicates.at(
      'document.type',
      'events'
    );

    const apiSearchResponse: ApiSearchResponse = await api.query(
      queryForGetEvents,
      { lang: 'ru' }
    );
    return apiSearchResponse.results[0];
  } catch (e) {
    console.error(e);
  }
};

function isEventDocument(document: Document): document is EventDocument {
  return document.type === "events";
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
