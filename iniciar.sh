#!/bin/bash
cd "$(dirname "$0")"
exec bun run src/server.ts
