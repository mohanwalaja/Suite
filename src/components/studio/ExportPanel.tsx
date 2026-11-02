import { useEffect, useMemo, useRef, useState } from 'react'
import type { DesignSpec, RenderReport } from '../../engine/types'
import { contrastRatio } from '../../engine/color'
import { FORMAT_BY_ID, FORMATS } from '../../engine/formats'
import { getPalette } from '../../engine/palettes'
import { withFormat } from '../../engine/presets'
import { useStudio } from '../../state/studio'
import {
  detectVideoSupport,
  downloadBlob,
  exportImage,
  exportVideo,
  loadAssets,
  safeFilename,
} from '../../lib/canvas'
import { Segmented, Spinner } from '../ui'
import { PanelHint, PanelSection } from './common'
import { IconAlert, IconCheck, IconDownload, IconFilm, IconInfo } from '../icons'

interface ExportResult {
  name: string
  sizeLabel: string
  at: number
}

function collectIssues(design: DesignSpec, report: RenderReport | null) {
  const palette = getPalette(design.paletteId)
  const ink = design.overrides.ink ?? palette.ink
  const bg = design.overrides.background ?? palette.bg
  const contrast = contrastRatio(ink, bg)
  const items: Array<{ severity: 'error' | 'warning' | 'info'; message: string }> = []
  if (report) {
    for (const issue of report.issues) {
      items.push({ severity: issue.severity === 'error' ? 'error' : 'warning', message: issue.message })
    }
    if (report.blocks.length === 0) {
      items.push({ severity: 'warning', message: 'No text blocks were measured — the composition may be missing content.' })
    }
  }
  if (!report) items.push({ severity: 'info', message: 'Run the check to measure every text block against its box.' })
  if (contrast < 3) {
    items.push({ severity: 'error', message: `Text contrast is ${contrast.toFixed(1)}:1 against the background. That will be hard to read.` })
  } else if (contrast < 4.5) {
    items.push({ severity: 'warning', message: `Text contrast is ${contrast.toFixed(1)}:1. Acceptable for large display type, weak for small body copy.` })
  }
  if (!design.content.headline.trim()) items.push({ severity: 'error', message: 'The headline is empty.' })
  if (!design.content.contact && !design.content.website) {
    items.push({ severity: 'info', message: 'No contact or website is set — add one so the poster is actionable.' })
  }
  if (design.brand.showLogo && !design.brand.logoDataUrl) {
    items.push({ severity: 'info', message: 'No logo uploaded; the wordmark fallback is used. Upload the official logo in Brand settings to replace it.' })
  }
  if (design.art.mode === 'provider' && !design.art.providerImageDataUrl) {
    items.push({ severity: 'warning', message: 'AI artwork mode is selected but no image has been returned yet.' })
  }
  return items
}

export function ExportPanel() {
  const { design, report, setReport, toast, projects, saveCurrent } = useStudio()
  const [scale, setScale] = useState('1')
  const [jpegQuality, setJpegQuality] = useState(0.94)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: 'error' | 'success' | 'info'; message: string } | null>(null)
  const [history, setHistory] = useState<ExportResult[]>([])
  const [videoProgress, setVideoProgress] = useState(0)
  const [multiFormatIds, setMultiFormatIds] = useState<string[]>(['ig-portrait', 'square', 'story'])
  const abortRef = useRef<AbortController | null>(null)
  const support = useMemo(() => detectVideoSupport(), [])
  const issues = useMemo(() => (design ? collectIssues(design, report) : []), [design, report])

  useEffect(() => () => abortRef.current?.abort(), [])

  if (!design) return null
  const format = FORMAT_BY_ID[design.formatId] ?? FORMATS[0]
  const outW = Math.round(design.width * Number(scale))
  const outH = Math.round(design.height * Number(scale))
  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length
  const saved = projects.some((p) => p.id === design.id)

  const runPreflight = async () => {
    setBusy('check')
    try {
      const assets = await loadAssets(design)
      const result = await exportImage(design, 'png', { scale: 0.5, assets })
      setReport(result.report)
      const errorCount = result.report.issues.filter((i) => i.severity === 'error').length
      toast(errorCount ? `Check finished: ${errorCount} blocking issue${errorCount > 1 ? 's' : ''}.` : 'Check finished: no blocking issues.', errorCount ? 'error' : 'success')
    } catch (err) {
      setNotice({ tone: 'error', message: err instanceof Error ? err.message : 'Check failed.' })
    } finally {
      setBusy(null)
    }
  }

  const runImageExport = async (kind: 'png' | 'jpeg') => {
    setBusy(kind)
    setNotice(null)
    try {
      const assets = await loadAssets(design)
      const result = await exportImage(design, kind, {
        scale: Number(scale),
        assets,
        quality: jpegQuality,
      })
      setReport(result.report)
      const filename = safeFilename(design.name, `${result.width}x${result.height}.${kind === 'png' ? 'png' : 'jpg'}`)
      downloadBlob(result.blob, filename)
      setHistory((h) => [
        { name: filename, sizeLabel: `${result.width}×${result.height} · ${(result.blob.size / 1024 / 1024).toFixed(2)} MB`, at: Date.now() },
        ...h.slice(0, 5),
      ])
      const blocking = result.report.issues.filter((i) => i.severity === 'error').length
      setNotice({
        tone: blocking ? 'info' : 'success',
        message: blocking
          ? `Exported ${filename} (${result.width}×${result.height}). ${blocking} text issue${blocking > 1 ? 's' : ''} still listed below.`
          : `Exported ${filename} at ${result.width}×${result.height}.`,
      })
      if (!saved) toast('Tip: save the project so you can reopen this design later.', 'info')
    } catch (err) {
      setNotice({ tone: 'error', message: err instanceof Error ? err.message : 'Export failed.' })
    } finally {
      setBusy(null)
    }
  }

  const runMultiSize = async () => {
    if (multiFormatIds.length === 0) return
    setBusy('multi')
    setNotice(null)
    try {
      const assets = await loadAssets(design)
      for (const id of multiFormatIds) {
        const next = withFormat(design, id as DesignSpec['formatId'])
        const result = await exportImage(next, 'png', { scale: Number(scale), assets })
        const target = FORMAT_BY_ID[id as DesignSpec['formatId']]
        const filename = safeFilename(design.name, `${target.width}x${target.height}-${target.short.replace(':', 'x')}.png`)
        downloadBlob(result.blob, filename)
        setHistory((h) => [
          { name: filename, sizeLabel: `${result.width}×${result.height} · ${(result.blob.size / 1024 / 1024).toFixed(2)} MB`, at: Date.now() },
          ...h.slice(0, 5),
        ])
        await new Promise((resolve) => setTimeout(resolve, 350))
      }
      setNotice({
        tone: 'success',
        message: `Exported ${multiFormatIds.length} sizes. Each one was re-laid out at its own aspect ratio, not stretched.`,
      })
    } catch (err) {
      setNotice({ tone: 'error', message: err instanceof Error ? err.message : 'Batch export failed.' })
    } finally {
      setBusy(null)
    }
  }

  const runVideo = async () => {
    setBusy('video')
    setVideoProgress(0)
    setNotice(null)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const assets = await loadAssets(design)
      const result = await exportVideo(design, {
        assets,
        fps: design.animation.fps,
        signal: controller.signal,
        longEdge: 1080,
        onProgress: setVideoProgress,
      })
      const filename = safeFilename(design.name, `animation.${result.extension}`)
      downloadBlob(result.blob, filename)
      setHistory((h) => [
        { name: filename, sizeLabel: `${result.duration.toFixed(1)}s · ${(result.blob.size / 1024 / 1024).toFixed(2)} MB`, at: Date.now() },
        ...h.slice(0, 5),
      ])
      setNotice({
        tone: 'success',
        message: `Recorded ${result.frames} frames as ${result.extension.toUpperCase()} (${result.mimeType.split(';')[0]}).`,
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setNotice({ tone: 'info', message: 'Video export cancelled.' })
      } else {
        setNotice({ tone: 'error', message: err instanceof Error ? err.message : 'Video export failed.' })
      }
    } finally {
      setBusy(null)
      abortRef.current = null
    }
  }

  return (
    <div className="space-y-5">
      <PanelSection
        title="Preflight"
        description="Measured from the real render, not estimated."
        action={
          <button type="button" className="btn-quiet px-1.5 py-1 text-[11px]" onClick={runPreflight} disabled={busy !== null}>
            {busy === 'check' ? <Spinner className="h-3 w-3" /> : null} Run check
          </button>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          <span className={`chip ${errors ? 'border-red-400/30 text-red-200' : 'border-emerald-400/25 text-emerald-200'}`}>
            {errors ? <IconAlert size={11} /> : <IconCheck size={11} />} {errors} blocking
          </span>
          <span className={`chip ${warnings ? 'border-amber-400/30 text-amber-200' : ''}`}>{warnings} warnings</span>
          <span className="chip">{design.width}×{design.height}px</span>
        </div>
        <ul className="space-y-1.5">
          {issues.slice(0, 7).map((issue, i) => (
            <li key={`${issue.message}-${i}`} className="flex gap-2 rounded-lg border border-white/[0.008] bg-white/[0.02] px-2.5 py-2 text-[11px] leading-relaxed">
              <span className="mt-0.5 shrink-0">
                {issue.severity === 'error' ? (
                  <IconAlert size={12} className="text-red-300" />
                ) : issue.severity === 'warning' ? (
                  <IconAlert size={12} className="text-amber-300" />
                ) : (
                  <IconInfo size={12} className="text-white/35" />
                )}
              </span>
              <span className={issue.severity === 'info' ? 'text-white/40' : 'text-white/70'}>{issue.message}</span>
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title="Image export">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="field-label">Scale</p>
            <Segmented
              size="sm"
              value={scale}
              onChange={setScale}
              options={[
                { value: '1', label: '1×' },
                { value: '2', label: '2×' },
                { value: '3', label: '3×' },
              ]}
            />
          </div>
          <div>
            <p className="field-label">JPEG quality</p>
            <Segmented
              size="sm"
              value={jpegQuality >= 0.92 ? 'high' : 'standard'}
              onChange={(v) => setJpegQuality(v === 'high' ? 0.94 : 0.82)}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
        </div>
        <p className="text-[11px] text-white/35">
          Output {outW}×{outH}px · {format.label}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-primary text-[12px]" onClick={() => runImageExport('png')} disabled={busy !== null}>
            {busy === 'png' ? <Spinner className="h-3.5 w-3.5" /> : <IconDownload size={14} />} PNG
          </button>
          <button type="button" className="btn-ghost text-[12px]" onClick={() => runImageExport('jpeg')} disabled={busy !== null}>
            {busy === 'jpeg' ? <Spinner className="h-3.5 w-3.5" /> : <IconDownload size={14} />} JPEG
          </button>
        </div>
        <button type="button" className="btn-ghost w-full text-[12px]" onClick={() => saveCurrent()}>
          Save project before exporting
        </button>
      </PanelSection>

      <PanelSection title="Resize set" description="Re-lays out the same design at each size instead of stretching one bitmap.">
        <div className="space-y-1.5">
          {FORMATS.filter((f) => ['ig-portrait', 'square', 'story', 'fb-landscape'].includes(f.id)).map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-[11.5px] text-white/60">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-black/40 accent-[#d9ae6b]"
                checked={multiFormatIds.includes(f.id)}
                onChange={(e) =>
                  setMultiFormatIds((prev) => (e.target.checked ? [...prev, f.id] : prev.filter((id) => id !== f.id)))
                }
              />
              {f.label}
              <span className="ml-auto text-white/25">
                {f.width}×{f.height}
              </span>
            </label>
          ))}
        </div>
        <button type="button" className="btn-ghost w-full text-[12px]" onClick={runMultiSize} disabled={busy !== null || multiFormatIds.length === 0}>
          {busy === 'multi' ? <Spinner className="h-3.5 w-3.5" /> : <IconDownload size={14} />}
          Export {multiFormatIds.length} PNG sizes
        </button>
      </PanelSection>

      <PanelSection title="Video export">
        <div className="rounded-xl border border-white/[0.008] bg-white/[0.02] px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11.5px] text-white/65">{support.supported ? support.label : 'Not available in this browser'}</span>
            <span className={`chip ${support.supported ? 'border-emerald-400/25 text-emerald-200' : 'border-amber-400/25 text-amber-200'}`}>
              {support.supported ? support.extension.toUpperCase() : 'Off'}
            </span>
          </div>
          {!support.supported ? <p className="mt-1 text-[10.5px] leading-relaxed text-white/35">{support.reason} Use Chrome or Edge on desktop for MP4/WebM recording.</p> : null}
        </div>
        <p className="text-[11px] leading-relaxed text-white/35">
          {design.animation.duration.toFixed(1)}s at {design.animation.fps} fps, 1080px long edge. Recording happens in real time.
        </p>
        {busy === 'video' ? (
          <div className="space-y-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#d9ae6b] transition-[width]" style={{ width: `${Math.round(videoProgress * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-white/40">
              <span>Recording… {Math.round(videoProgress * 100)}%</span>
              <button type="button" className="btn-quiet px-1 text-[10.5px]" onClick={() => abortRef.current?.abort()}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        <button type="button" className="btn-ghost w-full text-[12px]" onClick={runVideo} disabled={busy !== null || !support.supported}>
          {busy === 'video' ? <Spinner className="h-3.5 w-3.5" /> : <IconFilm size={14} />}
          Record {support.supported ? support.extension.toUpperCase() : 'video'}
        </button>
        <PanelHint>
          MP4 is offered only when the browser exposes an H.264 encoder; otherwise WebM is recorded and labelled honestly.
          Frame-by-frame server encoding would need ffmpeg — documented as a limitation in the Guide.
        </PanelHint>
      </PanelSection>

      {notice ? (
        <div
          className={`rounded-xl border px-3 py-2.5 text-[11.5px] leading-relaxed ${
            notice.tone === 'error'
              ? 'border-red-400/30 bg-red-500/10 text-red-100'
              : notice.tone === 'success'
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
                : 'border-white/[0.12] bg-white/[0.04] text-white/70'
          }`}
          role="status"
        >
          {notice.message}
        </div>
      ) : null}

      {history.length ? (
        <PanelSection title="This session">
          <ul className="space-y-1">
            {history.map((item) => (
              <li key={`${item.name}-${item.at}`} className="flex items-center justify-between gap-2 text-[10.5px]">
                <span className="truncate text-white/55">{item.name}</span>
                <span className="shrink-0 text-white/25">{item.sizeLabel}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
      ) : null}
    </div>
  )
}
