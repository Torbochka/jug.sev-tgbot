import { TelegrafContext } from 'telegraf/typings/context';
import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import Prismic from 'prismic-javascript';
import {
  EventDocument,
  getEventByName,
  getEventDocument,
  getEventSpeakers,
  getSpeakerDescriptions,
  getSpeakerNames,
  getSpeakerTitles,
  getYoutubeCodes
} from '../utils';

export const eventMiddleware = async (ctx: TelegrafContext) => {
  const data = ctx?.callbackQuery?.data;

  if (!data) {
    return ctx.reply('Что-то пошло не так...');
  }

  let api: ResolvedApi = await Prismic.api(process.env.API_ENDPOINT || '');
  const eventDocument: EventDocument | undefined = await getEventDocument(api);

  if (!eventDocument) {
    return ctx.reply('Что-то пошло не так...');
  }
  const { type, data: eventName } = JSON.parse(data);

  if (type === 'events') {
    const event: Event | undefined = getEventByName(eventName, eventDocument);

    if (event) {
      const speakers: Speaker[] = getEventSpeakers(event);
      const titles: string[] = getSpeakerTitles(speakers);
      const names: string[] = getSpeakerNames(speakers);
      const descriptions: string[] = getSpeakerDescriptions(speakers);
      const codes: string[] = getYoutubeCodes(speakers);

      for (let i = 0; i < speakers.length; i++) {
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

          await ctx.replyWithMarkdown(description, { parse_mode: 'Markdown' });
        } catch (e) {
          console.error(e);
        }
      }

      return;
    }
  }

  return ctx.reply('Что-то пошло не так...');
};
