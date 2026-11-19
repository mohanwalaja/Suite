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
  silk,
  jade,
  brown,
  navy,
  cream,
  blush,
} from './svg.js';
const flower = (key, x, y, s) => use(key, x, y, s);
function vine(x, y, scale = 1) {
  return G(
    P('M0 69Q24 29 14 -5', 'none', '#7c8e6c', 2) +
      rep(5, (i) => use('leaf', 7 + i * 2.6, 54 - i * 12, 18, i % 2 ? -42 : 42)),
    `translate(${x} ${y}) scale(${scale})`,
  );
}
function garland(color = 'jasmine') {
  let out = P('M55 36Q46 194 121 212Q189 202 194 36', 'none', brass, 3);
  for (let i = 0; i <= 34; i++) {
    const t = i / 34,
      x = 55 + 139 * t + Math.sin(2 * Math.PI * t) * -9,
      y = 36 + 174 * Math.sin(t * Math.PI) ** 0.86;
    out += use(Math.floor(i / 4) % 3 === 1 ? 'rose' : color, x, y, 17 + (i % 3), i * 19);
  }
  return out + P('M112 210l-6 23 15-5 3-19M126 210l-1 23 12-5-3-21', silk, gold, 0.6);
}
function vessel() {
  return (
    ground(128, 222, 79) +
    P(
      'M96 94Q84 112 71 135Q49 180 95 201Q128 216 162 201Q207 182 184 137L160 94Z',
      brass,
      '#895e34',
      2,
    ) +
    E(128, 99, 37, 8, gold) +
    P('M80 155Q128 174 177 155M76 166Q127 185 181 166', 'none', gold, 3) +
    rep(9, (i) => use('petal', 85 + i * 11, 180 + Math.sin((i * Math.PI) / 8) * 10, 14)) +
    E(128, 208, 32, 6, brass) +
    R(92, 209, 72, 6, gold, 'none', 1, 3) +
    rep(7, (i) => G(use('leaf', 128, 69, 55, 0), `rotate(${(i - 3) * 24} 128 99)`)) +
    P('M105 88Q96 61 128 31Q158 58 151 89Z', wood, '#846340', 1.2) +
    rep(7, (i) => P(`M${107 + i * 6} 87Q${106 + i * 6} 59 128 34`, 'none', '#805d37', 0.8)) +
    P('M88 113Q128 100 169 113M85 118Q127 106 172 118', 'none', '#ae6450', 3)
  );
}
function bell() {
  return (
    L(128, 14, 128, 55, brass, 2.5) +
    rep(5, (i) => E(128, 22 + i * 7, 4, 5, 'none', gold, 1.7)) +
    C(128, 62, 10, brass) +
    P(
      'M100 76Q128 50 156 76C158 100 149 124 184 155L72 155C106 124 96 101 100 76Z',
      brass,
      '#976b39',
      1.8,
    ) +
    E(128, 155, 59, 11, gold, '#986c38', 1.2) +
    E(128, 158, 49, 5, '#80643b') +
    C(128, 163, 8, gold) +
    selvedge(85, 140, 86) +
    rosette(128, 112, 13, 8)
  );
}
function lamp() {
  return (
    ground(128, 223, 70) +
    E(128, 216, 54, 11, brass) +
    E(128, 210, 40, 7, gold) +
    P(
      'M108 208Q128 193 119 166Q106 157 121 147L122 119H134L136 147Q149 157 137 166Q129 191 148 208Z',
      brass,
      gold,
      1,
    ) +
    rep(3, (i) => E(128, 153 + i * 7, 16 - i * 2, 4, gold)) +
    P('M65 108Q128 131 191 108Q177 146 130 147Q79 141 65 108Z', brass, gold, 1.5) +
    E(128, 109, 63, 12, gold) +
    E(128, 108, 54, 7, '#986d35') +
    rep(3, (i) =>
      G(
        P('M0 0C-15 -14 1 -29 2 -48C4 -32 21 -14 0 0Z', '#edac57', '#fce7a0', 1) +
          P('M0 -3Q-5 -15 4 -28Q10 -12 0 -3Z', '#ffefb9'),
        `translate(${80 + i * 49} ${106 - (i % 2) * 5})`,
      ),
    )
  );
}
function mandap() {
  return (
    ground(126, 230, 113) +
    P('M17 65L54 31 204 31 239 65Z', silk, gold, 2) +
    selvedge(18, 67, 220) +
    rep(3, (i) => P(`M${19 + i * 72} 75q36 53 72 0`, 'none', blush, 7)) +
    rep(16, (i) =>
      use(
        i % 4 === 0 ? 'rose' : 'jasmine',
        24 + i * 14,
        78 + Math.sin(((i % 5) * Math.PI) / 5) * 17,
        12,
      ),
    ) +
    rep(2, (i) =>
      G(
        R(35, 78, 13, 135, wood, gold, 1) +
          rep(6, (j) => E(42, 92 + j * 21, 10, 4, gold)) +
          R(28, 212, 29, 8, brass, 'none', 1, 2) +
          vine(29, 115, 0.5),
        `translate(${174 * i} 0)`,
      ),
    ) +
    R(18, 222, 220, 5, brass) +
    P('M75 220Q128 195 182 220', blush, gold, 1)
  );
}
function thali() {
  return (
    P('M42 28C70 85 66 145 128 168C184 141 191 83 214 28', 'none', '#aa7935', 8) +
    P('M42 28C70 85 66 145 128 168C184 141 191 83 214 28', 'none', '#edc557', 4) +
    rep(17, (i) => {
      const t = i / 16;
      return C(47 + 162 * t, 40 + 119 * Math.sin(Math.PI * t), 2.6, gold);
    }) +
    rep(2, (i) =>
      G(
        P('M107 154L119 151 129 158 137 180 129 201 106 207 91 192 91 175Z', gold, '#927041', 1.7) +
          rosette(113, 180, 13, 9) +
          ring('petal', 113, 180, 18, 10, 6),
        `translate(${i * 28 - 10} 0)`,
      ),
    ) +
    C(128, 158, 7, brass)
  );
}
function rings() {
  return (
    ground(129, 184, 86) +
    G(
      E(96, 130, 49, 43, 'none', brass, 13) + E(96, 128, 49, 44, 'none', gold, 6),
      'rotate(-27 96 130)',
    ) +
    G(
      E(157, 125, 49, 43, 'none', brass, 13) + E(157, 124, 49, 44, 'none', gold, 6),
      'rotate(24 157 125)',
    ) +
    rep(5, (i) => star(73 + i * 28, 66 + Math.sin(i * 2) * 10, 3 + (i % 3) * 2))
  );
}
function riceTray() {
  return (
    ground(128, 205, 102) +
    E(128, 153, 108, 47, brass, gold, 2) +
    E(128, 147, 101, 40, gold) +
    E(128, 147, 88, 32, paper, '#b69258', 1) +
    rep(66, (i) => {
      const a = i * 137.5,
        r = Math.sqrt((i + 1) / 66);
      return G(
        E(0, 0, 4, 1.3, '#fffbdd', '#d9c6a5', 0.5),
        `translate(${128 + 81 * r * Math.cos(a)} ${147 + 26 * r * Math.sin(a)}) rotate(${i * 17})`,
      );
    }) +
    P('M50 208L201 89 204 91 58 207Z', gold, '#956b3e', 1) +
    use('jasmine', 56, 111, 25) +
    use('leaf', 70, 107, 20, 43)
  );
}
function casket() {
  return (
    ground() +
    P('M48 115L186 98 215 135 71 160Z', paper, gold, 2) +
    P('M47 116L55 65 182 45 186 99Z', wood, gold, 2) +
    P('M55 108L63 72 176 54 178 93Z', silk, gold, 1.5) +
    P('M48 125L72 158 211 136 205 192 71 215 45 178Z', wood, gold, 2) +
    P('M71 159L71 214M49 135l22 31 139-24', 'none', gold, 2) +
    C(139, 170, 6, brass) +
    swirls(83, 189, 105, gold) +
    rep(3, (i) => E(97 + i * 26, 132 - i * 3, 17, 7, 'none', gold, 3))
  );
}
function book(open = true) {
  return (
    ground(130, 217, 99) +
    (open
      ? P(
          'M20 56Q66 33 127 62Q180 32 236 54L235 194Q178 176 127 211Q73 178 22 195Z',
          wood,
          gold,
          2,
        ) +
        P('M27 51Q73 35 127 63V202Q80 172 26 187Z', paper, '#ae8661', 1.2) +
        P('M128 63Q181 34 231 49L230 187Q171 173 128 202Z', paper, '#ae8661', 1.2) +
        rep(9, (i) =>
          P(
            `M38 ${70 + i * 12}Q79 ${59 + i * 12} 115 ${83 + i * 12}M141 ${84 + i * 12}Q177 ${60 + i * 12} 216 ${69 + i * 12}`,
            'none',
            '#b19776',
            1.35,
          ),
        ) +
        P('M175 53v66l7-8 7 4V50Z', silk)
      : G(
          R(52, 33, 151, 190, wood, gold, 2, 7) +
            R(60, 29, 149, 187, jade, gold, 1.5, 4) +
            R(70, 40, 126, 162, 'none', gold, 0.85) +
            L(73, 31, 73, 214, gold, 2) +
            rosette(135, 117, 31, 12),
          'rotate(-8 128 128)',
        ))
  );
}
function cradle() {
  return (
    ground(128, 225, 106) +
    rep(2, (i) =>
      G(
        R(36, 52, 10, 162, wood, brass, 1, 4) +
          C(41, 45, 9, gold) +
          P('M26 217Q41 200 58 217Z', wood, gold, 1.2),
        `translate(${i * 174} 0)`,
      ),
    ) +
    P('M35 52Q128 22 220 52', 'none', wood, 7) +
    L(70, 45, 82, 133, brass, 2.6) +
    L(184, 45, 172, 133, brass, 2.6) +
    P('M64 128Q128 153 193 127Q181 193 129 196Q79 187 64 128Z', wood, brass, 2) +
    P('M70 134Q128 117 188 133Q134 162 70 134Z', blush, '#b48b78', 1.4) +
    P('M75 146Q128 165 182 146', 'none', gold, 2.5) +
    rep(11, (i) =>
      P(
        `M${78 + i * 9} ${151 + 8 * Math.sin((i * Math.PI) / 10)}l3 ${14 + 8 * Math.sin((i * Math.PI) / 10)}`,
        'none',
        '#815d40',
        2,
      ),
    ) +
    rosette(128, 177, 9, 8) +
    rep(13, (i) =>
      use(
        i % 4 === 0 ? 'rose' : 'jasmine',
        44 + i * 14,
        53 - 18 * Math.sin((i * Math.PI) / 12),
        10,
      ),
    )
  );
}
function foot(x, y, side = 1, color = blush) {
  return G(
    P(
      'M0 19C-10 21 -16 13 -14 2C-13 -5 -8 -6 -10 -19C-15 -41 8 -46 17 -32C21 -24 15 -11 11 -2C8 9 11 17 0 19Z',
      color,
      '#bc8a76',
      1.2,
    ) +
      rep(5, (i) =>
        E(
          -11 + i * 8,
          -41 - (4 - i) * -0.8 + i * i * 0.6,
          5.7 - i * 0.55,
          7 - i * 0.7,
          color,
          '#ba8975',
          0.7,
        ),
      ),
    `translate(${x} ${y}) scale(${side} 1)`,
  );
}
export function craft(key, arg, draw) {
  switch (key) {
    case 'rice-tray':
      return riceTray();
    case 'palm-leaf':
      return (
        ground(130, 194, 100) +
        rep(4, (i) =>
          G(
            R(25, 89 + i * 9, 207, 54, paper, '#a38150', 1.5, 9) +
              rep(5, (j) =>
                P(`M39 ${98 + i * 9 + j * 7}q32 -3 56 0t59 0 62 -1`, 'none', '#ae916a', 0.95),
              ) +
              C(69, 115 + i * 9, 3.8, '#795d3f') +
              C(185, 115 + i * 9, 3.8, '#795d3f'),
            `rotate(${i * 3 - 8} 128 128)`,
          ),
        ) +
        P('M68 101Q65 137 77 160Q83 177 100 181', 'none', '#965d43', 3) +
        P('M37 207L195 72 200 74 45 207Z', brass)
      );
    case 'stylus':
    case 'quill':
      return G(
        P('M55 207Q96 148 182 47Q183 103 115 146Q93 166 55 207Z', paper, gold, 1.5) +
          P('M50 215Q108 139 182 47', 'none', brass, 3) +
          rep(11, (i) => L(83 + 8 * i, 173 - 10 * i, 89 + 9 * i, 143 - 9 * i, '#ad936c', 0.8)),
        'rotate(7 128 128)',
      );
    case 'inkwell':
      return (
        ground(112, 214, 86) +
        R(41, 146, 96, 61, '#294449', gold, 2, 11) +
        P('M50 147L62 126H116L129 147Z', jade, gold, 1.2) +
        E(89, 126, 28, 7, brass) +
        E(89, 125, 20, 4, navy) +
        rosette(90, 175, 17, 12) +
        G(draw('stylus'), 'translate(29 -17)')
      );
    case 'hourglass':
      return (
        ground(128, 230, 65) +
        rep(2, (i) => R(67, 34 + i * 174, 122, 12, wood, gold, 1.5, 4)) +
        L(72, 46, 72, 206, brass, 5) +
        L(183, 46, 183, 206, brass, 5) +
        P(
          'M87 50H169C167 91 143 106 133 122C136 143 168 159 170 205H86C86 164 117 142 123 124C111 104 86 91 87 50Z',
          '#b9d9d75e',
          cream,
          2,
        ) +
        P(
          'M96 73H160Q154 100 129 118Q104 96 96 73ZM88 201Q112 187 129 174Q146 187 167 201Z',
          gold,
        ) +
        L(128, 125, 128, 177, gold, 1.5)
      );
    case 'ruler':
      return G(
        R(24, 99, 211, 52, paper, brass, 2, 3) +
          rep(32, (i) => L(31 + i * 6.3, 101, 31 + i * 6.3, i % 4 === 0 ? 121 : 111, brown, 1.1)) +
          rep(8, (i) => T(36 + i * 25, 138, i + 1, 9, brown)),
        'rotate(-24 128 128)',
      );
    case 'rose':
    case 'jasmine':
    case 'petals':
    case 'lily':
      return (
        vine(106, 132, 1.1) +
        vine(145, 111, 0.9) +
        rep(7, (i) =>
          use(
            key === 'rose' ? 'rose' : key === 'jasmine' || key === 'lily' ? 'jasmine' : 'lotus',
            84 + (i % 3) * 39,
            66 + Math.floor(i / 3) * 34,
            44 + (i % 3) * 5,
            i * 13,
          ),
        )
      );
    case 'lotus':
      return (
        P('M126 205Q118 172 132 130', 'none', '#75896b', 3) +
        use('leaf', 150, 164, 48, 54) +
        use('lotus', 128, 114, 168) +
        ground(130, 222, 70)
      );
    case 'lotus-pond':
      return (
        rep(3, (i) =>
          G(E(89 + 48 * i, 186 - (i % 2) * 19, 46, 13, jade, '#799279', 1), 'rotate(-4 128 128)'),
        ) +
        P('M94 186Q104 143 85 110M166 182Q164 112 181 81', 'none', '#768d6b', 3.5) +
        use('lotus', 82, 111, 88) +
        use('lotus', 179, 82, 66) +
        rep(7, (i) => P(`M${52 + i * 16} ${202 + (i % 2) * 4}q12 -2 21 0`, 'none', '#a9bfb0', 1))
      );
    case 'rosettes':
      return rosette(91, 103, 47, 12) + rosette(164, 142, 54, 15) + rosette(82, 180, 25, 9);
    case 'garland':
    case 'garlands':
      return key === 'garlands'
        ? place(garland(), -2, 18, 179, 211, -7) + place(garland('marigold'), 81, 10, 177, 211, 6)
        : garland();
    case 'floral-canopy':
      return mandap() + rep(4, (i) => place(garland(), 30 + i * 38, -6, 61, 121));
    case 'thali':
      return thali();
    case 'rings':
      return rings();
    case 'kalash':
      return vessel();
    case 'kalash-pair':
      return place(vessel(), -7, 36, 145, 169) + place(vessel(), 102, 23, 155, 180);
    case 'deepam':
    case 'diya':
      return key === 'deepam'
        ? lamp()
        : place(lamp(), 5, 67, 155, 145) + place(lamp(), 111, 44, 147, 162);
    case 'bells':
      return (
        place(bell(), -2, 33, 149, 189, -7) + place(bell(), 101, 1, 155, 199, 6) + vine(60, 9, 0.65)
      );
    case 'silk-knot':
    case 'ribbon':
    case 'star-ribbon':
      return (
        ground(124, 202, 92) +
        P(
          'M125 126Q75 45 36 63Q19 94 44 119Q69 131 118 136L36 179L56 183 63 207 133 145L195 204 199 180 224 179 146 133Q203 130 214 96Q226 47 191 55Q158 63 132 115Z',
          key === 'silk-knot' ? silk : blush,
          gold,
          1.7,
        ) +
        P(
          'M44 72Q84 86 115 122M195 65Q161 88 144 119M65 182L125 139M191 181L141 140',
          'none',
          gold,
          2,
        ) +
        G(R(117, 111, 27, 34, gold, '#b28c50', 1.5, 6), 'rotate(14 130 128)') +
        (key === 'star-ribbon' ? star(130, 131, 25, cream) : '')
      );
    case 'invite':
    case 'letters':
    case 'name-card':
      return (
        G(
          R(33, 49, 182, 143, paper, brass, 1.5, 5) +
            R(41, 57, 166, 127, 'none', gold, 0.8) +
            swirls(75, 86, 97, brass) +
            T(
              125,
              119,
              key === 'name-card'
                ? 'A NEW ARRIVAL'
                : key === 'letters'
                  ? 'A LITTLE NOTE'
                  : 'AN INVITATION',
              12,
              brown,
              1.6,
            ) +
            L(70, 137, 180, 137, gold, 1) +
            T(125, 156, key === 'name-card' ? 'WITH LOVE' : 'TOGETHER', 8, brown, 2),
          'rotate(-7 130 128)',
        ) +
        G(
          P('M78 133H224V217H78Z', key === 'letters' ? jade : blush, gold, 1.5) +
            P('M78 133l72 55 74-55M78 217l52-45m94 45-51-47', 'none', gold, 1.2) +
            rosette(150, 181, 12, 9),
          'rotate(5 150 170)',
        )
      );
    case 'wax-seal':
    case 'wedding-seal':
      return (
        P('M92 148l-14 80 24-13 18 13 18-78M137 151l9 74 17-15 20 8-15-77', silk, gold, 1) +
        rosette(128, 109, 69, 17) +
        (key === 'wedding-seal' ? place(rings(), 75, 51, 106) : star(128, 108, 23, cream))
      );
    case 'bangles':
    case 'anklets':
      return (
        ground(128, 201, 100) +
        rep(key === 'bangles' ? 5 : 2, (i) =>
          G(
            E(
              81 + i * (key === 'bangles' ? 21 : 89),
              135 - (i % 2) * 20,
              36,
              57,
              'none',
              key === 'anklets' ? silver : i % 2 ? silk : gold,
              key === 'anklets' ? 7 : 11,
            ) +
              E(
                81 + i * (key === 'bangles' ? 21 : 89),
                135 - (i % 2) * 20,
                35,
                56,
                'none',
                cream,
                1.1,
              ) +
              rep(15, (j) => {
                const a = (j * 2 * Math.PI) / 15,
                  x = 81 + i * (key === 'bangles' ? 21 : 89) + 36 * Math.cos(a),
                  y = 135 - (i % 2) * 20 + 57 * Math.sin(a);
                return key === 'anklets'
                  ? C(x, y + 5, 4.5, silver, '#8593a2', 0.7)
                  : star(x, y, 2.9, paper);
              }),
            `rotate(${i % 2 ? 27 : -17} 128 128)`,
          ),
        )
      );
    case 'henna':
    case 'handprint':
    case 'hands': {
      const shape = P(
        'M84 201Q79 173 61 152C46 128 58 119 70 128L93 149 78 77Q76 63 85 61Q91 58 95 73L109 122 103 55Q103 42 112 42Q121 42 122 54L130 117 132 47Q134 35 142 38Q149 40 148 51L148 119 162 66Q166 56 173 60Q181 63 177 73L164 138Q171 167 151 195L151 215Z',
        key === 'handprint' ? blush : '#d6a385',
        '#9d7964',
        1.6,
      );
      return (
        (key === 'hands'
          ? G(shape, 'translate(-12 8) rotate(-16 128 128)') +
            G(shape, 'translate(34 14) rotate(18 128 128) scale(.86)')
          : shape) +
        (key === 'henna'
          ? rosette(123, 157, 23, 12) +
            ring('petal', 123, 157, 32, 13, 6) +
            rep(5, (i) => P(`M${84 + i * 2} ${190 + i * 4}q27 13 62 1`, 'none', '#945848', 1.5)) +
            rep(6, (i) => C(115, 76 + i * 6, 1.6, '#8c5445'))
          : '')
      );
    }
    case 'mandap':
      return mandap();
    case 'havan':
      return (
        ground() +
        P('M34 171l94-30 96 29-96 35Z', brass, gold, 1.4) +
        P('M34 171l8 22 85 34 1-22ZM128 205l95-35-6 25-90 32Z', wood, gold, 1.5) +
        P(
          'M79 165C47 129 87 113 92 68Q110 88 104 116Q138 86 133 36Q168 70 149 107Q180 94 181 66Q207 126 158 168Z',
          '#d67a43',
          '#efbc69',
          1.5,
        ) +
        P('M101 162Q88 132 120 102Q117 131 139 91Q164 123 143 160Z', '#ffe1a2')
      );
    case 'seven-steps':
      return (
        P('M41 205Q92 98 212 45', 'none', gold, 1.1, 'stroke-dasharray="3 5"') +
        rep(7, (i) =>
          G(
            foot(0, 0, i % 2 ? 1 : -1, gold),
            `translate(${51 + i * 24} ${197 - i * 23}) scale(.48) rotate(24)`,
          ),
        ) +
        T(128, 237, 'SEVEN STEPS', 9, gold, 2)
      );
    case 'betel-tray':
    case 'turmeric':
    case 'sandal-tray':
    case 'kumkum':
    case 'modak':
    case 'color-bowls':
      return (
        ground(128, 205, 99) +
        E(128, 159, 105, 43, brass, gold, 2) +
        E(128, 153, 97, 34, gold, '#a47843', 1) +
        rep(3, (i) => use('leaf', 64 + i * 55, 130 + Math.sin(i) * 17, 53, 40 + i * 44)) +
        (key === 'turmeric'
          ? rep(6, (i) =>
              G(
                P(
                  'M-17 1Q-13 -11 -5 -5Q5 -12 18 0Q14 10 6 9Q-9 17 -17 1Z',
                  '#d8a34a',
                  '#ac813e',
                  1,
                ) + P('M-8 -2l1 12M7 -5l1 14', 'none', '#bc8a3f', 1.5),
                `translate(${73 + (i % 3) * 39} ${125 + Math.floor(i / 3) * 25}) rotate(${i * 22})`,
              ),
            )
          : key === 'modak'
            ? rep(5, (i) =>
                G(
                  P('M-14 9Q-16 -2 0 -22Q16 -5 16 9Q0 22 -14 9Z', paper, gold, 1) +
                    P('M-7 11Q-10 2 0 -21Q-1 0 5 13', 'none', '#c09d6f', 1),
                  `translate(${68 + (i % 3) * 46} ${118 + Math.floor(i / 3) * 31})`,
                ),
              )
            : rep(3, (i) =>
                G(
                  P('M-25 -2Q-24 24 0 24Q24 23 25-2Z', brass, gold, 1) +
                    E(0, -2, 25, 7, gold) +
                    P(
                      'M-21 -3Q-7 -9 0 -21Q9 -10 21 -3Q1 5 -21 -3Z',
                      (key === 'color-bowls'
                        ? ['#c75f86', '#e7bd51', '#6389a3']
                        : key === 'kumkum'
                          ? ['#a64043', '#c69242', '#f0e0be']
                          : ['#ba8961', '#d6ab70', '#e8d7b7'])[i],
                    ),
                  `translate(${70 + i * 57} ${142 - (i % 2) * 24})`,
                ),
              ))
      );
    case 'jewellery-box':
    case 'keepsake-box':
      return casket() + (key === 'keepsake-box' ? use('jasmine', 84, 94, 34) : '');
    case 'conches':
      return rep(2, (i) =>
        G(
          P(
            'M32 153Q23 116 62 102Q106 80 121 108Q143 139 101 160L61 187 68 165Q45 175 32 153Z',
            paper,
            gold,
            1.4,
          ) +
            P(
              'M101 109Q72 97 54 121Q37 151 65 151Q94 150 87 128Q83 117 72 127Q65 137 76 137',
              'none',
              brass,
              1.8,
            ) +
            rep(5, (j) => L(91 + j * 4, 148 - j * 5, 109 + j * 2, 127 - j * 4, '#bfac87', 1)),
          `translate(${i * 99} ${-i * 19})`,
        ),
      );
    case 'quilt':
      return G(
        R(39, 48, 178, 159, blush, brass, 1.8, 6) +
          rep(
            20,
            (i) =>
              R(
                47 + (i % 5) * 32,
                56 + Math.floor(i / 5) * 35,
                32,
                35,
                [paper, blush, '#c7d8c7', '#beced5'][(i * 3 + Math.floor(i / 5)) % 4],
                cream,
                1,
              ) + use(i % 3 ? 'petal' : 'star', 63 + (i % 5) * 32, 74 + Math.floor(i / 5) * 35, 13),
          ),
        'rotate(-7 128 128)',
      );
    case 'silk-folds':
      return (
        ground() +
        rep(3, (i) =>
          G(
            R(39, 81 + i * 20, 174, 54, [jade, blush, silk][i], gold, 1.2, 5) +
              R(40, 82 + i * 20, 172, 52, 'url(#weave)', 'none', 1, 5) +
              rep(6, (j) => rosette(55 + j * 28, 103 + i * 20, 5, 6)) +
              selvedge(40, 125 + i * 20, 172),
            `rotate(${i * 5 - 8} 128 128)`,
          ),
        )
      );
    case 'swing':
      return (
        L(59, 24, 73, 168, brass, 2.8) +
        L(190, 24, 177, 168, brass, 2.8) +
        rep(
          9,
          (i) =>
            use('jasmine', 61 + i * 1.35, 43 + i * 13, 9) +
            use('jasmine', 188 - i * 1.2, 43 + i * 13, 9),
        ) +
        P('M51 164Q128 184 205 164L197 184Q128 204 59 182Z', wood, gold, 2) +
        P('M61 163Q126 144 195 163Q133 182 61 163Z', silk, gold, 1) +
        rep(12, (i) =>
          use(i % 3 ? 'jasmine' : 'rose', 52 + i * 13, 35 - 12 * Math.sin((i * Math.PI) / 11), 16),
        )
      );
    case 'music':
    case 'flute':
    case 'veena':
    case 'drum': {
      const flute = G(
        P('M34 143L202 98 206 109 38 155Z', wood, gold, 1.3) +
          rep(7, (i) => E(66 + i * 17, 140 - i * 4.5, 3.4, 2.5, navy)) +
          P('M56 139q-5 -21 9-41', 'none', silk, 3) +
          use('leaf', 67, 94, 26, 15),
        'rotate(-10 128 128)',
      );
      const drum =
        P('M72 129Q118 99 172 126L187 182Q123 214 62 184Z', wood, gold, 2) +
        E(122, 126, 51, 16, paper, brass, 3) +
        E(122, 125, 21, 7, navy) +
        rep(12, (i) =>
          L(
            73 + i * 8.6,
            130 + 8 * Math.sin((i * Math.PI) / 11),
            80 + i * 8.7,
            187 + 5 * Math.sin(i * 0.4),
            cream,
            1.4,
          ),
        );
      return key === 'flute'
        ? flute
        : key === 'drum'
          ? drum
          : key === 'music'
            ? G(drum, 'translate(12 8)') + G(flute, 'translate(-8 -33)')
            : G(
                E(87, 158, 44, 31, wood, gold, 2) +
                  C(168, 105, 17, brass) +
                  P('M89 152l100-100 13 6-98 108Z', wood, gold, 1) +
                  rep(4, (i) => L(82 + i * 2, 158 + i * 2, 196 + i, 53 + i, gold, 1.1)) +
                  rosette(87, 162, 12),
                'rotate(5 128 128)',
              );
    }
    case 'palm-fan':
      return (
        P('M126 172Q36 159 33 101Q57 50 124 39Q194 46 222 99Q213 151 126 172Z', paper, brass, 2) +
        rep(19, (i) => {
          const a = 204 + i * 7.3;
          return L(127, 172, ...polar(127, 167, 98, a), '#bfa06f', 1.4);
        }) +
        P('M120 160l12-1 5 67-9 2Z', wood, gold, 1.3)
      );
    case 'sprout':
      return (
        ground(128, 211, 81) +
        P('M71 203q48-34 112 0Z', wood, brass, 1.1) +
        P('M126 196Q129 133 116 100', 'none', '#758b60', 4) +
        use('leaf', 98, 104, 61, -43) +
        use('leaf', 149, 130, 51, 51) +
        C(128, 184, 3, brass)
      );
    case 'olive-branch':
      return (
        P('M56 202Q120 145 194 51', 'none', brass, 2.7) +
        rep(
          10,
          (i) =>
            use('leaf', 68 + i * 12, 184 - i * 14, 27 + (i % 3) * 4, i % 2 ? 54 : -38) +
            E(76 + i * 12, 174 - i * 14, 3.4, 5, navy),
        )
      );
    case 'mango-leaves':
      return vine(86, 55, 2) + vine(130, 41, 1.55) + ground(130, 210, 49);
    case 'toran':
    case 'bunting':
      return (
        P('M11 59Q128 132 245 58', 'none', brass, 3) +
        rep(11, (i) => {
          const x = 23 + i * 21,
            y = 64 + 32 * Math.sin((Math.PI * i) / 10);
          return key === 'toran'
            ? use('leaf', x, y + 15, 35, 180 + (i % 3) * 4) + use('marigold', x + 9, y + 3, 11)
            : P(`M${x - 7} ${y}l17 4 -7 30Z`, [blush, jade, paper, silk][i % 4], gold, 0.9);
        }) +
        swirls(67, 173, 121, gold)
      );
    case 'necklace':
    case 'braid':
      return (
        rep(3, (j) =>
          P(
            `M${44 + j * 5} 40Q${62 + j * 6} ${207 - j * 8} 128 ${206 - j * 8}Q${193 - j * 5} ${207 - j * 8} ${211 - j * 5} 40`,
            'none',
            j % 2 ? brass : gold,
            3.7,
          ),
        ) +
        rep(19, (i) => {
          const t = i / 18;
          return C(
            48 + t * 159,
            55 + 137 * Math.sin(t * Math.PI) ** 0.75,
            3.8,
            i % 2 ? paper : gold,
          );
        }) +
        rosette(128, 204, 19, 12)
      );
    case 'basket':
    case 'baby-basket':
      return (
        ground() +
        P('M53 147C50 41 196 41 200 145', 'none', wood, 9) +
        P('M42 133Q128 159 214 133L196 198Q124 225 61 198Z', wood, gold, 1.7) +
        rep(7, (i) =>
          P(
            `M${46 + i * 2} ${143 + i * 8}Q128 ${165 + i * 8} ${210 - i * 2} ${143 + i * 8}`,
            'none',
            '#e4c492',
            2,
          ),
        ) +
        rep(14, (i) =>
          L(
            53 + i * 11.5,
            146 + (i < 7 ? i : 13 - i) * 1.3,
            67 + i * 9.5,
            200 + (i < 7 ? i : 13 - i) * 1.1,
            '#9c774e',
            2.2,
          ),
        ) +
        (key === 'baby-basket'
          ? P('M50 135Q117 87 209 133Q147 164 95 145L86 174Z', blush, gold, 1.2)
          : rep(5, (i) => use(i % 2 ? 'jasmine' : 'marigold', 71 + i * 29, 130 - (i % 2) * 14, 27)))
      );
    case 'doorway':
      return (
        R(34, 31, 188, 193, wood, gold, 2) +
        R(45, 44, 166, 167, '#233e38', brass, 2) +
        P('M50 201V90Q128 -5 206 90V201Z', paper, gold, 2) +
        R(66, 98, 125, 103, jade, brass, 1.5) +
        L(128, 99, 128, 199, gold, 2) +
        C(120, 153, 3, gold) +
        C(135, 153, 3, gold) +
        rep(4, (i) => R(27 - i * 4, 207 + i * 5, 202 + i * 8, 5, brass, gold, 0.6)) +
        place(draw('toran'), 38, 27, 180, 102)
      );
    case 'peacocks': {
      const bird =
        P(
          'M118 140Q136 102 121 84Q126 68 143 77L158 83 145 88Q139 97 150 121C170 156 143 179 118 172Q83 170 45 196Q59 144 118 140Z',
          jade,
          gold,
          1.6,
        ) +
        C(138, 82, 2, navy) +
        rep(6, (i) =>
          G(
            use('leaf', 71 + i * 7, 169 + (i % 2) * 6, 26, 47) +
              C(70 + i * 7, 169 + (i % 2) * 6, 3, brass),
          ),
        ) +
        P('M127 77l-4-13m10 10 2-13m4 14 6-10', 'none', gold, 1.5);
      return (
        place(bird, -17, 8, 176, 205) +
        G(place(bird, -17, 8, 176, 205), 'translate(256 0) scale(-1 1)') +
        use('lotus', 128, 193, 39)
      );
    }
    case 'cradle':
      return cradle();
    case 'footprints':
      return foot(86, 143, -1) + foot(165, 120, 1) + swirls(83, 197, 90, brass);
    case 'star-mobile':
    case 'cloud-cradle':
      return (
        L(128, 13, 128, 46, brass, 2) +
        P('M36 84Q129 5 220 84', 'none', wood, 5) +
        rep(5, (i) => {
          const x = 41 + i * 44,
            y = 75 - 30 * Math.sin((i * Math.PI) / 4),
            l = 57 + (i % 2) * 22;
          return (
            L(x, y, x, y + l, gold, 1.5) +
            (i === 2
              ? place(draw('moon'), x - 24, y + l - 9, 52)
              : i % 2
                ? star(x, y + l + 8, 17, gold)
                : use('star', x, y + l + 7, 24))
          );
        }) +
        (key === 'cloud-cradle' ? place(cradle(), 76, 138, 105, 109) : '')
      );
    case 'rattle':
      return (
        G(
          R(120, 112, 17, 91, wood, gold, 1, 8) +
            E(128, 210, 24, 13, wood, gold, 1.5) +
            C(128, 88, 45, blush, gold, 2) +
            P('M88 73Q128 97 168 72M87 95Q128 121 169 95', 'none', gold, 5) +
            rep(6, (i) => star(103 + i * 10, 86 + Math.sin((i * Math.PI) / 5) * 9, 3.7, paper)),
          'rotate(27 128 128)',
        ) + use('jasmine', 63, 192, 27)
      );
    case 'booties': {
      const shoe =
        P(
          'M57 105Q82 121 103 101L117 143Q144 149 152 170Q146 191 99 189L49 182Q37 176 43 155Z',
          blush,
          '#bb8a7d',
          1.8,
        ) +
        P('M50 108Q81 124 107 106L110 126Q79 140 44 127Z', paper, '#c1a382', 1.2) +
        rep(9, (i) => P(`M${50 + i * 10} 162l4 6 4-6m-6 12 4 4 4-5`, 'none', '#bc8e85', 1.4)) +
        G(draw('ribbon'), 'translate(55 100) scale(.26)');
      return place(shoe, -4, 38, 195, 175, -13) + place(shoe, 71, -21, 226, 226, 14);
    }
    case 'letter-cards':
      return rep(3, (i) =>
        G(
          R(72, 49, 113, 153, [paper, blush, '#d0dfce'][i], brass, 1.4, 6) +
            R(81, 58, 95, 134, 'none', gold, 0.9, 3) +
            T(128, 133, ['Ā', 'Ka', 'Na'][i], 39, navy) +
            T(128, 164, 'SYLLABLE', 7, brown, 1.5) +
            star(128, 180, 4, brass),
          `translate(${(i - 1) * 39} ${(i % 2) * 16}) rotate(${(i - 1) * 16} 128 184)`,
        ),
      );
    case 'certificate':
    case 'nameplate':
    case 'name-scroll':
      return G(
        R(20, 56, 216, 148, paper, brass, 1.7, 5) +
          R(29, 66, 198, 128, 'none', brass, 1) +
          R(33, 70, 190, 120, 'none', gold, 0.8) +
          swirls(73, 93, 111, brass) +
          T(
            128,
            128,
            key === 'certificate'
              ? 'NAMAKARANAM'
              : key === 'nameplate'
                ? 'A LITTLE NAME'
                : 'NAME KEEPSAKE',
            14,
            navy,
            1.1,
          ) +
          L(59, 149, 198, 149, brass, 0.8) +
          use('lotus', 128, 169, 21) +
          (key === 'name-scroll'
            ? R(15, 48, 17, 161, wood, gold, 1, 8) + R(224, 47, 17, 164, wood, gold, 1, 8)
            : ''),
        'rotate(-3 128 128)',
      );
    case 'elephant':
      return (
        ground() +
        P(
          'M55 138Q55 95 90 83Q106 68 134 82Q158 54 181 84Q202 103 193 129Q204 151 217 130Q227 152 205 165Q186 171 178 150L173 189 151 193 145 161Q119 172 101 165L94 196 68 193 70 157Q53 167 42 147Q32 127 42 112',
          jade,
          gold,
          1.4,
        ) +
        P('M135 91Q102 78 118 119Q136 146 159 111Z', blush, gold, 1.5) +
        C(174, 101, 3.5, navy) +
        P('M181 120q7 11 16 5q-8 12-17 4Z', paper) +
        P('M73 92Q103 79 124 90L116 121Q91 128 68 111Z', silk, gold, 1.7) +
        rosette(95, 105, 9, 8)
      );
    case 'bear':
    case 'rabbit':
    case 'lamb': {
      const s = key === 'bear' ? wood : key === 'rabbit' ? blush : paper;
      return (
        ground() +
        E(128, 161, 49, 55, s, brown, 1.4) +
        E(128, 165, 30, 37, paper) +
        E(89, 203, 27, 16, s, brown, 1) +
        E(170, 203, 27, 16, s, brown, 1) +
        (key === 'rabbit'
          ? G(E(105, 62, 13, 41, s, brown, 1), 'rotate(-16 104 90)') +
            G(E(151, 60, 13, 42, s, brown, 1), 'rotate(16 151 90)')
          : C(92, 78, 16, s, brown, 1) + C(164, 78, 16, s, brown, 1)) +
        E(128, 109, 48, 39, s, brown, 1.25) +
        (key === 'lamb'
          ? rep(8, (i) =>
              C(88 + i * 11, 88 - Math.sin((i * Math.PI) / 7) * 20, 11, paper, '#d7c09b', 0.6),
            )
          : '') +
        E(128, 123, 19, 14, paper) +
        C(111, 105, 3, navy) +
        C(146, 105, 3, navy) +
        P('M121 118Q128 114 136 118L129 125Z', navy) +
        P('M129 124v5q-5 5-9 0m9 0q4 5 9 0', 'none', brown, 1.1) +
        P('M93 145q29 12 63 0l-4 10q-27 9-55-1Z', silk) +
        T(128, 179, '✦', 16, brass)
      );
    }
    case 'swaddle':
      return (
        ground(129, 211, 63) +
        G(
          P(
            'M79 113Q77 60 125 45Q170 55 178 110Q186 176 137 210Q90 208 78 151Z',
            paper,
            brass,
            1.6,
          ) +
            E(125, 94, 32, 28, '#d9af8f') +
            P('M94 91Q95 59 127 60Q154 60 158 86Q129 68 94 91Z', blush) +
            P('M105 96q7 6 13 1m17 0q6 5 12-1', 'none', brown, 1.2) +
            P('M78 116Q140 126 171 171Q156 207 128 210Q83 190 78 116Z', blush, gold, 1.2) +
            P('M175 112Q150 141 95 155Q106 189 128 197Q179 158 175 112Z', paper, gold, 1.1) +
            rep(8, (i) => star(103 + (i % 3) * 17, 146 + Math.floor(i / 3) * 12, 3, brass)),
          'rotate(12 128 128)',
        )
      );
    case 'moon-cushion':
      return (
        P(
          'M167 43C95 80 104 159 191 175C128 234 47 186 48 120Q52 52 120 39Q147 32 167 43Z',
          paper,
          brass,
          2,
        ) +
        P('M145 46Q66 88 90 151T173 180', 'none', '#c99874', 1.3, 'stroke-dasharray="3 3"') +
        P('M78 117q10 10 19 0', 'none', brown, 2) +
        E(90, 133, 7, 3, blush) +
        star(175, 104, 27, gold) +
        star(202, 71, 9)
      );
    case 'baby-bowl':
      return (
        ground(125, 203, 89) +
        P('M34 128Q40 191 107 193Q164 193 176 128Z', silver, '#768492', 1.6) +
        E(105, 129, 71, 18, silver, '#7a8d98', 1.5) +
        E(105, 130, 59, 11, '#a4afb2') +
        P('M182 172L214 69', 'none', silver, 7) +
        G(E(220, 51, 12, 24, silver, '#8c9598', 1.2), 'rotate(20 220 51)') +
        swirls(65, 166, 77, paper)
      );
    case 'hoop':
      return (
        C(128, 130, 87, paper, wood, 8) +
        C(128, 130, 79, 'url(#weave)', gold, 1.3) +
        R(114, 30, 29, 12, brass, gold, 0.8, 2) +
        L(109, 33, 150, 33, gold, 4) +
        T(127, 153, 'A', 72, '#94755d') +
        vine(75, 154, 0.57) +
        use('rose', 101, 175, 23) +
        use('jasmine', 148, 179, 16)
      );
    case 'blocks': {
      const block = (x, y, l, c) =>
        P(`M${x} ${y}l22-13 49 9-20 15Z`, paper, gold, 1) +
        P(`M${x} ${y}l51 11v54l-51-10Z`, c, gold, 1.4) +
        P(`M${x + 51} ${y + 11}l20-15v54l-20 15Z`, wood, gold, 1.2) +
        T(x + 25, y + 42, l, 29, navy);
      return (
        ground() +
        block(43, 139, 'A', blush) +
        block(118, 143, 'B', '#b9d0c4') +
        block(84, 78, 'C', paper)
      );
    }
    case 'horse':
      return (
        ground() +
        P('M31 191Q122 242 224 186Q199 218 134 226Q67 226 31 191Z', wood, gold, 1.5) +
        P(
          'M74 120Q80 96 109 106L137 99 150 62 172 41 174 60 192 73 210 89 199 104 177 99 167 145 154 163 173 192 159 200 132 169 93 168 71 198 57 191 75 152Q48 156 49 180Q26 160 46 136Z',
          wood,
          gold,
          1.5,
        ) +
        P('M87 104Q112 112 137 98L131 130Q107 140 83 127Z', silk, gold, 1.4) +
        C(178, 79, 3, navy) +
        P('M148 68l-12 7 8 4-16 10 12 4-13 11', 'none', cream, 4)
      );
    case 'duck':
    case 'pull-bird':
      return (
        ground() +
        P(
          'M47 134Q43 174 79 187Q131 212 175 174Q203 146 177 124Q189 102 178 83Q157 60 139 81Q122 103 137 122Q109 149 63 116Z',
          key === 'duck' ? gold : jade,
          brass,
          1.8,
        ) +
        P('M173 94l28 10-28 8Z', wood) +
        C(160, 92, 3.5, navy) +
        P('M75 151Q104 168 141 134Q143 168 107 180Z', paper, gold, 1.1) +
        (key === 'pull-bird'
          ? rep(
              2,
              (i) => C(79 + i * 77, 194, 13, wood, gold, 1.5) + C(79 + i * 77, 194, 4, paper),
            ) + P('M178 143q33 18 58 7', 'none', silk, 2)
          : '')
      );
    case 'boat':
      return (
        ground(128, 188, 100) +
        P('M22 139l105 17 106-29-50 63-103 7Z', paper, brass, 1.6) +
        P('M55 144L143 51 135 154Z', blush, brass, 1.1) +
        P('M145 64l53 75-59 15Z', jade, gold, 1.3) +
        L(142, 48, 137, 156, wood, 3) +
        P('M144 48l34 9-34 8Z', silk) +
        rep(4, (i) => P(`M${26 + i * 23} ${209 - (i % 2) * 8}q13-5 35-1`, 'none', silver, 1.4))
      );
    case 'stacker':
      return (
        ground() +
        R(121, 43, 14, 145, wood, brass, 1, 6) +
        rep(5, (i) =>
          E(
            128,
            176 - i * 23,
            83 - i * 14,
            20 - i * 2,
            [jade, blush, gold, '#91a5b4', paper][i],
            brass,
            1.5,
          ),
        ) +
        C(128, 51, 15, wood, gold, 1.4)
      );
    case 'spinning-top':
      return (
        G(
          R(119, 43, 17, 52, wood, gold, 1, 5) +
            P('M56 118Q74 81 128 81Q183 85 203 117Q188 153 128 208Q74 154 56 118Z', wood, gold, 2) +
            E(129, 118, 73, 14, blush, gold, 1.7) +
            P('M82 153Q129 168 176 151M91 166Q130 177 163 166', 'none', jade, 6) +
            P('M120 202l8 18 7-20Z', silver),
          'rotate(18 128 128)',
        ) + ground(135, 228, 42)
      );
    case 'train':
      return (
        ground(128, 200, 105) +
        rep(2, (i) =>
          G(
            R(16, 129, 73, 47, i ? blush : jade, brass, 1.3, 4) +
              R(19, 113, 66, 16, paper, brass, 1.3, 3) +
              rep(2, (j) => R(25 + j * 30, 136, 20, 17, '#c2d3d5', brass, 0.9, 2)) +
              rep(2, (j) => C(31 + j * 43, 183, 10, wood, gold, 1.3)),
            `translate(${i * 79} 0)`,
          ),
        ) +
        R(174, 109, 51, 67, jade, gold, 1.5, 7) +
        R(183, 82, 22, 35, wood, gold, 1.1) +
        E(194, 79, 15, 6, brass) +
        C(197, 182, 16, wood, gold, 1.6) +
        rep(4, (i) => C(191 - i * 14, 60 - i * 8, 7 + i * 2, '#e1d8c977'))
      );
    case 'star-pillow':
      return (
        P(
          'M127 32Q137 29 151 86L214 90Q229 93 181 140L193 205Q190 215 130 177L74 211Q59 214 71 147L29 106Q20 93 96 87Z',
          blush,
          gold,
          2,
        ) +
        P(
          'M128 48L145 98 200 101 165 137 179 191 129 163 78 192 86 140 48 104 106 99Z',
          'none',
          '#b67d76',
          1.3,
          'stroke-dasharray="3 3"',
        ) +
        P('M97 127q8 8 16 0m29 0q8 8 16 0', 'none', brown, 2)
      );
    case 'storybook':
    case 'book':
    case 'album':
    case 'baby-album':
      return (
        book(key === 'storybook' || key === 'book') +
        (key === 'storybook'
          ? use('star', 78, 112, 30) + use('lotus', 181, 113, 25)
          : key === 'baby-album'
            ? place(foot(128, 127), 94, 85, 85)
            : '')
      );
    case 'abacus':
      return (
        R(29, 45, 198, 169, wood, gold, 1.8, 9) +
        R(40, 57, 177, 143, paper, brass, 1.4, 3) +
        rep(
          4,
          (i) =>
            L(43, 82 + i * 31, 215, 82 + i * 31, brass, 2) +
            rep(i + 3, (j) =>
              E(54 + j * 19, 82 + i * 31, 7, 12, [jade, blush, gold, '#8b9eb1'][i], brass, 0.8),
            ),
        )
      );
    case 'balloon':
      return (
        P('M80 151Q30 78 86 42Q128 12 175 41Q228 77 175 151L146 182H111Z', blush, gold, 1.6) +
        P('M113 180Q64 76 115 33M142 180Q178 85 142 31', 'none', paper, 8) +
        L(108, 181, 116, 206, brass, 1.8) +
        L(148, 181, 139, 206, brass, 1.8) +
        R(112, 204, 31, 21, wood, gold, 1, 3)
      );
    case 'pinwheel':
      return (
        L(130, 95, 103, 221, wood, 5) +
        rep(4, (i) =>
          G(
            P('M128 104L161 34 202 78 138 108Z', [blush, jade, paper, silk][i], gold, 1.2) +
              P('M128 104L161 34 159 90Z', gold),
            `rotate(${i * 90} 128 104)`,
          ),
        ) +
        C(128, 104, 8, brass)
      );
    case 'cloud':
      return P(
        'M54 156Q33 130 60 112Q64 82 95 93Q118 54 151 85Q180 66 196 106Q220 105 225 131Q224 156 198 158Z',
        paper,
        brass,
        1.4,
      );
    case 'family-tree':
      return (
        P(
          'M96 216Q125 172 119 125L86 99 60 97 91 91 119 108 116 77 128 91 140 65 135 111 159 95 191 89 179 102 151 107 134 131Q133 192 153 216Z',
          wood,
          gold,
          1,
        ) +
        rep(29, (i) => {
          const a = i * 137.5,
            r = Math.sqrt((i + 1) / 29);
          return use(
            'leaf',
            128 + 82 * r * Math.cos(a),
            91 + 54 * r * Math.sin(a),
            22 + (i % 2) * 5,
            i * 23,
          );
        })
      );
    case 'star-flower':
      return (
        ring('lotus', 128, 128, 66, 9, 52) + rosette(128, 128, 40, 14) + star(128, 128, 21, paper)
      );
    case 'wreath':
      return (
        ring('leaf', 128, 128, 84, 26, 32, 5) +
        ring('rose', 128, 128, 82, 7, 29) +
        ring('jasmine', 128, 128, 83, 12, 18, 14) +
        swirls(89, 134, 78, brass)
      );
    case 'toy-shelf':
      return (
        rep(2, (i) => R(22, 121 + i * 91, 214, 9, wood, gold, 1, 3)) +
        place(draw('bear'), 24, 27, 96) +
        place(draw('stacker'), 124, 28, 100) +
        place(draw('blocks'), 31, 125, 99) +
        place(draw('duck'), 132, 132, 96)
      );
    default:
      return null;
  }
}
