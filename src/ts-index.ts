#!/usr/bin/env bun

import { watchFile } from "fs";
import { run } from "./main";
import { schemaName } from "./utils/config";
import { getDependencies } from "./utils/get-dependencies";

const args = process.argv.slice(2);
const isWatchMode = args.includes("-w") || args.includes("--watch");

if (isWatchMode) {
  const dependencies = [schemaName, ...(await getDependencies(schemaName))];
  console.log(`[watch] Watching ${dependencies.length} file(s) for changes...`);
  console.log(`[watch] Dependencies:`, dependencies);

  for (const dep of dependencies) {
    watchFile(dep, { interval: 1000 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`[watch] File modified: ${dep}`);
        console.log(`[watch] Re-running...`);
        await run();
        console.log(`[watch] Watching for changes...`);
      }
    });
  }

  await run();
} else {
  await run();
}
