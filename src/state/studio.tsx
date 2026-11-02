import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { BrandSpec, DesignSpec, RenderReport } from '../engine/types'
import { createDesign, regenerateDesign, DEFAULT_BRAND } from '../engine/presets'
import {
  deleteProjectRecord,
  loadBrand,
  loadPrefs,
  loadProjects,
  saveBrand,
  savePrefs,
  saveProjectRecord,
  type Prefs,
  type ProjectRecord,
} from './projects'

export interface Toast {
  id: number
  tone: 'success' | 'error' | 'info'
  message: string
}

interface StudioContextValue {
  design: DesignSpec | null
  brand: BrandSpec
  projects: ProjectRecord[]
  report: RenderReport | null
  prefs: Prefs
  canUndo: boolean
  canRedo: boolean
  toasts: Toast[]
  lastCompositionIds: string[]
  update: (patch: Partial<DesignSpec> | ((design: DesignSpec) => DesignSpec), opts?: { coalesce?: string }) => void
  updateContent: (patch: Partial<DesignSpec['content']>) => void
  updateTypography: (patch: Partial<DesignSpec['typography']>) => void
  updateLayout: (patch: Partial<DesignSpec['layout']>) => void
  updateAnimation: (patch: Partial<DesignSpec['animation']>) => void
  updateArt: (patch: Partial<DesignSpec['art']>) => void
  updateBrand: (patch: Partial<BrandSpec>) => void
  setDesign: (design: DesignSpec | null) => void
  setReport: (report: RenderReport | null) => void
  undo: () => void
  redo: () => void
  resetDesign: () => void
  duplicateDesign: () => void
  regenerate: (opts?: { keepPalette?: boolean; keepFonts?: boolean }) => void
  openProject: (id: string) => DesignSpec | null
  createProject: (options?: Parameters<typeof createDesign>[0]) => DesignSpec
  saveCurrent: (name?: string) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => void
  setPrefs: (patch: Partial<Prefs>) => void
  toast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
  clearHistory: () => void
}

const StudioContext = createContext<StudioContextValue | null>(null)

interface HistoryEntry {
  design: DesignSpec
  coalesce?: string
  at: number
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [design, setDesignState] = useState<DesignSpec | null>(null)
  const designRef = useRef<DesignSpec | null>(null)
  const [brand, setBrandState] = useState<BrandSpec>(() => (typeof window === 'undefined' ? DEFAULT_BRAND : loadBrand()))
  const [projects, setProjects] = useState<ProjectRecord[]>(() => (typeof window === 'undefined' ? [] : loadProjects()))
  const [report, setReport] = useState<RenderReport | null>(null)
  const [prefs, setPrefsState] = useState<Prefs>(() => (typeof window === 'undefined' ? {} : loadPrefs()))
  const [toasts, setToasts] = useState<Toast[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [future, setFuture] = useState<DesignSpec[]>([])
  const [lastCompositionIds, setLastCompositionIds] = useState<string[]>([])
  const historyRef = useRef<HistoryEntry[]>([])
  const futureRef = useRef<DesignSpec[]>([])
  const toastId = useRef(1)
  const savedIds = useRef<Set<string>>(new Set())

  // Mirror the persisted library so autosave only touches designs the user has
  // already saved, and never writes on every keystroke of an unsaved draft.
  useEffect(() => {
    savedIds.current = new Set(projects.map((p) => p.id))
  }, [projects])

  const toast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = toastId.current++
    setToasts((prev) => [...prev.slice(-3), { id, tone, message }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5200)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const pushHistory = useCallback((prev: DesignSpec | null, coalesce?: string) => {
    if (!prev) return
    const now = Date.now()
    const current = historyRef.current
    const last = current[current.length - 1]
    if (coalesce && last && last.coalesce === coalesce && now - last.at < 700) return
    const next = [...current.slice(-59), { design: prev, coalesce, at: now }]
    historyRef.current = next
    setHistory(next)
    futureRef.current = []
    setFuture([])
  }, [])

  const commit = useCallback(
    (next: DesignSpec, opts: { coalesce?: string; skipHistory?: boolean } = {}) => {
      const prev = designRef.current
      if (!opts.skipHistory) pushHistory(prev, opts.coalesce)
      designRef.current = next
      setDesignState(next)
    },
    [pushHistory],
  )

  const update = useCallback<StudioContextValue['update']>(
    (patch, opts) => {
      const prev = designRef.current
      if (!prev) return
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      if (JSON.stringify(next) === JSON.stringify(prev)) return
      commit({ ...next, updatedAt: Date.now() }, opts)
    },
    [commit],
  )

  const updateContent = useCallback(
    (patch: Partial<DesignSpec['content']>) =>
      update((d) => ({ ...d, content: { ...d.content, ...patch } }), { coalesce: 'content' }),
    [update],
  )
  const updateTypography = useCallback(
    (patch: Partial<DesignSpec['typography']>) =>
      update((d) => ({ ...d, typography: { ...d.typography, ...patch } }), { coalesce: 'typography' }),
    [update],
  )
  const updateLayout = useCallback(
    (patch: Partial<DesignSpec['layout']>) =>
      update((d) => ({ ...d, layout: { ...d.layout, ...patch } }), { coalesce: 'layout' }),
    [update],
  )
  const updateAnimation = useCallback(
    (patch: Partial<DesignSpec['animation']>) =>
      update((d) => ({ ...d, animation: { ...d.animation, ...patch } }), { coalesce: 'animation' }),
    [update],
  )
  const updateArt = useCallback(
    (patch: Partial<DesignSpec['art']>) => update((d) => ({ ...d, art: { ...d.art, ...patch } }), { coalesce: 'art' }),
    [update],
  )

  const updateBrand = useCallback((patch: Partial<BrandSpec>) => {
    setBrandState((prev) => {
      const next = { ...prev, ...patch }
      saveBrand(next)
      return next
    })
  }, [])

  const setDesign = useCallback((next: DesignSpec | null) => {
    designRef.current = next
    setDesignState(next)
    historyRef.current = []
    futureRef.current = []
    setHistory([])
    setFuture([])
    setReport(null)
    if (next) setLastCompositionIds((ids) => [next.compositionId, ...ids].slice(0, 6))
  }, [])

  const undo = useCallback(() => {
    const h = historyRef.current
    const current = designRef.current
    if (h.length === 0 || !current) return
    const entry = h[h.length - 1]
    futureRef.current = [current, ...futureRef.current].slice(0, 60)
    setFuture(futureRef.current)
    historyRef.current = h.slice(0, -1)
    setHistory(historyRef.current)
    designRef.current = entry.design
    setDesignState(entry.design)
  }, [])

  const redo = useCallback(() => {
    const f = futureRef.current
    const current = designRef.current
    if (f.length === 0 || !current) return
    const [next, ...rest] = f
    const h = [...historyRef.current.slice(-59), { design: current, at: Date.now() }]
    historyRef.current = h
    setHistory(h)
    futureRef.current = rest
    setFuture(rest)
    designRef.current = next
    setDesignState(next)
  }, [])

  const resetDesign = useCallback(() => {
    const prev = designRef.current
    if (!prev) return
    const fresh = createDesign({
      categoryId: prev.categoryId,
      formatId: prev.formatId,
      compositionId: prev.compositionId,
      paletteId: prev.paletteId,
      motifId: prev.art.motifId,
      seed: 7,
    })
    commit(
      { ...fresh, id: prev.id, name: prev.name, brand: prev.brand, createdAt: prev.createdAt },
      { coalesce: 'reset' },
    )
    toast('Design reset to this composition’s defaults.', 'info')
  }, [commit, toast])

  const duplicateDesign = useCallback(() => {
    const prev = designRef.current
    if (!prev) return
    const copy: DesignSpec = {
      ...structuredClone(prev),
      id: `dsg_${Math.random().toString(36).slice(2, 10)}`,
      name: `${prev.name} copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    commit(copy, { coalesce: 'duplicate' })
    toast('Design duplicated — save it to add the copy to your library.', 'success')
  }, [commit, toast])

  const regenerate = useCallback<StudioContextValue['regenerate']>(
    (opts) => {
      const prev = designRef.current
      if (!prev) return
      const next = regenerateDesign(prev, {
        recent: lastCompositionIds as never,
        ...opts,
      })
      commit(next, { coalesce: 'regenerate' })
      setLastCompositionIds((ids) => [next.compositionId, ...ids].slice(0, 6))
      toast('New composition generated — layout, artwork and typography changed.', 'success')
    },
    [lastCompositionIds, commit, toast],
  )

  const openProject = useCallback(
    (id: string) => {
      const record = projects.find((p) => p.id === id)
      if (!record) return null
      setDesign(record.design)
      return record.design
    },
    [projects, setDesign],
  )

  const createProject = useCallback<StudioContextValue['createProject']>(
    (options) => {
      const base = createDesign({ ...options, seed: options?.seed ?? Math.floor(Math.random() * 99999) })
      const withBrand: DesignSpec = {
        ...base,
        brand: {
          ...brand,
          cta: base.content.cta || brand.cta,
          website: base.content.website || brand.website,
        },
      }
      const saved = saveProjectRecord({
        id: base.id,
        name: base.name,
        design: withBrand,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      setProjects(saved)
      savedIds.current.add(base.id)
      setDesign(withBrand)
      setLastCompositionIds((ids) => [base.compositionId, ...ids].slice(0, 6))
      return withBrand
    },
    [brand, setDesign],
  )

  const saveCurrent = useCallback(
    (name?: string) => {
      const current = designRef.current
      if (!current) return
      const project: ProjectRecord = {
        id: current.id,
        name: name ?? current.name,
        design: { ...current, name: name ?? current.name },
        createdAt: projects.find((p) => p.id === current.id)?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      }
      const next = saveProjectRecord(project)
      setProjects(next)
      savedIds.current.add(project.id)
      designRef.current = project.design
      setDesignState(project.design)
      if (next.some((p) => p.id === project.id)) toast('Project saved to this browser.', 'success')
      else toast('Could not save — local storage may be full. Export to keep a copy.', 'error')
    },
    [projects, toast],
  )

  const deleteProject = useCallback(
    (id: string) => {
      setProjects(deleteProjectRecord(id))
      savedIds.current.delete(id)
      toast('Project deleted.', 'info')
    },
    [toast],
  )

  const duplicateProject = useCallback(
    (id: string) => {
      const record = projects.find((p) => p.id === id)
      if (!record) return
      const newId = `dsg_${Math.random().toString(36).slice(2, 10)}`
      const copy: ProjectRecord = {
        id: newId,
        name: `${record.name} copy`,
        design: { ...structuredClone(record.design), id: newId, name: `${record.name} copy` },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setProjects(saveProjectRecord(copy))
      toast('Duplicated into your library.', 'success')
    },
    [projects, toast],
  )

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch }
      savePrefs(next)
      return next
    })
  }, [])

  // Autosave an already-saved design a few seconds after edits stop.
  useEffect(() => {
    if (!design) return
    if (!savedIds.current.has(design.id)) return
    const timer = window.setTimeout(() => {
      const current = designRef.current
      if (!current) return
      setProjects((prev) => {
        const existing = prev.find((p) => p.id === current.id)
        return saveProjectRecord({
          id: current.id,
          name: current.name,
          design: current,
          createdAt: existing?.createdAt ?? Date.now(),
          updatedAt: Date.now(),
        })
      })
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [design])

  const clearHistory = useCallback(() => {
    historyRef.current = []
    futureRef.current = []
    setHistory([])
    setFuture([])
  }, [])

  const value = useMemo<StudioContextValue>(
    () => ({
      design,
      brand,
      projects,
      report,
      prefs,
      canUndo: history.length > 0,
      canRedo: future.length > 0,
      toasts,
      lastCompositionIds,
      update,
      updateContent,
      updateTypography,
      updateLayout,
      updateAnimation,
      updateArt,
      updateBrand,
      setDesign,
      setReport,
      undo,
      redo,
      resetDesign,
      duplicateDesign,
      regenerate,
      openProject,
      createProject,
      saveCurrent,
      deleteProject,
      duplicateProject,
      setPrefs,
      toast,
      dismissToast,
      clearHistory,
    }),
    [
      design,
      brand,
      projects,
      report,
      prefs,
      history.length,
      future.length,
      toasts,
      lastCompositionIds,
      update,
      updateContent,
      updateTypography,
      updateLayout,
      updateAnimation,
      updateArt,
      updateBrand,
      setDesign,
      undo,
      redo,
      resetDesign,
      duplicateDesign,
      regenerate,
      openProject,
      createProject,
      saveCurrent,
      deleteProject,
      duplicateProject,
      setPrefs,
      toast,
      dismissToast,
      clearHistory,
    ],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider')
  return ctx
}
