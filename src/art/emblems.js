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
  ring,
  polar,
  ticks,
  star,
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
  silk,
} from './svg.js';
// Small hand-drawn objects specific to observances, trades, and commemorations.
export function emblem(key, arg, draw) {
  switch (key) {
    case 'archway':
      return (
        R(30, 25, 196, 199, paper, brass, 2, 4) +
        P(
          'M53 211V116Q54 90 79 82Q106 74 128 44Q145 71 177 83Q204 93 204 115V211Z',
          '#345854',
          gold,
          2,
        ) +
        P('M66 200v-77q0-18 20-27 28-13 42-32 20 24 46 33 18 8 18 27v76', 'none', gold, 1.3) +
        place(draw('lantern'), 84, 73, 90, 119) +
        selvedge(34, 213, 188)
      );
    case 'diya':
      return (
        ground(127, 208, 86) +
        P('M29 141Q114 155 204 125L223 119Q196 181 145 191Q70 203 29 141Z', '#ae684a', brass, 1.4) +
        P('M29 141Q73 117 150 128Q190 134 223 119Q173 163 94 156Z', brass, gold, 1.8) +
        P(
          'M196 129Q179 112 193 87Q204 69 205 43Q208 70 218 90Q230 116 202 132Z',
          '#edb05b',
          gold,
          1.4,
        ) +
        P('M199 124q-8-17 6-34 11 17-1 36Z', cream) +
        rep(8, (i) => use('petal', 65 + i * 15, 165 + Math.sin(i * 0.5) * 7, 9))
      );
    case 'wooden-ladle':
      return G(
        R(120, 60, 12, 141, wood, brass, 1, 5) +
          E(126, 61, 21, 31, brass, gold, 1.4) +
          E(126, 60, 15, 23, wood) +
          C(126, 191, 2, paper),
        'rotate(29 128 128)',
      );
    case 'crow':
      return (
        P(
          'M30 189Q70 162 92 125Q109 99 140 100Q147 68 171 72Q193 73 193 94l37 9-37 8Q183 150 158 164Q114 190 69 181l-40 19Z',
          navy,
          brass,
          1.3,
        ) +
        P('M65 176Q105 132 149 123Q126 157 65 176Z', '#526373', brass, 0.8) +
        C(177, 89, 3, paper) +
        L(135, 171, 130, 198, brass, 2) +
        L(151, 168, 151, 195, brass, 2) +
        ground(129, 202, 76)
      );
    case 'lion':
      return (
        ground() +
        P(
          'M51 109Q96 88 142 115L172 105l17 18-12 39-9 36h-15l-1-33-63-3-9 37H64l1-42q-25-8-25-29l-11-15-6-27q8 17 18 17Z',
          brass,
          brown,
          1.3,
        ) +
        ring('petal', 168, 99, 34, 22, 34) +
        P('M137 81q30-32 58-4l-7 48q-18 19-33 1Z', paper, brass, 1.3) +
        C(156, 93, 2.3, navy) +
        C(178, 93, 2.3, navy) +
        P('M161 106l6 5 7-6Z', navy) +
        P('M167 112v6m-12-4 9 6 12-6', 'none', brown, 1.3)
      );
    case 'coins':
      return (
        ground() +
        rep(3, (k) =>
          G(
            rep([5, 3, 8][k], (i) => E(72 + k * 53, 185 - i * 5, 32, 10, brass, gold, 1.2)) +
              E(72 + k * 53, 187 - [5, 3, 8][k] * 5, 32, 11, gold, brass, 1) +
              use('lotus', 72 + k * 53, 185 - [5, 3, 8][k] * 5, 20),
            `translate(0 ${(k % 2) * 11})`,
          ),
        ) +
        G(C(123, 95, 38, gold, brass, 1.6) + rosette(123, 95, 28, 14), 'rotate(12 123 95)')
      );
    case 'hibiscus':
      return (
        rep(2, (j) =>
          G(
            rep(5, (i) =>
              G(
                P('M0 0Q-25-4-23-23Q-37-37-16-43Q3-52 10-40Q24-24 0 0Z', silk, '#b56f74', 1),
                `rotate(${i * 72})`,
              ),
            ) +
              P('M0 0Q12-11 32-21', 'none', gold, 3) +
              rep(5, (i) => C(30 + i * 1.2, -21 + (i % 3) * 2, 2.6, brass)),
            `translate(${92 + 71 * j} ${96 + 54 * j}) scale(${j ? 0.88 : 1.2})`,
          ),
        ) +
        use('leaf', 97, 175, 55, -42) +
        use('leaf', 163, 82, 38, 44)
      );
    case 'bonfire':
      return (
        ground() +
        P('M53 187l149 20 2 10-153-18ZM62 213l135-32 4 10-137 31Z', wood, brass, 1) +
        P(
          'M77 184Q45 140 86 94Q76 122 99 121Q107 69 139 38Q130 91 155 103Q167 115 169 83Q202 118 190 161Q185 197 135 201Z',
          '#d27e49',
          brass,
          1.4,
        ) +
        P(
          'M98 184Q80 154 112 122Q103 144 121 143Q128 109 144 91Q137 128 156 143Q174 175 148 191Z',
          gold,
        ) +
        P('M118 181Q115 163 136 141Q130 161 146 169Q153 185 134 191Z', cream)
      );
    case 'mountain':
      return (
        C(176, 67, 24, gold) +
        P('M11 196L82 75 115 131 156 40 247 196Z', '#607f83', gold, 1.2) +
        P('M82 75l-23 41 19-11 9 12 9-16ZM156 40l-33 73 29-18 11 15 10-15 18 10Z', paper) +
        P('M11 196Q57 161 90 180Q140 202 177 158Q214 138 247 171V207H11Z', jade) +
        P('M72 212Q161 209 146 189q-8-8 14-15', 'none', silver, 3)
      );
    case 'harvest-bull':
      return (
        ground() +
        P(
          'M58 145Q44 129 50 107Q54 78 76 76Q88 79 98 93Q137 78 164 94Q183 81 190 64Q200 47 214 64L222 96 211 112 196 109 186 133 179 148 181 200 169 202 158 155 90 154 84 201 71 201 69 156Z',
          paper,
          brown,
          1.8,
        ) +
        P('M51 104Q31 119 37 161L29 172', 'none', brown, 3.5) +
        P(
          'M186 74Q165 55 176 32Q178 55 197 63M204 64Q211 47 218 34Q225 54 213 75',
          brass,
          gold,
          1.1,
        ) +
        P('M191 80Q174 69 174 82Q183 92 195 86Z', blush) +
        C(207, 79, 2.8, navy) +
        P('M75 92Q113 105 146 94L140 128Q108 143 76 129Z', silk, gold, 1.5) +
        selvedge(81, 119, 55) +
        rep(8, (i) => use(i % 3 ? 'jasmine' : 'rose', 168 + i * 2, 96 + i * 5, 9))
      );
    case 'lingam':
      return (
        ground() +
        E(127, 193, 76, 19, '#4b5351', gold, 1.6) +
        P('M57 171Q126 145 188 164l32-1-9 12-29 6Q124 203 57 181Z', '#58605d', brass, 1.5) +
        P('M91 164V98Q89 58 127 54Q166 55 165 96V164Q128 179 91 164Z', '#45484b', gold, 1.6) +
        rep(3, (i) => P(`M103 ${103 + i * 6}q24 6 50 0`, 'none', cream, 2.1)) +
        C(128, 109, 3.3, '#c77a58') +
        use('jasmine', 82, 173, 20) +
        use('leaf', 164, 173, 23, 60)
      );
    case 'butter-pot':
      return (
        P(
          'M94 95Q63 119 66 153Q67 202 127 208Q181 206 190 164Q199 125 161 96Z',
          '#b87850',
          brass,
          2,
        ) +
        P('M79 142Q129 161 180 141M74 153Q129 173 184 153', 'none', cream, 3) +
        E(128, 96, 42, 10, paper, brass, 1.5) +
        rep(5, (i) => C(103 + i * 12, 90 - (i % 2) * 8, 12, paper)) +
        P('M153 94q17 9 9 29t-12-8Z', cream) +
        place(draw('flute'), 3, 16, 105, 91, 20) +
        use('leaf', 68, 197, 30, 65) +
        ground()
      );
    case 'gudi':
      return (
        L(125, 29, 125, 219, wood, 5) +
        P('M126 42Q108 67 81 182L105 174 122 193 139 88 169 141 181 118 151 50Z', silk, gold, 1.6) +
        P('M111 72Q99 130 90 171', 'none', gold, 3) +
        P('M102 46Q99 24 126 18Q152 26 150 46Z', brass, gold, 1.5) +
        E(126, 46, 28, 6, gold) +
        rep(8, (i) => use('marigold', 106 + i * 6, 54 + Math.sin(i * 0.5) * 9, 14)) +
        use('leaf', 154, 68, 30, 32)
      );
    case 'mirror':
    case 'sieve':
      return G(
        R(119, 135, 14, 91, wood, gold, 1.1, 6) +
          C(126, 106, 61, brass, gold, 2) +
          C(126, 106, 53, key === 'mirror' ? silver : paper, brass, 1.3) +
          (key === 'mirror'
            ? P('M92 113l44-43m-27 55 40-41', 'none', '#f2efe4', 4)
            : rep(29, (i) =>
                L(
                  79 + (i % 5) * 19,
                  79 + Math.floor(i / 5) * 10,
                  91 + (i % 5) * 19,
                  79 + Math.floor(i / 5) * 10,
                  brass,
                  0.8,
                ),
              )),
        'rotate(16 128 128)',
      );
    case 'bodhi-leaf':
      return (
        P(
          'M53 113Q46 56 99 52Q119 52 128 76Q166 28 197 67Q221 97 181 143Q144 187 126 219Q121 190 88 160Q61 137 53 113Z',
          jade,
          gold,
          1.5,
        ) +
        P('M128 70Q133 130 126 212', 'none', gold, 2) +
        rep(6, (i) =>
          P(
            `M129 ${85 + 17 * i}q-25 -7 -${55 - i * 6} -25m${55 - i * 6} 25q25-4 ${53 - i * 6} -31`,
            'none',
            '#c4bd87',
            1,
          ),
        )
      );
    case 'dates':
      return (
        ground() +
        E(130, 158, 94, 35, brass, gold, 1.5) +
        E(128, 154, 84, 26, paper) +
        rep(13, (i) =>
          G(
            E(0, 0, 11, 20, wood, '#845634', 1) + P('M-2-13Q3-3-2 12', 'none', '#825432', 1.4),
            `translate(${71 + (i % 5) * 26} ${136 + Math.floor(i / 5) * 13}) rotate(${i * 23})`,
          ),
        )
      );
    case 'nativity':
      return (
        P('M25 115L126 44 232 112M43 106v92m173-91v92', 'none', wood, 8) +
        star(128, 31, 15) +
        rep(2, (i) =>
          G(
            P('M57 169Q63 95 88 95Q108 104 113 180Z', i ? jade : blush, gold, 1.3) +
              E(89, 106, 12, 14, '#c79978'),
            `translate(${i * 84} ${i * -8})`,
          ),
        ) +
        P('M81 164L179 164 154 190 101 190Z', wood, gold, 1.5) +
        E(130, 159, 26, 12, paper) +
        C(143, 153, 9, '#dbb69a') +
        P('M103 188l-9 17m58-17 10 17', 'none', brass, 4)
      );
    case 'cross':
      return (
        P('M117 39h23v53h52v22h-52v100h-23V114H64V92h53Z', wood, gold, 1.6) +
        place(draw('olive-branch'), 30, 141, 108, 93, -28) +
        ground()
      );
    case 'parasol':
      return (
        L(128, 72, 128, 223, wood, 5) +
        P(
          'M23 119Q49 57 128 42Q204 57 232 119Q209 139 188 119Q165 139 145 119Q126 137 108 119Q87 139 66 119Q46 138 23 119Z',
          silk,
          gold,
          1.8,
        ) +
        rep(5, (i) => P(`M128 45Q${55 + 37 * i} 82 ${28 + 48 * i} 117`, 'none', gold, 1.4)) +
        rep(20, (i) => use('petal', 26 + i * 10.6, 126 + Math.sin(i * 1.4) * 4, 9)) +
        star(128, 38, 8)
      );
    case 'flower-tower':
      return (
        ground() +
        rep(6, (k) =>
          rep(14 - k * 2, (i) =>
            use(
              ['marigold', 'rose', 'jasmine'][k % 3],
              45 + k * 13 + i * 12.6,
              183 - k * 20 + Math.sin(i * 0.7) * 2,
              22 - k * 0.8,
            ),
          ),
        ) +
        use('lotus', 128, 54, 29)
      );
    case 'hornbill':
    case 'parrot':
    case 'peace-dove':
      return (
        ground() +
        P(
          'M42 175Q76 156 87 119Q94 81 132 78Q147 43 177 52Q203 62 198 87L219 98 190 104Q189 156 152 173Q102 200 68 177L35 201Z',
          key === 'peace-dove' ? paper : key === 'hornbill' ? navy : jade,
          brass,
          1.5,
        ) +
        P('M74 162Q98 121 158 113Q133 160 74 162Z', key === 'hornbill' ? paper : blush, gold, 1.3) +
        P(
          key === 'hornbill' ? 'M176 76q8-33 31-13l3 10q23 0 29 24l-51-3Z' : 'M190 78l30 12-28 8Z',
          brass,
          gold,
          1,
        ) +
        C(176, 71, 3.4, navy, '#eee0b0', 1) +
        (key === 'peace-dove' ? use('leaf', 214, 108, 23, 47) : '')
      );
    case 'temple-gate':
      return (
        rep(6, (i) =>
          G(
            P(
              `M${29 + i * 12} ${190 - i * 24}l11-21h${172 - i * 24}l12 21Z`,
              i % 2 ? '#a78667' : paper,
              brass,
              1.2,
            ) +
              rep(7 - i, (j) =>
                P(`M${45 + i * 12 + j * 24} ${185 - i * 24}v-8q7-10 13 0v8Z`, jade, gold, 0.9),
              ) +
              R(24 + i * 12, 192 - i * 24, 207 - i * 24, 5, brass),
          ),
        ) +
        P('M96 217v-31q31-45 63 0v31Z', navy, gold, 1.7) +
        R(18, 214, 220, 7, wood, gold, 1) +
        rep(5, (i) => C(86 + i * 22, 45, 5, brass))
      );
    case 'serpent':
      return (
        P(
          'M127 183Q159 188 162 203Q131 222 76 206Q60 193 80 184Q100 175 134 181Q142 154 119 130Q84 94 97 65Q111 36 137 44Q178 39 172 88Q165 120 141 131Q160 165 147 186',
          'none',
          brass,
          13,
        ) +
        P(
          'M109 69Q112 47 134 48Q161 42 163 70Q160 99 141 119L124 119Q104 94 109 69Z',
          jade,
          gold,
          1.5,
        ) +
        E(134, 74, 15, 21, brass, gold, 1) +
        C(127, 72, 2, navy) +
        C(141, 72, 2, navy)
      );
    case 'sangai':
      return (
        ground() +
        P(
          'M49 127Q76 100 122 115Q153 120 168 85L178 71 193 78 206 94 197 105 178 99 166 145 153 154 163 202 153 204 135 157 88 158 72 204 62 202 69 150 47 161Z',
          wood,
          gold,
          1.5,
        ) +
        P(
          'M177 75Q140 55 147 30m10 33-18-6m29 15-3-25m18 24q-9-25 5-43m-8 27 19-13',
          'none',
          brass,
          3,
        ) +
        C(189, 85, 2.5, navy) +
        rep(8, (i) => C(71 + i * 9, 131 + (i % 2) * 5, 2.3, paper))
      );
    case 'bamboo':
      return rep(4, (i) =>
        G(
          P('M95 214V48', 'none', jade, 10) +
            rep(7, (j) => L(89, 56 + 24 * j, 101, 56 + 24 * j, gold, 1.4)) +
            rep(5, (j) => use('leaf', 104 + (j % 2) * 6, 67 + j * 22, 23, j % 2 ? 47 : -59)),
          `translate(${i * 20 - 12} 0) rotate(${i * 6 - 11} 125 214)`,
        ),
      );
    case 'speaker':
      return (
        P('M44 99L146 111 142 153 67 205 52 195 84 149 51 143Z', wood, gold, 1.7) +
        P('M51 93Q121 91 180 43L202 154Q160 135 54 141Z', blush, brass, 2) +
        G(E(191, 99, 17, 56, brass, gold, 1.6), 'rotate(-11 191 99)') +
        rep(3, (i) => L(213, 69 + i * 24, 231, 58 + i * 30, gold, 2.6))
      );
    case 'laurel':
      return (
        rep(2, (j) =>
          G(
            P('M127 213Q41 176 53 77', 'none', brass, 2.6) +
              rep(14, (i) => use('leaf', 55 + i * i * 0.32, 81 + i * 8.4, 23, i % 2 ? -30 : 56)),
            j ? 'translate(256 0) scale(-1 1)' : '',
          ),
        ) +
        star(128, 109, 35) +
        use('rose', 127, 206, 22)
      );
    case 'constitution':
      return (
        place(draw('album'), -8, -1, 272) +
        G(
          R(87, 90, 101, 58, paper, brass, 1.2, 3) +
            T(137, 117, 'CONSTITUTION', 9, brown, 0.7) +
            T(137, 132, 'OF INDIA', 8, brown, 1),
          'rotate(-8 128 128)',
        )
      );
    case 'microscope':
      return (
        ground() +
        P('M144 82Q206 96 181 151Q171 179 148 184', 'none', brass, 15) +
        G(
          R(108, 43, 28, 81, silver, brass, 1, 5) +
            R(103, 38, 38, 11, navy, gold, 1, 3) +
            R(114, 124, 17, 15, brass),
          'rotate(29 122 103)',
        ) +
        C(167, 142, 16, wood, gold, 2) +
        R(57, 153, 96, 8, navy, gold, 1, 2) +
        P('M116 166l-6 33-32 10v9h102l-2-11-34-10 13-33Z', jade, brass, 1.6)
      );
    case 'medical-bag':
      return (
        ground() +
        P('M94 97V81Q96 55 127 55Q157 54 160 80V97', 'none', brass, 9) +
        R(38, 85, 180, 116, jade, gold, 2, 14) +
        P('M41 96q90 32 174 0', 'none', gold, 1.3) +
        R(115, 120, 22, 57, cream) +
        R(98, 139, 56, 20, cream) +
        rep(2, (i) => R(58 + i * 128, 102, 8, 88, wood, gold, 1, 3))
      );
    case 'drafting-compass':
      return (
        P('M126 62L55 213 68 205 132 96 190 204 202 214 148 69Z', silver, brass, 2) +
        P('M83 160Q134 183 170 151', 'none', brass, 4) +
        C(135, 71, 17, brass, gold, 1.4) +
        C(135, 71, 7, navy) +
        R(129, 35, 12, 21, wood, brass, 1.3, 3)
      );
    case 'blueprint':
      return G(
        R(31, 44, 194, 166, '#324c68', silver, 1.5, 3) +
          rep(13, (i) => L(39 + i * 14, 51, 39 + i * 14, 201, '#59718b', 0.6)) +
          rep(11, (i) => L(38, 53 + i * 14, 218, 53 + i * 14, '#59718b', 0.6)) +
          P('M57 170V84h68v27h66v60ZM125 84v58H58m90-29v56', 'none', cream, 2) +
          C(175, 82, 13, 'none', cream, 1.2),
        'rotate(-4 128 128)',
      );
    case 'tools':
      return (
        G(
          P(
            'M68 66l16 16 13-12-13-16Q110 48 115 75Q120 92 101 104l95 85q9 16-7 21L90 116Q52 123 59 79Z',
            silver,
            brass,
            1.5,
          ),
        ) +
        G(
          R(115, 88, 17, 120, wood, gold, 1.4, 4) +
            P('M80 62h73l18 23-33 10-16-8-45 1Z', navy, silver, 1.6),
          'rotate(37 128 128)',
        )
      );
    case 'spinning-wheel':
      return (
        C(96, 127, 65, 'none', wood, 7) +
        rep(16, (i) => L(96, 127, ...polar(96, 127, 61, i * 22.5), brass, 1.9)) +
        C(96, 127, 7, brass) +
        P('M61 201l33-77 31 77m44 0 21-72 26 72M43 204h181', 'none', wood, 6) +
        L(96, 128, 196, 128, silver, 2) +
        E(192, 130, 15, 29, paper, brass, 2) +
        P('M99 66l98 43M99 187l99-39', 'none', gold, 1)
      );
    case 'hockey':
      return (
        rep(2, (i) =>
          G(
            P(
              'M112 42l11-2 23 135q6 32-21 32-31 1-30-23 1-13 14-7 11 18 21 8Z',
              i ? jade : wood,
              brass,
              1.4,
            ) + rep(5, (j) => L(113 + j * 0.6, 51 + j * 5, 124 + j * 0.6, 49 + j * 5, gold, 1.4)),
            `rotate(${i ? 31 : -26} 128 132)`,
          ),
        ) + C(172, 207, 10, paper, brass, 1.3)
      );
    case 'medal':
      return (
        P('M72 33h37l33 86-28 9ZM179 33h-35l-32 86 27 8Z', silk, gold, 1.3) +
        rosette(128, 161, 54, 18) +
        star(128, 161, 23, gold)
      );
    case 'scoreboard':
      return (
        R(28, 65, 199, 129, wood, gold, 2, 8) +
        R(37, 74, 181, 112, navy, silver, 1, 4) +
        T(128, 101, 'SCORE', 12, cream, 3) +
        T(128, 158, '00 : 00', 42, cream) +
        rep(2, (i) => R(63 + i * 125, 192, 8, 25, wood, gold, 1))
      );
    case 'loom':
      return (
        R(43, 25, 170, 195, wood, gold, 2, 5) +
        R(56, 42, 143, 159, '#cab598') +
        rep(24, (i) => L(58 + 6 * i, 42, 58 + 6 * i, 202, cream, 1.5)) +
        R(55, 109, 145, 87, silk) +
        rep(16, (i) => L(56, 111 + i * 5, 198, 111 + i * 5, i % 4 ? gold : cream, 1.1)) +
        P('M60 80l102-27 27 3-19 11-102 26Z', wood, gold, 1.3)
      );
    case 'circuit':
      return (
        R(36, 39, 184, 179, jade, gold, 1.5, 8) +
        rep(4, (i) =>
          G(
            rep(
              5,
              (j) =>
                P(
                  `M${91 + j * 12} 93v-${13 + (j % 2) * 9}l${j % 2 ? 9 : -7}-8v-15`,
                  'none',
                  gold,
                  1.8,
                ) + C(91 + j * 12 + (j % 2 ? 9 : -7), 57 - (j % 2) * 8, 3, paper),
            ),
            `rotate(${90 * i} 128 128)`,
          ),
        ) +
        R(85, 85, 86, 86, navy, gold, 2, 5) +
        R(97, 97, 62, 62, 'none', silver, 1) +
        star(128, 128, 19)
      );
    default:
      return null;
  }
}
