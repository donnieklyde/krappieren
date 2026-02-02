const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, '../deploy.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// Add Standalone Build
archive.directory(path.join(__dirname, '../.next/standalone'), false);

// Add Static Assets
// We need to preserve the structure .next/static inside the zip, 
// OR simpler: just put everything in root of zip and expect user to extract to 'krappieren' folder
// The standalone build expects .next/static to be strictly at .next/static relative to it?
// Standalone structure:
// deploy.zip
//   ├── server.js
//   ├── .env
//   ├── .next/
//   │    └── static/  <-- We need to put static files here
//   └── public/       <-- We need to put public files here

archive.directory(path.join(__dirname, '../.next/static'), '.next/static');
archive.directory(path.join(__dirname, '../public'), 'public');
archive.file(path.join(__dirname, '../backup.json'), { name: 'backup.json' });
archive.file(path.join(__dirname, '../scripts/restore-db.js'), { name: 'restore-db.js' });

archive.finalize();
