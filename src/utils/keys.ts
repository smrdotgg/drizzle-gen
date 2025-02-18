import { databaseType } from "./schema-data";

export const drizzleObjectKeys = (() => {
  if (databaseType === "mysql") {
    return {
      inlineForeignKeys: "drizzle:MySqlInlineForeignKeys",
      table: "MySqlTable",
      allColumns: 'drizzle:Columns',
    };
  } else if (databaseType === "postgresql") {
    return {
      inlineForeignKeys: "drizzle:PgInlineForeignKeys",
      table: "PgTable",
      allColumns: 'drizzle:Columns',
    };
  } else {
    throw Error(`Database type ${databaseType} not yet supported.`);
  }
})();
