/** Small colour helpers shared by the renderer and the UI. */

export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v))
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const num = Number.parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 }
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/** Alpha applied to any CSS colour we use (hex, rgb, rgba, hsl are handled for
 *  hex/rgb; other CSS strings fall back to a safe rgba conversion). */
export function alpha(color: string, a: number): string {
  const c = color.trim()
  if (c.startsWith('#')) {
    const { r, g, b } = hexToRgb(c)
    return `rgba(${r},${g},${b},${clamp(a).toFixed(4)})`
  }
  if (c.startsWith('rgb(')) return c.replace('rgb(', 'rgba(').replace(')', `,${clamp(a).toFixed(4)})`)
  if (c.startsWith('rgba(')) {
    const parts = c.slice(5, -1).split(',').map((p) => p.trim())
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${clamp(a).toFixed(4)})`
  }
  return c
}

export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const k = clamp(t)
  return rgbToHex(A.r + (B.r - A.r) * k, A.g + (B.g - A.g) * k, A.b + (B.b - A.b) * k)
}

export function shade(color: string, amount: number) {
  return amount >= 0 ? mix(color, '#ffffff', amount) : mix(color, '#000000', -amount)
}

export function luminance(color: string) {
  const { r, g, b } = hexToRgb(color)
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export function readableOn(bg: string) {
  return luminance(bg) > 0.42 ? '#12100E' : '#F7F1E6'
}

export function contrastRatio(a: string, b: string) {
  const la = luminance(a)
  const lb = luminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

/** Deterministic pseudo-random generator (mulberry32). Used so grain,
 *  particles and decorative geometry are stable across renders and exports. */
export function rng(seed: number) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
