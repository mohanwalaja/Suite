import { localImage } from './local-pictures.js';
import { BRAND, canvasSize, exportSizeFor, EXPORT_FORMATS } from '../shared/poster-spec.js';
import { fonts, getPalette } from './catalogue.js';
import { collectionInfo, modelFor } from './art/models.js';
import { illustrationImage } from './art/illustration.js';
import { paintArt, rule, lozenge, mix } from './art/press.js';
import { typeSystemById } from './creative/typography.js';
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
function typeLine(c, s, x, y, size, ink, space, room, center = false, face = sans, weight = 500) {
  c.save();
  c.font = `${weight} ${size}px ${face}`;
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
  const system = typeSystemById(model.typeSystem || 'classic');
  const title = design.headline?.trim() || topic.name;
  const desc = design.tagline?.trim() || topic.tagline;
  const headline = system.titleCase === 'uppercase' ? title.toUpperCase() : title;
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
    asc = system.eyebrowSize || 20;
  const titleFit = fit(
    c,
    headline,
    face,
    max,
    width,
    Math.min(H * 0.67, H - descFit.lines.length * descFit.step - asc - gap - 28),
    0.99,
  );
  // Every segment is laid out inside the composition's protected text box, in a reading
  // order chosen by the typographic system. Nothing can stray over artwork or the logo.
  const segments = {
    eyebrow: asc + gap,
    title: titleFit.step * titleFit.lines.length + gap,
    rule: gap + 8,
    desc: descFit.step * descFit.lines.length,
  };
  const total = system.order.reduce((sum, key) => sum + (segments[key] || 0), 0);
  let yy = top + Math.max(0, (H - total) / 2);
  if (system.frame) {
    c.save();
    c.strokeStyle = mix(foil, base, 0.42);
    c.lineWidth = 1;
    c.strokeRect(x - 18, top - 14, width + 36, H + 28);
    c.restore();
  }
  for (const part of system.order) {
    if (part === 'eyebrow') {
      typeLine(c, eyebrow, anchor, yy + asc, asc, mix(ink, foil, 0.32), 2.85, width, center);
      yy += segments.eyebrow;
    } else if (part === 'title') {
      c.save();
      c.textAlign = center ? 'center' : 'left';
      c.fillStyle = ink;
      c.font = `400 ${titleFit.size}px ${face}`;
      for (const line of titleFit.lines) {
        c.fillText(line, anchor, yy + titleFit.size * 0.77, width);
        yy += titleFit.step;
      }
      c.restore();
      yy += gap;
    } else if (part === 'rule') {
      const ruleWidth = system.ruleStyle === 'full' ? Math.min(width, 870) : system.ruleStyle === 'heavy' ? 104 : 49;
      const rx = center ? anchor - ruleWidth / 2 : x;
      rule(c, rx, yy + 2, rx + ruleWidth, yy + 2, foil, system.ruleStyle === 'heavy' ? 3.2 : 1.6);
      if (system.divider === 'lozenge') lozenge(c, rx + ruleWidth + 9, yy + 2, 4.5, foil);
      if (system.divider === 'square')
        c.fillStyle = foil, c.fillRect(rx + ruleWidth + 8, yy - 2, 8, 8);
      if (system.divider === 'dot') {
        c.fillStyle = foil;
        c.beginPath();
        c.arc(rx + ruleWidth + 7, yy + 2, 3.1, 0, Math.PI * 2);
        c.fill();
      }
      yy += segments.rule;
    } else if (part === 'desc') {
      c.save();
      c.textAlign = center ? 'center' : 'left';
      c.font = `400 ${descFit.size}px "Cormorant Garamond","Studio Devanagari",Georgia,serif`;
      c.fillStyle = ink;
      for (const line of descFit.lines) {
        c.fillText(line, anchor, yy + descFit.size * 0.77, width);
        yy += descFit.step;
      }
      c.restore();
    }
  }
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
function signature(c, w, h, logo, lightPaper, position = 'top-left') {
  const width = w * 0.46;
  const height = (width * logo.naturalHeight) / logo.naturalWidth;
  const y = h * 0.05;
  const x =
    position === 'top-right'
      ? w - w * 0.065 - width
      : position === 'top-centre'
        ? (w - width) / 2
        : w * 0.065;
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
function guides(c, w, h, ink) {
  c.save();
  c.strokeStyle = ink;
  c.globalAlpha = 0.5;
  c.setLineDash([7, 7]);
  c.lineWidth = 1;
  for (const x of [w * 0.065, w * 0.5, w * 0.935]) {
    c.beginPath();
    c.moveTo(x, h * 0.18);
    c.lineTo(x, h * 0.9);
    c.stroke();
  }
  for (const y of [h * 0.2, h * 0.5, h * 0.82]) {
    c.beginPath();
    c.moveTo(w * 0.05, y);
    c.lineTo(w * 0.95, y);
    c.stroke();
  }
  c.restore();
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export async function paintPoster(canvas, design, { small = false, shouldDraw = () => true, size = null } = {}) {
  const baseModel = modelFor(design.topic, design.styleId),
    adj = design.adjustments || {};
  const m = adj.background || adj.ornament
    ? { ...baseModel, background: adj.background || baseModel.background, ornament: adj.ornament || baseModel.ornament }
    : baseModel;
  const font = fonts.includes(design.font) ? design.font : fonts[m.id % fonts.length];
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
  const { width: w, height: h } = size || canvasSize(design.format, small);
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d'),
    H = (h * 1000) / w;
  const pal = getPalette(design);
  c.save();
  c.scale(w / 1000, w / 1000);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  const scale = clamp(adj.artScale ?? 1, 0.88, 1.12) || 1;
  if (scale !== 1 || adj.artX || adj.artY) {
    c.fillStyle = pal.colors[0];
    c.fillRect(0, 0, 1000, H);
    c.translate(500 + clamp(adj.artX, -40, 40), H / 2 + clamp(adj.artY, -40, 40));
    c.scale(scale, scale);
    c.translate(-500, -H / 2);
  }
  const b = paintArt(c, H, m, pal, im, art, adj);
  c.restore();
  c.save();
  c.scale(w / 1000, w / 1000);
  c.translate(clamp(adj.textX, -36, 36), clamp(adj.textY, -36, 36));
  copy(c, design, m, pal, b, H, font);
  c.restore();
  if (adj.guides) guides(c, w, h, pal.colors[1]);
  signature(c, w, h, logo, pal.light, design.logoPosition);
  return canvas;
}

export async function exportPoster(design, format = 'image/jpeg', quality = 0.94, placement = 'portrait') {
  const { width, height } = exportSizeFor(placement);
  const canvas = document.createElement('canvas');
  await paintPoster(canvas, design, { size: { width: 1080, height: 1350 } });
  let out = canvas;
  if (placement !== 'portrait') {
    out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const g = out.getContext('2d');
    const pal = getPalette(design);
    g.fillStyle = pal.colors[0];
    g.fillRect(0, 0, width, height);
    // The 4:5 composition is framed, never cropped: headline, deity artwork, captions and
    // the original lockup keep exactly the same positions in every social placement.
    const x = (width - 1080) / 2,
      y = (height - 1350) / 2;
    g.drawImage(canvas, x, y);
    g.strokeStyle = pal.colors[1];
    g.globalAlpha = 0.65;
    g.lineWidth = 2;
    if (y > 30) {
      g.beginPath();
      g.moveTo(x + 76, y - 26);
      g.lineTo(x + width - 76, y - 26);
      g.moveTo(x + 76, height - y + 24);
      g.lineTo(x + width - 76, height - y + 24);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  return new Promise((resolve, reject) =>
    out.toBlob(
      (b) => {
        out.width = out.height = 1;
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
