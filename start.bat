@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo ==========================================
echo    China Photo Wall - Starting...
echo ==========================================
echo.

if not exist main.exe (
    echo [INFO] main.exe not found, trying go build...
    where go >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Go is not installed and main.exe not found.
        echo Please install Go or build first: go build -o main.exe main.go
        pause
        exit /b 1
    )
    go build -o main.exe .
    if %errorlevel% neq 0 (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
    echo [INFO] Build success.
)

echo [INFO] Starting server at http://localhost:8080
echo [INFO] Press Ctrl+C to stop.
echo.
main.exe
pause
