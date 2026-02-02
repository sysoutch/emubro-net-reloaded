const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const checkAuth = require('../middleware/auth');

const THEMES_FILE = path.join(__dirname, '../data/themes.json');
const CUSTOM_THEME_SCSS = path.join(__dirname, '../styles/_custom-theme.scss');
const MAIN_SCSS = path.join(__dirname, '../styles/main.scss');
const OUTPUT_CSS = path.join(__dirname, '../style.css');

// Helper to compile CSS
const compileCSS = () => {
    try {
        // Generate SCSS from themes.json
        const themes = JSON.parse(fs.readFileSync(THEMES_FILE, 'utf8'));
        let scssContent = '/* Auto-generated custom themes */\n';
        
        themes.forEach(theme => {
            scssContent += `[data-theme="${theme.name}"] {\n`;
            for (const [key, value] of Object.entries(theme.colors)) {
                scssContent += `    ${key}: ${value};\n`;
            }
            scssContent += '}\n';
        });

        fs.writeFileSync(CUSTOM_THEME_SCSS, scssContent);

        // Compile Sass
        const result = sass.compile(MAIN_SCSS, { style: 'expanded' });
        fs.writeFileSync(OUTPUT_CSS, result.css);
        console.log('CSS Recompiled');
        return true;
    } catch (e) {
        console.error('Sass Compilation Error:', e);
        return false;
    }
};

// GET all themes
router.get('/', (req, res) => {
    try {
        const themes = JSON.parse(fs.readFileSync(THEMES_FILE, 'utf8'));
        res.json(themes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SAVE theme (Auth required)
router.post('/', checkAuth, (req, res) => {
    try {
        const { name, colors } = req.body;
        if (!name || !colors) return res.status(400).json({ error: 'Name and colors required' });

        const themes = JSON.parse(fs.readFileSync(THEMES_FILE, 'utf8'));
        const existingIndex = themes.findIndex(t => t.name === name);

        if (existingIndex >= 0) {
            themes[existingIndex] = { name, colors };
        } else {
            themes.push({ name, colors });
        }

        fs.writeFileSync(THEMES_FILE, JSON.stringify(themes, null, 2));
        
        if (compileCSS()) {
            res.json({ success: true, message: 'Theme saved and CSS recompiled' });
        } else {
            res.status(500).json({ error: 'Theme saved but CSS compilation failed' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE theme
router.delete('/:name', checkAuth, (req, res) => {
     try {
        const name = req.params.name;
        let themes = JSON.parse(fs.readFileSync(THEMES_FILE, 'utf8'));
        themes = themes.filter(t => t.name !== name);
        fs.writeFileSync(THEMES_FILE, JSON.stringify(themes, null, 2));
        
        compileCSS();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
