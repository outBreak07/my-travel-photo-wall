# China Photo Wall

[English](./README.md) | [简体中文](./README.zh-CN.md)

Display your photo journey on an interactive China map. Upload photos tagged with provinces and cities, and they'll automatically appear at the corresponding locations on the map. Features multi-user support, comment interactions, automatic photo metadata extraction, and full mobile support.

![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-embedded-003B57?logo=sqlite&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-5.x-AA344D?logo=apache-echarts&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## Screenshots

| Map Overview | Zoom into Cities |
|:---:|:---:|
| ![Map Overview](docs/images/map-overview.png) | ![Map Zoom](docs/images/map-zoom-overview.png) |

| Photo Viewer | Upload & Management |
|:---:|:---:|
| ![Photo Viewer](docs/images/photo-viewer.png) | ![Upload](docs/images/upload.png) |

## Key Features

### Interactive Map
- **Province & City Level Display** - Smooth zoom and pan to explore each city
- **Geographic Photo Markers** - Photo thumbnails displayed at map locations
- **Smart Clustering** - Automatically handles multiple photos at the same location
- **Capital City Highlighting** - Provincial capitals always show a prominent blue dot indicator
- **Auto Capital Matching** - Defaults to provincial capital when city not specified

### Photo Management
- **Batch Upload** - Upload up to 50 photos at once with real-time progress indicator, supports JPG, PNG, GIF, WebP, BMP (max 20MB each)
- **Metadata Extraction** - Automatically reads shooting time, camera model, resolution
- **Separate Edit Modal** - Clean viewer with dedicated edit dialog for descriptions and city reassignment
- **Secure Storage** - Local filesystem storage, full control of your data

### Photo Viewer
- **Fixed-Size Viewer** - Consistent window (1100px x 92vh) with images always fitting within bounds
- **Keyboard Navigation** - Arrow keys to switch photos, ESC to close
- **Zoom & Rotate** - Mouse wheel zoom, toolbar controls, photo rotation support
- **Responsive Design** - Full-screen on mobile with stable navigation buttons

### Interactive Comments
- **Threaded Replies** - Reply to specific comments with nested conversations
- **Emoji Support** - Built-in 200+ emoji expressions with inline picker
- **Guest Friendly** - Guests can view comments, logged-in users can post

### User System
- **Role Management** - Three-tier permissions: Guest, User, Admin
- **Avatar System** - Choose from default avatars or upload custom ones
- **Secure Authentication** - Encrypted password storage and session management
- **User Administration** - Admins can add users, reset passwords, edit display names

### Mobile Support
- **Touch-Optimized Map** - Drag to pan, dedicated +/- buttons for zoom
- **Mobile Upload** - Separate "From Album" (multi-select) and "Take Photo" (camera) buttons
- **GeoJSON Proxy** - Server-side proxy eliminates mobile browser CDN access issues (403 errors)
- **Responsive Layout** - Full-screen modals, compact header, optimized touch targets
- **Performance Tuned** - Throttled overlay updates, reduced network concurrency on mobile

### Personalization
- **Bilingual Interface** - Switch between Chinese and English with map label translation
- **5 Themes** - Choose from Light, Dark, Mocha, Nord, Berry
- **Cross-Platform** - Full support for Windows, macOS, Linux

## Quick Start

### Prerequisites
- [Go 1.21+](https://golang.org/dl/)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd my-travel-photo-wall

# Configure admin account
cp .env.example .env
# Edit .env file to set admin username and password

# Build and run
go build -o main.exe .
./main.exe
```

The application will automatically open your browser at `http://localhost:8080`

**Windows users**: Simply double-click `start.bat`

## Configuration

Edit the `.env` file to configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `AUTH_ENABLED` | `true` | Enable user authentication |
| `ADMIN_USERNAME` | `admin` | Admin username |
| `ADMIN_PASSWORD` | `changeme` | Admin password |
| `API_BASE_URL` | *(empty)* | Remote API URL (optional) |
| `CORS_ORIGIN` | `*` | CORS origin setting |

## Project Structure

```
my-travel-photo-wall/
  main.go              # Backend service (API, auth, GeoJSON proxy, EXIF)
  static/              # Frontend assets
    index.html         # SPA with all modals (upload, preview, edit, login, users, avatar)
    style.css          # 5 themes, responsive layout
    app.js             # Map, overlay, auth, comments, i18n
    china.json         # Local China GeoJSON
    echarts.min.js     # ECharts bundle
    avatars/           # Default avatar SVGs
  data/                # Database & cache
    photowall.db       # SQLite (users, comments)
    geo/               # Cached GeoJSON from DataV CDN
  photos/              # Photo storage
    {province}/
      {city}/
        meta.json
        *.jpg/png/...
```

## Technical Features

- **Single-File Deployment** - No additional database or service installation required
- **GeoJSON Proxy** - Backend proxies DataV CDN with caching, solving mobile 403 issues
- **Local Storage** - All data stored locally, complete control over your data
- **Lightweight & Efficient** - Embedded database, fast startup, low resource usage
- **Overlay Performance** - Throttled updates, no CSS transitions during drag, `contain` for efficient repaints
- **Cross-Platform** - Supports Windows, macOS, Linux
- **Modern Frontend** - Interactive map visualization powered by ECharts

## Access Control

| Role | Browse | Comment | Upload/Edit/Delete | Manage Users |
|------|--------|---------|-------------------|--------------|
| Guest | Yes | View only | No | No |
| User | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes |

## License

MIT
