// Original, licensed AI-painted plates for subjects whose catalogue brief has no historical
// artwork. Every entry is a separately art-directed image with its own subject, palette and
// composition; entries are never colour swaps or repeated files. The scene loader resolves
// these ids from /art/scenes/<id>.jpg and /art/thumbs/<id>.webp.
export const PLATES = {
  birth: 'The Birth Chart Plate',
  marriage: 'The Two-Chart Match',
  naming: 'The Naming Cradle',
  muhurtham: 'The Auspicious Calendar',
  bhava: 'The Twelve-House Diamond',
  varga: 'The Divisional Folio',
  rasi: 'The Lunar Sign Wheel',
  panchangam: 'The Almanac Table',
  nakshatra: 'The Birth-Star Atlas',
  porutham: 'The Star-Match Balance',
  'fest-onam': 'The Onam Flower Mandala',
  'fest-raksha-bandhan': 'The Rakhi Thali',
  'fest-tamil-puthandu': 'The First Pongal Morning',
  'fest-ugadi': 'The Ugadi Table',
  'fest-gudi-padwa': 'The Raised Gudi',
  'fest-baisakhi': 'Fields of Gold',
  'fest-lohri': 'The Lohri Fire',
  'fest-rongali-bihu': 'The Bihu Drum',
  'fest-magh-bihu': 'The Harvest Granary',
  'fest-guru-purnima': 'The Teacher’s Lamp',
};

export const plateFor = (topic) => (topic && Object.hasOwn(PLATES, topic.id) ? topic.id : null);
