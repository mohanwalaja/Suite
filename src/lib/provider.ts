/**
 * Replaceable image-provider interface.
 *
 * The studio is fully functional with no provider configured: the poster engine
 * draws its own vector artwork. If a team wants AI imagery, they point
 * VITE_AI_ENDPOINT at their own server-side proxy (see public/api/generate.php)
 * and register it below. API keys never live in this bundle.
 *
 * Nothing here claims an image was generated unless a provider actually returned
 * one; `art.providerImageDataUrl` is only written from a real response.
 */

export interface ImageRequest {
  prompt: string
  width: number
  height: number
  categoryId: string
}

export interface ImageResult {
  dataUrl: string
  provider: string
  model?: string
  revisedPrompt?: string
}

export interface ImageProvider {
  id: string
  name: string
  /** True when the provider is reachable with the current configuration. */
  configured: boolean
  /** Shown in the UI so costs and requirements are never hidden. */
  note: string
  generate(request: ImageRequest): Promise<ImageResult>
}

const ENDPOINT = (import.meta.env.VITE_AI_ENDPOINT as string | undefined)?.trim() ?? ''
const PROVIDER_NAME = (import.meta.env.VITE_AI_PROVIDER_NAME as string | undefined)?.trim() || 'Custom proxy'

class ProxyImageProvider implements ImageProvider {
  id = 'proxy'
  name = PROVIDER_NAME
  note = 'Calls your own server-side proxy. Key stays on the server; provider may charge per image.'
  constructor(private endpoint: string) {}
  get configured() {
    return this.endpoint.length > 0
  }
  async generate(request: ImageRequest): Promise<ImageResult> {
    if (!this.configured) throw new Error('No image provider is configured.')
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width,
        height: request.height,
        category: request.categoryId,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(
        `Image provider returned ${res.status}. ${detail ? detail.slice(0, 180) : 'Check the proxy logs and provider quota.'}`,
      )
    }
    const data = (await res.json()) as { image?: string; url?: string; provider?: string; model?: string; revised_prompt?: string }
    const src = data.image ?? data.url
    if (!src) throw new Error('Provider responded without an image field.')
    const dataUrl = src.startsWith('data:') ? src : await urlToDataUrl(src)
    if (!/^data:image\/(png|jpe?g|webp)/.test(dataUrl)) throw new Error('Provider returned an unsupported image format.')
    return {
      dataUrl,
      provider: data.provider ?? this.name,
      model: data.model,
      revisedPrompt: data.revised_prompt,
    }
  }
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Provider image could not be downloaded.')
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the provider image.'))
    reader.readAsDataURL(blob)
  })
}

class DisabledProvider implements ImageProvider {
  id = 'none'
  name = 'Not configured'
  configured = false
  note = 'No AI service is connected. Posters use the built-in vector artwork library.'
  async generate(): Promise<ImageResult> {
    throw new Error('No image provider is configured. The vector artwork library is used instead.')
  }
}

const registry = new Map<string, ImageProvider>()
const none = new DisabledProvider()
registry.set('none', none)
if (ENDPOINT) registry.set('proxy', new ProxyImageProvider(ENDPOINT))

export function registerImageProvider(provider: ImageProvider) {
  registry.set(provider.id, provider)
}

export function listImageProviders(): ImageProvider[] {
  return [...registry.values()]
}

export function getImageProvider(id?: string): ImageProvider {
  if (id && registry.has(id)) return registry.get(id)!
  const configured = [...registry.values()].find((p) => p.configured)
  return configured ?? none
}

export function providerStatus() {
  const provider = getImageProvider()
  const configured = provider.configured
  return {
    configured,
    provider,
    label: configured ? `${provider.name} connected` : 'AI imagery off',
    detail: configured
      ? provider.note
      : 'The app works fully without AI. Built-in vector motifs are original engine artwork.',
  }
}

/** Prompt suggestions built from the category's art direction. */
export function buildPrompt(artDirection: string, content: { headline: string; eyebrow: string }): string {
  return [
    artDirection,
    'flat premium vector illustration with painterly depth, layered textures, soft lighting, generous negative space',
    'no text, no lettering, no borders, no watermark, no photorealism, no faces',
    content.headline ? `mood: ${content.headline}` : '',
  ]
    .filter(Boolean)
    .join(', ')
}
