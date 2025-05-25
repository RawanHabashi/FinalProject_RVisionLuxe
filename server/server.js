const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// יצירת חיבור למסד הנתונים
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'rvisionluxe_database'
});

const promisePool = pool.promise();

// בדיקת חיבור
app.get('/test', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    res.json({ message: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});