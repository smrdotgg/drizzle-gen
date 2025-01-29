#!/usr/bin/env node
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync, watchFile } from "fs";
import { watch } from "fs";
import { ChildProcess } from "child_process";
import { glob } from "glob";
import { schemaPath } from "./utils/schema-data";

import lodash from "lodash";
import { cwd } from "process";
import { log } from "./utils/log";
const { debounce } = lodash;

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);


log("[DEBUG] Starting script");
log("[DEBUG] Current directory:", __dirname);


const spawnProcess = () => {
  log("[DEBUG] Spawning new process");
  return spawn(
    "npx",
    ["tsx", join(__dirname, "..", "src", "main.ts"), ...process.argv.slice(2)],
    { stdio: "inherit" },
  );
};
const watchAndRun = async (globPattern: string) => {

  log("[DEBUG] Starting watch with pattern:", globPattern);
  let currentProcess: ChildProcess | null = null;
  let isProcessing = false;

  const runProcess = debounce(async () => {
    try {
      log("[DEBUG] Running debounced process");
      if (isProcessing) {
        log("[DEBUG] Already processing, skipping");
        return;
      }


      isProcessing = true;

      if (currentProcess) {
        log("[DEBUG] Killing existing process");
        currentProcess.kill();
        currentProcess = null;
      }

      currentProcess = spawnProcess();
      log("[DEBUG] New process spawned");
      
      await new Promise((resolve) => {
        currentProcess?.on('exit', (code) => {
          log("[DEBUG] Process exited with code:", code);
          currentProcess = null;
          isProcessing = false;

          resolve(code);
        });
      });
    } catch (error) {
      console.error("[DEBUG] Process execution error:", error);
      isProcessing = false;
    }
  }, 500);

  const files = await glob(globPattern);
  log("[DEBUG] Found matching files:", files);


  files.forEach((file) => {
    log("[DEBUG] Setting up watchFile for:", file);
    watchFile(file, { interval: 1000 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        log("[DEBUG] File modified:", file);
        log("[DEBUG] Timestamp:", new Date().toISOString());
        await runProcess();
      }
    });
  });


  // Keep process alive
  return new Promise(() => {});

};




spawnProcess();

if (process.argv.includes("--watch")) {
  console.log(
    `Change your schema import from ${schemaPath.replaceAll(
      cwd(),
      ".",
    )} to ${schemaPath.replaceAll(cwd(), ".")}.gen.ts.\n(Just add .gen.ts to end of your import statement)`,
  );
  console.log(`Watching for file changes...`);
  log("[DEBUG] Watch mode enabled");
  await watchAndRun(schemaPath);
}
