import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[64px] leading-none text-white/15">404</p>
      <h1 className="mt-3 font-display text-2xl text-white">That page is not in the studio</h1>
      <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-white/40">
        The link may be out of date. Head back to the dashboard or open your project library.
      </p>
      <div className="mt-5 flex gap-2">
        <Link to="/" className="btn-primary">
          Dashboard
        </Link>
        <Link to="/projects" className="btn-ghost">
          Projects
        </Link>
      </div>
    </div>
  )
}
