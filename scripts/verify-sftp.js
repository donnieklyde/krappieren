const { Client } = require('ssh2');

const config = {
    host: 'krappiert.online',
    port: 21098,
    username: 'krapdyhb',
    password: '!Songoku_88',
};

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) {
            console.error('SFTP Error:', err);
            return conn.end();
        }

        console.log('SFTP :: ready');
        sftp.readdir('.', (err, list) => {
            if (err) {
                console.error('Readdir Error:', err);
                conn.end();
                return;
            }
            console.log('Listing directory .:');
            list.forEach(item => {
                console.log(`- ${item.longname}`);
            });
            conn.end();
        });
    });
}).on('error', (err) => {
    console.error('Connection failed:', err);
}).connect(config);
