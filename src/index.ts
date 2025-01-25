#!/usr/bin/env node


import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

spawn("npx", ["tsx", join(__dirname, "..", "src", "main.ts")], {
  stdio: "inherit",
});

