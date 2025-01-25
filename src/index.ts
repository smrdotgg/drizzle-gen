#!/usr/bin/env node


import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get package.json
const pkg = await import("../package.json", { assert: { type: "json" } });

if (!pkg.version.includes("alpha")) {
  console.log("in development");
  process.exit(0);
}

spawn("npx", ["tsx", join(__dirname, "..", "src", "main.ts")], {
  stdio: "inherit",
});

