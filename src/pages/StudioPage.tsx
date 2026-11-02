import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStudio } from '../state/studio'
import { PosterCanvas } from '../components/PosterCanvas'
import { ContentPanel } from '../components/studio/ContentPanel'
import { TypePanel } from '../components/studio/TypePanel'
import { LayoutPanel } from '../components/studio/LayoutPanel'
import { ArtworkPanel } from '../components/studio/ArtworkPanel'
import { CompositionPanel } from '../components/studio/CompositionPanel'
import { PalettePanel } from '../components/studio/PalettePanel'
import { BrandPanel } from '../components/studio/BrandPanel'
import { MotionPanel } from '../components/studio/MotionPanel'
import { ExportPanel } from '../components/studio/ExportPanel'
import { NewPosterModal } from '../components/NewPosterModal'
import { FORMATS, formatLabel, resolveFormat } from '../engine/formats'
import { withFormat } from '../engine/presets'
import { getComposition } from '../engine/compositions'
import { loadAssets } from '../lib/canvas'
import type { RenderAssets } from '../engine/types'
import { cx, EmptyState, IconButton, Modal } from '../components/ui'
import {
  IconArrowLeft,
  IconDownload,
  IconFilm,
  IconImage,
  IconLayers,
  IconPause,
  IconPlay,
  IconPlus,
  IconRedo,
  IconRefresh,
  IconSave,
  IconSliders,
  IconSparkles,
  IconType,
  IconUndo,
} from '../components/icons'

type LeftTab = 'content' | 'type' | 'layout' | 'art'
type RightTab = 'layouts' | 'palette' | 'brand' | 'motion' | 'export'
type MobileTab = LeftTab | RightTab

const LEFT_TABS: Array<{ id: LeftTab; label: string; icon: ReactNode }> = [
  { id: 'content', label: 'Content', icon: <IconType size={13} /> },
  { id: 'type', label: 'Type', icon: <IconType size={13} /> },
  { id: 'layout', label: 'Layout', icon: <IconSliders size={13} /> },
  { id: 'art', label: 'Artwork', icon: <IconImage size={13} /> },
]

const RIGHT_TABS: Array<{ id: RightTab; label: string; icon: ReactNode }> = [
  { id: 'layouts', label: 'Layouts', icon: <IconLayers size={13} /> },
  { id: 'palette', label: 'Palette', icon: <IconSparkles size={13} /> },
  { id: 'brand', label: 'Brand', icon: <IconSparkles size={13} /> },
  { id: 'motion', label: 'Motion', icon: <IconFilm size={13} /> },
  { id: 'export', label: 'Export', icon: <IconDownload size={13} /> },
]

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export default function StudioPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const {
    design,
    projects,
    report,
    setReport,
    setDesign,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
    saveCurrent,
    regenerate,
    prefs,
    setPrefs,
    toast,
  } = useStudio()
  const [leftTab, setLeftTab] = useState<LeftTab>('content')
  const [rightTab, setRightTab] = useState<RightTab>('layouts')
  const [mobileTab, setMobileTab] = useState<MobileTab>('content')
  const [playing, setPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const [assets, setAssets] = useState<RenderAssets>({})
  const [newPosterOpen, setNewPosterOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const lastLoaded = useRef<string | null>(null)

  // Load the requested project exactly once (or when the URL changes).
  useEffect(() => {
    if (!projectId) {
      lastLoaded.current = null
      return
    }
    if (design?.id === projectId) return
    if (lastLoaded.current === projectId) return
    const record = projects.find((p) => p.id === projectId)
    if (record) {
      setDesign(record.design)
      lastLoaded.current = projectId
      setPlaying(false)
      setPlayhead(0)
    }
  }, [projectId, projects, design, setDesign])

  // Keep the URL in sync when a brand-new design is created from the empty state.
  useEffect(() => {
    if (!projectId && design) navigate(`/studio/${design.id}`, { replace: true })
  }, [projectId, design, navigate])

  useEffect(() => {
    let alive = true
    if (!design) return
    loadAssets(design).then((next) => {
      if (alive) setAssets(next)
    })
    return () => {
      alive = false
    }
  }, [design?.brand.logoDataUrl, design?.art.mode, design?.art.uploadDataUrl, design?.art.providerImageDataUrl])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveCurrent()
      } else if (event.code === 'Space') {
        event.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, saveCurrent])

  const composition = design ? getComposition(design.compositionId) : null
  const format = design ? resolveFormat(design) : null
  const blocking = report?.issues.filter((i) => i.severity === 'error').length ?? 0
  const warnings = report?.issues.filter((i) => i.severity === 'warning').length ?? 0

  const mobileTabs = useMemo(() => [...LEFT_TABS, ...RIGHT_TABS], [])

  const openExport = () => {
    setPlaying(false)
    if (isDesktop) setRightTab('export')
    else setMobileTab('export')
  }

  const renderPanel = (key: MobileTab) => {
    switch (key) {
      case 'content':
        return <ContentPanel />
      case 'type':
        return <TypePanel />
      case 'layout':
        return <LayoutPanel />
      case 'art':
        return <ArtworkPanel />
      case 'layouts':
        return <CompositionPanel />
      case 'palette':
        return <PalettePanel />
      case 'brand':
        return <BrandPanel />
      case 'motion':
        return (
          <MotionPanel
            playing={playing}
            onTogglePlay={() => {
              if (!design?.animation.enabled) {
                toast('Enable animation in Motion settings first.', 'info')
                return
              }
              setPlaying((p) => !p)
            }}
            time={playhead}
            onTimeChange={(value) => {
              setPlaying(false)
              setPlayhead(value)
            }}
            onGoExport={openExport}
          />
        )
      case 'export':
        return <ExportPanel />
      default:
        return null
    }
  }

  if (!design) {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-16">
        <EmptyState
          title="Nothing open in the studio"
          description="Create a poster to start from a category, or open one of your saved projects from the library."
          icon={<IconSparkles size={30} />}
          action={
            <div className="mt-1 flex gap-2">
              <button type="button" className="btn-primary" onClick={() => setNewPosterOpen(true)}>
                <IconPlus size={15} /> New poster
              </button>
              <Link to="/projects" className="btn-ghost">
                Open library
              </Link>
            </div>
          }
        />
        <NewPosterModal open={newPosterOpen} onClose={() => setNewPosterOpen(false)} />
      </div>
    )
  }

  const toolbar = (
    <header className="flex h-[54px] shrink-0 items-center gap-2 border-b border-white/[0.008] bg-[#0a0a0e]/90 px-2.5 backdrop-blur-xl sm:px-4">
      <IconButton label="Back to dashboard" onClick={() => navigate('/')}>
        <IconArrowLeft size={17} />
      </IconButton>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          className="block max-w-full truncate text-left text-[13px] font-medium text-white/90 hover:text-white"
          onClick={() => {
            setRenameValue(design.name)
            setRenameOpen(true)
          }}
          title="Rename project"
        >
          {design.name}
        </button>
        <p className="truncate text-[10.5px] text-white/35">
          {composition?.meta.name} · {format ? `${format.width}×${format.height}` : ''} · {formatLabel(design.width, design.height)}
        </p>
      </div>

      <div className="hidden items-center gap-0.5 sm:flex">
        <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
          <IconUndo size={17} />
        </IconButton>
        <IconButton label="Redo (Shift+Ctrl+Z)" onClick={redo} disabled={!canRedo}>
          <IconRedo size={17} />
        </IconButton>
        <IconButton label="Regenerate composition" onClick={() => regenerate({ keepPalette: true })}>
          <IconRefresh size={17} />
        </IconButton>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <IconButton label={playing ? 'Pause animation' : 'Play animation'} onClick={() => setPlaying((p) => !p)}>
          {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
        </IconButton>
      </div>

      <button type="button" className="btn-ghost h-8 px-2.5 text-[11.5px] sm:hidden" onClick={() => saveCurrent()} aria-label="Save">
        <IconSave size={15} />
      </button>
      <button type="button" className="btn-ghost hidden h-8 px-2.5 text-[11.5px] sm:inline-flex" onClick={() => saveCurrent()}>
        <IconSave size={14} /> Save
      </button>
      <button type="button" className="btn-primary h-8 px-2.5 text-[11.5px]" onClick={openExport}>
        <IconDownload size={14} /> <span className="hidden sm:inline">Export</span>
      </button>
    </header>
  )

  const previewArea = (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]">
      <div className={cx('flex min-h-0 flex-1 items-center justify-center p-3 sm:p-5', !isDesktop && 'max-h-[46dvh]')}>
        <PosterCanvas
          design={design}
          assets={assets}
          playing={playing}
          time={playhead}
          showSafe={Boolean(prefs.showSafeArea)}
          onReport={setReport}
          onTime={setPlayhead}
          interactiveArt
          onArtOffset={({ x, y }) =>
            update((d) => ({ ...d, art: { ...d.art, offsetX: x, offsetY: y } }), { coalesce: 'art-offset' })
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.008] bg-black/20 px-2.5 py-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {FORMATS.filter((f) => ['ig-portrait', 'square', 'story', 'fb-landscape'].includes(f.id)).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => update((d) => withFormat(d, f.id))}
              className={cx(
                'flex h-7 items-center gap-1 rounded-md px-2 text-[10.5px] transition',
                design.formatId === f.id ? 'bg-white/[0.12] text-white' : 'text-white/40 hover:bg-white/[0.06] hover:text-white/75',
              )}
              title={`${f.label} · ${f.width}×${f.height}`}
            >
              {f.short}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
        <button
          type="button"
          onClick={() => setPrefs({ showSafeArea: !prefs.showSafeArea })}
          className={cx('h-7 rounded-md px-2 text-[10.5px] transition', prefs.showSafeArea ? 'bg-cyan-400/15 text-cyan-100' : 'text-white/40 hover:text-white/70')}
        >
          Safe area
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[10.5px] text-white/45 transition hover:bg-white/[0.06] hover:text-white/80"
        >
          {playing ? <IconPause size={12} /> : <IconPlay size={12} />} {playing ? 'Pause' : 'Preview motion'}
        </button>
        <div className="ml-auto flex items-center gap-2 text-[10.5px]">
          <span className={cx('tabular-nums', blocking ? 'text-red-300' : warnings ? 'text-amber-200' : 'text-white/35')}>
            {report ? `${blocking} blocking · ${warnings} warnings` : 'Not checked'}
          </span>
          <span className="hidden text-white/20 sm:inline">{playing ? 'live' : 'static frame'}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {toolbar}

      {isDesktop ? (
        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_336px] xl:grid-cols-[320px_minmax(0,1fr)_352px]">
          <aside className="flex min-h-0 flex-col border-r border-white/[0.008] bg-[#0a0a0d]">
            <div className="flex shrink-0 gap-1 border-b border-white/[0.008] px-2 py-2">
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={cx('tab flex-1 justify-center', leftTab === tab.id && 'tab-active')}
                  onClick={() => setLeftTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3.5 py-4">{renderPanel(leftTab)}</div>
          </aside>

          <main className="flex min-h-0 flex-col">{previewArea}</main>

          <aside className="flex min-h-0 flex-col border-l border-white/[0.008] bg-[#0a0a0d]">
            <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/[0.008] px-2 py-2 no-scrollbar">
              {RIGHT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={cx('tab flex-1 justify-center px-2', rightTab === tab.id && 'tab-active')}
                  onClick={() => setRightTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3.5 py-4">{renderPanel(rightTab)}</div>
          </aside>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {previewArea}
          <div className="flex shrink-0 gap-1 overflow-x-auto border-y border-white/[0.008] bg-[#0a0a0d] px-2 py-1.5 no-scrollbar">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cx('tab shrink-0', mobileTab === tab.id && 'tab-active')}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-[#08080b] px-4 py-4 pb-24">{renderPanel(mobileTab)}</div>
        </div>
      )}

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename project"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const name = renameValue.trim() || design.name
                update({ name })
                saveCurrent(name)
                setRenameOpen(false)
              }}
            >
              Save name
            </button>
          </div>
        }
      >
        <input
          className="input"
          value={renameValue}
          maxLength={60}
          onChange={(e) => setRenameValue(e.target.value)}
          placeholder="Poster name"
          autoFocus
        />
        <p className="mt-2 text-[11.5px] text-white/35">The filename used for exports is derived from this name.</p>
      </Modal>
    </div>
  )
}
