const API_URL = '/api';
let token = localStorage.getItem('token');
let editor; // GrapesJS instance

// Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const contentArea = document.getElementById('contentArea');
const tabButtons = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.admin-view');

// Auth Helper
async function fetchWithAuth(url, options = {}) {
    if (!token) {
        showLogin();
        throw new Error('No token');
    }
    
    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${token}`;
    options.headers = headers;
    
    const res = await fetch(url, options);
    if (res.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    return res;
}

function showLogin() {
    loginModal.style.display = 'flex';
    contentArea.style.opacity = '0.3';
    contentArea.style.pointerEvents = 'none';
}

function hideLogin() {
    loginModal.style.display = 'none';
    contentArea.style.opacity = '1';
    contentArea.style.pointerEvents = 'all';
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    showLogin();
}

// Tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!btn.dataset.view) return; // Skip sub-tabs
        
        tabButtons.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.view).classList.add('active');
        
        if (btn.dataset.view === 'usersView') loadUsers();
        if (btn.dataset.view === 'pagesView') {
            loadPagesList();
            if (!editor) initGrapesJS();
        }
    });
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            hideLogin();
            loadPosts();
            loadThemes();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Login Error');
    }
});

// --- BLOG POSTS ---
const postForm = document.getElementById('postForm');
const imageInput = document.getElementById('imageInput');

// Editor Tabs Logic
const editorTabBtns = document.querySelectorAll('[data-editor-view]');
const editorSubViews = document.querySelectorAll('.editor-sub-view');
const visualEditor = document.getElementById('visualEditor');
const contentAreaMd = document.getElementById('content');
const codeContent = document.getElementById('codeContent');

const turndownService = new TurndownService();

// Toolbar Actions
window.execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    visualEditor.focus();
    syncFromVisual();
    updateToolbarState();
};

function syncFromVisual() {
    const html = visualEditor.innerHTML;
    const markdown = turndownService.turndown(html);
    contentAreaMd.value = markdown;
    codeContent.value = html;
}

function syncFromMarkdown() {
    const md = contentAreaMd.value;
    const html = marked.parse(md);
    visualEditor.innerHTML = html;
    codeContent.value = html;
}

window.insertVideo = () => {
    const url = prompt('Enter YouTube/Video URL:');
    if (!url) return;
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
        embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }
    const html = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    document.execCommand('insertHTML', false, html);
    syncFromVisual();
};

window.insertMap = () => {
    const address = prompt('Enter Address for Google Maps:');
    if (!address) return;
    const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    const html = `<iframe width="600" height="450" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    document.execCommand('insertHTML', false, html);
    syncFromVisual();
};

editorTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetViewId = btn.dataset.editorView;
        
        // Update tabs UI
        editorTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update views visibility
        editorSubViews.forEach(v => v.classList.remove('active'));
        document.getElementById(targetViewId).classList.add('active');

        // Initial sync when switching
        if (targetViewId === 'visualView') {
            syncFromMarkdown();
        } else if (targetViewId === 'codeView') {
            codeContent.value = marked.parse(contentAreaMd.value);
        }
    });
});

// Sync listeners
contentAreaMd.addEventListener('input', syncFromMarkdown);
visualEditor.addEventListener('input', syncFromVisual);

// Toolbar State Tracking
function updateToolbarState() {
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter'];
    cmds.forEach(cmd => {
        const btn = document.querySelector(`[data-cmd="${cmd}"]`);
        if (btn) {
            if (document.queryCommandState(cmd)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Update Dropdown
    const formatSelect = document.getElementById('formatBlockSelect');
    if (formatSelect) {
        const parentTag = document.queryCommandValue('formatBlock').toUpperCase();
        const validTags = ['H1', 'H2', 'H3', 'P', 'BLOCKQUOTE', 'PRE'];
        if (validTags.includes(parentTag)) {
            formatSelect.value = parentTag;
        } else {
            // Check manual element context if queryCommandValue fails (some browsers return empty or full tag)
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                let node = selection.getRangeAt(0).startContainer;
                if (node.nodeType === 3) node = node.parentNode;
                const closestTag = node.closest('h1, h2, h3, p, blockquote, pre');
                if (closestTag) {
                    formatSelect.value = closestTag.tagName;
                }
            }
        }
    }
}

visualEditor.addEventListener('keyup', updateToolbarState);
visualEditor.addEventListener('mouseup', updateToolbarState);
visualEditor.addEventListener('click', updateToolbarState);
document.addEventListener('selectionchange', () => {
    if (document.activeElement === visualEditor) {
        updateToolbarState();
    }
});

if (imageInput) {
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetchWithAuth(`${API_URL}/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.url) {
                document.getElementById('imageUrl').value = data.url;
                const img = document.getElementById('imagePreview');
                img.src = data.url;
                img.style.display = 'block';
            }
        } catch (err) {
            alert('Upload failed');
            console.error(err);
        }
    });
}

if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postData = {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            image: document.getElementById('imageUrl').value,
            date: new Date().toISOString()
        };

        try {
            const res = await fetchWithAuth(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            
            if (res.ok) {
                alert('Post published!');
                postForm.reset();
                document.getElementById('imagePreview').style.display = 'none';
                loadPosts();
            } else {
                alert('Failed to publish');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

async function loadPosts() {
    const container = document.getElementById('postsContainer');
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        
        if (posts.length === 0) {
            container.innerHTML = '<p style="padding:20px; color:var(--text-dim);">No posts yet.</p>';
            return;
        }

        container.innerHTML = posts.map(p => `
            <div class="post-item">
                <div>
                    <strong>${p.title}</strong><br>
                    <span style="font-size:0.8rem; color:var(--text-dim);">${new Date(p.date).toLocaleDateString()}</span>
                </div>
                <!-- <a href="/blog/posts/${p.slug}" target="_blank" class="chip">View</a> -->
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p class="error">Failed to load posts</p>';
    }
}

// --- THEME EDITOR ---
const themeForm = document.getElementById('themeForm');
const colorInputs = document.querySelectorAll('.color-input');

if (themeForm) {
    themeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const colors = {};
        colorInputs.forEach(input => {
            colors[input.name] = input.value;
        });

        const themeName = document.getElementById('themeName').value.toLowerCase().replace(/[^a-z0-9-]/g, '');

        try {
            const res = await fetchWithAuth(`${API_URL}/themes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: themeName, colors })
            });
            
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                if (confirm('Theme saved. Reload to apply changes?')) {
                    window.location.reload();
                }
            } else {
                alert(data.error || 'Failed to save theme');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving theme');
        }
    });
}

async function loadThemes() {
    // Placeholder
}

// --- USER MANAGEMENT ---
const addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newRole').value;

        try {
            const res = await fetchWithAuth(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            if (res.ok) {
                alert('User added');
                addUserForm.reset();
                loadUsers();
            } else {
                const d = await res.json();
                alert('Failed: ' + (d.message || d.error));
            }
        } catch (e) {
            console.error(e);
            alert('Error adding user');
        }
    });
}

async function loadUsers() {
    const list = document.getElementById('userList');
    list.innerHTML = 'Loading...';
    try {
        const res = await fetchWithAuth(`${API_URL}/users`);
        if (!res.ok) {
            if(res.status === 403) {
                 list.innerHTML = '<p class="error">Access Denied (Admin Only)</p>';
                 return;
            }
            throw new Error('Failed to load');
        }
        const users = await res.json();
        
        list.innerHTML = `<table style="width:100%; text-align:left;">
            <tr><th>Username</th><th>Role</th><th>Action</th></tr>
            ${users.map(u => `
                <tr>
                    <td>${u.username}</td>
                    <td>${u.role}</td>
                    <td>
                        <button onclick="deleteUser(${u.id})" style="background:red; border:none; color:white; padding:5px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </table>`;
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="error">Error loading users</p>';
    }
}

window.deleteUser = async (id) => {
    if(!confirm('Delete user?')) return;
    try {
        const res = await fetchWithAuth(`${API_URL}/users/${id}`, { method: 'DELETE' });
        if(res.ok) loadUsers();
        else alert('Failed to delete');
    } catch(e) {
        alert('Error');
    }
};

// --- PAGE EDITOR (GrapesJS) ---
function initGrapesJS() {
    editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: false,
        panels: { defaults: [] },
        blockManager: {
            appendTo: '#blocks',
            blocks: [
                {
                    id: 'section', 
                    label: 'Section',
                    content: '<section class="section"><h1>Title</h1><p>Content goes here</p></section>'
                },
                {
                    id: 'image',
                    label: 'Image',
                    content: { type: 'image' }
                }
            ]
        }
    });
    // Add basic blocks since we removed default panels
    editor.BlockManager.add('text', {
        label: 'Text',
        content: '<div data-gjs-type="text">Insert your text here</div>',
    });
    editor.BlockManager.add('image', {
        label: 'Image',
        select: true,
        content: { type: 'image' },
        activate: true,
    });
}

const pageSelect = document.getElementById('pageSelect');
const newPageBtn = document.getElementById('newPageBtn');
const savePageBtn = document.getElementById('savePageBtn');
const deletePageBtn = document.getElementById('deletePageBtn');
const pageTitleInput = document.getElementById('pageTitle');
const pageSlugInput = document.getElementById('pageSlug');

async function loadPagesList() {
    try {
        const res = await fetch(`${API_URL}/pages`);
        const pages = await res.json();
        
        pageSelect.innerHTML = '<option value="">Select Page to Edit...</option>';
        pages.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.slug;
            opt.textContent = p.title;
            pageSelect.appendChild(opt);
        });
    } catch (e) {
        console.error(e);
    }
}

if(pageSelect) {
    pageSelect.addEventListener('change', async (e) => {
        const slug = e.target.value;
        if(!slug) return;
        
        try {
            const res = await fetch(`${API_URL}/pages/${slug}`);
            const page = await res.json();
            
            pageTitleInput.value = page.title;
            pageSlugInput.value = page.slug;
            
            if(editor) {
                editor.setComponents(page.components || page.html);
                editor.setStyle(page.styles || page.css);
            }
        } catch(e) {
            alert('Failed to load page');
        }
    });
}

if(newPageBtn) {
    newPageBtn.addEventListener('click', () => {
        pageSelect.value = '';
        pageTitleInput.value = '';
        pageSlugInput.value = '';
        if(editor) {
            editor.setComponents('');
            editor.setStyle('');
        }
    });
}

if(savePageBtn) {
    savePageBtn.addEventListener('click', async () => {
        if(!editor) return;
        
        const title = pageTitleInput.value;
        const slug = pageSlugInput.value;
        if(!title || !slug) {
            alert('Please enter title and slug');
            return;
        }

        const html = editor.getHtml();
        const css = editor.getCss();
        const components = JSON.stringify(editor.getComponents());
        const styles = JSON.stringify(editor.getStyle());

        try {
            const res = await fetchWithAuth(`${API_URL}/pages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, html, css, components, styles })
            });
            
            if(res.ok) {
                alert('Page Saved!');
                loadPagesList();
            } else {
                alert('Save failed');
            }
        } catch(e) {
            console.error(e);
            alert('Error saving page');
        }
    });
}

if(deletePageBtn) {
    deletePageBtn.addEventListener('click', async () => {
        const slug = pageSlugInput.value;
        if(!slug || !confirm('Delete this page?')) return;
        
        try {
            const res = await fetchWithAuth(`${API_URL}/pages/${slug}`, { method: 'DELETE' });
            if(res.ok) {
                alert('Deleted');
                newPageBtn.click();
                loadPagesList();
            }
        } catch(e) {
            alert('Error');
        }
    });
}

// Init
if (!token) {
    showLogin();
} else {
    hideLogin();
    loadPosts();
    loadThemes();
}
