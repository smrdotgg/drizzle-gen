#!/bin/bash

# Release script for drizzle-gen
# Usage: npm run release

set -e

echo "🚀 Building binaries for all platforms..."
npm run build:binary:all

echo ""
echo "📦 Creating release..."
echo "Current version: $(npm version --json | grep '"drizzle-gen"' | cut -d'"' -f4)"
echo ""
echo "Choose release type:"
echo "  1) patch (0.0.1 -> 0.0.2) - Bug fixes"
echo "  2) minor (0.0.1 -> 0.1.0) - New features"
echo "  3) major (0.0.1 -> 1.0.0) - Breaking changes"
echo ""

# For non-interactive usage, default to patch
if [ -z "$1" ]; then
  RELEASE_TYPE="patch"
else
  RELEASE_TYPE="$1"
fi

echo "Creating $RELEASE_TYPE release..."

# Version bump
NEW_VERSION=$(npm version $RELEASE_TYPE --no-git-tag-version)
echo "New version: $NEW_VERSION"

# Commit the version bump and binaries
git add package.json bin/
git commit -m "release: $NEW_VERSION"

# Tag the release
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# Push to remote
git push origin main
git push origin "$NEW_VERSION"

# Publish to npm
echo ""
echo "📤 Publishing to npm..."
npm publish --access public

echo ""
echo "✅ Released $NEW_VERSION successfully!"
echo ""
echo "Users can now install with:"
echo "  npm install -g drizzle-gen"
echo "  npx drizzle-gen"
