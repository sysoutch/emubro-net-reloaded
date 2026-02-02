// Global State
let appData = {
    platforms: [],
    gameLists: [],
    currentGames: [],
    currentGameListId: null,
    
    // UI State
    emuFilter: '',
    emuSort: 'company', // 'company', 'name'
    gameFilter: '',
    gameSort: 'name_asc', // 'name_asc', 'name_desc'
    
    // Data
    blogPosts: []
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('site-data.json');
        const data = await response.json();
        appData.platforms = data.platforms;
        appData.gameLists = data.gameLists;
        
        // Initial Renders
        renderEmulators();
        renderGamePlatformsList();
        renderBlog();
        
        // Check URL hash for direct navigation
        const hash = window.location.hash.replace('#', '');
        if (hash) showView(hash);
        
    } catch (e) {
        console.error('Failed to load site data:', e);
        document.getElementById('emuGrid').innerHTML = '<p class="error">Failed to load platform data. Please run build-data.js.</p>';
    }

    // Setup Tools
    setupGamepadTester();
    setupMemoryCardReader();
});

// View Navigation
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + id).classList.add('active');
    
    // Update Nav
    document.querySelectorAll('.nav-menu .chip').forEach(c => {
        const target = c.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        // Keep blog active if viewing a post
        if (id === 'blog-post' && target === 'blog') {
            c.classList.add('active');
        } else {
            c.classList.toggle('active', target === id);
        }
    });
    
    // Close mobile menu
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('active');
    
    window.scrollTo(0, 0);
}

window.toggleMobileMenu = function() {
    document.querySelector('.nav-menu').classList.toggle('active');
};

// --- EMULATORS / PLATFORMS VIEW ---

function renderEmulators() {
    const container = document.getElementById('emuGrid');
    if (!container) return;

    // 1. Filter
    let filtered = appData.platforms.filter(p => {
        const term = appData.emuFilter.toLowerCase();
        return p.name.toLowerCase().includes(term) || 
               (p.company && p.company.toLowerCase().includes(term));
    });

    // 2. Sort
    filtered.sort((a, b) => {
        if (appData.emuSort === 'company') {
            const cA = (a.company || '').toLowerCase();
            const cB = (b.company || '').toLowerCase();
            if (cA !== cB) return cA.localeCompare(cB);
            return a.name.localeCompare(b.name);
        } else {
            // Name Sort
            return a.name.localeCompare(b.name);
        }
    });

    // 3. Render
    // Add Toolbar if not exists
    let toolbar = document.getElementById('emuToolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'emuToolbar';
        toolbar.className = 'toolbar';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '15px';
        toolbar.style.marginBottom = '20px';
        toolbar.style.alignItems = 'center';
        toolbar.innerHTML = `
            <input type="text" placeholder="Filter platforms..." oninput="setEmuFilter(this.value)" style="padding:10px; border-radius:0; border:2px solid var(--border); background:var(--bg-card); color:var(--text-main); font-family:inherit; flex:1;">
            <select onchange="setEmuSort(this.value)" style="padding:10px; border-radius:0; border:2px solid var(--border); background:var(--bg-card); color:var(--text-main); font-family:inherit;">
                <option value="company">Group by Company</option>
                <option value="name">Sort by Name</option>
            </select>
        `;
        container.parentNode.insertBefore(toolbar, container);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p>No platforms found.</p>';
        return;
    }

    // Grouping Logic
    if (appData.emuSort === 'company') {
        // Group by company
        const groups = {};
        filtered.forEach(p => {
            const c = p.company || 'Unknown';
            if (!groups[c]) groups[c] = [];
            groups[c].push(p);
        });

        let html = '';
        const companies = Object.keys(groups).sort();
        
        companies.forEach(comp => {
            html += `<h2 style="grid-column: 1/-1; margin-top: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">${comp}</h2>`;
            groups[comp].forEach(p => {
                html += createPlatformCard(p);
            });
        });
        container.innerHTML = html;
    } else {
        // Flat List
        container.innerHTML = filtered.map(p => createPlatformCard(p)).join('');
    }
}

function createPlatformCard(p) {
    const company = p.company ? p.company.toUpperCase() : 'UNKNOWN';
    return `
    <div class="card" onclick="showGamesForPlatform('${p.id}')">
        <span style="color:var(--accent); font-weight:800; font-size:0.7rem;">${company}</span>
        <h3 style="margin-top:10px;">${p.name}</h3>
        <p style="color:var(--text-dim); font-size:0.9rem; margin-top:5px;">${p.config.recommendedEmulators?.[0] || 'Unknown Core'}</p>
    </div>
    `;
}

window.setEmuFilter = (val) => { appData.emuFilter = val; renderEmulators(); };
window.setEmuSort = (val) => { appData.emuSort = val; renderEmulators(); };


// --- GAMES VIEW ---

function renderGamePlatformsList() {
    const container = document.getElementById('view-games');
    const contentDiv = container.querySelector('.content-area') || document.createElement('div');
    contentDiv.className = 'content-area';
    if (!container.querySelector('.content-area')) container.appendChild(contentDiv);

    const availableLists = appData.gameLists.map(l => l.platformId);
    const platformsWithGames = appData.platforms.filter(p => availableLists.includes(p.id));
    
    // Sort platforms by Name for this selection list
    platformsWithGames.sort((a,b) => a.name.localeCompare(b.name));

    contentDiv.innerHTML = `
        <h2 style="margin-bottom: 20px;">Select a System</h2>
        <div class="grid">
            ${platformsWithGames.map(p => `
                <div class="card" onclick="loadGameList('${p.id}')" style="cursor:pointer;">
                    <h3>${p.name}</h3>
                    <p style="color:var(--text-dim);">${appData.gameLists.find(l => l.platformId === p.id)?.file || ''}</p>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadGameList(platformId) {
    const listInfo = appData.gameLists.find(l => l.platformId === platformId);
    if (!listInfo) return;

    const container = document.getElementById('view-games').querySelector('.content-area');
    container.innerHTML = '<div class="loader">Loading library...</div>';

    try {
        const res = await fetch(`gamelist/${listInfo.file}`);
        const games = await res.json();
        appData.currentGames = games;
        appData.currentGameListId = platformId;
        appData.gameSort = 'name_asc'; // Reset sort
        appData.gameFilter = ''; // Reset filter
        renderGamesTable(platformId);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error">Failed to load game list.</p>';
    }
}

function renderGamesTable(platformId) {
    const platform = appData.platforms.find(p => p.id === platformId);
    const container = document.getElementById('view-games').querySelector('.content-area');
    
    // 1. Filter
    let filtered = appData.currentGames.filter(g => {
        return g.game_name.toLowerCase().includes(appData.gameFilter.toLowerCase());
    });

    // 2. Sort
    filtered.sort((a, b) => {
        if (appData.gameSort === 'name_asc') return a.game_name.localeCompare(b.game_name);
        if (appData.gameSort === 'name_desc') return b.game_name.localeCompare(a.game_name);
        return 0;
    });

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
            <button class="chip" onclick="renderGamePlatformsList()">← Back to Systems</button>
            <h2>${platform.name} Library <span style="font-size:0.8em; color:var(--text-dim);">(${filtered.length})</span></h2>
            
            <div style="display:flex; gap:10px;">
                <input type="text" placeholder="Filter games..." value="${appData.gameFilter}" oninput="setGameFilter(this.value)" style="padding:8px; border-radius:0; border:2px solid var(--border); background:var(--bg-card); color:var(--text-main); font-family:inherit;">
                <select onchange="setGameSort(this.value)" style="padding:8px; border-radius:0; border:2px solid var(--border); background:var(--bg-card); color:var(--text-main); font-family:inherit;">
                    <option value="name_asc" ${appData.gameSort === 'name_asc' ? 'selected' : ''}>Name (A-Z)</option>
                    <option value="name_desc" ${appData.gameSort === 'name_desc' ? 'selected' : ''}>Name (Z-A)</option>
                </select>
            </div>
        </div>
        <div class="game-list-container">
            ${filtered.map(g => `
                <div class="game-row">
                    <div class="game-title">${g.game_name}</div>
                    <div class="game-code" style="color:var(--text-dim); font-size:0.8rem;">${g.game_gameCode || '-'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

window.setGameFilter = (val) => { 
    appData.gameFilter = val; 
    renderGamesTable(appData.currentGameListId); 
};
window.setGameSort = (val) => { 
    appData.gameSort = val; 
    renderGamesTable(appData.currentGameListId); 
};

// --- BLOG VIEW ---

async function renderBlog() {
    const container = document.getElementById('blogGrid');
    if (!container) return;

    try {
        // Try fetching from API first (if running server.js)
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('API not available');
        
        const posts = await res.json();
        appData.blogPosts = posts;
        
        if (posts.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-dim);">No news updates yet.</p>';
            return;
        }

        container.innerHTML = posts.map((p, i) => {
            // Strip HTML/Markdown for preview
            const previewText = p.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            const imageStyle = p.image ? 
                `background:url('${p.image}') center/cover;` : 
                `background:linear-gradient(45deg, var(--bg-card, #274056), var(--accent, #00ff9d)); opacity:0.3;`;
            
            return `
                <div class="card" style="padding:0; overflow:hidden; cursor:pointer;" onclick="openBlogPost(${i})">
                    <div style="height:200px; ${imageStyle}"></div>
                    <div style="padding:25px;">
                        <div style="color:var(--accent); font-size:0.8rem; font-weight:700; margin-bottom:10px;">${new Date(p.date).toLocaleDateString()}</div>
                        <h3 style="margin-bottom:10px;">${p.title}</h3>
                        <p style="color:var(--text-dim); font-size:0.95rem; line-height:1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${previewText}</p>
                        <button class="chip" style="margin-top:20px; background:transparent; color:var(--accent); border-color:var(--accent);">Read More</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        // Fallback for static (if we had a static index, for now just show error or nothing)
        // Or if local file system access is allowed via fetch:
        // But listing directory requires a manifest.
        console.warn('Blog API unreachable, maybe static mode?');
        container.innerHTML = `
            <div class="card" style="grid-column:1/-1;">
                <h3>Welcome to emuBro Blog</h3>
                <p>To view and manage blog posts, please run the server using <code>npm start</code>.</p>
            </div>
        `;
    }
}

function showGamesForPlatform(platformId) {
    showView('games');
    const list = appData.gameLists.find(l => l.platformId === platformId);
    if (list) {
        loadGameList(platformId);
    } else {
        alert('No game list found for this platform yet.');
    }
}

window.openBlogPost = function(index) {
    const post = appData.blogPosts[index];
    if (!post) return;
    
    showView('blog-post');
    
    const content = document.getElementById('blogPostContent');
    // Render Markdown to HTML
    const htmlContent = marked.parse(post.content);
    
    const imageHtml = post.image ? 
        `<img src="${post.image}" style="width:100%; max-height:500px; object-fit:cover; margin-bottom:30px; border:2px solid var(--border);">` : 
        `<div style="width:100%; height:200px; background:linear-gradient(45deg, var(--bg-card, #274056), var(--accent, #00ff9d)); opacity:0.2; margin-bottom:30px; border:2px solid var(--border);"></div>`;

    content.innerHTML = `
        <h1 style="margin-bottom:10px; font-size: clamp(2rem, 5vw, 3rem);">${post.title}</h1>
        <div style="color:var(--accent); margin-bottom:30px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">${new Date(post.date).toLocaleDateString()}</div>
        ${imageHtml}
        <div class="blog-content" style="line-height:1.8; color:var(--text-main); font-size: 1.1rem;">${htmlContent}</div>
    `;
};

// --- TOOLS: GAMEPAD & MEMORY CARD ---

function setupGamepadTester() {
    const toolsView = document.getElementById('view-tools');
    if(!toolsView) return;

    if (!document.getElementById('gamepad-tool')) {
        const div = document.createElement('div');
        div.id = 'gamepad-tool';
        div.className = 'tool-section';
        div.innerHTML = `
            <h2>🎮 Gamepad Tester</h2>
            <p style="color:var(--text-dim); margin-bottom:15px;">Connect a controller and press any button.</p>
            <div id="gamepad-display" class="grid"></div>
        `;
        toolsView.appendChild(div);
    }

    window.addEventListener("gamepadconnected", (e) => {
        updateGamepadLoop();
    });
}

function updateGamepadLoop() {
    const display = document.getElementById('gamepad-display');
    const gamepads = navigator.getGamepads();
    
    if (!display) return;
    
    let html = '';
    for (const gp of gamepads) {
        if (gp) {
            html += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:10px;">
                        <h3 style="font-size:1.1rem; max-width:70%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${gp.id}">${gp.id}</h3>
                        <span class="chip" style="font-size:0.8rem; padding:4px 8px;">Index ${gp.index}</span>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <!-- Axes -->
                        <div>
                            <h4 style="color:var(--text-dim); font-size:0.9rem; margin-bottom:10px;">AXES</h4>
                            ${gp.axes.map((a, i) => `
                                <div style="margin-bottom:8px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:2px;">
                                        <span>Axis ${i}</span>
                                        <span>${a.toFixed(3)}</span>
                                    </div>
                                    <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; position:relative; overflow:hidden;">
                                        <div style="position:absolute; left:50%; top:0; bottom:0; width:50%; background:var(--accent); 
                                            transform-origin:left; transform: scaleX(${a}); opacity:0.8;"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Buttons -->
                        <div>
                            <h4 style="color:var(--text-dim); font-size:0.9rem; margin-bottom:10px;">BUTTONS</h4>
                            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
                                ${gp.buttons.map((b, i) => `
                                    <div class="btn-indicator ${b.pressed ? 'pressed' : ''}" 
                                         style="text-align:center; aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:0.8rem;">
                                        ${i}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    if (html) {
        display.innerHTML = html;
        requestAnimationFrame(updateGamepadLoop);
    } else {
        display.innerHTML = '<p style="grid-column:span 3; text-align:center; padding:20px;">No gamepad detected. Press a button to wake it up.</p>';
    }
}

// Memory Card Reader
let currentMcBuffer = null;
let psxGameMap = null;

async function loadPsxGameData() {
    if (psxGameMap) return;
    try {
        const res = await fetch('gamelist/psx.json');
        const data = await res.json();
        psxGameMap = {};
        data.forEach(game => {
            if (game.game_gameCode) {
                // Handle multiple codes if separated by newlines
                const codes = game.game_gameCode.split(/[\n\r]+/);
                codes.forEach(c => {
                    const clean = c.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                    if (clean) psxGameMap[clean] = game.game_name;
                });
            }
        });
        console.log('PSX Game Data loaded:', Object.keys(psxGameMap).length, 'entries');
    } catch (e) {
        console.warn('Failed to load PSX game data', e);
    }
}

function setupMemoryCardReader() {
    const toolsView = document.getElementById('view-tools');
    if(!toolsView) return;

    if (!document.getElementById('mcr-tool')) {
        const div = document.createElement('div');
        div.id = 'mcr-tool';
        div.className = 'tool-section';
        div.style.marginTop = '40px';
        div.innerHTML = `
            <h2>💾 Memory Card Reader</h2>
            <p style="color:var(--text-dim);">Upload a memory card file (.mcr, .gci, .sav) to inspect it.</p>
            
            <div style="display:flex; gap:10px; margin: 15px 0;">
                <input type="file" id="mc-input">
            </div>

            <div class="tabs" style="margin-bottom: 10px;">
                <button class="chip active" onclick="switchMcTab('visual')">Visual Editor</button>
                <button class="chip" onclick="switchMcTab('hex')">Hex View</button>
            </div>

            <div id="mc-visual" style="background:var(--card-bg); border:1px solid var(--border); border-radius:8px; min-height:200px; padding:20px;">
                <p style="text-align:center; color:var(--text-dim); padding-top:80px;">No memory card loaded.</p>
            </div>

            <div id="mc-viewer" style="font-family:monospace; background:#000; padding:15px; border-radius:8px; overflow-x:auto; display:none;">
                <p style="color:#888;">Upload a file to see hex dump.</p>
            </div>
        `;
        toolsView.appendChild(div);
        
        document.getElementById('mc-input').addEventListener('change', handleMcUpload);
    }
}

window.switchMcTab = function(tab) {
    document.querySelectorAll('#mcr-tool .tabs button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('mc-visual').style.display = tab === 'visual' ? 'block' : 'none';
    document.getElementById('mc-viewer').style.display = tab === 'hex' ? 'block' : 'none';
}

function handleMcUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(evt) {
        currentMcBuffer = evt.target.result;
        const view = new Uint8Array(currentMcBuffer);
        
        await loadPsxGameData();

        displayHex(view);
        displayVisual(view);
    };
    reader.readAsArrayBuffer(file);
}

function displayHex(view) {
    const output = document.getElementById('mc-viewer');
    const limit = Math.min(view.length, 1024);
    let html = '<h3>Hex Dump (First 1KB)</h3><table style="width:100%; border-collapse:collapse; color:#0f0;">';
    
    for (let i = 0; i < limit; i += 16) {
        html += '<tr><td style="color:#888; padding-right:10px;">' + i.toString(16).padStart(4, '0').toUpperCase() + '</td>';
        let hex = '';
        let ascii = '';
        for (let j = 0; j < 16; j++) {
            if (i + j < limit) {
                const b = view[i + j];
                hex += b.toString(16).padStart(2, '0').toUpperCase() + ' ';
                ascii += (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
            } else {
                hex += '   ';
            }
        }
        html += `<td>${hex}</td><td style="padding-left:10px; color:#fff;">${ascii}</td></tr>`;
    }
    html += '</table>';
    if (view.length > limit) html += `<p style="color:#888; margin-top:10px;">... and ${view.length - limit} more bytes.</p>`;
    output.innerHTML = html;
}

function displayVisual(view) {
    const container = document.getElementById('mc-visual');
    if (view.length === 131072) { 
        renderPs1Visual(view, container);
    } else {
        container.innerHTML = '<p style="color:var(--text-dim); text-align:center;">Unknown format or not a standard PS1 Memory Card (128KB). <br>Use Hex View to inspect.</p>';
    }
}

function renderPs1Visual(view, container) {
    const BLOCK_SIZE = 8192;
    const FRAME_SIZE = 128;
    const directoryEntries = [];
    
    for (let i = 1; i < 16; i++) {
        const offset = i * FRAME_SIZE;
        const size = view[offset + 4] | (view[offset + 5] << 8) | (view[offset + 6] << 16) | (view[offset + 7] << 24);
        
        let filename = '';
        for (let j = 0; j < 20; j++) {
            const charCode = view[offset + 0x0A + j];
            if (charCode === 0) break;
            filename += String.fromCharCode(charCode);
        }
        
        if (size > 0 && filename.trim() !== '') {
            const blocks = Math.ceil(size / BLOCK_SIZE);
            let title = "Unknown";
            
            // Try to extract title from Save Header (SC)
            try {
                const fileOffset = i * BLOCK_SIZE;
                if (view[fileOffset] === 0x53 && view[fileOffset+1] === 0x43) {
                    let t = '';
                    for(let k=0; k<64; k++) {
                        const c = view[fileOffset + 4 + k];
                        if (c === 0) break;
                        if (c >= 32 && c <= 126) t += String.fromCharCode(c);
                        else t += '?';
                    }
                    title = t;
                }
            } catch(e) {}

            // Match against Game List using Game Code in Filename
            if (psxGameMap) {
                // Match patterns like SCUS-94467, SCUS94467, SCUS_94467
                const matches = filename.match(/[A-Z]{4}[-_\s]?\d{5}/gi);
                if (matches) {
                    for (const m of matches) {
                        const clean = m.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                        if (psxGameMap[clean]) {
                            title = psxGameMap[clean]; // Found a better title
                            break;
                        }
                    }
                }
            }

            directoryEntries.push({ filename, size, blocks, title });
        }
    }
    
    let html = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <h3>Memory Card 1</h3>
            <span class="chip">15 Blocks</span>
        </div>
        <table style="width:100%; text-align:left; border-collapse:collapse;">
            <thead style="border-bottom:1px solid var(--border); color:var(--text-dim);">
                <tr>
                    <th style="padding:10px;">Icon</th>
                    <th style="padding:10px;">Title</th>
                    <th style="padding:10px;">File Name</th>
                    <th style="padding:10px;">Size</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    if (directoryEntries.length === 0) {
        html += '<tr><td colspan="4" style="padding:20px; text-align:center;">Empty Card</td></tr>';
    } else {
        directoryEntries.forEach(entry => {
            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px;">💾</td>
                    <td style="padding:10px; font-weight:bold;">${entry.title}</td>
                    <td style="padding:10px; font-family:monospace;">${entry.filename}</td>
                    <td style="padding:10px;">${entry.size} B</td>
                </tr>
            `;
        });
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Misc Logic
const themeSelect = document.getElementById('themeSelect');
if(themeSelect) {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;

    themeSelect.addEventListener('change', (e) => {
        const target = e.target.value;
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('theme', target);
        if (window.updatePixelTheme) window.updatePixelTheme();
    });
    
    // Update pixels if theme was loaded from storage
    if (savedTheme !== 'dark' && window.updatePixelTheme) {
        // Slight delay to ensure styles are applied
        setTimeout(window.updatePixelTheme, 100);
    }
}

const modal = document.getElementById('searchModal');
function openSearch() { modal.classList.add('active'); document.getElementById('modalInput').focus(); }
if(modal) {
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
        if (e.key === 'Escape') modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });
}

window.handleSearch = function(q) {
    const res = document.getElementById('searchResults');
    if (!q) { res.innerHTML = ''; return; }
    
    const matches = appData.platforms.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
    
    res.innerHTML = matches.map(e => `
        <div style="padding:15px; border-bottom:1px solid var(--border); cursor:pointer;" onclick="showGamesForPlatform('${e.id}'); modal.classList.remove('active');">
            <span style="color:var(--accent); font-size:0.8em;">${e.company || 'Unknown'}</span>
            <div style="font-weight:bold;">${e.name}</div>
        </div>
    `).join('');
};
