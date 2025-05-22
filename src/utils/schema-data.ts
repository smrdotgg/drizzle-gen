import { cwd } from "process";
import { join } from "path";
import { type Config } from "drizzle-kit";

console.log("Starting script execution");

export const drizzleConfigPath = join(cwd(), "drizzle.config.ts");
console.log("drizzleConfigPath:", drizzleConfigPath);

const drizzleConfig = (await import(drizzleConfigPath)).default as Config;
console.log("drizzleConfig loaded:", drizzleConfig);

export const databaseType = drizzleConfig.dialect;
console.log("databaseType:", databaseType);

export let schemaName = String(drizzleConfig.schema);
console.log("Initial schemaName:", schemaName);

export let schemaPath = join(cwd(), String(drizzleConfig.schema));
console.log("Initial schemaPath:", schemaPath);

if (schemaPath.endsWith(".gen.ts")) {
  console.log("Schema path ends with .gen.ts, attempting to slice.");
  const oldSchemaPath = schemaPath;
  schemaPath = schemaPath.slice(0, schemaPath.length - 7);
  console.log("Sliced schemaPath from:", oldSchemaPath, "to:", schemaPath);
}

console.log("Final schemaPath before import:", schemaPath);
export const schema = await import(schemaPath);
console.log("Schema imported:", schema);

console.log("Script execution finished");
