import { BRAND } from '../../shared/poster-spec.js';

// Subject-specific English copy. Verified service descriptions come from the catalogue;
// the phrase banks only add introductory and closing language, never prices, guarantees,
// horoscope predictions or claims about a report.
const OPENERS = {
  Services: [
    'Discover a considered, priest-reviewed reading',
    'Explore a Vedic resource prepared with care',
    'Learn more about a personalised reading',
    'A clear introduction to a traditional Vedic service',
    'A considered resource from our Chennai studio',
    'An invitation to explore a Vedic tradition',
    'A measured look at a personal reading',
  ],
  Festivals: [
    'Warm wishes for a day of tradition and togetherness',
    'Celebrating light, colour and shared moments',
    'A thoughtful festival greeting',
    'Sending best wishes for the occasion',
    'A greeting for everyone celebrating',
    'Marking the day with gratitude and joy',
    'Tradition, colour and companionship today',
  ],
  'Hindu deities': [
    'A devotional greeting with reverence',
    'Honouring a timeless tradition',
    'With devotion and warm wishes',
    'A moment of reflection and gratitude',
    'An offering of respect and warm wishes',
    'Remembering a story told across generations',
    'A quiet greeting with reverence',
  ],
  'Special days': [
    'A thoughtful note for a day worth remembering',
    'Sending encouragement and warm wishes',
    'A small reminder of what matters',
    'Together in marking this occasion',
    'A note of thanks on a meaningful day',
    'Celebrating people who make a difference',
    'Warm thoughts for you and your community',
  ],
};
const CLOSERS = {
  Services: [
    'Visit our website to read the full service details.',
    'Find the complete service information on our website.',
    'Explore the service at your own pace on our website.',
    'Full details are available on our website.',
    'Read the service information on our website.',
  ],
  Festivals: [
    'May the day bring warmth to you and your family.',
    'Wishing you a meaningful and joyful celebration.',
    'From our studio to yours, warm wishes for today.',
    'May the celebration bring people closer.',
    'Warm wishes for a memorable day.',
  ],
  'Hindu deities': [
    'With reverence, from the ASTRO SIVAM studio.',
    'May the day carry a sense of calm and gratitude.',
    'Offered with respect and warm wishes.',
    'With a calm and grateful heart.',
    'Warm wishes on this devotional occasion.',
  ],
  'Special days': [
    'From all of us at ASTRO SIVAM, warm wishes.',
    'Today is a good day to say it clearly.',
    'With appreciation and best wishes from our studio.',
    'Sending our warmest regards.',
    'Today, we celebrate together from afar.',
  ],
};

export function createDailyCopy(topic, definition = {}, date = new Date()) {
  const day = new Date(date).toISOString().slice(0, 10);
  const category = OPENERS[topic.category] ? topic.category : 'Special days';
  // Two coprime counters give a 48-day cycle with no repeated opener/closer pairing.
  const dayNumber = Math.floor(new Date(day).getTime() / 86400000);
  const openers = OPENERS[category];
  const closerBank = CLOSERS[category];
  const opener = openers[dayNumber % openers.length];
  const closer = closerBank[Math.floor(dayNumber / openers.length) % closerBank.length];
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
