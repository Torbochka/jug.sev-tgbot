import ResolvedApi from 'prismic-javascript/types/ResolvedApi';
import Prismic from 'prismic-javascript';
import ApiSearchResponse from 'prismic-javascript/types/ApiSearchResponse';
import { Document } from 'prismic-javascript/types/documents';

export const splitArray = <T>(array: T[], chunks: number): T[][] => {
  const subarray = [];
  for (let i = 0; i < Math.ceil(array.length / chunks); i++) {
    subarray[i] = array.slice(i * chunks, i * chunks + chunks);
  }
  return subarray;
};

export const getEventDocument = async (
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

    return <EventDocument>apiSearchResponse.results[0];
  } catch (e) {
    console.error(e);
  }

  return undefined;
};

export interface EventDocument extends Document {
  type: 'events';
  data: EventDataDocument;
}

export const getEventNames = (
  document: EventDocument
): string[] | undefined => {
  const events: Event[] | undefined = document.data?.body;
  return (
    events &&
    events.map((event: Event) => event.primary['meeting-title'][0].text)
  );
};

export const getEventByName = (
  eventName: string,
  document: EventDocument
): Event | undefined => {
  const events: Event[] = document.data?.body;

  return (
    events &&
    events.find(
      (event: Event) => event.primary['meeting-title'][0].text === eventName
    )
  );
};

export const getEventSpeakers = (event: Event): Speaker[] => {
  return event?.items || [];
};

export const getSpeakerTitles = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['report-title'][0].text);
};

export const getSpeakerNames = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['speaker-name'][0].text);
};

export const getSpeakerDescriptions = (speakers: Speaker[]): string[] => {
  return speakers.map(
    (speaker: Speaker) => speaker['report-description'][0].text
  );
};

export const getYoutubeCodes = (speakers: Speaker[]): string[] => {
  return speakers.map((speaker: Speaker) => speaker['youtube-code'][0].text);
};
