export function sqlToJsName(args: {
  pgTables: Record<string, any>;
  tableName: string;
  columnName?: undefined;
}): {
  tableVariableName: string;
  columns: { variableName: string; realName: string }[];
};
export function sqlToJsName(args: {
  pgTables: Record<string, any>;
  tableName: string;
  columnName: string;
}): {
  tableVariableName: string;
  columnVariableName: string;
  columns: { variableName: string; realName: string }[];
};

export function sqlToJsName(args: {
  pgTables: Record<string, any>;
  tableName: string;
  columnName?: string;
}) {
  const tableNameToVariableName = createTableNameMap(args.pgTables);

  const tableData = tableNameToVariableName.find(
    (t) => t.realName === args.tableName,
  );
  if (!tableData) throw Error(""); // replace this line

  if ("columnName" in args && args.columnName) {
    const column = tableData.columns.find(
      (c) => c.realName === args.columnName,
    );
    if (!column) throw Error(""); // replace this line
    return {
      tableVariableName: tableData.variableName,
      columnVariableName: column.variableName,
      columns: tableData.columns,
    };
  }
  return {
    tableVariableName: tableData.variableName,
    columns: tableData.columns,
  };
}

function createTableNameMap(pgTables: Record<string, any>) {
  const DRIZZLE_TABLE_PROTECTED_KEYS = ["enableRLS"];
  return Object.entries(pgTables).reduce(
    (acc, [variableName, currentTable]) => {
      const currentTableColumns = Object.entries(currentTable)
        .filter(([k, v]) => !DRIZZLE_TABLE_PROTECTED_KEYS.includes(k))
        .map(([k, v]: [string, any]) => ({
          variableName: k,
          realName: String(v.name),
        }));
      const symbols = Object.getOwnPropertySymbols(currentTable);
      const drizzleNameSymbol = symbols.find(
        (sym) => sym.description === "drizzle:Name",
      );
      const tableName = currentTable[drizzleNameSymbol!];
      acc.push({
        variableName,
        realName: tableName,
        columns: currentTableColumns,
      });
      return acc;
    },
    [] as {
      variableName: string;
      realName: string;
      columns: {
        variableName: string;
        realName: string;
      }[];
    }[],
  );
}
