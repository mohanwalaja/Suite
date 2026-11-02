import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, CATEGORY_GROUPS, type CategoryDef } from '../engine/categories'
import { COMPOSITIONS } from '../engine/compositions'
import { MOTIFS } from '../engine/artwork'
import { PALETTES } from '../engine/palettes'
import { FONT_FAMILIES } from '../engine/fonts'
import { createDesign } from '../engine/presets'
import type { CategoryId } from '../engine/types'
import { useStudio } from '../state/studio'
import { FORMAT_BY_ID, formatLabel } from '../engine/formats'
import { CategoryIcon } from '../components/CategoryIcon'
import { NewPosterModal } from '../components/NewPosterModal'
import { PosterThumb } from '../components/PosterCanvas'
import { cx, Stat } from '../components/ui'
import { IconArrowRight, IconPlus, IconSparkles } from '../components/icons'
import { providerStatus } from '../lib/provider'

function CategoryCard({ category, onPick }: { category: CategoryDef; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#c99a4e]/35 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between">
        <span className="rounded-xl border border-white/10 bg-black/30 p-2 text-[#d9ae6b]/80">
          <CategoryIcon name={category.icon} size={19} />
        </span>
        <IconArrowRight size={15} className="mt-1 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
      </div>
      <div>
        <p className="text-[13.5px] font-medium text-white/90">{category.name}</p>
        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-white/35">{category.description}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1">
        {category.palettes.slice(0, 3).map((id) => {
          const palette = PALETTES.find((p) => p.id === id)
          if (!palette) return null
          return (
            <span
              key={id}
              className="h-1.5 w-5 rounded-full"
              style={{ background: palette.accent }}
              title={palette.name}
            />
          )
        })}
        <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/25">{formatLabel(FORMAT_BY_ID[category.defaultFormat].width, FORMAT_BY_ID[category.defaultFormat].height)}</span>
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { projects, brand, createProject } = useStudio()
  const [modal, setModal] = useState<{ open: boolean; category?: CategoryId }>({ open: false })

  const featured = useMemo(
    () =>
      createDesign({
        categoryId: 'murugan',
        formatId: 'ig-portrait',
        compositionId: 'hero-illustration',
        seed: 812,
      }),
    [],
  )
  const secondary = useMemo(
    () =>
      createDesign({
        categoryId: 'birth-jathagam',
        formatId: 'square',
        compositionId: 'cosmic-astrology',
        seed: 431,
      }),
    [],
  )
  const provider = providerStatus()
  const recent = projects.slice(0, 4)

  const quickStart = (categoryId: CategoryId) => {
    const design = createProject({ categoryId })
    navigate(`/studio/${design.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 pb-16 pt-7 sm:px-8 lg:pt-10">
      <section className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-[#c99a4e]/30 bg-[#c99a4e]/10 text-[#e5c48d]">
              <IconSparkles size={11} /> Design engine v1
            </span>
            <span className="chip">{COMPOSITIONS.length} composition systems</span>
            <span className="chip">English-only content</span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.03] tracking-[-0.01em] text-white">
            Posters that look
            <br />
            <span className="text-[#d9ae6b]">art-directed</span>, not generated.
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/50">
            A real composition engine for Astro Sivam — fifteen layout systems, original vector artwork, editable
            typography and motion, rendered to print-quality PNG, JPEG and video in the browser.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <button type="button" className="btn-primary h-11 px-5" onClick={() => setModal({ open: true })}>
              <IconPlus size={16} />
              Create a poster
            </button>
            <button
              type="button"
              className="btn-ghost h-11 px-4"
              onClick={() => {
                if (recent[0]) navigate(`/studio/${recent[0].id}`)
                else navigate('/studio')
              }}
            >
              {recent[0] ? 'Continue last project' : 'Open the studio'}
              <IconArrowRight size={15} />
            </button>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/[0.008] pt-5">
            {[
              ['15', 'layout systems'],
              ['21', 'original motifs'],
              ['14', 'curated palettes'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/30">{label}</dt>
                <dd className="font-display text-2xl text-white/85">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative mx-auto flex max-w-[560px] items-end justify-center gap-4">
            <div className="w-[62%] -rotate-1">
              <PosterThumb design={featured} width={520} className="aspect-[4/5] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10" />
            </div>
            <div className="w-[42%] translate-y-6 rotate-1">
              <PosterThumb design={secondary} width={320} className="aspect-square shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10" />
            </div>
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_60%_40%,rgba(201,154,78,0.16),transparent_70%)]" />
          </div>
          <p className="mt-8 text-center text-[10.5px] uppercase tracking-[0.22em] text-white/25">
            Rendered live by the engine · not a mockup image
          </p>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-white/90">Start with a category</h2>
            <p className="mt-1 text-[12.5px] text-white/40">
              Each category carries its own artwork direction, palettes, copy preset and composition shortlist.
            </p>
          </div>
          <Link to="/projects" className="hidden text-[12px] text-white/45 hover:text-white sm:block">
            All projects →
          </Link>
        </div>
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.id} className="mt-5">
            <div className="mb-2.5 flex items-center gap-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{group.label}</h3>
              <span className="h-px flex-1 bg-white/[0.008]" />
              <span className="text-[10.5px] text-white/25">{group.blurb}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CATEGORIES.filter((c) => c.group === group.id).map((category) => (
                <CategoryCard key={category.id} category={category} onPick={() => quickStart(category.id)} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-white/90">Recent projects</h2>
            <Link to="/projects" className="text-[12px] text-white/40 hover:text-white">
              View library →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="panel flex flex-col items-start gap-3 px-5 py-7">
              <p className="text-[13px] text-white/70">No projects yet.</p>
              <p className="max-w-sm text-[12px] leading-relaxed text-white/35">
                Posters you create are stored in this browser, so you can come back and keep editing without an account.
              </p>
              <button type="button" className="btn-ghost mt-1 text-[12px]" onClick={() => setModal({ open: true })}>
                <IconPlus size={14} /> New poster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recent.map((project) => (
                <Link
                  key={project.id}
                  to={`/studio/${project.id}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-1.5 transition hover:border-white/25"
                >
                  <PosterThumb design={project.design} width={220} className="aspect-[4/5] w-full" />
                  <p className="mt-1.5 truncate px-0.5 text-[11.5px] text-white/70 group-hover:text-white">{project.name}</p>
                  <p className="truncate px-0.5 pb-0.5 text-[10px] text-white/25">
                    {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                    {project.design.compositionId}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-white/85">Engine status</h3>
              <span className={cx('chip', provider.configured ? 'border-emerald-400/25 text-emerald-200' : '')}>
                <span className={cx('h-1.5 w-1.5 rounded-full', provider.configured ? 'bg-emerald-400' : 'bg-white/30')} />
                {provider.label}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-[11.5px] text-white/45">
              <li className="flex justify-between gap-3">
                <span>Artwork</span>
                <span className="text-white/70">{MOTIFS.length} vector motifs · no AI required</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Fonts</span>
                <span className="text-white/70">{FONT_FAMILIES.length} bundled families</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Brand logo</span>
                <span className="text-white/70">{brand.logoDataUrl ? 'Uploaded' : 'Not uploaded'}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Compositions</span>
                <span className="text-white/70">{COMPOSITIONS.length} registered</span>
              </li>
            </ul>
            <Link to="/docs" className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-[#d9ae6b]/80 hover:text-[#d9ae6b]">
              Read the studio guide <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Formats" value="9" hint="Includes 3 Instagram sizes" />
            <Stat label="Exports" value="PNG · JPEG" hint="Video via browser recorder" />
          </div>
          <div className="panel p-4">
            <h3 className="text-[13px] font-medium text-white/85">Logo & brand</h3>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/35">
              {brand.logoDataUrl
                ? 'Your uploaded logo is applied to every poster through the brand layer.'
                : 'No logo uploaded yet. The studio never invents an Astro Sivam logo — upload the official file in Brand settings.'}
            </p>
            <Link to="/brand" className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] text-white/55 hover:text-white">
              Brand settings <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <NewPosterModal
        open={modal.open}
        initialCategory={modal.category}
        onClose={() => setModal({ open: false })}
      />
    </div>
  )
}
