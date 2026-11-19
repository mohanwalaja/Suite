import {
  G,
  P,
  C,
  E,
  R,
  L,
  T,
  rep,
  place,
  use,
  polar,
  ring,
  ticks,
  star,
  swirls,
  selvedge,
  rosette,
  ground,
  gold,
  brass,
  silver,
  wood,
  paper,
  jade,
  brown,
  navy,
  cream,
  blush,
} from './svg.js';
import { signs, planets, checks, mansionNames } from './models.js';
// Fixed sign positions, clockwise from Mesha. No planetary placements are invented.
const cells = [
  [1, 0],
  [2, 0],
  [3, 0],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [0, 3],
  [0, 2],
  [0, 1],
  [0, 0],
];
const short = [
  'Mesha',
  'Vrisha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrisch.',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
];
function south(label = 'RĀSI', number = 0, blue = false) {
  const ink = blue ? '#d4e5e7' : '#764f32',
    border = blue ? '#b3c9ca' : '#ad7842';
  return (
    R(12, 12, 232, 232, blue ? '#284355' : paper, gold, 2, 5) +
    R(18, 18, 220, 220, 'none', border, 0.9) +
    R(22, 22, 212, 212, 'none', border, 0.65) +
    cells
      .map(([x, y], i) => {
        const a = 22 + 53 * x,
          b = 22 + 53 * y;
        return (
          R(
            a,
            b,
            53,
            53,
            i === number - 1 ? '#deb269' : i % 2 ? '#ffffff0c' : '#a98c5909',
            border,
            1.1,
          ) +
          T(a + 7, b + 12, String(i + 1).padStart(2, '0'), 8, ink, 1, 'sans-serif', 'start') +
          T(a + 26.5, b + 32, short[i], 10, ink) +
          L(a + 19, b + 39, a + 34, b + 39, border, 0.6)
        );
      })
      .join('') +
    rosette(128, 99, 9, 10) +
    T(128, 134, label, 22, ink, 1) +
    T(128, 151, 'SIGN GUIDE', 7.2, ink, 1.8, 'sans-serif') +
    swirls(105, 162, 47, border)
  );
}
function divisionStudy(n) {
  const count = Math.max(1, n);
  const ticks = rep(count, (i) =>
    R(22 + (i * 212) / count, 209, 212 / count, 19, i % 2 ? jade : brass, paper, 0.55),
  );
  return (
    place(south('D' + count), 17, -4, 222, 200) +
    R(16, 189, 224, 52, paper, brass, 1.1, 3) +
    T(128, 201, `${count} ${count === 1 ? 'DIVISION' : 'DIVISIONS'} OF A SIGN`, 7.2, brown, 1.1) +
    ticks +
    T(128, 237, '0°                                 30°', 6.5, brown, 1)
  );
}
function north(n = 0) {
  const pos = [
    [128, 80],
    [76, 42],
    [42, 75],
    [78, 130],
    [42, 180],
    [78, 217],
    [128, 178],
    [178, 217],
    [214, 180],
    [178, 128],
    [214, 75],
    [178, 42],
  ];
  return (
    R(13, 13, 230, 230, paper, gold, 2, 4) +
    R(22, 22, 212, 212, 'none', '#987147', 1.6) +
    P('M22 22L234 234M234 22L22 234M128 22L234 128 128 234 22 128Z', 'none', '#87623e', 1.6) +
    pos
      .map(
        ([x, y], i) =>
          (i === n - 1 ? C(x, y - 3, 14, '#d2ac6a') : '') + T(x, y, String(i + 1), 13, brown),
      )
      .join('') +
    rosette(128, 128, 12, 8)
  );
}
const orbit = (r, tilt = 0) =>
  G(E(128, 128, r, r * 0.46, 'none', gold, 1.15), `rotate(${tilt} 128 128)`);
function dial(core, labels, fill = '#213d40', active = -1) {
  const n = labels.length;
  return (
    C(128, 128, 112, brass, '#947348', 1.3) +
    C(128, 128, 107, fill, gold, 1) +
    C(128, 128, 94, 'none', gold, 0.7) +
    C(128, 128, 70, 'none', gold, 1) +
    ticks(128, 128, 103, n * 4) +
    labels
      .map((s, i) => {
        const a = -90 + (i * 360) / n,
          [x, y] = polar(128, 128, 82, a);
        return (
          L(...polar(128, 128, 70, a - 180 / n), ...polar(128, 128, 94, a - 180 / n), gold, 0.7) +
          (i === active ? C(x, y, 8, gold) : '') +
          T(x, y + 3, s, n > 16 ? 7 : 9, i === active ? navy : cream, 0, 'Georgia,serif')
        );
      })
      .join('') +
    core
  );
}
function phase(x, y, r, idx) {
  const a = ((((idx % 30) + 30) % 30) / 30) * 2 * Math.PI,
    light = (1 - Math.cos(a)) / 2;
  let d = '';
  const coords = [];
  for (let j = 0; j <= 32; j++) {
    const yy = -r + (2 * r * j) / 32,
      xx = Math.sqrt(Math.max(0, r * r - yy * yy));
    coords.push([x + (a <= Math.PI ? 1 : -1) * xx, y + yy]);
  }
  for (let j = 32; j >= 0; j--) {
    const yy = -r + (2 * r * j) / 32,
      xx = Math.sqrt(Math.max(0, r * r - yy * yy));
    coords.push([x + (a <= Math.PI ? 1 : -1) * xx * (1 - 2 * light), y + yy]);
  }
  d = 'M' + coords.map((v) => v.join(' ')).join('L') + 'Z';
  return C(x, y, r, '#334352', gold, 0.9) + P(d, paper) + C(x, y, r, 'none', gold, 0.7);
}
function planet(i = 0) {
  const base = C(
    128,
    128,
    68,
    [
      '#e7ad58',
      '#dcccb1',
      '#bd7355',
      '#baa88c',
      '#d0a580',
      '#efd5a9',
      '#d4b98e',
      '#577479',
      '#8e7997',
    ][i],
    gold,
    1.3,
  );
  const trim = rep(26, (j) => {
    const x = 128 + Math.sin(j * 7.59) * 49,
      y = 128 + Math.cos(j * 4.91) * 38;
    return C(x, y, 1.5 + (j % 4), '#806c5c22', '#fff1cb33', 0.45);
  });
  switch (i) {
    case 0:
      return (
        ring('petal', 128, 128, 83, 24, 38) +
        ring('petal', 128, 128, 75, 16, 22, 9) +
        base +
        ring('petal', 128, 128, 48, 16, 15) +
        C(128, 128, 34, gold) +
        star(128, 128, 16, '#f7e3ab')
      );
    case 1:
      return (
        phase(128, 128, 79, 10) +
        rep(12, (j) =>
          C(150 + Math.sin(j * 3.1) * 26, 127 + Math.cos(j * 5) * 49, 2 + (j % 5), '#bfa78355'),
        )
      );
    case 4:
      return (
        base +
        `<g clip-path="url(#sphere)">${rep(9, (j) => P(`M52 ${62 + j * 16}Q110 ${80 + j * 12} 210 ${65 + j * 17}`, 'none', j % 2 ? '#a77655' : '#f3d3a4', j % 2 ? 5 : 8))}${E(158, 146, 15, 7, '#ae694c')}${E(158, 146, 9, 3, '#e3b08c')}</g>`
      );
    case 6:
      return (
        G(E(128, 128, 114, 28, 'none', brass, 11), 'rotate(-19 128 128)') +
        base +
        trim +
        G(
          P('M14 128C14 165 241 165 242 128', 'none', gold, 12) +
            P('M16 131C40 160 222 160 241 128', 'none', '#997349', 1.1),
          'rotate(-19 128 128)',
        )
      );
    case 7:
    case 8:
      return (
        orbit(101, 34) +
        orbit(101, -34) +
        C(128, 128, 64, 'none', gold, 1) +
        P(
          i === 7
            ? 'M64 146C78 146 84 80 128 80S180 146 192 146'
            : 'M64 106C78 106 84 175 128 175S180 106 192 106',
          'none',
          paper,
          7,
        ) +
        C(64, i === 7 ? 146 : 106, 8, brass) +
        C(192, i === 7 ? 146 : 106, 8, brass)
      );
    default:
      return (
        base +
        trim +
        `<g clip-path="url(#sphere)">${rep(7, (j) => P(`M55 ${81 + j * 14}q36 -13 63 1t81 -3`, 'none', i === 2 ? '#a6684b66' : i === 5 ? '#fff1cd88' : '#e6d8b344', 2 + (j % 4)))}</g>`
      );
  }
}
function zodiac(i) {
  const f = paper,
    st = '#a98450',
    w = 2;
  const face =
    P('M92 94Q128 70 164 94L151 158Q132 186 113 160Z', f, st, w) +
    E(111, 114, 4, 2, navy) +
    E(145, 114, 4, 2, navy) +
    P('M119 150Q128 156 137 150', 'none', st, 2);
  const horn = (d) => P(d, 'none', brass, 10) + P(d, 'none', cream, 1.5);
  switch (i) {
    case 0:
      return (
        horn('M104 102C65 68 61 108 76 119S101 108 88 103') +
        horn('M152 102C191 68 195 108 180 119S155 108 168 103') +
        face +
        P('M110 83Q118 67 128 79Q139 66 148 86', paper, st, 1)
      );
    case 1:
      return (
        horn('M111 93Q70 96 63 52Q57 103 88 110') +
        horn('M145 93Q186 96 193 52Q199 103 168 110') +
        face +
        E(128, 155, 18, 11, brass) +
        C(119, 154, 2, navy) +
        C(137, 154, 2, navy)
      );
    case 2:
      return rep(2, (j) =>
        G(
          C(102, 96, 17, paper, st, 1.4) +
            P('M82 166Q79 120 99 116Q124 112 125 166Z', j ? blush : jade, gold, 1.5) +
            P('M84 166Q106 155 126 166', 'none', gold, 2),
          `translate(${j * 49} ${j * 7})`,
        ),
      );
    case 3:
      return (
        E(128, 130, 37, 25, brass) +
        rep(3, (j) =>
          P(
            `M94 ${122 + j * 10}l-19 ${-4 + j * 4} -9 14M162 ${122 + j * 10}l19 ${-4 + j * 4} 9 14`,
            'none',
            gold,
            3,
          ),
        ) +
        P(
          'M97 115Q67 118 69 85L82 94 86 78Q96 99 85 106M159 115Q189 118 187 85L174 94 170 78Q160 99 172 106',
          brass,
          gold,
          1.2,
        ) +
        C(116, 117, 3, navy) +
        C(140, 117, 3, navy)
      );
    case 4:
      return (
        ring('petal', 128, 123, 45, 19, 37) +
        face +
        P('M117 142l11 11 11-11Z', brass) +
        P('M128 151v10m-14 -5q14 12 28 0', 'none', st, 2)
      );
    case 5:
      return (
        C(128, 88, 16, paper, st, 1.3) +
        P('M106 88Q107 60 130 66Q156 68 149 99L140 85Q125 88 117 77Z', brass) +
        P('M120 106Q99 127 90 179Q133 187 161 170L139 109Z', blush, gold, 1.8) +
        P('M115 116Q130 146 157 124', 'none', paper, 5) +
        G(
          use('leaf', 158, 119, 21, 24) +
            use('leaf', 164, 100, 17, 9) +
            L(151, 150, 170, 78, gold, 2),
        )
      );
    case 6:
      return (
        L(128, 72, 128, 173, brass, 6) +
        P('M72 101Q128 92 183 104', 'none', gold, 5) +
        rep(2, (j) =>
          G(
            P('M77 105L61 141H96Z', 'none', gold, 1.6) +
              P('M57 141Q79 168 100 141Z', brass, gold, 1.2),
            `translate(${j * 98} ${j * 2})`,
          ),
        ) +
        P('M99 178Q128 158 157 178Z', brass) +
        star(128, 77, 10)
      );
    case 7:
      return (
        E(124, 140, 18, 30, brass) +
        rep(6, (j) => E(124 + j * 9, 158 - j * 11, 10 - j * 0.6, 8, brass, gold, 1)) +
        P('M165 109Q191 83 168 74Q181 72 184 83Q190 102 166 118Z', gold) +
        rep(3, (j) =>
          P(`M110 ${128 + j * 10}l-19 -5 -7 12M138 ${128 + j * 10}l15 0 7 10`, 'none', gold, 2.6),
        ) +
        G(P('M108 119Q78 104 91 84L96 98 104 86Q113 98 102 108', brass))
      );
    case 8:
      return (
        P('M72 70Q166 81 166 181', 'none', brass, 7) +
        P('M72 70L111 135 166 181', 'none', cream, 1.8) +
        L(82, 164, 177, 71, gold, 4) +
        P('M158 75L184 65 176 92Z', brass) +
        P('M82 164l1-18 15-3-3 14Z', jade)
      );
    case 9:
      return (
        face +
        horn('M104 95Q89 62 110 50Q83 53 87 88') +
        horn('M146 93Q148 61 170 59Q152 51 139 73') +
        P('M114 155l14 32 11-29Z', brass)
      );
    case 10:
      return G(
        P('M88 98Q107 78 133 93L143 105Q177 145 145 164Q104 190 89 143L87 109Z', paper, gold, 2) +
          E(116, 93, 28, 8, brass) +
          P('M137 108Q173 119 155 137', 'none', brass, 8) +
          rep(3, (j) => P(`M103 ${164 + j * 4}q-7 17 -30 18t-30 13`, 'none', '#a2c4c8', 2.8)),
        'rotate(20 128 128)',
      );
    case 11:
      return rep(2, (j) =>
        G(
          P(
            'M73 102Q100 77 142 101Q120 130 79 112L59 125 63 100 57 89Z',
            j ? jade : brass,
            gold,
            1.3,
          ) +
            C(129, 102, 2.6, navy) +
            P('M97 94q14 12 -1 21m-7-20q11 10 0 18', 'none', cream, 1.1),
          j ? 'rotate(180 128 128)' : '',
        ),
      );
    default:
      return '';
  }
}
export function vedic(key, arg, draw) {
  const n = Number(arg) || 0;
  switch (key) {
    case 'chart-native':
      return south(n === 1 ? 'I' : 'II');
    case 'rasi':
      return south('RĀSI', n, arg === 'blueprint');
    case 'north-chart':
      return north(n);
    case 'division':
      return divisionStudy(n || 9);
    case 'chart-pair':
    case 'regional-charts':
    case 'house-folio':
    case 'match-folio':
      return (
        place(south(key === 'chart-pair' && arg === 'match' ? 'I' : 'D1'), 1, 14, 165, 165, -5) +
        place(
          key === 'regional-charts'
            ? north()
            : south(arg === 'match' ? 'II' : key === 'house-folio' ? 'BHAVA' : 'D' + (n || 9)),
          91,
          92,
          161,
          161,
          5,
        ) +
        star(214, 46, 11)
      );
    case 'chart-cabinet':
      return (
        R(18, 30, 220, 196, wood, gold, 2, 5) +
        R(26, 39, 204, 179, '#5c4739', brass, 2) +
        rep(4, (i) =>
          place(
            i === 3 ? north() : south(['D1', 'D9', 'D12'][i]),
            29 + (i % 2) * 99,
            44 + Math.floor(i / 2) * 83,
            99,
            81,
          ),
        ) +
        T(128, 238, 'CHART ARCHIVE', 8, gold, 2)
      );
    case 'chart-seal':
      return (
        G(
          R(38, 54, 175, 150, paper, brass, 1, 3) +
            rep(6, (i) => L(53, 83 + i * 16, 168 - i * 7, 83 + i * 16, '#bcaa8c', 1.4)),
          'rotate(-8 128 128)',
        ) +
        C(161, 152, 53, silkColor(), brass, 2) +
        place(south('D1'), 122, 113, 78)
      );
    case 'houses':
      return dial(
        n
          ? place(
              draw(
                [
                  'hands',
                  'coins',
                  'quill',
                  'doorway',
                  'book',
                  'sprout',
                  'rings',
                  'phases',
                  'compass',
                  'tools',
                  'grain',
                  'moon',
                ][n - 1],
              ),
              79,
              72,
              99,
            ) + T(128, 178, `BHAVA ${n}`, 8, cream, 1)
          : T(128, 125, '12', 36, cream) + T(128, 148, 'BHAVAS', 9, cream, 2),
        Array.from({ length: 12 }, (_, i) => i + 1),
        '#304f48',
        n - 1,
      );
    case 'sign-ring':
      return dial(star(128, 120, 36) + T(128, 159, 'RĀSI', 16, cream, 2), short, '#2b4644');
    case 'stations':
      if (n) {
        const a = ((n - 1) * 360) / 27 - 90;
        const core =
          P(
            `M128 128L${polar(128, 128, 62, a).join(' ')}A62 62 0 0 1 ${polar(128, 128, 62, a + 360 / 27).join(' ')}Z`,
            gold,
          ) +
          place(zodiac(Math.floor(((n - 1) * 4) / 9)), 44, 39, 167) +
          R(69, 153, 118, 19, '#263a50', 'none', 1, 4) +
          T(128, 167, mansionNames[n - 1], 11, cream);
        return dial(
          core,
          Array.from({ length: 27 }, (_, i) => i + 1),
          '#283c51',
          n - 1,
        );
      }
      return dial(
        star(128, 103, 19) +
          T(128, 137, n ? mansionNames[n - 1] : '27', n ? 15 : 33, cream) +
          T(128, 157, n ? 'LUNAR STATION' : 'NAKSHATRAS', 8, cream, 1.4),
        Array.from({ length: 27 }, (_, i) => i + 1),
        '#283c51',
        n - 1,
      );
    case 'sign':
      return (
        C(128, 128, 105, '#264640', gold, 2) +
        C(128, 128, 96, 'none', gold, 0.8) +
        ticks(128, 128, 100, 48) +
        zodiac(n) +
        T(128, 211, signs[n].toUpperCase(), 12, cream, 1.6)
      );
    case 'planet':
      return orbit(111, -26) + planet(n) + T(128, 239, planets[n].toUpperCase(), 10, gold, 2);
    case 'sun':
      return planet(0);
    case 'moon':
      return phase(128, 128, 93, 8) + star(69, 70, 8) + star(173, 183, 6);
    case 'grahas':
      return rep(9, (i) => {
        const x = 8 + (i % 3) * 81,
          y = 6 + Math.floor(i / 3) * 82;
        return (
          R(x, y, 77, 78, '#263d44', gold, 0.8, 5) +
          place(planet(i), x + 6, y - 2, 66) +
          T(x + 38, y + 68, planets[i], 9, cream, 0.5)
        );
      });
    case 'dasha': {
      const names = [
          'Ketu',
          'Shukra',
          'Surya',
          'Chandra',
          'Mangala',
          'Rahu',
          'Guru',
          'Shani',
          'Budha',
        ],
        years = [7, 20, 6, 10, 7, 18, 16, 19, 17];
      return (
        R(14, 19, 228, 218, paper, gold, 2, 5) +
        T(128, 43, 'DASA PERIODS', 12, brown, 2) +
        rep(9, (i) => {
          const y = 61 + i * 17.8;
          return (
            T(30, y + 3, names[i], 10, brown, 0, 'Georgia,serif', 'start') +
            R(85, y - 4, 111, 7, '#ddd0b6', 'none', 1, 3) +
            R(85, y - 4, years[i] * 5.5, 7, i % 2 ? jade : brass, 'none', 1, 3) +
            T(218, y + 3, years[i] + 'y', 9, brown)
          );
        }) +
        T(128, 227, 'VIMSHOTTARI · 120 YEARS', 7, brown, 1.6)
      );
    }
    case 'phases':
      return (
        C(128, 128, 108, '#27394c', gold, 1.4) +
        rep(8, (i) => {
          const [x, y] = polar(128, 128, 76, i * 45 - 90);
          return phase(x, y, 17, (i * 30) / 8);
        }) +
        T(128, 127, 'LUNAR', 18, cream, 2) +
        T(128, 147, 'CYCLE', 10, cream, 3)
      );
    case 'tithi':
      return (
        C(128, 128, 108, '#233645', gold, 1.4) +
        ticks(128, 128, 100, 30) +
        phase(128, 112, 55, (n || 1) - 0.5) +
        T(128, 194, `TITHI ${(((n || 1) - 1) % 15) + 1}`, 15, cream, 2) +
        T(128, 211, n > 15 ? 'KRISHNA PAKSHA' : 'SHUKLA PAKSHA', 7, cream, 1.7)
      );
    case 'padas':
      return (
        R(15, 34, 226, 186, paper, brass, 1.3, 9) +
        T(128, 61, 'FOUR PADAS', 13, brown, 1.9) +
        rep(
          4,
          (i) =>
            R(
              29 + i * 50,
              84,
              47,
              80,
              ['#ead6b3', '#d8dfc8', '#edcbc1', '#d1d9e2'][i],
              gold,
              0.8,
              14,
            ) +
            star(52 + i * 50, 107, 9, brass) +
            T(52 + i * 50, 145, String(i + 1), 22, brown),
        ) +
        swirls(81, 187, 94, brass) +
        T(128, 207, 'NAKSHATRA DIVISIONS', 7.5, brown, 1.3)
      );
    case 'orbits':
    case 'meridian':
      return (
        C(128, 128, 97, '#284043', gold, 1.3) +
        orbit(104, -26) +
        orbit(100, 37) +
        orbit(96, 90) +
        C(128, 128, 79, 'none', gold, 0.7) +
        ticks(128, 128, 92, 48) +
        rep(7, (i) => {
          const [x, y] = polar(128, 128, 64 + i * 4, 15 + i * 53);
          return C(x, y, 3 + (i % 3) * 2, i % 2 ? paper : brass);
        }) +
        (key === 'meridian'
          ? L(128, 19, 128, 235, cream, 2) + T(128, 151, '0°', 14, cream)
          : C(128, 128, 17, gold))
      );
    case 'star-moon':
      return (
        phase(125, 131, 82, 5) +
        star(93, 111, 25) +
        star(62, 71, 10) +
        star(118, 84, 6) +
        ring('star', 126, 133, 102, 13, 8)
      );
    case 'star-path':
    case 'sky-map':
    case 'stars':
      return (
        R(15, 35, 226, 186, '#233a4e', gold, 1.5, 12) +
        rep(40, (i) =>
          C(25 + ((i * 43) % 202), 45 + ((i * 37) % 158), 0.6 + (i % 3) * 0.38, cream),
        ) +
        P(
          'M32 157L62 123 91 135 121 88 153 104 187 65 219 81M91 135L113 168 161 159 180 126',
          'none',
          gold,
          1.2,
        ) +
        [
          [32, 157],
          [62, 123],
          [91, 135],
          [121, 88],
          [153, 104],
          [187, 65],
          [219, 81],
          [113, 168],
          [161, 159],
          [180, 126],
        ]
          .map(([x, y], i) => star(x, y, i % 3 === 0 ? 7 : 4))
          .join('') +
        T(128, 209, key === 'star-path' ? 'STAR PATHS' : 'CELESTIAL STUDY', 7, cream, 1.5)
      );
    case 'compass':
    case 'quadrant':
    case 'sundial': {
      const c = dial(
        key === 'compass'
          ? star(128, 128, 52)
          : key === 'quadrant'
            ? P('M90 151L159 64 143 166Z', brass, cream, 1)
            : P('M80 150L152 73 157 157Z', gold, cream, 1),
        ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        '#3f5551',
      );
      return key === 'quadrant'
        ? G(c, 'rotate(-21 128 128)') + L(49, 185, 207, 60, brass, 5)
        : key === 'sundial'
          ? G(c, 'translate(0 40) scale(1 .76)') + ground(128, 221, 105)
          : c;
    }
    case 'horizon':
    case 'sunrise-path':
      return (
        R(16, 34, 224, 187, '#244347', gold, 1.3, 100) +
        rep(9, (i) => L(129, 147, ...polar(129, 147, 91, 190 + i * 20), gold, 1)) +
        C(128, 149, 40, brass) +
        P('M18 155Q60 139 98 158T181 156Q208 145 236 161Q220 218 126 222Q43 219 18 155Z', jade) +
        P('M46 186Q79 163 106 181T184 177M62 197Q105 178 150 194', 'none', gold, 1) +
        T(128, 172, 'EAST', 8, cream, 2)
      );
    case 'almanac':
    case 'calendar':
    case 'six-months':
    case 'five-limbs': {
      const month = key === 'six-months';
      return (
        R(22, 25, 212, 210, paper, brass, 2, 7) +
        R(22, 26, 212, 39, jade, gold, 0.7, 5) +
        T(
          128,
          51,
          month ? 'SIX-MONTH GUIDE' : key === 'five-limbs' ? 'PANCHANGAM' : 'VEDIC ALMANAC',
          12,
          cream,
          1.5,
        ) +
        rep(5, (i) => R(44 + i * 41, 17, 5, 20, brass, 'none', 1, 2)) +
        (key === 'five-limbs'
          ? ['Tithi', 'Vara', 'Nakshatra', 'Yoga', 'Karana']
              .map(
                (n, i) =>
                  rosette(52, 85 + 27 * i, 6, 7) +
                  T(73, 89 + 27 * i, n, 12, brown, 0.5, 'Georgia,serif', 'start') +
                  L(149, 87 + 27 * i, 205, 87 + 27 * i, '#b49970', 0.75),
              )
              .join('')
          : month
            ? rep(
                6,
                (i) =>
                  R(
                    37 + (i % 3) * 61,
                    82 + Math.floor(i / 3) * 60,
                    55,
                    48,
                    '#f4e6c8',
                    '#ad9474',
                    0.8,
                    3,
                  ) +
                  T(64 + (i % 3) * 61, 106 + Math.floor(i / 3) * 60, '0' + (i + 1), 16, brown) +
                  T(64 + (i % 3) * 61, 119 + Math.floor(i / 3) * 60, 'MONTH', 6, brown, 1),
              )
            : rep(
                28,
                (i) =>
                  R(
                    36 + (i % 7) * 26.4,
                    80 + Math.floor(i / 7) * 28,
                    23,
                    25,
                    i % 6 === 0 ? '#d1be8e' : '#f6e6c6',
                    '#b79d78',
                    0.6,
                    2,
                  ) +
                  (i % 6 === 0
                    ? star(47 + (i % 7) * 26.4, 92 + Math.floor(i / 7) * 28, 5, brass)
                    : C(47 + (i % 7) * 26.4, 92 + Math.floor(i / 7) * 28, 1.3, '#ad9374')),
              )) +
        swirls(82, 214, 90, brass)
      );
    }
    case 'poruthams':
      return (
        R(13, 20, 230, 214, paper, gold, 2, 7) +
        T(128, 47, '10 PORUTHAMS', 14, brown, 2) +
        rep(10, (i) => {
          const x = 28 + (i % 2) * 103,
            y = 65 + Math.floor(i / 2) * 29;
          return (
            C(x + 9, y + 5, 8, jade, gold, 0.6) +
            T(x + 9, y + 8, i + 1, 8, cream) +
            T(x + 21, y + 8, checks[i], 9, brown, 0, 'Georgia,serif', 'start') +
            L(x, y + 17, x + 93, y + 17, '#d2bb93', 0.65)
          );
        })
      );
    case 'check':
      return dial(
        T(128, 118, String(n + 1).padStart(2, '0'), 28, cream) +
          T(128, 139, checks[n], 12, cream) +
          T(128, 154, 'PORUTHAM', 7, cream, 1.4),
        Array.from({ length: 10 }, (_, i) => i + 1),
        '#543541',
        n,
      );
    default:
      return null;
  }
}
const silkColor = () => '#824449';
