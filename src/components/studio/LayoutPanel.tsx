import { getPalette } from '../../engine/palettes'
import { FORMATS } from '../../engine/formats'
import { withFormat } from '../../engine/presets'
import { useStudio } from '../../state/studio'
import { ColorField, Segmented, Slider, Toggle } from '../ui'
import { PanelHint, PanelSection } from './common'

export function LayoutPanel() {
  const { design, updateLayout, update, prefs, setPrefs, updateArt } = useStudio()
  if (!design) return null
  const l = design.layout
  const palette = getPalette(design.paletteId)

  return (
    <div className="space-y-6">
      <PanelSection title="Canvas" description="Changing format re-flows the composition instead of stretching it.">
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.filter((f) => f.id !== 'custom').map((format) => {
            const active = design.formatId === format.id
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => update((d) => withFormat(d, format.id))}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${
                  active ? 'border-[#c99a4e]/60 bg-[#c99a4e]/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
                aria-pressed={active}
              >
                <span
                  className="block shrink-0 rounded-[2px] border border-current opacity-45"
                  style={{
                    width: format.width >= format.height ? 20 : 20 * (format.width / format.height),
                    height: format.width >= format.height ? 20 * (format.height / format.width) : 20,
                  }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] text-white/85">{format.short}</span>
                  <span className="block truncate text-[9.5px] text-white/30">{format.label}</span>
                </span>
              </button>
            )
          })}
        </div>
        <CustomSize />
        <Toggle label="Show safe margins" checked={Boolean(prefs.showSafeArea)} onChange={(v) => setPrefs({ showSafeArea: v })} hint="Overlay only — never exported." />
      </PanelSection>

      <PanelSection title="Spacing & balance">
        <Slider label="Outer margin" value={l.margin} min={0.5} max={1.7} step={0.02} onChange={(v) => updateLayout({ margin: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Content density" value={l.density} min={0} max={1} step={0.01} onChange={(v) => updateLayout({ density: v })} format={(v) => `${Math.round(v * 100)}`} hint="Density also tunes motif detail in the artwork layer." />
        <Slider label="Artwork scale" value={l.artScale} min={0.6} max={1.5} step={0.01} onChange={(v) => updateLayout({ artScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Focal point X" value={l.focalX} min={0} max={1} step={0.01} onChange={(v) => updateLayout({ focalX: v })} format={(v) => `${Math.round(v * 100)}`} />
        <Slider label="Focal point Y" value={l.focalY} min={0} max={1} step={0.01} onChange={(v) => updateLayout({ focalY: v })} format={(v) => `${Math.round(v * 100)}`} />
      </PanelSection>

      <PanelSection title="Background & finish">
        <ColorField
          label="Background colour"
          value={design.overrides.background ?? palette.bg}
          onChange={(value) => update((d) => ({ ...d, overrides: { ...d.overrides, background: value } }), { coalesce: 'bg' })}
        />
        {design.overrides.background ? (
          <button type="button" className="btn-quiet -mt-1 px-0 text-[11px]" onClick={() => update((d) => ({ ...d, overrides: { ...d.overrides, background: null } }))}>
            Reset to palette background
          </button>
        ) : null}
        <ColorField
          label="Accent colour"
          value={design.overrides.accent ?? palette.accent}
          onChange={(value) => update((d) => ({ ...d, overrides: { ...d.overrides, accent: value } }), { coalesce: 'accent' })}
        />
        {design.overrides.accent ? (
          <button type="button" className="btn-quiet -mt-1 px-0 text-[11px]" onClick={() => update((d) => ({ ...d, overrides: { ...d.overrides, accent: null } }))}>
            Reset to palette accent
          </button>
        ) : null}
        <Slider label="Grain" value={l.grain} min={0} max={1} step={0.01} onChange={(v) => updateLayout({ grain: v })} format={(v) => `${Math.round(v * 100)}`} hint="Fine paper grain, generated per pixel — textures the whole poster." />
        <div>
          <p className="field-label">Artwork opacity</p>
          <Slider label="Opacity" value={design.art.uploadOpacity} min={0.15} max={1} step={0.01} onChange={(v) => updateArt({ uploadOpacity: v })} format={(v) => `${Math.round(v * 100)}%`} />
        </div>
      </PanelSection>

      <PanelSection title="Elements">
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Artwork" checked={l.showArtwork} onChange={(v) => updateLayout({ showArtwork: v })} />
          <Toggle label="Points" checked={l.showPoints} onChange={(v) => updateLayout({ showPoints: v })} />
          <Toggle label="Frame" checked={l.frame} onChange={(v) => updateLayout({ frame: v })} />
          <Toggle label="Grain" checked={l.grain > 0} onChange={(v) => updateLayout({ grain: v ? 0.35 : 0 })} />
        </div>
        <Slider label="Corner radius" value={l.cornerRadius} min={0} max={48} step={1} onChange={(v) => updateLayout({ cornerRadius: v })} format={(v) => `${v}px`} />
        <PanelHint>Frame and corner radius are applied by compositions that support them; others keep their own construction.</PanelHint>
      </PanelSection>
    </div>
  )
}

function CustomSize() {
  const { design, update, toast } = useStudio()
  if (!design) return null
  const isCustom = design.formatId === 'custom'
  return (
    <div className="rounded-xl border border-white/[0.008] bg-white/[0.02] p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] text-white/60">Custom size</p>
        <Segmented
          size="sm"
          full={false}
          value={isCustom ? 'on' : 'off'}
          onChange={(value) => {
            if (value === 'on') {
              update((d) => withFormat(d, 'custom', { width: d.width, height: d.height }))
            } else {
              update((d) => withFormat(d, 'ig-portrait'))
            }
          }}
          options={[
            { value: 'off', label: 'Standard' },
            { value: 'on', label: 'Custom' },
          ]}
        />
      </div>
      {isCustom ? (
        <div className="mt-2 flex items-end gap-2">
          <label className="flex-1">
            <span className="field-label">Width</span>
            <input
              type="number"
              min={320}
              max={4096}
              className="input-sm"
              value={design.width}
              onChange={(e) => {
                const width = Math.max(320, Math.min(4096, Number(e.target.value) || 1080))
                update((d) => withFormat(d, 'custom', { width, height: d.height }), { coalesce: 'custom-size' })
              }}
            />
          </label>
          <label className="flex-1">
            <span className="field-label">Height</span>
            <input
              type="number"
              min={320}
              max={4096}
              className="input-sm"
              value={design.height}
              onChange={(e) => {
                const height = Math.max(320, Math.min(4096, Number(e.target.value) || 1350))
                update((d) => withFormat(d, 'custom', { width: d.width, height }), { coalesce: 'custom-size' })
              }}
            />
          </label>
          <button
            type="button"
            className="btn-ghost h-[34px] px-2 text-[11px]"
            onClick={() => {
              update((d) => withFormat(d, 'custom', { width: d.width, height: d.height }))
              toast(`Canvas set to ${design.width}×${design.height}.`, 'info')
            }}
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  )
}
