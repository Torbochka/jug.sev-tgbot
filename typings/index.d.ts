declare interface Size {
  width: number;
  height: number;
}

declare interface Photo {
  dimensions: Size;
  alt?: string;
  copyright?: string;
  url: string;
}

declare interface Heading<T> {
  type: T;
  text: string;
  spans: [];
}

declare type Heading1 = Heading<'heading1'>[];
declare type Paragraph = Heading<'paragraph'>[];

declare interface Speaker {
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

declare interface Metting {
  'meeting-title': Heading1;
  'meeting-description': Paragraph;
  'section-report-title': Heading1;
  'reports-list': Paragraph;
  anchor: Heading1;
}

declare interface Event {
  slice_type: 'event';
  slice_label?: string;
  items: Speaker[];
  primary: Metting;
}

declare interface EventDataDocument {
  title: Heading1;
  description: Paragraph;
  body: Event[];
}
