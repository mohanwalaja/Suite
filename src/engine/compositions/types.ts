import type { CompositionMeta } from '../types'
import type { Frame } from '../frame'

export interface Composition {
  meta: CompositionMeta
  render: (f: Frame) => void
}
