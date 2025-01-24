import { readFileSync, writeFileSync } from 'fs';

export function replaceInFileSync({
  filePath,
  searchString,
  replaceString
}: {
  filePath: string;
  searchString: string;
  replaceString: string;
}): void {
  try {
    const content = readFileSync(filePath, 'utf8');
    const newContent = content.replaceAll(searchString, replaceString);
    writeFileSync(filePath, newContent);
  } catch (error) {
    throw new Error(`Failed to replace in file: ${error}`);
  }
}

