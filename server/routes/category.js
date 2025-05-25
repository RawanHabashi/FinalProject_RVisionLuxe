const express = require('express');
const router = express.Router();
const dbSingleton = require('../config/dbSingleton');

const db = dbSingleton.getConnection();

// Get all categories
router.get('/', (req, res, next) => {
    try {
        const query = 'SELECT * FROM categories';
        db.query(query, (err, results) => {
            if (err) return next(err);
            res.json(results);
        });
    } catch (error) {
        next(error);
    }
});

// Add new category
router.post('/', (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const query = 'INSERT INTO categories (name) VALUES (?)';
        db.query(query, [name], (err, results) => {
            if (err) return next(err);
            res.json({ message: 'Category added!', id: results.insertId });
        });
    } catch (error) {
        next(error);
    }
});

// Update category
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const query = 'UPDATE categories SET name = ? WHERE id = ?';
        db.query(query, [name, id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json({ message: 'Category updated!' });
        });
    } catch (error) {
        next(error);
    }
});

// Delete category
router.delete('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM categories WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json({ message: 'Category deleted!' });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;