#!/bin/bash
npm run build
git add .
git commit -m "debug: $1"
npm version prerelease --preid=debug
npm publish --tag debug
git push

