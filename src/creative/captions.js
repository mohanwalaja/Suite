import { BRAND } from '../../shared/poster-spec.js';
import { hash32 } from './uniqueness.js';

// Subject-specific English copy. Verified service descriptions come from the catalogue;
// the phrase banks only add introductory and closing language, never prices, guarantees,
// horoscope predictions or claims about a report.
const OPENERS = {
  Services: [
    'Discover a considered, priest-reviewed reading',
    'Explore a Vedic resource prepared with care',
    'Learn more about a personalised reading',
    'A clear introduction to a traditional Vedic service',
  ],
  Festivals: [
    'Warm wishes for a day of tradition and togetherness',
    'Celebrating light, colour and shared moments',
    'A thoughtful festival greeting',
    'Sending best wishes for the occasion',
  ],
  'Hindu deities': [
    'A devotional greeting with reverence',
    'Honouring a timeless tradition',
    'With devotion and warm wishes',
    'A moment of reflection and gratitude',
  ],
  'Special days': [
    'A thoughtful note for a day worth remembering',
    'Sending encouragement and warm wishes',
    'A small reminder of what matters',
    'Together in marking this occasion',
  ],
};
const CLOSERS = {
  Services: [
    'Visit our website to read the full service details.',
    'Find the complete service information on our website.',
    'Explore the service at your own pace on our website.',
  ],
  Festivals: [
    'May the day bring warmth to you and your family.',
    'Wishing you a meaningful and joyful celebration.',
    'From our studio to yours, warm wishes for today.',
  ],
  'Hindu deities': [
    'With reverence, from the ASTRO SIVAM studio.',
    'May the day carry a sense of calm and gratitude.',
    'Offered with respect and warm wishes.',
  ],
  'Special days': [
    'From all of us at ASTRO SIVAM, warm wishes.',
    'Today is a good day to say it clearly.',
    'With appreciation and best wishes from our studio.',
  ],
};
const pick = (list, seed) => list[Number.parseInt(hash32(seed), 16) % list.length];

export function createDailyCopy(topic, definition = {}, date = new Date()) {
  const day = new Date(date).toISOString().slice(0, 10);
  const key = `${topic.id}|${definition.id || ''}|${day}`;
  const category = OPENERS[topic.category] ? topic.category : 'Special days';
  const opener = pick(OPENERS[category], key + ':open');
  const closer = pick(CLOSERS[category], key + ':close');
  const description = String(topic.description || '').trim();
  const url = `${BRAND.website}${topic.path && topic.path !== '/' ? topic.path : ''}`;
  const caption = topic.category === 'Services'
    ? `${opener}: ${description}\n\n${closer}\n\nExplore ${topic.name} at ${url}.`
    : `${opener}. ${description}\n\n${closer}\n\nWith warm wishes,\n${BRAND.name} · ${BRAND.website}`;
  const tags = ['AstroSivam', ...(topic.tags || []), definition.directionId || '']
    .filter(Boolean)
    .map((t) => String(t).replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  const hashtags = [...new Set(tags)].slice(0, 12).map((t) => '#' + t).join(' ');
  return { caption, hashtags, day };
}
