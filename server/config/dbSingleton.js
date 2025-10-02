const mysql = require('mysql2/promise');
let instance = null;
async function initDb() {
  if (!instance) {
    instance = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'rvisionluxe_database',
    });
  }
  return instance;
}
module.exports = initDb;
