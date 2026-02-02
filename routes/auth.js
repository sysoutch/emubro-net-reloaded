const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.body.username } });

        if (!user) {
            return res.status(401).json({ message: 'Auth failed' });
        }

        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
            return res.status(401).json({ message: 'Auth failed' });
        }

        const token = jwt.sign(
            {
                username: user.username,
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            message: 'Auth successful',
            token: token
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
