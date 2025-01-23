import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import archiver from 'archiver';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a file to stream archive data to
const output = fs.createWriteStream(join(__dirname, '../habito.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', () => {
  console.log('Extension has been packaged successfully!');
  console.log(`Total bytes: ${archive.pointer()}`);
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add the dist directory contents to the zip
archive.directory(join(__dirname, '../dist/'), false);

// Add the manifest.json
archive.file(join(__dirname, '../manifest.json'), { name: 'manifest.json' });

// Finalize the archive
archive.finalize(); 