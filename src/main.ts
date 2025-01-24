#!/usr/bin/env tsx

export {};
import { cwd } from "process";
import { TableRelations } from "./types";
import { dirname, join } from "path";

const drizzleConfigPath = join(cwd(), "drizzle.config.ts");
const drizzleConfig = await import(drizzleConfigPath);
const schema = await import(join(cwd(), drizzleConfig.default.schema));
//const schema = await import(`${cwd()}/${drizzleConfig.default.schema}`);


function filterPgTables(schemaExports: any): Record<string, any> {
  return Object.entries(schemaExports).reduce((acc, [key, value]) => {
    if (value?.constructor?.name === "PgTable") {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

function createTableNameMap(pgTables: Record<string, any>) {
  return Object.entries(pgTables).reduce(
    (acc, [variableName, currentTable]) => {
      const symbols = Object.getOwnPropertySymbols(currentTable);
      const drizzleNameSymbol = symbols.find(
        (sym) => sym.description === "drizzle:Name",
      );
      const tableName = currentTable[drizzleNameSymbol!];
      acc[tableName] = variableName;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function extractPrimaryRelations(
  pgTables: Record<string, any>,
): TableRelations[] {
  return Object.entries(pgTables).map(([_, currentTable]) => {
    const symbols = Object.getOwnPropertySymbols(pgTables.posts);
    const drizzleNameSymbol = symbols.find(
      (sym) => sym.description === "drizzle:Name",
    );
    const relations: TableRelations = { one: [], many: [], tableName: "" };

    relations.tableName = currentTable[drizzleNameSymbol!];

    const inlineFKSymbol = symbols.find(
      (sym) => sym.description === "drizzle:PgInlineForeignKeys",
    );
    for (const fk of currentTable[inlineFKSymbol!]) {
      const data = fk.reference();
      const foreignTable = data.foreignTable[drizzleNameSymbol!];

      relations.one.push({
        type: "primary",
        myFields: data.columns.map((c: any) => c.name),
        isUnique: data.columns[0].isUnique,
        foreignTableName: foreignTable,
        otherFields: data.foreignColumns.map((c: any) => c.name),
      });
    }

    return relations;
  });
}

function addSecondaryRelations(relations: TableRelations[]): void {
  for (const table of relations) {
    for (const oneRef of table.one) {
      if (oneRef.type !== "primary") continue;

      const foreignTable = relations.find(
        (t) => t.tableName === oneRef.foreignTableName,
      )!;

      if (oneRef.isUnique) {
        foreignTable.one.push({
          type: "secondary",
          foreignTableName: table.tableName,
        });
      } else {
        foreignTable.many.push({
          type: "secondary",
          foreignTableName: table.tableName,
        });
      }
    }
  }
}

function main() {
  const pgTables = filterPgTables(schema);

  const relations = extractPrimaryRelations(pgTables);
  addSecondaryRelations(relations);

  if (0) {
    console.log(JSON.stringify(relations, null, 2));
  }
  const tableNameToVariableNameMap = createTableNameMap(pgTables);

  const finalProductList = relations
    .map(
      (rel) => `
    export const ${tableNameToVariableNameMap[rel.tableName]}Relations = relations(${tableNameToVariableNameMap[rel.tableName]}, ({one, many}) => ({
      ${rel.one
        .map((oneRel) =>
          oneRel.type === "secondary"
            ? `
                    ${tableNameToVariableNameMap[oneRel.foreignTableName]}: one(${tableNameToVariableNameMap[oneRel.foreignTableName]}),
                    `
            : `
                    ${tableNameToVariableNameMap[oneRel.foreignTableName]}: one(${tableNameToVariableNameMap[oneRel.foreignTableName]}, {
                      fields: [${oneRel.myFields.map((mf) => `${tableNameToVariableNameMap[rel.tableName]}.${mf}`).join(",")}],
                      references: [${oneRel.otherFields.map((ff) => `${tableNameToVariableNameMap[oneRel.foreignTableName]}.${ff}`).join(",")}]
                    }),
                    `,
        )
        .join("")}
      ${rel.many
        .map(
          (
            manyrel,
          ) => `${tableNameToVariableNameMap[manyrel.foreignTableName]}: many(${tableNameToVariableNameMap[manyrel.foreignTableName]}),
                `,
        )
        .join("")}
    }));
     `,
    )
    .join("");
  if (1) {
    const formattedString = finalProductList;
    console.log(formattedString);
  }

  return relations;
}

main();

