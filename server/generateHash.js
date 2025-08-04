// generateHash.js

const bcrypt = require('bcrypt');

async function generate() {
  const plainPassword = "admin123"; // ✏️ שימי כאן את הסיסמה שאת רוצה להצפין
  const saltRounds = 10;

  try {
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    console.log("🔐 Hashed password:", hashed);
  } catch (err) {
    console.error("❌ Error hashing password:", err);
  }
}

generate();
