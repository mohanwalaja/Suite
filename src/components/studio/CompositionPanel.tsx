import { useMemo } from 'react'
import { COMPOSITIONS } from '../../engine/compositions'
import { CATEGORY_BY_ID } from '../../engine/categories'
import { typographyForComposition } from '../../engine/presets'
import { useStudio } from '../../state/studio'
import { PosterThumb } from '../PosterCanvas'
import { PanelHint, PanelSection } from './common'
import { IconRefresh, IconType } from '../icons'

function contentSignature(headline: string, sub: string, body: string, points: string[]) {
  let hash = 0
  const text = `${headline}|${sub}|${body}|${points.join('|')}`
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0
  return Math.abs(hash)
}

export function CompositionPanel() {
  const { design, update, regenerate, toast } = useStudio()
  if (!design) return null

  const previews = useMemo(() => {
    const signature = contentSignature(design.content.headline, design.content.subheadline, design.content.body, design.content.points)
    return COMPOSITIONS.map((c) => ({
      composition: c,
      preview: {
        ...design,
        id: `preview-${c.meta.id}`,
        compositionId: c.meta.id,
        updatedAt: signature,
      },
    }))
  }, [design])

  const select = (id: (typeof COMPOSITIONS)[number]['meta']['id']) => {
    const category = CATEGORY_BY_ID[design.categoryId]
    const next = COMPOSITIONS.find((c) => c.meta.id === id)
    const allowed = next?.meta.motifs ?? []
    const keepMotif = allowed.includes(design.art.motifId) || allowed.length === 0
    const motifId = keepMotif
      ? design.art.motifId
      : (allowed.find((m) => category?.motifs.includes(m)) ?? category?.motifs[0] ?? design.art.motifId)
    update(
      (d) => ({ ...d, compositionId: id, art: { ...d.art, motifId }, updatedAt: Date.now() }),
      { coalesce: 'composition' },
    )
    toast(`${next?.meta.name ?? 'Composition'} applied.`, 'info')
  }

  const matchTypography = () => {
    const next = typographyForComposition(design.compositionId, design.typography, design.categoryId)
    update({ typography: next })
    toast('Typography matched to this composition.', 'success')
  }

  return (
    <div className="space-y-4">
      <PanelSection>
        <div className="flex gap-2">
          <button type="button" className="btn-primary flex-1 text-[12px]" onClick={() => regenerate({ keepPalette: true })}>
            <IconRefresh size={14} /> Regenerate
          </button>
          <button type="button" className="btn-ghost text-[12px]" onClick={matchTypography} title="Apply the type preset for this layout">
            <IconType size={14} />
          </button>
        </div>
        <PanelHint>
          Regenerate picks a different layout system and never repeats the current one or the previous two, so consecutive
          variations look genuinely different.
        </PanelHint>
      </PanelSection>

      <div className="grid grid-cols-2 gap-2">
        {previews.map(({ composition, preview }) => {
          const active = design.compositionId === composition.meta.id
          return (
            <button
              key={composition.meta.id}
              type="button"
              onClick={() => select(composition.meta.id)}
              className={`group overflow-hidden rounded-xl border text-left transition ${
                active ? 'border-[#c99a4e]/70 bg-[#c99a4e]/[0.06] ring-1 ring-[#c99a4e]/25' : 'border-white/10 bg-white/[0.02] hover:border-white/30'
              }`}
              aria-pressed={active}
            >
              <PosterThumb design={preview} width={128} className="aspect-[4/5] w-full" />
              <span className="block px-1.5 pb-1.5 pt-1">
                <span className="flex items-center gap-1">
                  <span className="text-[10px] tabular-nums text-white/25">{String(composition.meta.index).padStart(2, '0')}</span>
                  <span className="truncate text-[10.5px] text-white/80">{composition.meta.name}</span>
                </span>
                <span className="block truncate text-[9px] uppercase tracking-[0.08em] text-white/25">{composition.meta.family}</span>
              </span>
            </button>
          )
        })}
      </div>

      <PanelSection title="Selected composition">
        {(() => {
          const current = COMPOSITIONS.find((c) => c.meta.id === design.compositionId)
          if (!current) return null
          const formatSupported = current.meta.formats.includes(
            design.height > design.width * 1.6 ? 'story' : design.width === design.height ? 'square' : design.width > design.height ? 'landscape' : 'portrait',
          )
          return (
            <div className="space-y-2 rounded-xl border border-white/[0.008] bg-white/[0.02] p-3">
              <p className="text-[12.5px] font-medium text-white/85">{current.meta.name}</p>
              <p className="text-[11px] leading-relaxed text-white/40">{current.meta.structure}</p>
              <div className="flex flex-wrap gap-1">
                {current.meta.bestFor.slice(0, 3).map((tag) => (
                  <span key={tag} className="chip px-2 py-0.5 text-[9.5px]">
                    {tag}
                  </span>
                ))}
              </div>
              {!formatSupported ? (
                <p className="text-[10.5px] text-amber-200/70">
                  This composition is tuned for {current.meta.formats.join(', ')}. It will still lay out here, but check the
                  preview carefully.
                </p>
              ) : null}
            </div>
          )
        })()}
      </PanelSection>
    </div>
  )
}
