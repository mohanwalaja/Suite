import { BODY_FONTS, DISPLAY_FONTS, FONT_BY_ID, nearestWeight, supportedWeights } from '../../engine/fonts'
import { getPalette } from '../../engine/palettes'
import { useStudio } from '../../state/studio'
import { ColorField, Segmented, Select, Slider, Toggle } from '../ui'
import { PanelHint, PanelSection } from './common'

export function TypePanel() {
  const { design, updateTypography, update } = useStudio()
  if (!design) return null
  const t = design.typography
  const palette = getPalette(design.paletteId)
  const weights = supportedWeights(t.displayFont)
  const bodyFamily = FONT_BY_ID[t.displayFont]

  const setDisplayFont = (fontId: string) => {
    const weight = nearestWeight(fontId, t.headlineWeight)
    updateTypography({ displayFont: fontId, headlineWeight: weight })
  }

  return (
    <div className="space-y-6">
      <PanelSection title="Typefaces" description="All families are bundled with the app — no web-font requests at export time.">
        <Select
          label="Display / headline"
          value={t.displayFont}
          onChange={setDisplayFont}
          options={DISPLAY_FONTS.map((f) => ({ value: f.id, label: `${f.label} · ${f.role === 'both' ? 'display + body' : 'display'}` }))}
          hint={bodyFamily?.note}
        />
        <Select
          label="Body / supporting"
          value={t.bodyFont}
          onChange={(value) => updateTypography({ bodyFont: value })}
          options={BODY_FONTS.map((f) => ({ value: f.id, label: f.label }))}
          hint={FONT_BY_ID[t.bodyFont]?.note}
        />
      </PanelSection>

      <PanelSection title="Headline">
        <div>
          <p className="field-label">Weight</p>
          <div className="flex flex-wrap gap-1.5">
            {weights.map((weight) => (
              <button
                key={weight}
                type="button"
                onClick={() => updateTypography({ headlineWeight: weight })}
                className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition ${
                  nearestWeight(t.displayFont, t.headlineWeight) === weight
                    ? 'border-[#c99a4e]/60 bg-[#c99a4e]/10 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/25'
                }`}
                aria-pressed={nearestWeight(t.displayFont, t.headlineWeight) === weight}
              >
                {weight}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-white/30">{t.displayFont} ships these weights; unavailable values snap to the closest one.</p>
        </div>
        <Slider label="Size scale" value={t.headlineScale} min={0.72} max={1.35} step={0.01} onChange={(v) => updateTypography({ headlineScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Letter tracking" value={t.tracking} min={-0.06} max={0.14} step={0.005} onChange={(v) => updateTypography({ tracking: v })} format={(v) => `${(v * 1000).toFixed(0)}`} />
        <Slider label="Line height" value={t.lineHeight} min={0.88} max={1.4} step={0.01} onChange={(v) => updateTypography({ lineHeight: v })} format={(v) => v.toFixed(2)} />
        <div>
          <p className="field-label">Alignment preference</p>
          <Segmented
            value={t.align}
            onChange={(value) => updateTypography({ align: value })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Centre' },
              { value: 'right', label: 'Right' },
            ]}
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/30">
            Some compositions are built around a fixed alignment (for example a centred cartouche) and will keep their own.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Uppercase" checked={t.uppercaseHeadline} onChange={(v) => updateTypography({ uppercaseHeadline: v })} />
          <Toggle label="Italic" checked={t.italicHeadline} onChange={(v) => updateTypography({ italicHeadline: v })} />
        </div>
      </PanelSection>

      <PanelSection title="Colour" description="Palette drives the poster; these overrides only affect this design.">
        <ColorField
          label="Text colour"
          value={design.overrides.ink ?? palette.ink}
          onChange={(value) => update((d) => ({ ...d, overrides: { ...d.overrides, ink: value } }), { coalesce: 'ink' })}
        />
        {design.overrides.ink ? (
          <button type="button" className="btn-quiet -mt-1 px-0 text-[11px]" onClick={() => update((d) => ({ ...d, overrides: { ...d.overrides, ink: null } }))}>
            Reset to palette ink
          </button>
        ) : null}
        <PanelHint>
          Text rendering uses the current palette&apos;s contrast. If you override the ink, run the preflight check in Export to
          confirm the contrast still holds on the background.
        </PanelHint>
      </PanelSection>
    </div>
  )
}
