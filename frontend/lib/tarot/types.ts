import allCards from '@/data/tarot-cards.json';

export type TarotCard = typeof allCards[number];

export type Interpretation = {
  todayMessage: string;
  relationships: string;
  workStudies: string;
  personalGrowth: string;
  reflectionQuestion: string;
  affirmation: string;
};

export type DailyCardResult = {
  card: TarotCard;
  isReversed: boolean;
  isNew: boolean;
};
