#!/usr/bin/env node

import { $ } from "bun";
import { join } from "node:path";
import { getDependencies } from "../get-dependencies";
import { drizzleConfigPath, schemaName } from "./utils/config";
const log = console.log;

(async () => {
  log("[DEBUG] Spawning new process");
  const scriptPath = join(__dirname, "main.ts");
  const args = process.argv.slice(2);
  console.log(`scriptPath = ${scriptPath}`);
  console.log(`args.join(" ") = ${args.join(" ")}`);
  console.log(await getDependencies(schemaName));
  await $`bun ${scriptPath}`;
})();
