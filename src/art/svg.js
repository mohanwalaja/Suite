// Small deterministic vector vocabulary. All paths, text, goldwork and botanical motifs
// are local, resolution-independent artwork. No font service or remote SVG references.
export const gold = 'url(#gold)',
  brass = 'url(#brass)',
  silver = 'url(#silver)',
  wood = 'url(#wood)',
  paper = 'url(#paper)',
  silk = 'url(#silk)',
  jade = 'url(#jade)',
  blush = 'url(#blush)',
  navy = '#23384b',
  brown = '#735338',
  cream = '#fff2cf';
export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  );
export const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
export const G = (s, tf = '', attrs = '') => `<g transform="${tf}" ${attrs}>${s}</g>`;
export const P = (d, fill = 'none', stroke = 'none', sw = 1, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
export const C = (x, y, r, f, stroke = 'none', sw = 1) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const E = (x, y, rx, ry, f, stroke = 'none', sw = 1) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const R = (x, y, w, h, f, stroke = 'none', sw = 1, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const L = (a, b, x, y, stroke, sw = 1, extra = '') =>
  P(`M${a} ${b}L${x} ${y}`, 'none', stroke, sw, extra);
export const T = (
  x,
  y,
  s,
  size = 12,
  color = brown,
  tracking = 0,
  face = 'Georgia,serif',
  anchor = 'middle',
) =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="${face}" font-size="${size}" letter-spacing="${tracking}" text-anchor="${anchor}">${esc(s)}</text>`;
export const place = (s, x, y, w, h = w, rotate = 0) =>
  G(s, `translate(${x} ${y}) scale(${w / 256} ${h / 256}) rotate(${rotate} 128 128)`);
export const use = (key, x, y, size, rot = 0) =>
  `<use href="#${key}" xlink:href="#${key}" transform="translate(${x} ${y}) rotate(${rot}) scale(${size / 32})"/>`;
export const polar = (x, y, r, a) => [
  x + r * Math.cos((a * Math.PI) / 180),
  y + r * Math.sin((a * Math.PI) / 180),
];
export const ring = (key, x, y, r, n, size, offset = 0) =>
  rep(n, (i) => {
    const a = (i * 360) / n + offset,
      [px, py] = polar(x, y, r, a);
    return use(key, px, py, size, a + 90);
  });
export const ticks = (x, y, r, n, col = gold, major = 4) =>
  rep(n, (i) => {
    const a = (i * 360) / n - 90;
    return L(
      ...polar(x, y, r - (i % major ? 2.6 : 7), a),
      ...polar(x, y, r, a),
      col,
      i % major ? 0.7 : 1.3,
    );
  });
export const star = (x, y, r, f = gold) =>
  P(
    `M${x} ${y - r}Q${x + r * 0.14} ${y - r * 0.16} ${x + r * 0.75} ${y}Q${x + r * 0.14} ${y + r * 0.16} ${x} ${y + r}Q${x - r * 0.14} ${y + r * 0.16} ${x - r * 0.75} ${y}Q${x - r * 0.14} ${y - r * 0.16} ${x} ${y - r}Z`,
    f,
  );
export const swirls = (x, y, w, col = gold) =>
  G(
    P('M0 0Q18 -16 30 -4T60 0Q47 -3 42 -10M60 0Q80 -15 94 -4T120 0', 'none', col, 1.2) +
      use('leaf', 26, -6, 10, 85) +
      use('leaf', 83, -7, 9, 45),
    `translate(${x} ${y}) scale(${w / 120})`,
  );
export const selvedge = (x, y, w, col = gold) =>
  L(x, y, x + w, y, col, 1) +
  L(x, y + 7, x + w, y + 7, col, 1) +
  rep(20, (i) => P(`M${x + (w * i) / 20} ${y + 4}l${w / 40} -3 ${w / 40} 3 -${w / 40} 2z`, col));
export const rosette = (x, y, r, n = 12) =>
  C(x, y, r, gold, '#a07943', 0.8) +
  C(x, y, r * 0.86, paper) +
  ring('petal', x, y, r * 0.52, n, r * 0.55) +
  C(x, y, r * 0.23, brass) +
  C(x, y, r * 0.11, cream);
export const ground = (x = 128, y = 227, w = 83) => E(x, y, w, 6, 'url(#shadow)');
const grad = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">${stops.map(([off, c]) => `<stop offset="${off}" stop-color="${c}"/>`).join('')}</linearGradient>`;
export function defs() {
  return `<defs>${[
    [
      'gold',
      [
        [0, '#8f5e2d'],
        [0.18, '#e6c486'],
        [0.38, '#fff0be'],
        [0.54, '#c49a55'],
        [0.78, '#edcea1'],
        [1, '#936731'],
      ],
    ],
    [
      'brass',
      [
        [0, '#6a4327'],
        [0.25, '#ba8749'],
        [0.5, '#f6d99b'],
        [0.62, '#b18245'],
        [1, '#7b572f'],
      ],
    ],
    [
      'silver',
      [
        [0, '#728292'],
        [0.26, '#cfd4da'],
        [0.45, '#fffdf0'],
        [0.63, '#a0a9b3'],
        [1, '#718296'],
      ],
    ],
    [
      'wood',
      [
        [0, '#6f422e'],
        [0.28, '#b5794c'],
        [0.48, '#e3b17a'],
        [0.7, '#a57047'],
        [1, '#694530'],
      ],
    ],
    [
      'paper',
      [
        [0, '#fff6dc'],
        [0.35, '#f7e6be'],
        [0.72, '#efdab3'],
        [1, '#ddbd8e'],
      ],
    ],
    [
      'silk',
      [
        [0, '#562139'],
        [0.25, '#96405a'],
        [0.52, '#ca6872'],
        [0.65, '#9c4754'],
        [1, '#702d40'],
      ],
    ],
    [
      'jade',
      [
        [0, '#233f38'],
        [0.32, '#64856e'],
        [0.62, '#93a787'],
        [1, '#315b4b'],
      ],
    ],
    [
      'blush',
      [
        [0, '#c4837e'],
        [0.27, '#ecc1ad'],
        [0.55, '#f9e0ca'],
        [1, '#d9978d'],
      ],
    ],
  ]
    .map(([id, stops]) => grad(id, stops))
    .join(
      '',
    )}<clipPath id="sphere"><circle cx="128" cy="128" r="68"/></clipPath><radialGradient id="shadow"><stop stop-color="#482e27" stop-opacity=".31"/><stop offset="1" stop-color="#482e27" stop-opacity="0"/></radialGradient><pattern id="etch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V4" stroke="#85683f" stroke-opacity=".28" stroke-width=".6"/></pattern><pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0V5M0 0H5" stroke="#fff1cf" stroke-opacity=".22" stroke-width=".7"/></pattern>
 <g id="leaf">${P('M0 15C-14 5 -12 -7 0 -17C12 -7 13 7 0 15Z', jade, '#4b6b51', 0.6) + L(0, 14, 0, -14, '#d3c393', 0.7) + rep(5, (i) => P(`M0 ${-9 + i * 4}l-5 -4m5 4l5 -4`, 'none', '#c4c096', 0.55))}</g>
 <g id="petal">${P('M0 14Q-13 -1 0 -15Q13 -1 0 14Z', gold, '#a77b47', 0.45) + L(0, 10, 0, -10, '#fff0c9', 0.6)}</g>
 <g id="jasmine">${rep(7, (i) => G(P('M0 1Q-10 -4 -8 -13Q-1 -19 2 -10L3 0Z', '#fff6df', '#bcae88', 0.65), `rotate(${(i * 360) / 7})`)) + C(0, 0, 3.4, '#dbb676') + C(0, 0, 1.4, '#95844f')}</g>
 <g id="rose">${rep(4, (l) => rep(6, (i) => G(E(0, -(10 - l * 2.3), 7.6 - l, 6.7 - l, ['#8e4252', '#b66268', '#d38d87', '#ecb4a0'][l], '#9a5661', 0.46), `rotate(${i * 60 + l * 22})`))) + C(0, 0, 2.4, '#b2745f')}</g>
 <g id="marigold">${rep(3, (l) => rep(11, (i) => G(E(0, -10 + l * 3, 3.3, 6 - l, ['#ce7f30', '#e9a83f', '#f2c964'][l], '#c18945', 0.35), `rotate(${(i * 360) / 11 + l * 12})`))) + C(0, 0, 2, '#9f6c32')}</g>
 <g id="lotus">${rep(7, (i) => G(P('M0 9C-12 5 -10 -6 0 -16C8 -5 11 6 0 9Z', i % 2 ? blush : '#edc9b5', '#b88175', 0.7), `rotate(${(i - 3) * 23} 0 9)`)) + P('M-17 10Q0 18 17 10', 'none', '#849773', 1.6)}</g>
 <g id="star">${star(0, 0, 15)}</g></defs>`;
}
