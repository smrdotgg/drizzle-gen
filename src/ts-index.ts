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
import lodash from 'lodash';
 const { debounce } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package.json
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
);

if (!pkg.version.includes("alpha")) {
  console.log("In development.");
  console.log(
    "If you want to use the alpha version use the following command.",
  );
  console.log("npx drizzle-gen@alpha");
  console.log("pnpm dlx drizzle-gen@alpha");
  console.log("yarn dlx drizzle-gen@alpha");
  console.log("bunx drizzle-gen@alpha");
  process.exit(0);
}

if (!pkg.version.includes("alpha")) {
  console.log("in development");
  process.exit(0);
}

const spawnProcess = () =>
  spawn(
    "npx",
    ["tsx", join(__dirname, "..", "src", "main.ts"), ...process.argv.slice(2)],
    { stdio: "inherit" },
  );

const watchAndRun = async (globPattern: string) => {
  let currentProcess: ChildProcess | null = null;

  const runProcess = debounce(() => {
    if (currentProcess) {
      currentProcess.kill();
    }
    currentProcess = spawnProcess();
  }, 500);

  // Get initial files matching pattern
  const files = await glob(globPattern);

  // Watch each matching file
  files.forEach((file) => {
    watch(file, (eventType, filename) => {
      if (filename) {
        runProcess();
      }
    });
  });
};

spawnProcess();
if (process.argv.includes("--UNSAFE_auto")) {
  await watchAndRun(schemaPath);
}
