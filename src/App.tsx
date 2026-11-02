import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastStack } from './components/ToastStack'
import { StudioProvider } from './state/studio'
import { fontsReady } from './lib/fonts'
import DashboardPage from './pages/DashboardPage'
import StudioPage from './pages/StudioPage'
import ProjectsPage from './pages/ProjectsPage'
import ServicesPage from './pages/ServicesPage'
import BrandPage from './pages/BrandPage'
import DocsPage from './pages/DocsPage'
import NotFoundPage from './pages/NotFoundPage'

function Splash() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-pulse rounded-full border border-[#c99a4e]/40" />
        <div className="absolute inset-2 rounded-full border border-[#c99a4e]/25" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-lg text-[#d9ae6b]">A</div>
      </div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">Preparing the studio</p>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timeout = window.setTimeout(() => !cancelled && setReady(true), 2600)
    fontsReady().finally(() => {
      if (!cancelled) {
        window.clearTimeout(timeout)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [])

  if (!ready) return <Splash />

  return (
    <StudioProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="studio" element={<StudioPage />} />
          <Route path="studio/:projectId" element={<StudioPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="brand" element={<BrandPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
      <ToastStack />
    </StudioProvider>
  )
}
