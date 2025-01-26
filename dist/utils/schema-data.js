import { cwd } from "process";
import { join } from "path";
export const drizzleConfigPath = join(cwd(), "drizzle.config.ts");
const drizzleConfig = (await import(drizzleConfigPath)).default;
export const databaseType = drizzleConfig.dialect;
export let schemaPath = join(cwd(), String(drizzleConfig.schema));
if (schemaPath.endsWith(".gen.ts")) {
    schemaPath = schemaPath.slice(0, schemaPath.length - 7);
}
export const schema = await import(schemaPath);
