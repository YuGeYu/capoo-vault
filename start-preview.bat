@echo off
setlocal

cd /d "%~dp0"

echo [preview] Entering project directory...

if not exist "package.json" (
  echo [preview] package.json not found. Please keep this file in the project root.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [preview] node_modules not found. Please run npm install first.
  pause
  exit /b 1
)

set "PREVIEW_URL=http://127.0.0.1:8787/tools/remove-bg"
set "LOG_FILE=%~dp0.wrangler-dev.out.log"
set "ERR_FILE=%~dp0.wrangler-dev.err.log"

echo [preview] Preparing local D1 database...
call npm run db:migrate:local
if errorlevel 1 (
  echo [preview] Local D1 migration failed.
  pause
  exit /b 1
)

echo [preview] Starting local Worker preview in a new window...
start "MMC Preview" cmd /k "cd /d ""%~dp0"" && npm run dev 1> "".wrangler-dev.out.log"" 2> "".wrangler-dev.err.log"""

echo [preview] Waiting for local server startup...
timeout /t 8 /nobreak >nul

echo [preview] Opening %PREVIEW_URL%
start "" "%PREVIEW_URL%"

echo [preview] Done.
echo [preview] If the page does not load yet, wait a few more seconds and refresh.
echo [preview] Log files:
echo [preview]   %LOG_FILE%
echo [preview]   %ERR_FILE%
pause

endlocal
