import { localImage } from './local-pictures.js';
import { BRAND, canvasSize } from '../shared/poster-spec.js';
import { fonts, getPalette } from './catalogue.js';
import { collectionInfo, modelFor } from './art/models.js';
import { illustrationImage } from './art/illustration.js';
import { paintArt, rule, lozenge, mix } from './art/press.js';
const images = new Map();
export function imageOf(url) {
  if (images.has(url)) {
    const image = images.get(url);
    images.delete(url);
    images.set(url, image);
    return image;
  }
  const task = new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => {
      if (images.get(url) === task) images.delete(url);
      resolve(null);
    };
    im.src = url;
  });
  images.set(url, task);
  if (images.size > 8) images.delete(images.keys().next().value);
  return task;
}

function wrap(c, text, width) {
  const lines = [];
  let line = '';
  for (const w of text.trim().split(/\s+/)) {
    const next = line ? line + ' ' + w : w;
    if (line && c.measureText(next).width > width) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
function fit(c, text, face, max, width, height, leading = 1) {
  let lines;
  let size = max;
  for (let j = 0; j < 90; j++) {
    c.font = `400 ${size}px ${face}`;
    lines = wrap(c, text, width);
    if (
      (lines.length * size * leading <= height &&
        lines.every((l) => c.measureText(l).width <= width)) ||
      size < 9
    )
      break;
    size *= 0.963;
  }
  return { lines, size, step: size * leading };
}
const sans = '"DM Sans Variable",sans-serif';
function typeLine(c, s, x, y, size, ink, space, room, center = false) {
  c.save();
  c.font = `500 ${size}px ${sans}`;
  c.fillStyle = ink;
  const chars = [...s],
    width = chars.reduce((v, ch) => v + c.measureText(ch).width, 0) + space * (chars.length - 1);
  c.translate(x, y);
  const k = Math.min(1, room / width);
  c.scale(k, 1);
  let xx = center ? -width / 2 : 0;
  for (const ch of chars) {
    c.fillText(ch, xx, 0);
    xx += c.measureText(ch).width + space;
  }
  c.restore();
}
function copy(c, design, model, pal, b, h, font) {
  const { topic } = design,
    { x, top, width, bottom, center, max } = b;
  const anchor = center ? x + width / 2 : x;
  const [base, foil, ink] = pal.colors;
  const title = design.headline?.trim() || topic.name,
    desc = design.tagline?.trim() || topic.tagline;
  const face = `"${font}","Studio Devanagari",Georgia,serif`;
  const H = bottom - top;
  const descFit = fit(
    c,
    desc,
    '"Cormorant Garamond","Studio Devanagari",Georgia,serif',
    center ? 38 : 36,
    width,
    Math.min(H * 0.28, 119),
    1.05,
  );
  const eyebrow = topic.eyebrow.toUpperCase();
  const gap = center ? 12 : 22,
    asc = center ? 19 : 20;
  const titleFit = fit(
    c,
    title,
    face,
    max,
    width,
    Math.min(H * 0.67, H - descFit.lines.length * descFit.step - asc - gap - 28),
    0.99,
  );
  // All headline and tagline baselines are confined to their text area. This matters for
  // long festival names, longer custom text, portrait exports and the independent font picker.
  const total =
    asc + gap + titleFit.step * titleFit.lines.length + gap + descFit.step * descFit.lines.length;
  let yy = top + Math.max(0, (H - total) / 2);
  typeLine(c, eyebrow, anchor, yy + asc, asc, mix(ink, foil, 0.32), 2.85, width, center);
  yy += asc + gap;
  c.save();
  c.textAlign = center ? 'center' : 'left';
  c.fillStyle = ink;
  c.font = `400 ${titleFit.size}px ${face}`;
  for (const l of titleFit.lines) {
    c.fillText(l, anchor, yy + titleFit.size * 0.77, width);
    yy += titleFit.step;
  }
  const xx = center ? anchor - 28 : x;
  rule(c, xx, yy + 2, xx + 49, yy + 2, foil, 1.6);
  lozenge(c, xx + 58, yy + 2, 4.5, foil);
  yy += gap;
  c.font = `400 ${descFit.size}px "Cormorant Garamond","Studio Devanagari",Georgia,serif`;
  c.fillStyle = ink;
  for (const l of descFit.lines) {
    c.fillText(l, anchor, yy + descFit.size * 0.77, width);
    yy += descFit.step;
  }
  c.restore();
  // A consistent URL and subject-specific service invitation on the safe bottom rail.
  const bottomY = h - 63;
  rule(c, 65, bottomY - 43, 935, bottomY - 43, mix(foil, base, 0.36), 1.3);
  typeLine(c, BRAND.website, 65, bottomY, 24, ink, 1.5, 321);
  const label =
    topic.category === 'Services'
      ? collectionInfo(topic).callout
      : topic.category === 'Festivals'
        ? 'Festival greetings'
        : model.family === 'devotional'
          ? 'With devotion'
          : 'With warm wishes';
  c.save();
  c.textAlign = 'right';
  c.fillStyle = ink;
  c.font = `500 18px ${sans}`;
  c.fillText(label.toUpperCase(), 935, bottomY - 1, 440);
  c.restore();
}
// Only the ink has a footprint. Dark paper gets a fine, warm keyline following the
// PNG's alpha silhouette; the space between letters always shows the underlying art.
// Never flatten the website original onto a tile or recolor the logo drawn on top.
let inkMask;
function goldKeyline(logo) {
  if (!inkMask) {
    inkMask = document.createElement('canvas');
    inkMask.width = logo.naturalWidth;
    inkMask.height = logo.naturalHeight;
    const g = inkMask.getContext('2d');
    g.drawImage(logo, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#efd29a';
    g.fillRect(0, 0, inkMask.width, inkMask.height);
  }
  return inkMask;
}
function signature(c, w, h, logo, lightPaper) {
  const x = w * 0.065,
    y = h * 0.05,
    width = w * 0.46;
  const height = (width * logo.naturalHeight) / logo.naturalWidth;
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  if (!lightPaper) {
    const edge = goldKeyline(logo),
      r = w * 0.00145;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      c.drawImage(edge, x + r * Math.cos(a), y + r * Math.sin(a), width, height);
    }
  }
  c.drawImage(logo, x, y, width, height);
  c.restore();
}
export async function paintPoster(canvas, design, { small = false, shouldDraw = () => true } = {}) {
  const m = modelFor(design.topic, design.styleId),
    font = fonts.includes(design.font) ? design.font : fonts[m.id];
  // Thumbnail sources keep the entire original field of view. The ratio, placement, type
  // and brand are rendered here exactly as for PNG and JPEG, not baked into CSS crops.
  const source =
    m.setting &&
    (small && m.painting
      ? `/art/thumbs/${m.setting}.webp?view=portrait`
      : `/art/scenes/${m.setting}.jpg`);
  const [logo, im, art] = await Promise.all([
    imageOf(BRAND.logo),
    m.local ? localImage(m.local) : source ? imageOf(source) : null,
    m.hero ? illustrationImage(m) : null,
    document.fonts.load(`40px "${font}"`),
    document.fonts.load('34px "Cormorant Garamond"'),
    /[\u0900-\u097f]/.test([design.headline, design.topic.name, design.tagline].join(''))
      ? document.fonts.load('40px "Studio Devanagari"', 'देव')
      : null,
    document.fonts.load('500 20px "DM Sans Variable"'),
  ]);
  if (!shouldDraw()) return;
  if (!logo)
    throw new Error(
      'The original ASTRO SIVAM logo could not load. Reload the studio and try again.',
    );
  if (m.setting && !im)
    throw new Error('This model’s artwork could not load. Reload the studio and try again.');
  const { width: w, height: h } = canvasSize(design.format, small);
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d'),
    H = (h * 1000) / w;
  const pal = getPalette(design);
  c.save();
  c.scale(w / 1000, w / 1000);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  const b = paintArt(c, H, m, pal, im, art);
  copy(c, design, m, pal, b, H, font);
  c.restore();
  signature(c, w, h, logo, pal.light);
  return canvas;
}
export async function exportPoster(design, format = 'image/jpeg', quality = 0.94) {
  const canvas = document.createElement('canvas');
  await paintPoster(canvas, design);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => {
        canvas.width = canvas.height = 1;
        if (b) resolve(b);
        else reject(Error('Could not export the poster.'));
      },
      format,
      quality,
    ),
  );
}
export function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
