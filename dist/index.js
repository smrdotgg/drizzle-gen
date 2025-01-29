#!/usr/bin/env node
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync } from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Get package.json
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
if (!pkg.version.includes("debug") || !pkg.version.includes("alpha")) {
    console.log("In development.");
    console.log("If you want to use the alpha version use the following command.");
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
spawn("npx", ["tsx", join(__dirname, "..", "src", "ts-index.ts"), ...process.argv.slice(2)], {
    stdio: "inherit",
});
