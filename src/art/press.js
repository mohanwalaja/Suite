import { compositionById } from '../creative/composition.js';

// Layouts in a 1000-unit print space. Artwork and type are given separate live areas;
// changing a palette changes the paper and the ink, never the colours of a deity or logo.
export const mix = (a, b, t) =>
  '#' +
  [1, 3, 5]
    .map((i) =>
      Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const rgba = (hex, a) =>
  `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',')},${a})`;
export function rule(c, x, y, xx, yy, ink, width = 1) {
  c.strokeStyle = ink;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(xx, yy);
  c.stroke();
}
function rect(c, x, y, w, h, ink) {
  c.fillStyle = ink;
  c.fillRect(x, y, w, h);
}
function stroke(c, x, y, w, h, ink, lw = 1) {
  c.strokeStyle = ink;
  c.lineWidth = lw;
  c.strokeRect(x, y, w, h);
}
export function lozenge(c, x, y, r, ink) {
  c.fillStyle = ink;
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x + 1, y - 1, x + r * 0.83, y);
  c.quadraticCurveTo(x + 1, y + 1, x, y + r);
  c.quadraticCurveTo(x - 1, y + 1, x - r * 0.83, y);
  c.quadraticCurveTo(x - 1, y - 1, x, y - r);
  c.fill();
}
function disc(c, x, y, r, fill, outline) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (outline) {
    c.strokeStyle = outline;
    c.lineWidth = 1.4;
    c.stroke();
  }
}
// Fine deterministic paper tooth; one tile, not a full-resolution bitmap per model.
let fibre;
function paper(c, h, base) {
  const bg = c.createLinearGradient(0, 0, 1000, h);
  bg.addColorStop(0, mix(base, '#fff4d9', 0.07));
  bg.addColorStop(0.6, base);
  bg.addColorStop(1, mix(base, '#302533', 0.09));
  rect(c, 0, 0, 1000, h, bg);
  if (!fibre) {
    fibre = document.createElement('canvas');
    fibre.width = fibre.height = 96;
    const d = fibre.getContext('2d'),
      p = d.createImageData(96, 96);
    let n = 73;
    for (let i = 0; i < p.data.length; i += 4) {
      n = (n * 48271) % 2147483647;
      p.data[i] = p.data[i + 1] = p.data[i + 2] = n % 2 ? 255 : 30;
      p.data[i + 3] = 2 + (n % 13);
    }
    d.putImageData(p, 0, 0);
  }
  rect(c, 0, 0, 1000, h, c.createPattern(fibre, 'repeat'));
}
function cover(c, im, x, y, w, h, anchor = 0.5, vanchor = 0.48) {
  const iw = im.naturalWidth,
    ih = im.naturalHeight,
    s = Math.max(w / iw, h / ih);
  c.drawImage(im, (iw - w / s) * anchor, (ih - h / s) * vanchor, w / s, h / s, x, y, w, h);
}
// A painted plate has no face, logo or lettering to protect, so each authored design frames
// a genuinely different region of the painting. The crop is a large change of view, paired
// with a different motif pair and composition -- not a recolour of one fixed crop.
function cropPlate(c, im, x, y, w, h, m) {
  const aspect = w / h;
  let sw = 0.62 + ((m.id * 13) % 3) * 0.08;
  let sh = sw / aspect;
  if (sh > 0.92) {
    sh = 0.92;
    sw = sh * aspect;
  }
  const sx = (((m.id * 29) % 100) / 100) * (1 - sw);
  const sy = (((m.id * 41) % 100) / 100) * (1 - sh);
  c.drawImage(
    im,
    sx * im.naturalWidth,
    sy * im.naturalHeight,
    sw * im.naturalWidth,
    sh * im.naturalHeight,
    x,
    y,
    w,
    h,
  );
}
function contain(c, im, x, y, w, h) {
  const scale = Math.min(w / im.naturalWidth, h / im.naturalHeight),
    iw = scale * im.naturalWidth,
    ih = scale * im.naturalHeight;
  c.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function arch(c, x, y, w, h) {
  const r = Math.min(w / 2, h * 0.43);
  c.beginPath();
  c.moveTo(x, y + h);
  c.lineTo(x, y + r);
  c.bezierCurveTo(x, y + r * 0.44, x + w * 0.22, y + r * 0.02, x + w * 0.5, y);
  c.bezierCurveTo(x + w * 0.78, y + r * 0.02, x + w, y + r * 0.44, x + w, y + r);
  c.lineTo(x + w, y + h);
  c.closePath();
}
function trim(c, h, accent, photo) {
  const ink = rgba(accent, photo ? 0.78 : 0.66);
  stroke(c, 25, 25, 950, h - 50, ink, 1.15);
  for (const [x, y, dx, dy] of [
    [25, 25, 1, 1],
    [975, 25, -1, 1],
    [25, h - 25, 1, -1],
    [975, h - 25, -1, -1],
  ]) {
    rule(c, x, y, x + dx * 39, y, ink, 2.7);
    rule(c, x, y, x, y + dy * 39, ink, 2.7);
    lozenge(c, x, y, 4, accent);
  }
}
function ticks(c, x, y, w, col) {
  rule(c, x, y, x + w, y, col, 1.1);
  for (let i = 0; i <= 32; i++)
    rule(c, x + (w * i) / 32, y, x + (w * i) / 32, y + (i % 4 === 0 ? 8 : 3.8), col, 0.95);
}
const box = (x, top, width, bottom, max, center = false) => ({
  x,
  top,
  width,
  bottom,
  max,
  center,
});
// Mount the entire generated scene. The frame, type and ritual vignettes occupy the
// surrounding paper, never the deity's face, hands, mount, or shrine. Only the original
// editorial covers (painted with an empty left half) use the bleed treatment below.
function paintingPlate(c, h, m, colors, im, ornament) {
  const [base, foil] = colors;
  const matte = mix(base, foil, 0.15),
    ruleInk = mix(base, foil, 0.68);
  trim(c, h, foil, false);
  // Give a whole-scene painting the center of a vertical print, rather than shrinking
  // a square composition into the right-hand half. Keep crowns, mounts and shrines in frame.
  if (m.layout === 'folio') {
    const size = h * 0.6,
      x = (1000 - size) / 2,
      y = h * 0.14;
    rect(c, x - 6, y - 6, size + 12, size + 12, matte);
    stroke(c, x - 7, y - 7, size + 14, size + 14, ruleInk, 1.4);
    contain(c, im, x, y, size, size);
    return box(65, y + size + 14, 870, h - 118, 95, true);
  }
  const side = (left, size) => {
    const x = left ? 48 : 952 - size,
      y = h * 0.53 - size / 2;
    if (m.layout === 'column') rect(c, 27, h * 0.207, size + 42, h * 0.646, matte);
    if (m.layout === 'arch') {
      arch(c, x - 12, y - 49, size + 24, size + 67);
      c.fillStyle = matte;
      c.fill();
      c.strokeStyle = ruleInk;
      c.lineWidth = 2;
      c.stroke();
    }
    rect(c, x - 7, y - 7, size + 14, size + 14, matte);
    stroke(c, x - 7, y - 7, size + 14, size + 14, ruleInk, 1.6);
    contain(c, im, x, y, size, size);
    const tx = left ? x + size + 33 : 58,
      tw = left ? 944 - tx : x - tx - 31;
    if (m.layout === 'atlas') ticks(c, x, y + size + 15, size, ruleInk);
    if (m.layout === 'canopy') {
      rule(c, x - 17, y - 13, x + size + 17, y - 13, foil, 6);
      for (let i = 0; i < 24; i++) lozenge(c, x + ((i + 0.5) * size) / 24, y + size + 15, 4, foil);
    }
    if (ornament) {
      const mark = m.layout === 'seal' || m.layout === 'cameo';
      if (mark) disc(c, tx + 74, h * 0.285, 58, matte, ruleInk);
      contain(c, ornament, tx + 8, h * 0.23, 131, h * 0.115);
    }
    return box(tx, h * (ornament ? 0.369 : 0.265), tw, h * 0.825, 119);
  };
  if (['window', 'ledger', 'stationery'].includes(m.layout)) {
    const y = h * 0.213,
      size = h * 0.4;
    const x = m.layout === 'ledger' ? 61 : m.layout === 'window' ? 932 - size : (1000 - size) / 2;
    rect(c, 42, y - 10, 916, size + 20, matte);
    stroke(c, 49, y - 4, 902, size + 8, ruleInk);
    contain(c, im, x, y, size, size);
    if (ornament) {
      if (m.layout === 'stationery') {
        const room = x - 80;
        contain(c, ornament, 61, y + size * 0.24, room, size * 0.52);
        contain(c, ornament, 1000 - x + 19, y + size * 0.24, room, size * 0.52);
      } else {
        const from = m.layout === 'ledger' ? x + size + 21 : 60;
        const to = m.layout === 'ledger' ? 938 : x - 21;
        contain(c, ornament, from, y + 22, to - from, size - 44);
      }
    }
    if (m.layout === 'ledger') ticks(c, 60, y + size + 12, 880, ruleInk);
    return box(69, y + size + h * 0.031, 862, h * 0.878, 98, m.layout !== 'ledger');
  }
  const left = ['gallery', 'column', 'cameo', 'canopy'].includes(m.layout);
  return side(left, ['gallery', 'seal'].includes(m.layout) ? 517 : 545);
}
// A festival's own deity painting is framed over its premium plate, never stretched or
// cropped to fill the sheet. The gold double ring keeps the original artwork legible.
function deityVignette(c, im, x, y, size, foil) {
  if (!im) return;
  const r = size / 2;
  c.save();
  c.beginPath();
  c.arc(x + r, y + r, r, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = '#fffaf0';
  c.fillRect(x, y, size, size);
  contain(c, im, x, y, size, size);
  c.restore();
  c.beginPath();
  c.arc(x + r, y + r, r + 5, 0, Math.PI * 2);
  c.strokeStyle = foil;
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(x + r, y + r, r + 11, 0, Math.PI * 2);
  c.strokeStyle = rgba(foil, 0.45);
  c.lineWidth = 1;
  c.stroke();
}

function paintArtBase(c, h, m, palette, im, art, adjust = {}, deityIm = null) {
  const [base, foil, ink] = palette.colors;
  const tint = mix(base, ink, 0.07),
    mid = mix(base, foil, 0.15),
    line = rgba(foil, 0.68);
  paper(c, h, base);
  if (m.direction === 1) return creativePlate(c, h, m, palette, im, art, adjust, deityIm);
  // A supplied portrait can have any ratio. Never crop its face or place marketing text over it.
  if (m.local) {
    trim(c, h, foil, false);
    const left = m.id % 3 === 1;
    const wide = m.id % 3 === 2;
    const ax = wide ? 72 : left ? 48 : 513,
      ay = h * (wide ? 0.2 : 0.232),
      aw = wide ? 856 : 443,
      ah = h * (wide ? 0.38 : 0.61);
    rect(c, ax, ay, aw, ah, mid);
    stroke(c, ax + 5, ay + 5, aw - 10, ah - 10, line);
    contain(c, im, ax + 11, ay + 11, aw - 22, ah - 22);
    return wide
      ? box(69, h * 0.611, 862, h * 0.87, 113, true)
      : left
        ? box(539, h * 0.28, 392, h * 0.83, 125)
        : box(65, h * 0.28, 420, h * 0.83, 135);
  }
  if (m.painting && m.layout !== 'cover') return paintingPlate(c, h, m, palette.colors, im, art);
  const stacked = m.layout === 'window' || m.layout === 'ledger' || m.layout === 'stationery';
  const bleed =
    im && (m.layout === 'cover' || m.hero || m.setting === 'birth-astrologer' || m.plate);
  if (bleed) {
    if (m.plate) cropPlate(c, im, 0, 0, 1000, h, m);
    else cover(c, im, 0, 0, 1000, h, 0.88);
    const g = c.createLinearGradient(0, 0, 825, 0);
    g.addColorStop(0, rgba(base, 0.98));
    g.addColorStop(0.37, rgba(base, 0.93));
    g.addColorStop(0.6, rgba(base, 0.62));
    g.addColorStop(0.86, rgba(base, 0.09));
    g.addColorStop(1, rgba(base, 0));
    rect(c, 0, 0, 1000, h, g);
    const f = c.createLinearGradient(0, h * 0.82, 0, h);
    f.addColorStop(0, rgba(base, 0));
    f.addColorStop(1, rgba(base, 0.83));
    rect(c, 0, h * 0.82, 1000, h * 0.18, f);
    trim(c, h, foil, true);
    if (art) {
      c.save();
      if (m.plate) c.globalAlpha = 0.38;
      c.translate(751, h * 0.52);
      c.rotate(-0.055);
      c.shadowColor = '#17202766';
      c.shadowBlur = 13;
      contain(c, art, -231, -231, 462, 462);
      c.restore();
    }
    return box(65, h * 0.29, art ? 440 : 463, h * 0.826, 145);
  }
  trim(c, h, foil, false);
  if (stacked) {
    const top = h * 0.209,
      hh = h * (m.layout === 'stationery' ? 0.355 : 0.372),
      left = m.layout === 'ledger' ? 64 : 45,
      ww = 1000 - 2 * left;
    if (m.layout === 'window') {
      rect(c, left, top, ww, hh, mid);
      stroke(c, left + 7, top + 7, ww - 14, hh - 14, line);
      for (let j = 0; j < 3; j++) {
        const xx = left + 13 + j * 10;
        rule(c, xx, top + 16, xx, top + hh - 16, rgba(foil, 0.22), 0.8);
        rule(c, 1000 - xx, top + 16, 1000 - xx, top + hh - 16, rgba(foil, 0.22), 0.8);
      }
    }
    if (m.layout === 'ledger') {
      rect(c, left, top, ww, hh, tint);
      ticks(c, left, top, ww, foil);
      ticks(c, left, top + hh, ww, foil);
      for (let j = 1; j < 8; j++)
        rule(
          c,
          left + (j * ww) / 8,
          top + 13,
          left + (j * ww) / 8,
          top + hh - 4,
          rgba(foil, 0.13),
          0.85,
        );
    }
    if (m.layout === 'stationery') {
      const shade = mix(base, foil, 0.15);
      c.save();
      c.translate(500, top + hh * 0.5);
      c.rotate(-0.032);
      rect(c, -ww * 0.39, -hh * 0.45, ww * 0.78, hh * 0.9, shade);
      stroke(c, -ww * 0.39, -hh * 0.45, ww * 0.78, hh * 0.9, line);
      c.restore();
      rule(c, 95, top + hh + 8, 905, top + hh + 8, line);
    }
    // Wide displays have two independently illustrated objects, rather than a small square
    // floating in a panoramic hole. The small inset is drawn with the same medium as the hero.
    if (im) cover(c, im, left + 8, top + 8, ww - 16, hh - 16, 0.8);
    else contain(c, art, left + 12, top + 6, ww - 24, hh - 12);
    return box(
      75,
      top + hh + h * 0.024,
      850,
      h * 0.873,
      m.layout === 'stationery' ? 113 : 110,
      m.layout !== 'ledger',
    );
  }
  if (m.layout === 'gallery' || m.layout === 'column') {
    const gallery = m.layout === 'gallery',
      left = gallery ? 48 : 0,
      top = gallery ? h * 0.218 : h * 0.208,
      w = gallery ? 480 : 506,
      hh = h * (gallery ? 0.585 : 0.612);
    rect(c, left, top, w, hh, mid);
    stroke(c, left + 8, top + 8, w - 16, hh - 16, line);
    if (im) {
      cover(c, im, left + 14, top + 14, w - 28, hh - 28, 0.94);
    } else {
      contain(c, art, left + 9, top + 8, w - 18, hh - 16);
      if (!gallery) ticks(c, left + 32, top + hh - 32, w - 64, line);
    }
    return box(558, h * 0.264, 379, h * 0.837, 122);
  }
  const x = 506,
    y = h * 0.247,
    w = 453,
    hh = h * 0.565,
    cy = y + hh * 0.5;
  if (m.layout === 'arch') {
    arch(c, x - 8, y - 14, w + 16, hh + 28);
    c.strokeStyle = line;
    c.lineWidth = 1.2;
    c.stroke();
    arch(c, x, y, w, hh);
    c.save();
    c.clip();
    rect(c, x, y, w, hh, mid);
    if (im) {
      cover(c, im, x, y, w, hh, 0.94);
    } else {
      contain(c, art, x + 6, y + 36, w - 12, hh - 45);
    }
    c.restore();
    arch(c, x, y, w, hh);
    c.strokeStyle = foil;
    c.stroke();
  } else if (m.layout === 'seal' || m.layout === 'cameo') {
    const r = w * 0.5;
    disc(c, x + w * 0.5, cy, r + 8, null, line);
    disc(c, x + w * 0.5, cy, r, mid, foil);
    if (m.layout === 'seal') {
      for (let i = 0; i < 48; i++) {
        const a = (i * Math.PI) / 24;
        rule(
          c,
          x + w / 2 + Math.cos(a) * (r - 4),
          cy + Math.sin(a) * (r - 4),
          x + w / 2 + Math.cos(a) * (r - (i % 4 === 0 ? 14 : 8)),
          cy + Math.sin(a) * (r - (i % 4 === 0 ? 14 : 8)),
          line,
          1,
        );
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        lozenge(c, x + w / 2 + Math.cos(a) * (r + 8), cy + Math.sin(a) * (r + 8), 3.3, foil);
      }
    }
    contain(c, art, x + 16, cy - w / 2 + 16, w - 32, w - 32);
  } else if (m.layout === 'canopy') {
    rule(c, x + 16, y - 12, x + w - 16, y - 12, foil, 4);
    rect(c, x + 28, y - 9, w - 56, hh, mid);
    stroke(c, x + 34, y - 4, w - 68, hh - 11, line);
    for (let i = 0; i < 23; i++) {
      const xx = x + 32 + (i * (w - 66)) / 22;
      rule(c, xx, y + hh - 8, xx, y + hh + (i % 2 === 0 ? 7 : 2), foil, 1.5);
    }
    contain(c, art, x + 31, y + 10, w - 62, hh - 24);
  } else {
    rect(c, x - 7, cy - w / 2 - 6, w + 14, w + 14, tint);
    stroke(c, x - 7, cy - w / 2 - 6, w + 14, w + 14, line);
    contain(c, art, x, cy - w / 2, w, w);
    ticks(c, x - 5, cy + w / 2 + 18, w + 10, line);
  }
  return box(65, h * 0.266, 418, h * 0.829, 135);
}

// Every plated devotional poster carries the festival's own deity picture, regardless of
// which of the ten composition engines drew the sheet. The vignette is applied last so it
// is never buried under paper texture, ornament or the plate crop.
export function paintArt(c, h, m, palette, im, art, adjust = {}, deityIm = null) {
  const result = paintArtBase(c, h, m, palette, im, art, adjust, deityIm);
  if (m.plate && m.deityPicture && deityIm) {
    const foil = palette.colors[1];
    deityVignette(
      c,
      deityIm,
      596,
      h * 0.15,
      Math.min(m.deityInPlate ? 210 : 380, h * (m.deityInPlate ? 0.17 : 0.31)),
      foil,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Direction II: the CompositionEngine renderer. Each archetype places artwork and copy
// differently; backgrounds and decorative programmes are independent authored systems.
// All coordinates stay in the 1000-unit print space and keep the brand zone clear.
function creativeBackground(c, h, m, [base, foil]) {
  const faint = rgba(foil, 0.1),
    softer = rgba(foil, 0.055);
  switch (m.background) {
    case 'grid':
      for (let x = 50; x < 1000; x += 50) rule(c, x, 40, x, h - 40, softer, 0.8);
      for (let y = 100; y < h - 60; y += 50) rule(c, 40, y, 960, y, softer, 0.8);
      break;
    case 'halftone':
      for (let y = 210; y < h - 170; y += 17)
        for (let x = 55; x < 950; x += 17) {
          const d = Math.abs(x - 500) / 500;
          if (d > 0.55) disc(c, x, y, 1 + d * 1.5, rgba(foil, 0.06 + d * 0.08));
        }
      break;
    case 'stripe':
      for (let i = 0; i < 7; i++)
        rect(c, (i * 1000) / 7, 0, 1000 / 14, h, rgba(foil, i % 2 ? 0.035 : 0.06));
      break;
    case 'vignette': {
      const g = c.createRadialGradient(500, h * 0.42, h * 0.13, 500, h * 0.42, h * 0.78);
      g.addColorStop(0, rgba(base, 0));
      g.addColorStop(1, rgba('#1b1b22', 0.16));
      rect(c, 0, 0, 1000, h, g);
      break;
    }
    case 'blueprint':
      for (let x = 60; x < 960; x += 80) rule(c, x, 60, x, h - 60, softer, 1);
      for (let y = 120; y < h - 100; y += 80) rule(c, 60, y, 940, y, softer, 1);
      for (const [x, y] of [[80, h - 90], [920, h - 90], [80, 190], [920, 190]]) {
        rule(c, x - 8, y, x + 8, y, faint, 1);
        rule(c, x, y - 8, x, y + 8, faint, 1);
      }
      break;
    case 'spotlight': {
      const g = c.createRadialGradient(500, h * 0.36, 20, 500, h * 0.36, h * 0.48);
      g.addColorStop(0, rgba('#fff2c9', 0.13));
      g.addColorStop(1, rgba(base, 0));
      rect(c, 0, 0, 1000, h, g);
      break;
    }
    case 'diagonal':
      c.save();
      c.translate(500, h * 0.5);
      c.rotate(-0.34);
      for (let i = -4; i < 5; i++) rect(c, i * 200 - 30, -h, 50, h * 2, rgba(foil, 0.035));
      c.restore();
      break;
    case 'frame':
      stroke(c, 31, 31, 938, h - 62, faint, 1.2);
      stroke(c, 43, 43, 914, h - 86, softer, 0.9);
      break;
    default:
      break;
  }
}

function creativeOrnament(c, h, m, [base, foil], area) {
  const ink = rgba(foil, 0.62),
    soft = rgba(foil, 0.3);
  const { x, y, w, hh } = area;
  switch (m.ornament) {
    case 'kolam':
      for (let i = 0; i <= 20; i++) {
        const px = x + (w * i) / 20;
        lozenge(c, px, y - 9, 4.5, i % 2 ? ink : soft);
        lozenge(c, px, y + hh + 9, 4.5, i % 2 ? soft : ink);
      }
      break;
    case 'swiss':
      for (const [px, py] of [[x, y], [x + w, y], [x, y + hh], [x + w, y + hh]]) {
        rule(c, px - 9, py, px + 9, py, ink, 1);
        rule(c, px, py - 9, px, py + 9, ink, 1);
      }
      break;
    case 'botanical':
      for (const side of [-1, 1]) {
        c.save();
        c.translate(side < 0 ? x - 12 : x + w + 12, y + hh * 0.5);
        c.scale(side, 1);
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.moveTo(0, i * 15 - 45);
          c.quadraticCurveTo(19, i * 15 - 53, 22, i * 15 - 35);
          c.strokeStyle = soft;
          c.lineWidth = 1.1;
          c.stroke();
        }
        c.restore();
      }
      break;
    case 'stars':
      for (let i = 0; i < 24; i++) {
        const px = x + ((i * 97) % Math.round(w)),
          py = y - 14 + ((i * 43) % Math.round(hh + 28));
        lozenge(c, px, py, i % 5 === 0 ? 4 : 2, i % 3 ? soft : ink);
      }
      break;
    case 'arch':
      arch(c, x - 13, y - 16, w + 26, hh + 30);
      c.strokeStyle = ink;
      c.lineWidth = 1.4;
      c.stroke();
      break;
    case 'rangoli':
      for (let r = 30; r <= 120; r += 30) {
        c.beginPath();
        c.arc(x + w / 2, y + hh / 2, r, 0, Math.PI * 2);
        c.strokeStyle = soft;
        c.lineWidth = 1;
        c.stroke();
      }
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 12;
        rule(
          c,
          x + w / 2 + Math.cos(a) * 126,
          y + hh / 2 + Math.sin(a) * 126,
          x + w / 2 + Math.cos(a) * 137,
          y + hh / 2 + Math.sin(a) * 137,
          ink,
          1,
        );
      }
      break;
    case 'brackets':
      for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + hh, 1, -1], [x + w, y + hh, -1, -1]]) {
        rule(c, px, py, px + sx * 30, py, ink, 2);
        rule(c, px, py, px, py + sy * 30, ink, 2);
      }
      break;
    case 'rules':
      rule(c, x, y - 15, x + w, y - 15, ink, 1.4);
      rule(c, x, y + hh + 15, x + w, y + hh + 15, ink, 1.4);
      rule(c, x + w * 0.25, y - 22, x + w * 0.75, y - 22, soft, 0.8);
      break;
    case 'layers':
      stroke(c, x - 12, y - 12, w + 24, hh + 24, soft, 1);
      stroke(c, x - 22, y - 22, w + 44, hh + 44, rgba(foil, 0.18), 1);
      break;
    default:
      break;
  }
  if (m.background === 'plain') rect(c, x + w - 42, y + hh + 22, 42, 3, mix(foil, base, 0.2));
}

function frameArt(c, area, draw) {
  const { x, y, w, hh, shape, rotate = 0 } = area;
  c.save();
  if (rotate) {
    c.translate(x + w / 2, y + hh / 2);
    c.rotate(rotate);
    c.translate(-(x + w / 2), -(y + hh / 2));
  }
  if (shape === 'circle' || shape === 'arch') {
    c.beginPath();
    if (shape === 'circle') c.arc(x + w / 2, y + hh / 2, Math.min(w, hh) / 2, 0, Math.PI * 2);
    else arch(c, x, y, w, hh);
    c.clip();
  }
  draw();
  c.restore();
  if (shape === 'circle') {
    c.beginPath();
    c.arc(x + w / 2, y + hh / 2, Math.min(w, hh) / 2 + 5, 0, Math.PI * 2);
    c.strokeStyle = rgba('#c9a35e', 0.75);
    c.lineWidth = 1.5;
    c.stroke();
  } else if (shape === 'arch') {
    arch(c, x - 5, y - 5, w + 10, hh + 10);
    c.strokeStyle = rgba('#c9a35e', 0.7);
    c.lineWidth = 1.4;
    c.stroke();
  } else {
    stroke(c, x - 6, y - 6, w + 12, hh + 12, rgba('#c9a35e', 0.58), 1.2);
  }
}

function creativePlate(c, h, m, palette, im, art, adjust = {}, deityIm = null) {
  const [base, foil] = palette.colors;
  const comp = compositionById(m.compositionId);
  const { art: area, text, inset } = comp.geometry(h);
  if (adjust.shape && adjust.shape !== 'auto') area.shape = adjust.shape;
  creativeBackground(c, h, m, palette.colors);
  creativeOrnament(c, h, m, palette.colors, { x: area.x, y: area.y, w: area.w, hh: area.h });
  const matte = mix(base, foil, 0.1);
  frameArt(c, area, () => {
    rect(c, area.x - 10, area.y - 10, area.w + 20, area.h + 20, matte);
    if (im) {
      if (m.plate) cropPlate(c, im, area.x + 4, area.y + 4, area.w - 8, area.h - 8, m);
      else contain(c, im, area.x + 4, area.y + 4, area.w - 8, area.h - 8);
      // A painted plate is the ground, not a replacement for the subject's own drawn
      // vocabulary. The line work is laid over it so each pass remains a distinct scene.
      // Sacred paintings and personal photographs are never overprinted this way.
      if (art && m.plate) {
        c.save();
        c.globalAlpha = 0.38;
        contain(c, art, area.x + 7, area.y + 7, area.w - 14, area.h - 14);
        c.restore();
      }
    } else if (art) contain(c, art, area.x + 7, area.y + 7, area.w - 14, area.h - 14);
    else {
      for (let i = 1; i < 5; i++)
        rule(c, area.x + 12, area.y + (area.h * i) / 5, area.x + area.w - 12, area.y + (area.h * i) / 5, rgba(foil, 0.25), 1);
    }
  });
  if (inset && art) {
    rect(c, inset.x - 5, inset.y - 5, inset.w + 10, inset.h + 10, matte);
    stroke(c, inset.x - 5, inset.y - 5, inset.w + 10, inset.h + 10, rgba(foil, 0.5), 1);
    contain(c, art, inset.x, inset.y, inset.w, inset.h);
  }
  if (inset && !art && im) {
    // A companion drawn from the subject's own vocabulary keeps the diptych meaningful.
    ticks(c, inset.x, inset.y + inset.h - 10, inset.w, rgba(foil, 0.5));
    for (let i = 0; i < 5; i++) lozenge(c, inset.x + (inset.w * (i + 0.5)) / 5, inset.y + inset.h * 0.45, 5, foil);
  }
  if (m.compositionId === 'blueprint') ticks(c, area.x - 4, area.y + area.h + 14, area.w + 8, rgba(foil, 0.55));
  if (m.compositionId === 'archive') rule(c, 80, h - 122, 920, h - 122, rgba(foil, 0.4), 1);
  return text;
}
