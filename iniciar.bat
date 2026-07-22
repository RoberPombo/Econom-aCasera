@echo off
cd /d "%~dp0"
bun run src/server.ts
pause
