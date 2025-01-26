#!/usr/bin/env tsx

export {};
import { format } from "prettier";
import { cwd } from "process";
import { TableRelations } from "./types";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { drizzleConfigPath, schema, schemaPath } from "./utils/schema-data";
import { replaceInFileSync } from "./utils/replace-in-file";
import { sqlToJsName } from "./utils/sql-to-js-name";
import { drizzleObjectKeys } from "./utils/keys";

function filterPgTables(schemaExports: any): Record<string, any> {
  return Object.entries(schemaExports).reduce(
    (acc, [key, value]) => {
      if (value?.constructor?.name === drizzleObjectKeys.table) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
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
      (sym) => sym.description === drizzleObjectKeys.inlineForeignKeys,
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

const pgTables = filterPgTables(schema);

function getRelationsList() {
  const relations = extractPrimaryRelations(pgTables);
  addSecondaryRelations(relations);

  if (0) {
    console.log(JSON.stringify(relations, null, 2));
  }

  const finalRelationsList = relations.map(generateTableRelation);
  return finalRelationsList;
}

function generateTableRelation(rel: TableRelations) {
  const { tableVariableName } = sqlToJsName({
    pgTables,
    tableName: rel.tableName,
  });
  return `
    export const ${tableVariableName}Relations = relations(${tableVariableName}, ({one, many}) => ({
      ${generateOneRelations(rel)}
      ${generateManyRelations(rel)}
    }));
     `;
}

function generateManyRelations(rel: TableRelations) {
  return rel.many
    .map((manyrel) => {
      const { tableVariableName: foreignTableVariableName } = sqlToJsName({
        pgTables,
        tableName: manyrel.foreignTableName,
      });
      return `${foreignTableVariableName}: many(${foreignTableVariableName}),\n`;
    })
    .join("");
}

function generateOneRelations(rel: TableRelations) {
  const { tableVariableName: myTableVariableName } = sqlToJsName({
    pgTables,
    tableName: rel.tableName,
  });
  return rel.one
    .map((oneRel) => {
      const { tableVariableName: foreignTableVariableName } = sqlToJsName({
        pgTables,
        tableName: oneRel.foreignTableName,
      });
      return oneRel.type === "secondary"
        ? `
                    ${foreignTableVariableName}: one(${foreignTableVariableName}),
                    `
        : `${foreignTableVariableName}: one(${foreignTableVariableName}, {
              fields: [${oneRel.myFields.map((myField) => `${myTableVariableName}.${sqlToJsName({ tableName: rel.tableName, pgTables, columnName: myField }).columnVariableName}`).join(",")}],
              references: [${oneRel.otherFields.map((ff) => `${foreignTableVariableName}.${sqlToJsName({ tableName: oneRel.foreignTableName, pgTables, columnName: ff }).columnVariableName}`).join(",")}]
          }),`;
    })
    .join("");
}

function main() {
  format(getRelationsList().join("\n"), { parser: "typescript" }).then(
    (relationsList) => {
      if (process.argv.includes("--UNSAFE_auto")) {
        const genSchemaPath = `${schemaPath}.gen.ts`;

        copyFileSync(schemaPath, genSchemaPath);
        const existingContent = readFileSync(genSchemaPath, "utf8");
        const newContent = addRelationsImportToCode({ code:`${existingContent}\n${relationsList}` });
        writeFileSync(genSchemaPath, newContent);
        replaceInFileSync({
          filePath: drizzleConfigPath,
          replaceString: genSchemaPath.replaceAll(cwd(), "."),
          searchString: schemaPath.replaceAll(cwd(), "."),
        });
      } else {
        console.log(relationsList);
      }
    },
  );
}

function addRelationsImportToCode({ code }: { code: string }) {
  const relationsExists: Boolean = new Function(`${code};return typeof relations !== 'undefined';`)();
  if (!relationsExists) {
    return `import { relations } from "drizzle-orm";${code}`;
  }
  return code;
}

main();
