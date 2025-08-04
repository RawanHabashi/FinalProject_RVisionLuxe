const bcrypt = require('bcrypt');

async function test() {
  const plain = "admin123"; // הסיסמה שאת מקלידה בטופס
  const hashed = "$2b$10$qToHq/A1FHTHAmj0lX25W.f82gCl0JD2sFub7T5gRExCdE9fs8Rxe"; // הסיסמה שמופיעה ב-DB

  const result = await bcrypt.compare(plain, hashed);
  console.log("✅ bcrypt compare result:", result);
}

test();
