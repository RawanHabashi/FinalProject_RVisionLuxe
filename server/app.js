const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ טעינת נתיבים
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const orderItemsRoutes = require('./routes/order_Items');
const passwordRecoveryRoutes = require('./routes/password-recovery');
const verifyCodeRoutes = require('./routes/verify-code');
const resetPasswordRoutes = require('./routes/reset-password');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const inventoryRoutes=require('./routes/inventory')

// 🔄 שימוש בנתיבים
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order_Items', orderItemsRoutes);
app.use('/api/password-recovery', passwordRecoveryRoutes);
app.use('/api/verify-code', verifyCodeRoutes);
app.use('/api/reset-password', resetPasswordRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);




// ✅ הגשת תמונות מהנתיב הנכון (server/images)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'images', 'uploads')));


console.log("✅ All routes loaded");

// 🧯 טיפול בשגיאות כלליות
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// הרצת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
