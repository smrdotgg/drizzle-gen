
export type PrimaryReference = {
  type: "primary";
  myFields: string[];
  isUnique: boolean;
  foreignTableName: string;
  otherFields: string[];
};

export type SecondaryReference = {
  type: "secondary";
  foreignTableName: string;
};

export type TableRelations = {
  one: (PrimaryReference | SecondaryReference)[];
  many: SecondaryReference[];
  tableName: string;
};

