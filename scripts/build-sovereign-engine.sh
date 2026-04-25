#!/bin/bash
# PiWorker-OS: Sovereign Engine Build Script
# Goal: Produce a zero-dependency static binary.

set -euo pipefail

echo "👑 [Sovereign Build] Starting Gopher Awakening..."

# Set directory to the sidecar
cd sidecar/sovereign-engine

# Disable CGO for absolute portability and use static linking
export CGO_ENABLED="${CGO_ENABLED:-0}"
export GOOS="${GOOS:-linux}"
export GOARCH="${GOARCH:-arm64}"

ARTIFACT_NAME="sovereign-engine-${GOOS}-${GOARCH}"
ARTIFACT_PATH="../../bin/${ARTIFACT_NAME}"

echo "📦 [Sovereign Build] Compiling Static Binary (${ARTIFACT_NAME})..."

# Ensure bin directory exists
mkdir -p ../../bin

# Build command with flags to reduce size and strip debug info
go build -ldflags="-s -w -extldflags '-static'" -o "${ARTIFACT_PATH}" main.go

echo "✅ [Success] Sovereign Engine built at: bin/${ARTIFACT_NAME}"
echo "🏷️ [Artifact] Naming convention: sovereign-engine-<goos>-<goarch>"
echo "🚀 [Status] Ready for deployment. Zero dependencies required."
