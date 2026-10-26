const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'P3tun1a',
    database: 'cecyt9_local',
    dateStrings: true
});

module.exports = pool;