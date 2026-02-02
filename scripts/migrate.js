const fs = require('fs');
const path = require('path');
const sequelize = require('../database/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Page = require('../models/Page');

async function migrate() {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced');

        // Migrate Users
        const usersFile = path.join(__dirname, '../data/users.json');
        if (fs.existsSync(usersFile)) {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            for (const u of users) {
                // Ensure we don't insert duplicate users if ran multiple times (though force: true handles this)
                await User.create(u);
            }
            console.log('Users migrated');
        }

        // Migrate Posts
        const postsDir = path.join(__dirname, '../blog/posts');
        if (fs.existsSync(postsDir)) {
            const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
            for (const f of files) {
                const content = JSON.parse(fs.readFileSync(path.join(postsDir, f), 'utf8'));
                const slug = content.slug || f.replace('.json', '');
                await Post.create({
                    title: content.title,
                    slug: slug,
                    content: content.content,
                    image: content.image,
                    date: content.date
                });
            }
            console.log('Posts migrated');
        }
        
        console.log('Migration complete');
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
