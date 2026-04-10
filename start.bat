@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo ==========================================
echo    China Photo Wall - Starting...
echo ==========================================
echo.

echo [INFO] Building...
go build -o main.exe . 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Build failed or Go not installed, checking main.exe...
    if not exist main.exe (
        echo [ERROR] main.exe not found. Please install Go first.
        pause
        exit /b 1
    )
    echo [INFO] Using existing main.exe
) else (
    echo [INFO] Build success.
)

echo [INFO] Starting server at http://localhost:8080
echo [INFO] Press Ctrl+C to stop.
echo.
main.exe
pause
