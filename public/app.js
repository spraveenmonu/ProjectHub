// ============================================================================
// GLOBAL STATE
// ============================================================================
let projects = [];
let activeCategory = 'all';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('projecthub_favorites') || '[]');
let logPollIntervals = new Map();
let openDrawerProject = null;
let drawerLogPoll = null;

const API_URL = '';

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const projectsGrid = $('#projects-grid');
const searchInput = $('#search-input');
const btnRefresh = $('#btn-refresh');
const sidebarToggle = $('#sidebar-toggle');
const sidebar = $('#sidebar');

// Command Palette
const cmdOverlay = $('#cmd-overlay');
const cmdInput = $('#cmd-input');
const cmdResults = $('#cmd-results');

// Drawer
const drawerOverlay = $('#drawer-overlay');
const detailDrawer = $('#detail-drawer');
const drawerClose = $('#drawer-close');

// Stats
const statTotal = $('#stat-total');
const statRunning = $('#stat-running');
const statWeb = $('#stat-web');
const statPython = $('#stat-python');

// Section
const sectionTitle = $('#section-title');
const sectionCount = $('#section-count');

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    await fetchDB();
    fetchProjects();
    setupEventListeners();
    lucide.createIcons();
});

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProjectsGrid();
    });

    // Refresh
    btnRefresh.addEventListener('click', () => {
        showToast('Rescanning workspace...', 'info');
        clearAllLogPolls();
        fetchProjects();
    });

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.toggle('open');
    });

    // Sidebar nav items
    $$('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.filter;
            updateSectionTitle();
            renderProjectsGrid();
        });
    });

    // Command Palette: Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        if (e.key === 'Escape') {
            closeCommandPalette();
            closeDrawer();
        }
    });

    cmdOverlay.addEventListener('click', (e) => {
        if (e.target === cmdOverlay) closeCommandPalette();
    });

    cmdInput.addEventListener('input', () => {
        renderCommandResults(cmdInput.value.trim());
    });

    // Drawer
    drawerOverlay.addEventListener('click', closeDrawer);
    drawerClose.addEventListener('click', closeDrawer);

    // Drawer tabs
    $$('.drawer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.drawer-tab').forEach(t => t.classList.remove('active'));
            $$('.drawer-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $(`#panel-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

// ============================================================================
// DATA FETCHING
// ============================================================================
async function fetchProjects() {
    try {
        const res = await fetch(`${API_URL}/api/projects`);
        if (!res.ok) throw new Error('API server error');
        projects = await res.json();

        updateStats();
        updateSidebarCounts();
        renderProjectsGrid();
        manageLogPollers();
    } catch (err) {
        projectsGrid.innerHTML = `
            <div class="no-results">
                <i data-lucide="alert-octagon"></i>
                <h3>API Connection Failure</h3>
                <p>Ensure the server is running on Port 4200.</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// ============================================================================
// STATS & SIDEBAR COUNTS
// ============================================================================
function updateStats() {
    const running = projects.filter(p => p.status === 'running' || p.status === 'installing').length;
    const webapps = projects.filter(p => p.category === 'webapp').length;
    const python = projects.filter(p => p.category === 'python').length;

    statTotal.textContent = projects.length;
    statRunning.textContent = running;
    statWeb.textContent = webapps;
    statPython.textContent = python;
}

function updateSidebarCounts() {
    const counts = { all: projects.length, favorites: 0, webapp: 0, python: 0, security: 0, static: 0, running: 0 };

    projects.forEach(p => {
        if (p.category && counts[p.category] !== undefined) counts[p.category]++;
        if (p.status === 'running' || p.status === 'installing') counts.running++;
        if (favorites.includes(p.name)) counts.favorites++;
    });

    Object.keys(counts).forEach(key => {
        const el = $(`#count-${key}`);
        if (el) el.textContent = counts[key];
    });
}

function updateSectionTitle() {
    const titles = {
        all: 'All Projects',
        favorites: 'Favorites',
        webapp: 'Web Apps',
        python: 'Python Projects',
        security: 'Security Tools',
        static: 'Static Sites',
        running: 'Running Servers'
    };
    sectionTitle.textContent = titles[activeCategory] || 'All Projects';
}

// ============================================================================
// LOG POLLING
// ============================================================================
function manageLogPollers() {
    projects.forEach(p => {
        const isActive = p.status === 'running' || p.status === 'installing';
        if (isActive && !logPollIntervals.has(p.name)) {
            startCardLogPolling(p.name);
        } else if (!isActive && logPollIntervals.has(p.name)) {
            clearInterval(logPollIntervals.get(p.name));
            logPollIntervals.delete(p.name);
        }
    });
}

function clearAllLogPolls() {
    logPollIntervals.forEach(val => clearInterval(val));
    logPollIntervals.clear();
}

function startCardLogPolling(name) {
    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/logs`);
            if (!res.ok) return;
            const data = await res.json();

            // Update card terminal
            const termDiv = document.getElementById(`terminal-${name}`);
            if (termDiv) {
                renderTerminalLogs(termDiv, data.logs);
            }

            // Update drawer terminal if open for this project
            if (openDrawerProject === name) {
                const drawerTerm = $('#drawer-terminal');
                if (drawerTerm) {
                    renderTerminalLogs(drawerTerm, data.logs);
                }
            }

            // Status change detection
            if (data.status === 'failed') {
              clearInterval(logPollIntervals.get(name));
              logPollIntervals.delete(name);
              showToast(`"${name}" failed to start. Check logs.`, 'error');
              fetchProjects();
            } else if (data.status !== 'running' && data.status !== 'installing') {
              clearInterval(logPollIntervals.get(name));
              logPollIntervals.delete(name);
              fetchProjects();
            } else {
                const p = projects.find(proj => proj.name === name);
                if (p && !p.url && data.url) {
                    fetchProjects();
                }
            }
        } catch (e) {}
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1200);
    logPollIntervals.set(name, interval);
}

function renderTerminalLogs(container, logs) {
    if (!logs || logs.length === 0) {
        container.innerHTML = `<div class="terminal-line system">[ProjectHub] Waiting for logs...</div>`;
        return;
    }
    container.innerHTML = logs.map(line => {
        let cls = '';
        if (line.includes('[ProjectHub]')) cls = 'system';
        else if (line.includes('[stderr]')) cls = 'stderr';
        else if (line.includes('running') || line.includes('started') || line.includes('Served project') || line.includes('Local:')) cls = 'success';
        return `<div class="terminal-line ${cls}">${escapeHtml(line)}</div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================================================
// RENDERING — PROJECT GRID
// ============================================================================
function renderProjectsGrid() {
    let filtered = projects.filter(p => {
        // Category filter
        if (activeCategory === 'favorites') {
            if (!favorites.includes(p.name)) return false;
        } else if (activeCategory === 'running') {
            if (p.status !== 'running' && p.status !== 'installing') return false;
        } else if (activeCategory !== 'all') {
            if (p.category !== activeCategory) return false;
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery;
            return p.name.toLowerCase().includes(q) ||
                   (p.techStack || []).some(t => t.toLowerCase().includes(q)) ||
                   (p.category || '').includes(q);
        }
        return true;
    });

    // Sort: favorites first, then alphabetical
    filtered.sort((a, b) => {
        const aFav = favorites.includes(a.name) ? 0 : 1;
        const bFav = favorites.includes(b.name) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.name.localeCompare(b.name);
    });

    sectionCount.textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-results">
                <i data-lucide="search-x"></i>
                <h3>No projects found</h3>
                <p>Try a different filter or search term.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    projectsGrid.innerHTML = filtered.map((p, i) => {
        const isRunning = p.status === 'running' || p.status === 'installing' || p.status === 'failed';
        const isFav = favorites.includes(p.name);
        const cardClass = isRunning ? `project-card ${p.status}` : 'project-card';
        const safeName = escapeAttr(p.name);

        // Badge
        let badge = '';
        if (p.status === 'running') badge = `<span class="status-badge badge-running">Active</span>`;
        else if (p.status === 'installing') badge = `<span class="status-badge badge-installing">Starting</span>`;
        else if (p.status === 'failed') badge = `<span class="status-badge badge-failed">Failed</span>`;

        // Primary tag (just one)
        const primaryTag = (p.techStack && p.techStack.length > 0) ? `<span class="tech-tag">${escapeHtml(p.techStack[0])}</span>` : '';

        // Inline terminal for running cards
        let terminal = '';
        if (isRunning) {
            terminal = `
                <div class="card-terminal-wrap" onclick="event.stopPropagation()">
                    <div class="card-terminal-header">
                        <i data-lucide="terminal"></i> Live Logs
                    </div>
                    <div class="card-terminal" id="terminal-${safeName}">
                        <div class="terminal-line system">[ProjectHub] Waiting for logs...</div>
                    </div>
                </div>
            `;
        }

        // Quick access buttons at bottom
        const actions = `
            <div class="card-actions" onclick="event.stopPropagation()">
                <button class="card-action act-code" title="Open in VS Code" onclick="openVSCode('${safeName}')">
                    <i data-lucide="code"></i> Code
                </button>
                <button class="card-action act-folder" title="Open folder" onclick="openExplorer('${safeName}')">
                    <i data-lucide="folder-open"></i> Files
                </button>
                ${isRunning
                    ? `<button class="card-action act-stop" title="Stop server" onclick="stopProject('${safeName}')">
                           <i data-lucide="square"></i> Stop
                       </button>`
                    : ''
                }
                <button class="card-action act-info" title="Details" onclick="openDrawer('${safeName}')">
                    <i data-lucide="info"></i>
                </button>
            </div>
        `;

        // Card click = LAUNCH the project
        const clickAction = isRunning && p.url
            ? `window.open('${p.url}', '_blank')`
            : `launchProject('${safeName}')`;

        return `
            <div class="${cardClass}" data-category="${p.category}" style="animation-delay: ${i * 0.04}s"
                 onclick="${clickAction}">
                <div class="card-top">
                    <div class="card-title-group">
                        <div class="project-icon" data-cat="${p.category}">
                            <i data-lucide="${p.icon || 'package'}"></i>
                        </div>
                        <div class="project-name-area">
                            <span class="project-name" title="${safeName}">${escapeHtml(p.name)}</span>
                            ${primaryTag}
                        </div>
                    </div>
                    <div class="card-right">
                        ${badge}
                        <button class="fav-btn ${isFav ? 'favorited' : ''}" title="${isFav ? 'Unfavorite' : 'Favorite'}"
                                onclick="toggleFavorite('${safeName}', event)">
                            <i data-lucide="star"></i>
                        </button>
                    </div>
                </div>

                ${terminal}
                ${actions}
            </div>
        `;
    }).join('');

    lucide.createIcons();

    // Kick log polls for visible terminals
    logPollIntervals.forEach((_, key) => {
        const term = document.getElementById(`terminal-${key}`);
        if (term) term.scrollTop = term.scrollHeight;
    });
}

// ============================================================================
// COMMAND PALETTE
// ============================================================================
function openCommandPalette() {
    cmdOverlay.classList.add('open');
    cmdInput.value = '';
    cmdInput.focus();
    renderCommandResults('');
}

function closeCommandPalette() {
    cmdOverlay.classList.remove('open');
}

function renderCommandResults(query) {
    const q = query.toLowerCase();
    let results = projects;

    if (q) {
        results = projects.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.techStack || []).some(t => t.toLowerCase().includes(q)) ||
            (p.category || '').includes(q)
        );
    }

    if (results.length === 0 && q) {
        cmdResults.innerHTML = `
            <div class="cmd-empty">
                <i data-lucide="search-x"></i>
                <span>No projects match "${escapeHtml(query)}"</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (!q) {
        // Show favorites first, then all
        const favs = results.filter(p => favorites.includes(p.name));
        const rest = results.filter(p => !favorites.includes(p.name));
        results = [...favs, ...rest].slice(0, 12);
    } else {
        results = results.slice(0, 10);
    }

    cmdResults.innerHTML = results.map(p => {
        const isRunning = p.status === 'running' || p.status === 'installing';
        const safeName = escapeAttr(p.name);
        const catLabel = { webapp: 'Web App', python: 'Python', security: 'Security', static: 'Static', other: 'Project' };

        return `
            <div class="cmd-result-item" onclick="cmdLaunchProject('${safeName}')">
                <div class="cmd-result-icon" data-cat="${p.category}">
                    <i data-lucide="${p.icon || 'package'}"></i>
                </div>
                <span class="cmd-result-name">${escapeHtml(p.name)}</span>
                <span class="cmd-result-cat">${catLabel[p.category] || 'Project'}</span>
                <div class="cmd-result-actions">
                    <button class="cmd-action-btn" onclick="event.stopPropagation(); openVSCode('${safeName}'); closeCommandPalette();">Code</button>
                    <button class="cmd-action-btn" onclick="event.stopPropagation(); openExplorer('${safeName}'); closeCommandPalette();">Files</button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

window.cmdSelectProject = function(name) {
    closeCommandPalette();
    openDrawer(name);
};

// Command palette launch — directly launches the project
window.cmdLaunchProject = function(name) {
    closeCommandPalette();
    launchProject(name);
};

// DB State Fetching
async function fetchDB() {
    try {
        const res = await fetch(`${API_URL}/api/db`);
        if (res.ok) {
            const dbData = await res.json();
            if (Array.isArray(dbData.favorites) && dbData.favorites.length > 0) {
                favorites = dbData.favorites;
                localStorage.setItem('projecthub_favorites', JSON.stringify(favorites));
            }
        }
    } catch (e) {}
}

// CORE: Single-click launch — guaranteed ZERO POPUP BLOCKS
window.launchProject = async function(name) {
    const project = projects.find(p => p.name === name);
    if (!project) return;

    const isRunning = project.status === 'running' || project.status === 'installing';

    if (isRunning && project.url) {
        // Already running — open in new tab immediately
        window.open(project.url, '_blank');
        fetchProjects();
        return;
    }

    // Synchronously open target tab on user gesture to avoid popup blocking
    const targetTab = window.open('about:blank', '_blank');
    if (targetTab) {
        targetTab.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Launching ${escapeHtml(name)}...</title>
                <style>
                    body { background: #08090e; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; height: 100vh; margin: 0; align-items: center; justify-content: center; text-align: center; }
                    .loader { width: 44px; height: 44px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.2rem; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    h2 { font-size: 1.4rem; font-weight: 700; margin: 0 0 0.4rem; }
                    p { font-size: 0.85rem; color: #94a3b8; margin: 0; }
                </style>
            </head>
            <body>
                <div>
                    <div class="loader"></div>
                    <h2>Launching ${escapeHtml(name)}...</h2>
                    <p id="status">Starting backend process...</p>
                </div>
            </body>
            </html>
        `);
    }

    showLaunchOverlay(name);

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/activate`, { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            if (data.url && targetTab) {
                targetTab.location.href = data.url;
                hideLaunchOverlay();
                fetchProjects();
                return;
            }
            waitForUrlAndRedirect(name, targetTab);
            fetchProjects();
        } else {
            if (targetTab) targetTab.close();
            hideLaunchOverlay();
            showToast(data.error || 'Launch failed', 'error');
        }
    } catch (err) {
        if (targetTab) targetTab.close();
        hideLaunchOverlay();
        showToast('Connection failed', 'error');
    }
};

// Poll the logs API until a URL is detected, then update targetTab location & refresh dashboard
function waitForUrlAndRedirect(name, targetTab = null) {
    let attempts = 0;
    const maxAttempts = 120; // 60 seconds max wait

    const poll = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
            clearInterval(poll);
            if (targetTab) targetTab.close();
            hideLaunchOverlay();
            showToast(`"${name}" is taking long to start. Check logs.`, 'error');
            fetchProjects();
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/logs`);
            if (!res.ok) return;
            const data = await res.json();

            if (data.url) {
                clearInterval(poll);
                hideLaunchOverlay();
                if (targetTab && !targetTab.closed) {
                    targetTab.location.href = data.url;
                } else {
                    window.open(data.url, '_blank');
                }
                showToast(`Opened ${escapeHtml(name)} in new tab!`, 'success');
                fetchProjects();
            }

            // Update status text in targetTab and overlay
            if (data.logs && data.logs.length > 0) {
                const lastLog = data.logs[data.logs.length - 1];
                updateLaunchStatus(lastLog);
                if (targetTab && !targetTab.closed && targetTab.document) {
                    const statusEl = targetTab.document.getElementById('status');
                    if (statusEl) statusEl.textContent = lastLog.replace(/\[ProjectHub\]\s*/g, '');
                }
            }

            if (data.status === 'failed' || data.status === 'idle') {
                clearInterval(poll);
                if (targetTab) targetTab.close();
                hideLaunchOverlay();
                showToast(`"${name}" failed to start.`, 'error');
                fetchProjects();
            }
        } catch (e) {}
    }, 400);
}

// Launch overlay — fullscreen loading indicator
function showLaunchOverlay(name) {
    let overlay = document.getElementById('launch-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'launch-overlay';
        overlay.innerHTML = `
            <div class="launch-modal">
                <div class="launch-spinner"></div>
                <h2 class="launch-title">Launching <span id="launch-name"></span></h2>
                <p class="launch-status" id="launch-status">Starting server...</p>
                <button class="launch-cancel" onclick="cancelLaunch()">Cancel</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    document.getElementById('launch-name').textContent = name;
    document.getElementById('launch-status').textContent = 'Starting server...';
    overlay.classList.add('visible');
}

function hideLaunchOverlay() {
    const overlay = document.getElementById('launch-overlay');
    if (overlay) overlay.classList.remove('visible');
}

function updateLaunchStatus(msg) {
    const el = document.getElementById('launch-status');
    if (el) {
        // Clean up the message for display
        const clean = msg.replace(/\[ProjectHub\]\s*/g, '').replace(/\[.*?\]\s*/g, '').trim();
        if (clean) el.textContent = clean;
    }
}

window.cancelLaunch = function() {
    hideLaunchOverlay();
    showToast('Launch cancelled. Server may still be starting in the background.', 'info');
};

// ============================================================================
// DETAIL DRAWER
// ============================================================================
window.openDrawer = function(name) {
    const project = projects.find(p => p.name === name);
    if (!project) return;

    openDrawerProject = name;
    const isRunning = project.status === 'running' || project.status === 'installing';

    // Set header
    $('#drawer-title').textContent = project.name;

    // Icon
    const iconDiv = $('#drawer-icon');
    iconDiv.style.background = `rgba(${getCatRGB(project.category)}, 0.1)`;
    iconDiv.style.borderColor = `rgba(${getCatRGB(project.category)}, 0.12)`;
    iconDiv.style.color = getCatColor(project.category);
    iconDiv.innerHTML = `<i data-lucide="${project.icon || 'package'}"></i>`;

    // Meta (tech tags)
    const metaDiv = $('#drawer-meta');
    metaDiv.innerHTML = (project.techStack || []).map(t =>
        `<span class="tech-tag">${escapeHtml(t)}</span>`
    ).join('');

    // Actions
    const actionsDiv = $('#drawer-actions');
    const safeName = escapeAttr(name);
    actionsDiv.innerHTML = `
        <button class="drawer-action-btn da-code" onclick="openVSCode('${safeName}')">
            <i data-lucide="terminal"></i> VS Code
        </button>
        <button class="drawer-action-btn da-folder" onclick="openExplorer('${safeName}')">
            <i data-lucide="folder-open"></i> Explorer
        </button>
        ${isRunning
            ? `<button class="drawer-action-btn da-stop" onclick="stopProject('${safeName}')">
                   <i data-lucide="square"></i> Stop Server
               </button>`
            : `<button class="drawer-action-btn da-run" onclick="activateProject('${safeName}')">
                   <i data-lucide="play"></i> Run Project
               </button>`
        }
        ${isRunning && project.url
            ? `<button class="drawer-action-btn da-web" onclick="window.open('${project.url}', '_blank')">
                   <i data-lucide="external-link"></i> Open Web App
               </button>`
            : ''
        }
    `;

    // Switch to Overview tab by default
    $$('.drawer-tab').forEach(t => t.classList.remove('active'));
    $$('.drawer-panel').forEach(p => p.classList.remove('active'));
    $$('.drawer-tab')[0].classList.add('active');
    $('#panel-overview').classList.add('active');

    // Load README
    loadDrawerReadme(name);

    // Load logs if running
    if (isRunning) {
        loadDrawerLogs(name);
    } else {
        $('#drawer-terminal').innerHTML = `<div class="terminal-line system">[ProjectHub] No active server. Start the project to see live logs.</div>`;
    }

    // Open drawer
    detailDrawer.classList.add('open');
    drawerOverlay.classList.add('open');

    lucide.createIcons();
};

function closeDrawer() {
    detailDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    openDrawerProject = null;

    if (drawerLogPoll) {
        clearInterval(drawerLogPoll);
        drawerLogPoll = null;
    }
}

async function loadDrawerReadme(name) {
    const readmeDiv = $('#drawer-readme');
    readmeDiv.innerHTML = `<div class="readme-loading"><div class="spinner"></div><span>Loading README...</span></div>`;

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/readme`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (!data.content) {
            readmeDiv.innerHTML = `<p class="readme-none">No README found for this project.</p>`;
            return;
        }

        readmeDiv.innerHTML = renderMarkdown(data.content);
    } catch (e) {
        readmeDiv.innerHTML = `<p class="readme-none">Failed to load README.</p>`;
    }
}

async function loadDrawerLogs(name) {
    const terminal = $('#drawer-terminal');

    const pollLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/logs`);
            if (!res.ok) return;
            const data = await res.json();
            renderTerminalLogs(terminal, data.logs);
        } catch (e) {}
    };

    pollLogs();
    if (drawerLogPoll) clearInterval(drawerLogPoll);
    drawerLogPoll = setInterval(pollLogs, 1200);
}

// ============================================================================
// PROJECT ACTIONS (Global)
// ============================================================================
window.activateProject = async function(name) {
    showToast(`Starting "${name}"...`, 'info');

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/activate`, { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            showToast(`Server activated for "${name}"!`, 'success');
            fetchProjects();
        } else {
            showToast(data.error || 'Activation failed', 'error');
        }
    } catch (err) {
        showToast('Connection failed during activation', 'error');
    }
};

window.stopProject = async function(name) {
    showToast(`Stopping "${name}"...`, 'info');

    if (logPollIntervals.has(name)) {
        clearInterval(logPollIntervals.get(name));
        logPollIntervals.delete(name);
    }

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/stop`, { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            showToast(`Stopped "${name}"`, 'success');
            fetchProjects();
            // Refresh drawer if it's open for this project
            if (openDrawerProject === name) {
                setTimeout(() => openDrawer(name), 500);
            }
        } else {
            showToast(data.error || 'Failed to stop', 'error');
        }
    } catch (err) {
        showToast('Connection error', 'error');
    }
};

window.openVSCode = async function(name) {
    showToast(`Opening VS Code for "${name}"...`, 'info');
    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/open-code`, { method: 'POST' });
        if (res.ok) showToast(`VS Code opened`, 'success');
    } catch (err) {
        showToast('Failed to open VS Code', 'error');
    }
};

window.openExplorer = async function(name) {
    showToast(`Opening Explorer...`, 'info');
    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/open-explorer`, { method: 'POST' });
        if (res.ok) showToast(`Explorer opened`, 'success');
    } catch (err) {
        showToast('Failed to open Explorer', 'error');
    }
};

// ============================================================================
// FAVORITES
// ============================================================================
window.toggleFavorite = async function(name, event) {
    if (event) event.stopPropagation();

    const idx = favorites.indexOf(name);
    if (idx >= 0) {
        favorites.splice(idx, 1);
        showToast(`Removed "${name}" from favorites`, 'info');
    } else {
        favorites.push(name);
        showToast(`Added "${name}" to favorites`, 'success');
    }

    localStorage.setItem('projecthub_favorites', JSON.stringify(favorites));
    updateSidebarCounts();
    renderProjectsGrid();

    try {
        await fetch(`${API_URL}/api/db/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites })
        });
    } catch (e) {}
};

// ============================================================================
// SIMPLE MARKDOWN RENDERER
// ============================================================================
function renderMarkdown(md) {
    let html = escapeHtml(md);

    // Code blocks (```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--secondary-light);">$1</a>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 1rem 0;">');

    // Paragraphs (lines not already in tags)
    html = html.replace(/^(?!<[hupola]|<li|<hr|<pre)(.+)$/gm, '<p>$1</p>');

    // Clean up double newlines
    html = html.replace(/\n{2,}/g, '\n');

    return html;
}

// ============================================================================
// HELPERS
// ============================================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type} show`;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
    toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
    lucide.createIcons();

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function getCatColor(cat) {
    const colors = { webapp: '#818cf8', python: '#34d399', security: '#fb7185', static: '#22d3ee', other: '#a78bfa' };
    return colors[cat] || colors.other;
}

function getCatRGB(cat) {
    const rgbs = { webapp: '99, 102, 241', python: '16, 185, 129', security: '244, 63, 94', static: '6, 182, 212', other: '139, 92, 246' };
    return rgbs[cat] || rgbs.other;
}
