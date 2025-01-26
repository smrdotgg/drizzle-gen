#!/usr/bin/env node
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync } from "fs";
import { watch } from "fs";
import { ChildProcess } from "child_process";
import { glob } from "glob";
import { schemaPath } from "./utils/schema-data";

import lodash from "lodash";
import { cwd } from "process";
const { debounce } = lodash;

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

console.log("[DEBUG] Starting script");
console.log("[DEBUG] Current directory:", __dirname);

// Get package.json
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

console.log("[DEBUG] Package version:", pkg.version);

if (!pkg.version.includes("alpha")) {
  console.log("In development.");
  console.log(
    "If you want to use the alpha version use the following command."
  );

  console.log("npx drizzle-gen@alpha");
  console.log("pnpm dlx drizzle-gen@alpha");
  console.log("yarn dlx drizzle-gen@alpha");
  console.log("bunx drizzle-gen@alpha");
  process.exit(0);
}

const spawnProcess = () => {
  console.log("[DEBUG] Spawning new process");
  return spawn(

    "npx",
    ["tsx", join(__dirname, "..", "src", "main.ts"), ...process.argv.slice(2)],
    { stdio: "inherit" }
  );
};


const watchAndRun = async (globPattern: string) => {
  console.log("[DEBUG] Starting watch with pattern:", globPattern);
  let currentProcess: ChildProcess | null = null;

  const runProcess = debounce(() => {
    console.log("[DEBUG] Running debounced process");
    if (currentProcess) {
      console.log("[DEBUG] Killing existing process");

      currentProcess.kill();
    }
    currentProcess = spawnProcess();
  }, 500);


  // Get initial files matching pattern
  const files = await glob(globPattern);
  console.log("[DEBUG] Found matching files:", files);


  // Watch each matching file
  files.forEach((file) => {
    console.log("[DEBUG] Setting up watch for file:", file);
    watch(file, (eventType, filename) => {
      if (filename) {
        console.log("[DEBUG] File change detected:", filename);
        console.log(new Date().toISOString());
        runProcess();
      }
    });

  });
};


spawnProcess();

if (process.argv.includes("--watch")) {
  console.log(
    `Change your schema import from ${schemaPath.replaceAll(

      cwd(),
      "."
    )} to ${schemaPath.replaceAll(cwd(), ".")}.gen.ts.\n(Just add .gen.ts to end of your import statement)`
  );
  console.log(`Watching for file changes...`);
  console.log("[DEBUG] Watch mode enabled");
  await watchAndRun(schemaPath);
}

