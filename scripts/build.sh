#!/bin/bash
set -e

echo "Building EconomiaCasera..."

# Build frontend
bun run build

# Compile executable for current platform
mkdir -p dist/release
bun build --compile src/server.ts --outfile dist/release/economiacasera

# Copy frontend static files next to executable
cp -r dist/assets dist/release/dist/
cp dist/index.html dist/release/dist/

echo "Done. Distribution ready in dist/release/"
