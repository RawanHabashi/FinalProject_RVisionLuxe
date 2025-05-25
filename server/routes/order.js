const express = require('express');
const router = express.Router();
const dbSingleton = require('../config/dbSingleton');

const db = dbSingleton.getConnection();

// Get all orders
router.get('/', (req, res, next) => {
    try {
        const query = `
            SELECT o.id, o.user_id, o.created_at, 
                   oi.product_id, oi.quantity
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id`;
            
        db.query(query, (err, results) => {
            if (err) return next(err);
            res.json(results);
        });
    } catch (error) {
        next(error);
    }
});

// Add new order
router.post('/', (req, res, next) => {
    try {
        const { user_id, items } = req.body;

        if (!user_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid request payload' });
        }

        // Start transaction
        db.beginTransaction((err) => {
            if (err) return next(err);

            // Insert order
            const orderQuery = 'INSERT INTO orders (user_id) VALUES (?)';
            db.query(orderQuery, [user_id], (err, orderResult) => {
                if (err) {
                    return db.rollback(() => next(err));
                }

                const orderId = orderResult.insertId;
                const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity) VALUES ?';
                const itemValues = items.map(item => [orderId, item.product_id, item.quantity]);

                // Insert order items
                db.query(itemQuery, [itemValues], (err) => {
                    if (err) {
                        return db.rollback(() => next(err));
                    }

                    // Commit transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => next(err));
                        }
                        res.json({ message: 'Order created!', id: orderId });
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
});

// Delete order
router.delete('/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        // Start transaction
        db.beginTransaction((err) => {
            if (err) return next(err);

            // Delete order items first
            const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
            db.query(deleteItemsQuery, [id], (err) => {
                if (err) {
                    return db.rollback(() => next(err));
                }

                // Then delete the order
                const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
                db.query(deleteOrderQuery, [id], (err, result) => {
                    if (err) {
                        return db.rollback(() => next(err));
                    }

                    if (result.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Order not found' });
                        });
                    }

                    // Commit transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => next(err));
                        }
                        res.json({ message: 'Order deleted!' });
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;