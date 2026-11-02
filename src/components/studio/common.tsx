import type { ReactNode } from 'react'
import { cx } from '../ui'

export function PanelSection({
  title,
  description,
  children,
  action,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={cx('space-y-3', className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{title}</h3>
            {description ? <p className="mt-1 text-[11px] leading-relaxed text-white/30">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function PanelHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-white/[0.008] bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-white/35">
      {children}
    </p>
  )
}

export function Swatch({ colors, className }: { colors: string[]; className?: string }) {
  return (
    <span className={cx('flex overflow-hidden rounded-full ring-1 ring-white/15', className)}>
      {colors.map((color, i) => (
        <span key={`${color}-${i}`} className="h-full w-4" style={{ background: color }} />
      ))}
    </span>
  )
}
