const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const checkAuth = require('../middleware/auth');

// Get All Pages
router.get('/', async (req, res) => {
    try {
        const pages = await Page.findAll({ attributes: ['id', 'title', 'slug'] });
        res.json(pages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Page by Slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ where: { slug: req.params.slug } });
        if (!page) return res.status(404).json({ error: 'Page not found' });
        res.json(page);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Save Page (Create/Update)
router.post('/', checkAuth, async (req, res) => {
    try {
        const { title, slug, html, css, components, styles } = req.body;
        
        const existing = await Page.findOne({ where: { slug } });
        if (existing) {
            await existing.update({ title, html, css, components, styles });
        } else {
            await Page.create({ title, slug, html, css, components, styles });
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Page
router.delete('/:slug', checkAuth, async (req, res) => {
    try {
        await Page.destroy({ where: { slug: req.params.slug } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
