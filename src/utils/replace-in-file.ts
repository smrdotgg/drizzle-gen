import { readFileSync, writeFileSync } from "fs";
import { log } from "./log";


export function replaceInFileSync({
  filePath,
  searchString,
  replaceString,
}: {
  filePath: string;
  searchString: string;
  replaceString: string;
}): void {
  try {

    log(`Reading file: ${filePath}`);

    const content = readFileSync(filePath, "utf8");
    log(`Found content of length: ${content.length}`);


    const newContent = content.replaceAll(searchString, replaceString);

    log(
      `Replacing all occurrences of "${searchString}" with "${replaceString}"`
    );

    writeFileSync(filePath, newContent);

    log("File successfully updated");
  } catch (error) {
    console.error(`Error occurred: ${error}`);
    throw new Error(`Failed to replace in file: ${error}`);
  }
}

