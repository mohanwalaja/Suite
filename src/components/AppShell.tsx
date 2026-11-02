import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cx } from './ui'
import { IconBook, IconGrid, IconHome, IconPalette, IconServices, IconSparkles } from './icons'
import { useStudio } from '../state/studio'
import { storageUsageBytes } from '../state/projects'

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconHome, end: true },
  { to: '/studio', label: 'Studio', icon: IconSparkles },
  { to: '/projects', label: 'Projects', icon: IconGrid },
  { to: '/services', label: 'Services', icon: IconServices },
  { to: '/brand', label: 'Brand', icon: IconPalette },
  { to: '/docs', label: 'Guide', icon: IconBook },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#c99a4e]/35 bg-gradient-to-br from-[#241d14] to-[#0d0c0a]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3.5 19.5 20h-3.2l-1.5-3.6H9.2L7.7 20H4.5z" stroke="#d9ae6b" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M10.3 13.4h3.4L12 9.9z" fill="#d9ae6b" fillOpacity="0.55" />
          <circle cx="12" cy="3.5" r="1" fill="#d9ae6b" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] tracking-[0.02em] text-white/95">Astro Sivam</span>
        <span className="block text-[9.5px] uppercase tracking-[0.26em] text-white/35">Creative Studio</span>
      </span>
    </div>
  )
}

export function AppShell() {
  const { projects, design } = useStudio()
  const location = useLocation()
  const inStudio = location.pathname.startsWith('/studio')
  const usage = typeof window === 'undefined' ? 0 : storageUsageBytes()

  return (
    <div className="flex min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[228px] shrink-0 flex-col justify-between border-r border-white/[0.008] bg-black/25 px-4 py-5 lg:flex">
        <div>
          <NavLink to="/" className="block rounded-xl px-1 py-1">
            <BrandMark />
          </NavLink>

          <nav className="mt-7 space-y-1" aria-label="Primary">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition',
                      isActive
                        ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/85',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className={isActive ? 'text-[#d9ae6b]' : 'text-white/40 group-hover:text-white/70'} />
                      <span className="flex-1">{item.label}</span>
                      {item.to === '/projects' && projects.length > 0 ? (
                        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums text-white/55">
                          {projects.length}
                        </span>
                      ) : null}
                      {item.to === '/studio' && design ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d9ae6b]" aria-hidden="true" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-white/[0.008] bg-white/[0.02] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Working file</p>
            <p className="mt-1 truncate text-[12.5px] text-white/75">{design ? design.name : 'Nothing open yet'}</p>
            <p className="mt-1 text-[11px] leading-snug text-white/30">
              {design ? `${design.formatId.replace('ig-', 'IG ')} · ${design.compositionId}` : 'Start from a category to open the editor.'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[10.5px] text-white/30">
            <span>Local storage</span>
            <span className="tabular-nums">{(usage / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#c99a4e]/70"
              style={{ width: `${Math.min(100, (usage / (5 * 1024 * 1024)) * 100)}%` }}
            />
          </div>
          <p className="text-[10.5px] leading-relaxed text-white/25">
            Projects live in this browser. Export posters to keep them forever.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.008] bg-[#08080b]/85 px-4 backdrop-blur-xl lg:hidden">
          <NavLink to="/">
            <BrandMark />
          </NavLink>
          <NavLink to="/studio" className="btn-ghost h-9 px-3 text-[12px]">
            Open studio
          </NavLink>
        </header>

        <main className={cx('min-w-0 flex-1', inStudio ? '' : 'pb-20 lg:pb-0')}>
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        {!inStudio ? (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 safe-bottom border-t border-white/10 bg-[#0b0b0f]/95 backdrop-blur-xl lg:hidden"
            aria-label="Primary"
          >
            <div className="mx-auto grid max-w-lg grid-cols-6">
              {NAV.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cx(
                        'flex flex-col items-center gap-1 px-0.5 pb-2 pt-2.5 text-[9px] transition',
                        isActive ? 'text-[#d9ae6b]' : 'text-white/40',
                      )
                    }
                  >
                    <Icon size={19} />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
