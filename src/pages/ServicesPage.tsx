import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HOW_IT_WORKS, SERVICE_FAQ, SERVICES, SITE_INFO } from '../engine/services'
import { useStudio } from '../state/studio'
import { IconArrowRight, IconCheck, IconInfo, IconPlus, IconShield } from '../components/icons'
import { Disclosure, cx } from '../components/ui'

const FACT_ROWS = [
  ['Calculation', SITE_INFO.method],
  ['Prepared by', 'India-based Vedic priest and astrologer team'],
  ['Review', SITE_INFO.review],
  ['Delivery', SITE_INFO.delivery],
  ['After delivery', SITE_INFO.support],
  ['Report languages', SITE_INFO.languages.join(' · ')],
  ['Payments', SITE_INFO.payments],
] as const

export default function ServicesPage() {
  const { createProject, toast } = useStudio()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const buildPoster = (serviceId: string) => {
    const service = SERVICES.find((s) => s.id === serviceId)
    if (!service) return
    const design = createProject({
      categoryId: service.categoryId,
      content: service.posterContent,
    })
    toast(`Poster created from the ${service.name} service brief.`, 'success')
    navigate(`/studio/${design.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#d9ae6b]/70">Service reference · transcribed {SITE_INFO.retrievedAt}</p>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] text-white">What Astro Sivam offers</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/45">{SITE_INFO.intro}</p>
        </div>
        <a href={SITE_INFO.url} target="_blank" rel="noreferrer noopener" className="btn-ghost h-10">
          astrosivam.com <IconArrowRight size={14} />
        </a>
      </div>

      <div className="mt-5 flex gap-2.5 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-[11.5px] leading-relaxed text-amber-100/75">
        <IconInfo size={15} className="mt-0.5 shrink-0" />
        <p>
          {SITE_INFO.priceNote} This page is a reference inside the studio, not a checkout. Poster prices are plain text on the
          artwork — the live checkout on astrosivam.com is the only source of truth.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {SERVICES.map((service) => (
          <article key={service.id} className="panel overflow-hidden">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl text-white/95">{service.name}</h2>
                    <span className="chip border-[#c99a4e]/30 bg-[#c99a4e]/10 text-[#e5c48d]">{service.priceLabel}</span>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-white/45">{service.description}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-ghost h-9 text-[12px]" onClick={() => buildPoster(service.id)}>
                    <IconPlus size={14} /> Create poster
                  </button>
                  <a href={service.page} target="_blank" rel="noreferrer noopener" className="btn-quiet h-9 px-2 text-[11.5px]">
                    Service page ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-4 py-4 sm:px-5 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="field-label">Plans &amp; prices</p>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/30">
                    <span>Plan</span>
                    <span>USD</span>
                    <span>INR</span>
                  </div>
                  {service.plans.map((plan) => (
                    <div key={plan.id} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/6 px-3 py-2 text-[12px] last:border-0">
                      <span className="text-white/75">{plan.name}</span>
                      <span className="tabular-nums text-white/80">US${plan.usd}</span>
                      <span className="tabular-nums text-white/45">₹{plan.inr}</span>
                    </div>
                  ))}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-[11.5px] leading-relaxed text-white/40">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="field-label">What the report includes</p>
                <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-white/55">
                      <IconCheck size={13} className="mt-0.5 shrink-0 text-[#d9ae6b]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl text-white/90">How it works</h2>
        <p className="mt-1 text-[12.5px] text-white/40">The process as published on astrosivam.com.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="panel p-4">
              <span className="font-display text-2xl text-[#d9ae6b]/70">{String(step.step).padStart(2, '0')}</span>
              <p className="mt-1 text-[12.5px] font-medium text-white/85">{step.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="panel p-4">
          <h2 className="text-[13px] font-medium text-white/85">Verified service facts</h2>
          <dl className="mt-2">
            {FACT_ROWS.map(([term, value]) => (
              <div key={term} className="grid gap-1 border-b border-white/6 py-2.5 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/30">{term}</dt>
                <dd className="text-[11.5px] leading-relaxed text-white/55">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[10.5px] text-white/30">
            Rating on the site: {SITE_INFO.rating.value.toFixed(1)} / 5 from {SITE_INFO.rating.count} reviews ({SITE_INFO.rating.label}).
          </p>
        </div>

        <div className="space-y-3">
          <div className="panel p-4">
            <div className="flex items-center gap-2">
              <IconShield size={15} className="text-[#d9ae6b]/80" />
              <h2 className="text-[13px] font-medium text-white/85">Logo policy</h2>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">{SITE_INFO.logoNote}</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">
              No stock or generated logo is used anywhere in this studio. Until the official file is uploaded, posters use the
              Astro Sivam wordmark set in the chosen display face.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <a href={SITE_INFO.url} target="_blank" rel="noreferrer noopener" className="btn-quiet h-8 px-2 text-[11px]">
                Get the official logo ↗
              </a>
              <a href="/brand" className="btn-ghost h-8 px-2.5 text-[11px]">
                Upload in Brand
              </a>
            </div>
          </div>
          <div className="panel p-4">
            <h2 className="text-[13px] font-medium text-white/85">Not implemented</h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/40">
              This studio designs and exports artwork. It does not take orders, calculate charts, process payments or publish to
              Facebook or Instagram. Those live on astrosivam.com and require their own APIs.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-white/90">Questions from the site</h2>
        <div className="mt-3 space-y-2">
          {SERVICE_FAQ.map((item, index) => {
            const open = openFaq === index
            return (
              <div key={item.q} className={cx('rounded-xl border transition', open ? 'border-white/20 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]')}>
                <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[12.5px] font-medium text-white/80" onClick={() => setOpenFaq(open ? null : index)} aria-expanded={open}>
                  {item.q}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cx('shrink-0 transition', open && 'rotate-180')}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {open ? <p className="border-t border-white/8 px-4 py-3 text-[12px] leading-relaxed text-white/45">{item.a}</p> : null}
              </div>
            )
          })}
        </div>
        <Disclosure summary="How this page was produced" defaultOpen={false}>
          <p className="text-[11.5px] leading-relaxed text-white/40">
            Service names, descriptions, inclusions, price pairs (US$ / ₹), the four-step ordering process and the FAQ answers
            were read from astrosivam.com, /birth-jathagam, /marriage-compatibility, /baby-naming and /muhurtham on{' '}
            {SITE_INFO.retrievedAt}. Wording has been condensed for the interface; no price or inclusion was added.
          </p>
        </Disclosure>
      </section>
    </div>
  )
}
