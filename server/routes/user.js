const express = require('express');
const router = express.Router();
const dbSingleton = require('../config/dbSingleton');

const db = dbSingleton.getConnection();

// Get all users
router.get('/', (req, res, next) => {
    try {
        const query = 'SELECT user_id, name,location,phone_number, email,password, role FROM users';
        db.query(query, (err, results) => {
            if (err) return next(err);
            res.json(results);
        });
    } catch (error) {
        next(error);
    }
});

// Add new user
router.post('/', (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const checkQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error("Check Query Error:", err);
                return next(err);
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Insert new user
            const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "customer")';
            db.query(insertQuery, [name, email, password], (err, results) => {
                if (err) {
                    console.error("Insert Query Error:", err);
                    return next(err);
                }
                console.log("Insert successful:", results);
                res.status(201).json({ 
                    message: 'User registered successfully!',
                    userId: results.insertId,
                    role: 'customer'
                });
            });
        });
    } catch (error) {
        console.error("General Error:", error);
        next(error);
    }
});

// Update user
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
        db.query(query, [name, email, id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated!' });
        });
    } catch (error) {
        next(error);
    }
});

// Delete user
router.delete('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return next(err);
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User deleted!' });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;