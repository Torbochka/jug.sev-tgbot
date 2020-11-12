import { config } from 'dotenv';
import Prismic from 'prismic-javascript';
import { Markup, Telegraf } from 'telegraf';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import ApiSearchResponse from 'prismic-javascript/types/ApiSearchResponse';
import { Document } from 'prismic-javascript/types/documents';
import { CallbackButton, InlineKeyboardButton } from 'telegraf/typings/markup';
import { TelegrafContext } from 'telegraf/typings/context';
import { splitArray } from './utils';

config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');

bot.start(async ({ reply }) => {
  return reply(
    'Встречи',
    Markup.keyboard(['Встречи']).oneTime().resize().extra()
  );
});

bot.hears('Встречи', async ({ reply }) => {
  let api: ResolvedApi = await Prismic.api(process.env.API_ENDPOINT || '');
  const eventDocument = await getEventDocument(api);

  if (eventDocument) {
    const events: string[] = await getEventNames(<EventDocument>eventDocument);
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

  return reply('Что-то пошло не так...');
});

bot.on('callback_query', async (ctx: TelegrafContext) => {
  const data = ctx?.callbackQuery?.data;

  if (data) {
    let api: ResolvedApi = await Prismic.api(process.env.API_ENDPOINT || '');
    const eventDocument: EventDocument | undefined = await getEventDocument(
      api
    );

    if (eventDocument) {
      const { type, data: eventName } = JSON.parse(data);

      if (type === 'events') {
        const event: Event | undefined = getEventByName(
          eventName,
          eventDocument
        );

        if (event) {
          await ctx.answerCbQuery();

          const speakers = getEventSpeakers(event);
          const titles: string[] = getSpeakerTitles(speakers);
          const names: string[] = getSpeakerNames(speakers);
          const descriptions: string[] = getSpeakerDescriptions(speakers);
          const codes: string[] = getYoutubeCodes(speakers);

          for (let i = 0; i < titles.length; i++) {
            try {
              const name: string = names[i];
              const title: string = titles[i];
              const desc: string = descriptions[i];
              const code: string = codes[i];
              const description: string = [
                `*${title}*\n\n`,
                `_${name}_\n\n`,
                `${desc}\n`,
                `https://youtu.be/${code}`
              ].join('');

              await ctx.replyWithMarkdown(description);
            } catch (e) {
              console.log(e);
            }
          }

          return;
        }
      }
    }
  }

  return ctx.reply('Что-то пошло не так...');
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
  return event?.items || [];
};

const getSpeakerTitles = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['report-title'][0].text);
};

const getSpeakerNames = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['speaker-name'][0].text);
};

const getSpeakerDescriptions = (speakers: Speaker[]): string[] => {
  return speakers.map(
    (speaker: Speaker) => speaker['report-description'][0].text
  );
};

const getYoutubeCodes = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['youtube-code'][0].text);
};
