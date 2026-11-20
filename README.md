# AstroSivam Marketing Suite

A mobile-first poster studio for **ASTRO SIVAM**. Create a branded image, personalize its caption and hashtags, save it on your device, and publish it to your own Instagram professional account and Facebook Page after authorization.

## Run the studio

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

The Vite server listens on `0.0.0.0:5173`. The editor and API share an origin; the phone never needs to call a separate localhost backend. Poster creation, downloads, drafts, and captions **do not require any API keys**.

```sh
npm run build
npm start
```

Production serves `dist/` and the API from one Express process (default port `3000`, configurable with `PORT`). Serve it behind HTTPS. This is a Node application, not a static-only publishing integration.

## On your phone

1. Open **Poster Studio**. Choose Services, Festivals, Hindu deities, or Special days and tap the subject selector.
2. Tap **Models** in the bottom bar to browse 150 independently art-directed designs for that subject, with subject-specific artwork and its own composition, illustration arrangement, typography and decorative system. The original fifty-colour palette and typeface libraries stay available as finishing choices. The palette name also opens an independent library of all 50 palettes.
3. Every poster is **portrait (4:5), 1080 × 1350 px**. Change the headline typography; the original transparent ASTRO SIVAM signature stays on the artwork. **Caption & tags** lets you edit the caption, hashtags, headline, and tagline.
4. **Save draft** keeps the editable design in Content Library on this browser. The current working design also autosaves. The download icon exports the full-resolution PNG, not a screenshot.
5. **Publish post** shows the exact image, copy, and destination channels. After the one-time Meta setup, **Publish now** sends the selected channels together.

Included: ten service/tool subjects, 80 festivals, 44 special days, and 35 named Hindu deity collections. Birth Jathagam has Rasi/Navamsa charts and manuscript studies; wedding matching has paired horoscopes, thalis and garlands; Baby Naming has cradles and keepsakes. Family, teaching, health, sport and other special days use their own illustrations. No unverified festival dates or personal horoscope placements are assumed.

### Choose god pictures

- On a phone, tap **God pictures** in the bottom bar (or **Hindu deities** in the Post editor). Browse the picture directory or search in English or Hindi, including aliases such as **Balaji**, **Ganpati**, **Mahadev**, and **महादेव**. Tap a deity, then an actual picture. The directory uses **37 individually AI-generated paintings across all 35 deities**. Each has at least one; Ganesha, Shiva, Lakshmi and Krishna have multiple scenes. A shared artwork is labeled rather than repeated as two identical directory covers. Counts are source paintings, not frames, color changes or generic vector faces. Each collection still offers **150 poster designs** using the artwork.
- **Download all** in the directory downloads the [complete portrait poster pack](public/downloads/ASTRO-SIVAM-Hindu-Deity-Posters.zip): **40 branded JPEGs in 35 named folders**, with captions. It is pre-rendered, so the phone downloads a single file instead of rendering the entire collection. Three paintings belong in two collections: Sita–Rama, Annapurna serving Shiva, and Radha hearing Krishna. The directory cards preview the branded 4:5 composition. See the [Jagannath portrait example](public/downloads/ASTRO-SIVAM-Jagannath-Portrait.jpg). The individual editor download is a full-resolution portrait PNG.
- For a devotional festival, use **Choose a deity picture** to change the image **without changing the festival or your edited greeting**. Diwali offers Lakshmi and Ganesha, Navaratri offers Durga, Lakshmi and Saraswati, and Janmashtami offers Krishna. Observances such as Eid use their own non-figurative imagery; secular days do not automatically acquire a Hindu deity.
- Hindu traditions include many more regional names and forms than a fixed directory can cover. **Add my pictures** lets you name a collection and import 1–12 pictures you have rights to publish. Picture pixels are saved in IndexedDB on this device, not in draft JSON or on an image server. Missing device pictures block export rather than being replaced with the wrong figure. Clearing site data removes these personal collections.

## Official website sources and logo

Service facts are curated from [the service catalogue](https://astrosivam.com/services), [the homepage](https://astrosivam.com/), and [the About page](https://astrosivam.com/about). Brand Kit includes source links, the Chennai-based team, report languages, and calculation tradition. See [SOURCES.md](SOURCES.md) for the complete provenance.

**Every poster uses the original, complete ASTRO SIVAM logo.** `public/brand/official-logo.png` contains the gold emblem, original navy lettering and VEDIC ASTROLOGY tagline in a single transparent image. We obtained the original bytes from the website’s public source repository and verified that their Vite asset hash matches the filename on the live About page (`DlKqdIg5`). No request to an external image host is required when designing, exporting or publishing.

The renderer draws the original transparent logo and wordmark directly over the design at their native aspect ratio. **Signature place** and **Signature size** in the Design tab (also in Layers → Brand signature) let you choose one of six safe positions and a 70–115% size; the original PNG is never stretched, cropped or removed, and exports inherit the choice. There is **no white rectangle or opaque panel**. On dark paper only, a fine gold edge follows the ink contours for legibility. The artwork remains visible around the emblem and between the letters. Fonts and palettes cannot recolor or replace the original. If the asset cannot load, the studio will not produce an unbranded export or send it to Meta. Brand Kit is read-only. Old custom names, uploaded logos, and hidden-signature preferences are not applied.

On phones that honor web-app orientation preferences, the home-screen studio opens in portrait. The normal browser layout remains responsive.

**Portrait is the only draft and publishing format**, for both Instagram and Facebook, and the API still verifies real 1080 × 1350 JPEG bytes. The editor, model thumbnails, saved-library and publish previews, the download pack and the default PNG/JPEG export all use 4:5. Optional export placements frame the same uncropped 4:5 composition on a square 1080 × 1080 canvas or a 1080 × 1920 story canvas; they are downloads only and are never sent to Meta. Existing square and landscape drafts reopen and save as portrait without changing their picture, copy, model index or draft ID. Already published posts and previously downloaded files are untouched. The API validates the JPEG’s actual 1080 × 1350 dimensions and rejects older renderer revisions.

`npm run brand:sync` verifies the bundled files without network access; only a missing or changed file needs downloading. Restoration checks the SHA-256 digest before replacing anything. See [SOURCES.md](SOURCES.md) for the original files and checksums.

## Connect Meta for real publishing

There is **no simulated connected account, sample publishing history, or fake success response**. The initial workspace is disconnected. Live publishing requires your authorization and an internet-accessible deployment that Meta can reach.

1. Use a Facebook Page you can publish to. To publish on Instagram, link an Instagram **business or creator account** to that Page.
2. Create a Meta app and configure Facebook Login for this use case. Register your exact HTTPS callback URL, for example `https://studio.your-domain.com/api/meta/callback`, as a valid OAuth redirect URI.
3. Configure the following **server-only** environment variables (or use a private `.env` file; see `.env.example`). Never put secrets in a `VITE_` variable, frontend field, repository, or chat.

   | Variable             | Meaning                                                    |
   | -------------------- | ---------------------------------------------------------- |
   | `META_APP_ID`        | Your Meta application ID                                   |
   | `META_APP_SECRET`    | Your private application secret                            |
   | `PUBLIC_BASE_URL`    | The canonical public HTTPS origin, with no path            |
   | `META_GRAPH_VERSION` | A Graph version supported by your app; defaults to `v23.0` |

4. Configure `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, and `instagram_content_publish`. Complete Meta's business verification / app review and advanced access requirements where applicable. In development mode, only eligible app-role/test accounts can authorize. For a public launch, supply your own privacy policy and deletion instructions to Meta.
5. Restart the server. Open **Meta Accounts → Connect Meta** and approve access on Meta's own sign-in page. When several Pages are authorized, explicitly choose your publishing Page in Meta Accounts.
6. Review a poster and select **Publish now**. Facebook receives an uploaded photo and message. Instagram receives a short-lived public JPEG URL, creates a media container, waits for it to finish processing, then publishes it. Hashtags are included in the same caption.

A public HTTPS origin and the temporary `/media/` route must be reachable by Meta without cookies, a proxy login, or a development preview interstitial. The endpoint serves only unguessable, expiring image handles. This integration publishes organic social posts; **it never buys ads or spends an advertising budget**.

### Session, storage, and failure behavior

- Tokens remain server-side, scoped to a random per-browser HttpOnly, SameSite cookie; configured HTTPS deployments use Secure cookies. OAuth uses an expiring, one-use state value. Tokens are not in browser storage or API status responses.
- This version targets a **single server instance**. Tokens reside in memory and idle sessions expire after seven days. A restart requires reconnection. For a multi-instance deployment, replace the in-memory session/media stores with a shared encrypted store and private object storage with an expiry policy.
- Only the Page authorized in that session is accepted. The server checks destination availability and post length. It uses idempotency keys and reports per-channel results from Meta, including partial failures. A retry from a partial result selects only failed destinations.
- Only confirmed Meta post IDs enter Publish History. Temporary JPEGs expire after one hour. Disconnecting drops the workspace's tokens without deleting previously published posts. Meta-side authorization can also be revoked in Meta's business integration settings.
- Drafts, custom occasions, and confirmed publishing receipts live in this browser's local storage. These do not sync across devices. Clearing this site's browser data removes them. No birth details are requested or processed by this marketing suite.
- For a private brand workspace, restrict normal studio access with your deployment's access controls while allowing Meta to fetch the temporary public media URLs.

## Creative Atelier

The former fifty-model library is now the first half of a **CreativeRegistry** that registers 150 structurally different compositions for every subject: thirteen services, 80 festivals, 35 deities and 44 special days (25,800 definitions). Direction I preserves the original editorial studies byte-for-byte in saved drafts. Directions II and III rebuild each study twice with ten composition archetypes, ten illustration arrangements, seven alternative typographic hierarchies, ten background constructions and ten decorative programmes. Colour, font substitution, mirroring and tiny offsets are explicitly excluded from the uniqueness check; the registry throws if two designs on a subject share one structural signature.

- `src/creative/registry.js`: CreativeRegistry and per-subject design definitions.
- `src/creative/composition.js`, `artwork.js`, `typography.js`, `variation.js`: composition, graphic artwork, typography and bounded variation engines.
- `src/creative/uniqueness.js`, `quality.js`: structural signatures, perceptual comparison and export checks.
- `src/creative/rotation.js`, `history.js`, `captions.js`: persistent no-repeat rotation, event history and rotating English copy.
- `src/art/press.js` and `src/art/illustration.js`: canvas composition renderer and locally generated SVG scenes.
- `src/art/plates.js`: original, individually painted AI plates for all ten services, each with a second deliberately different modern art direction (watercolour, risograph, folk textile, Art Deco, paper craft, botanical blueprint, glazed ceramic, flat-lay, foil star map and terracotta folk poster) and the first festival subjects without historical artwork. Each plate is a distinct locally bundled file with its own thumbnail; the renderer frames a different region for each design and lays the subject's own line work over it, so the artwork is never a flat colour swap of one template. Every god-related festival keeps its own deity painting as a selectable, gold-framed vignette in every poster, whether or not the subject has a replacement plate. Mahabali and Buddha received original devotional paintings so Onam and Buddha Purnima are covered too. Three additional word-led service subjects — Free Beta, Your Priest Is Busy and Priest Team Ready — use pure typography with no borrowed artwork, and their captions and hashtags lead with the message instead of burying it.
- **Daily Planner**: choose a subject and creative direction, review the suggested design and caption, note a schedule, save the plan as a draft, review publishing status, and open the selection in the editor. Nothing is published automatically.
- **Layers tab**: undo/redo, layer selection, artwork position and scale, focal shape, decorative system, text position, alignment guides, logo placement, duplicate design, export placement and an actionable quality report.
- Rotation history (`astrosivam:creative-history-v1`) stores subject, design ID, date, source and a perceptual signature; it survives refreshes and can be cleared from the Planner. Meta publishing still requires the same configured approval and real account permissions.

## Verification

```sh
npm test                       # catalogue, 25,800 definitions, rotation, history, captions, quality, fonts, assets, account isolation, publishing workflow
npx playwright install chromium
npm run test:browser           # 21 real browser tests of the planner, layers, exports, drafts, logo and mobile flows
npm run build
```

Set `CHROMIUM_PATH` to use an existing Chromium executable. Tests use a mocked Graph transport and **never publish a real post**. Live account authorization must be tested with your own Meta app on its configured HTTPS domain.

## Project map

- `shared/poster-spec.js`: immutable identity, portrait output, preview dimensions, and legacy draft migration.
- `src/catalogue.js`: site service summaries, editable copy, font choices and independent palette library.
- `src/art/`: explicit per-occasion briefs, deity catalogue and aliases, original SVG scenes and charts, inherited model studies and print layouts.
- `src/local-pictures.js`: local import, resizing, validation and persistence for personal deity pictures.
- `src/poster.js`: one renderer for the live canvas, thumbnails, PNG downloads, and publishable JPEGs.
- `src/components/`: poster controls, style and palette galleries, saved content, brand identity, account connection and publishing review.
- `server/`: same-origin API, real OAuth and Graph publishing, bounded-lifetime media, and poster-size checks.
- `public/art/scenes/` and `public/art/thumbs/`: locally bundled scene artwork and lightweight deity picker thumbnails.
- `npm run art:pack`: optional maintenance command to rebuild the downloadable deity collection from the **same poster renderer**; start Vite first, install Playwright Chromium (or set `CHROMIUM_PATH`) and the `zip` command. Updates the archive and `src/deity-pack.json`.
- `public/fonts/`: 50 locally hosted display faces, loaded as needed, with their licenses. UI typography is DM Sans.
