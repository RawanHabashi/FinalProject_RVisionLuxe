const express = require("express");
const router  = express.Router();
const initDb  = require("../config/dbSingleton"); 

router.post("/", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Missing email or code." });
  }

  try {
    // מקבלים חיבור ל-DB כמו בשאר הראוטים
    const connection = await initDb();

    const [rows] = await connection.query(
      `SELECT * 
       FROM reset_codes
       WHERE email = ? 
         AND code  = ? 
         AND expires_at > NOW()`,
      [email, code]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // אם הגענו לכאן – הקוד תקין
    res.json({ message: "Code is valid." });
  } catch (err) {
    console.error("Error verifying code:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
