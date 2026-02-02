require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const themesRoutes = require('./routes/themes');
const usersRoutes = require('./routes/users');
const pagesRoutes = require('./routes/pages');
const mediaRoutes = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname)); // Serve static files from root

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', postsRoutes); // Mounts /posts and /upload
app.use('/api/themes', themesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/media', mediaRoutes);

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Custom Pages Route
const Page = require('./models/Page');
app.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ where: { slug: req.params.slug } });
        if (!page) return res.status(404).send('Page not found');
        
        // Return a basic HTML template for the page
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${page.title}</title>
                <link rel="stylesheet" href="/style.css">
                <style>
                    body { padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                    img { max-width: 100%; height: auto; }
                    ${page.css || ''}
                </style>
            </head>
            <body data-theme="dark">
                <a href="/" style="color:var(--accent); text-decoration:none;">← Back Home</a>
                <h1 style="margin-top: 20px;">${page.title}</h1>
                <div class="page-content" style="margin-top: 30px;">
                    ${page.html}
                </div>
            </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Interface at http://localhost:${PORT}/admin`);
});
