const express = require('express');
const router = express.Router();
const db = require('../config/dbSingleton');

router.get('/', async (req, res) => {
  try {
    console.log("🔍 Trying to get categories from DB...");
    const [categories] = await db.pool.query('SELECT * FROM categories');
    console.log("✅ Categories fetched successfully:", categories);
    res.json(categories);
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({
      error: 'Database error',
      message: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
