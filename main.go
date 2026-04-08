package main

import (
	"bufio"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	goexif "github.com/rwcarlsen/goexif/exif"
	_ "modernc.org/sqlite"
)

const (
	photosDir = "photos"
	staticDir = "static"
	envFile   = ".env"
	dataDir   = "data"
	dbFile    = "data/photowall.db"
)

var metaMu sync.Mutex
var db *sql.DB

// Config from .env
var (
	port          = ":8080"
	authEnabled   = true
	adminUsername = "admin"
	adminPassword = "photowall2024"
	apiBaseURL    = "" // remote backend URL, empty = local
	corsOrigin    = "*" // CORS allowed origin, * = all
)

var provinceCapitals = map[string]string{
	"北京市": "北京市", "天津市": "天津市", "上海市": "上海市", "重庆市": "重庆市",
	"河北省": "石家庄市", "山西省": "太原市", "内蒙古自治区": "呼和浩特市",
	"辽宁省": "沈阳市", "吉林省": "长春市", "黑龙江省": "哈尔滨市",
	"江苏省": "南京市", "浙江省": "杭州市", "安徽省": "合肥市",
	"福建省": "福州市", "江西省": "南昌市", "山东省": "济南市",
	"河南省": "郑州市", "湖北省": "武汉市", "湖南省": "长沙市",
	"广东省": "广州市", "广西壮族自治区": "南宁市", "海南省": "海口市",
	"四川省": "成都市", "贵州省": "贵阳市", "云南省": "昆明市",
	"西藏自治区": "拉萨市", "陕西省": "西安市", "甘肃省": "兰州市",
	"青海省": "西宁市", "宁夏回族自治区": "银川市", "新疆维吾尔自治区": "乌鲁木齐市",
	"台湾省": "台北市", "香港特别行政区": "香港特别行政区", "澳门特别行政区": "澳门特别行政区",
}

// ---- .env loading ----

func loadEnv() {
	f, err := os.Open(envFile)
	if err != nil {
		fmt.Printf("[WARN] %s not found, using defaults\n", envFile)
		return
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key, val := strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
		switch key {
		case "PORT":
			if val != "" {
				if !strings.HasPrefix(val, ":") {
					val = ":" + val
				}
				port = val
			}
		case "AUTH_ENABLED":
			authEnabled = val == "true" || val == "1"
		case "ADMIN_USERNAME":
			adminUsername = val
		case "ADMIN_PASSWORD":
			adminPassword = val
		case "API_BASE_URL":
			apiBaseURL = strings.TrimRight(val, "/")
		case "CORS_ORIGIN":
			corsOrigin = val
		}
	}
}

// ---- Crypto helpers ----

func hashPassword(password string) string {
	h := sha256.Sum256([]byte(password))
	return fmt.Sprintf("%x", h)
}

// ---- Sessions (in-memory) ----

var sessions = map[string]string{} // sessionID → username
var sessionsMu sync.Mutex

func createSession(username string) string {
	h := sha256.Sum256([]byte(fmt.Sprintf("%s:%d", username, time.Now().UnixNano())))
	sid := fmt.Sprintf("%x", h)
	sessionsMu.Lock()
	sessions[sid] = username
	sessionsMu.Unlock()
	return sid
}

func deleteSession(sid string) {
	sessionsMu.Lock()
	delete(sessions, sid)
	sessionsMu.Unlock()
}

func getUserFromSession(sid string) *User {
	if sid == "" {
		return nil
	}
	sessionsMu.Lock()
	username, ok := sessions[sid]
	sessionsMu.Unlock()
	if !ok {
		return nil
	}
	return findUserByName(username)
}

// ---- SQLite DB ----

func initDB() {
	os.MkdirAll(dataDir, 0755)
	var err error
	db, err = sql.Open("sqlite", dbFile)
	if err != nil {
		fmt.Printf("[ERROR] Failed to open database: %v\n", err)
		os.Exit(1)
	}
	// Create users table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'user',
			created_at TEXT NOT NULL
		)
	`)
	if err != nil {
		fmt.Printf("[ERROR] Failed to create users table: %v\n", err)
		os.Exit(1)
	}
	// Create comments table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			photo_url TEXT NOT NULL,
			username TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TEXT NOT NULL
		)
	`)
	if err != nil {
		fmt.Printf("[ERROR] Failed to create comments table: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("[INFO] Database initialized: " + dbFile)
}

func seedAdminUser() {
	var count int
	db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", adminUsername).Scan(&count)
	if count > 0 {
		// Always sync password and role from .env
		_, err := db.Exec("UPDATE users SET password_hash = ?, role = 'admin' WHERE username = ?",
			hashPassword(adminPassword), adminUsername)
		if err != nil {
			fmt.Printf("[WARN] Failed to update admin password: %v\n", err)
		} else {
			fmt.Printf("[INFO] Admin user '%s' password synced from .env\n", adminUsername)
		}
		return
	}
	_, err := db.Exec(
		"INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, 'admin', ?)",
		adminUsername, hashPassword(adminPassword), time.Now().Format("2006-01-02 15:04:05"),
	)
	if err != nil {
		fmt.Printf("[WARN] Failed to seed admin: %v\n", err)
		return
	}
	fmt.Printf("[INFO] Admin user '%s' seeded from .env\n", adminUsername)
}

type User struct {
	ID           int
	Username     string
	PasswordHash string
	Role         string
	CreatedAt    string
}

func findUserByName(username string) *User {
	u := &User{}
	err := db.QueryRow("SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?", username).
		Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil
	}
	return u
}

// ---- CORS middleware ----

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", corsOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ---- Auth middleware ----

func getSessionFromRequest(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}
	return ""
}

func getRequestUser(r *http.Request) *User {
	return getUserFromSession(getSessionFromRequest(r))
}

func requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !authEnabled {
			next(w, r)
			return
		}
		if getRequestUser(r) == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}
		next(w, r)
	}
}

func requireAdminRole(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !authEnabled {
			next(w, r)
			return
		}
		user := getRequestUser(r)
		if user == nil || user.Role != "admin" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "admin required"})
			return
		}
		next(w, r)
	}
}

// ---- Auth handlers ----

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	user := findUserByName(req.Username)
	if user == nil || user.PasswordHash != hashPassword(req.Password) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid credentials"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok", "session": createSession(user.Username),
		"username": user.Username, "role": user.Role,
	})
}

func handleAuthCheck(w http.ResponseWriter, r *http.Request) {
	var username, role string
	var loggedIn bool
	if !authEnabled {
		loggedIn = true
		role = "admin"
	} else {
		user := getRequestUser(r)
		if user != nil {
			loggedIn = true
			username = user.Username
			role = user.Role
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"authEnabled": authEnabled, "loggedIn": loggedIn, "username": username, "role": role,
	})
}

func handleConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"apiBaseUrl":  apiBaseURL,
		"authEnabled": authEnabled,
	})
}

// ---- User management ----

func handleListUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT username, role, created_at FROM users ORDER BY id")
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type UserInfo struct {
		Username  string `json:"username"`
		Role      string `json:"role"`
		CreatedAt string `json:"createdAt"`
	}
	var result []UserInfo
	for rows.Next() {
		var u UserInfo
		rows.Scan(&u.Username, &u.Role, &u.CreatedAt)
		result = append(result, u)
	}
	if result == nil {
		result = []UserInfo{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleAddUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Username == "" || req.Password == "" {
		http.Error(w, "username and password required", http.StatusBadRequest)
		return
	}
	if req.Role == "" {
		req.Role = "user"
	}
	_, err := db.Exec(
		"INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
		req.Username, hashPassword(req.Password), req.Role, time.Now().Format("2006-01-02 15:04:05"),
	)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "user already exists"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleDeleteUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	caller := getRequestUser(r)
	if caller != nil && caller.Username == req.Username {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "cannot delete yourself"})
		return
	}
	res, _ := db.Exec("DELETE FROM users WHERE username = ?", req.Username)
	if n, _ := res.RowsAffected(); n == 0 {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Username    string `json:"username"`
		NewPassword string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Username == "" || req.NewPassword == "" {
		http.Error(w, "username and newPassword required", http.StatusBadRequest)
		return
	}
	res, _ := db.Exec("UPDATE users SET password_hash = ? WHERE username = ?", hashPassword(req.NewPassword), req.Username)
	if n, _ := res.RowsAffected(); n == 0 {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// ---- Comment handlers ----

func handleGetComments(w http.ResponseWriter, r *http.Request) {
	photoURL := r.URL.Query().Get("photo")
	if photoURL == "" {
		http.Error(w, "photo param required", http.StatusBadRequest)
		return
	}
	rows, err := db.Query("SELECT id, username, content, created_at FROM comments WHERE photo_url = ? ORDER BY id ASC", photoURL)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type Comment struct {
		ID        int    `json:"id"`
		Username  string `json:"username"`
		Content   string `json:"content"`
		CreatedAt string `json:"createdAt"`
	}
	var result []Comment
	for rows.Next() {
		var c Comment
		rows.Scan(&c.ID, &c.Username, &c.Content, &c.CreatedAt)
		result = append(result, c)
	}
	if result == nil {
		result = []Comment{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleAddComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		PhotoURL string `json:"photoUrl"`
		Content  string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.PhotoURL == "" || strings.TrimSpace(req.Content) == "" {
		http.Error(w, "photoUrl and content required", http.StatusBadRequest)
		return
	}
	user := getRequestUser(r)
	username := "anonymous"
	if user != nil {
		username = user.Username
	}
	now := time.Now().Format("2006-01-02 15:04:05")
	res, err := db.Exec("INSERT INTO comments (photo_url, username, content, created_at) VALUES (?, ?, ?, ?)",
		req.PhotoURL, username, strings.TrimSpace(req.Content), now)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok", "id": id, "username": username, "createdAt": now,
	})
}

func handleDeleteComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	db.Exec("DELETE FROM comments WHERE id = ?", req.ID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// ---- main ----

func main() {
	loadEnv()
	initDB()
	seedAdminUser()
	os.MkdirAll(photosDir, 0755)

	if authEnabled {
		fmt.Printf("[INFO] Auth enabled. Admin: %s\n", adminUsername)
	} else {
		fmt.Println("[INFO] Auth disabled. All users have full access.")
	}
	if apiBaseURL != "" {
		fmt.Printf("[INFO] Remote API backend: %s\n", apiBaseURL)
	}

	mux := http.NewServeMux()
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))
	mux.Handle("/photos/", http.StripPrefix("/photos/", http.FileServer(http.Dir(photosDir))))

	// Public
	mux.HandleFunc("/api/config", handleConfig)
	mux.HandleFunc("/api/photos", handleListPhotos)
	mux.HandleFunc("/api/provinces", handleListProvinces)
	mux.HandleFunc("/api/auth/login", handleLogin)
	mux.HandleFunc("/api/auth/check", handleAuthCheck)

	// Comments (get is public, post requires login, delete requires admin)
	mux.HandleFunc("/api/comments", handleGetComments)
	mux.HandleFunc("/api/comments/add", requireAuth(handleAddComment))
	mux.HandleFunc("/api/comments/delete", requireAdminRole(handleDeleteComment))

	// Require logged-in user
	mux.HandleFunc("/api/upload", requireAuth(handleUpload))
	mux.HandleFunc("/api/update-description", requireAuth(handleUpdateDescription))
	mux.HandleFunc("/api/delete", requireAuth(handleDelete))
	mux.HandleFunc("/api/move", requireAuth(handleMove))

	// Require admin role
	mux.HandleFunc("/api/admin/users", requireAdminRole(handleListUsers))
	mux.HandleFunc("/api/admin/users/add", requireAdminRole(handleAddUser))
	mux.HandleFunc("/api/admin/users/delete", requireAdminRole(handleDeleteUser))
	mux.HandleFunc("/api/admin/users/reset-password", requireAdminRole(handleResetPassword))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})

	go func() {
		time.Sleep(500 * time.Millisecond)
		url := "http://localhost" + port
		fmt.Printf("[OK] Server running at %s\n", url)
		openBrowser(url)
	}()

	fmt.Printf("[INFO] Starting server on port %s ...\n", port)
	if err := http.ListenAndServe(port, corsMiddleware(mux)); err != nil {
		fmt.Printf("[ERROR] Failed to start: %v\n", err)
		fmt.Println("Port may already be in use. Press Enter to exit.")
		fmt.Scanln()
	}
}

// ---- meta.json helpers ----

type MetaEntry struct {
	Description string `json:"description"`
	UploadedBy  string `json:"uploadedBy,omitempty"`
	TakenAt     string `json:"takenAt,omitempty"`
	Camera      string `json:"camera,omitempty"`
	Width       int    `json:"width,omitempty"`
	Height      int    `json:"height,omitempty"`
	FileSize    int64  `json:"fileSize,omitempty"`
}

func loadMeta(dir string) map[string]MetaEntry {
	metaMu.Lock()
	defer metaMu.Unlock()
	data, err := os.ReadFile(filepath.Join(dir, "meta.json"))
	if err != nil {
		return map[string]MetaEntry{}
	}
	var m map[string]MetaEntry
	json.Unmarshal(data, &m)
	if m == nil {
		return map[string]MetaEntry{}
	}
	return m
}

func saveMeta(dir string, m map[string]MetaEntry) {
	metaMu.Lock()
	defer metaMu.Unlock()
	data, _ := json.MarshalIndent(m, "", "  ")
	os.WriteFile(filepath.Join(dir, "meta.json"), data, 0644)
}

// ---- EXIF & image info extraction ----

func extractPhotoMeta(filePath string) (takenAt, camera string, width, height int, fileSize int64) {
	fi, err := os.Stat(filePath)
	if err == nil {
		fileSize = fi.Size()
	}

	f, err := os.Open(filePath)
	if err != nil {
		return
	}
	defer f.Close()

	// Try EXIF
	x, err := goexif.Decode(f)
	if err == nil {
		if t, err := x.DateTime(); err == nil {
			takenAt = t.Format("2006-01-02 15:04:05")
		}
		if make_, err := x.Get(goexif.Make); err == nil {
			camera = strings.Trim(make_.String(), "\"")
		}
		if model, err := x.Get(goexif.Model); err == nil {
			m := strings.Trim(model.String(), "\"")
			if camera != "" && !strings.Contains(m, camera) {
				camera = camera + " " + m
			} else if camera == "" {
				camera = m
			}
		}
		// Try EXIF dimensions
		if pw, err := x.Get(goexif.PixelXDimension); err == nil {
			if v, err := pw.Int(0); err == nil {
				width = v
			}
		}
		if ph, err := x.Get(goexif.PixelYDimension); err == nil {
			if v, err := ph.Int(0); err == nil {
				height = v
			}
		}
	}

	// Fallback: file modification time if no EXIF date
	if takenAt == "" && fi != nil {
		takenAt = fi.ModTime().Format("2006-01-02 15:04:05")
	}

	// Fallback: decode image config for dimensions if EXIF didn't have them
	if width == 0 || height == 0 {
		f.Seek(0, 0)
		cfg, _, err := image.DecodeConfig(f)
		if err == nil {
			width = cfg.Width
			height = cfg.Height
		}
	}
	return
}

// ---- Photo handlers ----

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	r.ParseMultipartForm(20 << 20)
	province := strings.TrimSpace(r.FormValue("province"))
	city := strings.TrimSpace(r.FormValue("city"))
	description := strings.TrimSpace(r.FormValue("description"))
	if province == "" {
		http.Error(w, "province is required", http.StatusBadRequest)
		return
	}
	for _, v := range []string{province, city} {
		if strings.Contains(v, "..") || strings.Contains(v, "/") || strings.Contains(v, "\\") {
			http.Error(w, "invalid parameter", http.StatusBadRequest)
			return
		}
	}
	if city == "" {
		if capital, ok := provinceCapitals[province]; ok {
			city = capital
		}
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file read error: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true, ".bmp": true}
	if !allowed[ext] {
		http.Error(w, "unsupported file type", http.StatusBadRequest)
		return
	}
	var dir string
	if city != "" {
		dir = filepath.Join(photosDir, province, city)
	} else {
		dir = filepath.Join(photosDir, province)
	}
	os.MkdirAll(dir, 0755)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dst, err := os.Create(filepath.Join(dir, filename))
	if err != nil {
		http.Error(w, "save failed", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)
	// Extract photo metadata (EXIF, dimensions, file size)
	savedPath := filepath.Join(dir, filename)
	takenAt, camera, imgW, imgH, fSize := extractPhotoMeta(savedPath)

	uploaderName := ""
	if user := getRequestUser(r); user != nil {
		uploaderName = user.Username
	}
	meta := loadMeta(dir)
	meta[filename] = MetaEntry{
		Description: description, UploadedBy: uploaderName,
		TakenAt: takenAt, Camera: camera,
		Width: imgW, Height: imgH, FileSize: fSize,
	}
	saveMeta(dir, meta)
	var photoPath string
	if city != "" {
		photoPath = fmt.Sprintf("/photos/%s/%s/%s", province, city, filename)
	} else {
		photoPath = fmt.Sprintf("/photos/%s/%s", province, filename)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "path": photoPath, "province": province, "city": city, "filename": filename})
}

type PhotoInfo struct {
	URL         string `json:"url"`
	Province    string `json:"province"`
	City        string `json:"city"`
	Filename    string `json:"filename"`
	Description string `json:"description"`
	UploadedBy  string `json:"uploadedBy"`
	TakenAt     string `json:"takenAt"`
	Camera      string `json:"camera"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	FileSize    int64  `json:"fileSize"`
}

// buildPhotoInfo creates a PhotoInfo, backfilling missing metadata from disk
func buildPhotoInfo(url, province, city, filename, dir string, m MetaEntry) PhotoInfo {
	p := PhotoInfo{
		URL: url, Province: province, City: city, Filename: filename,
		Description: m.Description, UploadedBy: m.UploadedBy,
		TakenAt: m.TakenAt, Camera: m.Camera,
		Width: m.Width, Height: m.Height, FileSize: m.FileSize,
	}
	// Backfill if metadata is missing (for photos uploaded before EXIF extraction)
	if p.Width == 0 || p.FileSize == 0 {
		takenAt, camera, w, h, fSize := extractPhotoMeta(filepath.Join(dir, filename))
		if p.TakenAt == "" {
			p.TakenAt = takenAt
		}
		if p.Camera == "" {
			p.Camera = camera
		}
		if p.Width == 0 {
			p.Width = w
		}
		if p.Height == 0 {
			p.Height = h
		}
		if p.FileSize == 0 {
			p.FileSize = fSize
		}
	}
	return p
}

func handleListPhotos(w http.ResponseWriter, r *http.Request) {
	province := r.URL.Query().Get("province")
	city := r.URL.Query().Get("city")
	for _, v := range []string{province, city} {
		if strings.Contains(v, "..") || strings.Contains(v, "/") || strings.Contains(v, "\\") {
			http.Error(w, "invalid parameter", http.StatusBadRequest)
			return
		}
	}
	var photos []PhotoInfo
	if province != "" && city != "" {
		dir := filepath.Join(photosDir, province, city)
		meta := loadMeta(dir)
		entries, _ := os.ReadDir(dir)
		for _, e := range entries {
			if !e.IsDir() && e.Name() != "meta.json" {
				photos = append(photos, buildPhotoInfo(fmt.Sprintf("/photos/%s/%s/%s", province, city, e.Name()), province, city, e.Name(), dir, meta[e.Name()]))
			}
		}
	} else if province != "" {
		provDir := filepath.Join(photosDir, province)
		provMeta := loadMeta(provDir)
		entries, _ := os.ReadDir(provDir)
		for _, e := range entries {
			if e.IsDir() {
				cityDir := filepath.Join(provDir, e.Name())
				cityMeta := loadMeta(cityDir)
				ces, _ := os.ReadDir(cityDir)
				for _, ce := range ces {
					if !ce.IsDir() && ce.Name() != "meta.json" {
						photos = append(photos, buildPhotoInfo(fmt.Sprintf("/photos/%s/%s/%s", province, e.Name(), ce.Name()), province, e.Name(), ce.Name(), cityDir, cityMeta[ce.Name()]))
					}
				}
			} else if e.Name() != "meta.json" {
				photos = append(photos, buildPhotoInfo(fmt.Sprintf("/photos/%s/%s", province, e.Name()), province, "", e.Name(), provDir, provMeta[e.Name()]))
			}
		}
	} else {
		provs, _ := os.ReadDir(photosDir)
		for _, p := range provs {
			if !p.IsDir() { continue }
			provDir := filepath.Join(photosDir, p.Name())
			provMeta := loadMeta(provDir)
			entries, _ := os.ReadDir(provDir)
			for _, e := range entries {
				if e.IsDir() {
					cityDir := filepath.Join(provDir, e.Name())
					cityMeta := loadMeta(cityDir)
					ces, _ := os.ReadDir(cityDir)
					for _, ce := range ces {
						if !ce.IsDir() && ce.Name() != "meta.json" {
							photos = append(photos, buildPhotoInfo(fmt.Sprintf("/photos/%s/%s/%s", p.Name(), e.Name(), ce.Name()), p.Name(), e.Name(), ce.Name(), cityDir, cityMeta[ce.Name()]))
						}
					}
				} else if e.Name() != "meta.json" {
					photos = append(photos, buildPhotoInfo(fmt.Sprintf("/photos/%s/%s", p.Name(), e.Name()), p.Name(), "", e.Name(), provDir, provMeta[e.Name()]))
				}
			}
		}
	}
	if photos == nil {
		photos = []PhotoInfo{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(photos)
}

func handleListProvinces(w http.ResponseWriter, r *http.Request) {
	type CityCount struct{ Name string `json:"name"`; Count int `json:"count"` }
	type ProvinceInfo struct{ Name string `json:"name"`; Count int `json:"count"`; Cities []CityCount `json:"cities"` }
	var result []ProvinceInfo
	provs, _ := os.ReadDir(photosDir)
	for _, p := range provs {
		if !p.IsDir() { continue }
		pi := ProvinceInfo{Name: p.Name()}
		entries, _ := os.ReadDir(filepath.Join(photosDir, p.Name()))
		pdc := 0
		for _, e := range entries {
			if e.IsDir() {
				ces, _ := os.ReadDir(filepath.Join(photosDir, p.Name(), e.Name()))
				c := 0
				for _, ce := range ces { if !ce.IsDir() && ce.Name() != "meta.json" { c++ } }
				if c > 0 { pi.Cities = append(pi.Cities, CityCount{Name: e.Name(), Count: c}); pi.Count += c }
			} else if e.Name() != "meta.json" { pdc++ }
		}
		if pdc > 0 { pi.Cities = append([]CityCount{{Count: pdc}}, pi.Cities...); pi.Count += pdc }
		if pi.Count > 0 { result = append(result, pi) }
	}
	if result == nil { result = []ProvinceInfo{} }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleUpdateDescription(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { http.Error(w, "POST only", http.StatusMethodNotAllowed); return }
	var req struct{ Province, City, Filename, Description string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil { http.Error(w, "invalid JSON", http.StatusBadRequest); return }
	if req.Province == "" || req.Filename == "" { http.Error(w, "province and filename required", http.StatusBadRequest); return }
	for _, v := range []string{req.Province, req.City, req.Filename} { if strings.Contains(v, "..") || strings.Contains(v, "/") || strings.Contains(v, "\\") { http.Error(w, "invalid parameter", http.StatusBadRequest); return } }
	var dir string
	if req.City != "" { dir = filepath.Join(photosDir, req.Province, req.City) } else { dir = filepath.Join(photosDir, req.Province) }
	meta := loadMeta(dir); meta[req.Filename] = MetaEntry{Description: req.Description}; saveMeta(dir, meta)
	w.Header().Set("Content-Type", "application/json"); json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { http.Error(w, "POST only", http.StatusMethodNotAllowed); return }
	var req struct{ Province, City, Filename string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil { http.Error(w, "invalid JSON", http.StatusBadRequest); return }
	if req.Province == "" || req.Filename == "" { http.Error(w, "province and filename required", http.StatusBadRequest); return }
	for _, v := range []string{req.Province, req.City, req.Filename} { if strings.Contains(v, "..") || strings.Contains(v, "/") || strings.Contains(v, "\\") { http.Error(w, "invalid parameter", http.StatusBadRequest); return } }
	var dir string
	if req.City != "" { dir = filepath.Join(photosDir, req.Province, req.City) } else { dir = filepath.Join(photosDir, req.Province) }
	if err := os.Remove(filepath.Join(dir, req.Filename)); err != nil { http.Error(w, "delete failed", http.StatusInternalServerError); return }
	meta := loadMeta(dir); delete(meta, req.Filename); saveMeta(dir, meta)
	w.Header().Set("Content-Type", "application/json"); json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleMove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { http.Error(w, "POST only", http.StatusMethodNotAllowed); return }
	var req struct{ Province, OldCity, NewCity, Filename string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil { http.Error(w, "invalid JSON", http.StatusBadRequest); return }
	if req.Province == "" || req.Filename == "" || req.NewCity == "" { http.Error(w, "province, filename, newCity required", http.StatusBadRequest); return }
	for _, v := range []string{req.Province, req.OldCity, req.NewCity, req.Filename} { if strings.Contains(v, "..") || strings.Contains(v, "/") || strings.Contains(v, "\\") { http.Error(w, "invalid parameter", http.StatusBadRequest); return } }
	var oldDir string
	if req.OldCity != "" { oldDir = filepath.Join(photosDir, req.Province, req.OldCity) } else { oldDir = filepath.Join(photosDir, req.Province) }
	newDir := filepath.Join(photosDir, req.Province, req.NewCity); os.MkdirAll(newDir, 0755)
	if err := os.Rename(filepath.Join(oldDir, req.Filename), filepath.Join(newDir, req.Filename)); err != nil { http.Error(w, "move failed", http.StatusInternalServerError); return }
	oldMeta := loadMeta(oldDir); entry := oldMeta[req.Filename]; delete(oldMeta, req.Filename); saveMeta(oldDir, oldMeta)
	newMeta := loadMeta(newDir); newMeta[req.Filename] = entry; saveMeta(newDir, newMeta)
	w.Header().Set("Content-Type", "application/json"); json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	cmd.Start()
}
