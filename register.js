
const express = require('express');
const router = express.Router();
const connectDB = require('./db');

let db; // Global o‘zgaruvchi
(async () => {
    db = await connectDB(); // Ulanishni bir marta yaratamiz
})();

router.post('/', async (req, res) => {
    const { email, phone } = req.body;
    console.log("Request body:", req.body);

    // Ma'lumotlar to'ldirilmaganligini tekshirish
    if (!email || !phone) {
        return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring! (email, phone)' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [results] = await connection.query('SELECT email, phone FROM login WHERE email = ? OR phone = ?', [email, phone]);

        if (results.length > 0) {
            const errors = [];
            results.forEach(user => {
                if (user.email === email) errors.push('Bu email allaqachon ro\'yxatdan o\'tgan!');
                if (user.phone === phone) errors.push('Bu telefon raqami allaqachon ro\'yxatdan o\'tgan!');
            });
            await connection.rollback();
            return res.status(400).json({ error: errors });
        }

        const [result] = await connection.query('INSERT INTO login (email, phone) VALUES (?, ?)', [email, phone]);

        await connection.commit();
        res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tildi!', userId: result.insertId });
    } catch (err) {
        if (connection) await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email yoki telefon raqam allaqachon mavjud!' });
        }
        res.status(500).json({ error: 'Server xatosi yoki foydalanuvchi qo\'shishda xatolik' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;