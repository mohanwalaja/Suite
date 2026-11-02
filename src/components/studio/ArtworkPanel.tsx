import { useEffect, useRef, useState } from 'react'
import { MOTIFS, drawMotif, type Motif } from '../../engine/artwork'
import { CATEGORY_BY_ID } from '../../engine/categories'
import { getPalette } from '../../engine/palettes'
import { useStudio } from '../../state/studio'
import { imageFileToDataUrl } from '../../lib/canvas'
import { buildPrompt, getImageProvider, providerStatus } from '../../lib/provider'
import { Segmented, Slider, Toggle } from '../ui'
import { PanelHint, PanelSection } from './common'
import { IconImage, IconSparkles, IconTrash, IconUpload } from '../icons'

const FAMILY_LABEL: Record<string, string> = {
  celestial: 'Celestial',
  devotional: 'Devotional',
  botanical: 'Botanical',
  architectural: 'Architectural',
  geometric: 'Geometric',
}

function MotifThumb({ motif, paletteId, active, onClick }: { motif: Motif; paletteId: string; active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const palette = getPalette(paletteId)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const size = 84
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, palette.deep)
    grad.addColorStop(1, palette.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    try {
      drawMotif(
        {
          ctx: ctx as unknown as never,
          rect: { x: 6, y: 6, w: size - 12, h: size - 12 },
          palette: { ...palette, bg: 'transparent' },
          u: size / 620,
          seed: 9,
          time: 0,
          detail: 0.75,
        },
        motif.id,
      )
    } catch {
      // A motif failing to draw must not break the picker; the card stays blank.
    }
  }, [motif.id, palette])

  return (
    <button
      type="button"
      onClick={onClick}
      title={motif.description}
      className={`overflow-hidden rounded-lg border text-left transition ${
        active ? 'border-[#c99a4e]/70 ring-1 ring-[#c99a4e]/30' : 'border-white/10 hover:border-white/30'
      }`}
      aria-pressed={active}
    >
      <canvas ref={ref} style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true" />
      <span className="block truncate bg-black/40 px-1.5 py-1 text-[9.5px] text-white/60">{motif.name}</span>
    </button>
  )
}

export function ArtworkPanel() {
  const { design, updateArt, updateLayout, toast } = useStudio()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(design?.art.providerPrompt ?? '')
  const [generated, setGenerated] = useState<{ dataUrl: string; provider: string; model?: string; prompt: string } | null>(
    design?.art.mode === 'provider' && design.art.providerImageDataUrl
      ? { dataUrl: design.art.providerImageDataUrl, provider: 'previously generated', prompt: design.art.providerPrompt }
      : null,
  )

  if (!design) return null
  const category = CATEGORY_BY_ID[design.categoryId]
  const status = providerStatus()
  const provider = getImageProvider()
  const families = [...new Set(MOTIFS.map((m) => m.family))]

  const onUpload = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      const dataUrl = await imageFileToDataUrl(file)
      updateArt({ mode: 'upload', uploadDataUrl: dataUrl, offsetX: 0, offsetY: 0 })
      toast('Artwork uploaded. Drag on the preview to reposition it.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.'
      setError(message)
      toast(message, 'error')
    }
  }

  const generate = async () => {
    setError(null)
    if (!status.configured) {
      const message = 'No image provider is configured. The vector motif library is used instead.'
      setError(message)
      toast(message, 'error')
      return
    }
    const finalPrompt = prompt.trim() || buildPrompt(category?.artDirection ?? '', design.content)
    setBusy(true)
    try {
      const result = await provider.generate({
        prompt: finalPrompt,
        width: Math.round(design.width / 2),
        height: Math.round(design.height / 2),
        categoryId: design.categoryId,
      })
      setGenerated({ dataUrl: result.dataUrl, provider: result.provider, model: result.model, prompt: finalPrompt })
      updateArt({ mode: 'provider', providerImageDataUrl: result.dataUrl, providerPrompt: finalPrompt, offsetX: 0, offsetY: 0 })
      toast(`Image returned by ${result.provider}. Review it before exporting.`, 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The provider request failed.'
      setError(message)
      toast(message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PanelSection title="Artwork source" description="Original vector illustration is the default. Uploads and AI imagery are opt-in.">
        <Segmented
          value={design.art.mode}
          onChange={(mode) => {
            if (mode === 'upload' && !design.art.uploadDataUrl) {
              fileRef.current?.click()
              return
            }
            if (mode === 'provider' && !design.art.providerImageDataUrl) {
              updateArt({ mode: 'provider' })
              return
            }
            updateArt({ mode })
          }}
          options={[
            { value: 'motif', label: 'Vector' },
            { value: 'upload', label: 'Upload' },
            { value: 'provider', label: 'AI' },
            { value: 'none', label: 'None' },
          ]}
        />
        {design.art.mode === 'upload' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost flex-1 text-[12px]" onClick={() => fileRef.current?.click()}>
                <IconUpload size={14} /> {design.art.uploadDataUrl ? 'Replace image' : 'Upload image'}
              </button>
              {design.art.uploadDataUrl ? (
                <button type="button" className="btn-quiet h-9 w-9 px-0" onClick={() => updateArt({ mode: 'motif', uploadDataUrl: null })} aria-label="Remove uploaded image">
                  <IconTrash size={15} />
                </button>
              ) : null}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
            {design.art.uploadDataUrl ? (
              <>
                <img src={design.art.uploadDataUrl} alt="Uploaded artwork preview" className="max-h-32 w-full rounded-lg object-cover ring-1 ring-white/10" />
                <Segmented
                  size="sm"
                  value={design.art.uploadFit}
                  onChange={(fit) => updateArt({ uploadFit: fit })}
                  options={[
                    { value: 'cover', label: 'Fill crop' },
                    { value: 'contain', label: 'Fit whole image' },
                  ]}
                />
                <Slider label="Horizontal offset" value={design.art.offsetX} min={-1} max={1} step={0.01} onChange={(v) => updateArt({ offsetX: v })} format={(v) => v.toFixed(2)} />
                <Slider label="Vertical offset" value={design.art.offsetY} min={-1} max={1} step={0.01} onChange={(v) => updateArt({ offsetY: v })} format={(v) => v.toFixed(2)} />
              </>
            ) : (
              <PanelHint>PNG, JPG, WebP or SVG up to 4 MB. Landscape photos will be cropped to the artwork frame — drag on the canvas to adjust.</PanelHint>
            )}
          </div>
        ) : null}

        {design.art.mode === 'provider' ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.008] bg-white/[0.02] px-2.5 py-2">
              <span className="text-[11px] text-white/60">{status.label}</span>
              <span className={`chip ${status.configured ? 'border-emerald-400/25 text-emerald-200' : ''}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.configured ? 'bg-emerald-400' : 'bg-white/30'}`} />
                {status.configured ? 'Ready' : 'Off'}
              </span>
            </div>
            <textarea
              className="textarea min-h-[84px] text-[12px]"
              value={prompt}
              placeholder={buildPrompt(category?.artDirection ?? '', design.content)}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Image prompt"
            />
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1 text-[12px]" onClick={() => setPrompt(buildPrompt(category?.artDirection ?? '', design.content))}>
                Use art direction
              </button>
              <button type="button" className="btn-primary flex-1 text-[12px]" onClick={generate} disabled={busy || !status.configured}>
                <IconSparkles size={14} />
                {busy ? 'Generating…' : 'Generate'}
              </button>
            </div>
            <p className="text-[10.5px] leading-relaxed text-white/30">{status.detail}</p>
            {error ? <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-2.5 py-2 text-[11px] text-red-200">{error}</p> : null}
            {generated ? (
              <div className="space-y-1.5">
                <img src={generated.dataUrl} alt="Provider result" className="max-h-44 w-full rounded-lg object-cover ring-1 ring-white/10" />
                <p className="text-[10.5px] text-white/35">
                  Returned by {generated.provider}
                  {generated.model ? ` · ${generated.model}` : ''} — this is provider output, not a studio illustration.
                </p>
              </div>
            ) : (
              <PanelHint>No provider is configured in this build. Supply VITE_AI_ENDPOINT and a server-side proxy (documented in the Guide) to enable generation. Everything else works without it.</PanelHint>
            )}
          </div>
        ) : null}
      </PanelSection>

      {design.art.mode === 'motif' ? (
        <PanelSection title="Motif library" description={`${MOTIFS.length} original vector illustrations drawn by the engine.`}>
          {families.map((family) => (
            <div key={family} className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">{FAMILY_LABEL[family] ?? family}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {MOTIFS.filter((m) => m.family === family).map((motif) => (
                  <MotifThumb
                    key={motif.id}
                    motif={motif}
                    paletteId={design.paletteId}
                    active={design.art.motifId === motif.id}
                    onClick={() => updateArt({ motifId: motif.id })}
                  />
                ))}
              </div>
            </div>
          ))}
        </PanelSection>
      ) : null}

      <PanelSection title="Placement">
        <Slider label="Artwork opacity" value={design.art.uploadOpacity} min={0.15} max={1} step={0.01} onChange={(v) => updateArt({ uploadOpacity: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <Toggle label="Show artwork" checked={design.layout.showArtwork} onChange={(v) => updateLayout({ showArtwork: v })} />
        <PanelHint>
          <IconImage size={12} className="mr-1 inline" />
          Composition controls where artwork sits. Use the Layout panel for focal point and scale; the motif is redrawn at the new
          aspect ratio rather than resized as a bitmap.
        </PanelHint>
      </PanelSection>
    </div>
  )
}
