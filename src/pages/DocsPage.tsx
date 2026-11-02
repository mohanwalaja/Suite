import { COMPOSITIONS } from '../engine/compositions'
import { CATEGORIES } from '../engine/categories'
import { PALETTES } from '../engine/palettes'
import { MOTIFS } from '../engine/artwork'
import { FONT_FAMILIES } from '../engine/fonts'
import { providerStatus } from '../lib/provider'
import { IconInfo } from '../components/icons'

const SECTIONS = [
  ['overview', 'What this is'],
  ['quickstart', 'Run it'],
  ['engine', 'Design engine'],
  ['content', 'Content & typography'],
  ['formats', 'Formats & resize'],
  ['motion', 'Motion & video'],
  ['export', 'Export & preflight'],
  ['services', 'Services & pricing'],
  ['brand', 'Brand & logo'],
  ['ai', 'Optional AI imagery'],
  ['backend', 'Optional accounts & cloud'],
  ['samples', 'Samples & tests'],
  ['deploy', 'Deployment'],
  ['limits', 'Limitations'],
]

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 border-t border-white/[0.008] pt-7 font-display text-xl text-white/90">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-white/50">{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="scroll-thin overflow-x-auto rounded-xl border border-white/10 bg-black/45 px-3.5 py-3 text-[11.5px] leading-relaxed text-white/70">
      <code>{children}</code>
    </pre>
  )
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-white/[0.006] py-2.5 last:border-0 sm:grid-cols-[190px_1fr] sm:gap-4">
      <dt className="text-[12px] font-medium text-white/65">{term}</dt>
      <dd className="text-[12px] leading-relaxed text-white/40">{children}</dd>
    </div>
  )
}

export default function DocsPage() {
  const provider = providerStatus()

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-8 sm:px-8">
      <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#d9ae6b]/70">Studio guide</p>
      <h1 className="mt-2 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] text-white">How the engine works</h1>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/45">
        Install, compose, animate and export. This page documents what is implemented, what is optional, and what is honestly
        not possible in a browser-only build.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label="Guide sections">
          <div className="sticky top-6 space-y-1">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="block rounded-lg px-2.5 py-1.5 text-[12px] text-white/35 transition hover:bg-white/[0.05] hover:text-white/80">
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-5">
          <section id="overview" className="scroll-mt-24 space-y-3">
            <H2 id="overview">What this is</H2>
            <P>
              Astro Sivam Creative Studio is a React + TypeScript + Vite application with a canvas design engine. Posters are not
              assembled from fifteen recoloured HTML templates: each composition is a separate render function with its own
              geometry, focal point, hierarchy, artwork placement and background construction.
            </P>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Composition systems', COMPOSITIONS.length],
                ['Categories', CATEGORIES.length],
                ['Original vector motifs', MOTIFS.length],
                ['Curated palettes', PALETTES.length],
                ['Bundled font families', FONT_FAMILIES.length],
                ['External services required', 0],
              ].map(([label, value]) => (
                <div key={String(label)} className="panel flex items-center justify-between px-3.5 py-3">
                  <span className="text-[12px] text-white/50">{label}</span>
                  <span className="font-display text-lg text-white/85">{value}</span>
                </div>
              ))}
            </div>
            <P>
              Rendering, export and the Node sample generator call the same <code className="text-white/70">renderDesign()</code>{' '}
              function, so the editor preview is the artwork you export.
            </P>
          </section>

          <section id="quickstart" className="scroll-mt-24 space-y-3">
            <H2 id="quickstart">Run it</H2>
            <Code>{`npm install
cp .env.example .env      # optional values only
npm run dev               # http://localhost:5173
npm run typecheck         # strict TypeScript
npm run build             # production bundle in dist/
npm run samples           # 30 sample posters + manifest in public/samples
npm test                  # engine + composition test suite`}</Code>
            <P>
              Node 20+ is required. The sample generator uses <code className="text-white/70">@napi-rs/canvas</code> and renders
              with the same font files the browser uses, so sample output matches the studio.
            </P>
          </section>

          <section id="engine" className="scroll-mt-24 space-y-3">
            <H2 id="engine">Design engine</H2>
            <P>
              The selector scores every composition against category, aspect ratio, headline length, body length, number of
              points, whether the category reads as a story, and the recently used compositions. The current layout and the two
              previous ones are heavily penalised, so regenerating cannot produce a near-repeat.
            </P>
            <div className="panel overflow-hidden">
              <div className="grid grid-cols-[28px_1fr] gap-3 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/30 sm:grid-cols-[28px_1.1fr_1fr_1.4fr]">
                <span>#</span>
                <span>Composition</span>
                <span className="hidden sm:block">Family</span>
                <span className="hidden sm:block">Structure</span>
              </div>
              <div className="divide-y divide-white/[0.006]">
                {COMPOSITIONS.map((c) => (
                  <div key={c.meta.id} className="grid grid-cols-[28px_1fr] gap-3 px-3 py-2.5 text-[11.5px] sm:grid-cols-[28px_1.1fr_1fr_1.4fr]">
                    <span className="tabular-nums text-white/25">{String(c.meta.index).padStart(2, '0')}</span>
                    <span className="text-white/75">{c.meta.name}</span>
                    <span className="hidden text-white/35 sm:block">{c.meta.family}</span>
                    <span className="hidden leading-relaxed text-white/35 sm:block">{c.meta.summary}</span>
                  </div>
                ))}
              </div>
            </div>
            <P>
              Artwork comes from a library of {MOTIFS.length} procedural illustrations (celestial, devotional, botanical,
              architectural and geometric) drawn with real gradients, hatching and lighting. No stock photography, no clipart
              borders, no random symbol mixing: each category maps to motifs that belong to it.
            </P>
          </section>

          <section id="content" className="scroll-mt-24 space-y-3">
            <H2 id="content">Content & typography</H2>
            <P>
              Poster copy is English-only by design. Editing happens in Content: eyebrow, headline, subheadline, body, up to five
              supporting points, CTA, contact, website and footer. Every text block is measured during render; if a block would
              overflow or clip, the report lists it and the preflight panel shows it before you export.
            </P>
            <P>
              Layout and text are separate layers: the composition decides where the copy block sits, the typography panel decides
              how it is set. Seven families are bundled locally — no Google Fonts request, no missing-font fallback at export.
              Headline weight snaps to weights that exist in the file.
            </P>
          </section>

          <section id="formats" className="scroll-mt-24 space-y-3">
            <H2 id="formats">Formats & resize</H2>
            <dl className="panel px-4 py-1">
              {[
                ['Instagram portrait', '1080 × 1350 (4:5) — default feed post'],
                ['Square', '1080 × 1080 (1:1) — IG + FB feed'],
                ['Story / Reel cover', '1080 × 1920 (9:16) — extra safe zones top and bottom'],
                ['Facebook landscape', '1200 × 628 — link and event banners'],
                ['Custom', '320–4096 px, any ratio'],
              ].map(([term, def]) => (
                <Row key={term} term={term}>
                  {def}
                </Row>
              ))}
            </dl>
            <P>
              Switching format re-renders the composition at the new aspect: the safe rectangle, type sizes, artwork frame and
              point caps are recomputed. The resize set in Export applies that same process per size rather than scaling one
              bitmap. Story formats reserve extra space for platform UI.
            </P>
          </section>

          <section id="motion" className="scroll-mt-24 space-y-3">
            <H2 id="motion">Motion & video</H2>
            <P>
              Animation is part of the composition tree. Blocks reveal in sequence with real timing, artwork parallaxes, particles
              are seeded per poster, light sweeps travel across the frame and scene transitions clip or scale the entire
              composition. Duration, fps, easing and each effect are adjustable; the Motion panel scrubs the same timeline that
              export uses.
            </P>
            <P>
              Video export records the live canvas with <code className="text-white/70">MediaRecorder</code> at the selected fps
              and 1080 px on the long edge. MP4 is offered only if the browser exposes an H.264 encoder (Chromium on most desktops);
              otherwise a WebM is produced and the button says so. Recording runs in real time, so a 6-second poster takes six
              seconds and the tab must stay in the foreground. If no codec is available the app says so instead of showing a fake
              success.
            </P>
            <div className="flex gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-3 py-2.5 text-[11.5px] leading-relaxed text-amber-100/70">
              <IconInfo size={14} className="mt-0.5 shrink-0" />
              <span>
                A guaranteed MP4 on every device needs server-side encoding (ffmpeg). That is deliberately not bundled: it would
                add a binary dependency and a paid compute requirement. The browser recorder is the honest default.
              </span>
            </div>
          </section>

          <section id="export" className="scroll-mt-24 space-y-3">
            <H2 id="export">Export & preflight</H2>
            <P>
              PNG (lossless) and JPEG (quality selectable) are rendered at the exact target dimensions at 1×, 2× or 3×. Before
              writing the file the engine measures every block, checks the safe margin and reports clipping, overflow and empty
              required fields. The panel also checks ink/background contrast so an override cannot silently produce unreadable text.
            </P>
            <P>
              Nothing is watermarked, nothing is upscaled, and the exported file is the engine output rather than a screenshot of
              the editor. A failed export throws and shows the error — there is no simulated progress bar.
            </P>
          </section>

          <section id="services" className="scroll-mt-24 space-y-3">
            <H2 id="services">Services & pricing</H2>
            <P>
              The <a href="/services" className="text-[#d9ae6b]/85 hover:text-[#d9ae6b]">Services</a> page mirrors the live Astro
              Sivam offer so poster copy can be written against it: Birth Jathagam (Basic US$5 / ₹470, Bhava and Varga US$10 / ₹940),
              Marriage Compatibility (US$5 / ₹470), Baby Naming (US$5 / ₹470) and Subha Muhurtham (US$10 / ₹940). Each service has a
              “Create poster” button that loads its verified description, inclusions and price line into a new design.
            </P>
            <P>
              Those figures, inclusions and the four-step ordering process were transcribed from astrosivam.com on 2 November 2026.
              Prices and inclusions can change; the live checkout is the source of truth, and the Services page says so in the UI.
              The studio deliberately does not take orders or payments.
            </P>
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-white/45">
              <IconInfo size={14} className="mt-0.5 shrink-0" />
              <span>
                Source: astrosivam.com, /birth-jathagam, /marriage-compatibility, /baby-naming, /muhurtham. Facts are dated in the
                source file <code className="text-white/65">src/engine/services.ts</code> so they can be re-verified in one place.
              </span>
            </div>
          </section>

          <section id="brand" className="scroll-mt-24 space-y-3">
            <H2 id="brand">Brand & logo</H2>
            <P>
              Brand settings hold the name, tagline, website, contact, CTA, accent colour, logo and footer. Each poster can override
              them; the editor&apos;s Brand panel applies to the open design only. Logo size and corner are adjustable, with a
              “Layout” mode that lets each composition place it where it belongs.
            </P>
            <P>
              The project ships with <strong className="text-white/65">no logo file</strong>. Only the official asset from
              astrosivam.com (or the file supplied by the brand owner) may be uploaded — no stock mark, no generated lookalike, no
              redrawn monogram is used on posters. Until it is uploaded, posters set the Astro Sivam wordmark in the chosen display
              face.
            </P>
          </section>

          <section id="ai" className="scroll-mt-24 space-y-3">
            <H2 id="ai">Optional AI imagery</H2>
            <P>
              The studio is complete without any AI service. If you want generated artwork, implement the provider interface and
              point the app at your own proxy: <code className="text-white/70">VITE_AI_ENDPOINT</code>. The browser never holds an
              API key.
            </P>
            <Code>{`# .env (frontend)
VITE_AI_ENDPOINT=/api/generate.php
VITE_AI_PROVIDER_NAME=Studio image proxy

# server environment (public/api/generate.php)
AI_PROVIDER=openai          # openai | stability | none
AI_API_KEY=sk-...           # server only, never in the bundle
AI_MODEL=gpt-image-1`}</Code>
            <P>
              Your proxy must return <code className="text-white/70">{`{ "image": "data:image/png;base64,…" }`}</code> or{' '}
              <code className="text-white/70">{`{ "url": "https://…" }`}</code>. The included PHP proxy shows one real
              implementation and returns HTTP 503 when no key is configured. Image generation is a paid provider feature; check
              current pricing before enabling it. The Studio never labels a provider image as its own illustration.
            </P>
            <p className="text-[11.5px] text-white/35">
              Current status in this build: <span className="text-white/70">{provider.label}</span>. {provider.detail}
            </p>
          </section>

          <section id="backend" className="scroll-mt-24 space-y-3">
            <H2 id="backend">Optional accounts & cloud</H2>
            <P>
              Projects live in <code className="text-white/70">localStorage</code> by default — no account, no server, no tracking.
              A small PHP + MySQL backend is included for teams that want shared storage. It is optional and never required by the
              editor.
            </P>
            <dl className="panel px-4 py-1">
              <Row term="Public endpoints">Only authenticated JSON calls; no directory listing; no secrets in responses.</Row>
              <Row term="Authentication">Email + password with password_hash/password_verify; HTTP-only, SameSite=Lax session cookie; login throttling.</Row>
              <Row term="Authorisation">Every project query is scoped to the signed-in user id — never trusted from the client.</Row>
              <Row term="Uploads">Images are validated by MIME and size before storage; the logo is a data URL, not a served path.</Row>
              <Row term="Transport">Serve over HTTPS. Set APP_ORIGIN so CORS is restricted to your studio domain.</Row>
            </dl>
            <P>
              See <code className="text-white/70">db/schema.sql</code> and <code className="text-white/70">public/api/*.php</code>.
              There is no Facebook or Instagram publishing: that needs Meta app review, page tokens and permissions, none of which
              this project fakes.
            </P>
          </section>

          <section id="samples" className="scroll-mt-24 space-y-3">
            <H2 id="samples">Samples & tests</H2>
            <P>
              <code className="text-white/70">npm run samples</code> renders 30 posters across all categories, all fifteen
              compositions and four aspect classes, writes PNGs to <code className="text-white/70">public/samples</code> and a
              manifest that the Projects page displays. It also prints a per-poster issue count.
            </P>
            <P>
              <code className="text-white/70">npm test</code> verifies that fifteen compositions are registered, that consecutive
              generations differ, that every category resolves to a valid composition and motif, that all aspect classes render
              without clipped text, and that export dimensions are exact.
            </P>
            <Code>{`npm run samples
npm test
npm run typecheck
npm run build`}</Code>
          </section>

          <section id="deploy" className="scroll-mt-24 space-y-3">
            <H2 id="deploy">Deployment</H2>
            <P>
              <code className="text-white/70">npm run build</code> produces a static <code className="text-white/70">dist/</code>{' '}
              folder. Upload it to any static host. Because the app uses client-side routes, configure a rewrite to
              <code className="text-white/70"> index.html</code>; an Apache <code className="text-white/70">.htaccess</code> is
              included, and Netlify/Vercel configs are in the repository.
            </P>
            <P>
              For the optional backend, upload <code className="text-white/70">public/api</code> with <code className="text-white/70">dist/</code>{' '}
              to PHP 8.1+ hosting, import <code className="text-white/70">db/schema.sql</code>, and set the environment values in
              <code className="text-white/70"> public/api/config.php</code> (or your host&apos;s secret manager).
            </P>
          </section>

          <section id="limits" className="scroll-mt-24 space-y-3">
            <H2 id="limits">Limitations</H2>
            <dl className="panel px-4 py-1">
              <Row term="Video codec">MP4 depends on the browser&apos;s encoder; WebM is the portable fallback.</Row>
              <Row term="Video length">Recording is real time and capped at 30 seconds to keep the tab responsive.</Row>
              <Row term="Cloud sync">Optional backend only; the included schema is not a multi-tenant SaaS.</Row>
              <Row term="Social publishing">Not implemented — Meta app review and page tokens are out of scope.</Row>
              <Row term="AI artwork">Requires your own key and proxy; quality and cost depend on the provider.</Row>
              <Row term="Fonts">Seven Latin families are bundled. Characters outside Latin-1 will show fallback glyphs.</Row>
              <Row term="Storage">Browser storage is per-device and can be cleared; export to keep a permanent copy.</Row>
              <Row term="Composition lock">Some compositions intentionally keep their own alignment and logo corner.</Row>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
