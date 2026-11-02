import { useRef, useState } from 'react'
import type { BrandSpec } from '../../engine/types'
import { getPalette } from '../../engine/palettes'
import { imageFileToDataUrl } from '../../lib/canvas'
import { useStudio } from '../../state/studio'
import { ColorField, Segmented, Slider, TextField, Toggle } from '../ui'
import { PanelHint, PanelSection } from './common'
import { IconTrash, IconUpload } from '../icons'

export function BrandPanel() {
  const { design, brand, update, toast } = useStudio()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  if (!design) return null
  const b = design.brand
  const palette = getPalette(design.paletteId)

  const setBrand = (patch: Partial<BrandSpec>) =>
    update((d) => ({ ...d, brand: { ...d.brand, ...patch }, updatedAt: Date.now() }), { coalesce: 'brand' })

  const onLogo = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      const dataUrl = await imageFileToDataUrl(file)
      setBrand({ logoDataUrl: dataUrl })
      toast('Logo added to this poster.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logo upload failed.'
      setError(message)
      toast(message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PanelSection title="Identity" description="Applies to this poster. Studio-wide defaults live in Brand settings.">
        <TextField label="Brand name" value={b.name} maxLength={40} onChange={(v) => setBrand({ name: v })} placeholder="Astrosivam" />
        <TextField label="Tagline" value={b.tagline} maxLength={48} onChange={(v) => setBrand({ tagline: v })} placeholder="Vedic Astrology" />
        <TextField label="Website" value={b.website} maxLength={48} onChange={(v) => setBrand({ website: v })} />
        <TextField label="Phone / WhatsApp" value={b.contact} maxLength={40} onChange={(v) => setBrand({ contact: v })} />
        <TextField label="CTA label" value={b.cta} maxLength={32} onChange={(v) => setBrand({ cta: v })} placeholder="Book a reading" />
      </PanelSection>

      <PanelSection title="Logo" description="Upload the official Astrosivam logo file. The studio never draws an imitation.">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost flex-1 text-[12px]" onClick={() => fileRef.current?.click()}>
            <IconUpload size={14} /> {b.logoDataUrl ? 'Replace logo' : 'Upload logo'}
          </button>
          {b.logoDataUrl ? (
            <button type="button" className="btn-quiet h-9 w-9 px-0" onClick={() => setBrand({ logoDataUrl: null })} aria-label="Remove logo">
              <IconTrash size={15} />
            </button>
          ) : null}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
        {b.logoDataUrl ? (
          <div className="flex items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.04)_75%),linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:14px_14px] bg-[position:0_0,7px_7px] p-3">
            <img src={b.logoDataUrl} alt="Uploaded brand logo" className="max-h-16 max-w-[70%] object-contain" />
          </div>
        ) : (
          <PanelHint>
            PNG or SVG with transparency works best. {brand.logoDataUrl ? 'Your studio brand has a logo you can reuse.' : 'No studio logo is stored yet either.'}
          </PanelHint>
        )}
        {error ? <p className="text-[11px] text-red-300">{error}</p> : null}
        <Toggle label="Show logo on poster" checked={b.showLogo} onChange={(v) => setBrand({ showLogo: v })} />
        <Slider label="Logo size" value={b.logoSize} min={0.5} max={1.8} step={0.01} onChange={(v) => setBrand({ logoSize: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <div>
          <p className="field-label">Logo position</p>
          <Segmented
            size="sm"
            value={b.logoPosition}
            onChange={(v) => setBrand({ logoPosition: v })}
            options={[
              { value: 'auto', label: 'Layout' },
              { value: 'tl', label: 'TL' },
              { value: 'tr', label: 'TR' },
              { value: 'bl', label: 'BL' },
              { value: 'br', label: 'BR' },
              { value: 'center', label: 'Top C' },
            ]}
          />
          <p className="mt-1.5 text-[11px] text-white/30">
            <strong className="font-medium text-white/45">Layout</strong> lets the composition decide the best corner.
          </p>
        </div>
      </PanelSection>

      <PanelSection title="Brand colour">
        <ColorField label="Brand accent" value={b.accent} onChange={(v) => setBrand({ accent: v })} />
        <button
          type="button"
          className="btn-ghost w-full text-[12px]"
          onClick={() => {
            update((d) => ({ ...d, overrides: { ...d.overrides, accent: b.accent } }))
            toast('Brand accent applied as the poster accent colour.', 'success')
          }}
        >
          Use brand accent on this poster
        </button>
        <p className="text-[10.5px] text-white/30">Palette accent is {palette.accent}. Overrides are listed in Layout → Background &amp; finish.</p>
      </PanelSection>

      <PanelSection title="Footer">
        <TextField label="Footer line" value={b.footer} maxLength={80} onChange={(v) => setBrand({ footer: v })} placeholder="Consultations in English · In person or online" />
        <PanelHint>Compositions that include a footer use this line; others use the poster&apos;s own contact row.</PanelHint>
      </PanelSection>

      {brand.name !== b.name || brand.website !== b.website ? (
        <button
          type="button"
          className="btn-quiet w-full text-[11.5px]"
          onClick={() => {
            update((d) => ({
              ...d,
              brand: {
                ...d.brand,
                name: brand.name,
                tagline: brand.tagline,
                website: brand.website,
                contact: brand.contact,
                accent: brand.accent,
                logoDataUrl: brand.logoDataUrl,
                footer: brand.footer,
              },
            }))
            toast('Studio brand re-applied to this poster.', 'info')
          }}
        >
          Reset branding from studio brand settings
        </button>
      ) : null}
    </div>
  )
}
