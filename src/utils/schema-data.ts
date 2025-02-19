import { cwd } from "process";
import { join } from "path";
import { type Config } from "drizzle-kit";


export const drizzleConfigPath = join(cwd(), "drizzle.config.ts");
const drizzleConfig = (await import(drizzleConfigPath)).default as Config;

export const databaseType = drizzleConfig.dialect;  

export let schemaName = String(drizzleConfig.schema);
export let schemaPath = join(cwd(), String(drizzleConfig.schema));
if (schemaPath.endsWith(".gen.ts")) {
  schemaPath = schemaPath.slice(0, schemaPath.length - 7);
}

export const schema = await import(schemaPath);
