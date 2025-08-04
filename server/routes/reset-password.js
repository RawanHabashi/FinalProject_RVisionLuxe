const express = require("express");
const router = express.Router();
const db = require("../config/dbSingleton");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Missing data." });
  }

  try {
    const connection = await db;

    // בדיקה אם קוד האימות קיים ותקף
    const [rows] = await connection.query(
      `SELECT * FROM reset_codes WHERE email = ? AND code = ? AND expires_at > NOW()`,
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // עדכון סיסמה במסד הנתונים
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query(
      `UPDATE users SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // מחיקת קוד מהטבלה לאחר שינוי סיסמה
    await connection.query(
      `DELETE FROM reset_codes WHERE email = ?`,
      [email]
    );

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
