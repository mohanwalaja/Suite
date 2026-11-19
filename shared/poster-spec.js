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
