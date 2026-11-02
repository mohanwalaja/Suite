import type { CategoryGroup, CategoryId, CompositionId, DesignContent, FormatId } from './types'

export interface CategoryDef {
  id: CategoryId
  group: CategoryGroup
  name: string
  kicker: string
  description: string
  /** Icon key resolved by the UI icon component. */
  icon: string
  defaultFormat: FormatId
  palettes: string[]
  motifs: string[]
  compositions: CompositionId[]
  defaultContent: DesignContent
  /** Neutral, respectful prompt text for an optional external image provider. */
  artDirection: string
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'birth-jathagam',
    group: 'astrology',
    name: 'Birth Jathagam',
    kicker: 'Vedic birth chart',
    description: 'Complete jathagam reading, rasi and navamsa charts, dasa timelines.',
    icon: 'chart',
    defaultFormat: 'ig-portrait',
    palettes: ['midnight-gold', 'cosmic-indigo', 'ivory-noir'],
    motifs: ['zodiac-wheel', 'navagraha', 'celestial-orb'],
    compositions: ['cosmic-astrology', 'editorial-type', 'asymmetric-luxury', 'premium-infographic'],
    defaultContent: {
      eyebrow: 'ASTRO SIVAM · BIRTH JATHAGAM',
      headline: 'Understand your life through Vedic astrology.',
      subheadline: 'Basic Jathagam · US$5 / INR 470',
      body:
        'A personalised Vedic horoscope prepared from your birth details by our India-based priest team and delivered as a clear PDF.',
      points: ['Rasi & Navamsa charts', 'Vimshottari Dasa timeline', 'Sade Sati & dosha status'],
      cta: 'Order your Jathagam',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
    artDirection:
      'editorial astrological illustration, fine gold line work, zodiac geometry, deep indigo night sky, no photographic faces, elegant negative space',
  },
  {
    id: 'wedding-matching',
    group: 'astrology',
    name: 'Wedding Matching',
    kicker: 'Thirumana porutham',
    description: 'Ten-match compatibility readings presented with warmth and clarity.',
    icon: 'rings',
    defaultFormat: 'ig-portrait',
    palettes: ['sky-ceremony', 'temple-maroon', 'ivory-noir'],
    motifs: ['lotus-crest', 'mandala-sun', 'orbit-network'],
    compositions: ['split-panel', 'decorative-frame', 'asymmetric-luxury', 'editorial-type'],
    defaultContent: {
      eyebrow: 'ASTRO SIVAM · 10 PORUTHAM',
      headline: 'Two charts. One clear answer.',
      subheadline: 'Marriage compatibility · US$5 / INR 470',
      body:
        'All ten classical Poruthams, Rajju and Vedha checks and a full Kuja Dosha analysis, reviewed by our priest team.',
      points: ['Dina, Gana & Mahendra', 'Rajju & Vedha checks', 'Kuja Dosha balance'],
      cta: 'Match our charts',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
    artDirection:
      'ceremonial wedding illustration, minimal lotus and kalasa motifs, soft ivory and dusty blue, fine engraving lines, quiet luxury',
  },
  {
    id: 'baby-naming',
    group: 'astrology',
    name: 'Baby Naming Letters',
    kicker: 'Namakaranam',
    description: 'Nakshatra-based naming letters and a blessing for the new arrival.',
    icon: 'baby',
    defaultFormat: 'square',
    palettes: ['lotus-rose', 'saffron-dawn', 'sky-ceremony'],
    motifs: ['peacock-feather', 'lotus-crest', 'mandala-lotus'],
    compositions: ['minimal-luxury', 'circular-mandala', 'illustrated-story', 'decorative-frame'],
    defaultContent: {
      eyebrow: 'ASTRO SIVAM · NAMAKARANAM',
      headline: 'The first letter comes from the stars.',
      subheadline: 'Baby naming certificate · US$5 / INR 470',
      body:
        'Janma Nakshatra and pada syllables for your baby, with curated Vedic names and a printable naming certificate.',
      points: ['Syllables for all 4 padas', 'Curated Vedic names', 'Official certificate PDF'],
      cta: 'Order the certificate',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
    artDirection:
      'gentle baby blessing illustration, soft lotus and feather line art, warm pastel paper texture, delicate English lettering space, no faces',
  },
  {
    id: 'subha-muhurtham',
    group: 'astrology',
    name: 'Subha Muhurtham',
    kicker: 'Auspicious timing',
    description: 'Auspicious dates and hours for weddings, house warming and new ventures.',
    icon: 'sun',
    defaultFormat: 'ig-portrait',
    palettes: ['saffron-dawn', 'temple-maroon', 'ivory-noir'],
    motifs: ['mandala-sun', 'kolam-grid', 'arc-moon'],
    compositions: ['premium-infographic', 'decorative-frame', 'editorial-type', 'bold-campaign'],
    defaultContent: {
      eyebrow: 'ASTRO SIVAM · SUBHA MUHURTHAM',
      headline: 'Choose the hour the heavens agree with.',
      subheadline: 'Six-month date matrix · US$10 / INR 940',
      body:
        'Auspicious dates for your ceremony, checked with Panchangam, Nalla Neram, Rahu Kalam and Tara Balam for your location.',
      points: ['6-month date matrix', 'Nalla Neram & Rahu Kalam', '18 ceremonies covered'],
      cta: 'Find my muhurtham',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Local timings · PDF by email',
    },
    artDirection:
      'temple calendar illustration, sun mandala, engraved almanac lines, warm ivory and saffron, precise typographic grid',
  },
  {
    id: 'navagraha',
    group: 'astrology',
    name: 'Navagraha',
    kicker: 'Nine planetary energies',
    description: 'Educational and ritual content on the nine planetary influences.',
    icon: 'planets',
    defaultFormat: 'ig-portrait',
    palettes: ['cosmic-indigo', 'deep-ocean', 'midnight-gold'],
    motifs: ['navagraha', 'celestial-orb', 'orbit-network'],
    compositions: ['premium-infographic', 'cosmic-astrology', 'swiss-grid', 'asymmetric-luxury'],
    defaultContent: {
      eyebrow: 'NAVAGRAHA · NINE PLANETS',
      headline: 'Nine planets. One chart. Your story.',
      subheadline: 'Sun · Moon · Mars · Mercury · Jupiter · Venus · Saturn · Rahu · Ketu',
      body:
        'What each planet governs in Vedic astrology, how its period is read in a chart, and the traditional remedies associated with it.',
      points: ['Planet-by-planet guide', 'Dasa effects explained', 'Traditional remedy list'],
      cta: 'Read the guide',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Vedic guidance in plain English',
    },
    artDirection:
      'astronomical illustration of nine planets in engraved orbit rings, deep indigo and brass, precise scientific vector line work',
  },
  {
    id: 'astrology-services',
    group: 'astrology',
    name: 'Astrology Services',
    kicker: 'Brand & offer',
    description: 'Service advertisements, offer campaigns and brand announcements.',
    icon: 'sparkle',
    defaultFormat: 'ig-portrait',
    palettes: ['midnight-gold', 'monochrome-studio', 'royal-plum'],
    motifs: ['zodiac-wheel', 'celestial-orb', 'mandala-lotus'],
    compositions: ['bold-campaign', 'asymmetric-luxury', 'swiss-grid', 'hero-illustration'],
    defaultContent: {
      eyebrow: 'ASTRO SIVAM · VEDIC REPORTS',
      headline: 'Vedic guidance for modern decisions.',
      subheadline: 'Reports from US$5 · INR 470',
      body:
        'Personalised Birth Jathagam, marriage matching, baby naming and Subha Muhurtham reports, prepared by our India-based priest team.',
      points: ['Birth Jathagam', '10 Porutham matching', 'Subha Muhurtham dates'],
      cta: 'Order a report',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Delivered by email · 7-day astrologer chat',
    },
    artDirection:
      'premium service advertisement illustration, abstract celestial chart, brass and charcoal, restrained luxury, wide empty space for headline',
  },
  {
    id: 'murugan',
    group: 'devotional',
    name: 'Lord Murugan',
    kicker: 'Vel & peacock',
    description: 'Thaipusam, Kanda Sashti and temple festival greetings.',
    icon: 'vel',
    defaultFormat: 'ig-portrait',
    palettes: ['peacock-teal', 'temple-maroon', 'fire-ash'],
    motifs: ['vel-peacock', 'temple-gopuram', 'peacock-feather'],
    compositions: ['cinematic-devotional', 'decorative-frame', 'circular-mandala', 'hero-illustration'],
    defaultContent: {
      eyebrow: 'THAIPUSAM GREETINGS',
      headline: 'Vel Vel Murugan',
      subheadline: 'A prayer for courage on every path',
      body:
        'May the spear of Murugan cut away doubt and carry you through. Wishing every family a blessed Thaipusam.',
      points: ['Temple timings', 'Abhishekam at 6:00 am', 'Prasadam after 11:00 am'],
      cta: 'With blessings from Astrosivam',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Astrosivam · Vedic astrology',
    },
    artDirection:
      'reverent South Indian devotional illustration, Murugan vel and peacock feather, engraved gold line art on deep teal, temple silhouette, no photoreal faces',
  },
  {
    id: 'shiva',
    group: 'devotional',
    name: 'Lord Shiva',
    kicker: 'Stillness & fire',
    description: 'Maha Shivaratri, Pradosham and evening temple notices.',
    icon: 'trident',
    defaultFormat: 'ig-portrait',
    palettes: ['deep-ocean', 'fire-ash', 'midnight-gold'],
    motifs: ['trishul-crescent', 'arch-moon', 'celestial-orb'],
    compositions: ['cinematic-devotional', 'minimal-luxury', 'hero-illustration', 'decorative-frame'],
    defaultContent: {
      eyebrow: 'MAHA SHIVARATRI',
      headline: 'In stillness, everything begins.',
      subheadline: 'A night of abhishekam and silence',
      body:
        'Join the all-night worship: four abhishekams, Rudram chanting and the closing deeparadhanai at dawn.',
      points: ['First kala 6:30 pm', 'Rudram chanting 9:00 pm', 'Deeparadhanai 5:30 am'],
      cta: 'All are welcome',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Astrosivam · Vedic astrology',
    },
    artDirection:
      'reverent Shaiyite devotional illustration, trishul and crescent moon, ash grey and ember orange, engraved line work, meditative negative space',
  },
  {
    id: 'ganesha',
    group: 'devotional',
    name: 'Lord Ganesha',
    kicker: 'Beginnings',
    description: 'Vinayaka Chaturthi and new-beginning blessings.',
    icon: 'modak',
    defaultFormat: 'square',
    palettes: ['lotus-rose', 'saffron-dawn', 'temple-maroon'],
    motifs: ['lotus-crest', 'mandala-lotus', 'kolam-grid'],
    compositions: ['circular-mandala', 'decorative-frame', 'minimal-luxury', 'illustrated-story'],
    defaultContent: {
      eyebrow: 'VINAYAKA CHATURTHI',
      headline: 'Begin with grace.',
      subheadline: 'A blessing for every new step',
      body:
        'May every beginning you make this year be free of obstacles. Warm wishes from the Astrosivam family.',
      points: ['Morning pooja 6:00 am', 'Modak prasadam', 'Evening bhajans'],
      cta: 'Wishing you a blessed festival',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Astrosivam · Vedic astrology',
    },
    artDirection:
      'reverent Ganesha festival illustration, lotus and modak motifs, warm rose and brass, fine symmetrical line art, luminous but restrained',
  },
  {
    id: 'durga',
    group: 'devotional',
    name: 'Goddess Durga',
    kicker: 'Shakti',
    description: 'Navaratri, Vijayadasami and Shakti blessings.',
    icon: 'lion',
    defaultFormat: 'ig-portrait',
    palettes: ['royal-plum', 'fire-ash', 'temple-maroon'],
    motifs: ['durga-shakti', 'mandala-sun', 'trishul-crescent'],
    compositions: ['cinematic-devotional', 'diagonal-geometric', 'bold-campaign', 'decorative-frame'],
    defaultContent: {
      eyebrow: 'NAVARATRI · NINE NIGHTS',
      headline: 'The fire you carry is yours.',
      subheadline: 'Nine nights of Shakti',
      body:
        'For the courage that protects, the strength that endures and the grace that returns. Navaratri wishes to your family.',
      points: ['Golu display from 5:00 pm', 'Saraswati pooja on day nine', 'Vijayadasami blessings'],
      cta: 'Wishing you shakti',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Astrosivam · Vedic astrology',
    },
    artDirection:
      'reverent Shakti devotional illustration, trishul chakra and lion silhouette motifs, deep plum and antique gold, strong symmetrical geometry',
  },
  {
    id: 'festival',
    group: 'devotional',
    name: 'Festival Greetings',
    kicker: 'Seasonal',
    description: 'Deepavali, Pongal, Karthigai and New Year greetings.',
    icon: 'diya',
    defaultFormat: 'ig-portrait',
    palettes: ['saffron-dawn', 'temple-maroon', 'emerald-heritage'],
    motifs: ['deepam-lamp', 'kolam-grid', 'mandala-sun'],
    compositions: ['layered-collage', 'illustrated-story', 'hero-illustration', 'circular-mandala'],
    defaultContent: {
      eyebrow: 'KARTHIGAI DEEPAM',
      headline: 'A festival of light.',
      subheadline: 'Warm wishes from Astrosivam',
      body:
        'May this season of lamps bring clarity to your home and courage to your decisions. Happy Karthigai Deepam.',
      points: ['Lamps lit at 6:00 pm', 'Special abhishekam', 'Prasadam for all'],
      cta: 'Happy Karthigai Deepam',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Astrosivam · Vedic astrology',
    },
    artDirection:
      'festival illustration of oil lamps, kolam floor pattern, warm marigold and ember tones, layered paper texture, elegant hand-drawn line work',
  },
  {
    id: 'temple-event',
    group: 'devotional',
    name: 'Temple Events',
    kicker: 'Announcements',
    description: 'Temple festivals, annadanam, cultural programmes and notices.',
    icon: 'temple',
    defaultFormat: 'ig-portrait',
    palettes: ['emerald-heritage', 'temple-maroon', 'saffron-dawn'],
    motifs: ['temple-gopuram', 'kolam-grid', 'deepam-lamp'],
    compositions: ['swiss-grid', 'premium-infographic', 'split-panel', 'editorial-type'],
    defaultContent: {
      eyebrow: 'SRI KANDASWAMY TEMPLE',
      headline: 'An evening of Devaram chants.',
      subheadline: 'Sunday · 6:00 pm · Main mandapam',
      body:
        'The temple choir presents traditional Devaram and Thiruppugazh. Annadanam follows the programme. All are welcome.',
      points: ['Doors open 5:30 pm', 'Programme 6:00 – 8:00 pm', 'Annadanam after'],
      cta: 'Join us',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Sri Kandaswamy Temple · Chennai',
    },
    artDirection:
      'temple announcement illustration, gopuram silhouette, kolam grid, deep green and brass, precise typographic layout, respectful and calm',
  },
]

export const CATEGORY_BY_ID: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)

export const CATEGORY_GROUPS: Array<{ id: CategoryGroup; label: string; blurb: string }> = [
  {
    id: 'astrology',
    label: 'Astrology services',
    blurb: 'Readings, matching, muhurtham and service campaigns.',
  },
  {
    id: 'devotional',
    label: 'Devotional & cultural',
    blurb: 'Deity blessings, festival greetings and temple notices.',
  },
]

export function getCategory(id: string): CategoryDef {
  return CATEGORY_BY_ID[id] ?? CATEGORIES[0]
}
