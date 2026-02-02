const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const checkAuth = require('../middleware/auth');

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
    // req.userData comes from checkAuth middleware decoding the JWT
    if (req.userData.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// List Users
router.get('/', checkAuth, checkAdmin, async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'role', 'createdAt'] });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add User
router.post('/', checkAuth, checkAdmin, async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword, role });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete User
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Change Password
router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update({ password: hashedPassword }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
