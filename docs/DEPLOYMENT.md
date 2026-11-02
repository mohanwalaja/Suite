# Deployment

The studio is a static Vite app. Cloud storage and AI imagery are optional; the editor, rendering and export work without a server.

## 1. Static build

```bash
npm ci
npm run verify        # typecheck + engine tests + sample posters
npm run build
```

Upload `dist/` to any static host. Because routing is client-side, the host must rewrite unknown paths to `index.html`:

- **Apache** — `public/.htaccess` is copied into `dist/` by Vite. Requires `mod_rewrite` and `AllowOverride All`.
- **Vercel** — `vercel.json` is included.
- **Netlify** — `netlify.toml` is included.
- **Nginx** — `try_files $uri $uri/ /index.html;`

Set `VITE_API_BASE` and/or `VITE_AI_ENDPOINT` **before** building if you use the optional backend. Vite inlines them at build time.

Sample posters are served from `/samples/…` and listed in `/samples/manifest.json`. If you delete them, the Projects page hides the gallery and explains how to regenerate it.

## 2. Optional PHP backend

Requirements: PHP 8.1+ with PDO MySQL and cURL, MySQL 8 / MariaDB 10.6.

```bash
mysql -u root -p < db/schema.sql
```

Upload `public/api/` next to `dist/` (for example `https://studio.example.com/api/`). Then configure environment variables in your hosting panel:

```
DB_DSN=mysql:host=localhost;dbname=astrosivam_studio;charset=utf8mb4
DB_USER=...
DB_PASS=...
APP_ORIGIN=https://studio.example.com
SESSION_NAME=astrosivam_studio
```

- `APP_ORIGIN` restricts CORS to your studio domain. Leave it empty to disable cross-origin access entirely.
- The session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` when HTTPS is detected.
- `public/api/.htaccess` blocks `config.php` and SQL files from being served.
- Point the frontend at the folder with `VITE_API_BASE=https://studio.example.com/api`.

### Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/auth.php?action=register` | POST | Create account (`email`, `password` 10+, `name`) |
| `/auth.php?action=login` | POST | Start session, throttled after 10 attempts / 15 min |
| `/auth.php?action=logout` | POST | Destroy session |
| `/auth.php?action=me` | GET | Current user or `null` |
| `/projects.php?action=list` | GET | Projects for the signed-in user |
| `/projects.php?action=save` | POST | Upsert one project (owner-checked, 2 MB limit) |
| `/projects.php?action=delete` | POST | Delete one project owned by the user |
| `/generate.php` | POST | Optional image proxy (OpenAI or Stability) |

All project queries are scoped by the session user id; ids from the client are validated with a strict pattern.

## 3. Optional AI image provider

`generate.php` supports:

- **openai** — `AI_PROVIDER=openai`, `AI_API_KEY=…`, `AI_MODEL=gpt-image-1` (or `dall-e-3`).
- **stability** — `AI_PROVIDER=stability`, `AI_API_KEY=…`.

Without a key it returns HTTP 503 and the studio keeps using its vector artwork. You can also front it with `AI_PROXY_TOKEN` and send `X-Proxy-Token`.

The proxy throttles to 12 generations per IP per hour using a temp file. For production, prefer your provider's project limits and a real rate limiter.

## 4. Branding the deployment

- Upload the official Astro Sivam logo in **Brand** — the repository intentionally contains none.
- Brand name, tagline, website, contact, CTA, accent, footer and logo placement are stored in the browser (and in each saved project).
- `public/favicon.svg` is a neutral studio mark, not the Astro Sivam logo. Replace it with the official favicon if the brand owner supplies one.

## 5. Checks after deploy

1. Open a poster, drag artwork, undo/redo, regenerate.
2. Export PNG at 2× and confirm the file dimensions.
3. Run the preflight check with an intentionally long headline — an error must appear.
4. Record a 4-second video and confirm the file plays.
5. Resize the same poster to 1:1 and 9:16 and confirm the layout reflows.
6. If cloud sync is enabled: register, save, sign out, sign in on another browser, pull.
