import type { CategoryId, DesignContent } from './types'

/**
 * Service facts transcribed from the live ASTRO SIVAM website on 2 Nov 2026.
 * Prices, inclusions and delivery terms change; the Services page and any poster
 * built from these presets must be checked against astrosivam.com before
 * publishing. Nothing in this file is estimated or invented.
 *
 * Source: https://astrosivam.com and its four service pages.
 */

export const SITE_INFO = {
  brand: 'ASTRO SIVAM',
  domain: 'astrosivam.com',
  url: 'https://astrosivam.com',
  tagline: 'Understand your life through Vedic astrology.',
  intro:
    'Personalised Birth Jathagam, Marriage Compatibility, Baby Naming and Subha Muhurtham reports, prepared by an India-based Vedic priest team and delivered as a PDF in English, Tamil or Hindi.',
  method: 'Sidereal zodiac · Chitra Paksha Lahiri Ayanamsa · Drik Panchanga',
  review: 'Every report is reviewed by the priest team every 6 hours and emailed only after approval.',
  delivery: 'Approved PDF report and tax invoice delivered by email; order history in the customer dashboard.',
  deliveryShort: 'PDF + tax invoice by email',
  reviewShort: 'Reviewed every 6 hours',
  support: '7 days of personal astrologer chat included after delivery.',
  languages: ['English', 'Tamil', 'Hindi'],
  payments: 'PayPal (Visa, Mastercard, Amex, Discover), credit/debit cards, Google Pay / UPI in India.',
  rating: { value: 5.0, count: 6, label: 'as published on astrosivam.com' },
  retrievedAt: '2 November 2026',
  priceNote:
    'Prices are transcribed from astrosivam.com on 2 November 2026 (US$ and INR). Confirm them on the live checkout before publishing a poster.',
  logoNote:
    'The official logo is not bundled with this project and is never redrawn. Use the asset from astrosivam.com or the file supplied by the brand owner, uploaded in Brand settings.',
} as const

export interface ServicePlan {
  id: string
  name: string
  usd: number
  inr: number
  note?: string
}

export interface ServiceDef {
  id: string
  categoryId: CategoryId
  name: string
  shortName: string
  page: string
  description: string
  priceLabel: string
  plans: ServicePlan[]
  includes: string[]
  details: string[]
  posterContent: DesignContent
}

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Choose a report',
    body: 'Compare the available services, then open the report that fits your question.',
  },
  {
    step: 2,
    title: 'Enter birth details',
    body: 'Add the required names, birth date, exact time and place in the secure form. Matching and Muhurtham need both people.',
  },
  {
    step: 3,
    title: 'Priest team prepares',
    body: 'The India-based Vedic priest team calculates the chart with Chitra Paksha Lahiri and reviews it before the PDF is created.',
  },
  {
    step: 4,
    title: 'Receive the PDF',
    body: 'Reports are checked every 6 hours. Once approved, the verified PDF and tax invoice are emailed, with 7 days of astrologer chat.',
  },
] as const

export const SERVICE_FAQ = [
  {
    q: 'When and how is the report delivered?',
    a: 'Reports are reviewed every 6 hours and delivered after approval. The official PDF report and tax invoice are emailed to the registered address by the India-based priest team. Checking the spam folder is advised.',
  },
  {
    q: 'What birth details are needed?',
    a: 'Name, date of birth, exact time of birth and birth place. Marriage Compatibility needs the details of both people. An accurate birth time and place improve the chart calculation; the form defaults to 12:00 PM when the time is unknown.',
  },
  {
    q: 'Which calculation system is used?',
    a: 'The sidereal zodiac with Chitra Paksha Lahiri Ayanamsa. Reports can be prepared in English, Tamil or Hindi.',
  },
  {
    q: 'Which payment methods are accepted?',
    a: 'PayPal (Visa, Mastercard, American Express, Discover and more), credit/debit cards, and Google Pay / UPI for India. Available options are shown at checkout.',
  },
  {
    q: 'Can a sample report be seen first?',
    a: 'Yes. Each service page has an “Open sample PDF” option built from fixed sample details (01 Jan 2000, 2:00 AM, Chennai). No customer data is used in a sample.',
  },
] as const

export const SERVICES: ServiceDef[] = [
  {
    id: 'birth-jathagam',
    categoryId: 'birth-jathagam',
    name: 'Birth Jathagam',
    shortName: 'Jathagam',
    page: 'https://astrosivam.com/birth-jathagam',
    description:
      'A personal horoscope reading of the chart, life seasons, strengths and planetary periods — the complete natal chart calculated from the exact moment and place of birth.',
    priceLabel: 'From US$5 · INR 470',
    plans: [
      { id: 'basic', name: 'Basic Jathagam', usd: 5, inr: 470 },
      { id: 'bhava', name: 'Bhava Jathagam', usd: 10, inr: 940 },
      { id: 'varga', name: 'Varga Jathagam', usd: 10, inr: 940 },
    ],
    includes: [
      '12 Vedic Bhavas and houses, with the Lagna',
      'Navagraha positions and degrees, including retrogradation',
      'Rasi and Navamsa (D-9) charts',
      'Vimshottari Mahadasha timeline to 120 years',
      'Sade Sati, Rahu-Ketu and Kala Sarpa status with remedies',
      '8 life aspects: health, wealth, career, education, marriage, family, travel, current period',
    ],
    details: [
      'Calculated with the sidereal zodiac and Chitra Paksha Lahiri Ayanamsa.',
      'Available in English, Tamil or Hindi.',
      'Priest team review, then email delivery with a tax invoice.',
    ],
    posterContent: {
      eyebrow: 'ASTRO SIVAM · BIRTH JATHAGAM',
      headline: 'Understand your life through Vedic astrology.',
      subheadline: 'Basic Jathagam · US$5 / INR 470',
      body: 'A personalised Vedic horoscope prepared from your birth details by our India-based priest team, delivered as a clear PDF.',
      points: ['Rasi & Navamsa charts', 'Vimshottari Dasa timeline', 'Sade Sati & dosha status'],
      cta: 'Order your Jathagam',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
  },
  {
    id: 'marriage-compatibility',
    categoryId: 'wedding-matching',
    name: 'Marriage Compatibility',
    shortName: 'Porutham',
    page: 'https://astrosivam.com/marriage-compatibility',
    description:
      'A clear comparison of two charts using the classical 10-Porutham system, with the priest team’s compatibility assessment.',
    priceLabel: 'US$5 · INR 470',
    plans: [{ id: 'match', name: '10-Porutham match report', usd: 5, inr: 470 }],
    includes: [
      'Dina, Gana and Mahendra Porutham',
      'Stree Dheerkha, Yoni, Rasi and Rasiyathipathi',
      'Vasiya, Rajju and Vedha checks',
      'Kuja / Sevvay Dosha analysis with balance',
      'Priest team compatibility verdict',
    ],
    details: [
      'Requires both partners’ names, dates, exact times and birth places.',
      'Rajju and Vedha are treated as the crucial checks.',
      'Report available in English, Tamil or Hindi.',
    ],
    posterContent: {
      eyebrow: 'ASTRO SIVAM · 10 PORUTHAM',
      headline: 'Two charts. One clear answer.',
      subheadline: 'Marriage compatibility · US$5 / INR 470',
      body: 'All ten classical Poruthams, Rajju and Vedha checks and a full Kuja Dosha analysis, reviewed by our priest team.',
      points: ['Dina, Gana & Mahendra', 'Rajju & Vedha checks', 'Kuja Dosha balance'],
      cta: 'Match our charts',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
  },
  {
    id: 'baby-naming',
    categoryId: 'baby-naming',
    name: 'Baby Naming',
    shortName: 'Namakaranam',
    page: 'https://astrosivam.com/baby-naming',
    description:
      'Meaningful Vedic name guidance based on the baby’s birth star, with auspicious syllables, curated names and a naming certificate.',
    priceLabel: 'US$5 · INR 470',
    plans: [{ id: 'certificate', name: 'Baby naming certificate', usd: 5, inr: 470 }],
    includes: [
      'Janma Nakshatra and pada syllables for all four padas',
      'Nakshatra lord, gana, yoni and rajju attributes',
      'Curated traditional and contemporary Vedic names with meanings',
      'Official ASTRO SIVAM naming certificate PDF',
    ],
    details: [
      'Requires the baby’s date, exact time, place and gender.',
      'The pada — and therefore the syllables — changes within a nakshatra, so exact time matters.',
      'Certificate available in English, Tamil or Hindi.',
    ],
    posterContent: {
      eyebrow: 'ASTRO SIVAM · NAMAKARANAM',
      headline: 'The first letter comes from the stars.',
      subheadline: 'Baby naming certificate · US$5 / INR 470',
      body: 'Janma Nakshatra and pada syllables for your baby, with curated Vedic names and a printable naming certificate.',
      points: ['Syllables for all 4 padas', 'Curated Vedic names', 'Official certificate PDF'],
      cta: 'Order the certificate',
      contact: '',
      website: 'astrosivam.com',
      footer: 'PDF by email · 7-day astrologer chat',
    },
  },
  {
    id: 'subha-muhurtham',
    categoryId: 'subha-muhurtham',
    name: 'Subha Muhurtham',
    shortName: 'Muhurtham',
    page: 'https://astrosivam.com/muhurtham',
    description:
      'A six-month calendar of suitable dates and times for the chosen ceremony, calculated for the function location.',
    priceLabel: 'US$10 · INR 940',
    plans: [{ id: 'calendar', name: 'Six-month muhurtham report', usd: 10, inr: 940 }],
    includes: [
      'Six-month auspicious date matrix (two months before, three after)',
      '18 Vedic ceremonies, from wedding to Annaprasanam',
      'Nalla Neram, Rahu Kalam and Yamaganda timings',
      'Tara Balam and Chandrashtama checks against both charts',
      'Local sunrise and timezone for the function location',
    ],
    details: [
      'Both partners’ details are recommended; if the bride’s block is empty the report states that only one chart was used.',
      'Birth place drives the Janma Nakshatra; function location drives the local timings.',
      'Report available in English, Tamil or Hindi.',
    ],
    posterContent: {
      eyebrow: 'ASTRO SIVAM · SUBHA MUHURTHAM',
      headline: 'Choose the hour the heavens agree with.',
      subheadline: 'Six-month date matrix · US$10 / INR 940',
      body: 'Auspicious dates for your ceremony, checked with Panchangam, Nalla Neram, Rahu Kalam and Tara Balam for your location.',
      points: ['6-month date matrix', 'Nalla Neram & Rahu Kalam', '18 ceremonies covered'],
      cta: 'Find my muhurtham',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Local timings · PDF by email',
    },
  },
  {
    id: 'astrology-services',
    categoryId: 'astrology-services',
    name: 'All Vedic reports',
    shortName: 'Reports',
    page: 'https://astrosivam.com',
    description:
      'The full service set: Birth Jathagam, Marriage Compatibility, Baby Naming and Subha Muhurtham, from one priest team.',
    priceLabel: 'Reports from US$5 · INR 470',
    plans: [
      { id: 'basic-jathagam', name: 'Basic Jathagam', usd: 5, inr: 470 },
      { id: 'match', name: 'Marriage Compatibility', usd: 5, inr: 470 },
      { id: 'muhurtham', name: 'Subha Muhurtham', usd: 10, inr: 940 },
    ],
    includes: [
      'Every report prepared by the India-based Vedic priest team',
      'Reviewed every 6 hours and emailed after approval',
      'Tax invoice included with every order',
      '7 days of personal astrologer chat after delivery',
    ],
    details: [
      'Reports available in English, Tamil or Hindi.',
      'Payments: PayPal, cards, and Google Pay / UPI in India.',
      'Sample PDFs are available on each service page before ordering.',
    ],
    posterContent: {
      eyebrow: 'ASTRO SIVAM · VEDIC REPORTS',
      headline: 'Vedic guidance for modern decisions.',
      subheadline: 'Reports from US$5 · INR 470',
      body: 'Personalised Birth Jathagam, marriage matching, baby naming and Subha Muhurtham reports, prepared by our India-based priest team.',
      points: ['Birth Jathagam', '10 Porutham matching', 'Subha Muhurtham dates'],
      cta: 'Order a report',
      contact: '',
      website: 'astrosivam.com',
      footer: 'Delivered by email · 7-day astrologer chat',
    },
  },
]

export const SERVICE_BY_ID: Record<string, ServiceDef> = Object.fromEntries(SERVICES.map((s) => [s.id, s]))

export function servicesForCategory(categoryId: CategoryId): ServiceDef[] {
  return SERVICES.filter((s) => s.categoryId === categoryId)
}

export function priceSummary(service: ServiceDef): string {
  if (service.plans.length === 1) return `US$${service.plans[0].usd} · INR ${service.plans[0].inr}`
  return `US$${service.plans[0].usd}–${service.plans[service.plans.length - 1].usd}`
}
