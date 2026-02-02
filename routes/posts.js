const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const checkAuth = require('../middleware/auth');
const Post = require('../models/Post');

// Setup Directories
const BLOG_DIR = path.join(__dirname, '../blog');
const IMAGES_DIR = path.join(BLOG_DIR, 'images');

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

// Image Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// API: Get All Posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['date', 'DESC']] });
        res.json(posts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Save Post (Protected)
router.post('/posts', checkAuth, async (req, res) => {
    try {
        const { title, content, image, date } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        const postData = {
            title,
            content,
            image,
            date: date || new Date(),
            slug
        };
        
        const existing = await Post.findOne({ where: { slug } });
        if (existing) {
            await existing.update(postData);
        } else {
            await Post.create(postData);
        }
        
        res.json({ success: true, slug });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Upload Image (Protected)
router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename, url: `blog/images/${req.file.filename}` });
});

module.exports = router;
