import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
  trailing,
}: {
  label: string
  hint?: string
  children: ReactNode
  htmlFor?: string
  trailing?: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="field-label mb-0" htmlFor={htmlFor}>
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] leading-snug text-white/35">{hint}</p> : null}
    </div>
  )
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
  rows,
  maxLength,
  id,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  maxLength?: number
  id?: string
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Field label={label} hint={hint} htmlFor={fieldId} trailing={maxLength ? <span className="text-[10px] text-white/25">{value.length}/{maxLength}</span> : undefined}>
      {multiline ? (
        <textarea
          id={fieldId}
          className="textarea"
          style={{ minHeight: rows ? rows * 24 : undefined }}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={fieldId}
          className="input"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  hint?: string
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="field-label mb-0">
          {label}
        </label>
        <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] tabular-nums text-white/70">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="h-6 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#d9ae6b] [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/15 [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d9ae6b]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <p className="text-[11px] text-white/35">{hint}</p> : null}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  full = true,
}: {
  options: Array<{ value: T; label: string; icon?: ReactNode; title?: string }>
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  full?: boolean
}) {
  return (
    <div
      role="group"
      className={cx(
        'flex gap-1 rounded-xl border border-white/10 bg-black/25 p-1',
        full ? 'w-full' : 'w-auto',
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            title={option.title ?? option.label}
            onClick={() => onChange(option.value)}
            className={cx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg text-center transition',
              size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-[12px]',
              active ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/45 hover:text-white/80',
            )}
            aria-pressed={active}
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-white/[0.008] bg-white/[0.02] px-3 py-2.5">
      <span>
        <span className="block text-[13px] text-white/85">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] leading-snug text-white/35">{hint}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-white/15 transition peer-checked:bg-[#c99a4e]" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  hint?: string
}) {
  const id = useId()
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className="input appearance-none pr-8" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#141419]">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15" style={{ background: safe }}>
          <input
            id={id}
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label} colour picker`}
          />
        </span>
        <input
          className="input-sm font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/[0.12] bg-[#101014] shadow-2xl sm:rounded-3xl',
          wide ? 'sm:max-w-4xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.008] px-5 py-4">
          <div>
            <h2 className="font-display text-lg text-white">{title}</h2>
            {description ? <p className="mt-1 text-[12px] leading-relaxed text-white/45">{description}</p> : null}
          </div>
          <button type="button" className="btn-quiet -mr-1 rounded-full p-1.5" onClick={onClose} aria-label="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-white/[0.008] bg-black/20 px-5 py-3.5">{footer}</div> : null}
      </div>
    </div>
  )
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-30',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-1 text-xl font-medium text-white/90">{value}</p>
      {hint ? <p className="text-[11px] text-white/30">{hint}</p> : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon ? <div className="text-white/25">{icon}</div> : null}
      <h3 className="text-[15px] font-medium text-white/85">{title}</h3>
      <p className="max-w-sm text-[12.5px] leading-relaxed text-white/40">{description}</p>
      {action}
    </div>
  )
}

export function Disclosure({ summary, children, defaultOpen }: { summary: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className="rounded-xl border border-white/[0.008] bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[12.5px] font-medium text-white/75"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {summary}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cx('transition', open && 'rotate-180')}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? <div className="space-y-3 border-t border-white/[0.008] px-3 py-3">{children}</div> : null}
    </div>
  )
}

export function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url
}

export function Spinner({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={cx('animate-spin', className)} style={style} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
