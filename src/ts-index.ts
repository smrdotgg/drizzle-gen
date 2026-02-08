#!/usr/bin/env bun

import { $ } from "bun";
import { join } from "node:path";
import { getDependencies } from "../get-dependencies";
import { drizzleConfigPath, schemaName } from "./utils/config";

const func = async () => {
  const scriptPath = join(__dirname, "main.ts");
  const args = process.argv.slice(2);
  const dependencies = [schemaName, ...(await getDependencies(schemaName))];
  await $`bun ${scriptPath}`;
};

await func();
