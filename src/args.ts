import argv from "process.argv";
import { schemaPath } from "./utils/config";
const log = console.log;
const functionName = "argvConfigSetup";

export const argvConfig = (() => {
  try {
    log(`[${functionName}] Starting argv configuration processing.`);

    const processArgv = argv(process.argv.slice(2));
    log(`[${functionName}] Parsed process arguments:`, {
      "process.argv.slice(2)": process.argv.slice(2),
      processArgv,
    });

    const item = processArgv({
      watch: false,
      inputFiles: [schemaPath],
      outputTarget: `${schemaPath}.gen.ts`,
    });

    log(`[${functionName}] Initial configuration created:`, item);

    if (!item.inputFiles.includes(schemaPath)) {
      log(
        `[${functionName}] Schema path missing from inputFiles, attempting to fix.`,
        { currentInputFiles: item.inputFiles },
      );

      if (typeof item.inputFiles === "string") {
        log(`[${functionName}] Converting inputFiles from string to array.`, {
          inputFilesBefore: item.inputFiles,
        });
        item.inputFiles = [String(item.inputFiles)];
      }

      item.inputFiles.push(schemaPath);
      log(`[${functionName}] Schema path appended to inputFiles.`, {
        updatedInputFiles: item.inputFiles,
      });
    }

    log(`[${functionName}] Final configuration ready:`, item);
    return item;
  } catch (error) {
    console.error(
      `[${functionName}] Failed to process argv configuration:`,
      error,
    );
    throw error;
  }
})();
