
export type PrimaryReference = {
  type: "primary";
  foreignTableName: string;
  nickname: string;

  myFields: string[];
  otherFields: string[];
  isUnique: boolean;
};

export type SecondaryReference = {
  type: "secondary";
  foreignTableName: string;
  nickname: string;
};
export type OneSecondaryReference = {
  type: "secondary";
  foreignTableName: string;
  nickname: string;
  myFields: string[];
  otherFields: string[];
};

export type TableRelations = {
  one: (PrimaryReference | OneSecondaryReference)[];
  many: SecondaryReference[];
  tableName: string;
};

