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
export function occasionArt(key, arg, draw) {
  switch (key) {
    case 'chalkboard':
      return (
        ground() +
        R(20, 43, 216, 152, wood, gold, 1.8, 7) +
        R(31, 54, 193, 129, '#345347', '#8c7357', 1.5, 2) +
        T(130, 98, 'Aa   Bb   Cc', 24, cream, 1) +
        P(
          'M54 150l28-39 30 39ZM127 126h30m-15-15v29M172 140q8-27 24-22q15 8-5 20',
          'none',
          '#e5dec7',
          1.6,
        ) +
        L(42, 161, 207, 161, '#c7cbb6', 1) +
        R(36, 187, 185, 6, wood, gold, 1) +
        R(157, 181, 21, 4, cream) +
        R(68, 181, 34, 7, brass)
      );
    case 'pencils':
    case 'quill-cup':
      return (
        rep(6, (i) =>
          G(
            P('M-4 0l4-15 4 15v89h-8Z', [jade, blush, gold, navy, paper, silk][i], brass, 0.9) +
              P('M-2-10l2-6 2 6Z', navy),
            `translate(${88 + i * 15} ${55 + (i % 3) * 12}) rotate(${(i - 2.5) * 6})`,
          ),
        ) +
        P('M65 131Q128 149 190 131L176 205Q127 220 80 204Z', brass, gold, 1.6) +
        E(128, 132, 62, 7, gold) +
        selvedge(83, 185, 91)
      );
    case 'globe':
      return (
        ground() +
        P('M91 212Q126 198 129 170L136 172Q132 193 166 214Z', brass, gold, 1) +
        G(
          C(127, 118, 76, '#87aab1', gold, 2.5) +
            P(
              'M58 97L82 68 102 64 112 80 103 92 91 94 90 113 77 119 68 136ZM102 119l28 7 7 17-12 29-12 12-6-41ZM132 67l23 3 10-7 21 19 8 19-12 6-17-9-8 19-8-6-16-8ZM140 113l21 10 5 20-14 19-14-11-7-20ZM174 148l17-2 9 13-14 6-14-6Z',
              '#c5cf9a',
              '#899f80',
              1,
            ) +
            E(127, 118, 43, 75, 'none', '#f1e6c6', 0.8) +
            E(127, 118, 13, 75, 'none', '#f1e6c6', 0.8) +
            E(127, 118, 75, 23, 'none', '#f1e6c6', 0.8) +
            P('M127 31a87 87 0 0 1 0 174', 'none', brass, 5),
          'rotate(15 127 118)',
        )
      );
    case 'chakra':
      return (
        C(128, 128, 100, '#e5e1cf', navy, 4) +
        C(128, 128, 91, 'none', navy, 2) +
        rep(24, (i) =>
          P(
            `M128 128L${polar(128, 128, 91, i * 15 - 0.8).join(' ')} ${polar(128, 128, 91, i * 15 + 0.8).join(' ')}Z`,
            navy,
          ),
        ) +
        C(128, 128, 9, navy)
      );
    case 'tricolor':
      return (
        L(49, 36, 49, 221, brass, 5) +
        C(49, 34, 5, gold) +
        rep(3, (i) =>
          P(
            `M51 ${47 + i * 27}c58-18 97 23 156 0v27c-59 22-98-17-156 0Z`,
            ['#d89554', '#f7f1df', '#708e62'][i],
          ),
        ) +
        place(draw('chakra'), 106, 76, 40) +
        ground(57, 225, 38)
      );
    case 'drop':
      return (
        P(
          'M128 30C112 66 61 112 63 151C63 190 92 216 128 216C168 216 196 187 195 150C195 112 150 63 128 30Z',
          '#81abb3',
          gold,
          1.9,
        ) +
        P('M109 83Q75 132 84 158Q90 182 108 185', 'none', '#dfeede', 6) +
        P('M102 194Q130 210 167 177', 'none', '#59878e', 1.6) +
        ground(128, 229, 63)
      );
    case 'heart':
      return (
        P(
          'M128 206C95 179 34 145 38 97C41 49 98 39 128 82C163 39 215 52 219 97C224 140 175 174 128 206Z',
          blush,
          brass,
          2,
        ) +
        P(
          'M128 191C96 167 44 138 49 98Q60 49 104 74',
          'none',
          '#f6dfca',
          2,
          'stroke-dasharray="4 4"',
        ) +
        use('rose', 178, 156, 35) +
        use('leaf', 196, 148, 24, 43)
      );
    case 'stethoscope':
      return (
        P(
          'M63 48Q44 38 48 75L59 115Q69 149 95 147Q126 145 138 108L147 63Q150 42 134 46',
          'none',
          silver,
          7,
        ) +
        C(65, 47, 6, navy) +
        C(132, 46, 6, navy) +
        P('M59 112Q75 171 111 135M93 147Q86 215 144 214Q193 209 185 154', 'none', jade, 8) +
        C(185, 136, 24, silver, brass, 2) +
        C(185, 136, 17, paper) +
        C(185, 136, 9, '#a5bbb8')
      );
    case 'peacock-feather':
      return (
        P('M80 218Q139 121 169 47', 'none', brass, 2.5) +
        P('M101 174Q75 109 135 58Q164 30 200 30Q215 91 168 123Q140 147 101 174Z', jade, gold, 0.9) +
        rep(19, (i) =>
          P(
            `M${105 + i * 2.6} ${163 - i * 5.3}q-15 -9 -19 -25m19 25q18 -5 30 -18`,
            'none',
            '#c4c391',
            0.8,
          ),
        ) +
        G(
          E(159, 75, 22, 33, gold) + E(159, 76, 16, 23, '#3b747b') + E(159, 77, 10, 16, navy),
          'rotate(30 159 76)',
        )
      );
    case 'grain':
    case 'sugarcane':
      return rep(3, (j) =>
        G(
          P(
            'M110 217Q114 127 137 45',
            'none',
            key === 'grain' ? gold : jade,
            key === 'grain' ? 2.3 : 11,
          ) +
            rep(11, (i) =>
              key === 'grain'
                ? use('petal', 127 + i * 0.9, 116 - i * 6.3, 14, i % 2 ? -35 : 35)
                : P(`M${112 + i * 1.9} ${196 - i * 13}l11 1`, 'none', '#c6c594', 2),
            ) +
            (key === 'sugarcane'
              ? rep(5, (k) =>
                  P(
                    `M136 60Q${90 + k * 23} ${27 - k * 4} ${77 + k * 29} ${47 + (k % 2) * 16}Q119 34 136 60Z`,
                    jade,
                  ),
                )
              : '') +
            use('leaf', 114, 148, 39, -37),
          `rotate(${(j - 1) * 17} 120 199)`,
        ),
      );
    case 'pongal-pot':
      return (
        place(draw('sugarcane'), 80, 3, 161, 188) +
        P(
          'M85 113Q50 150 69 186Q94 219 148 208Q195 198 188 160Q186 136 162 114Z',
          '#b27751',
          brass,
          2,
        ) +
        E(123, 116, 43, 9, paper, brass, 1.4) +
        rep(8, (i) => C(85 + i * 11, 112 - (i % 3) * 4, 8 + (i % 3), paper)) +
        P('M79 151q47 16 95 1M79 160q50 16 99-1', 'none', cream, 2.5) +
        rep(7, (i) => star(91 + i * 13, 177 + Math.sin(i * 0.5) * 4, 3, cream)) +
        ground()
      );
    case 'pookalam':
    case 'kolam':
      return key === 'pookalam'
        ? C(128, 128, 104, '#b3b579', gold, 1.5) +
            ring('marigold', 128, 128, 90, 32, 19) +
            ring('jasmine', 128, 128, 73, 28, 17) +
            ring('rose', 128, 128, 55, 18, 23) +
            ring('leaf', 128, 128, 32, 12, 18) +
            use('lotus', 128, 128, 46)
        : rep(4, (j) =>
            G(
              P(
                'M128 31Q157 32 143 69Q126 104 171 86C203 70 221 109 196 126Q166 145 152 135Q133 112 139 160Q152 210 128 225',
                'none',
                paper,
                2.6,
              ),
              `rotate(${j * 90} 128 128)`,
            ),
          ) + rep(25, (j) => C(68 + (j % 5) * 30, 68 + Math.floor(j / 5) * 30, 2.1, gold));
    case 'kite':
      return (
        P('M128 28L214 113 128 186 42 113Z', paper, brass, 1.7) +
        P('M128 29L212 113 128 113Z', blush) +
        P('M44 113H128v71Z', jade) +
        L(128, 28, 128, 186, brass, 1.3) +
        P('M42 113Q128 80 214 113', 'none', brass, 1.2) +
        P('M128 185q3 26 -19 32t-40 -1', 'none', gold, 1.6) +
        rep(3, (i) =>
          G(
            P('M-9-6l9 4 9-4v12l-9-4-9 4Z', silk, gold, 0.8),
            `translate(${122 - i * 17} ${199 + i * 9}) rotate(20)`,
          ),
        )
      );
    case 'water-spray':
      return G(
        R(56, 110, 127, 29, blush, gold, 1.5, 5) +
          R(145, 110, 15, 29, brass) +
          R(32, 119, 32, 9, silver) +
          R(23, 113, 13, 20, wood, gold, 1, 3) +
          P('M183 112l20 12-20 12Z', brass) +
          rep(12, (i) =>
            E(
              208 + (i % 3) * 10,
              102 + Math.floor(i / 3) * 13,
              2,
              4,
              ['#b3698a', '#89afbe', '#d8b968'][i % 3],
            ),
          ),
        'rotate(-23 128 128)',
      );
    case 'spool':
      return G(
        R(71, 77, 113, 99, wood, brass, 1.5, 8) +
          rep(17, (i) => P(`M68 ${79 + i * 5.3}q62 13 119 0`, 'none', i % 3 ? blush : paper, 4.6)) +
          E(128, 76, 66, 11, wood, gold, 1.4) +
          E(128, 176, 65, 10, wood, gold, 1.4) +
          P('M181 141q61 16 21 52t-19 26', 'none', blush, 2),
        'rotate(15 128 128)',
      );
    case 'rakhi':
      return (
        P('M16 146Q74 95 128 128Q178 155 241 101', 'none', silk, 5) +
        P('M14 153Q76 101 128 135Q183 159 241 108', 'none', gold, 2) +
        rosette(129, 129, 43, 16) +
        C(129, 129, 11, silk, gold, 2) +
        rep(
          4,
          (i) => C(54 + i * 9, 124 - (i % 2), 4.3, brass) + C(182 + i * 9, 131 - i * 3, 4.3, brass),
        )
      );
    case 'lantern':
      return (
        L(128, 15, 128, 46, brass, 2) +
        E(128, 49, 13, 11, 'none', gold, 2.5) +
        P('M83 88Q105 62 128 58Q158 63 175 87Z', brass, gold, 1.2) +
        P('M82 91L173 91 161 180 96 180Z', '#e5bb83', brass, 2) +
        L(103, 92, 109, 180, gold, 4) +
        L(152, 92, 148, 180, gold, 4) +
        P('M113 168Q106 151 128 121Q127 137 139 142Q155 176 113 168Z', '#ffe6a1') +
        R(91, 181, 74, 10, brass, gold, 1, 4) +
        P('M99 192Q128 221 158 192Z', gold) +
        L(128, 210, 128, 229, brass, 2)
      );
    case 'date-palm':
      return (
        P('M109 225Q130 152 119 90Q111 73 120 66Q153 128 129 225Z', wood, gold, 1) +
        rep(8, (i) =>
          G(
            P('M120 81Q148 38 207 68Q161 56 125 87Z', jade, gold, 0.7) +
              rep(8, (j) =>
                P(`M${130 + j * 9} ${72 - Math.sin(j * 0.4) * 12}l10 20`, 'none', '#94a27c', 1.4),
              ),
            `rotate(${i * 37 - 130} 120 81)`,
          ),
        )
      );
    case 'evergreen':
      return (
        R(117, 164, 21, 61, wood, brass, 1) +
        rep(3, (i) =>
          P(
            `M128 ${27 + i * 35}l${37 + i * 17} ${67 + i * 12}q-${39 + i * 15} 12 -${74 + i * 34} 0Z`,
            jade,
            gold,
            1.1,
          ),
        ) +
        rep(13, (i) => C(91 + ((i * 13) % 77), 83 + ((i * 23) % 98), 3.7, i % 2 ? gold : blush)) +
        star(128, 27, 14)
      );
    case 'chariot':
      return (
        place(draw('mandap'), 32, 16, 189, 155) +
        R(31, 170, 194, 20, wood, gold, 2, 4) +
        rep(
          2,
          (i) =>
            C(71 + i * 115, 195, 23, brass, gold, 2) +
            ring('petal', 71 + i * 115, 195, 14, 10, 7) +
            C(71 + i * 115, 195, 5, paper),
        ) +
        L(211, 180, 244, 152, wood, 4)
      );
    case 'mother-child':
    case 'parent-child': {
      const mother = key === 'mother-child';
      return (
        ground() +
        P(
          'M55 208Q58 129 89 100Q112 88 132 112Q148 137 154 207Z',
          mother ? silk : jade,
          gold,
          1.5,
        ) +
        C(106, 82, 26, '#ce9d7e', brown, 1) +
        P(
          mother
            ? 'M78 89Q74 54 99 51Q137 44 135 83Q121 79 114 63Q105 85 86 86Q81 111 91 127Q67 118 78 89Z'
            : 'M79 83Q79 48 109 52Q134 51 134 76Q118 62 96 69L87 86Z',
          navy,
        ) +
        P('M134 202Q140 145 163 139Q183 133 193 156L203 202Z', blush, gold, 1.3) +
        C(169, 121, 20, '#d5a687', brown, 1) +
        P('M149 119Q145 96 166 97Q185 94 188 114Q174 106 167 112Z', navy) +
        P('M78 124Q86 158 114 158L145 146', 'none', '#cda082', 10) +
        P('M186 150Q170 163 146 148', 'none', '#d7ad87', 7) +
        (mother
          ? P('M94 108Q127 148 130 201', 'none', gold, 4)
          : P('M99 112l11 12 11-14', 'none', gold, 2))
      );
    }
    case 'yoga':
      return (
        ground() +
        C(127, 69, 21, '#c19b7c', gold, 1.3) +
        P('M102 110Q127 82 151 108L160 160Q125 183 99 159Z', jade, gold, 1.8) +
        P('M105 119Q88 159 62 159M149 118Q169 157 194 154', 'none', '#d1a985', 9) +
        P(
          'M110 163Q65 148 48 179Q59 205 127 194Q199 206 208 178Q187 149 147 163Z',
          blush,
          gold,
          1.3,
        ) +
        P('M74 180Q124 181 161 173', 'none', brass, 1.3) +
        ring('petal', 128, 72, 35, 14, 8)
      );
    case 'paintbox':
    case 'palette':
      return (
        P(
          'M44 149Q24 82 101 59Q180 36 205 91Q219 118 190 128Q157 136 169 166Q184 203 138 204Q67 202 44 149Z',
          wood,
          gold,
          1.7,
        ) +
        E(159, 124, 10, 14, paper) +
        rep(5, (i) =>
          C(
            66 + i * 26,
            106 - Math.sin((i * Math.PI) / 4) * 30,
            11,
            [silk, blush, gold, jade, navy][i],
          ),
        ) +
        P('M64 194l135-86 4 4-131 94Z', silver, gold, 1.1) +
        G(use('leaf', 203, 106, 29, 55))
      );
    case 'camera':
      return (
        R(30, 91, 197, 107, navy, gold, 2, 11) +
        P('M70 91l17-25h58l14 25Z', silver, gold, 1.3) +
        R(44, 79, 24, 13, wood, gold, 1.2, 2) +
        R(38, 110, 179, 60, 'url(#weave)') +
        C(132, 143, 43, brass, gold, 1.6) +
        C(132, 143, 36, navy, silver, 1.4) +
        C(132, 143, 24, '#527281', '#8ba7ad', 2) +
        C(123, 133, 7, '#c1d3ce') +
        R(182, 102, 22, 11, paper)
      );
    default:
      return null;
  }
}
