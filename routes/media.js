const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const checkAuth = require('../middleware/auth');
const { Media } = require('../models/Media');

const UPLOAD_ROOT = path.join(__dirname, '../blog');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = file.mimetype.startsWith('video/') ? 'videos' : 'images';
        const dir = path.join(UPLOAD_ROOT, type);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Get all media
router.get('/', checkAuth, async (req, res) => {
    try {
        const media = await Media.findAll({ order: [['createdAt', 'DESC']] });
        res.json(media);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Upload media
router.post('/upload', checkAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        const subDir = type === 'video' ? 'videos' : 'images';
        
        const media = await Media.create({
            filename: req.file.filename,
            url: `blog/${subDir}/${req.file.filename}`,
            type,
            originalName: req.file.originalname,
            size: req.file.size
        });
        
        res.json(media);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add media from URL
router.post('/url', checkAuth, async (req, res) => {
    try {
        const { url, type, altText } = req.body;
        const media = await Media.create({
            filename: 'external',
            url,
            type: type || 'image',
            originalName: 'External URL',
            altText
        });
        res.json(media);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update media
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ error: 'Not found' });
        
        await media.update(req.body);
        res.json(media);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete media
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ error: 'Not found' });
        
        if (media.filename !== 'external') {
            const filePath = path.join(__dirname, '..', media.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        await media.destroy();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
