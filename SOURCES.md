# Brand and creative provenance

Website material was reviewed on **18 November 2026**. Service descriptions are concise paraphrases, not a live scrape or a promise that website pricing and offers will remain unchanged. No prices, guarantees, testimonials, or time-limited discounts are invented in posters.

| Subject                                                             | Official source                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Brand name, location, priest team, languages, Chitra Paksha Lahiri  | https://astrosivam.com/about                                                    |
| Full official logo (the image labelled “ASTRO SIVAM Official Logo”) | https://astrosivam.com/assets/astrosivam_full_logo-DlKqdIg5.png                 |
| App icon declaration                                                | https://astrosivam.com/manifest.json                                            |
| Official square icon                                                | https://astrosivam.com/assets/images/android-chrome-192x192.png                 |
| Report comparisons, four services and free tools                    | https://astrosivam.com/services                                                 |
| Birth Jathagam: Rasi/Navamsa, planetary periods, readings           | https://astrosivam.com/birth-jathagam                                           |
| Bhava and Varga edition links                                       | https://astrosivam.com/bhava-jathagam and https://astrosivam.com/varga-jathagam |
| Marriage matching                                                   | https://astrosivam.com/marriage-compatibility                                   |
| Baby naming                                                         | https://astrosivam.com/baby-naming                                              |
| Subha Muhurtham                                                     | https://astrosivam.com/muhurtham                                                |
| Free Rasi Palan and Panchangam                                      | https://astrosivam.com/rasipalan and https://astrosivam.com/panjangam           |
| Free Rasi/Nakshatra finder and quick 10-Porutham check              | https://astrosivam.com/                                                         |

## Original brand files bundled in the studio

- **Full logo and wordmark:** [`src/assets/astrosivam_full_logo.png` from the website source](https://github.com/mohanwalaja/Mohan/blob/e89ccb94ae9e66269f6535f484e9f4ddd9991974/src/assets/astrosivam_full_logo.png), copied unchanged to `public/brand/official-logo.png` (1220 × 233, 38,876 bytes). Its Rollup/Vite content hash begins `DlKqdIg5`, matching the deployed `astrosivam_full_logo-DlKqdIg5.png` linked on the About page. SHA-256: `be06e37a2011c4f1934ae433d8d4da528d73e24b4adab50d3ddd778a0aa57794`.
- **App icon:** [the public website icon](https://github.com/mohanwalaja/Mohan/blob/e89ccb94ae9e66269f6535f484e9f4ddd9991974/public/assets/images/android-chrome-192x192.png), copied unchanged to `public/brand/official-icon.png`. SHA-256: `0621a9ea8296f39adea13eed441544ba7ae24ee9b247a0e2067113881a8bc91f`. This is used for the browser / home-screen icon, not as a substitute for the full poster lockup.

- **Large home-screen icon:** [the original 512-pixel website icon](https://github.com/mohanwalaja/Mohan/blob/e89ccb94ae9e66269f6535f484e9f4ddd9991974/public/assets/images/android-chrome-512x512.png), bundled unchanged as `public/brand/official-icon-512.png`.

## Studio artwork and fonts

The official website logo is the only brand signature. The studio’s devotional pictures are **original illustrations, not official temple photographs, images supplied by the ASTRO SIVAM website, or reproductions of identified historic paintings**.

- `public/art/scenes` contains **50 generated scenes**: ten service/tool pictures, three family/classroom pictures and **37 distinct AI-generated devotional paintings**. `src/art/deities.js` is the inventory: each painting has a local source key, scene title, lead subject, any additional depicted figure, and print framing. The earlier 17 devotional paintings are joined by 20 individually prompted works. Examples include Ganga on a makara, Annapurna serving Shiva, Meenakshi at Madurai, Jagannath's wooden icon on Nandighosha, Agni with his ram, and the Kamakhya shrine on Nilachal Hill. These are interpretive paintings, not documentary or official temple images.
- `public/art/thumbs` contains full-field WebP reductions of the real source paintings, used only as input to the shared 4:5 portrait renderer at browsing sizes. The directory, festival picker, editor, and downloads have **no procedural deity face fallback**. A missing source prevents export. Ordinary vector illustrations are still used for ritual objects outside the painting, service charts, and secular/day subjects. New full-scene works are mounted uncropped in the poster layouts. Iconography and names vary across traditions.
- The downloadable ZIP contains **40 portrait posters (1080 × 1350) in 35 folders**, composited with the transparent original logo and wordmark; no white logo panel is baked into these files. Three paintings depict two named subjects and legitimately occur in both collections. The 50 design models per subject reuse actual paintings with different poster compositions; they do not inflate the picture counts. Personal uploads are never included in the ZIP.
- Independent greetings, hashtags, artwork names and campaign copy are original studio writing, not quotations or promises from the website. User-imported pictures belong to the person supplying them and require their own publishing rights.

The local font files were obtained from Fontsource's npm distributions. Each font's license is in `public/fonts/licenses`. `scripts/prepare-fonts.py` documents how they are bundled. Noto Sans Devanagari is also bundled locally for Hindi in the directory and optional poster headlines (see `scripts/prepare-hindi-font.py` and its OFL license). Icon components are from Lucide.
