import { useStudio } from '../state/studio'
import { IconAlert, IconCheck, IconInfo } from './icons'

const TONE = {
  success: { icon: IconCheck, className: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100' },
  error: { icon: IconAlert, className: 'border-red-400/30 bg-red-500/10 text-red-100' },
  info: { icon: IconInfo, className: 'border-white/15 bg-white/[0.07] text-white/85' },
}

export function ToastStack() {
  const { toasts, dismissToast } = useStudio()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 lg:left-auto lg:right-6 lg:items-end">
      {toasts.map((toast) => {
        const tone = TONE[toast.tone]
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] shadow-xl backdrop-blur-md ${tone.className}`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded p-0.5 text-current opacity-50 hover:opacity-100"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
