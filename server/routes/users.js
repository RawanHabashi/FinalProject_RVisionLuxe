const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const initDb = require('../config/dbSingleton');
console.log("✅ users.js loaded");
// רישום משתמש חדש
router.post('/register', async (req, res) => {
  try {
const db = await initDb();
    const { name, email, password, location, phone_number, role } = req.body;
    console.log("📝 Registering:", email, password);
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Hashed password:", hashedPassword);
    await db.query(
      'INSERT INTO users (name, email, password, location, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, location, phone_number, role]
    );
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});
// התחברות משתמש
router.post('/login', async (req, res) => {
  try {
const db = await initDb();
    const { email, password } = req.body;
    console.log('📥 Email:', email);
    console.log('📥 Password (entered):', password);
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log("🧪 Users from DB:", users);
    if (users.length === 0) {
      console.log("❌ No user found for this email");
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = users[0];
    console.log("📦 Password in DB:", user.password);
    console.log("👁️ Comparing: typed =", password, "| from DB =", user.password);
    const match = await bcrypt.compare(password, user.password);
    console.log("🔍 Bcrypt result:", match);
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
// שליפת כל המשתמשים (למנהל)
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
// מחיקת משתמש
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
// עדכון משתמש
router.put('/:id', async (req, res) => {
  try {
const db = await initDb();
    const userId = req.params.id;
    const { name, email, password, location, phone_number, role } = req.body;
    let updateQuery = 'UPDATE users SET name = ?, email = ?, location = ?, phone_number = ?, role = ?';
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
