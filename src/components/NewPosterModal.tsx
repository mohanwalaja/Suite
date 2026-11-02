import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, getCategory } from '../engine/categories'
import { FORMATS } from '../engine/formats'
import { aspectClass } from '../engine/formats'
import { COMPOSITIONS } from '../engine/compositions'
import { createDesign } from '../engine/presets'
import type { CategoryId, CompositionId, FormatId } from '../engine/types'
import { useStudio } from '../state/studio'
import { cx, Modal, Segmented } from './ui'
import { PosterThumb } from './PosterCanvas'
import { IconArrowRight, IconSparkles } from './icons'

export function NewPosterModal({ open, onClose, initialCategory }: { open: boolean; onClose: () => void; initialCategory?: CategoryId }) {
  const navigate = useNavigate()
  const { createProject, brand } = useStudio()
  const [categoryId, setCategoryId] = useState<CategoryId>(initialCategory ?? 'birth-jathagam')
  const [formatId, setFormatId] = useState<FormatId>(getCategory(initialCategory ?? 'birth-jathagam').defaultFormat)
  const [compositionId, setCompositionId] = useState<CompositionId | 'auto'>('auto')
  const [group, setGroup] = useState<'astrology' | 'devotional'>(
    getCategory(initialCategory ?? 'birth-jathagam').group === 'devotional' ? 'devotional' : 'astrology',
  )

  const category = getCategory(categoryId)
  const allowedFormats = FORMATS
  const defaultFormat = FORMATS.find((f_) => f_.id === category.defaultFormat) ?? FORMATS[0]
  const categoryAspect = aspectClass(defaultFormat.width, defaultFormat.height)

  const compatible = useMemo(
    () => COMPOSITIONS.filter((c) => c.meta.bestFor.includes(categoryId) || c.meta.formats.includes(categoryAspect)),
    [categoryId, categoryAspect],
  )

  const previews = useMemo(() => {
    void formatId
    const ids: Array<CompositionId | 'auto'> = ['auto', ...compatible.map((c) => c.meta.id)]
    return ids.map((id) => ({
      id,
      design: createDesign({
        categoryId,
        formatId,
        seed: 31,
        compositionId: id === 'auto' ? undefined : id,
      }),
    }))
  }, [categoryId, formatId, compatible])

  const pickCategory = (id: CategoryId) => {
    setCategoryId(id)
    const next = getCategory(id)
    setFormatId(next.defaultFormat)
    setCompositionId('auto')
  }

  const create = () => {
    const design = createProject({
      categoryId,
      formatId,
      compositionId: compositionId === 'auto' ? undefined : compositionId,
    })
    onClose()
    navigate(`/studio/${design.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="New poster"
      description="Pick a category and format. The engine chooses a composition that fits the content, then you can refine every layer."
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-[11px] text-white/35 sm:block">
            {compositionId === 'auto' ? 'Auto composition · no repeated family for your last two designs' : `Locked to ${COMPOSITIONS.find((c) => c.meta.id === compositionId)?.meta.name}`}
          </p>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1 sm:flex-none" onClick={create}>
              Create poster
              <IconArrowRight size={15} />
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="field-label mb-0">1 · Category</p>
            <Segmented
              size="sm"
              full={false}
              value={group}
              onChange={(g) => {
                setGroup(g)
                const first = CATEGORIES.find((c) => c.group === g)
                if (first) pickCategory(first.id)
              }}
              options={[
                { value: 'astrology' as const, label: 'Astrology' },
                { value: 'devotional' as const, label: 'Devotional' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.filter((c) => c.group === group).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c.id)}
                className={cx(
                  'flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition',
                  categoryId === c.id
                    ? 'border-[#c99a4e]/60 bg-[#c99a4e]/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]',
                )}
                aria-pressed={categoryId === c.id}
              >
                <span className="text-[12.5px] font-medium text-white/90">{c.name}</span>
                <span className="line-clamp-2 text-[10.5px] leading-snug text-white/35">{c.kicker}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">2 · Format</p>
          <div className="flex flex-wrap gap-2">
            {allowedFormats.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setFormatId(format.id)}
                className={cx(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition',
                  formatId === format.id
                    ? 'border-[#c99a4e]/60 bg-[#c99a4e]/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-white/65 hover:border-white/25',
                )}
              >
                <span
                  className="block shrink-0 rounded-[2px] border border-current opacity-50"
                  style={{
                    width: format.width >= format.height ? 22 : 22 * (format.width / format.height),
                    height: format.width >= format.height ? 22 * (format.height / format.width) : 22,
                  }}
                />
                <span>
                  <span className="block text-[12px] font-medium">{format.label}</span>
                  <span className="block text-[10px] text-white/35">
                    {format.width}×{format.height}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="field-label mb-0">3 · Composition</p>
            <span className="chip">
              <IconSparkles size={11} /> {compatible.length} suited to {category.name}
            </span>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
            {previews.map(({ id, design }) => {
              const active = compositionSpecId(id) === compositionId
              const meta = id === 'auto' ? null : COMPOSITIONS.find((c) => c.meta.id === id)?.meta
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCompositionId(id)}
                  className={cx(
                    'group w-[112px] shrink-0 rounded-xl border p-1.5 text-left transition',
                    active ? 'border-[#c99a4e]/70 bg-[#c99a4e]/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                  )}
                  aria-pressed={active}
                >
                  <PosterThumb design={design} width={120} className="aspect-[4/5] w-full" />
                  <p className="mt-1.5 truncate text-[10.5px] text-white/80">{id === 'auto' ? 'Auto select' : meta?.name}</p>
                  <p className="truncate text-[9.5px] text-white/30">{id === 'auto' ? 'Best fit' : meta?.family}</p>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] leading-relaxed text-white/30">
            Samples above use the {brand.name} brand block and the {category.name} content preset. Every composition is a
            different layout system, not a recolour.
          </p>
        </div>
      </div>
    </Modal>
  )
}

function compositionSpecId(id: CompositionId | 'auto'): CompositionId | 'auto' {
  return id
}
