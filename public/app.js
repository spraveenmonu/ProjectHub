// Global State
let projects = [];
let activeFilters = {
    search: ''
};
let logPollIntervals = new Map(); // Key: project name, Value: setInterval reference

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');
const searchInput = document.getElementById('search-input');
const filteredCountSpan = document.getElementById('filtered-count');
const btnRefresh = document.getElementById('btn-refresh');

// API Base URL
const API_URL = '';

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value.trim().toLowerCase();
        renderProjectsGrid();
    });

    // Refresh
    btnRefresh.addEventListener('click', () => {
        showToast('Scanning workspace...', 'info');
        clearAllLogPolls();
        fetchProjects();
    });
}

// ==========================================================================
// DATA FETCHING & LOGS POLLING
// ==========================================================================
async function fetchProjects() {
    try {
        const res = await fetch(`${API_URL}/api/projects`);
        if (!res.ok) throw new Error('API server error');
        projects = await res.json();
        
        renderProjectsGrid();
        manageLogPollers();
    } catch (err) {
        projectsGrid.innerHTML = `
            <div class="no-results">
                <i data-lucide="alert-octagon"></i>
                <h3>API Connection Failure</h3>
                <p>Ensure the Node.js Express server is running on Port 4200.</p>
            </div>
        `;
        lucide.createIcons();
    }
}

function manageLogPollers() {
    // Start pollers for running or installing projects
    projects.forEach(p => {
        const isRunning = p.status === 'running' || p.status === 'installing';
        if (isRunning && !logPollIntervals.has(p.name)) {
            startCardLogPolling(p.name);
        } else if (!isRunning && logPollIntervals.has(p.name)) {
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
            if (res.ok) {
                const data = await res.json();
                const terminalDiv = document.getElementById(`terminal-${name}`);
                
                if (terminalDiv) {
                    if (data.logs.length === 0) {
                        terminalDiv.innerHTML = `<div class="terminal-line system">[ProjectHub] Service started. Waiting for terminal log outputs...</div>`;
                    } else {
                        terminalDiv.innerHTML = data.logs.map(line => {
                            let typeClass = '';
                            if (line.includes('[ProjectHub]')) typeClass = 'system';
                            else if (line.includes('[stderr]')) typeClass = 'stderr';
                            else if (line.includes('running') || line.includes('started') || line.includes('Local:') || line.includes('Served project')) typeClass = 'success';
                            
                            return `<div class="terminal-line ${typeClass}">${escapeHtml(line)}</div>`;
                        }).join('');
                        
                        // Auto scroll console
                        terminalDiv.scrollTop = terminalDiv.scrollHeight;
                    }
                }

                // If status changed, refresh list to show proper UI
                if (data.status !== 'running' && data.status !== 'installing') {
                    clearInterval(logPollIntervals.get(name));
                    logPollIntervals.delete(name);
                    fetchProjects();
                } else {
                    const p = projects.find(proj => proj.name === name);
                    if (p && !p.url && data.url) {
                        fetchProjects();
                    }
                }
            }
        } catch (e) {
            console.error('Log poller error for ' + name, e);
        }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000);
    logPollIntervals.set(name, interval);
}

// ==========================================================================
// RENDERING CARD GRID
// ==========================================================================
function renderProjectsGrid() {
    let filtered = projects.filter(p => {
        return p.name.toLowerCase().includes(activeFilters.search);
    });

    // Default Sort alphabetically
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    filteredCountSpan.textContent = filtered.length;

    if (filtered.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-results">
                <i data-lucide="search-code"></i>
                <h3>No projects match your search</h3>
                <p>Try clearing the search box.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    projectsGrid.innerHTML = filtered.map(p => {
        const isRunning = p.status === 'running' || p.status === 'installing';
        const cardClass = isRunning ? `project-card ${p.status}` : `project-card ${p.status}`;

        const desc = p.readmeSnippet 
            ? cleanSnippet(p.readmeSnippet)
            : `Workspace project. Click card to activate VS Code, Explorer, and open as a Web App.`;

        // Badge markup
        let badgeMarkup = '';
        if (p.status === 'running') {
            badgeMarkup = `<span class="status-badge badge-running">Active</span>`;
        } else if (p.status === 'installing') {
            badgeMarkup = `<span class="status-badge badge-installing">Activating</span>`;
        }

        // Inline logs console markup (active cards)
        // Note: Every running project has a Web App button (since we fall back to static express serving for all)
        let consoleMarkup = '';
        if (isRunning) {
            const webAppUrl = p.url || `http://localhost:${p.port || 5000}`;
            consoleMarkup = `
                <div class="inline-console-wrapper" onclick="event.stopPropagation()">
                    <div class="console-header">
                        <div class="console-title">
                            <i data-lucide="terminal"></i> Console Logs
                        </div>
                        <div class="console-actions">
                            <button onclick="window.open('${webAppUrl}', '_blank')" class="console-btn btn-open"><i data-lucide="external-link"></i> Web App</button>
                            <button onclick="stopProject('${p.name}', event)" class="console-btn btn-stop"><i data-lucide="square"></i> Stop</button>
                        </div>
                    </div>
                    <div class="inline-terminal" id="terminal-${p.name}">
                        <div class="terminal-line system">[ProjectHub] Waiting for logs...</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="${cardClass}" id="card-${p.name}" onclick="activateProject('${p.name}')">
                <!-- Hover activator banner (idle state) -->
                <div class="card-hover-banner">
                    <span class="banner-action-text"><i data-lucide="zap"></i> Activate Workspace</span>
                    <span class="banner-subtext">
                        <span><i data-lucide="terminal"></i> VS Code</span>
                        <span><i data-lucide="folder-open"></i> Explorer</span>
                        <span><i data-lucide="play"></i> Web App</span>
                    </span>
                </div>

                <div class="card-header">
                    <div class="card-title-group">
                        <span class="project-avatar">${p.icon || '📦'}</span>
                        <div class="project-name-wrapper">
                            <h3 title="${p.name}">${p.name}</h3>
                        </div>
                    </div>
                    ${badgeMarkup}
                </div>
                
                <div class="card-body">
                    <p class="project-description">${desc}</p>
                </div>

                ${consoleMarkup}
            </div>
        `;
    }).join('');

    lucide.createIcons();
    
    // Auto-scroll terminals
    logPollIntervals.forEach((val, key) => {
        const term = document.getElementById(`terminal-${key}`);
        if (term) term.scrollTop = term.scrollHeight;
    });
}

function cleanSnippet(snippet) {
    return snippet
        .replace(/[#*`~_\[\]()]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ==========================================================================
// SYSTEM ACTIONS (Activate & Stop)
// ==========================================================================
window.activateProject = async function(name) {
    showToast(`Activating workspace for "${name}"...`, 'info');
    
    // Optimistic UI update
    const card = document.getElementById(`card-${name}`);
    if (card) {
        card.className = 'project-card installing';
        const header = card.querySelector('.card-header');
        if (header) {
            let badge = header.querySelector('.status-badge');
            if (badge) {
                badge.className = 'status-badge badge-installing';
                badge.textContent = 'Activating';
            } else {
                header.insertAdjacentHTML('beforeend', `<span class="status-badge badge-installing">Activating</span>`);
            }
        }
    }

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/activate`, {
            method: 'POST'
        });
        const data = await res.json();
        
        if (res.ok) {
            showToast(`Workspace activated for "${name}"!`, 'success');
            fetchProjects();
        } else {
            showToast(data.error || 'Failed to activate project', 'error');
            fetchProjects();
        }
    } catch (err) {
        showToast('Server connection failed during activation', 'error');
        fetchProjects();
    }
};

window.stopProject = async function(name, event) {
    if (event) event.stopPropagation();
    
    showToast(`Stopping server for "${name}"...`, 'info');
    
    if (logPollIntervals.has(name)) {
        clearInterval(logPollIntervals.get(name));
        logPollIntervals.delete(name);
    }

    try {
        const res = await fetch(`${API_URL}/api/projects/${encodeURIComponent(name)}/stop`, {
            method: 'POST'
        });
        const data = await res.json();
        
        if (res.ok) {
            showToast(`Stopped ${name} server.`, 'success');
            fetchProjects();
        } else {
            showToast(data.error || 'Failed to stop project', 'error');
            fetchProjects();
        }
    } catch (err) {
        showToast('Network error during stop request', 'error');
        fetchProjects();
    }
};

// ==========================================================================
// TOAST NOTIFICATIONS & HELPERS
// ==========================================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type} show`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
    toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
