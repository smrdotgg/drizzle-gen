
export type PrimaryReference = {
  type: "primary";
  myFields: string[];
  nicknames: string[];
  isUnique: boolean;
  foreignTableName: string;
  otherFields: string[];
};

export type SecondaryReference = {
  type: "secondary";
  foreignTableName: string;
  nickname: string;
};

export type TableRelations = {
  one: (PrimaryReference | SecondaryReference)[];
  many: SecondaryReference[];
  tableName: string;
};

