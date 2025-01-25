import { databaseType } from "./schema-data";

export const drizzleObjectKeys: { inlineForeignKeys: string; table: string } = (() => {
  if (databaseType === "mysql") {
    return {
      inlineForeignKeys: "drizzle:MySqlInlineForeignKeys",
      table: "MySqlTable",
    };
  } else if (databaseType === "postgresql") {
    return {
      inlineForeignKeys: "drizzle:PgInlineForeignKeys",
      table: "PgTable",
    };
  } else {
    throw Error(`Database type ${databaseType} not yet supported.`);
  }
})();
