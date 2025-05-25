const express = require('express');
const router = express.Router();
const dbSingleton = require('../config/dbSingleton');

const db = dbSingleton.getConnection();

// Get all products
router.get('/', (req, res, next) => {
    try {
        const query = 'SELECT * FROM products';
        db.query(query, (err, results) => {
            if (err) return next(err);
            res.json(results);
        });
    } catch (error) {
        next(error);
    }
});

// Add new product
router.post('/', (req, res, next) => {
    try {
        const { name, description, price } = req.body;

        if (!name || !price || isNaN(price)) {
            return res.status(400).json({ error: 'Name and valid price are required' });
        }

        const query = 'INSERT INTO products (name, description, price) VALUES (?, ?, ?)';
        db.query(query, [name, description, price], (err, results) => {
            if (err) return next(err);
            res.json({ message: 'Product added!', id: results.insertId });
        });
    } catch (error) {
        next(error);
    }
});

// Update product
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;

        if (!name || !price || isNaN(price)) {
            return res.status(400).json({ error: 'Name and valid price are required' });
        }

        const query = 'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?';
        db.query(query, [name, description, price, id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ message: 'Product updated!' });
        });
    } catch (error) {
        next(error);
    }
});

// Delete product
router.delete('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM products WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ message: 'Product deleted!' });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;