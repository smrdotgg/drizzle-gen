import { cwd } from "process";
import { join } from "path";
import { type Config } from "drizzle-kit";
import { log } from "./log";

log("Starting script execution");

export const drizzleConfigPath = join(cwd(), "drizzle.config.ts");
log("drizzleConfigPath:", drizzleConfigPath);

const drizzleConfig = (await import(drizzleConfigPath)).default as Config;
log("drizzleConfig loaded:", drizzleConfig);

export const databaseType = drizzleConfig.dialect;
log("databaseType:", databaseType);

export let schemaName = String(drizzleConfig.schema);
log("Initial schemaName:", schemaName);

export let schemaPath = join(cwd(), String(drizzleConfig.schema));
log("Initial schemaPath:", schemaPath);

if (schemaPath.endsWith(".gen.ts")) {
  log("Schema path ends with .gen.ts, attempting to slice.");
  const oldSchemaPath = schemaPath;
  schemaPath = schemaPath.slice(0, schemaPath.length - 7);
  log("Sliced schemaPath from:", oldSchemaPath, "to:", schemaPath);
}

log("Final schemaPath before import:", schemaPath);
export const schema = await import(schemaPath);
log("Schema imported:", schema);

log("Script execution finished");
