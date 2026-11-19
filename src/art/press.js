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
function cover(c, im, x, y, w, h, anchor = 0.5) {
  const iw = im.naturalWidth,
    ih = im.naturalHeight,
    s = Math.max(w / iw, h / ih);
  c.drawImage(im, (iw - w / s) * anchor, (ih - h / s) * 0.48, w / s, h / s, x, y, w, h);
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
export function paintArt(c, h, m, palette, im, art) {
  const [base, foil, ink] = palette.colors;
  const tint = mix(base, ink, 0.07),
    mid = mix(base, foil, 0.15),
    line = rgba(foil, 0.68);
  paper(c, h, base);
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
  const bleed = im && (m.layout === 'cover' || m.hero || m.setting === 'birth-astrologer');
  if (bleed) {
    cover(c, im, 0, 0, 1000, h, 0.88);
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
