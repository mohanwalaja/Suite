import {
  G,
  P,
  C,
  E,
  R,
  L,
  rep,
  place,
  use,
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
// Lifedrawn vignettes for family and school greetings. Poses, props, environments and sightlines
// change with the activity instead of stamping a smiling family onto every special day.
function person(x, y, scale, who, sitting, gesture, flip = false) {
  const kid = who === 'child',
    man = who === 'father',
    teacher = who === 'teacher',
    skin = kid ? '#cd987b' : '#bb896c',
    cloth = man ? jade : teacher ? '#ba7b55' : kid ? blush : silk;
  const head =
    P(
      'M-16-16Q-10-36 7-29Q23-24 17-10l4 7-6 3q-2 11-15 11l-4 9-12-8 5-10Q-21-5-16-16Z',
      skin,
      brown,
      0.85,
    ) +
    P(
      man
        ? 'M-17-6Q-26-30-5-35Q20-41 21-21Q13-25 1-19L-5-8-9-14-12-7Z'
        : kid
          ? 'M-18-5Q-25-26-7-32Q3-40 16-31L24-30Q21-20 13-20Q1-21-3-12L-10-14-11-2Z'
          : 'M-18-5Q-28-28-7-35Q11-40 21-22Q3-17-1-11Q-7-9-9 1L-16 5Z',
      navy,
    ) +
    (!man && !kid
      ? G(C(-19, -8, 8, navy) + rep(5, (i) => use('jasmine', -24 + i * 2.7, -9 + (i % 2) * 3, 4)))
      : '') +
    P('M5-12q4-3 8-1m-1 15q-4 2-7 0', 'none', brown, 0.95) +
    C(11, -11, 1.1, navy) +
    (!man && !kid ? C(14, -17, 1.2, silk) + C(-7, 0, 2.4, gold) : '');
  const legs = sitting
    ? P(
        'M-18 64Q-24 77-12 80L17 82 16 107 26 108 32 78Q33 71 24 69L8 61Z',
        man || kid ? navy : cloth,
        brass,
        1.0,
      )
    : P('M-18 67l3 40 11 1 5-34 8 34 11-1-3-42Z', kid || man ? navy : cloth, brass, 0.9);
  const body =
    P('M-8 12Q-26 15-24 39L-21 69Q-4 76 19 69L14 28Q11 17-1 13Z', cloth, brass, 1.1) +
    (!man && !kid
      ? P('M-12 13Q-5 34 15 49L16 59Q-8 48-22 28Z', blush, gold, 0.9)
      : P('M-11 13l8 10 5-9m-4 9 2 27', 'none', paper, 0.95));
  const arm =
    gesture === 'up'
      ? 'M-10 30Q5 44 15 36l14-28'
      : gesture === 'give'
        ? 'M-9 31Q2 48 17 47l20-4'
        : gesture === 'down'
          ? 'M-10 33Q-1 56 19 65'
          : 'M-9 31Q-2 47 12 49l18-4';
  return G(
    legs + body + P(arm, 'none', brown, 6.5) + P(arm, 'none', skin, 5.5) + head,
    `translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`,
  );
}
export function story(key, arg, draw) {
  if (key !== 'story') return null;
  const [adult, act] = arg.split('-');
  if (!['mother', 'father', 'teacher'].includes(adult)) return null;
  const cell = (s, x, y, w, h = w) => place(draw(s), x, y, w, h);
  let bg = '',
    props = '',
    poses = '';
  const stool = (x, y) =>
    R(x, y, 51, 6, wood, gold, 1, 2) +
    L(x + 7, y + 6, x + 2, y + 42, wood, 3) +
    L(x + 44, y + 6, x + 48, y + 42, wood, 3);
  switch (act) {
    case 'board':
      bg = cell('chalkboard', 66, 16, 172, 143);
      poses =
        person(61, 94, 0.92, adult, false, 'up') +
        person(174, 155, 0.47, 'child', true, 'up', true);
      props = stool(147, 194) + L(86, 104, 119, 88, wood, 1.4);
      break;
    case 'book':
      bg = stool(42, 175) + stool(142, 178) + cell('book', 173, 51, 62);
      poses =
        person(82, 104, 0.92, adult, true, 'give') +
        person(167, 129, 0.63, 'child', true, 'down', true);
      props = cell('storybook', 91, 121, 71, 51);
      break;
    case 'garden':
      bg = cell('family-tree', 140, 4, 118) + cell('sprout', 12, 100, 90);
      poses =
        person(91, 103, 0.94, adult, true, 'down') +
        person(165, 141, 0.64, 'child', false, 'down', true);
      props = cell('sprout', 96, 149, 49) + P('M107 184h27l-5 21h-15Z', wood, brass, 0.8);
      break;
    case 'flowers':
      bg = cell('rose', 17, 23, 77) + cell('family-tree', 163, 14, 85);
      poses =
        person(76, 94, 1.02, adult, false, 'give') +
        person(172, 133, 0.69, 'child', false, 'give', true);
      props = cell('jasmine', 102, 109, 49, 60, -9);
      break;
    case 'swing':
      bg = cell('family-tree', 2, 4, 148);
      props = cell('swing', 121, 37, 114, 168);
      poses =
        person(89, 101, 0.9, adult, false, 'give') +
        person(172, 118, 0.53, 'child', true, 'up', true);
      break;
    case 'kite':
      bg = cell('horizon', 149, 50, 92);
      poses =
        person(84, 104, 0.9, adult, true, 'up') +
        person(163, 137, 0.65, 'child', false, 'up', true);
      props =
        P('M147 146Q152 98 185 83', 'none', brass, 1) +
        cell('kite', 146, 10, 83) +
        cell('spool', 119, 169, 40);
      break;
    case 'globe':
    case 'science':
      bg = R(28, 42, 98, 56, '#58746f', wood, 3, 2) + L(35, 86, 116, 86, cream, 0.8);
      poses =
        person(65, 94, 0.97, adult, false, 'give') +
        person(191, 130, 0.65, 'child', false, 'give', true);
      props =
        R(102, 169, 73, 5, wood, gold, 1) +
        L(111, 173, 108, 206, wood, 3) +
        L(166, 173, 169, 206, wood, 3) +
        cell(act === 'globe' ? 'globe' : 'microscope', 96, 93, 83, 86);
      break;
    case 'photo':
      bg =
        R(28, 27, 198, 198, paper, brass, 1.4, 2) +
        R(38, 37, 178, 153, '#b6c4b2', gold, 1) +
        cell('family-tree', 129, 38, 85);
      poses =
        person(98, 98, 0.83, adult, false, 'give') +
        person(161, 131, 0.52, 'child', false, 'give', true);
      props = use('rose', 62, 190, 27) + L(100, 207, 186, 207, brass, 0.8);
      break;
    default:
      throw new Error(`Unknown activity: ${arg}`);
  }
  return ground(127, 216, 105) + bg + poses + props;
}
