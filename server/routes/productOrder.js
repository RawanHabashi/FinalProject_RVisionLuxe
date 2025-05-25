const express = require('express');
const router = express.Router();
const dbSingleton = require('../config/dbSingleton');

// Execute a query to the database
const db = dbSingleton.getConnection();

// Get all product orders
router.get('/', (req, res, next) => {
    try {
        const { limit } = req.query;

        if (limit && isNaN(limit)) {
            return res.status(400).json({ error: 'Parameter "limit" must be a number' });
        }

        const query = limit 
            ? 'SELECT * FROM product_orders LIMIT ?'
            : 'SELECT * FROM product_orders';

        const params = limit ? [parseInt(limit, 10)] : [];

        db.query(query, params, (err, results) => {
            if (err) {
                return next(err);
            }
            res.json(results);
        });
    } catch (error) {
        next(error);
    }
});

// Add new product order
router.post('/', (req, res, next) => {
    try {
        const { order_code, product_code, quantity } = req.body;

        // Validate request payload
        if (!order_code || !product_code || !quantity) {
            return res.status(400).json({ error: 'Invalid request payload' });
        }

        // Check if product exists
        const checkProductQuery = 'SELECT id FROM products WHERE id = ?';
        db.query(checkProductQuery, [product_code], (err, result) => {
            if (err) {
                return next(err);
            }

            if (result.length === 0) {
                return res.status(400).json({ error: 'Invalid product ID' });
            }

            // Insert the order item
            const query = 'INSERT INTO product_orders (order_code, product_code, quantity) VALUES (?, ?, ?)';
            db.query(query, [order_code, product_code, quantity], (err, results) => {
                if (err) {
                    return next(err);
                }
                res.json({ message: 'Product order added!', id: results.insertId });
            });
        });
    } catch (error) {
        next(error);
    }
});

// Update product order
router.put('/:order_code/:product_code', (req, res, next) => {
    try {
        const { order_code, product_code } = req.params;
        const { quantity } = req.body;

        // Validate quantity
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive number' });
        }

        const query = 'UPDATE product_orders SET quantity = ? WHERE order_code = ? AND product_code = ?';
        db.query(query, [quantity, order_code, product_code], (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product order not found' });
            }
            res.json({ message: 'Product order updated!' });
        });
    } catch (error) {
        next(error);
    }
});

// Delete product order
router.delete('/:order_code/:product_code', (req, res, next) => {
    try {
        const { order_code, product_code } = req.params;
        const query = 'DELETE FROM product_orders WHERE order_code = ? AND product_code = ?';
        db.query(query, [order_code, product_code], (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product order not found' });
            }
            res.json({ message: 'Product order deleted!' });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;