const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: 'krappiert.online',
    port: 21098,
    username: 'krapdyhb',
    password: '!Songoku_88',
};

const localBuildPath = path.join(__dirname, '../.next/standalone');
const localStaticPath = path.join(__dirname, '../.next/static');
const localPublicPath = path.join(__dirname, '../public');
const remoteBasePath = 'krappieren';

// Helper to promisify SFTP calls
const sftpMkdir = (sftp, dir) => new Promise((resolve) => {
    sftp.mkdir(dir, (err) => {
        // Ignore error (dir likely exists)
        resolve();
    });
});

const sftpFastPut = (sftp, local, remote) => new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => {
        if (err) return reject(err);
        resolve();
    });
});

async function uploadDir(sftp, localDir, remoteDir) {
    try {
        await sftpMkdir(sftp, remoteDir);
        const files = fs.readdirSync(localDir);

        for (const file of files) {
            const localPath = path.join(localDir, file);
            const remotePath = `${remoteDir}/${file}`;

            const stats = fs.statSync(localPath);

            if (stats.isDirectory()) {
                await uploadDir(sftp, localPath, remotePath);
            } else {
                console.log(`Uploading ${remotePath}...`);
                await sftpFastPut(sftp, localPath, remotePath);
            }
        }
    } catch (e) {
        console.error(`Error uploading dir ${localDir}:`, e);
        throw e;
    }
}

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;

        try {
            console.log(`Creating remote directory: ${remoteBasePath}`);
            await sftpMkdir(sftp, remoteBasePath);

            console.log('Uploading Standalone Build...');
            await uploadDir(sftp, localBuildPath, remoteBasePath);

            console.log('Uploading Static Assets...');
            const remoteNextDir = `${remoteBasePath}/.next`;
            await sftpMkdir(sftp, remoteNextDir);
            await uploadDir(sftp, localStaticPath, `${remoteNextDir}/static`);

            console.log('Uploading Public Assets...');
            await uploadDir(sftp, localPublicPath, `${remoteBasePath}/public`);

            console.log('Uploading Database Backup & Scripts...');
            await sftpFastPut(sftp, path.join(__dirname, '../backup.json'), `${remoteBasePath}/backup.json`);
            await sftpFastPut(sftp, path.join(__dirname, '../scripts/restore-db.js'), `${remoteBasePath}/restore-db.js`);

            console.log('Deployment upload complete!');
        } catch (e) {
            console.error('Deployment failed:', e);
        } finally {
            conn.end();
        }
    });
}).connect(config);
