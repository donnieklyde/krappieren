const { Client } = require('ssh2');

const config = {
    host: 'krappiert.online',
    port: 21098,
    username: 'krapdyhb',
    password: '!Songoku_88',
};

const commands = [
    'node -v',
    'npm -v',
    'pm2 -v',
    'pwd',
    'ls -la',
    'cat /etc/*release' // Try to identify OS
];

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');

    let p = Promise.resolve();

    commands.forEach(cmd => {
        p = p.then(() => new Promise((resolve, reject) => {
            conn.exec(cmd, (err, stream) => {
                if (err) {
                    console.log(`CMD: ${cmd} -> ERROR: ${err.message}`);
                    return resolve(); // Continue anyway
                }
                let output = '';
                stream.on('close', (code, signal) => {
                    console.log(`CMD: ${cmd}`);
                    console.log(`OUT: ${output.trim()}`);
                    console.log('---');
                    resolve();
                }).on('data', (data) => {
                    output += data;
                }).stderr.on('data', (data) => {
                    output += 'STDERR: ' + data;
                });
            });
        }));
    });

    p.then(() => conn.end());

}).on('error', (err) => {
    console.error('Connection failed:', err);
}).connect(config);
