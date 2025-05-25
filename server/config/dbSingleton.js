const mysql = require('mysql2');

class DbSingleton {
    constructor() {
        if (!DbSingleton.instance) {
            this.connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'rvisionluxe_database'  // שנה ל-'rvisionluxe_database' בדיוק כמו שמופיע ב-XAMPP
            });
            DbSingleton.instance = this;
        }
        return DbSingleton.instance;
    }

    getConnection() {
        return this.connection;
    }
}

const instance = new DbSingleton();
module.exports = instance;