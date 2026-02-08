#!/usr/bin/env bun

import { join } from "node:path";
import { $ } from "bun";
import { watchFile } from "fs";
import { getDependencies } from "./utils/get-dependencies";
import { drizzleConfigPath, schemaName } from "./utils/config";

const args = process.argv.slice(2);
const isWatchMode = args.includes("-w") || args.includes("--watch");

const main = () => $`bun ${join(__dirname, "main.ts")}`.nothrow();

if (isWatchMode) {
  const dependencies = [schemaName, ...(await getDependencies(schemaName))];
  console.log(`[watch] Watching ${dependencies.length} file(s) for changes...`);
  console.log(`[watch] Dependencies:`, dependencies);

  for (const dep of dependencies) {
    watchFile(dep, { interval: 1000 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`[watch] File modified: ${dep}`);
        console.log(`[watch] Re-running...`);
        await main();
        console.log(`[watch] Watching for changes...`);
      }
    });
  }

  await main();
} else {
  await main();
}
