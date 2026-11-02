import type { BrandSpec, DesignSpec } from '../engine/types'
import { DEFAULT_BRAND } from '../engine/presets'

export interface ProjectRecord {
  id: string
  name: string
  design: DesignSpec
  createdAt: number
  updatedAt: number
}

const PROJECTS_KEY = 'astrosivam.projects.v1'
const BRAND_KEY = 'astrosivam.brand.v1'
const PREFS_KEY = 'astrosivam.prefs.v1'

export interface Prefs {
  onboardingDismissed?: boolean
  showSafeArea?: boolean
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn('Local storage write failed', error)
    return false
  }
}

/* ── Local project storage (always available, no account required) ──────── */

export function loadProjects(): ProjectRecord[] {
  const list = readJson<ProjectRecord[]>(PROJECTS_KEY, [])
  return list
    .filter((p) => p && p.design && p.design.id)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveProjects(projects: ProjectRecord[]) {
  return writeJson(PROJECTS_KEY, projects)
}

export function saveProjectRecord(project: ProjectRecord): ProjectRecord[] {
  const projects = loadProjects().filter((p) => p.id !== project.id)
  projects.unshift(project)
  // Keep a bounded local library; very large libraries slow the dashboard.
  saveProjects(projects.slice(0, 120))
  return loadProjects()
}

export function deleteProjectRecord(id: string): ProjectRecord[] {
  const projects = loadProjects().filter((p) => p.id !== id)
  saveProjects(projects)
  return projects
}

export function loadBrand(): BrandSpec {
  return { ...DEFAULT_BRAND, ...readJson<Partial<BrandSpec>>(BRAND_KEY, {}) }
}

export function saveBrand(brand: BrandSpec) {
  return writeJson(BRAND_KEY, brand)
}

export function loadPrefs(): Prefs {
  return readJson<Prefs>(PREFS_KEY, { showSafeArea: false })
}

export function savePrefs(prefs: Prefs) {
  return writeJson(PREFS_KEY, prefs)
}

export function storageUsageBytes(): number {
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('astrosivam.')) continue
      total += (localStorage.getItem(key) ?? '').length * 2
    }
  } catch {
    return 0
  }
  return total
}

/* ── Optional remote adapter (PHP + MySQL backend) ────────────────────────
   Enabled only when VITE_API_BASE is configured. Every call fails softly and
   the UI reports the failure instead of pretending to have synced. */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

export const remoteEnabled = Boolean(API_BASE)

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = ''
    try {
      const parsed = JSON.parse(text) as { error?: string }
      message = parsed.error ?? ''
    } catch {
      message = text.slice(0, 160)
    }
    if (!message) message = res.status === 401 ? 'Sign in is required.' : `Request failed (${res.status}).`
    throw new Error(message)
  }
  return (await res.json()) as T
}

export interface RemoteUser {
  id: number
  email: string
  name: string
}

export async function remoteMe(): Promise<RemoteUser | null> {
  if (!remoteEnabled) return null
  const data = await api<{ user: RemoteUser | null }>('/auth.php?action=me')
  return data.user
}

export async function remoteLogin(email: string, password: string): Promise<RemoteUser> {
  if (!remoteEnabled) throw new Error('Cloud storage is not configured.')
  const data = await api<{ user: RemoteUser }>('/auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function remoteRegister(email: string, password: string, name: string): Promise<RemoteUser> {
  if (!remoteEnabled) throw new Error('Cloud storage is not configured.')
  const data = await api<{ user: RemoteUser }>('/auth.php?action=register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  return data.user
}

export async function remoteLogout(): Promise<void> {
  if (!remoteEnabled) return
  await api('/auth.php?action=logout', { method: 'POST', body: '{}' })
}

export async function fetchRemoteProjects(): Promise<ProjectRecord[]> {
  if (!remoteEnabled) return []
  const data = await api<{ projects: ProjectRecord[] }>('/projects.php?action=list')
  return data.projects ?? []
}

export async function pushRemoteProject(project: ProjectRecord): Promise<void> {
  if (!remoteEnabled) return
  await api('/projects.php?action=save', {
    method: 'POST',
    body: JSON.stringify({ project }),
  })
}

export async function deleteRemoteProject(id: string): Promise<void> {
  if (!remoteEnabled) return
  await api('/projects.php?action=delete', { method: 'POST', body: JSON.stringify({ id }) })
}
