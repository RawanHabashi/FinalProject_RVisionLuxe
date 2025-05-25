const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const productOrderRoutes = require('./routes/productOrder');
const categoryRoutes = require('./routes/category');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/product-orders', productOrderRoutes);
app.use('/categories', categoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});