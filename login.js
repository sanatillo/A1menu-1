const express = require('express');
const router = express.Router();
const connectDB = require('./db');

let db; // Global o‘zgaruvchi
(async () => {
    db = await connectDB(); // Ulanishni bir marta yaratamiz
})();


router.post("/", async (req, res) => {
    const { email, phone } = req.body;
     console.log("Request body:", req.body);

    if (!email || !phone) {
        return res.status(400).json({ message: "Email va telefon raqam kiritilishi shart!" });
    }

    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Telefon raqam formati noto‘g‘ri! (+998 bilan boshlanib, 12 raqam bo‘lishi kerak)" });
    }

    const connection = await db.getConnection();
    try {
        const [user] = await connection.execute(
            "SELECT id FROM login  WHERE email = ? AND phone = ?",
            [email, phone]
        );

        if (user.length === 0) {
            return res.status(401).json({ message: "Email yoki telefon raqam noto‘g‘ri!" });
        }

        const userId = user[0].id;
 

        res.status(200).json({
            message: "Muvaffaqiyatli kirish!", 
            userId
        });
    } catch (error) {
        console.error("Login xatosi:", error);
        res.status(500).json({ message: "Server xatosi!" });
    } finally {
        connection.release();
    }
});

module.exports = router;