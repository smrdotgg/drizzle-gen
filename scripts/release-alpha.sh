#!/bin/bash
git add .
git commit -m "alpha: $1"
npm version prerelease --preid=alpha
npm publish --tag alpha
git push

