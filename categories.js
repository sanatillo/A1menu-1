// const express = require('express');
// const router = express.Router();
// const connectDB = require('./db');

// let db; // Global o‘zgaruvchi
// (async () => {
//     db = await connectDB(); // Ulanishni bir marta yaratamiz
// })();

// router.get('/', async (req, res) => {
//     try {
//         const [results] = await db.query("SELECT * FROM category");
//         res.json(results);
//     } catch (err) {
//         res.status(500).json({ message: "Kategoriyalarni olishda xatolik", error: err.message });
//     }
// });

// router.post('/add', async (req, res) => {
//     const { category_name, description } = req.body;
//     if (!category_name || !description) return res.status(400).json({ message: "Kategoriya nomi va tavsifi kerak" });

//     try {
//         const [result] = await db.query("INSERT INTO category (category_name, description) VALUES (?, ?)", [category_name, description]);
//         res.status(201).json({ message: "Kategoriya qo‘shildi", id: result.insertId });
//     } catch (err) {
//         res.status(500).json({ message: "Kategoriya qo‘shishda xatolik", error: err.message });
//     }
// });

// router.delete('/delete/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         await db.query("DELETE FROM category WHERE id = ?", [id]);
//         res.json({ message: "Kategoriya o‘chirildi" });
//     } catch (err) {
//         res.status(500).json({ message: "Kategoriyani o‘chirishda xatolik", error: err.message });
//     }
// });

// router.put('/edit/:id', async (req, res) => {
//     const { id } = req.params;
//     const { category_name, description } = req.body;

//     if (!category_name || !description) {
//         return res.status(400).json({ message: "Kategoriya nomi va tavsifi kerak" });
//     }

//     try {
//         const [results] = await db.query("SELECT * FROM category WHERE id = ?", [id]);
//         if (results.length === 0) return res.status(404).json({ message: "Kategoriya topilmadi" });

//         await db.query("UPDATE category SET category_name = ?, description = ? WHERE id = ?", [category_name, description, id]);
//         res.json({ message: "Kategoriya yangilandi" });
//     } catch (err) {
//         res.status(500).json({ message: "Kategoriyani yangilashda xatolik", error: err.message });
//     }
// });

// module.exports = router;