import { cwd } from "process";
import { join } from "path";
import type { Config } from "drizzle-kit";

export const drizzleConfigPath = join(cwd(), "drizzle.config.ts");

const drizzleConfig = (await import(drizzleConfigPath)).default as Config;

export const databaseType = drizzleConfig.dialect;

export const schemaName = String(drizzleConfig.schema);

export const schemaPath = (() => {
  const name = join(cwd(), String(drizzleConfig.schema));
  if (name.endsWith(".gen.ts")) {
    return name.slice(0, name.length - 7);
  } else {
    return name;
  }
})();

export const schema = await import(schemaPath);
