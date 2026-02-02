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

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Interface at http://localhost:${PORT}/admin`);
});
