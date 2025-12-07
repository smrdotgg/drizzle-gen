import argv from "process.argv";
import { schemaPath } from "./utils/schema-data";

const functionName = "argvConfigSetup";

export const argvConfig = (() => {
  try {
    console.log(`[${functionName}] Starting argv configuration processing.`);

    const processArgv = argv(process.argv.slice(2));
    console.log(
      `[${functionName}] Parsed process arguments:`,
      process.argv.slice(2),
    );

    const item = processArgv({
      watch: false,
      inputFiles: [schemaPath],
      outputTarget: `${schemaPath}.gen.ts`,
    });

    console.log(`[${functionName}] Initial configuration created:`, item);

    if (!item.inputFiles.includes(schemaPath)) {
      console.log(
        `[${functionName}] Schema path missing from inputFiles, attempting to fix.`,
        { currentInputFiles: item.inputFiles },
      );

      if (typeof item.inputFiles === "string") {
        console.log(
          `[${functionName}] Converting inputFiles from string to array.`,
          { inputFilesBefore: item.inputFiles },
        );
        item.inputFiles = [String(item.inputFiles)];
      }

      item.inputFiles.push(schemaPath);
      console.log(`[${functionName}] Schema path appended to inputFiles.`, {
        updatedInputFiles: item.inputFiles,
      });
    }

    console.log(`[${functionName}] Final configuration ready:`, item);
    return item;
  } catch (error) {
    console.error(
      `[${functionName}] Failed to process argv configuration:`,
      error,
    );
    throw error;
  }
})();
