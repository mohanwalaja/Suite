import { occasionBrief } from '../art/briefs.js';

// GraphicArtworkEngine: subject-specific motifs and ten genuinely different arrangements
// of those motifs. An arrangement changes scale, overlap, rotation and the supporting
// geometry of the SVG itself -- it is never a tint or a horizontal flip.
export const ARRANGEMENTS = [
  {
    id: 'hero-duet',
    name: 'Hero and duet',
    hero: [-2, 0, 236, 236],
    companion: [166, 164, 86],
    decor: 'rule',
  },
  {
    id: 'upper-cameo',
    name: 'Upper cameo',
    hero: [26, 4, 204, 204],
    companion: [4, 154, 98],
    decor: 'ring',
  },
  {
    id: 'low-anchor',
    name: 'Low anchor',
    hero: [4, 28, 208, 208],
    companion: [146, 126, 106],
    decor: 'arch',
  },
  {
    id: 'split-stage',
    name: 'Split stage',
    hero: [-12, 18, 180, 180],
    companion: [96, 44, 158],
    decor: 'grid',
  },
  {
    id: 'framed-pair',
    name: 'Framed pair',
    hero: [18, 18, 160, 160],
    companion: [116, 124, 118],
    decor: 'frame',
  },
  {
    id: 'orbit',
    name: 'Orbital study',
    hero: [40, 24, 178, 178],
    companion: [2, 152, 96],
    decor: 'orbit',
  },
  {
    id: 'banner-pair',
    name: 'Banner pair',
    hero: [-4, 46, 188, 188],
    companion: [120, 8, 132],
    decor: 'ticks',
  },
  {
    id: 'tall-column',
    name: 'Tall column',
    hero: [12, 0, 224, 224],
    companion: [172, 134, 78],
    decor: 'columns',
  },
  {
    id: 'corner-medal',
    name: 'Corner medallion',
    hero: [20, 30, 196, 196],
    companion: [152, 144, 92],
    decor: 'medal',
  },
  {
    id: 'stacked-plate',
    name: 'Stacked plate',
    hero: [2, 12, 206, 206],
    companion: [132, 134, 108],
    decor: 'stack',
  },
];
const arrangements = new Map(ARRANGEMENTS.map((a) => [a.id, a]));
export const arrangementAt = (index) => ARRANGEMENTS[((index % 10) + 10) % 10];
export const arrangementById = (id) =>
  typeof id === 'number' ? arrangementAt(id) : arrangements.get(id) || ARRANGEMENTS[0];


// Several legacy motif names are aliases that render exactly the same SVG (for example
// 'stars', 'sky-map' and 'star-path'). Generated passes must not count those aliases as
// different artwork, so pool entries are canonicalised before a pair is selected.
const MOTIF_ALIASES = {
  rose: 'rose', jasmine: 'rose', petals: 'rose', lily: 'rose',
  garlands: 'garland',
  diya: 'deepam',
  ribbon: 'silk-knot', 'star-ribbon': 'silk-knot',
  quill: 'stylus',
  letters: 'invite', 'name-card': 'invite',
  'wedding-seal': 'wax-seal',
  anklets: 'bangles',
  handprint: 'henna',
  turmeric: 'betel-tray', 'sandal-tray': 'betel-tray', kumkum: 'betel-tray', modak: 'betel-tray', 'color-bowls': 'betel-tray',
  'keepsake-box': 'jewellery-box',
  flute: 'music', veena: 'music',
  bunting: 'toran',
  braid: 'necklace',
  'baby-basket': 'basket',
  'cloud-cradle': 'star-mobile',
  nameplate: 'certificate', 'name-scroll': 'certificate',
  rabbit: 'bear', 'pull-bird': 'duck',
  book: 'storybook', album: 'storybook', 'baby-album': 'storybook',
  sieve: 'mirror', parrot: 'hornbill', 'peace-dove': 'hornbill',
  'quill-cup': 'pencils', sugarcane: 'grain', kolam: 'pookalam', palette: 'paintbox',
  science: 'globe',
  'regional-charts': 'chart-pair', 'house-folio': 'chart-pair', 'match-folio': 'chart-pair',
  meridian: 'orbits', 'sky-map': 'star-path', stars: 'star-path',
  quadrant: 'compass', 'sunrise-path': 'horizon', calendar: 'almanac', 'six-months': 'almanac',
};
export const canonicalMotif = (value) => {
  const [key, ...rest] = String(value).split(':');
  return MOTIF_ALIASES[key] ? [MOTIF_ALIASES[key], ...rest].join(':') : value;
};

// Only motifs belonging to this subject are eligible. Services reuse their own illustrated
// vocabulary; occasions use the curated brief; devotional collections use their own attributes.
export function motifPoolFor(topic, baseModels) {
  const pool = [];
  const add = (value) => {
    if (typeof value !== 'string' || value.startsWith('@') || value.startsWith('local:')) return;
    // Keep the full identifier: story:mother-book, sign:4 and division:9 are distinct
    // illustrations whose suffix is required by the illustration engine.
    const canonical = canonicalMotif(value);
    if (canonical && !pool.includes(canonical)) pool.push(canonical);
  };
  for (const m of baseModels) {
    add(m.hero);
    add(m.companion);
  }
  try {
    const brief = occasionBrief(topic);
    for (const motif of brief.motifs || []) add(motif);
  } catch {
    // Services have no occasion brief; their own illustrated rows are the motif pool.
  }
  return pool.length >= 2 ? pool : ['lotus', 'stars'];
}

export function motifPairFor(pool, index, pass) {
  // A coprime stride walks the whole subject vocabulary without repeating pairs too soon.
  const a = pool[(index * 7 + pass * 3) % pool.length];
  const b = pool[(index * 11 + pass * 5 + 1) % pool.length];
  return [a, a === b ? pool[(index + 2) % pool.length] : b];
}
