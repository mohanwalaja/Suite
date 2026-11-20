// The identity is owned by the studio, never by a template, draft, or local preference.
export const BRAND = Object.freeze({
  name: 'ASTRO SIVAM',
  website: 'astrosivam.com',
  site: 'https://astrosivam.com',
  logo: '/brand/official-logo.png',
  icon: '/brand/official-icon.png',
  iconLarge: '/brand/official-icon-512.png',
  logoSource: 'https://astrosivam.com/assets/astrosivam_full_logo-DlKqdIg5.png',
});

// The same portrait is posted to either channel. A draft's old canvas ID is never a
// publishing destination. Bump the revision so a stale client cannot post a plated logo.
export const POSTER_REVISION = 'portrait-transparent-2';
export const PORTRAIT = Object.freeze({
  id: 'portrait',
  name: 'Portrait',
  width: 1080,
  height: 1350,
  ratio: '4:5',
});
export const formats = Object.freeze([PORTRAIT]);

// The official signature is always drawn, but the studio owner may choose where and how
// large it sits. The aspect ratio is locked to the original PNG and never stretched.
export const LOGO_POSITIONS = Object.freeze([
  'top-left',
  'top-centre',
  'top-right',
  'bottom-left',
  'bottom-centre',
  'bottom-right',
]);
export const LOGO_SIZE = Object.freeze({ min: 0.7, max: 1.15, default: 0.86 });
export const logoScaleFor = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(LOGO_SIZE.max, Math.max(LOGO_SIZE.min, n)) : LOGO_SIZE.default;
};
export function logoRect(w, h, aspect, position = 'top-left', size = LOGO_SIZE.default) {
  const scale = logoScaleFor(size);
  const width = w * 0.46 * scale;
  const height = width / aspect;
  const margin = w * 0.065;
  const top = h * 0.05;
  const bottom = h - top - height;
  const x =
    position === 'top-right' || position === 'bottom-right'
      ? w - margin - width
      : position === 'top-centre' || position === 'bottom-centre'
        ? (w - width) / 2
        : margin;
  const y = position.startsWith('bottom') ? bottom - h * 0.05 : top;
  return { x, y, width, height };
}
// Editorial drafts and publishing stay portrait. Exports can additionally be framed for
// square and story placements without cropping or moving the composed artwork.
export const EXPORT_FORMATS = Object.freeze([
  { ...PORTRAIT, id: 'portrait', name: 'Instagram / Facebook portrait', platforms: 'Instagram · Facebook' },
  { id: 'square', name: 'Instagram / Facebook square', width: 1080, height: 1080, ratio: '1:1', platforms: 'Instagram · Facebook' },
  { id: 'story', name: 'Instagram story', width: 1080, height: 1920, ratio: '9:16', platforms: 'Instagram' },
]);
export const exportSizeFor = (id) => {
  const found = EXPORT_FORMATS.find((f) => f.id === id) || PORTRAIT;
  return { width: found.width, height: found.height };
};
// Keep the resolver for old saved designs and callers; no legacy ID can select another size.
export const formatFor = () => PORTRAIT;

export function canvasSize(format, small = false) {
  const { width, height } = formatFor(format);
  const w = small ? 384 : width;
  return { width: w, height: Math.round((w * height) / width) };
}

export function normalizeDesign(design) {
  const format = formatFor(design.format).id;
  if (design.format === format && !Object.hasOwn(design, 'showBrand')) return design;
  const { showBrand: _retiredOption, ...content } = design;
  return { ...content, format };
}
