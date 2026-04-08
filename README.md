# China Photo Wall

[English](./README.md) | [简体中文](./README.zh-CN.md)

Display your photo journey on an interactive China map. Upload photos tagged with provinces and cities, and they'll automatically appear at the corresponding locations on the map. Features multi-user support, comment interactions, automatic photo metadata extraction, and more.

![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-embedded-003B57?logo=sqlite&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-5.x-AA344D?logo=apache-echarts&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Key Features

### 🗺️ Interactive Map
- **Province & City Level Display** - Smooth zoom and pan to explore each city
- **Geographic Photo Markers** - Photo thumbnails displayed at map locations
- **Smart Clustering** - Automatically handles multiple photos at the same location
- **Auto Capital Matching** - Defaults to provincial capital when city not specified

### 📸 Photo Management
- **Easy Upload** - Supports JPG, PNG, GIF, WebP, BMP formats, up to 20MB per file
- **Metadata Extraction** - Automatically reads shooting time, camera model, resolution
- **Flexible Editing** - Edit descriptions, move photos between cities, delete photos
- **Secure Storage** - Local filesystem storage, full control of your data

### 🖼️ Photo Viewer
- **Fullscreen Viewer** - Immersive browsing experience
- **Keyboard Navigation** - Arrow keys to switch photos, ESC to close
- **Zoom & Rotate** - Mouse wheel zoom, photo rotation support
- **Responsive Design** - Adapts to desktop and mobile devices

### 💬 Interactive Comments
- **Photo Comments** - Leave comments on any photo
- **Emoji Support** - Built-in 200+ emoji expressions
- **Guest Friendly** - Guests can view comments, logged-in users can post

### 👥 User System
- **Role Management** - Three-tier permissions: Guest, User, Admin
- **Secure Authentication** - Encrypted password storage and session management
- **User Administration** - Admins can add users and reset passwords
- **Self-Contained** - Embedded database, no external services required

### 🌍 Personalization
- **Bilingual Interface** - Switch between Chinese and English with map label translation
- **5 Themes** - Choose from Light, Dark, Mocha, Nord, Berry
- **Cross-Platform** - Full support for Windows, macOS, Linux

## 🚀 Quick Start

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

## ⚙️ Configuration

Edit the `.env` file to configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `AUTH_ENABLED` | `true` | Enable user authentication |
| `ADMIN_USERNAME` | `admin` | Admin username |
| `ADMIN_PASSWORD` | `changeme` | Admin password |
| `API_BASE_URL` | *(empty)* | Remote API URL (optional) |
| `CORS_ORIGIN` | `*` | CORS origin setting |

## 📁 Project Structure

```
my-travel-photo-wall/
  main.go              # Backend service
  static/              # Frontend assets
    index.html
    style.css
    app.js
  data/                # Database
    photowall.db
  photos/              # Photo storage
    {province}/
      {city}/
        *.jpg/png/...
```

## 🏗️ Technical Features

- **Single-File Deployment** - No additional database or service installation required
- **Local Storage** - All data stored locally, complete control over your data
- **Lightweight & Efficient** - Embedded database, fast startup, low resource usage
- **Cross-Platform** - Supports Windows, macOS, Linux
- **Modern Frontend** - Interactive map visualization powered by ECharts

## 🔐 Access Control

| Role | Browse | Comment | Upload/Edit/Delete | Manage Users |
|------|--------|---------|-------------------|--------------|
| Guest | ✅ Yes | 👁️ View only | ❌ No | ❌ No |
| User | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Admin | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## License

MIT
