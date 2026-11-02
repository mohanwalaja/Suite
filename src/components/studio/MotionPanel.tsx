import { useStudio } from '../../state/studio'
import { Segmented, Select, Slider, Toggle } from '../ui'
import { PanelHint, PanelSection } from './common'
import { IconDownload, IconPause, IconPlay } from '../icons'

const SCENES = [
  { at: 0, label: 'Backdrop' },
  { at: 0.18, label: 'Artwork' },
  { at: 0.34, label: 'Headline' },
  { at: 0.62, label: 'Details' },
  { at: 0.84, label: 'Hold' },
]

export function MotionPanel({
  playing,
  onTogglePlay,
  time,
  onTimeChange,
  onGoExport,
}: {
  playing: boolean
  onTogglePlay: () => void
  time: number
  onTimeChange: (value: number) => void
  onGoExport: () => void
}) {
  const { design, updateAnimation } = useStudio()
  if (!design) return null
  const a = design.animation
  const duration = Math.max(1, a.duration)
  const progress = Math.min(1, time / duration)

  return (
    <div className="space-y-6">
      <PanelSection>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-primary flex-1 text-[12px]" onClick={onTogglePlay} disabled={!a.enabled}>
            {playing ? <IconPause size={14} /> : <IconPlay size={14} />}
            {playing ? 'Pause preview' : 'Play animation'}
          </button>
          <button type="button" className="btn-ghost text-[12px]" onClick={onGoExport}>
            <IconDownload size={14} /> Export
          </button>
        </div>
        <Toggle
          label="Animation enabled"
          checked={a.enabled}
          onChange={(v) => updateAnimation({ enabled: v })}
          hint="When off, exports and previews show the finished frame."
        />
      </PanelSection>

      <PanelSection title="Timeline">
        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="relative h-12">
            <div className="absolute inset-x-0 top-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#c99a4e]" style={{ width: `${progress * 100}%` }} />
            </div>
            {SCENES.map((scene) => (
              <div key={scene.label} className="absolute top-0" style={{ left: `${scene.at * 100}%` }}>
                <div className="h-4 w-px bg-white/25" />
                <span className="absolute left-1 top-5 whitespace-nowrap text-[9px] uppercase tracking-[0.1em] text-white/30">
                  {scene.label}
                </span>
              </div>
            ))}
            <div className="absolute top-3.5 h-3 w-3 -translate-x-1/2 rounded-full bg-[#e6bd7c] shadow" style={{ left: `${progress * 100}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.05}
            value={Math.min(time, duration)}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="mt-6 w-full accent-[#d9ae6b]"
            aria-label="Timeline position"
          />
          <div className="flex justify-between text-[10px] tabular-nums text-white/35">
            <span>{time.toFixed(2)}s</span>
            <span>{duration.toFixed(1)}s</span>
          </div>
        </div>
        <Slider label="Duration" value={a.duration} min={2} max={20} step={0.5} onChange={(v) => updateAnimation({ duration: v })} format={(v) => `${v.toFixed(1)}s`} />
        <Select
          label="Frame rate (video export)"
          value={String(a.fps)}
          onChange={(v) => updateAnimation({ fps: Number(v) })}
          options={[
            { value: '24', label: '24 fps — cinematic' },
            { value: '30', label: '30 fps — social default' },
            { value: '60', label: '60 fps — smooth, larger file' },
          ]}
        />
      </PanelSection>

      <PanelSection title="Motion behaviour">
        <div>
          <p className="field-label">Easing</p>
          <Segmented
            size="sm"
            value={a.easing}
            onChange={(v) => updateAnimation({ easing: v })}
            options={[
              { value: 'smooth', label: 'Smooth' },
              { value: 'snappy', label: 'Snappy' },
              { value: 'cinematic', label: 'Cinematic' },
            ]}
          />
        </div>
        <div>
          <p className="field-label">Scene transition</p>
          <Segmented
            size="sm"
            value={a.sceneTransition}
            onChange={(v) => updateAnimation({ sceneTransition: v })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade' },
              { value: 'wipe', label: 'Wipe' },
              { value: 'zoom', label: 'Zoom' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Text reveal" checked={a.textReveal} onChange={(v) => updateAnimation({ textReveal: v })} />
          <Toggle label="Particles" checked={a.particles} onChange={(v) => updateAnimation({ particles: v })} />
          <Toggle label="Parallax" checked={a.parallax} onChange={(v) => updateAnimation({ parallax: v })} />
          <Toggle label="Light sweep" checked={a.lightSweep} onChange={(v) => updateAnimation({ lightSweep: v })} />
          <Toggle label="Grain motion" checked={a.grainMotion} onChange={(v) => updateAnimation({ grainMotion: v })} />
          <Toggle label="Loop preview" checked={a.loop} onChange={(v) => updateAnimation({ loop: v })} />
        </div>
      </PanelSection>

      <PanelHint>
        Motion is generated from the same composition tree — blocks animate with real timing, artwork parallaxes, particles are
        seeded, and transitions clip the whole scene. Video export records this canvas in real time; keep the tab in the
        foreground while it runs.
      </PanelHint>
    </div>
  )
}
