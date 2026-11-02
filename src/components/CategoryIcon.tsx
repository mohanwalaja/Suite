import type { SVGProps } from 'react'

/**
 * Abstract line marks for each studio category. Deliberately geometric — they
 * are navigation icons, not religious artwork, and are never used on posters.
 */
export function CategoryIcon({ name, size = 18, ...props }: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
  switch (name) {
    case 'chart':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18" />
        </svg>
      )
    case 'rings':
      return (
        <svg {...common}>
          <circle cx="9.2" cy="14" r="5.4" />
          <circle cx="14.8" cy="14" r="5.4" />
          <path d="M12 4.2 9.6 7h4.8z" />
        </svg>
      )
    case 'letters':
      return (
        <svg {...common}>
          <path d="M4 19 8.5 5l4.5 14M5.6 15h5.8" />
          <path d="M16 19V9.5h2.6a2.7 2.7 0 0 1 0 5.4H16" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
        </svg>
      )
    case 'planets':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.4" />
          <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-24 12 12)" />
          <circle cx="19" cy="6.5" r="1.2" />
        </svg>
      )
    case 'services':
      return (
        <svg {...common}>
          <path d="M4 8.5h16M6.5 8.5V19h11V8.5M9.5 8.5V5h5v3.5" />
          <path d="M10 12.5v3M14 12.5v3" />
        </svg>
      )
    case 'murugan':
      return (
        <svg {...common}>
          <path d="M12 3c1.2 4 1.2 7 0 11-1.2-4-1.2-7 0-11z" />
          <path d="M9 20c0-3 1.3-5.2 3-6 1.7.8 3 3 3 6" />
          <path d="M7 20h10" />
        </svg>
      )
    case 'shiva':
      return (
        <svg {...common}>
          <path d="M12 4v16M7.5 8.5h9" />
          <path d="M7.5 8.5c0 3 1.8 4.5 4.5 4.5s4.5-1.5 4.5-4.5" />
          <path d="M8 20c1-1.4 2.4-2 4-2s3 .6 4 2" />
        </svg>
      )
    case 'ganesha':
      return (
        <svg {...common}>
          <path d="M5.5 9c3-3 6-3.4 9-2.4 2.4.8 4 2.6 4 5.1 0 3.2-2.6 5.3-6.5 5.3S5.5 14.7 5.5 11V9z" />
          <path d="M9 6.5C9 4.6 10.3 3 12 3s3 1.6 3 3.5" />
          <path d="M10.5 12.2c.6 1 2.4 1 3 0" />
        </svg>
      )
    case 'durga':
      return (
        <svg {...common}>
          <path d="M12 3.5 5 7v5c0 4 2.9 7 7 8.5 4.1-1.5 7-4.5 7-8.5V7z" />
          <path d="M9.2 12.2c.7 1.7 1.6 2.6 2.8 3 1.2-.4 2.1-1.3 2.8-3" />
          <circle cx="12" cy="10" r="1.4" />
        </svg>
      )
    case 'festival':
      return (
        <svg {...common}>
          <path d="M12 3.5c2.4 2.1 3.4 4.1 3.4 5.9A3.4 3.4 0 0 1 12 12a3.4 3.4 0 0 1-3.4-2.6c0-1.8 1-3.8 3.4-5.9z" />
          <path d="M9.5 20h5l-1-6h-3z" />
          <path d="M8 15.5h8" />
        </svg>
      )
    case 'temple':
      return (
        <svg {...common}>
          <path d="M12 3.5 5 8h14z" />
          <path d="M6.5 8v3h11V8M8 11v9h8v-9" />
          <path d="M12 14.5v5.5M4 20h16" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      )
  }
}
