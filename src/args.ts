import argv from "process.argv";
import { schemaPath } from "./utils/schema-data";

const processArgv = argv(process.argv.slice(2));

interface Config {
  watch: boolean;
  outputTarget: string;
  inputFiles: string[];
  prependFile?: string[];
}

export const argvConfig = (() => {
  const item = processArgv<Config>({
    watch: false,
    inputFiles: [schemaPath],
    outputTarget: `${schemaPath}.gen.ts`,
  });
  if (!item.inputFiles.includes(schemaPath)) {
    if (typeof item.inputFiles === "string") {
      item.inputFiles = [String(item.inputFiles)];
    }
    item.inputFiles.push(schemaPath);
  }
  console.log(item);
  return item;
})();
