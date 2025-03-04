const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const multer = require('multer'); // Rasm yuklash uchun
const fs = require('fs'); // Fayllar bilan ishlash uchun

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


router.get('/backend/get/:menuEditId', async (req, res) => {
    const { menuEditId } = req.params;
    try {
        const [results] = await db.query("SELECT * FROM menu_types WHERE id = ?", [menuEditId]);
        if (results.length === 0) return res.status(404).json({ message: "Ma'lumot topilmadi" });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
});

router.get('/backend/menu/get/:menuEditId', async (req, res) => {
    const { menuEditId } = req.params;
    try {
        const [results] = await db.query("SELECT * FROM menu_item WHERE id = ?", [menuEditId]);
        if (results.length === 0) return res.status(404).json({ message: "Ma'lumot topilmadi" });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
});

router.get('/backend/menu', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM menu_item");
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Menu olishda xatolik", error: err.message });
    }
});

router.get('/backend/categoryId/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM menu_types WHERE category_id = ?', [categoryId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/backend/menuTypeId/:menuTypeId', async (req, res) => {
    const { menuTypeId } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM menu_item WHERE menu_type = ?', [menuTypeId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/backend/menu/add', upload.single('image'), async (req, res) => {
    const { title, description, menuType, price, isVisible } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !menuType || !price || !isVisible) {
        return res.status(400).json({ message: "Nomi, menu turi, narx va ko‘rinadigan ustunlar majburiy!" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO menu_item (title, description, menu_type, price, image_path, is_visible) VALUES (?, ?, ?, ?, ?, ?)",
            [title, description || '', menuType, price, imagePath, isVisible]
        );
        res.status(201).json({ message: "Menu item qo‘shildi", id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Menu item qo‘shishda xatolik", error: err.message });
    }
});
router.delete('/backend/menuDelete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query("SELECT image_path FROM menu_item WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ message: "Menu topilmadi!" });

        const imagePath = results[0].image_path;
        await db.query("DELETE FROM menu_item WHERE id = ?", [id]);

        if (imagePath) {
            fs.unlink(`.${imagePath}`, (unlinkErr) => {
                if (unlinkErr) console.error("Rasmni o‘chirishda xatolik:", unlinkErr);
            });
        }
        res.status(200).json({ message: "Menu item o‘chirildi!" });
    } catch (err) {
        res.status(500).json({ message: "O‘chirishda xatolik", error: err.message });
    }
});

router.put('/backend/menu/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, description, menuType, price, visibleColumns } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !menuType || !price || !visibleColumns) {
        return res.status(400).json({ message: "Nomi, menu turi, narx va ko‘rinadigan ustunlar majburiy!" });
    }

    const menuTypeNum = Number(menuType);
    const priceNum = Number(price);

    if (isNaN(menuTypeNum) || menuTypeNum <= 0) {
        return res.status(400).json({ message: "Menu turi noto‘g‘ri!" });
    }
    if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Narx noto‘g‘ri yoki manfiy bo‘lmasligi kerak!" });
    }

    let visibleColumnsArray;
    try {
        visibleColumnsArray = JSON.parse(visibleColumns);
    } catch (error) {
        return res.status(400).json({ message: "visibleColumns noto‘g‘ri formatda!" });
    }
    const visibleColumnsString = visibleColumnsArray.join(",");

    const query = imagePath 
        ? "UPDATE menu_item SET title = ?, description = ?, menu_type = ?, price = ?, is_visible = ?, image_path = ? WHERE id = ?"
        : "UPDATE menu_item SET title = ?, description = ?, menu_type = ?, price = ?, is_visible = ? WHERE id = ?";
    const params = imagePath 
        ? [title, description || '', menuTypeNum, priceNum, visibleColumnsString, imagePath, id] 
        : [title, description || '', menuTypeNum, priceNum, visibleColumnsString, id];

    try {
        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Menu item topilmadi!" });
        }
        res.status(200).json({ message: "Menu item yangilandi!" });
    } catch (err) {
        console.error("SQL xatoligi:", err.message);
        res.status(500).json({ message: "Ma'lumotni yangilashda xatolik", error: err.message });
    }
});
router.get('/backend/menu/:menuTypesId', async (req, res) => {
    const { menuTypesId } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM menu_item WHERE menu_type = ?', [menuTypesId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/backend/delete/:menuTypesId', async (req, res) => {
    const { menuTypesId } = req.params;
    try {
        await db.query('DELETE FROM menu_types WHERE id = ?', [menuTypesId]);
        res.json({ message: 'Foydalanuvchi o`chirildi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/backend/edit/:menuEditId', upload.single('image'), async (req, res) => {
    const { menuEditId } = req.params;
    const { title, description, category_id } = req.body;

    if (!title || !description) {
        return res.status(400).json({ msg: "Barcha maydonlar to'ldirilishi shart" });
    }

    let imagePath = null;
    if (req.file) {
        const filename = `${Date.now()}-resized.jpg`;
        const resizedPath = path.join('uploads', filename);
        imagePath = `/uploads/${filename}`;

        await sharp(req.file.path).toFile(resizedPath);
        fs.unlinkSync(req.file.path);
    } else {
        const [results] = await db.query("SELECT image FROM menu_types WHERE id = ?", [menuEditId]);
        if (results.length > 0) imagePath = results[0].image;
    }

    const query = imagePath 
        ? "UPDATE menu_types SET title = ?, description = ?, category_id = ?, image = ? WHERE id = ?"
        : "UPDATE menu_types SET title = ?, description = ?, category_id = ? WHERE id = ?";
    const values = imagePath 
        ? [title, description, category_id, imagePath, menuEditId] 
        : [title, description, category_id, menuEditId];

    try {
        await db.query(query, values);
        res.json({ msg: "Muvaffaqiyatli yangilandi ✅", image: imagePath });
    } catch (err) {
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
});
router.get('/menuType/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [results] = await db.query("SELECT * FROM menu_types WHERE userId = ?", [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Server xatosi", error: err.message });
    }
});

router.post('/menuType/upload', upload.single('image'), async (req, res) => {
        if (!req.file) return res.status(400).json({ message: "Rasm yuklanmadi!" });

        const resizedPath = path.join('uploads/', `${Date.now()}-resized.jpg`);
        const dbImagePath = `/uploads/${path.basename(resizedPath)}`;
        const { title, description, category_id } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title va Description to'ldirilishi shart!" });
        }

        try {
            const [result] = await db.query(
                "INSERT INTO menu_types (title, description, image, category_id) VALUES (?, ?, ?, ?)",
                [title, description, dbImagePath, category_id]
            );
            res.json({ message: "menu_types qo‘shildi", id: result.insertId, imagePath: dbImagePath });
        } catch (error) {
            res.status(500).json({ message: "Rasmni qayta ishlashda xatolik", error: error.message });
        }
    });


    
router.get('/categories', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM category");
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Kategoriyalarni olishda xatolik", error: err.message });
    }
});

router.post('/categories/add', async (req, res) => {
    const { category_name, description } = req.body;
    if (!category_name || !description) return res.status(400).json({ message: "Kategoriya nomi va tavsifi kerak" });

    try {
        const [result] = await db.query("INSERT INTO category (category_name, description) VALUES (?, ?)", [category_name, description]);
        res.status(201).json({ message: "Kategoriya qo‘shildi", id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Kategoriya qo‘shishda xatolik", error: err.message });
    }
});

router.delete('/categories/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM category WHERE id = ?", [id]);
        res.json({ message: "Kategoriya o‘chirildi" });
    } catch (err) {
        res.status(500).json({ message: "Kategoriyani o‘chirishda xatolik", error: err.message });
    }
});

router.put('/categories/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { category_name, description } = req.body;

    if (!category_name || !description) {
        return res.status(400).json({ message: "Kategoriya nomi va tavsifi kerak" });
    }

    try {
        const [results] = await db.query("SELECT * FROM category WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ message: "Kategoriya topilmadi" });

        await db.query("UPDATE category SET category_name = ?, description = ? WHERE id = ?", [category_name, description, id]);
        res.json({ message: "Kategoriya yangilandi" });
    } catch (err) {
        res.status(500).json({ message: "Kategoriyani yangilashda xatolik", error: err.message });
    }
});
module.exports = router;