//שינוי מע"מ בממשק מנהל
const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton');

// החזרת אחוז המע״מ הנוכחי
router.get('/vat', async (req, res) => {
  try {
     const db = await initDb(); 
    const [rows] = await db.query('SELECT `value` FROM settings WHERE `key` = "vat_percent" LIMIT 1');
    const vat = rows.length ? parseFloat(rows[0].value) : 18;
    res.json({ vat_percent: vat });
  } catch (err) {
    console.error('GET /api/settings/vat error:', err);
    res.status(500).json({ error: 'Failed to get VAT' });
  }
});

// עדכון אחוז המע״מ 
router.put('/vat', async (req, res) => {
  try {
     const db = await initDb(); 
    let { vat_percent } = req.body;
    if (vat_percent === undefined || vat_percent === null || isNaN(vat_percent)) {
      return res.status(400).json({ error: 'vat_percent is required and must be a number' });
    }
    vat_percent = parseFloat(vat_percent);
    if (vat_percent < 0 || vat_percent > 100) {
      return res.status(400).json({ error: 'vat_percent must be between 0 and 100' });
    }

    await db.query(
      'INSERT INTO settings (`key`, `value`) VALUES ("vat_percent", ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
      [String(vat_percent)]
    );
    res.json({ ok: true, vat_percent });
  } catch (err) {
    console.error('PUT /api/settings/vat error:', err);
    res.status(500).json({ error: 'Failed to update VAT' });
  }
});

module.exports = router;
