# China Photo Wall

## What is this
A local-first photo wall app overlaid on an interactive China map. Users upload photos tagged by province/city, and thumbnails appear at the correct geographic positions on the map. Zooming in reveals city-level detail. Supports multi-user auth, comments, EXIF metadata extraction, i18n, multiple themes, and full mobile responsiveness.

## Tech stack
- **Backend**: Go server (`main.go`) with SQLite (`modernc.org/sqlite`) + EXIF reader (`goexif`)
- **Frontend**: Vanilla HTML/CSS/JS + ECharts 5.x (local bundle with CDN fallback)
- **Database**: SQLite (`data/photowall.db`) for users and comments
- **Storage**: Filesystem for photos (`photos/` directory), metadata in `meta.json` per folder
- **GeoJSON**: Server-side proxy with disk+memory cache (`data/geo/`), sourced from DataV CDN
- **Config**: `.env` file for server settings

## Project structure
```
main.go              # Go HTTP server: all API handlers, auth, CORS, EXIF extraction, GeoJSON proxy
go.mod / go.sum      # Go module dependencies
.env                 # Config: port, auth, admin credentials, CORS, remote API URL
start.bat            # Windows one-click launcher
static/
  index.html         # Single page app with all modals (upload, preview, edit, login, users, avatar)
  style.css          # 5 themes via CSS variables, responsive layout, mobile-first
  app.js             # ECharts map, overlay, auth, comments, i18n, viewer controls
  china.json         # Local China GeoJSON (fallback: fetched via /api/geo)
  echarts.min.js     # Local ECharts bundle
  avatars/           # Default avatar SVGs
data/
  photowall.db       # SQLite database (users table, comments table)
  geo/               # Cached GeoJSON files from DataV CDN (auto-created)
photos/              # Uploaded photos, organized as photos/{province}/{city}/
  广东省/
    广州市/
      meta.json      # {"filename.jpg": {"description":"...","uploadedBy":"admin","takenAt":"2024-01-01 12:00:00","camera":"iPhone","width":4032,"height":3024,"fileSize":3200000}}
      172xxx.jpg
```

## .env configuration
```
PORT=8080
AUTH_ENABLED=true
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<your-admin-password>
API_BASE_URL=                    # Remote backend URL (empty = local mode)
CORS_ORIGIN=*                    # CORS allowed origin
```
> **Note**: `.env` contains sensitive credentials and is excluded from git via `.gitignore`. Copy `.env.example` to `.env` and fill in your own values.

## API endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/config` | Returns `{apiBaseUrl, authEnabled}` |
| GET | `/api/photos?province=&city=` | List photos with metadata, EXIF info |
| GET | `/api/provinces` | Photo count stats by province/city |
| GET | `/api/comments?photo=url` | Get comments for a photo |
| GET | `/api/geo?adcode=110000` | GeoJSON proxy (fetches from DataV CDN, caches to disk+memory) |
| GET | `/photos/...` | Static file serving for uploaded images |
| POST | `/api/auth/login` | `{username, password}` → `{token, role}` |
| GET | `/api/auth/check` | Returns `{authEnabled, loggedIn, username, role}` |

### Require login (Authorization: Bearer token)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Multipart: `province`, `city`, `description`, `file` |
| POST | `/api/update-description` | `{province, city, filename, description}` |
| POST | `/api/delete` | `{province, city, filename}` |
| POST | `/api/move` | `{province, oldCity, newCity, filename}` |
| POST | `/api/comments/add` | `{photoUrl, content, parentId?}` |

### Require admin role
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users/add` | `{username, password, role, name}` |
| POST | `/api/admin/users/delete` | `{username}` (can't delete self) |
| POST | `/api/admin/users/reset-password` | `{username, newPassword}` |
| POST | `/api/admin/users/update-name` | `{username, name}` |
| POST | `/api/comments/delete` | `{id}` |

## Key behaviors
1. **Single map, no switching**: Always renders the China national map. Zooming in past 3.2x triggers city-level overlays
2. **GeoJSON proxy**: All GeoJSON fetched via `/api/geo?adcode=xxx` (Go backend proxies DataV CDN with proper UA/Referer, caches to `data/geo/` on disk + memory). Fixes mobile browser 403 errors from DataV CDN
3. **Capital city default**: When no city selected on upload, backend auto-assigns provincial capital. Frontend also auto-selects capital in dropdown via `resolveCapitalGeoName()`
4. **Capital city indicator**: Capital cities always show a blue accent dot, both as empty markers and on photo clusters (`.cluster-capital-dot`)
5. **Photo overlay**: Up to 5 thumbnails per province/city as HTML divs via `chart.convertToPixel()`, updated via throttled `requestAnimationFrame`. Distance culling prevents overlapping city markers. No `text-shadow` or `transition` on overlay text to prevent ghosting during drag
6. **EXIF extraction**: On upload, server reads EXIF (date, camera make/model, dimensions) + file size. Falls back to file modification time if no EXIF date. Backfills missing metadata for older photos on list API
7. **Photo viewer**: Fixed-size window (1100x92vh), prev/next navigation (arrow keys + click), zoom in/out (toolbar icons + mouse wheel), rotate, fullscreen, ESC to close. Image strictly contained within window (`max-width/max-height: 100%` + `object-fit: contain`). View-only mode with separate edit modal
8. **Edit modal**: Separate modal (z-index 1200) opened from preview action buttons. Contains city selector and description editor. Preview modal shows read-only info + action icons (edit/delete)
9. **Auth system**: JWT-like token = SHA256(username + passwordHash + salt). Guests can browse + view comments. Logged-in users can upload/edit/delete/comment. Admin can manage users + delete comments
10. **User store**: SQLite `users` table. Admin seeded from `.env` on first run. Password stored as SHA256 hash
11. **Comments**: SQLite `comments` table keyed by photo URL. Threaded replies (flat 2-level tree). Supports emoji. Inline reply box appended to `.comment-main` (not flex parent) to prevent layout issues. Visible to all, posting requires login, deleting requires admin
12. **i18n**: Chinese (default) / English toggle. Map labels translate via `PROVINCE_EN` mapping + ECharts label formatter
13. **Themes**: 5 themes (Light default, Dark, Mocha, Nord, Berry) via CSS custom properties on `[data-theme]`
14. **CORS**: Middleware on all routes, configurable origin via `.env`
15. **Upload limit**: Max 50 files per upload batch. Frontend enforces with toast + visual hint. Upload shows circular SVG progress indicator (percentage + count)
16. **Upload UX split**: Desktop shows a click-to-select zone; mobile shows separate "From Album" + "Take Photo" buttons. Device detection via `navigator.userAgent` + `maxTouchPoints`
17. **Province name safety**: `ADCODE_TO_PROVINCE` and `PROVINCE_LIST` filter by official suffix regex (`/[省市]$|自治区$|特别行政区$/`) to prevent short names (e.g. "内蒙古") from overriding full names (e.g. "内蒙古自治区") and creating wrong directories

## Mobile-specific behaviors
- **Touch handling**: `#map` has `touch-action: none` to prevent browser zoom interference. ECharts `roam` set to `'move'` only (no pinch zoom)
- **Zoom controls**: `+` / `−` buttons in bottom-right corner of map (visible only on mobile `@media max-width: 768px`)
- **GeoJSON loading**: Smaller batch size (2 concurrent vs 4) with longer delays (300ms vs 80ms) to avoid overwhelming mobile network
- **ECharts tooltip**: `z-index: 100` + `confine: true` to prevent tooltip from showing through modals. Hidden on preview open via `chart.dispatchAction({type:'hideTip'})`
- **Overlay performance**: `contain: layout style` on `#photo-overlay`. No CSS transitions on overlay elements except `:hover`. Throttled `onGeoRoam` (80ms) to reduce redraws
- **Upload controls**: Separate "From Album" (`accept="image/*" multiple`) and "Take Photo" (`capture="environment"`) buttons, hidden on desktop

## Build & run
```bash
go build -o main.exe .    # compile (requires go modules)
./main.exe                # start server, auto-opens browser
# or just: start.bat
```

## Conventions
- Console output in English to avoid Windows cmd encoding issues
- Filenames are nanosecond timestamps to avoid collisions
- Path traversal protection on province/city params (reject `..`, `/`, `\`)
- Allowed image types: jpg, jpeg, png, gif, webp, bmp (max 20MB per file, max 50 files per batch)
- Auth token sent via `Authorization: Bearer` header (never in URL or form body)
- All write API errors return JSON `{"error": "message"}`
- GeoJSON proxy validates adcode as exactly 6 digits to prevent SSRF
