const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton'); // ← שם ברור יותר: זוהי פונקציה

// קבלת כל המוצרים
router.get('/', async (req, res) => {
    try {
        const db = await initDb(); // ← כאן אנחנו באמת יוצרים connection
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        console.error('Get Products Error:', err);
        res.status(500).json({ error: 'שגיאה בקבלת המוצרים' });
    }
});

// הוספת מוצר חדש
router.post('/', async (req, res) => {
    try {
        const db = await initDb(); // ← גם כאן
        const { name, price, description, image, category_id } = req.body;

        await db.query(
            'INSERT INTO products (name, price, description, image, category_id) VALUES (?, ?, ?, ?, ?)',
            [name, price, description, image, category_id]
        );

        res.json({ message: 'מוצר נוסף בהצלחה' });
    } catch (err) {
        console.error('Add Product Error:', err);
        res.status(500).json({ error: 'שגיאה בהוספת מוצר' });
    }
});

module.exports = router;
