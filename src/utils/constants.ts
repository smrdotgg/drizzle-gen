import { databaseType } from "./config";

export const validDrizzleTableNames = (() => {
  if (databaseType === "mysql") {
    return {
      inlineForeignKeys: "drizzle:MySqlInlineForeignKeys",
      table: "MySqlTable",
      drizzleColumns: "drizzle:Columns",
    };
  } else if (databaseType === "postgresql") {
    return {
      inlineForeignKeys: "drizzle:PgInlineForeignKeys",
      table: "PgTable",
      allColumns: "drizzle:Columns",
    };
  } else if (databaseType === "sqlite") {
    return {
      inlineForeignKeys: "drizzle:SQLiteInlineForeignKeys",
      table: "SQLiteTable",
      allColumns: "drizzle:Columns",
    };
  } else {
    throw Error(`Database type ${databaseType} not yet supported.`);
  }
})();
export const drizzleIsAutoImported = true;
