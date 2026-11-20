import { DEITIES, deityTopics } from './art/deities.js';
import fonts from './fonts.json' with { type: 'json' };
export { fonts };
import { wishes } from './art/wishes.js';
import { modelFor } from './art/models.js';
import { BRAND, PORTRAIT } from '../shared/poster-spec.js';
export const SITE = BRAND.site;
export const WORD_POSTER_IDS = new Set(['free-beta', 'priest-busy', 'priest-team-ready']);
const service = (id, name, eyebrow, tagline, description, path, tags) => ({
  id,
  name,
  category: 'Services',
  eyebrow,
  tagline,
  description,
  path,
  tags,
  wordPoster: WORD_POSTER_IDS.has(id),
});
export const services = [
  service(
    'birth',
    'Birth Jathagam',
    'Personalized Vedic reading',
    'Your stars. Your story.',
    'Discover your Rasi and Navamsa charts, planetary periods, and life themes in a personalized Birth Jathagam. Prepared by our Vedic priest team in Chennai and delivered as a PDF in English, Tamil, or Hindi.',
    '/birth-jathagam',
    ['BirthJathagam', 'VedicAstrology', 'BirthChart'],
  ),
  service(
    'marriage',
    'Marriage Compatibility',
    'The art of Vedic matching',
    'Two charts. A shared journey.',
    'Explore the classical 10 Poruthams, Rajju and Vedha checks, and Kuja Dosha in a priest-reviewed comparison of two birth charts.',
    '/marriage-compatibility',
    ['MarriageCompatibility', 'Porutham', 'VedicAstrology'],
  ),
  service(
    'naming',
    'Baby Naming',
    'Vedic Namakaranam',
    'A meaningful name. A beautiful beginning.',
    'Find auspicious starting syllables and meaningful names based on your baby’s birth nakshatra and pada, with a personalized naming certificate.',
    '/baby-naming',
    ['BabyNaming', 'Namakaranam', 'Nakshatra'],
  ),
  service(
    'muhurtham',
    'Subha Muhurtham',
    'Auspicious beginnings',
    'A considered moment for a new beginning.',
    'Explore a six-month calendar of auspicious dates for your ceremony, with Panchangam, Nalla Neram, and Tara Balam checks.',
    '/muhurtham',
    ['SubhaMuhurtham', 'AuspiciousDates', 'Panchangam'],
  ),
  service(
    'bhava',
    'Bhava Jathagam',
    'The twelve houses',
    'Explore every house of your horoscope.',
    'Read all twelve bhavas in detail, with house strengths and a planetary timeline, in the Bhava edition of your Jathagam.',
    '/bhava-jathagam',
    ['BhavaJathagam', 'VedicHoroscope', 'TwelveHouses'],
  ),
  service(
    'varga',
    'Varga Jathagam',
    'Focused Vedic insight',
    'A closer reading of your chosen life theme.',
    'Discover focused divisional-chart guidance with the Varga Jathagam edition, prepared from your birth details.',
    '/varga-jathagam',
    ['VargaJathagam', 'DivisionalCharts', 'VedicAstrology'],
  ),
  service(
    'rasi',
    'Rasi Palan',
    'Free Vedic resource',
    'Guidance for all twelve Moon signs.',
    'Explore free daily, weekly, monthly, and yearly Rasi Palan for all twelve Moon signs, based on sidereal planetary positions.',
    '/rasipalan',
    ['RasiPalan', 'MoonSign', 'VedicAstrology'],
  ),
  service(
    'panchangam',
    'Daily Panchangam',
    'The Vedic almanac',
    'Find the rhythm of your day.',
    'See the day’s tithi, nakshatra, sunrise, and auspicious windows in the free Thirukanitha Panchangam for your location.',
    '/panjangam',
    ['Panchangam', 'Thirukanitha', 'VedicCalendar'],
  ),
  service(
    'nakshatra',
    'Rasi & Nakshatra',
    'Free birth-star finder',
    'Discover your Moon sign and birth star.',
    'Use your birth details to find your Rasi, Nakshatra, and running Mahadasha with ASTRO SIVAM’s free Vedic tools.',
    '/',
    ['Nakshatra', 'Rasi', 'BirthStar'],
  ),
  service(
    'porutham',
    'Porutham Check',
    'Free compatibility tool',
    'An introduction to ten-star matching.',
    'Try the free 10-Porutham star match, then explore a detailed marriage compatibility report from the Chennai Vedic priest team.',
    '/',
    ['Porutham', 'StarMatching', 'VedicAstrology'],
  ),
  service(
    'free-beta',
    'Free Beta',
    'Explore the tools',
    'Try the ASTRO SIVAM free beta.',
    'Explore the ASTRO SIVAM free beta tools and see how our Vedic services work before you decide.',
    '/',
    ['FreeBeta', 'VedicTools', 'AstroSivam'],
  ),
  service(
    'priest-busy',
    'Your Priest Is Busy',
    'A note from our team',
    'Your priest is busy. We are here to help.',
    'When your priest is busy, the ASTRO SIVAM priest team is ready to guide you with your Vedic questions.',
    '/',
    ['PriestTeam', 'VedicGuidance', 'HereToHelp'],
  ),
  service(
    'priest-team-ready',
    'Priest Team Ready',
    'Here to help',
    'Our priest team is ready to help you.',
    'Our ASTRO SIVAM priest team is ready to help you with your Vedic questions and service choices.',
    '/',
    ['PriestTeam', 'ReadyToHelp', 'VedicGuidance'],
  ),
];
const festivals =
  `Diwali|Pongal|Holi|Ganesh Chaturthi|Navaratri|Onam|Maha Shivaratri|Makar Sankranti|Dussehra|Durga Puja|Krishna Janmashtami|Raksha Bandhan|Tamil Puthandu|Ugadi|Gudi Padwa|Vishu|Baisakhi|Lohri|Rongali Bihu|Magh Bihu|Chhath Puja|Karthigai Deepam|Thaipusam|Akshaya Tritiya|Rama Navami|Hanuman Jayanti|Guru Purnima|Karva Chauth|Dhanteras|Bhai Dooj|Govardhan Puja|Saraswati Puja|Ayudha Puja|Varalakshmi Vratam|Aadi Perukku|Mahavir Jayanti|Buddha Purnima|Guru Nanak Jayanti|Eid al-Fitr|Eid al-Adha|Christmas|Easter|Good Friday|Mahalaya|Attukal Pongala|Thrissur Pooram|Bonalu|Bathukamma|Hartalika Teej|Gangaur|Losar|Hornbill Festival|Wangala|Nuakhai|Parsi New Year|Nag Panchami|Vasant Panchami|Vishu Kani|Skanda Sashti|Vaikunta Ekadashi|Aadi Pooram|Thai Pongal|Mattu Pongal|Kaanum Pongal|Bhogi|Ratha Yatra|Teej|Gowri Habba|Bandi Chhor Divas|Kali Puja|Margazhi|Paryushana|Ladakh Festival|Sangai Festival|Chapchar Kut|Moatsu|Karam|Cheti Chand|Ambubachi Mela|Eid-e-Milad`.split(
    '|',
  );
const days =
  `Mother’s Day|Father’s Day|Teachers’ Day|Women’s Day|Children’s Day|Independence Day|Republic Day|International Yoga Day|New Year’s Day|World Environment Day|Friendship Day|Grandparents’ Day|International Day of Families|World Health Day|Earth Day|National Youth Day|National Science Day|Doctors’ Day|Engineers’ Day|Labour Day|Constitution Day|Gandhi Jayanti|Valentine’s Day|International Day of Peace|World Book Day|World Music Day|International Literacy Day|World Mental Health Day|National Sports Day|World Students’ Day|World Kindness Day|International Men’s Day|National Education Day|World Heritage Day|National Girl Child Day|National Handloom Day|International Mother Language Day|World Water Day|International Day of Happiness|World Art Day|National Technology Day|World Photography Day|International Nurses Day|World Senior Citizens Day`.split(
    '|',
  );
const greetings = {
  Diwali: [
    'A festival of light',
    'May every light bring a little more joy.',
    'May the glow of the diyas fill your home with warmth, peace, and togetherness. Wishing you and your family a joyful Diwali.',
  ],
  Pongal: [
    'Harvest blessings',
    'Gratitude for the harvest. Joy for the year.',
    'Celebrating the sun, the harvest, and the hands that nourish us. Iniya Pongal Nalvazhthukkal!',
  ],
  Holi: [
    'The festival of colors',
    'Color your day with joy.',
    'Here’s to the colors of friendship, laughter, and new memories. Wishing you a joyful Holi.',
  ],
  'Mother’s Day': [
    'With love & gratitude',
    'For the love that guides us.',
    'To the mothers and mother figures whose care shapes our lives: thank you for every small kindness and every steady word. Happy Mother’s Day.',
  ],
  'Father’s Day': [
    'With love & gratitude',
    'For the strength that stands beside us.',
    'Celebrating fathers and father figures for their patience, care, and quiet encouragement. Happy Father’s Day.',
  ],
  'Teachers’ Day': [
    'Honoring our teachers',
    'For those who light the way.',
    'To every teacher who turns curiosity into understanding: thank you for helping us grow. Happy Teachers’ Day.',
  ],
  'Good Friday': [
    'A day of reflection',
    'In remembrance and reflection.',
    'Wishing you a meaningful Good Friday filled with reflection and peace.',
  ],
  'Gandhi Jayanti': [
    'In remembrance',
    'A moment for truth and peace.',
    'Honoring the ideals of truth, nonviolence, and compassion this Gandhi Jayanti.',
  ],
};
export function makeOccasion(name, category = 'Special days') {
  const wish = wishes.get(name);
  const base = Object.hasOwn(greetings, name)
    ? greetings[name]
    : [
        category === 'Festivals' ? 'Festival greetings' : 'A day to remember',
        wish ||
          (category === 'Festivals'
            ? 'Tradition, togetherness, and warm wishes.'
            : 'A moment to reflect and celebrate.'),
        wish
          ? `${name} · ${wish}`
          : `Marking ${name} with warmth and togetherness. Sending our best wishes to you and your community.`,
      ];
  return {
    id: `${category === 'Festivals' ? 'fest' : 'day'}-${name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')}`,
    name,
    category,
    eyebrow: base[0],
    tagline: base[1],
    description: base[2],
    path: '/',
    tags: [
      name.replace(/[^\p{L}\p{N}]/gu, ''),
      category === 'Festivals' ? 'FestivalGreetings' : 'SpecialDays',
      'Togetherness',
    ],
  };
}
export const categories = ['Services', 'Festivals', DEITIES, 'Special days'];
export const topics = [
  ...services,
  ...festivals.map((n) => makeOccasion(n, 'Festivals')),
  ...days.map((n) => makeOccasion(n)),
  ...deityTopics,
];
const names = [
  'Celestial Gold',
  'Ivory Mandala',
  'Midnight Moon',
  'Lotus Blush',
  'Temple Heritage',
  'Festive Ember',
  'Sandalwood',
  'Emerald Script',
  'Astral Ink',
  'Rose Garden',
  'Royal Orrery',
  'Sunlit Petals',
  'Lunar Almanac',
  'Botanical Muse',
  'Gilded Sanctuary',
  'Marigold Light',
  'Copper Etching',
  'Banyan Grove',
  'Stellar Atlas',
  'Peony Paper',
  'Antique Zodiac',
  'Pearl Filigree',
  'Blue Nocturne',
  'Lotus Letterpress',
  'Sacred Arches',
  'Amber Flame',
  'Ochre Archive',
  'Jade Pavilion',
  'Violet Orbit',
  'Morning Blossom',
  'Star Chronicle',
  'Ivory Heirloom',
  'Moonlit Poetry',
  'Floral Classic',
  'Temple Scroll',
  'Lantern Glow',
  'Golden Folio',
  'Forest Verse',
  'Indigo Horizon',
  'Pink Parchment',
  'Modern Cosmos',
  'Pure Geometry',
  'Lunar Minimal',
  'Petal Studio',
  'Temple Modern',
  'Saffron Studio',
  'Desert Lines',
  'Emerald Form',
  'Cosmic Outline',
  'Blush Edition',
];
const swatches = [
  ['#3e233c', '#cba366', '#f8edda'],
  ['#f6ead4', '#bb965d', '#553e29'],
  ['#192846', '#a5bce9', '#f5e9cf'],
  ['#e6beb3', '#9b646a', '#542c34'],
  ['#1b4940', '#c0a564', '#eee0bf'],
  ['#5a262b', '#e9a85a', '#fbeac9'],
  ['#d9bd95', '#8b623c', '#4f3728'],
  ['#1e4c4a', '#acbda1', '#f2e6ca'],
  ['#2b264c', '#a69ac6', '#f6e9d8'],
  ['#e4cbc2', '#9d7167', '#4b332e'],
];
// The legacy IDs now identify reusable palette/font choices, never background pictures.
const editionInks = [null, '#875a45', '#827092', '#b7996c', '#457f82'];
function editionPalette(colors, edition) {
  if (!edition) return [...colors];
  return colors.map((color, i) => {
    const amount = [0.27, 0.32, 0.16][i];
    const mix = [1, 3, 5].map((n) =>
      Math.round(
        parseInt(color.slice(n, n + 2), 16) * (1 - amount) +
          parseInt(editionInks[edition].slice(n, n + 2), 16) * amount,
      ),
    );
    return '#' + mix.map((v) => v.toString(16).padStart(2, '0')).join('');
  });
}
export const styles = names.map((name, id) => ({
  id,
  name,
  font: fonts[id],
  colors: editionPalette(swatches[id % 10], Math.floor(id / 10)),
  light: [1, 3, 6, 9].includes(id % 10),
}));
export const paletteOptions = [
  { name: 'Royal plum', colors: swatches[0] },
  { name: 'Midnight blue', colors: swatches[2] },
  { name: 'Forest jade', colors: swatches[4] },
  { name: 'Terracotta', colors: ['#884b3d', '#e3b48c', '#fff1dd'] },
  { name: 'Rose quartz', colors: swatches[3] },
];
export function getPalette(design) {
  if (design.palette >= 0 && design.palette < paletteOptions.length) {
    return { ...paletteOptions[design.palette], light: design.palette === 4 };
  }
  const custom = styles[design.palette - paletteOptions.length];
  if (custom) return custom;
  const model = modelFor(design.topic, design.styleId);
  return {
    name: model.theme[0].toUpperCase() + model.theme.slice(1) + ' ink',
    colors: model.colors,
    light: model.light,
  };
}
const aliases = {
  Diwali: 'Deepavali Deepawali',
  'Tamil Puthandu': 'Tamil New Year Varusha Pirappu',
  Dussehra: 'Vijayadashami Dasara',
  Navaratri: 'Navratri',
  'Maha Shivaratri': 'Mahashivratri Shivratri',
  'Krishna Janmashtami': 'Gokulashtami Krishna Jayanthi',
  'Eid al-Fitr': 'Ramzan Eid ul Fitr',
  'Eid al-Adha': 'Bakrid Eid ul Adha',
  'Birth Jathagam': 'Janma Kundali Kundli horoscope jathakam jadagam jadhagam',
  'Marriage Compatibility': 'Kundli matching Porutham matrimonial',
  'Baby Naming': 'Namakaranam Namakaran',
  'Subha Muhurtham': 'Auspicious dates muhurat',
  'Rasi Palan': 'Rashifal horoscope',
  'Daily Panchangam': 'Panjangam Panchang',
  'Teachers’ Day': 'Teacher Day',
  'Women’s Day': 'International Womens Day',
};
export const normalizeSearch = (s) =>
  String(s)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[’'‘]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
export const matchesTopic = (t, q) =>
  normalizeSearch(
    [
      t.name,
      t.hindi || '',
      t.aliases || '',
      t.eyebrow,
      Object.hasOwn(aliases, t.name) ? aliases[t.name] : '',
    ].join(' '),
  ).includes(normalizeSearch(q));
const serviceClosing = (topic) =>
  topic.wordPoster
    ? `Save this note and share it with someone who needs it.\nExplore ${topic.name} at ${BRAND.website}.`
    : `Explore ${topic.name} at ${BRAND.website}${topic.path === '/' ? '' : topic.path}. Ask questions, compare the details, and choose what suits you.`;
export const createCopy = (topic) => ({
  caption:
    topic.category === 'Services'
      ? `${topic.tagline}\n\n${topic.description}\n\n${serviceClosing(topic)}`
      : `${topic.description}\n\nWith warm wishes,\n${BRAND.name} · ${BRAND.website}`,
  hashtags: [
    'AstroSivam',
    ...topic.tags,
    ...(topic.category === 'Services' ? ['VedicGuidance', 'PriestTeam'] : []),
  ]
    .filter((t, i, all) => all.indexOf(t) === i)
    .map((t) => '#' + t)
    .join(' '),
});
// Use the same design for the picture card and the editor after it is tapped. Choosing a
// picture for the current subject preserves its edited copy and independently chosen font.
export function withPicture(d, topic, model) {
  return {
    ...d,
    ...(topic.id === d.topic.id
      ? {}
      : { topic, headline: undefined, tagline: undefined, ...createCopy(topic) }),
    styleId: model.id,
    font: d.font === fonts[d.styleId % fonts.length] ? fonts[model.id % fonts.length] : d.font,
  };
}
export function newDesign(topic = services[0]) {
  return {
    topic,
    styleId: 0,
    font: styles[0].font,
    palette: -1,
    format: PORTRAIT.id,
    ...createCopy(topic),
  };
}
