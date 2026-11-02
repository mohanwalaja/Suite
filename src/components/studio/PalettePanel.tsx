import { useMemo } from 'react'
import { CATEGORY_BY_ID } from '../../engine/categories'
import { PALETTES } from '../../engine/palettes'
import { useStudio } from '../../state/studio'
import { PanelHint, PanelSection } from './common'
import { IconRefresh } from '../icons'

export function PalettePanel() {
  const { design, update, toast } = useStudio()
  if (!design) return null
  const category = CATEGORY_BY_ID[design.categoryId]
  const recommended = useMemo(() => new Set(category?.palettes ?? []), [category])

  const apply = (paletteId: string) => {
    update((d) => ({ ...d, paletteId, updatedAt: Date.now() }), { coalesce: 'palette' })
  }

  const shuffle = () => {
    const pool = PALETTES.filter((p) => p.id !== design.paletteId)
    const next = pool[Math.floor(Math.random() * pool.length)]
    apply(next.id)
    toast(`${next.name} applied.`, 'info')
  }

  const ordered = [
    ...PALETTES.filter((p) => recommended.has(p.id)),
    ...PALETTES.filter((p) => !recommended.has(p.id)),
  ]

  return (
    <div className="space-y-4">
      <PanelSection>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-white/40">
            {recommended.size} palettes are tuned for {category?.name ?? 'this category'}.
          </p>
          <button type="button" className="btn-quiet px-1.5 py-1 text-[11px]" onClick={shuffle}>
            <IconRefresh size={13} /> Shuffle
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ordered.map((palette) => {
            const active = palette.id === design.paletteId
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => apply(palette.id)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  active ? 'border-[#c99a4e]/70 ring-1 ring-[#c99a4e]/25' : 'border-white/10 hover:border-white/30'
                }`}
                aria-pressed={active}
              >
                <span
                  className="flex h-14 w-full items-end gap-0 p-0"
                  style={{ background: `linear-gradient(120deg, ${palette.bg} 0%, ${palette.deep} 100%)` }}
                >
                  <span className="h-2 flex-1" style={{ background: palette.accent }} />
                  <span className="h-2 flex-1" style={{ background: palette.accentAlt }} />
                  <span className="h-2 flex-1" style={{ background: palette.surface }} />
                  <span className="h-2 flex-1" style={{ background: palette.ink }} />
                  <span className="h-2 flex-1" style={{ background: palette.inkSoft }} />
                </span>
                <span className="block bg-black/30 px-2 py-1.5">
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10.5px] text-white/80">{palette.name}</span>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-white/25">{palette.mode}</span>
                  </span>
                  <span className="block truncate text-[9.5px] text-white/30">{palette.mood}</span>
                </span>
              </button>
            )
          })}
        </div>
      </PanelSection>
      <PanelHint>
        Palettes are full colour systems — background construction, ink contrast, accent and line weights — not a single
        background swap. Contrast between ink and ground is checked at export.
      </PanelHint>
    </div>
  )
}
