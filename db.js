// const mysql = require('mysql2/promise');

// async function connectDB() {
//     try {
//         const connection = await mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123',
//     database: 'a1menu'
//   });
//   console.log("Ma'lumotlar bazasiga ulandi!");
//   return connection;
// } catch (err) {
//   console.error("Ma'lumotlar bazasiga ulanishda xatolik:", err);
//   throw err;
// }
// }

// module.exports = connectDB;
const mysql = require('mysql2/promise');

const connectDB = async () => {
    try {
        const pool = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '123',
            database: 'a1menu',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('MySQL pool-ga muvaffaqiyatli ulandi');
        return pool;
    } catch (error) {
        console.error('MySQL ulanishda xato:', error);
        throw error;
    }
};

module.exports = connectDB;