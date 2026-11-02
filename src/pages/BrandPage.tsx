import { useRef, useState } from 'react'
import { DEFAULT_BRAND } from '../engine/presets'
import { imageFileToDataUrl } from '../lib/canvas'
import { useStudio } from '../state/studio'
import { ColorField, Segmented, Slider, TextField, Toggle } from '../components/ui'
import { IconCheck, IconShield, IconTrash, IconUpload } from '../components/icons'

export default function BrandPage() {
  const { brand, updateBrand, design, update, toast, projects } = useStudio()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      const dataUrl = await imageFileToDataUrl(file)
      updateBrand({ logoDataUrl: dataUrl })
      toast('Brand logo saved in this browser.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logo upload failed.'
      setError(message)
      toast(message, 'error')
    }
  }

  const applyToOpen = () => {
    if (!design) {
      toast('Open a poster first to apply the brand block.', 'info')
      return
    }
    update((d) => ({
      ...d,
      brand: { ...d.brand, ...brand },
    }))
    toast('Studio brand applied to the open poster.', 'success')
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-5 pb-20 pt-8 sm:px-8">
      <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#d9ae6b]/70">Brand system</p>
      <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] text-white">One identity, every poster</h1>
      <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-white/40">
        These defaults are copied into each new poster. Nothing is sent anywhere: the logo and contact details are stored in
        this browser only.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          <section className="panel space-y-3 p-4">
            <h2 className="text-[13px] font-medium text-white/85">Identity</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Brand name" value={brand.name} maxLength={40} onChange={(v) => updateBrand({ name: v })} />
              <TextField label="Tagline" value={brand.tagline} maxLength={48} onChange={(v) => updateBrand({ tagline: v })} />
              <TextField label="Website" value={brand.website} maxLength={48} onChange={(v) => updateBrand({ website: v })} />
              <TextField label="Phone / WhatsApp" value={brand.contact} maxLength={40} onChange={(v) => updateBrand({ contact: v })} />
              <TextField label="Default CTA" value={brand.cta} maxLength={32} onChange={(v) => updateBrand({ cta: v })} placeholder="Book a reading" />
              <TextField label="Footer line" value={brand.footer} maxLength={80} onChange={(v) => updateBrand({ footer: v })} placeholder="Consultations in English · In person or online" />
            </div>
            <ColorField label="Brand accent" value={brand.accent} onChange={(v) => updateBrand({ accent: v })} />
          </section>

          <section className="panel space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-white/85">Logo</h2>
              {brand.logoDataUrl ? (
                <span className="chip border-emerald-400/25 text-emerald-200">
                  <IconCheck size={11} /> Uploaded
                </span>
              ) : (
                <span className="chip">Wordmark fallback</span>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-[104px] flex-1 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.04)_75%),linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.04)_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] p-4">
                {brand.logoDataUrl ? (
                  <img src={brand.logoDataUrl} alt="Brand logo" className="max-h-16 max-w-[80%] object-contain" />
                ) : (
                  <p className="max-w-[220px] text-center text-[11px] leading-relaxed text-white/30">
                    No logo uploaded. Posters use a typographic wordmark — the studio never invents an Astro Sivam mark.
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-44">
                <button type="button" className="btn-ghost text-[12px]" onClick={() => fileRef.current?.click()}>
                  <IconUpload size={14} /> Upload logo
                </button>
                {brand.logoDataUrl ? (
                  <button type="button" className="btn-danger text-[12px]" onClick={() => updateBrand({ logoDataUrl: null })}>
                    <IconTrash size={14} /> Remove
                  </button>
                ) : null}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                <p className="text-[10px] leading-relaxed text-white/30">PNG or SVG with transparency, under 4 MB.</p>
              </div>
            </div>
            {error ? <p className="text-[11px] text-red-300">{error}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Show logo on posters" checked={brand.showLogo} onChange={(v) => updateBrand({ showLogo: v })} />
              <div>
                <p className="field-label">Default position</p>
                <Segmented
                  size="sm"
                  value={brand.logoPosition}
                  onChange={(v) => updateBrand({ logoPosition: v })}
                  options={[
                    { value: 'auto', label: 'Layout' },
                    { value: 'tl', label: 'TL' },
                    { value: 'tr', label: 'TR' },
                    { value: 'bl', label: 'BL' },
                  ]}
                />
              </div>
            </div>
            <Slider label="Logo size" value={brand.logoSize} min={0.5} max={1.8} step={0.01} onChange={(v) => updateBrand({ logoSize: v })} format={(v) => `${Math.round(v * 100)}%`} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="panel p-4">
            <div className="flex items-center gap-2">
              <IconShield size={15} className="text-[#d9ae6b]/80" />
              <h2 className="text-[13px] font-medium text-white/85">Logo policy</h2>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">
              Only the official logo from astrosivam.com may be used. This project does not contain, download or recreate it, and no
              stock or generated logo is offered. Upload the official file supplied by the brand owner; until then every poster uses
              a typographic wordmark so nothing false ships.
            </p>
            <a
              href="https://astrosivam.com"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block text-[11.5px] text-[#d9ae6b]/80 hover:text-[#d9ae6b]"
            >
              astrosivam.com ↗
            </a>
          </section>

          <section className="panel p-4">
            <h2 className="text-[13px] font-medium text-white/85">Where this is used</h2>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-white/40">
              <li className="flex justify-between gap-2">
                <span>Saved projects</span>
                <span className="text-white/70">{projects.length}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Open poster</span>
                <span className="text-white/70">{design ? design.name : 'None'}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Logo stored</span>
                <span className="text-white/70">{brand.logoDataUrl ? 'Yes' : 'No'}</span>
              </li>
            </ul>
            <button type="button" className="btn-primary mt-3 w-full text-[12px]" onClick={applyToOpen}>
              Apply brand to open poster
            </button>
            <button
              type="button"
              className="btn-quiet mt-1 w-full text-[11.5px]"
              onClick={() => {
                updateBrand({ ...DEFAULT_BRAND })
                toast('Brand identity reset to defaults.', 'info')
              }}
            >
              Reset brand to defaults
            </button>
          </section>

          <section className="panel overflow-hidden">
            <div className="h-24 w-full" style={{ background: `linear-gradient(120deg, ${brand.accent}, #16131c)` }} />
            <div className="p-4">
              <p className="text-[12px] text-white/70">{brand.name}</p>
              <p className="text-[10.5px] text-white/35">{brand.tagline}</p>
              <p className="mt-1 text-[10.5px] text-white/25">
                {brand.website}
                {brand.contact ? ` · ${brand.contact}` : ''}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
