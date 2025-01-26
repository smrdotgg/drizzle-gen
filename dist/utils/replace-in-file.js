import { readFileSync, writeFileSync } from "fs";
export function replaceInFileSync({ filePath, searchString, replaceString, }) {
    try {
        console.log(`Reading file: ${filePath}`);
        const content = readFileSync(filePath, "utf8");
        console.log(`Found content of length: ${content.length}`);
        const newContent = content.replaceAll(searchString, replaceString);
        console.log(`Replacing all occurrences of "${searchString}" with "${replaceString}"`);
        writeFileSync(filePath, newContent);
        console.log("File successfully updated");
    }
    catch (error) {
        console.error(`Error occurred: ${error}`);
        throw new Error(`Failed to replace in file: ${error}`);
    }
}
