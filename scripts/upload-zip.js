const { Client } = require('ssh2');
const path = require('path');

const config = {
    host: 'krappiert.online',
    port: 21098,
    username: 'krapdyhb',
    password: '!Songoku_88',
};

const localZipPath = path.join(__dirname, '../deploy.zip');
const remoteZipPath = 'krappieren/deploy.zip';

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('Uploading deploy.zip...');

        // Ensure remote directory exists
        sftp.mkdir('krappieren', (err) => {
            // fastPut
            sftp.fastPut(localZipPath, remoteZipPath, {
                step: (transferred, chunk, total) => {
                    const percent = Math.round((transferred / total) * 100);
                    process.stdout.write(`\rUploading... ${percent}%`);
                }
            }, (err) => {
                console.log('\nUpload finished.');
                if (err) {
                    console.error('Upload failed:', err);
                } else {
                    console.log('Success!');
                }
                conn.end();
            });
        });
    });
}).connect(config);
