@echo off
setlocal enabledelayedexpansion

echo Building EconomiaCasera...

REM Build frontend
cd frontend
bun run build
cd ..

REM Compile executable for Windows
mkdir dist\release 2>nul
bun build --compile --target=bun-windows-x64 src/server.ts --outfile dist/release/economiacasera.exe

REM Copy frontend static files next to executable
mkdir dist\release\dist 2>nul
xcopy /E /I /Y dist\assets dist\release\dist\assets
xcopy /Y dist\index.html dist\release\dist\

echo Done. Distribution ready in dist/release/
pause
