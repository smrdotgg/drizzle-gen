#!/bin/bash

# Build script for creating platform-specific binaries
# Usage: ./scripts/build-binaries.sh

set -e

echo "🚀 Building drizzle-gen binaries..."

# Create output directory
mkdir -p bin

# Build for current platform first (for testing)
echo "📦 Building for current platform..."
bun build --compile ./src/ts-index.ts --outfile bin/drizzle-gen

# Cross-compile for other platforms if requested
if [ "$1" = "--all" ]; then
    echo "📦 Building for all platforms..."
    
    # macOS ARM64 (Apple Silicon)
    echo "  → macOS ARM64..."
    bun build --compile --target=bun-darwin-arm64 ./src/ts-index.ts --outfile bin/drizzle-gen-darwin-arm64
    
    # macOS x64 (Intel)
    echo "  → macOS x64..."
    bun build --compile --target=bun-darwin-x64 ./src/ts-index.ts --outfile bin/drizzle-gen-darwin-x64
    
    # Linux x64
    echo "  → Linux x64..."
    bun build --compile --target=bun-linux-x64 ./src/ts-index.ts --outfile bin/drizzle-gen-linux-x64

    # Linux ARM64 (Graviton, Raspberry Pi, etc.)
    echo "  → Linux ARM64..."
    bun build --compile --target=bun-linux-arm64 ./src/ts-index.ts --outfile bin/drizzle-gen-linux-arm64

    # Windows x64
    echo "  → Windows x64..."
    bun build --compile --target=bun-windows-x64 ./src/ts-index.ts --outfile bin/drizzle-gen-windows-x64.exe
    
    echo "✅ All binaries built successfully!"
else
    echo "✅ Binary built for current platform!"
    echo "💡 Use --all flag to build for all platforms"
fi

echo ""
echo "Binaries location: ./bin/"
ls -lh bin/
