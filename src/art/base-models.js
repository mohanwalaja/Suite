import { DEITIES, paintings, paintingsOf } from './deities.js';
import { occasionBrief } from './briefs.js';
import { ALT_PLATES, DEITY_IN_PLATE, DETAIL_PLATES, PLATES, plateFor } from './plates.js';
// Model IDs remain stable for saved posters. Each row is an illustration brief, not a tint.
// title | focal illustration (or @photograph) | composition | supporting element | optional setting
const rows = (text) =>
  text
    .trim()
    .split('\n')
    .map((line) => line.trim().split('|'));
const birth = rows(`
Palm-leaf Rasi|rasi|atlas|palm-leaf|birth-manuscript
The Navamsa Folio|chart-pair|window|stylus
Nakshatra Atlas|stations|cameo|moon
The Astrologer’s Desk|@birth-astrologer|cover|inkwell
Nine Grahas|grahas|gallery|stars
Vimshottari Almanac|dasha|window|hourglass
Diamond Kundali|north-chart|seal|compass
Twelve Bhavas|houses|column|palm-leaf
A Lunar Cycle|phases|window|lotus
The Observatory|@birth-observatory|gallery|sundial
Lagna at Dawn|horizon|arch|compass
The Zodiac Dial|sign-ring|seal|stars
Rasi Blueprint|rasi:blueprint|ledger|ruler
Graha Orbits|orbits|atlas|sun
The House Register|house-folio|gallery|stylus
Sandglass & Dasa|hourglass|column|dasha
The Brass Quadrant|quadrant|arch|stars
The Scribe’s Tools|inkwell|stationery|palm-leaf
North & South|regional-charts|window|compass
Horoscope Seal|chart-seal|stationery|rasi
`);
const signs = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
];
const planets = ['Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'];
const layouts = [
  'atlas',
  'arch',
  'seal',
  'window',
  'column',
  'cameo',
  'ledger',
  'gallery',
  'stationery',
  'canopy',
];
signs.forEach((s, i) =>
  birth.push([`${s} Sign Study`, `sign:${i}`, layouts[(i + 2) % 10], `rasi:${i + 1}`]),
);
planets.forEach((p, i) =>
  birth.push([`${p} Graha Plate`, `planet:${i}`, layouts[(i + 3) % 10], 'orbits']),
);
birth.push(
  ...rows(`
The Four Padas|padas|ledger|stations
Celestial Longitude|meridian|seal|quadrant
The Janma Compass|compass|column|rasi
The Sidereal Map|sky-map|window|horizon
The Natal Ephemeris|almanac|stationery|grahas
Moon & Birth Star|star-moon|arch|stations
Palm-leaf Archive|palm-leaf|canopy|inkwell
The Solar Gnomon|sundial|gallery|sun
The Chart Cabinet|chart-cabinet|atlas|chart-seal
`),
);
const marriage = rows(`
The Wedding Thali|@wedding-thali|cover|lotus
Jasmine Maalai|@wedding-garlands|arch|rose
Two Birth Charts|chart-pair:match|window|rings
Under the Mandapam|@wedding-ceremony|gallery|garland
The Silk Knot|silk-knot|atlas|jasmine
Wedding Invitation|invite|stationery|wax-seal
Temple Bell Duet|bells|canopy|mango-leaves
Intertwined Gold|rings|seal|rose
Garland Exchange|garlands|column|jasmine
The Ten Poruthams|poruthams|window|stars
Paired Kalashas|kalash-pair|gallery|lotus
The Gold Pendant|thali|cameo|silk-knot
The Bangle Casket|bangles|stationery|jewellery-box
Henna Ceremony|henna|arch|rose
Mango-leaf Mandap|mandap|window|mango-leaves
The Sacred Fire|havan|gallery|lotus
Seven Steps|seven-steps|ledger|havan
Thamboolam Offering|betel-tray|atlas|jasmine
Heirloom Jewellery|jewellery-box|column|bangles
A Pair of Letters|letters|stationery|rings
`);
const checks = [
  'Dina',
  'Gana',
  'Mahendra',
  'Sthree Deergha',
  'Yoni',
  'Rasi',
  'Rasi Adhipati',
  'Vasya',
  'Rajju',
  'Vedha',
];
const checkArt = [
  'sun',
  'rosettes',
  'sprout',
  'horizon',
  'peacocks',
  'sign-ring',
  'grahas',
  'rings',
  'braid',
  'star-path',
];
checks.forEach((n, i) =>
  marriage.push([`${n} Porutham`, checkArt[i], layouts[(i + 1) % 10], `check:${i}`]),
);
marriage.push(
  ...rows(`
Peacock Court|peacocks|canopy|garland
The Lotus Pond|lotus-pond|window|rings
Twin Conches|conches|seal|lotus
Kanchipuram Silks|silk-folds|column|thali
Oonjal Ceremony|swing|arch|garlands
Nadaswaram Ensemble|music|gallery|bells
Brass Lamp Procession|deepam|ledger|jasmine
The Jasmine Canopy|floral-canopy|canopy|bells
Rose & Sandalwood|sandal-tray|stationery|rose
The Wedding Fan|palm-fan|column|silk-folds
Turmeric Blessings|turmeric|atlas|betel-tray
Kumkum Caskets|kumkum|seal|lotus
Auspicious Toran|toran|window|kalash
The Bridal Necklace|necklace|arch|rose
Woven Gift Baskets|basket|gallery|betel-tray
The Matching Folio|match-folio|stationery|chart-pair:match
Twin Star Paths|star-path|ledger|rings
The Wedding Album|album|cameo|garlands
Temple Threshold|doorway|column|deepam
The Union Emblem|wedding-seal|seal|silk-knot
`),
);
const naming = rows(`
Jasmine Cradle|@naming-cradle|cover|star-mobile
First Little Steps|@naming-first-steps|gallery|booties
The Rice-writing Tray|@naming-rice|arch|stylus
Silver Anklets|anklets|seal|jasmine
The First Rattle|rattle|column|ribbon
Letter Keepsakes|letter-cards|stationery|star-moon
A Name to Treasure|certificate|window|wax-seal
Four Birth Padas|padas|ledger|stars
Moon & Star Mobile|star-mobile|canopy|cloud
The Little Elephant|elephant|atlas|blocks
Honey Bear|bear|arch|ribbon
Velvet Rabbit|rabbit|cameo|sprout
Knitted Booties|booties|stationery|footprints
The Muslin Bundle|swaddle|arch|moon
Nursery Crescent|moon-cushion|seal|cloud
The Ribbon Scroll|name-scroll|window|ribbon
Hands of Welcome|hands|cameo|sprout
Silver Spoon|baby-bowl|column|rattle
Embroidered Initial|hoop|seal|sprout
Wooden Letter Blocks|blocks|ledger|elephant
Rocking Horse|horse|window|star-mobile
Little Duckling|duck|gallery|ribbon
Paper Boat Lullaby|boat|atlas|cloud
Stacking Rings|stacker|column|blocks
The Spinning Top|spinning-top|cameo|ribbon
Nursery Express|train|window|cloud
Bird on Wheels|pull-bird|gallery|stars
The Patchwork Quilt|quilt|window|moon
Welcome Bunting|bunting|canopy|blocks
The Brass Cradle|cradle|arch|jasmine
Baby’s Keepsake Box|keepsake-box|stationery|anklets
First Footprints|footprints|gallery|letter-cards
The Family Tree|family-tree|atlas|ribbon
Birth-star Garden|star-flower|seal|stations
The Cloud Cradle|cloud-cradle|canopy|star-mobile
The Nursery Book|storybook|column|moon
Stitched Star Pillow|star-pillow|cameo|quilt
The Little Lamb|lamb|arch|sprout
Counting Beads|abacus|ledger|blocks
Felt Balloon|balloon|canopy|cloud
Name Announcement|name-card|stationery|footprints
The Paper Pinwheel|pinwheel|atlas|ribbon
Jasmine Nameplate|nameplate|window|jasmine
The Bamboo Basket|baby-basket|gallery|rabbit
A Tiny Handprint|handprint|seal|ribbon
Little Lantern|lantern|arch|star-moon
The Toy Shelf|toy-shelf|window|bear
The Welcome Wreath|wreath|cameo|letter-cards
A Starry Ribbon|star-ribbon|column|footprints
The Naming Album|baby-album|stationery|cradle
`);

// Topic-specific studies for the remaining seven services. A varying reference diagram is part
// of the illustration itself (e.g. highlighted bhava, divisional-chart label or lunar station).
const mansionNames =
  'Ashwini|Bharani|Krittika|Rohini|Mrigashira|Ardra|Punarvasu|Pushya|Ashlesha|Magha|Purva Phalguni|Uttara Phalguni|Hasta|Chitra|Swati|Vishakha|Anuradha|Jyeshtha|Mula|Purva Ashadha|Uttara Ashadha|Shravana|Dhanishtha|Shatabhisha|Purva Bhadrapada|Uttara Bhadrapada|Revati'.split(
    '|',
  );
const divs = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];
const extend = (intro, rest) => [...intro, ...rest].slice(0, 50);
const numbered = (n, make) => Array.from({ length: n }, (_, i) => make(i));
const bhava = extend(
  [
    ['House Map', 'houses', 'atlas', 'rasi'],
    ['The Bhava Folio', 'house-folio', 'window', 'stylus'],
  ],
  [
    ...numbered(12, (i) => [
      `Bhava ${i + 1} · House Study`,
      `houses:${i + 1}`,
      layouts[i % 10],
      `north-chart:${i + 1}`,
    ]),
    ...numbered(12, (i) => [
      `Bhava ${i + 1} · Chart Record`,
      `north-chart:${i + 1}`,
      layouts[(i + 4) % 10],
      `houses:${i + 1}`,
    ]),
    ...birth.map((r) => [r[0] + ' · Bhava', r[1], r[2], 'houses', r[4]]),
  ],
);
const varga = extend(
  [
    ['Divisional Diptych', 'regional-charts', 'window', 'palm-leaf'],
    ['Navamsa Register', 'division:9', 'ledger', 'stylus'],
  ],
  [
    ...divs.map((d, i) => [`D${d} Divisional Plate`, `division:${d}`, layouts[i % 10], 'quadrant']),
    ...divs.map((d, i) => [
      `D1 & D${d} Comparison`,
      `chart-pair:${d}`,
      layouts[(i + 5) % 10],
      'palm-leaf',
    ]),
    ...birth.map((r) => [r[0] + ' · Varga', r[1], r[2], 'division:9', r[4]]),
  ],
);
const rasi = extend(
  [
    ['The Moon-sign Wheel', 'sign-ring', 'atlas', 'moon'],
    ['Twelve Lunar Houses', 'rasi', 'arch', 'phases'],
  ],
  [
    ...signs.map((s, i) => [s + ' Emblem', `sign:${i}`, layouts[i % 10], `rasi:${i + 1}`]),
    ...signs.map((s, i) => [s + ' Sign Map', `rasi:${i + 1}`, layouts[(i + 3) % 10], `sign:${i}`]),
    ...signs.map((s, i) => [s + ' Moon Study', 'star-moon', layouts[(i + 6) % 10], `sign:${i}`]),
    ...birth.slice(2),
  ],
);
const nakshatra = extend(
  [
    ['Birth-star Atlas', 'stations', 'atlas', 'star-moon'],
    ['The Pada Compass', 'padas', 'seal', 'compass'],
  ],
  [
    ...mansionNames.map((n, i) => [
      n + ' Station',
      `stations:${i + 1}`,
      layouts[i % 10],
      `sign:${Math.floor((i * 4) / 9)}`,
    ]),
    ...birth.slice(5),
  ],
);
const panchangam = extend(
  rows(`
Sunrise Almanac|almanac|atlas|horizon
The Lunar Fortnight|phases|window|moon
Solar Shadow|sundial|column|sun
Five Calendar Limbs|five-limbs|ledger|palm-leaf
Temple Dawn|horizon|gallery|doorway
The Day Register|calendar|stationery|stylus
`),
  [
    ...numbered(30, (i) => [
      `${i < 15 ? 'Shukla' : 'Krishna'} · Tithi ${(i % 15) + 1}`,
      `tithi:${i + 1}`,
      layouts[i % 10],
      i % 2 ? 'almanac' : 'sundial',
    ]),
    ...birth,
  ],
);
const muhurtham = rows(`
Copper Kalasha|@muhurtham-kalasha|cover|mango-leaves
The Auspicious Calendar|calendar|stationery|kalash
Griha Pravesam|doorway|arch|kalash
Ceremony at Dawn|horizon|window|deepam
The Six-month Register|six-months|ledger|stylus
Temple Bells|bells|canopy|toran
The Ritual Lamp|deepam|gallery|lotus
Auspicious Threshold|kolam|seal|mango-leaves
The Wedding Mandap|mandap|window|garlands
The Tithi Dial|tithi:5|cameo|calendar
First Letters|letter-cards|stationery|inkwell
The Naming Cradle|cradle|canopy|kalash
First Rice|rice-tray|gallery|baby-bowl
The Betel Offering|betel-tray|atlas|calendar
Sacred Fire|havan|window|sandal-tray
The Lunar Fortnight|phases|seal|calendar
Ceremony Invitations|invite|stationery|kalash
A New Foundation|blueprint|ledger|kalash
The Merchant’s Folio|book|column|coins
Wedding Garlands|garlands|arch|thali
Housewarming Toran|toran|canopy|doorway
The Day’s Five Limbs|five-limbs|ledger|sundial
The Birth-star Dial|stations|seal|betel-tray
The Hora Instrument|sundial|column|calendar
Auspicious Lagna|rasi:blueprint|atlas|horizon
Seeking a Date|hourglass|cameo|six-months
Flower Offerings|basket|gallery|kalash
The Nut & Leaf Tray|turmeric|stationery|mango-leaves
Four Padas|padas|window|moon
Nakshatra & Tithi|stations:4|ledger|tithi:3
The Ritual Spoon|baby-bowl|gallery|grain
The Ceremonial Swing|swing|arch|garland
The Wedding Steps|seven-steps|atlas|deepam
The Chosen Hour|quadrant|column|six-months
A Palm-leaf Record|palm-leaf|stationery|calendar
The Griha Lamp|diya|cameo|doorway
Aksharabhyasam|inkwell|window|rice-tray
First Learning|storybook|column|letter-cards
A Date in Writing|name-scroll|stationery|stylus
The Jasmine Canopy|floral-canopy|canopy|bells
Heritage Threshold|temple-gate|gallery|kalash
The Moonrise Window|star-moon|arch|horizon
Music at the Ceremony|music|window|mandap
The Family Gathering|family-tree|gallery|kalash
Thali & Almanac|thali|atlas|almanac
The Silver Conch|conches|seal|deepam
New Beginnings|sprout|cameo|six-months
Two Kalashas|kalash-pair|canopy|garland
The Auspicious Seal|wax-seal|stationery|betel-tray
Ceremonial Calendar|almanac|ledger|temple-gate
`);
const porutham = extend(
  [
    ['Ten-fold Match', 'poruthams', 'window', 'chart-pair:match'],
    ['The Paired Horoscope', 'chart-pair:match', 'atlas', 'stars'],
  ],
  [
    ...checks.map((c, i) => [c + ' Match Plate', `check:${i}`, layouts[i % 10], checkArt[i]]),
    ...marriage,
  ],
);
// Pure typographic notice posts: many independent word-led layouts, no borrowed artwork.
const wordPosterRows = (label) =>
  Array.from({ length: 50 }, (_, i) => [
    `${label} · ${String(i + 1).padStart(2, '0')}`,
    `word:${i % 6}`,
    layouts[i % layouts.length],
    'letters',
    null,
    i,
  ]);
const services = {
  birth,
  marriage,
  naming,
  bhava,
  varga,
  rasi,
  nakshatra,
  panchangam,
  muhurtham,
  porutham,
  'free-beta': wordPosterRows('Free Beta'),
  'priest-busy': wordPosterRows('Priest Is Busy'),
  'priest-team-ready': wordPosterRows('Priest Team Ready'),
};
const serviceInfo = {
  birth: [
    'Natal chart atelier',
    'Rasi charts, planetary studies & palm-leaf folios',
    'Rasi · Navamsa · Planetary periods',
    'Consult your birth chart',
  ],
  marriage: [
    'Wedding atelier',
    'Wedding rituals, paired charts & heirloom invitations',
    '10 Poruthams · Two birth charts',
    'Explore your match',
  ],
  naming: [
    'Naming atelier',
    'Cradles, first keepsakes & birth-star stationery',
    'Birth star · Starting syllables · Names',
    'Discover a name',
  ],
  bhava: [
    'House studies',
    'Twelve-house diagrams & annotated horoscope plates',
    'Twelve bhavas · House strengths',
    'Explore the twelve houses',
  ],
  varga: [
    'Divisional chart studio',
    'D1–D60 reference plates & chart comparisons',
    'Divisional charts · Focused guidance',
    'Explore a divisional reading',
  ],
  rasi: [
    'Moon-sign studio',
    'Twelve sign emblems & lunar illustrations',
    'Twelve rasis · Moon-sign guidance',
    'Find your Rasi Palan',
  ],
  nakshatra: [
    'Birth-star studio',
    'Lunar stations, pada divisions & star maps',
    '27 nakshatras · Four padas',
    'Find your birth star',
  ],
  panchangam: [
    'Almanac studio',
    'Lunar days, solar instruments & calendar illustrations',
    'Tithi · Nakshatra · Daily timings',
    'Read the almanac',
  ],
  muhurtham: [
    'Ceremony atelier',
    'Auspicious calendars, kalashas & ceremony settings',
    'Ceremony planning · Auspicious dates',
    'Explore suitable dates',
  ],
  porutham: [
    'Matching studio',
    'Two-chart studies & the ten classical checks',
    'Ten checks · Star matching',
    'Try the Porutham check',
  ],
  'free-beta': [
    'Free beta notes',
    'Plain word posters about exploring the beta tools',
    'Free beta · Vedic tools',
    'Explore the beta',
  ],
  'priest-busy': [
    'Priest availability notes',
    'Plain word posters for when your priest is busy',
    'Priest team · Here to help',
    'We are here to help',
  ],
  'priest-team-ready': [
    'Priest team notes',
    'Plain word posters about our ready-to-help priest team',
    'Priest team · Vedic guidance',
    'Ask our priest team',
  ],
};

// A devotional picture is a real, registered painting. Poster models may reuse a source
// with different typography, ritual objects and compositions; those are not extra pictures.
const motifNames = {
  'mother-child': 'Mother & Child',
  'parent-child': 'Hand in Hand',
  'star-moon': 'Crescent Moon',
  'color-bowls': 'Bowls of Gulal',
  deepam: 'Brass Lamp',
  'pongal-pot': 'Harvest Pot',
  pookalam: 'Flower Carpet',
  'olive-branch': 'Olive Branch',
  rakhi: 'Rakhi Thread',
  rasi: 'Rasi Chart',
  'betel-tray': 'Betel Offering',
  'star-pillow': 'Stitched Star',
  horizon: 'First Light',
  chakra: 'Ashoka Chakra',
};
const motifName = (id) =>
  motifNames[id] ||
  id
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
const paintedNames = {
  ...Object.fromEntries(Object.entries(paintings).map(([k, v]) => [k, v[0]])),
  ...Object.fromEntries(Object.entries(PLATES)),
  'mothers-day-garden': 'Jasmine in Her Hair',
  'fathers-day-kite': 'Learning to Fly',
  'teachers-day-classroom': 'A Moment of Discovery',
};
const dayStudies = {
  'Mother’s Day': [
    ['A Bedtime Story', 'story:mother-book', 'star-mobile', 'window'],
    ['In the Garden', 'story:mother-garden', 'sprout', 'gallery'],
    ['The Family Photograph', 'story:mother-photo', 'album', 'stationery'],
    ['Flowers for Amma', 'story:mother-flowers', 'letters', 'arch'],
    ['On the Veranda', 'story:mother-swing', 'rose', 'canopy'],
  ],
  'Father’s Day': [
    ['A Story Together', 'story:father-book', 'storybook', 'window'],
    ['The Kite Lesson', 'story:father-kite', 'spool', 'atlas'],
    ['Seeds for Tomorrow', 'story:father-garden', 'sprout', 'column'],
    ['A Family Photograph', 'story:father-photo', 'letters', 'stationery'],
    ['Under the Banyan', 'story:father-swing', 'family-tree', 'canopy'],
  ],
  'Teachers’ Day': [
    ['At the Blackboard', 'story:teacher-board', 'pencils', 'gallery'],
    ['A World to Explore', 'story:teacher-globe', 'globe', 'window'],
    ['A Page Together', 'story:teacher-book', 'quill', 'arch'],
    ['In the Science Room', 'story:teacher-science', 'microscope', 'ledger'],
    ['Thank You, Teacher', 'story:teacher-flowers', 'letters', 'stationery'],
  ],
};
function occasionRows(topic) {
  const brief = occasionBrief(topic),
    { motifs, gods, setting } = brief;
  const out = [];
  const add = (...row) => out.push(row);
  if (brief.personal) {
    const photos = topic.photos || [];
    if (!photos.length) throw Error('This collection has no device pictures.');
    return numbered(50, (i) => {
      const pic = photos[i % photos.length],
        j = Math.floor(i / photos.length),
        layout = layouts[(i + j) % layouts.length];
      return [
        `${pic.label} · ${String(i + 1).padStart(2, '0')}`,
        '@local-' + pic.id,
        layout,
        motifs[i % 8],
      ];
    });
  }
  // Festival pictures are led by the deities in its own brief, not by a generic festival
  // theme. For example, don't borrow the Annapurna painting for Shivaratri simply because
  // Shiva is also present in it. Personal collections only use their supplied files above.
  const photos = brief.standalone
    ? brief.paintings
    : [
        ...new Set(
          [setting, ...gods.flatMap((g) => paintingsOf(g, { leadOnly: true }))].filter(Boolean),
        ),
      ];
  const devotionalPhotos = photos.filter((p) => Object.hasOwn(paintings, p));
  // Subjects with no historical or devotional picture receive one original, individually
  // painted plate. It is a real rendered artwork, not a placeholder or a renamed duplicate.
  const plate = photos.length || devotionalPhotos.length ? null : plateFor(topic);
  for (const [i, photo] of photos.entries()) {
    const layout =
      paintings[photo]?.[3] === 'whole' ? 'folio' : ['cover', 'gallery', 'arch'][i % 3];
    add(paintedNames[photo], '@' + photo, layout, motifs[i % 8]);
  }
  for (const [title, key, element, layout] of dayStudies[topic.name] || [])
    add(title, key, layout, element);
  const index = out.length;
  for (let i = 0; out.length < 50; i++) {
    const k = i % 8,
      n = Math.floor(i / 8),
      a = motifs[k],
      b = motifs[(k + 1 + n) % 8];
    const scene = ['Portrait', 'Duet', 'Garland', 'Vignette', 'Keepsake', 'Study', 'Emblem'][n];
    const picture = devotionalPhotos.length ? devotionalPhotos[i % devotionalPhotos.length] : plate;
    add(`${motifName(a)} ${scene}`, a, layouts[(k * 3 + n * 2 + index) % 10], b, picture, n);
  }
  return out;
}
const inks = {
  teal: ['#123d39', '#dab574', '#fcf1db'],
  ivory: ['#f5ead6', '#a3773d', '#493529'],
  cobalt: ['#23375f', '#b8cbea', '#f9f0d9'],
  rose: ['#f4d9d0', '#a96567', '#502e3a'],
  jade: ['#235144', '#d3bd7b', '#fff0cd'],
  wine: ['#522337', '#ddb275', '#fff2df'],
  sand: ['#e7d1a8', '#986643', '#4c3729'],
  moss: ['#dce8d4', '#6b8058', '#304b3d'],
  violet: ['#342b50', '#c4afda', '#fcf1de'],
  cloud: ['#e2e9ef', '#697e9e', '#33445a'],
  night: ['#162238', '#c9ad72', '#f9efdb'],
  clay: ['#8b4938', '#f1ca98', '#fff0d8'],
};
const light = new Set(['ivory', 'rose', 'sand', 'moss', 'cloud']);
const themes = {
  birth: ['teal', 'ivory', 'cobalt', 'wine', 'night', 'sand', 'jade', 'ivory', 'violet', 'cobalt'],
  marriage: ['wine', 'jade', 'ivory', 'wine', 'rose', 'sand', 'teal', 'ivory', 'violet', 'rose'],
  naming: ['ivory', 'rose', 'sand', 'cloud', 'moss', 'ivory', 'rose', 'cloud', 'moss', 'sand'],
  muhurtham: ['wine', 'ivory', 'jade', 'clay', 'sand', 'teal', 'violet', 'ivory', 'wine', 'sand'],
};
const artworkNames = {
  rasi: 'South Indian Rasi chart',
  'chart-pair': 'Paired chart study',
  'north-chart': 'North Indian chart',
  '@birth-manuscript': 'Palm-leaf archive',
  stations: '27 lunar stations',
  padas: 'Four birth-star padas',
  grahas: 'Nine graha medallions',
};
const layoutLabels = {
  atlas: 'Atlas plate',
  arch: 'Arched vignette',
  seal: 'Foil medallion',
  window: 'Panoramic inset',
  column: 'Portrait column',
  cameo: 'Round cameo',
  ledger: 'Annotated ledger',
  gallery: 'Gallery mount',
  stationery: 'Letterpress card',
  canopy: 'Botanical canopy',
  cover: 'Editorial cover',
  folio: 'Fine art print',
};
const photoMedium = {
  'wedding-ceremony': 'Painted scene',
  'naming-cradle': 'Painted scene',
  'birth-observatory': 'Painted scene',
};
const inkEditions = [null, '#b98960', '#857ca5', '#a4a871', '#72a4a4'];
const tint = (c, color, k) =>
  '#' +
  [1, 3, 5]
    .map((i) =>
      Math.round(
        parseInt(c.slice(i, i + 2), 16) * (1 - k) + parseInt(color.slice(i, i + 2), 16) * k,
      )
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const imageThemes = {
  ...Object.fromEntries(Object.entries(paintings).map(([k, v]) => [k, v[2]])),
  'mothers-day-garden': 'rose',
  'fathers-day-kite': 'cloud',
  'teachers-day-classroom': 'teal',
};
const cache = new Map();
export function modelsFor(topic) {
  const key = topic.category + ':' + topic.id;
  if (cache.has(key)) return cache.get(key);
  const spec =
    topic.category === 'Services' && Object.hasOwn(services, topic.id)
      ? services[topic.id]
      : occasionRows(topic);
  const family =
    topic.category === 'Services'
      ? topic.id
      : topic.category === DEITIES
        ? 'devotional'
        : 'occasion';
  const brief = topic.category === 'Services' ? null : occasionBrief(topic);
  const plateId = plateFor(topic);
  const seq =
    themes[family] ||
    (family === 'porutham'
      ? themes.marriage
      : topic.category === 'Special days'
        ? themes.naming
        : brief?.gods.length
          ? themes.muhurtham
          : themes.birth);
  const result = spec.map(([name, hero, layout, companion, setting, scene], id) => {
    const local = brief?.personal ? hero.slice(7) : null;
    const photo = local ? null : hero.startsWith('@') ? hero.slice(1) : setting || null;
    const theme =
        (hero.startsWith('@') || !paintings[photo] ? imageThemes[photo] : null) ||
        seq[id % seq.length],
      edition = inkEditions[Math.floor(id / 10)];
    const diagram =
      /^(rasi|division|north-chart|chart-pair|house|station|pada|grahas|dasha|sign-ring|meridian|check|porutham|phase|tithi|orbits|six-months|five-limbs)/.test(
        hero,
      );
    const painting = paintings[photo];
    const medium = local
      ? 'My picture'
      : painting
        ? 'AI painting'
        : photo
          ? paintedNames[photo] || photoMedium[photo]
            ? 'Painted scene'
            : 'Still life'
          : diagram
            ? 'Chart study'
            : 'Illustration';
    const colors = inks[theme].map((c, i) => {
      const base = edition ? tint(c, edition, [0.14, 0.25, 0.055][i]) : c;
      return id % 10
        ? tint(base, ['#d6a58b', '#517b78', '#946d8e'][i], (id % 10) * [0.013, 0.024, 0.007][i])
        : base;
    });
    const detail =
      painting?.[0] || artworkNames[hero] || motifName(hero.replace('@', '').split(':')[0]);
    return {
      id,
      name,
      local,
      hero: hero.startsWith('@') ? null : hero,
      companion,
      painting: !!painting,
      plate: !!photo && !painting && photo === plateId,
      layout,
      setting: photo,
      medium,
      theme,
      colors,
      light: light.has(theme),
      composition: layoutLabels[layout],
      detail,
      family,
      sequence: scene ?? 0,
      figure: family === 'devotional' ? topic.name : painting?.[1].split(',')[0] || '',
      key: `${key}:${id}:${hero}:${companion}:${layout}:${photo || ''}`,
    };
  });
  // Service studies originally used photographic still lifes. When a subject has its own
  // painted plate, every study uses that locally bundled artwork; the plate is a real
  // original asset, not a recolour or a renamed copy of the former photograph.
  if (plateId)
    for (const m of result) {
      // Services rotate through three independently illustrated art directions.
      const styles = [plateId, ALT_PLATES[topic.id], DETAIL_PLATES[topic.id]].filter(Boolean);
      const styleIndex = m.id % styles.length;
      const active = styles[styleIndex];
      // Keep the subject's own deity painting as a separate, selectable layer. The new
      // painted plate is the ground; the specific god picture is framed over it below.
      m.deityPicture = m.painting ? m.setting : null;
      m.setting = active;
      m.plate = true;
      m.painting = false;
      m.medium = 'Painted scene';
      m.detail = PLATES[active];
      m.deityInPlate = DEITY_IN_PLATE.has(active);
      m.plateStyle = ['classic', 'modern', 'detail'][styleIndex] || 'classic';
      m.key = `${m.key.slice(0, m.key.lastIndexOf(':'))}:${active}:${m.deityPicture || ''}`;
    }
  if (topic.wordPoster)
    for (const m of result) {
      m.wordPoster = true;
      m.hero = null;
      m.setting = null;
      m.local = null;
      m.painting = false;
      m.plate = false;
      m.deityPicture = null;
      m.deityInPlate = false;
      m.companion = '';
      m.detail = topic.tagline;
      m.key = `${m.key}:word`;
    }
  if (cache.size >= 48) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}
// The picture chooser lists real source pictures, not 50 crops of one image.
export function picturesFor(topic) {
  const unique = new Map();
  for (const m of modelsFor(topic)) {
    const k = m.local || (m.painting ? m.setting : m.deityPicture);
    if (k && !unique.has(k)) unique.set(k, m);
  }
  return [...unique.values()];
}
export const modelFor = (topic, id = 0) => modelsFor(topic)[id] || modelsFor(topic)[0];
export function collectionInfo(topic) {
  const data =
    topic.category === 'Services' && Object.hasOwn(serviceInfo, topic.id) && serviceInfo[topic.id];
  if (data) return { name: data[0], description: data[1], features: data[2], callout: data[3] };
  const b = occasionBrief(topic);
  if (topic.category === DEITIES) {
    const count = picturesFor(topic).length;
    return {
      name: b.title,
      description: `${count} ${b.personal ? 'device picture' : 'AI painting'}${count === 1 ? '' : 's'} · 50 poster designs`,
      features: 'Devotional collection',
      callout: 'With devotion',
    };
  }
  return {
    name: b.title,
    description: b.gods.length
      ? `${b.gods.join(' · ')} and ${topic.name} festival scenes`
      : `${motifName(b.motifs[0])}, ${motifName(b.motifs[1]).toLowerCase()} & illustrated scenes`,
    features: b.title,
    callout: 'With warm wishes',
  };
}
export { signs, planets, checks, mansionNames };

// Stable name used by the Creative Registry; identical to the legacy generator above.
export const baseModelsFor = modelsFor;
