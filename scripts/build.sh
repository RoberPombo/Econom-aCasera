#!/bin/bash
set -e

APP_VERSION="${APP_VERSION:-0.0.0-local}"

echo "Building EconomiaCasera v${APP_VERSION}..."

# Build frontend
bun run build

# Compile executable for current platform
mkdir -p dist/release
bun build --compile --minify --sourcemap --define APP_VERSION='"'"${APP_VERSION}"'"' src/server.ts --outfile dist/release/economiacasera

# Copy frontend static files next to executable
cp -r dist/assets dist/release/dist/
cp dist/index.html dist/release/dist/

echo "Done. Distribution ready in dist/release/"
