const fs = require('fs');
const path = require('path');

const platformsDir = 'emubro-resources/platforms';
const gamelistDir = 'gamelist';
const outputFile = 'site-data.json';

const platforms = [];
const gameLists = [];

// Helper to find mapping or fuzzy match
const shortNames = {
    'dc': 'dreamcast',
    'gb': 'gameboy',
    'gbc': 'gameboy', // Assuming GBC uses gameboy config or just map to it
    'wiiu': 'wii-u',
    'psx': 'psx',
    'ps2': 'ps2',
    'ps3': 'ps3',
    'psp': 'psp',
    'nes': 'nes',
    'snes': 'snes',
    'n64': 'n64',
    'nds': 'nds',
    '3ds': '3ds',
    'switch': 'switch',
    'scummvm': 'scummvm',
    'gba': 'gba'
};

try {
    // Process Platforms
    if (fs.existsSync(platformsDir)) {
        const platformFolders = fs.readdirSync(platformsDir);
        for (const folder of platformFolders) {
            const configPath = path.join(platformsDir, folder, 'config.json');
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    platforms.push({
                        id: folder,
                        name: config.name || folder,
                        company: config.companyName || 'Unknown',
                        shortName: config.shortName || folder,
                        icon: config.iconFilename, // We might need to handle paths for images
                        config: config // Keep the whole config just in case
                    });
                } catch (e) {
                    console.error(`Error parsing ${configPath}:`, e);
                }
            }
        }
    }

    // Process Game Lists
    if (fs.existsSync(gamelistDir)) {
        const gameFiles = fs.readdirSync(gamelistDir);
        for (const file of gameFiles) {
            if (file.endsWith('.json')) {
                const id = file.replace('.json', '');
                // Try to find matching platform
                let platformId = shortNames[id] || id;
                
                // Verify if this platform exists in our platforms list
                const platformExists = platforms.find(p => p.id === platformId);
                
                gameLists.push({
                    id: id,
                    file: file,
                    platformId: platformExists ? platformId : null
                });
            }
        }
    }

    const data = {
        platforms: platforms,
        gameLists: gameLists,
        generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`Successfully generated ${outputFile}`);
    console.log(`Found ${platforms.length} platforms and ${gameLists.length} game lists.`);

} catch (err) {
    console.error('Build failed:', err);
}
