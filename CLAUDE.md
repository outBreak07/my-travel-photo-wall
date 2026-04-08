# China Photo Wall

## What is this
A local-first photo wall app overlaid on an interactive China map. Users upload photos tagged by province/city, and thumbnails appear at the correct geographic positions on the map. Zooming in reveals city-level detail. Supports multi-user auth, comments, EXIF metadata extraction, i18n, and multiple themes.

## Tech stack
- **Backend**: Go server (`main.go`) with SQLite (`modernc.org/sqlite`) + EXIF reader (`goexif`)
- **Frontend**: Vanilla HTML/CSS/JS + ECharts 5.x (CDN)
- **Database**: SQLite (`data/photowall.db`) for users and comments
- **Storage**: Filesystem for photos (`photos/` directory), metadata in `meta.json` per folder
- **Config**: `.env` file for server settings

## Project structure
```
main.go              # Go HTTP server: all API handlers, auth, CORS, EXIF extraction
go.mod / go.sum      # Go module dependencies
.env                 # Config: port, auth, admin credentials, CORS, remote API URL
start.bat            # Windows one-click launcher
static/
  index.html         # Single page app with all modals (upload, preview, login, users)
  style.css          # 5 themes via CSS variables, responsive layout
  app.js             # ECharts map, overlay, auth, comments, i18n, viewer controls
data/
  photowall.db       # SQLite database (users table, comments table)
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
| POST | `/api/comments/add` | `{photoUrl, content}` |

### Require admin role
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users/add` | `{username, password, role}` |
| POST | `/api/admin/users/delete` | `{username}` (can't delete self) |
| POST | `/api/admin/users/reset-password` | `{username, newPassword}` |
| POST | `/api/comments/delete` | `{id}` |

## Key behaviors
1. **Single map, no switching**: Always renders the China national map. Zooming in past 3.2x triggers city-level overlays
2. **Auto city loading**: All provinces' GeoJSON preloaded in background batches from DataV CDN, cached
3. **Capital city default**: When no city selected on upload, backend auto-assigns provincial capital. Frontend also auto-selects capital in dropdown via `resolveCapitalGeoName()`
4. **Photo overlay**: Up to 5 thumbnails per province/city as HTML divs via `chart.convertToPixel()`, updated per frame via `requestAnimationFrame`. Distance culling prevents overlapping city markers
5. **EXIF extraction**: On upload, server reads EXIF (date, camera make/model, dimensions) + file size. Falls back to file modification time if no EXIF date. Backfills missing metadata for older photos on list API
6. **Photo viewer**: Fixed-size window (1100x92vh), prev/next navigation (arrow keys + click), zoom in/out (magnifying glass icons + mouse wheel), rotate, fullscreen, ESC to close
7. **Auth system**: JWT-like token = SHA256(username + passwordHash + salt). Guests can browse + view comments. Logged-in users can upload/edit/delete/comment. Admin can manage users + delete comments
8. **User store**: SQLite `users` table. Admin seeded from `.env` on first run. Password stored as SHA256 hash
9. **Comments**: SQLite `comments` table keyed by photo URL. Supports emoji. Visible to all, posting requires login, deleting requires admin
10. **i18n**: Chinese (default) / English toggle. Map labels translate via `PROVINCE_EN` mapping + ECharts label formatter
11. **Themes**: 5 themes (Light default, Dark, Mocha, Nord, Berry) via CSS custom properties on `[data-theme]`
12. **CORS**: Middleware on all routes, configurable origin via `.env`

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
- Allowed image types: jpg, jpeg, png, gif, webp, bmp (max 20MB)
- Auth token sent via `Authorization: Bearer` header (never in URL or form body)
- All write API errors return JSON `{"error": "message"}`
