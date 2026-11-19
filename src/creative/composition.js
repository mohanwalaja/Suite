// CompositionEngine data: ten independently art-directed poster structures. Geometry is
// expressed in the 1000-unit print space and always reserves the top-left brand zone and a
// quiet text area. These are structures, not palettes: each one moves the artwork, the copy
// area, the frame and the decorative system to a different place on the sheet.
const box = (x, top, width, bottom, max, center = false) => ({
  x,
  top,
  width,
  bottom,
  max,
  center,
});

export const COMPOSITIONS = [
  {
    id: 'editorial',
    name: 'Editorial spread',
    concept: 'A large, quiet image opposite a tightly-set editorial headline.',
    artDirection: 'Asymmetric two-column magazine composition',
    geometry: (h) => ({
      art: { x: 492, y: h * 0.17, w: 444, h: h * 0.41, shape: 'rect' },
      text: box(65, h * 0.625, 430, h * 0.87, 138),
      focus: 'right',
    }),
  },
  {
    id: 'swiss',
    name: 'Swiss grid',
    concept: 'Structured negative space, a small focal plate and hard alignment.',
    artDirection: 'International typographic grid',
    geometry: (h) => ({
      art: { x: 512, y: h * 0.15, w: 420, h: h * 0.31, shape: 'square' },
      text: box(65, h * 0.53, 420, h * 0.86, 132),
      focus: 'lower-left',
    }),
  },
  {
    id: 'panorama',
    name: 'Panorama band',
    concept: 'One wide illustrated field with a full-width editorial caption below.',
    artDirection: 'Cinematic banner poster',
    geometry: (h) => ({
      art: { x: 52, y: h * 0.15, w: 896, h: h * 0.34, shape: 'wide' },
      text: box(70, h * 0.555, 860, h * 0.875, 126, true),
      focus: 'top',
    }),
  },
  {
    id: 'diptych',
    name: 'Diptych study',
    concept: 'Two visual registers, one dominant object and a companion vignette.',
    artDirection: 'Comparative museum diptych',
    geometry: (h) => ({
      art: { x: 60, y: h * 0.19, w: 470, h: h * 0.36, shape: 'rect' },
      inset: { x: 560, y: h * 0.22, w: 368, h: h * 0.3 },
      text: box(65, h * 0.63, 870, h * 0.875, 128, true),
      focus: 'upper-duo',
    }),
  },
  {
    id: 'medallion',
    name: 'Medallion',
    concept: 'A centred roundel held in deep paper space, with copy set beneath.',
    artDirection: 'Classic award-medal poster',
    geometry: (h) => ({
      art: { x: 292, y: h * 0.145, w: 416, h: 416, shape: 'circle' },
      text: box(70, h * 0.605, 860, h * 0.875, 130, true),
      focus: 'centre',
    }),
  },
  {
    id: 'column',
    name: 'Vertical column',
    concept: 'A tall illustrated spine anchors the page; type runs in a narrow column.',
    artDirection: 'Editorial column poster',
    geometry: (h) => ({
      art: { x: 18, y: h * 0.19, w: 306, h: h * 0.56, shape: 'rect' },
      text: box(356, h * 0.27, 578, h * 0.855, 128),
      focus: 'left',
    }),
  },
  {
    id: 'archive',
    name: 'Archive mount',
    concept: 'A tilted mounted plate and annotation lines, like a curated archive sheet.',
    artDirection: 'Museum archive layout',
    geometry: (h) => ({
      art: { x: 108, y: h * 0.18, w: 784, h: h * 0.34, shape: 'paper', rotate: -0.025 },
      text: box(70, h * 0.59, 860, h * 0.875, 126),
      focus: 'upper-centre',
    }),
  },
  {
    id: 'kolam',
    name: 'Ornamented threshold',
    concept: 'A geometric border frames the illustration; the greeting sits on a calm plinth.',
    artDirection: 'Heritage threshold composition',
    geometry: (h) => ({
      art: { x: 126, y: h * 0.19, w: 748, h: h * 0.33, shape: 'arch' },
      text: box(70, h * 0.6, 860, h * 0.875, 126, true),
      focus: 'centre',
    }),
  },
  {
    id: 'blueprint',
    name: 'Technical plate',
    concept: 'A measured diagram, annotation ticks and a compact explanatory text block.',
    artDirection: 'Technical information-graphics poster',
    geometry: (h) => ({
      art: { x: 56, y: h * 0.21, w: 434, h: h * 0.36, shape: 'rect' },
      text: box(528, h * 0.29, 406, h * 0.85, 118),
      focus: 'lower-left',
    }),
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    concept: 'A halo of light around a single hero object, with a restrained lower caption.',
    artDirection: 'Luxury campaign vignette',
    geometry: (h) => ({
      art: { x: 258, y: h * 0.19, w: 484, h: h * 0.38, shape: 'circle' },
      text: box(70, h * 0.66, 860, h * 0.875, 124, true),
      focus: 'centre',
    }),
  },
];

const byId = new Map(COMPOSITIONS.map((c) => [c.id, c]));
export const compositionById = (id) => byId.get(id) || COMPOSITIONS[0];
export const compositionAt = (index) => COMPOSITIONS[((index % 10) + 10) % 10];
