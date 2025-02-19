import { glob } from 'glob';
import { resolve } from 'path';

const listFiles = async (directory) => {
  try {
    const files = await glob(directory + '/**/*');
    files.forEach(file => console.log(`${resolve(file).length} - ${resolve(file)}`));

  } catch (err) {

    console.error('Error:', err);

  }
};


const directory = process.argv[2] || '.';
listFiles(directory);

