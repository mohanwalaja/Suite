// DesignVariationEngine. Every choice here is deterministic and bounded by an authored
// vocabulary. The engine cannot invent a new colour scheme, mirror a drawing, or nudge an
// element by a few pixels and call it a new design: only composition, illustration
// arrangement, hierarchy, decoration and background construction can define a variation.

export const ART_DIRECTIONS = [
  {
    id: 'editorial',
    name: 'Editorial Modern',
    concept: 'A confident magazine cover: oversized display type, asymmetric image, generous paper.',
    artDirection: 'Oversized editorial headline; one dominant image; disciplined margins.',
    accent: '#b98960',
    texture: 'fine paper tooth',
    lighting: 'soft studio light from the upper left',
    balance: 'asymmetric',
  },
  {
    id: 'swiss',
    name: 'Swiss International',
    concept: 'Objective geometry, explicit alignment and purposeful empty space.',
    artDirection: 'Grid-first composition; flush-left typography; small focal panel.',
    accent: '#7d95a2',
    texture: 'flat ink',
    lighting: 'even, shadowless',
    balance: 'mathematical',
  },
  {
    id: 'heritage',
    name: 'Heritage Craft',
    concept: 'Temple geometry and hand-drawn ornament held inside a contemporary frame.',
    artDirection: 'Classical border, arranged motifs, ceremonial symmetry.',
    accent: '#c49a55',
    texture: 'woven paper',
    lighting: 'warm lamplight',
    balance: 'ceremonial',
  },
  {
    id: 'vector',
    name: 'Contemporary Vector',
    concept: 'Layered original line art and flat graphic shapes with a crisp silhouette.',
    artDirection: 'Bold cut-paper forms, crisp outline, secondary vignette.',
    accent: '#6c9a8c',
    texture: 'clean vector',
    lighting: 'graphic, no cast shadow',
    balance: 'dynamic',
  },
  {
    id: 'luxury',
    name: 'Luxury Advertising',
    concept: 'Restrained gold, deep paper and a single beautifully lit hero object.',
    artDirection: 'Premium vignette, controlled foil, restrained supporting copy.',
    accent: '#d7b46b',
    texture: 'silk sheen',
    lighting: 'focused warm spot',
    balance: 'centred',
  },
  {
    id: 'devotional',
    name: 'Modern Devotional',
    concept: 'Reverent composition with subject-specific attributes and calm ornamental geometry.',
    artDirection: 'Uncropped sacred image, clear space, devotional motifs nearby.',
    accent: '#c38b6c',
    texture: 'matte devotional paper',
    lighting: 'diffuse glow',
    balance: 'contemplative',
  },
  {
    id: 'typographic',
    name: 'Experimental Type',
    concept: 'The headline becomes the principal graphic shape, with art in counterpoint.',
    artDirection: 'Large display type, unconventional reading order, tight hierarchy.',
    accent: '#9a8bc1',
    texture: 'ink on stock',
    lighting: 'flat gallery light',
    balance: 'tensioned',
  },
  {
    id: 'folk',
    name: 'Contemporary Poster Art',
    concept: 'Cut-paper, collage and screen-print energy built from original illustrations.',
    artDirection: 'Layered paper shapes, visible registration, handcrafted edges.',
    accent: '#c47c63',
    texture: 'screen-print grain',
    lighting: 'high-key daylight',
    balance: 'playful',
  },
  {
    id: 'diagram',
    name: 'Information Design',
    concept: 'Charts, measures and annotated plates presented with editorial clarity.',
    artDirection: 'Technical grid, measured caption, diagram as hero.',
    accent: '#7fa3b8',
    texture: 'blueprint paper',
    lighting: 'neutral',
    balance: 'modular',
  },
  {
    id: 'minimal',
    name: 'Quiet Minimal',
    concept: 'A single emblem held in generous negative space with whisper-quiet type.',
    artDirection: 'One hero object, long silence, minimal decoration.',
    accent: '#9aa79a',
    texture: 'uncoated stock',
    lighting: 'soft diffuse',
    balance: 'still',
  },
];

export const BACKGROUNDS = [
  {
    id: 'paper',
    name: 'Warm paper tooth',
    treatment: 'Deterministic fine fibre over a quiet tonal gradient.',
  },
  {
    id: 'grid',
    name: 'Measured grid',
    treatment: 'Faint alignment grid drawn under the artwork only.',
  },
  {
    id: 'halftone',
    name: 'Print halftone',
    treatment: 'Sparse printed dots fading away from the hero.',
  },
  {
    id: 'stripe',
    name: 'Vertical bands',
    treatment: 'Broad vertical paper bands with restrained contrast.',
  },
  {
    id: 'vignette',
    name: 'Gallery vignette',
    treatment: 'Soft edge falloff that focuses attention on the centre.',
  },
  {
    id: 'blueprint',
    name: 'Drafting field',
    treatment: 'Low-construction lines and registration crosses.',
  },
  {
    id: 'spotlight',
    name: 'Spotlight wash',
    treatment: 'A gentle radial wash behind the hero object.',
  },
  {
    id: 'diagonal',
    name: 'Diagonal field',
    treatment: 'Wide diagonal bands receding behind the artwork.',
  },
  {
    id: 'frame',
    name: 'Double-mounted paper',
    treatment: 'Two inset ruled mounts framing the entire composition.',
  },
  {
    id: 'plain',
    name: 'Flat stock',
    treatment: 'Untextured, high-contrast stock for maximum clarity.',
  },
];

export const ORNAMENTS = [
  { id: 'kolam', name: 'Kolam diamonds', treatment: 'Repeated diamond lattice along the art edge.' },
  { id: 'swiss', name: 'Registration crosses', treatment: 'Precise cross marks at grid intersections.' },
  { id: 'botanical', name: 'Leaf sprays', treatment: 'Small hand-drawn leaf arcs at the corners.' },
  { id: 'stars', name: 'Star field', treatment: 'Sparse points of light around the hero.' },
  { id: 'arch', name: 'Arched threshold', treatment: 'A single arch tracing the illustration.' },
  { id: 'rangoli', name: 'Concentric geometry', treatment: 'Concentric circles and radial ticks.' },
  { id: 'brackets', name: 'Corner brackets', treatment: 'Precise printed crop-style brackets.' },
  { id: 'rules', name: 'Measure rules', treatment: 'Short parallel rules above and below the art.' },
  { id: 'layers', name: 'Offset plates', treatment: 'Two offset outlines giving a layered print feel.' },
  { id: 'none', name: 'No ornament', treatment: 'Negative space does the work.' },
];

const directions = new Map(ART_DIRECTIONS.map((d, i) => [d.id, i]));
const at = (n, length) => ((n % length) + length) % length;
const COMPOSITION_IDS = ['editorial', 'swiss', 'panorama', 'diptych', 'medallion', 'column', 'archive', 'kolam', 'blueprint', 'spotlight'];

// Pass zero keeps the legacy authored composition untouched. Pass one changes every
// structural axis at once, so it can never be mistaken for a recolour of the same poster.
// When a motif pair repeats every `pool` studies, the mounting must not repeat with it.
// The stride is chosen so (stride * pool + 1) is coprime with ten; adding floor(index/pool)
// then advances the arrangement by a different amount on each pass through the vocabulary.
function arrangementStride(pool) {
  const length = Math.max(2, pool || 8);
  for (let stride = 1; stride <= 9; stride++) {
    const step = stride * length + 1;
    if (step % 2 !== 0 && step % 5 !== 0) return stride;
  }
  return 1;
}

export function variationFor(baseIndex, pass, legacySequence = 0, pool = 8) {
  if (pass === 0) {
    const direction = ART_DIRECTIONS[at(baseIndex * 3, ART_DIRECTIONS.length)];
    return {
      pass: 0,
      directionIndex: directions.get(direction.id),
      compositionId: 'legacy',
      arrangementId: 'legacy-' + at(legacySequence, 7),
      typeSystemId: 'classic',
      backgroundId: 'paper',
      ornamentId: 'heritage-rule',
      direction,
    };
  }
  const isThird = pass === 2;
  const directionIndex = isThird
    ? at(baseIndex * 5 + 7, ART_DIRECTIONS.length)
    : at(baseIndex * 3 + 5, ART_DIRECTIONS.length);
  return {
    pass,
    directionIndex,
    compositionId: isThird
      ? COMPOSITION_IDS[at(baseIndex * 7 + 2, 10)]
      : COMPOSITION_IDS[at(baseIndex * 3 + 1, 10)],
    // Each pass through the subject vocabulary advances the mounting by a different rule.
    // A repeated motif pair therefore never receives the same spatial grammar.
    arrangementId: (() => {
      const inherited = at(baseIndex * arrangementStride(pool) + Math.floor(baseIndex / pool) + 3, 10);
      return isThird ? at(inherited * 3 + 5, 10) : inherited;
    })(),
    // 1..7 only: the classic system belongs exclusively to the inherited fifty.
    typeSystemId: isThird ? at(baseIndex * 3 + 4, 7) + 1 : at(baseIndex * 5 + 2, 7) + 1,
    backgroundId: isThird ? at(baseIndex * 3 + 2, 10) : at(baseIndex * 7 + 4, 10),
    ornamentId: isThird ? at(baseIndex * 7 + 1, 10) : at(baseIndex * 3 + 6, 10),
    direction: ART_DIRECTIONS[directionIndex],
  };
}

export function validateVariation(v) {
  if (!v) return false;
  if (v.pass === 0) return v.typeSystemId === 'classic' && v.compositionId === 'legacy';
  return (
    (v.pass === 1 || v.pass === 2) &&
    v.compositionId !== 'legacy' &&
    typeof v.arrangementId === 'number' &&
    typeof v.typeSystemId === 'number' &&
    v.typeSystemId >= 1 &&
    v.typeSystemId <= 7
  );
}
