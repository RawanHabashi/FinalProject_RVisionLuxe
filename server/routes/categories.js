const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const getDb = require('../config/dbSingleton'); 

// שמירת קבצים לתיקייה server/images/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'images', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.query(`
      SELECT 
        category_id,
        category_name AS name,
        image_url     AS image
      FROM categories
      ORDER BY category_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ /api/categories error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// POST /api/categories  (JSON או multipart)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const db = await getDb();
    const { name, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'name is required' });

    const imageValue = req.file
      ? `uploads/${req.file.filename}`
      : (image?.trim() || null);

    await db.query(
      'INSERT INTO categories (category_name, image_url) VALUES (?, ?)',
      [name.trim(), imageValue]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error('❌ Create category error:', err.message);
    res.status(500).json({ message: 'Create failed' });
  }
});

// PUT /api/categories/:id  (JSON או multipart)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { name, image } = req.body;

    const imageValue = req.file ? `uploads/${req.file.filename}` : (image ?? undefined);

    const fields = [];
    const values = [];
    if (name != null)             { fields.push('category_name=?'); values.push(name); }
    if (imageValue !== undefined) { fields.push('image_url=?');     values.push(imageValue || null); }

    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

    values.push(id);
    await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE category_id=?`, values);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Update category error:', err.message);
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE category_id=?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Delete category error:', err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
