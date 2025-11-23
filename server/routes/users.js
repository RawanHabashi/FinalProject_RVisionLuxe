const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const initDb = require('../config/dbSingleton');

console.log("✅ users.js loaded");
// 📌 פונקציות בדיקה (Validation)
// שם – רק אותיות ורווחים (כל השפות)
const nameRegex = /^[\p{L}\s]+$/u;
// טלפון – בדיוק 10 ספרות
const phoneRegex = /^\d{10}$/;

// 🚀 רישום משתמש חדש
router.post('/register', async (req, res) => {
  try {
    const db = await initDb();

    const { name, email, password, location, phone_number, role } = req.body;
    console.log("📝 Registering:", email);

    // 🛑 בדיקה: שם תקין
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ error: 'Name must contain letters only' });
    }

    // 🛑 בדיקה: מספר טלפון תקין (10 ספרות)
    if (!phoneRegex.test(String(phone_number).trim())) {
      return res.status(400).json({ error: 'Phone number must contain exactly 10 digits' });
    }

    // 🔍 בדיקה אם המייל קיים
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 🔐 הצפנת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 שמירה ב־DB
    await db.query(
      'INSERT INTO users (name, email, password, location, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email, hashedPassword, location, phone_number, role]
    );

    res.json({ message: 'Registration successful' });

  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


// 🚀 התחברות משתמש
router.post('/login', async (req, res) => {
  try {
    const db = await initDb();

    const { email, password } = req.body;
    console.log('📥 Email:', email);

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // 🔐 השוואת סיסמאות
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});


// 📌 שליפת כל המשתמשים (מנהל)
router.get('/', async (req, res) => {
  try {
    const db = await initDb();
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: 'Database error' });
  }
});


// 🗑️ מחיקת משתמש
router.delete('/:id', async (req, res) => {
  try {
    const db = await initDb();
    const userId = req.params.id;

    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({ message: 'User deleted' });

  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: 'Database error' });
  }
});


// ✏️ עדכון משתמש
router.put('/:id', async (req, res) => {
  try {
    const db = await initDb();
    const userId = req.params.id;
    const { name, email, password, location, phone_number, role } = req.body;

    // 🛑 בדיקת שם
    if (name && !nameRegex.test(name.trim())) {
      return res.status(400).json({ error: 'Name must contain letters only' });
    }

    // 🛑 בדיקת טלפון
    if (phone_number && !phoneRegex.test(String(phone_number).trim())) {
      return res.status(400).json({ error: 'Phone number must contain exactly 10 digits' });
    }

    let updateQuery =
      'UPDATE users SET name = ?, email = ?, location = ?, phone_number = ?, role = ?';
    let params = [name, email, location, phone_number, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE user_id = ?';
    params.push(userId);

    await db.query(updateQuery, params);

    res.json({ message: 'User updated successfully' });

  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;
