# Release Guide for drizzle-gen

## Quick Release (One Command)

Run this single command to publish:

```bash
npm run release
```

This will:

1. ✅ Build binaries for all platforms (macOS ARM64/x64, Linux x64/ARM64, Windows x64)
2. ✅ Bump version (patch by default)
3. ✅ Commit changes
4. ✅ Create git tag
5. ✅ Push to GitHub
6. ✅ Publish to npm

## What Your Users Experience

After publishing, users can simply run:

```bash
# Any of these work automatically:
npx drizzle-gen
bunx drizzle-gen
pnpx drizzle-gen
yarn dlx drizzle-gen

# Or install globally:
npm install -g drizzle-gen
drizzle-gen
```

The package will:

- Download the correct binary for their platform automatically
- Run it immediately - no setup needed
- Work on macOS (Intel & Apple Silicon), Linux (x64 & ARM64), and Windows (x64)

## Version Types

If you want more control over the version bump:

```bash
# Patch release: 1.0.0 → 1.0.1 (bug fixes)
npm run release patch

# Minor release: 1.0.0 → 1.1.0 (new features)
npm run release minor

# Major release: 1.0.0 → 2.0.0 (breaking changes)
npm run release major
```

## Manual Steps (if needed)

If you prefer to do it manually:

```bash
# 1. Build binaries
npm run build:binary:all

# 2. Bump version
npm version patch  # or minor/major

# 3. Commit and tag
git add .
git commit -m "release: $(npm pkg get version | tr -d '"')"
git tag -a "v$(npm pkg get version | tr -d '"')" -m "Release v$(npm pkg get version | tr -d '"')"

# 4. Push
git push origin main
git push origin --tags

# 5. Publish
npm publish --access public
```

## Troubleshooting

**Binary not found error?**
Make sure `bin/` directory contains all platform binaries before publishing:

```bash
npm run build:binary:all
ls -lh bin/
```

**Want to test locally first?**

```bash
npm run build:binary
./bin/drizzle-gen --help
```

**Need to unpublish?**

```bash
npm unpublish drizzle-gen@<version>
```

## Pre-requisites

1. ✅ Logged into npm: `npm login`
2. ✅ Git configured: `git config user.name "Your Name" && git config user.email "you@example.com"`
3. ✅ Bun installed: `bun --version` (needed for building binaries)
4. ✅ Write access to the GitHub repo

## First-time Setup

If this is your first release:

```bash
# Make sure you're logged into npm
npm login

# Check current version
npm pkg get version

# Run the release
npm run release
```

That's it! After publishing, your users can immediately use:

```bash
npx drizzle-gen
```
