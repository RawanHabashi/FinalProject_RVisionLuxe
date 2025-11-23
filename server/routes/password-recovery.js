const express = require("express");
const router = express.Router();
const initDb = require("../config/dbSingleton");   
const { sendRecoveryEmail } = require("../utils/mailer");

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    // 💡 פה לשים לב – חייבים לקרוא לפונקציה:
    const connection = await initDb();

    await connection.query(
      `INSERT INTO reset_codes (email, code, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         code = VALUES(code),
         expires_at = VALUES(expires_at);`,
      [email, code, expiresAt]
    );

    await sendRecoveryEmail(email, code);

    res.json({ message: "Recovery code sent successfully." });
  } catch (err) {
    console.error("Error storing reset code or sending mail:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
