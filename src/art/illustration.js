import { vedic } from './vedic.js';
import { story } from './stories.js';
import { emblem } from './emblems.js';
import { craft } from './atelier.js';
import { occasionArt } from './occasions.js';
import { defs, place, G, R, C, L, P, use, rep, ring, gold, paper, ground, brass } from './svg.js';
export function motif(id) {
  const [key, arg] = id.split(':');
  const content =
    story(key, arg, motif) ??
    emblem(key, arg, motif) ??
    vedic(key, arg, motif) ??
    craft(key, arg, motif) ??
    occasionArt(key, arg, motif);
  if (content == null) throw new Error(`Missing illustration: ${id}`);
  return content;
}
// A scene mixes subjects at different scales / depths. These are intentionally different
// objects and spatial arrangements, not filters applied to one background picture.
function compose(m) {
  const a = motif(m.hero),
    b = motif(m.companion);
  if (m.family === 'occasion' || m.family === 'devotional') {
    switch (m.sequence) {
      case 1:
        return place(a, -10, 39, 180) + place(b, 116, 84, 140) + use('jasmine', 125, 199, 18);
      case 2:
        return (
          ring('leaf', 128, 124, 103, 28, 20) +
          ring('jasmine', 128, 124, 102, 9, 16) +
          place(a, 31, 28, 190) +
          place(b, 145, 154, 93)
        );
      case 3:
        return (
          R(17, 202, 222, 8, brass, gold, 0.8, 3) + place(a, 3, 39, 184) + place(b, 144, 106, 112)
        );
      case 4:
        return (
          G(R(28, 24, 193, 189, paper, gold, 1.4, 3), 'rotate(-6 128 128)') +
          place(a, 32, 29, 175) +
          place(b, 152, 146, 103)
        );
      case 5:
        return (
          C(125, 127, 101, 'none', gold, 0.8) +
          L(21, 215, 237, 215, gold, 0.8) +
          rep(18, (i) => L(30 + i * 11, 213, 30 + i * 11, i % 3 ? 219 : 223, gold, 0.8)) +
          place(a, 4, 4, 213) +
          place(b, 152, 100, 99)
        );
      case 6:
        return (
          C(128, 128, 108, '#35534b', gold, 3) +
          ring('petal', 128, 128, 98, 24, 9) +
          place(a, 34, 34, 188) +
          place(b, 159, 167, 65)
        );
      default:
        return place(a, 1, 0, 238) + place(b, 168, 168, 84);
    }
  }
  // Keep diagrams, sign positions and their labels clear of other decorative elements.
  if (m.medium === 'Chart study') return place(a, 0, 0, 213) + place(b, 166, 173, 85);
  if (m.hero.startsWith('sign:') || m.hero.startsWith('planet:'))
    return place(a, 0, 0, 227) + place(b, 161, 167, 88);
  return place(a, -2, -1, 239) + place(b, 176, 177, 78);
}
const svg = (s, w = 256) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w * 3}" height="768" viewBox="0 0 ${w} 256" stroke-linecap="round" stroke-linejoin="round">${defs()}${s}</svg>`;
const panoramas = new Set(['ledger', 'stationery', 'window']);
function spread(m) {
  const a = motif(m.hero),
    b = motif(m.companion);
  if (m.hero.startsWith('chart-pair') || m.hero === 'regional-charts') {
    const match = m.hero.endsWith(':match'),
      label = m.hero.split(':')[1] || 9;
    return (
      place(motif(match ? 'chart-native:1' : 'division:1'), 24, 6, 234, 234, -3) +
      place(
        m.hero === 'regional-charts'
          ? motif('north-chart')
          : motif(match ? 'chart-native:2' : `division:${label}`),
        273,
        4,
        235,
        235,
        3,
      ) +
      place(b, 470, 155, 87)
    );
  }
  if (m.hero.startsWith('story:')) return place(a, 16, -5, 275) + place(b, 339, 50, 184);
  if (m.medium === 'Chart study') return place(a, 40, -1, 257) + place(b, 335, 24, 204);
  if (m.sequence === 2)
    return ring('leaf', 151, 129, 109, 27, 18) + place(a, 50, 25, 205) + place(b, 298, 24, 220);
  return place(a, 39, -2, 258) + place(b, 322, 24, 205);
}
export const sceneSvg = (m) =>
  !m.hero
    ? svg(motif(m.companion))
    : panoramas.has(m.layout)
      ? svg(spread(m), 560)
      : svg(compose(m));
const cache = new Map();
export function illustrationImage(m) {
  const key = m.key;
  if (cache.has(key)) {
    const v = cache.get(key);
    cache.delete(key);
    cache.set(key, v);
    return v;
  }
  const task = (async () => {
    const text = sceneSvg(m);
    const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  })();
  cache.set(key, task);
  if (cache.size > 12) cache.delete(cache.keys().next().value);
  task.catch(() => cache.delete(key));
  return task;
}
