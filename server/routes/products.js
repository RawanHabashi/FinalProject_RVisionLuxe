const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const initDb = require('../config/dbSingleton'); // פונקציה שמחזירה חיבור DB יחיד

/* ===== Multer: אחסון קבצים ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'images', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = path.basename(file.originalname || 'image', ext).replace(/\s+/g, '_');
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  },
});
const upload = multer({ storage }); // שם שדה הקובץ: "image"

/* ===== GET: כל המוצרים ===== */
router.get('/', async (req, res) => {
  try {
    const db = await initDb();
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Get Products Error:', err);
    res.status(500).json({ error: 'שגיאה בקבלת המוצרים' });
  }
});

/* ===== POST: הוספת מוצר (URL או קובץ) ===== */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const db = await initDb();

    // קודם שולפים את ה-body
    const {
      name = '',
      price = 0,
      description = '',
      image = '',        // URL/שם קובץ (אם אין קובץ)
      category_id = null,
    } = req.body;

    // ואז מחליטים על תמונה: קובץ קודם, אחרת ה-URL שנשלח
    const fileName = req.file ? req.file.filename : null;
    const imageValue = fileName ? `uploads/${fileName}` : (image || '');

    const [result] = await db.query(
      'INSERT INTO products (name, price, description, image, category_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), Number(price), description.trim(), imageValue.trim(), category_id ? Number(category_id) : null]
    );

    res.json({ message: 'מוצר נוסף בהצלחה', product_id: result.insertId });
  } catch (err) {
    console.error('Add Product Error:', err);
    res.status(500).json({ error: 'שגיאה בהוספת מוצר' });
  }
});

/* ===== PUT: עדכון מוצר (URL או קובץ) ===== */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const db = await initDb();
    const { id } = req.params;

    const {
      name = null,
      price = null,
      description = null,
      image = undefined,      // undefined → לא נעדכן
      category_id = undefined // undefined → לא נעדכן
    } = req.body;

    const fields = [];
    const params = [];

    if (name !== null)         { fields.push('name = ?');        params.push(name.trim()); }
    if (price !== null)        { fields.push('price = ?');       params.push(Number(price)); }
    if (description !== null)  { fields.push('description = ?'); params.push(description.trim()); }

    if (req.file) {
      fields.push('image = ?');
      params.push(`uploads/${req.file.filename}`);
    } else if (image !== undefined) {
      // אם נשלח מפתח image (גם אם מחרוזת ריקה) נעדכן
      fields.push('image = ?');
      params.push((image || '').trim());
    }

    if (category_id !== undefined) {
      fields.push('category_id = ?');
      params.push(category_id === '' ? null : Number(category_id));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'לא נשלחו שדות לעדכון' });
    }

    params.push(Number(id));
    await db.query(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, params);

    res.json({ message: 'מוצר עודכן בהצלחה' });
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ error: 'שגיאה בעדכון מוצר' });
  }
});

/* ===== DELETE: מחיקת מוצר ===== */
router.delete('/:id', async (req, res) => {
  try {
    const db = await initDb();
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE product_id = ?', [Number(id)]);
    res.json({ message: 'המוצר נמחק בהצלחה' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ error: 'שגיאה במחיקת מוצר' });
  }
});

module.exports = router;
