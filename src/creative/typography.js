// TypographyEngine: each system changes hierarchy, alignment, divider and reading order.
// All of them fit inside the text box supplied by the composition, so editorial ambition
// never costs readability or causes an overlap with artwork or the locked brand mark.
export const TYPE_SYSTEMS = [
  {
    id: 'classic',
    name: 'Classic editorial',
    order: ['eyebrow', 'title', 'rule', 'desc'],
    align: 'left',
    titleCase: 'none',
    ruleStyle: 'hairline',
    divider: 'lozenge',
    eyebrowSize: 20,
    note: 'Eyebrow, display title, fine rule and a light serif supporting line.',
  },
  {
    id: 'magazine',
    name: 'Magazine cover',
    order: ['eyebrow', 'title', 'rule', 'desc'],
    align: 'left',
    titleCase: 'uppercase',
    ruleStyle: 'heavy',
    divider: 'square',
    eyebrowSize: 17,
    note: 'Oversized uppercase headline with a short, high-contrast standfirst.',
  },
  {
    id: 'centred',
    name: 'Centred invitation',
    order: ['eyebrow', 'title', 'rule', 'desc'],
    align: 'centre',
    titleCase: 'none',
    ruleStyle: 'hairline',
    divider: 'dot',
    eyebrowSize: 18,
    note: 'Symmetrical hierarchy for ceremonial and devotional subjects.',
  },
  {
    id: 'swiss',
    name: 'Swiss hierarchy',
    order: ['rule', 'eyebrow', 'title', 'desc'],
    align: 'left',
    titleCase: 'uppercase',
    ruleStyle: 'full',
    divider: 'none',
    eyebrowSize: 16,
    note: 'Rule-led grid, all-caps labels and uncompromising left alignment.',
  },
  {
    id: 'masthead',
    name: 'Masthead',
    order: ['title', 'rule', 'eyebrow', 'desc'],
    align: 'left',
    titleCase: 'none',
    ruleStyle: 'heavy',
    divider: 'none',
    eyebrowSize: 17,
    note: 'Headline first, then a governing rule, then the subject label.',
  },
  {
    id: 'journal',
    name: 'Journal caption',
    order: ['desc', 'rule', 'title', 'eyebrow'],
    align: 'left',
    titleCase: 'none',
    ruleStyle: 'hairline',
    divider: 'dot',
    eyebrowSize: 16,
    note: 'Standfirst leads; the title closes the block like a printed caption.',
  },
  {
    id: 'framed',
    name: 'Framed folio',
    order: ['eyebrow', 'rule', 'title', 'desc'],
    align: 'centre',
    titleCase: 'none',
    ruleStyle: 'hairline',
    divider: 'dot',
    eyebrowSize: 17,
    frame: true,
    note: 'A fine rule encloses the reading area like a letterpress folio.',
  },
  {
    id: 'ledger',
    name: 'Annotated ledger',
    order: ['eyebrow', 'title', 'desc', 'rule'],
    align: 'left',
    titleCase: 'none',
    ruleStyle: 'full',
    divider: 'none',
    eyebrowSize: 18,
    note: 'A closed annotation block: label, title, detail and a final measure line.',
  },
];
const byId = new Map(TYPE_SYSTEMS.map((s) => [s.id, s]));
export const typeSystemById = (id) =>
  typeof id === 'number' ? typeSystemAt(id) : byId.get(id) || TYPE_SYSTEMS[0];
export const typeSystemAt = (index) => TYPE_SYSTEMS[((index % 8) + 8) % 8];

// English only is a hard requirement for every published poster. The studio no longer
// offers the Hindi headline toggle; this helper guards imported or legacy drafts too.
export const englishOnly = (text) => !/[\u0900-\u097F]/.test(String(text || ''));
