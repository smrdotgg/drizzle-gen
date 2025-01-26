#!/usr/bin/env tsx
import { format } from "prettier";
import { cwd } from "process";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { drizzleConfigPath, schema, schemaPath } from "./utils/schema-data";
import { replaceInFileSync } from "./utils/replace-in-file";
import { sqlToJsName } from "./utils/sql-to-js-name";
import { drizzleObjectKeys } from "./utils/keys";
function filterPgTables(schemaExports) {
    return Object.entries(schemaExports).reduce((acc, [key, value]) => {
        if (value?.constructor?.name === drizzleObjectKeys.table) {
            acc[key] = value;
        }
        return acc;
    }, {});
}
function extractPrimaryRelations(pgTables) {
    return Object.entries(pgTables).map(([_, currentTable]) => {
        const symbols = Object.getOwnPropertySymbols(pgTables.posts);
        const drizzleNameSymbol = symbols.find((sym) => sym.description === "drizzle:Name");
        const relations = { one: [], many: [], tableName: "" };
        relations.tableName = currentTable[drizzleNameSymbol];
        const inlineFKSymbol = symbols.find((sym) => sym.description === drizzleObjectKeys.inlineForeignKeys);
        for (const fk of currentTable[inlineFKSymbol]) {
            const data = fk.reference();
            const foreignTable = data.foreignTable[drizzleNameSymbol];
            relations.one.push({
                type: "primary",
                myFields: data.columns.map((c) => c.name),
                isUnique: data.columns[0].isUnique,
                foreignTableName: foreignTable,
                otherFields: data.foreignColumns.map((c) => c.name),
            });
        }
        return relations;
    });
}
function addSecondaryRelations(relations) {
    for (const table of relations) {
        for (const oneRef of table.one) {
            if (oneRef.type !== "primary")
                continue;
            const foreignTable = relations.find((t) => t.tableName === oneRef.foreignTableName);
            if (oneRef.isUnique) {
                foreignTable.one.push({
                    type: "secondary",
                    foreignTableName: table.tableName,
                });
            }
            else {
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
function generateTableRelation(rel) {
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
function generateManyRelations(rel) {
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
function generateOneRelations(rel) {
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
function mutateSchemaFile() {
    format(getRelationsList().join("\n"), { parser: "typescript" }).then((relationsList) => {
        if (process.argv.includes("--UNSAFE_auto")) {
            const genSchemaPath = `${schemaPath}.gen.ts`;
            copyFileSync(schemaPath, genSchemaPath);
            const existingContent = readFileSync(genSchemaPath, "utf8");
            const newContent = `import * as dzorm from "drizzle-orm";\n${existingContent}\n${relationsList}`;
            writeFileSync(genSchemaPath, newContent);
            console.log({
                filePath: drizzleConfigPath,
                replaceString: genSchemaPath.replaceAll(cwd(), "."),
                searchString: schemaPath.replaceAll(cwd(), "."),
            });
            replaceInFileSync({
                filePath: drizzleConfigPath,
                replaceString: genSchemaPath.replaceAll(cwd(), "."),
                searchString: schemaPath.replaceAll(cwd(), "."),
            });
        }
        else {
            console.log(`test: argv = ${process.argv}`);
            console.log(relationsList);
        }
    });
}
mutateSchemaFile();
