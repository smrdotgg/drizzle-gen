#!/usr/bin/env tsx

export {};

import { format } from "prettier";
import { drizzleIsAutoImported } from "./utils/constants";
import { cwd } from "process";
import { PrimaryReference, TableRelations } from "./types";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import {
  drizzleConfigPath,
  schema,
  schemaName,
  schemaPath,
} from "./utils/schema-data";
import { replaceInFileSync } from "./utils/replace-in-file";
import { sqlToJsName } from "./utils/sql-to-js-name";
import { drizzleObjectKeys } from "./utils/keys";
import { stripOfId } from "./utils/strip-of-id";
import processArgv from "process.argv";
import { argvConfig } from "./args";

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
  return Object.entries(pgTables).map(([key, currentTable]) => {
    const symbols = Object.getOwnPropertySymbols(pgTables[key]);
    const drizzleNameSymbol = symbols.find(
      (sym) => sym.description === "drizzle:Name",
    );
    const relations: TableRelations = { one: [], many: [], tableName: "" };

    relations.tableName = currentTable[drizzleNameSymbol!];

    const inlineFKSymbol = symbols.find(
      (sym) => sym.description === drizzleObjectKeys.inlineForeignKeys,
    );
    const allMyColumns =
      currentTable[
        symbols.find((sym) => sym.description === drizzleObjectKeys.allColumns)!
      ];

    for (const fk of currentTable[inlineFKSymbol!]) {
      const foreignTableData = fk.reference();
      const foreignTableName =
        foreignTableData.foreignTable[drizzleNameSymbol!];
      const myFields = (foreignTableData.columns as any[]).map((c: any) =>
        String(c.name),
      );

      const personalFKColumnSqlNameToNickName = (pfkcn: string) =>
        Object.entries(allMyColumns).find(([key, value]: any) => {
          return value.name === pfkcn;
        })![0];
      const nickname = myFields
        .map(personalFKColumnSqlNameToNickName)
        .map(stripOfId)
        .map((r) => `${relations.tableName}_${r}`)[0]; //.map(s => `${s}`);

      relations.one.push({
        type: "primary",
        myFields,
        nickname,
        isUnique: foreignTableData.columns[0].isUnique,
        foreignTableName: foreignTableName,
        otherFields: foreignTableData.foreignColumns.map((c: any) => c.name),
      });
    }

    return relations;
  });
}

function addSecondaryRelations(relations: TableRelations[]): void {
  for (const table of relations) {
    for (let i = 0; i < table.one.length; i++) {
      const oneRef = table.one[i];
      // for (const oneRef of table.one) {
      if (oneRef.type !== "primary") continue;

      const foreignTable = relations.find(
        (t) => t.tableName === oneRef.foreignTableName,
      )!;

      if (oneRef.isUnique) {
        foreignTable.one.push({
          type: "secondary",
          // foreignTableName: `${(table.one[0] as PrimaryReference).nicknames[0]}_reverse`,
          foreignTableName: table.tableName,
          nickname: (table.one[i] as PrimaryReference).nickname,
          myFields: oneRef.otherFields,
          otherFields: oneRef.myFields,
        });
      } else {
        foreignTable.many.push({
          type: "secondary",
          foreignTableName: table.tableName,
          nickname: (table.one[i] as PrimaryReference).nickname,
        });
      }
    }
  }
}

const pgTables = filterPgTables(schema);

function getRelationsList() {
  const relations = extractPrimaryRelations(pgTables);
  addSecondaryRelations(relations);

  const finalRelationsList = relations.map(generateTableRelation);
  return finalRelationsList;
}

function generateTableRelation(rel: TableRelations) {
  const { tableVariableName } = sqlToJsName({
    pgTables,
    tableName: rel.tableName,
  });
  return `
    export const ${tableVariableName}Relations = ${drizzleIsAutoImported ? "dzormimp." : ""}relations(${drizzleIsAutoImported ? "originalSchema." : ""}${tableVariableName}, ({one, many}) => ({
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
      const allForeignTables = rel.many
        .filter((rel) => rel.foreignTableName === manyrel.foreignTableName)
        .map((rel) => rel.foreignTableName);
      const moreThanOne =
        new Set(allForeignTables).size !== allForeignTables.length;
      return `${moreThanOne ? manyrel.nickname : foreignTableVariableName}: many(
        ${drizzleIsAutoImported ? "originalSchema." : ""}${foreignTableVariableName},
        ${moreThanOne ? `{relationName: "${manyrel.nickname}"},` : ""}

      ),\n`;
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

      const allForeignTables = rel.one
        .filter((rel) => rel.type === "primary")
        .filter((rel) => rel.foreignTableName === oneRel.foreignTableName)
        .map((rel) => rel.foreignTableName);
      const moreThanOne =
        new Set(allForeignTables).size !== allForeignTables.length;
      const [fields, references] =
        oneRel.type === "primary"
          ? ["fields", "references"]
          : ["references", "fields"];
      const secondParam = `{
              ${fields}: [${oneRel.myFields.map((myField) => `${drizzleIsAutoImported ? "originalSchema." : ""}${myTableVariableName}.${sqlToJsName({ tableName: rel.tableName, pgTables, columnName: myField }).columnVariableName}`).join(",")}],
              ${references}: [${oneRel.otherFields.map((ff) => `${drizzleIsAutoImported ? "originalSchema." : ""}${foreignTableVariableName}.${sqlToJsName({ tableName: oneRel.foreignTableName, pgTables, columnName: ff }).columnVariableName}`).join(",")}],
              ${moreThanOne ? `relationName: "${oneRel.nickname}",` : ""}
          }`;
      return `${moreThanOne ? oneRel.nickname : foreignTableVariableName}: one(${drizzleIsAutoImported ? "originalSchema." : ""}${foreignTableVariableName}, ${oneRel.type === "primary" ? secondParam : ""}),`;
      // return oneRel.type === "secondary"
      //   ? `
      //               ${foreignTableVariableName}: one(${foreignTableVariableName}, {relationName: "${oneRel.nickname}"}),
      //               `
      //   : `${oneRel.nicknames[0]}: one(${foreignTableVariableName}, {
      //         fields: [${oneRel.myFields.map((myField) => `${myTableVariableName}.${sqlToJsName({ tableName: rel.tableName, pgTables, columnName: myField }).columnVariableName}`).join(",")}],
      //         references: [${oneRel.otherFields.map((ff) => `${foreignTableVariableName}.${sqlToJsName({ tableName: oneRel.foreignTableName, pgTables, columnName: ff }).columnVariableName}`).join(",")}],
      //         relationName: "${oneRel.nicknames[0]}",
      //     }),`;
    })
    .join("");
}

async function addRelationsImportToCode({ code }: { code: string }) {
  if (drizzleIsAutoImported) {
    return `
    /**
     *  WARNING: DO NOT EDIT THIS FILE DIRECTLY 
     * 
     * This file is auto-generated.
     * Any changes made to this file will be overwritten.
     * 
     * To modify, edit the source files and re-run the generator.
     */
      import * as dzormimp from "drizzle-orm";
      import * as originalSchema from "./${schemaName.split("/").at(-1)!.slice(0, -3)}";

      export *  from "./${schemaName.split("/").at(-1)!.slice(0, -3)}";

      ${code}
    `;
  }
  return code;
}

function main() {
  const relationsList = getRelationsList().join("\n");
  addRelationsImportToCode({ code: relationsList })
    .then((code) => format(code, { parser: "typescript" }))
    .then((formattedCode) =>
      process.argv.includes("--watch")
        ? writeFileSync(argvConfig.outputTarget, formattedCode)
        : console.log(formattedCode),
    );
}
main();
