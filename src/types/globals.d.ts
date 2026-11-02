/** Minimal typings for the Node-only font converter used by the sample renderer. */
declare module 'wawoff2' {
  const wawoff2: {
    decompress(buffer: Uint8Array): Promise<Uint8Array>
    compress(buffer: Uint8Array): Promise<Uint8Array>
  }
  export default wawoff2
}
