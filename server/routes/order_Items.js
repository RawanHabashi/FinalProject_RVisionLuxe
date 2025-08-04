const express = require('express');
const router = express.Router();
const initDb = require('../config/dbSingleton'); // Use initDb function

// Get all order items
router.get('/', async (req, res) => {
    try {
        const db = await initDb(); // Create DB connection
        const [items] = await db.query('SELECT * FROM order_items');
        res.json(items);
    } catch (err) {
        console.error('❌ Error fetching order items:', err);
        res.status(500).json({ error: 'Failed to fetch order items' });
    }
});

// Add an order item
router.post('/', async (req, res) => {
    try {
        const db = await initDb(); // Create DB connection
        const { order_id, product_id, quantity } = req.body;

        await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
            [order_id, product_id, quantity]
        );

        res.json({ message: 'Order item added successfully' });
    } catch (err) {
        console.error('❌ Error adding order item:', err);
        res.status(500).json({ error: 'Failed to add order item' });
    }
});

module.exports = router;
