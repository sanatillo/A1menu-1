const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const multer = require('multer'); // Rasm yuklash uchun
let db; // Global o‘zgaruvchi
(async () => {
    db = await connectDB(); // Ulanishni bir marta yaratamiz
})();


const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });
const cmsUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Faqat JPEG, JPG yoki PNG fayllar qo‘llab-quvvatlanadi!'));
        }
    }
}).fields([{ name: 'kafe_image', maxCount: 1 }, { name: 'kafe_logo', maxCount: 1 }]);

router.post("/cmsAddUser", cmsUpload, async (req, res) => { 

    const { kafe_name, email, phone, address, map_url, social_networks } = req.body;
    const kafeImage = req.files['kafe_image'] ? `/uploads/${req.files['kafe_image'][0].filename}` : null;
    const kafeLogo = req.files['kafe_logo'] ? `/uploads/${req.files['kafe_logo'][0].filename}` : null;

    if (!kafe_name || !phone || !address || !map_url || !email) {
        return res.status(400).json({ message: "Barcha maydonlar to‘ldirilishi shart!" });
    }

    // Telefon raqam formati tekshiruvi
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Telefon raqam formati noto‘g‘ri! (+998 bilan boshlanib, 12 raqam bo‘lishi kerak)" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Email va Phone tekshiruvi
        const [existingEmailInUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email]);
        const [existingEmailInLogin] = await connection.execute("SELECT id FROM login WHERE email = ?", [email]);
        const [existingPhoneInUsers] = await connection.execute("SELECT id FROM users WHERE phone = ?", [phone]);
        const [existingPhoneInLogin] = await connection.execute("SELECT id FROM login WHERE phone = ?", [phone]);

        if (existingEmailInUsers.length > 0 || existingEmailInLogin.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Bu email allaqachon ro‘yxatdan o‘tgan!" });
        }
        if (existingPhoneInUsers.length > 0 || existingPhoneInLogin.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Bu telefon raqam allaqachon ro‘yxatdan o‘tgan!" });
        }

        // Ijtimoiy tarmoqlarni parse qilish
        let parsedSocialNetworks;
        try {
            parsedSocialNetworks = social_networks ? JSON.parse(social_networks) : {};
        } catch (e) {
            await connection.rollback();
            return res.status(400).json({ message: "Ijtimoiy tarmoqlar formati noto‘g‘ri!" });
        }

        const filteredSocialNetworks = {};
        for (const [key, value] of Object.entries(parsedSocialNetworks)) {
            if (value && value.trim() !== "") {
                filteredSocialNetworks[key] = value.trim();
            }
        }

        // Users jadvaliga yozish
        const [userResult] = await connection.execute(
            `INSERT INTO users (kafe_name, email, phone, address, map_url, social_networks, kafe_image, kafe_logo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [kafe_name, email, phone, address, map_url, JSON.stringify(filteredSocialNetworks), kafeImage, kafeLogo]
        );
        const userId = userResult.insertId;

        // Login jadvaliga yozish
        await connection.execute(
            "INSERT INTO login (email, phone) VALUES (?, ?)",
            [email, phone]
        );

        await connection.commit();
        res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo‘shildi!", userId });
    } catch (error) {
        await connection.rollback();
        console.error("Xatolik:", error);
        res.status(500).json({ message: "Ma'lumot qo‘shishda xatolik!", error: error.message });
    } finally {
        connection.release();
    }
}); // CMS foydalanuvchini qo‘shish

router.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM users");
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Menu olishda xatolik", error: err.message });
    }
});

router.delete('/users/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "User o‘chirildi" });
    } catch (err) {
        res.status(500).json({ message: "User o‘chirishda xatolik", error: err.message });
    }
});

router.put('/user/update/:id', cmsUpload, async (req, res) => {
    const { id } = req.params;
    const { kafe_name, email, phone, address, map_url, social_networks } = req.body;
    let kafeImagePath = null;
    let kafeLogoPath = null;

    if (req.files && req.files['kafe_image']) {
        kafeImagePath = `/uploads/${req.files['kafe_image'][0].filename}`;
    }
    if (req.files && req.files['kafe_logo']) {
        kafeLogoPath = `/uploads/${req.files['kafe_logo'][0].filename}`;
    }

    if (!kafe_name || !phone || !address || !map_url) {
        return res.status(400).json({ message: "Majburiy maydonlar (kafe nomi, telefon, manzil, xarita URL) to‘ldirilishi kerak" });
    }

    try {
        const [existingUser] = await db.query("SELECT kafe_image, kafe_logo, social_networks FROM users WHERE id = ?", [id]);
        if (existingUser.length === 0) return res.status(404).json({ message: "User topilmadi" });

        const parsedSocialNetworks = social_networks ? JSON.parse(social_networks) : JSON.parse(existingUser[0].social_networks || '{}');
        const filteredSocialNetworks = {};
        for (const [key, value] of Object.entries(parsedSocialNetworks)) {
            if (value && value.trim() !== "") {
                filteredSocialNetworks[key] = value.trim();
            }
        }

        const finalKafeImage = kafeImagePath || existingUser[0].kafe_image;
        const finalKafeLogo = kafeLogoPath || existingUser[0].kafe_logo;

        const [result] = await db.query(
            `UPDATE users 
             SET kafe_name = ?, email = ?, phone = ?, address = ?, map_url = ?, social_networks = ?, kafe_image = ?, kafe_logo = ? 
             WHERE id = ?`,
            [kafe_name, email || null, phone, address, map_url, JSON.stringify(filteredSocialNetworks), finalKafeImage, finalKafeLogo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User topilmadi" });
        }

        res.json({ message: "Foydalanuvchi yangilandi" });
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ message: "Foydalanuvchi yangilashda xatolik", error: err.message });
    }
});


module.exports = router;
// End of CMSAdmin.js