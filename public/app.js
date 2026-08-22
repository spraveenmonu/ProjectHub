// ============================================================================
// PROJECT HUB — Developer Cockpit & Live Project Studio
// ============================================================================

// Global Application State
let projects = [];
let activeCategory = 'all';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('projecthub_favorites') || '[]');
let logPollIntervals = new Map();
let openDrawerProject = null;
let activeCodeFile = null;
let activeProjectSourceFiles = [];
let currentLiveModalUrl = '';

const API_URL = '';
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// ============================================================================
// DOM SELECTORS
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

// Drawer Elements
const drawerOverlay = $('#drawer-overlay');
const detailDrawer = $('#detail-drawer');
const drawerClose = $('#drawer-close');

// Live Modal Elements
const liveModalOverlay = $('#live-modal-overlay');
const liveModalTitle = $('#live-modal-title');
const liveModalUrl = $('#live-modal-url');
const liveIframe = $('#live-iframe');
const btnModalClose = $('#btn-modal-close');
const btnModalNewTab = $('#btn-modal-newtab');
const btnModalRefresh = $('#btn-modal-refresh');

// Code Studio Elements
const codeFileList = $('#code-file-list');
const codeFileCount = $('#code-file-count');
const codeActiveFilename = $('#code-active-filename');
const codeViewport = $('#code-viewport');
const btnCopyCode = $('#btn-copy-code');
const btnRunCode = $('#btn-run-code');

// Stats Elements
const statTotal = $('#stat-total');
const statRunning = $('#stat-running');
const statWeb = $('#stat-web');
const statPython = $('#stat-python');

// Section Elements
const sectionTitle = $('#section-title');
const sectionCount = $('#section-count');

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Instant Synchronous Load from window.PROJECTS_DATA
    if (window.PROJECTS_DATA && Array.isArray(window.PROJECTS_DATA.projects)) {
        projects = window.PROJECTS_DATA.projects;
        updateStats();
        updateSidebarCounts();
        renderProjectsGrid();
    }

    // 2. Local Mode: Connect to live Express backend for process status
    if (IS_LOCAL) {
        await fetchDB();
        fetchLiveProjectsFromAPI();
    } else {
        applyDeployedModeUI();
    }

    setupEventListeners();
    lucide.createIcons();
});

function setupEventListeners() {
    // Search filter
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProjectsGrid();
    });

    // Refresh action
    btnRefresh.addEventListener('click', () => {
        showToast('Refreshing projects workspace...', 'info');
        clearAllLogPolls();
        if (IS_LOCAL) {
            fetchLiveProjectsFromAPI();
        } else if (window.PROJECTS_DATA) {
            projects = window.PROJECTS_DATA.projects;
            updateStats();
            updateSidebarCounts();
            renderProjectsGrid();
            showToast('Refreshed 18 projects', 'success');
        }
    });

    // Sidebar toggle (mobile / responsive)
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.toggle('open');
    });

    // Sidebar Category Filter Navigation
    $$('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.filter;
            updateSectionTitle();
            renderProjectsGrid();
        });
    });

    // Command Palette Keyboard Shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        if (e.key === 'Escape') {
            closeCommandPalette();
            closeDrawer();
            closeLiveModal();
        }
    });

    cmdOverlay.addEventListener('click', (e) => {
        if (e.target === cmdOverlay) closeCommandPalette();
    });

    cmdInput.addEventListener('input', () => {
        renderCommandResults(cmdInput.value.trim());
    });

    // Detail Drawer Controls
    drawerOverlay.addEventListener('click', closeDrawer);
    drawerClose.addEventListener('click', closeDrawer);

    // Detail Drawer Tab Switching
    $$('.drawer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.drawer-tab').forEach(t => t.classList.remove('active'));
            $$('.drawer-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $(`#panel-${tab.dataset.tab}`).classList.add('active');

            if (tab.dataset.tab === 'code' && openDrawerProject) {
                renderCodeStudio(openDrawerProject);
            }
        });
    });

    // Live Modal Controls
    liveModalOverlay.addEventListener('click', (e) => {
        if (e.target === liveModalOverlay) closeLiveModal();
    });
    btnModalClose.addEventListener('click', closeLiveModal);
    btnModalRefresh.addEventListener('click', () => {
        if (currentLiveModalUrl) liveIframe.src = currentLiveModalUrl;
    });
    btnModalNewTab.addEventListener('click', () => {
        if (currentLiveModalUrl) window.open(currentLiveModalUrl, '_blank');
    });

    // Code Studio Action Buttons
    btnCopyCode.addEventListener('click', copyActiveCode);
    btnRunCode.addEventListener('click', () => {
        if (openDrawerProject) {
            const p = projects.find(proj => proj.name === openDrawerProject);
            if (p) openProjectApp(p);
        }
    });
}

// Adjust UI for deployed mode
function applyDeployedModeUI() {
    const logoSub = $('#logo-sub');
    if (logoSub) logoSub.textContent = 'Project Showcase & Studio';

    const runningNav = $('#nav-running');
    if (runningNav) {
        // Change "Running" to "Live Demos"
        const span = runningNav.querySelector('span:first-of-type');
        if (span) span.textContent = 'Live Demos';
    }
}

// ============================================================================
// DATA FETCHING & SYNC
// ============================================================================
async function fetchLiveProjectsFromAPI() {
    try {
        const res = await fetch(`${API_URL}/api/projects`);
        if (!res.ok) throw new Error('API server offline');
        const liveData = await res.json();
        if (Array.isArray(liveData) && liveData.length > 0) {
            // Merge live running status with bundled rich source trees
            projects = liveData.map(liveP => {
                const bundled = (window.PROJECTS_DATA?.projects || []).find(b => b.name === liveP.name);
                return {
                    ...liveP,
                    slug: liveP.slug || liveP.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    liveUrl: liveP.liveUrl || bundled?.liveUrl || null,
                    sourceFiles: bundled?.sourceFiles || [],
                    readme: bundled?.readme || liveP.readme || null
                };
            });
        }
        updateStats();
        updateSidebarCounts();
        renderProjectsGrid();
        manageLogPollers();
    } catch (err) {
        console.warn('Local API not active. Falling back to bundled projects data.');
        if (window.PROJECTS_DATA?.projects) {
            projects = window.PROJECTS_DATA.projects;
            updateStats();
            updateSidebarCounts();
            renderProjectsGrid();
        }
    }
}

async function fetchDB() {
    if (!IS_LOCAL) return;
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

// ============================================================================
// STATS & SIDEBAR COUNTS
// ============================================================================
function updateStats() {
    const runningOrLive = projects.filter(p => p.status === 'running' || p.status === 'installing' || !!p.liveUrl).length;
    const webapps = projects.filter(p => p.category === 'webapp').length;
    const python = projects.filter(p => p.category === 'python').length;

    statTotal.textContent = projects.length;
    statRunning.textContent = runningOrLive;
    statWeb.textContent = webapps;
    statPython.textContent = python;
}

function updateSidebarCounts() {
    const counts = { all: projects.length, favorites: 0, webapp: 0, python: 0, security: 0, static: 0, running: 0 };

    projects.forEach(p => {
        if (p.category && counts[p.category] !== undefined) counts[p.category]++;
        if (p.status === 'running' || p.status === 'installing' || (p.liveUrl && !IS_LOCAL)) counts.running++;
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
        favorites: 'Favorite Projects',
        webapp: 'Web Applications',
        python: 'Python & ML Tools',
        security: 'Cybersecurity Tools',
        static: 'Static Web Projects',
        running: IS_LOCAL ? 'Running Local Servers' : 'Live Interactive Demos'
    };
    sectionTitle.textContent = titles[activeCategory] || 'All Projects';
}

// ============================================================================
// RENDERING: PROJECT CARDS GRID
// ============================================================================
function renderProjectsGrid() {
    let filtered = projects.filter(p => {
        // Category filter
        if (activeCategory === 'favorites') {
            if (!favorites.includes(p.name)) return false;
        } else if (activeCategory === 'running') {
            if (IS_LOCAL) {
                if (p.status !== 'running' && p.status !== 'installing') return false;
            } else {
                if (!p.liveUrl) return false;
            }
        } else if (activeCategory !== 'all') {
            if (p.category !== activeCategory) return false;
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery;
            return p.name.toLowerCase().includes(q) ||
                   (p.techStack || []).some(t => t.toLowerCase().includes(q)) ||
                   (p.category || '').includes(q) ||
                   (p.description || '').toLowerCase().includes(q);
        }
        return true;
    });

    // Sort: Favorites first, then alphabetical
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
                <h3>No matching projects found</h3>
                <p>Try a different keyword or category filter.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    projectsGrid.innerHTML = filtered.map((p, i) => {
        const isRunningLocal = IS_LOCAL && (p.status === 'running' || p.status === 'installing');
        const hasLiveApp = !!p.liveUrl;
        const isFav = favorites.includes(p.name);
        const safeName = escapeAttr(p.name);

        // Status Badge
        let badge = '';
        if (isRunningLocal) {
            badge = `<span class="status-badge badge-running"><span class="pulse-dot"></span> Active</span>`;
        } else if (hasLiveApp) {
            badge = `<span class="status-badge badge-live"><i data-lucide="sparkles"></i> Live App</span>`;
        }

        // Primary Tech Tag
        const primaryTag = (p.techStack && p.techStack.length > 0)
            ? `<span class="tech-tag">${escapeHtml(p.techStack[0])}</span>`
            : `<span class="tech-tag">${getCatLabel(p.category)}</span>`;

        // Secondary Tech Tags Row
        const otherTags = (p.techStack || []).slice(1, 4).map(t =>
            `<span class="tech-tag tag-subtle">${escapeHtml(t)}</span>`
        ).join('');

        // Description
        const descHtml = p.description
            ? `<p class="card-desc">${escapeHtml(p.description)}</p>`
            : `<p class="card-desc muted">Click details to inspect source files and documentation.</p>`;

        // Card action buttons
        let actionButtons = '';
        if (hasLiveApp) {
            actionButtons += `
                <button class="card-btn btn-launch-live" title="Launch interactive app" onclick="event.stopPropagation(); launchLiveDemo('${safeName}')">
                    <i data-lucide="play"></i> Run App
                </button>
            `;
        } else if (IS_LOCAL) {
            actionButtons += `
                <button class="card-btn btn-run-local" title="Start local process" onclick="event.stopPropagation(); launchProject('${safeName}')">
                    <i data-lucide="terminal"></i> Start Server
                </button>
            `;
        }

        actionButtons += `
            <button class="card-btn btn-code-view" title="Inspect Code Studio" onclick="event.stopPropagation(); openCodeStudio('${safeName}')">
                <i data-lucide="code"></i> Code
            </button>
            <button class="card-btn btn-details" title="View Overview & README" onclick="event.stopPropagation(); openDrawer('${safeName}', 'overview')">
                <i data-lucide="info"></i>
            </button>
        `;

        if (IS_LOCAL) {
            actionButtons += `
                <button class="card-btn btn-icon-only" title="Open in VS Code" onclick="event.stopPropagation(); openVSCode('${safeName}')">
                    <i data-lucide="folder-code"></i>
                </button>
            `;
        }

        return `
            <div class="project-card ${isRunningLocal ? 'running' : ''}" style="animation-delay: ${i * 0.03}s"
                 onclick="openDrawer('${safeName}', 'overview')">
                <div class="card-top">
                    <div class="card-title-group">
                        <div class="project-icon" data-cat="${p.category}">
                            <i data-lucide="${p.icon || 'package'}"></i>
                        </div>
                        <div class="project-name-area">
                            <span class="project-name" title="${safeName}">${escapeHtml(p.name)}</span>
                            <div class="tags-row">
                                ${primaryTag}
                                ${otherTags}
                            </div>
                        </div>
                    </div>
                    <div class="card-right">
                        ${badge}
                        <button class="fav-btn ${isFav ? 'favorited' : ''}" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}"
                                onclick="toggleFavorite('${safeName}', event)">
                            <i data-lucide="star"></i>
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    ${descHtml}
                </div>

                <div class="card-bottom">
                    <div class="card-actions">
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ============================================================================
// LIVE APP RUNNER & MODAL
// ============================================================================
window.launchLiveDemo = function(name) {
    const project = projects.find(p => p.name === name);
    if (!project) return;
    openProjectApp(project);
};

function openProjectApp(project) {
    if (project.liveUrl) {
        currentLiveModalUrl = project.liveUrl;
        liveModalTitle.textContent = project.name;
        liveModalUrl.textContent = project.liveUrl;
        liveIframe.src = project.liveUrl;
        liveModalOverlay.classList.add('open');
        showToast(`Running "${project.name}" in Live Studio!`, 'success');
    } else if (IS_LOCAL && project.status !== 'running') {
        launchProject(project.name);
    } else {
        openDrawer(project.name, 'code');
        showToast(`Inspecting source code for "${project.name}"`, 'info');
    }
}

function closeLiveModal() {
    liveModalOverlay.classList.remove('open');
    liveIframe.src = 'about:blank';
    currentLiveModalUrl = '';
}

// ============================================================================
// DETAIL DRAWER & IN-BROWSER CODE STUDIO
// ============================================================================
window.openDrawer = function(name, targetTab = 'overview') {
    const project = projects.find(p => p.name === name);
    if (!project) return;

    openDrawerProject = name;

    // Header Info
    $('#drawer-title').textContent = project.name;
    const iconDiv = $('#drawer-icon');
    iconDiv.style.background = `rgba(${getCatRGB(project.category)}, 0.12)`;
    iconDiv.style.borderColor = `rgba(${getCatRGB(project.category)}, 0.25)`;
    iconDiv.style.color = getCatColor(project.category);
    iconDiv.innerHTML = `<i data-lucide="${project.icon || 'package'}"></i>`;

    // Tech Tags
    $('#drawer-meta').innerHTML = (project.techStack || []).map(t =>
        `<span class="tech-tag">${escapeHtml(t)}</span>`
    ).join('');

    // Dynamic Action Bar in Drawer
    const actionsDiv = $('#drawer-actions');
    const safeName = escapeAttr(name);
    const hasLiveApp = !!project.liveUrl;

    let actionsHtml = '';
    if (hasLiveApp) {
        actionsHtml += `
            <button class="drawer-action-btn da-run" onclick="launchLiveDemo('${safeName}')">
                <i data-lucide="play"></i> Launch App
            </button>
        `;
    }

    actionsHtml += `
        <a class="drawer-action-btn da-github" href="https://github.com/spraveenmonu/${encodeURIComponent(project.name)}" target="_blank" rel="noopener">
            <i data-lucide="github"></i> GitHub Repo
        </a>
    `;

    if (IS_LOCAL) {
        actionsHtml += `
            <button class="drawer-action-btn da-code" onclick="openVSCode('${safeName}')">
                <i data-lucide="terminal"></i> Open in VS Code
            </button>
            <button class="drawer-action-btn da-folder" onclick="openExplorer('${safeName}')">
                <i data-lucide="folder-open"></i> Explorer
            </button>
        `;
    }

    actionsDiv.innerHTML = actionsHtml;

    // Switch Tab
    $$('.drawer-tab').forEach(t => t.classList.remove('active'));
    $$('.drawer-panel').forEach(p => p.classList.remove('active'));
    $(`.drawer-tab[data-tab="${targetTab}"]`)?.classList.add('active');
    $(`#panel-${targetTab}`)?.classList.add('active');

    // Populate Overview
    renderDrawerOverview(project);

    // Populate Code Studio
    renderCodeStudio(name);

    // Open Drawer
    detailDrawer.classList.add('open');
    drawerOverlay.classList.add('open');

    lucide.createIcons();
};

window.openCodeStudio = function(name) {
    openDrawer(name, 'code');
};

function closeDrawer() {
    detailDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    openDrawerProject = null;
}

function renderDrawerOverview(project) {
    const quickLaunch = $('#drawer-quick-launch');
    if (project.liveUrl) {
        quickLaunch.innerHTML = `
            <div class="live-banner">
                <div class="live-banner-info">
                    <span class="live-status-dot"></span>
                    <div>
                        <strong>Interactive Live App Ready</strong>
                        <p>You can run and test this application directly in your browser.</p>
                    </div>
                </div>
                <button class="banner-launch-btn" onclick="launchLiveDemo('${escapeAttr(project.name)}')">
                    <i data-lucide="play-circle"></i> Launch Live
                </button>
            </div>
        `;
    } else {
        quickLaunch.innerHTML = '';
    }

    const readmeDiv = $('#drawer-readme');
    if (project.readme) {
        readmeDiv.innerHTML = renderMarkdown(project.readme);
    } else if (project.description) {
        readmeDiv.innerHTML = `
            <div class="readme-fallback">
                <h3>About ${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <p style="margin-top: 1rem;">Switch to the <strong>Code Studio</strong> tab to inspect all source files for this project.</p>
            </div>
        `;
    } else {
        readmeDiv.innerHTML = `<p class="readme-none">Switch to Code Studio to explore the complete source code tree.</p>`;
    }
}

// ============================================================================
// IN-BROWSER CODE STUDIO
// ============================================================================
function renderCodeStudio(name) {
    const project = projects.find(p => p.name === name);
    if (!project) return;

    activeProjectSourceFiles = project.sourceFiles || [];
    codeFileCount.textContent = `${activeProjectSourceFiles.length} file${activeProjectSourceFiles.length !== 1 ? 's' : ''}`;

    if (activeProjectSourceFiles.length === 0) {
        codeFileList.innerHTML = `<div class="file-tree-empty">No source files indexed.</div>`;
        codeViewport.innerHTML = `
            <div class="code-empty-state">
                <i data-lucide="code-2"></i>
                <p>No code files indexed for this project.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Render File List
    codeFileList.innerHTML = activeProjectSourceFiles.map((file, idx) => {
        const fileIcon = getFileIcon(file.name);
        return `
            <div class="file-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onclick="selectCodeFile(${idx})">
                <i data-lucide="${fileIcon}"></i>
                <span class="file-path" title="${escapeHtml(file.path)}">${escapeHtml(file.path)}</span>
                <span class="file-size">${formatBytes(file.size)}</span>
            </div>
        `;
    }).join('');

    // Select the first file by default
    selectCodeFile(0);
    lucide.createIcons();
}

window.selectCodeFile = function(idx) {
    const file = activeProjectSourceFiles[idx];
    if (!file) return;

    activeCodeFile = file;

    // Highlight selected file item
    $$('.file-item').forEach(el => el.classList.remove('active'));
    $(`.file-item[data-idx="${idx}"]`)?.classList.add('active');

    // Update topbar filename
    codeActiveFilename.innerHTML = `<i data-lucide="${getFileIcon(file.name)}"></i> <span>${escapeHtml(file.path)}</span>`;

    // Render Syntax Highlighted Code
    const lang = file.language || 'plaintext';
    const escapedCode = escapeHtml(file.content || '');

    codeViewport.innerHTML = `
        <pre class="line-numbers"><code class="language-${lang}">${escapedCode}</code></pre>
    `;

    // Apply Prism syntax highlighting
    if (window.Prism) {
        Prism.highlightAllUnder(codeViewport);
    }

    lucide.createIcons();
};

function copyActiveCode() {
    if (!activeCodeFile || !activeCodeFile.content) {
        showToast('No code file selected to copy', 'error');
        return;
    }
    navigator.clipboard.writeText(activeCodeFile.content).then(() => {
        showToast(`Copied ${activeCodeFile.name} to clipboard!`, 'success');
    }).catch(() => {
        showToast('Failed to copy code', 'error');
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return 'file-code';
        case 'py':
            return 'code-2';
        case 'html':
            return 'file-text';
        case 'css':
        case 'scss':
            return 'palette';
        case 'json':
            return 'braces';
        case 'md':
            return 'book';
        default:
            return 'file';
    }
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
            (p.category || '').includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    }

    if (results.length === 0 && q) {
        cmdResults.innerHTML = `
            <div class="cmd-empty">
                <i data-lucide="search-x"></i>
                <span>No matching projects found for "${escapeHtml(query)}"</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    results = results.slice(0, 10);

    cmdResults.innerHTML = results.map(p => {
        const safeName = escapeAttr(p.name);
        return `
            <div class="cmd-result-item" onclick="openDrawer('${safeName}', 'overview'); closeCommandPalette();">
                <div class="cmd-result-icon" data-cat="${p.category}">
                    <i data-lucide="${p.icon || 'package'}"></i>
                </div>
                <div class="cmd-result-info">
                    <span class="cmd-result-name">${escapeHtml(p.name)}</span>
                    <span class="cmd-result-cat">${getCatLabel(p.category)}</span>
                </div>
                <div class="cmd-result-actions">
                    ${p.liveUrl ? `<button class="cmd-btn-live" onclick="event.stopPropagation(); launchLiveDemo('${safeName}'); closeCommandPalette();">Run</button>` : ''}
                    <button class="cmd-btn-code" onclick="event.stopPropagation(); openCodeStudio('${safeName}'); closeCommandPalette();">Code</button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ============================================================================
// FAVORITES SYSTEM
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

    if (IS_LOCAL) {
        try {
            await fetch(`${API_URL}/api/db/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites })
            });
        } catch (e) {}
    }
};

// ============================================================================
// LOCAL SERVER PROCESS ACTIONS
// ============================================================================
window.launchProject = async function(name) {
    if (!IS_LOCAL) {
        launchLiveDemo(name);
        return;
    }
    showToast(`Starting backend process for "${name}"...`, 'info');
    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/activate`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(`Server activated for "${name}"!`, 'success');
            fetchLiveProjectsFromAPI();
        } else {
            showToast(data.error || 'Failed to start server', 'error');
        }
    } catch (err) {
        showToast('Connection failed during launch', 'error');
    }
};

window.openVSCode = async function(name) {
    if (!IS_LOCAL) return;
    showToast(`Opening VS Code for "${name}"...`, 'info');
    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/open-code`, { method: 'POST' });
        if (res.ok) showToast('VS Code opened', 'success');
    } catch (e) {
        showToast('Failed to trigger VS Code', 'error');
    }
};

window.openExplorer = async function(name) {
    if (!IS_LOCAL) return;
    showToast(`Opening Explorer...`, 'info');
    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/open-explorer`, { method: 'POST' });
        if (res.ok) showToast('Explorer opened', 'success');
    } catch (e) {
        showToast('Failed to trigger Explorer', 'error');
    }
};

// ============================================================================
// LOG POLLING (LOCAL ONLY)
// ============================================================================
function manageLogPollers() {
    if (!IS_LOCAL) return;
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
            if (openDrawerProject === name) {
                const drawerTerm = $('#drawer-terminal');
                if (drawerTerm) renderTerminalLogs(drawerTerm, data.logs);
            }
        } catch (e) {}
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
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
        else if (line.includes('running') || line.includes('started') || line.includes('Served project')) cls = 'success';
        return `<div class="terminal-line ${cls}">${escapeHtml(line)}</div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ============================================================================
// MARKDOWN RENDERING
// ============================================================================
function renderMarkdown(md) {
    if (!md) return '';
    let html = escapeHtml(md);

    // Fenced Code Blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold & Italics
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Unordered Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Horizontal Rules
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs
    html = html.replace(/^(?!<[hupola]|<li|<hr|<pre)(.+)$/gm, '<p>$1</p>');
    html = html.replace(/\n{2,}/g, '\n');

    return html;
}

// ============================================================================
// HELPERS
// ============================================================================
function showToast(message, type = 'info') {
    const toast = $('#toast');
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
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function getCatLabel(cat) {
    const map = { webapp: 'Web App', python: 'Python', security: 'Security', static: 'Static Site', other: 'Project' };
    return map[cat] || 'Project';
}

function getCatColor(cat) {
    const colors = { webapp: '#818cf8', python: '#34d399', security: '#fb7185', static: '#22d3ee', other: '#a78bfa' };
    return colors[cat] || colors.other;
}

function getCatRGB(cat) {
    const rgbs = { webapp: '99, 102, 241', python: '16, 185, 129', security: '244, 63, 94', static: '6, 182, 212', other: '139, 92, 246' };
    return rgbs[cat] || rgbs.other;
}
