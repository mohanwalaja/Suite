import { useEffect, useState } from 'react'
import {
  fetchRemoteProjects,
  pushRemoteProject,
  remoteEnabled,
  remoteLogin,
  remoteLogout,
  remoteMe,
  remoteRegister,
  saveProjectRecord,
  type RemoteUser,
} from '../state/projects'
import { useStudio } from '../state/studio'
import { cx, Spinner } from './ui'
import { IconCheck, IconInfo, IconShield, IconUpload } from './icons'

/**
 * Optional cloud mirror. Only rendered as active when VITE_API_BASE is set and
 * the included PHP backend is deployed. Editing never depends on it; local
 * storage remains the source of truth if the server is unreachable.
 */
export function CloudSync() {
  const { projects, toast } = useStudio()
  const [user, setUser] = useState<RemoteUser | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!remoteEnabled) return
    remoteMe()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  if (!remoteEnabled) {
    return (
      <div className="panel p-4">
        <div className="flex items-center gap-2">
          <IconShield size={15} className="text-white/30" />
          <h2 className="text-[13px] font-medium text-white/80">Cloud sync · off</h2>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-white/35">
          Projects are stored in this browser only. The optional PHP + MySQL backend is included in the repository; set{' '}
          <code className="rounded bg-black/40 px-1 text-white/55">VITE_API_BASE</code> and deploy{' '}
          <code className="rounded bg-black/40 px-1 text-white/55">public/api</code> to enable sign-in and cross-device storage.
        </p>
      </div>
    )
  }

  const submit = async () => {
    setBusy('auth')
    setError(null)
    try {
      const next =
        mode === 'login'
          ? await remoteLogin(email.trim(), password)
          : await remoteRegister(email.trim(), password, name.trim())
      setUser(next)
      setPassword('')
      setNotice(mode === 'login' ? `Signed in as ${next.email}.` : 'Account created.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setBusy(null)
    }
  }

  const pull = async () => {
    setBusy('pull')
    setError(null)
    try {
      const remote = await fetchRemoteProjects()
      let added = 0
      for (const record of remote) {
        if (!record?.design?.id) continue
        saveProjectRecord(record)
        added++
      }
      setNotice(`${added} remote project${added === 1 ? '' : 's'} merged into this browser. Reload to see them.`)
      toast(`Pulled ${added} projects from the cloud.`, 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pull failed.')
    } finally {
      setBusy(null)
    }
  }

  const push = async () => {
    setBusy('push')
    setError(null)
    try {
      let sent = 0
      for (const record of projects) {
        await pushRemoteProject(record)
        sent++
      }
      setNotice(`${sent} project${sent === 1 ? '' : 's'} uploaded to the cloud account.`)
      toast(`Uploaded ${sent} projects.`, 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-medium text-white/80">Cloud sync</h2>
        <span className={cx('chip', user ? 'border-emerald-400/25 text-emerald-200' : '')}>
          <span className={cx('h-1.5 w-1.5 rounded-full', user ? 'bg-emerald-400' : 'bg-white/30')} />
          {user ? 'Signed in' : 'Not signed in'}
        </span>
      </div>

      {!user ? (
        <div className="mt-3 space-y-2">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-black/25 p-1">
            {(['login', 'register'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={cx(
                  'flex-1 rounded-md py-1 text-[11.5px] transition',
                  mode === option ? 'bg-white/[0.12] text-white' : 'text-white/45 hover:text-white/80',
                )}
              >
                {option === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          {mode === 'register' ? (
            <input className="input-sm" placeholder="Name (optional)" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          ) : null}
          <input className="input-sm" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input-sm"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'login' ? 'Password' : 'Password (10+ characters)'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" className="btn-ghost w-full text-[12px]" onClick={submit} disabled={busy !== null || !email || !password}>
            {busy === 'auth' ? <Spinner className="h-3.5 w-3.5" /> : <IconUpload size={14} />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-[11.5px] text-white/50">{user.email}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-ghost text-[11.5px]" onClick={pull} disabled={busy !== null}>
              {busy === 'pull' ? <Spinner className="h-3 w-3" /> : <IconCheck size={13} />} Pull
            </button>
            <button type="button" className="btn-ghost text-[11.5px]" onClick={push} disabled={busy !== null || projects.length === 0}>
              {busy === 'push' ? <Spinner className="h-3 w-3" /> : <IconUpload size={13} />} Upload {projects.length}
            </button>
          </div>
          <button
            type="button"
            className="btn-quiet w-full text-[11px]"
            onClick={async () => {
              await remoteLogout().catch(() => undefined)
              setUser(null)
              setNotice(null)
            }}
          >
            Sign out
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-[11px] leading-relaxed text-red-300">{error}</p> : null}
      {notice ? <p className="mt-2 text-[11px] leading-relaxed text-emerald-200/80">{notice}</p> : null}
      <p className="mt-2 flex gap-1.5 text-[10.5px] leading-relaxed text-white/30">
        <IconInfo size={12} className="mt-0.5 shrink-0" />
        Local storage is never overwritten by a failed sync. Sign-in uses an HttpOnly session cookie; passwords are hashed on the
        server.
      </p>
    </div>
  )
}
