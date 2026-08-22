const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4200;
const PROJECTS_DIR = path.resolve('D:\\Projects\\Spraveenmonu');

// Projects to hide from the dashboard (self + user excluded projects)
const EXCLUDED_PROJECTS = new Set([
  'ProjectHub',
  '.git',
  'Portfolio',
  'Riddles',
  'traffic_sim',
  'traffic_simulation',
  'Night Safe NiZHal',
  'Hackathon Project'
]);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store running processes
const runningProjects = new Map();

// Local Database File
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { favorites: [], launchStats: {}, projectOverrides: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { favorites: [], launchStats: {}, projectOverrides: {} };
  }
}

function saveDB(dbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// ============================================================================
// HELPERS: Project Detection & Categorization
// ============================================================================

function detectTechStack(projectPath, files) {
  const stack = [];
  const hasPackageJson = files.includes('package.json');

  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (allDeps['react'] || allDeps['react-dom']) stack.push('React');
      if (allDeps['vue']) stack.push('Vue');
      if (allDeps['svelte']) stack.push('Svelte');
      if (allDeps['next']) stack.push('Next.js');
      if (allDeps['vite']) stack.push('Vite');
      if (allDeps['express']) stack.push('Express');
      if (allDeps['socket.io'] || allDeps['socket.io-client']) stack.push('Socket.IO');
      if (allDeps['mongoose'] || allDeps['mongodb']) stack.push('MongoDB');
      if (allDeps['tailwindcss']) stack.push('Tailwind');
      if (allDeps['typescript']) stack.push('TypeScript');

      if (stack.length === 0 && files.includes('vite.config.js')) stack.push('Vite');
      if (stack.length === 0) stack.push('Node.js');
    } catch (e) {
      stack.push('Node.js');
    }
  }

  // Python detection
  const pyFiles = files.filter(f => f.endsWith('.py'));
  if (pyFiles.length > 0) {
    pyFiles.forEach(pf => {
      try {
        const content = fs.readFileSync(path.join(projectPath, pf), 'utf8');
        if (content.includes('streamlit')) stack.push('Streamlit');
        if (content.includes('flask') || content.includes('Flask')) stack.push('Flask');
        if (content.includes('fastapi') || content.includes('FastAPI')) stack.push('FastAPI');
        if (content.includes('django')) stack.push('Django');
        if (content.includes('pygame')) stack.push('Pygame');
        if (content.includes('pandas')) stack.push('Pandas');
        if (content.includes('sklearn') || content.includes('scikit')) stack.push('Scikit-learn');
      } catch (e) {}
    });
    if (!stack.some(s => ['Flask', 'FastAPI', 'Django', 'Streamlit', 'Pygame', 'Pandas', 'Scikit-learn'].includes(s))) {
      stack.push('Python');
    }
  }

  if (files.includes('requirements.txt') && !stack.some(s => s.startsWith('P') || s === 'Flask' || s === 'FastAPI' || s === 'Django' || s === 'Streamlit')) {
    stack.push('Python');
  }

  if (files.includes('index.html') && stack.length === 0) {
    stack.push('HTML/CSS');
    if (files.some(f => f.endsWith('.js') && f !== 'vite.config.js')) stack.push('JavaScript');
  }

  return [...new Set(stack)];
}

function detectCategory(name, techStack, files) {
  const nameLower = name.toLowerCase();

  // Security/Cyber category keywords
  const securityKeywords = ['phishing', 'vulnerability', 'malware', 'firewall', 'ransomware', 'ransomeware', 'cyber', 'port scanner', 'password', 'scanner'];
  if (securityKeywords.some(kw => nameLower.includes(kw))) return 'security';

  // Python apps
  if (techStack.some(t => ['Flask', 'FastAPI', 'Django', 'Streamlit', 'Python', 'Pandas', 'Scikit-learn', 'Pygame'].includes(t))) return 'python';

  // Web apps (Node.js/Vite/React projects)
  if (techStack.some(t => ['React', 'Vue', 'Svelte', 'Next.js', 'Vite', 'Express', 'Node.js', 'Socket.IO'].includes(t))) return 'webapp';

  // Static HTML sites
  if (files.includes('index.html')) return 'static';

  return 'other';
}

function getProjectDescription(projectPath, files) {
  // Try README first
  const readmeFile = files.find(f => /^readme\.md$/i.test(f) || /^project_overview\.md$/i.test(f));
  if (readmeFile) {
    try {
      const content = fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
      // Extract first paragraph after the title
      const lines = content.split('\n').filter(l => l.trim());
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip headings, badges, links-only lines
        if (line.startsWith('#') || line.startsWith('!') || line.startsWith('[') || line.startsWith('---')) continue;
        // Clean up markdown syntax
        const clean = line.replace(/[#*`~_\[\]()]/g, '').replace(/<[^>]*>/g, '').trim();
        if (clean.length > 15) return clean.slice(0, 160) + (clean.length > 160 ? '...' : '');
      }
    } catch (e) {}
  }
  return null;
}

function getCategoryIcon(category) {
  switch (category) {
    case 'webapp': return 'globe';
    case 'python': return 'code-2';
    case 'security': return 'shield';
    case 'static': return 'file-code';
    default: return 'package';
  }
}

function inspectProject(dirName) {
  const projectPath = path.join(PROJECTS_DIR, dirName);
  const info = {
    name: dirName,
    path: projectPath,
    icon: 'package',
    category: 'other',
    techStack: [],
    description: null,
    hasReadme: false,
    isRunning: false,
    status: 'idle',
    url: null
  };

  try {
    const files = fs.readdirSync(projectPath);
    const techStack = detectTechStack(projectPath, files);
    const category = detectCategory(dirName, techStack, files);
    const description = getProjectDescription(projectPath, files);

    info.techStack = techStack;
    info.category = category;
    info.icon = getCategoryIcon(category);
    info.description = description;
    info.hasReadme = files.some(f => /^readme\.md$/i.test(f) || /^project_overview\.md$/i.test(f));

    if (runningProjects.has(dirName)) {
      const state = runningProjects.get(dirName);
      info.isRunning = state.status === 'running' || state.status === 'installing';
      info.status = state.status;
      info.url = state.url;
    }
  } catch (err) {
    info.icon = 'alert-circle';
  }

  return info;
}

// ============================================================================
// API ROUTES
// ============================================================================

// List all projects
app.get('/api/projects', (req, res) => {
  try {
    const dirs = fs.readdirSync(PROJECTS_DIR).filter(file => {
      try {
        const fullPath = path.join(PROJECTS_DIR, file);
        return fs.statSync(fullPath).isDirectory() && !EXCLUDED_PROJECTS.has(file);
      } catch (e) {
        return false;
      }
    });

    const projects = dirs.map(dir => inspectProject(dir));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read projects', details: err.message });
  }
});

// Get Database state
app.get('/api/db', (req, res) => {
  const db = loadDB();
  res.json(db);
});

// Update Favorites in Database
app.post('/api/db/favorites', (req, res) => {
  const { favorites } = req.body;
  if (!Array.isArray(favorites)) {
    return res.status(400).json({ error: 'Favorites must be an array' });
  }
  const db = loadDB();
  db.favorites = favorites;
  saveDB(db);
  res.json({ success: true, favorites: db.favorites });
});

// Get full README content
app.get('/api/projects/:name/readme', (req, res) => {
  const { name } = req.params;
  const projectPath = path.join(PROJECTS_DIR, name);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }

  try {
    const files = fs.readdirSync(projectPath);
    const readmeFile = files.find(f => /^readme\.md$/i.test(f) || /^project_overview\.md$/i.test(f));

    if (!readmeFile) {
      return res.json({ content: null, filename: null });
    }

    const content = fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
    res.json({ content, filename: readmeFile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read README', details: err.message });
  }
});

// Open project in VS Code
app.post('/api/projects/:name/open-code', (req, res) => {
  const { name } = req.params;
  const projectPath = path.join(PROJECTS_DIR, name);
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  exec(`code "${projectPath}"`, (err) => {});
  res.json({ success: true, message: 'VS Code command triggered' });
});

// Open project in File Explorer
app.post('/api/projects/:name/open-explorer', (req, res) => {
  const { name } = req.params;
  const projectPath = path.join(PROJECTS_DIR, name);
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  exec(`explorer "${projectPath}"`, (err) => {});
  res.json({ success: true, message: 'Explorer command triggered' });
});

// Activate Endpoint (Starts all services)
app.post('/api/projects/:name/activate', async (req, res) => {
  const { name } = req.params;
  const projectPath = path.join(PROJECTS_DIR, name);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Record launch in DB
  const db = loadDB();
  const currentStats = db.launchStats[name] || { launchCount: 0 };
  db.launchStats[name] = {
    launchCount: currentStats.launchCount + 1,
    lastLaunched: new Date().toISOString()
  };
  saveDB(db);

  // If already running, return state
  if (runningProjects.has(name)) {
    const state = runningProjects.get(name);
    return res.json({ success: true, message: 'Project is already active', url: state.url, status: state.status });
  }

  const logs = [`[ProjectHub] Activating workspace server for ${name}...`];

  const projectState = {
    childProcesses: [],
    logs,
    port: null,
    startTime: new Date(),
    type: 'unknown',
    serverInstance: null,
    url: null,
    backendUrl: null,
    status: 'installing'
  };

  runningProjects.set(name, projectState);

  const files = fs.readdirSync(projectPath);
  const hasPackageJson = files.includes('package.json');
  const hasNodeModules = files.includes('node_modules');

  // Subfolder detection (server/backend)
  const hasServerDir = files.includes('server') && fs.statSync(path.join(projectPath, 'server')).isDirectory();
  const hasBackendDir = files.includes('backend') && fs.statSync(path.join(projectPath, 'backend')).isDirectory();
  const serverPath = hasServerDir ? path.join(projectPath, 'server') : (hasBackendDir ? path.join(projectPath, 'backend') : null);

  // Python configurations
  const hasVenv = files.includes('venv') && fs.existsSync(path.join(projectPath, 'venv', 'Scripts', 'python.exe'));
  const hasDotVenv = files.includes('.venv') && fs.existsSync(path.join(projectPath, '.venv', 'Scripts', 'python.exe'));
  const pythonBin = hasDotVenv
    ? path.join(projectPath, '.venv', 'Scripts', 'python.exe')
    : hasVenv
      ? path.join(projectPath, 'venv', 'Scripts', 'python.exe')
      : 'python';
  const pipBin = hasDotVenv
    ? path.join(projectPath, '.venv', 'Scripts', 'pip.exe')
    : hasVenv
      ? path.join(projectPath, 'venv', 'Scripts', 'pip.exe')
      : 'pip';

  const hasManagePy = files.includes('manage.py');
  const hasAppPy = files.includes('app.py');
  const hasMainPy = files.includes('main.py');
  const hasRunPy = files.includes('run.py');
  const hasIndexHtml = files.includes('index.html');
  const isWindows = process.platform === 'win32';

  // Helper to strip ANSI codes
  const stripAnsi = (str) => {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  };

  // Port detector
  const parseLogsForPortAndOpen = (dataStr, isBackend = false) => {
    // For frontend: skip if we already have a URL
    // For backend: store separately so we can still track it
    if (!isBackend && projectState.url) return;
    if (isBackend && projectState.backendUrl) return;

    const cleanStr = stripAnsi(dataStr);

    const portMatch = cleanStr.match(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/) ||
                      cleanStr.match(/port\s*(?:is|on)?\s*:?\s*(\d+)/i) ||
                      cleanStr.match(/listening on\s*:?\s*(\d+)/i) ||
                      cleanStr.match(/http:\/\/localhost:(\d+)/i) ||
                      cleanStr.match(/https?:\/\/[\w.-]+:(\d+)/i) ||
                      cleanStr.match(/Network:\s*http:\/\/192\.\d+\.\d+\.\d+:(\d+)/i) ||
                      cleanStr.match(/running\s+(?:on|at)\s+.*?(\d{4,5})/i) ||
                      cleanStr.match(/started\s+(?:on|at)\s+.*?(\d{4,5})/i) ||
                      cleanStr.match(/ready\s+(?:on|at|in)\s+.*?(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i) ||
                      cleanStr.match(/serving\s+(?:on|at)\s+.*?(\d{4,5})/i);

    if (portMatch) {
      const port = parseInt(portMatch[1]);
      if (port > 0 && port <= 65535 && port !== 4200) {
        if (isBackend) {
          projectState.backendUrl = `http://127.0.0.1:${port}`;
          projectState.status = 'running';
          projectState.logs.push(`[ProjectHub] Detected backend server port: ${projectState.backendUrl}`);
          // If no frontend URL yet, use backend URL as the primary URL
          if (!projectState.url) {
            projectState.port = port;
            projectState.url = projectState.backendUrl;
            projectState.logs.push(`[ProjectHub] Using backend URL as primary: ${projectState.url}`);
          }
        } else {
          projectState.port = port;
          projectState.url = `http://127.0.0.1:${port}`;
          projectState.status = 'running';
          projectState.logs.push(`[ProjectHub] Detected active port: ${projectState.url}`);
        }
      }
    }
  };

  const spawnProcess = (cmd, args, cwd = projectPath, prefix = '') => {
    projectState.logs.push(`[ProjectHub] Spawning: ${cmd} ${args.join(' ')}`);
    projectState.type = 'process';
    projectState.status = 'running';

    const isBackend = prefix === 'Backend Server';

    // Don't strip PORT — let the child project use its own configured port.
    // Only ensure it doesn't accidentally bind to ProjectHub's port (4200).
    const childEnv = { ...process.env };
    delete childEnv.PORT; // Remove inherited PORT so each project uses its own default

    const child = spawn(cmd, args, {
      cwd,
      shell: isWindows,
      env: childEnv
    });

    projectState.childProcesses.push(child);

    child.stdout.on('data', (data) => {
      const text = data.toString();
      text.split('\n').forEach(line => {
        const t = line.trim();
        if (t) {
          projectState.logs.push(prefix ? `[${prefix}] ${t}` : t);
          // Parse ALL process output for port detection, including backend
          parseLogsForPortAndOpen(t, isBackend);
        }
      });
      if (projectState.logs.length > 500) projectState.logs = projectState.logs.slice(-500);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      text.split('\n').forEach(line => {
        const t = line.trim();
        if (t) {
          projectState.logs.push(prefix ? `[${prefix} stderr] ${t}` : `[stderr] ${t}`);
          // Parse stderr too — many dev servers (Vite, Next.js) output URLs to stderr
          parseLogsForPortAndOpen(t, isBackend);
        }
      });
      if (projectState.logs.length > 500) projectState.logs = projectState.logs.slice(-500);
    });

    child.on('close', (code) => {
      projectState.logs.push(`[ProjectHub] Process ${prefix || cmd} exited with code ${code}`);

      if (code !== 0 && !projectState.url && projectState.status !== 'idle') {
        // Process failed and no URL was ever detected — try static fallback
        const hasIndexHtml = fs.existsSync(path.join(projectPath, 'index.html')) ||
                             fs.existsSync(path.join(projectPath, 'public', 'index.html')) ||
                             fs.existsSync(path.join(projectPath, 'dist', 'index.html')) ||
                             fs.existsSync(path.join(projectPath, 'build', 'index.html'));
        if (hasIndexHtml) {
          projectState.logs.push(`[ProjectHub] Process failed. Falling back to static web hosting...`);
          // Try to serve from dist/build folders if they exist
          const staticDir = fs.existsSync(path.join(projectPath, 'dist')) ? path.join(projectPath, 'dist') :
                            fs.existsSync(path.join(projectPath, 'build')) ? path.join(projectPath, 'build') :
                            projectPath;
          launchStaticAppServer(staticDir);
        } else {
          projectState.logs.push(`[ProjectHub] Process failed with code ${code}. No static fallback available.`);
          projectState.status = 'failed';
        }
      } else {
        // Process exited with code 0 or URL was detected
        const activeCount = projectState.childProcesses.filter(c => c.pid !== child.pid && c.exitCode === null).length;
        if (activeCount === 0) {
          // Only mark idle if no URL was detected (server never started)
          // If URL exists, the server ran and completed — keep status as 'running'
          // only if it's a static server still active
          if (projectState.url && projectState.type === 'static' && projectState.serverInstance) {
            // Static server is still running, keep status
            projectState.status = 'running';
          } else if (!projectState.url) {
            projectState.status = 'idle';
          } else {
            // URL was detected but all processes exited — server has stopped
            projectState.status = 'idle';
            projectState.url = null;
            projectState.backendUrl = null;
          }
        }
      }
    });

    child.on('error', (err) => {
      projectState.logs.push(`[ProjectHub] Process ${prefix || cmd} error: ${err.message}`);

      if (!projectState.url && projectState.status !== 'idle') {
        projectState.logs.push(`[ProjectHub] Launch failed. Falling back to static web hosting...`);
        launchStaticAppServer();
      }
    });
  };

  const launchStaticAppServer = (targetDir = projectPath) => {
    try {
      projectState.status = 'running';
      const staticApp = express();
      staticApp.use(express.static(targetDir));

      const staticPort = 8000 + Math.floor(Math.random() * 1000);
      const serverInstance = staticApp.listen(staticPort, '127.0.0.1', () => {
        const url = `http://127.0.0.1:${staticPort}`;
        projectState.url = url;
        projectState.port = staticPort;
        projectState.type = 'static';
        projectState.serverInstance = serverInstance;
        projectState.logs.push(`[ProjectHub] Served project as static site: ${url}`);
      });

      serverInstance.on('error', (err) => {
        projectState.logs.push(`[ProjectHub] Static hosting error: ${err.message}`);
        projectState.status = 'failed';
      });

    } catch (err) {
      projectState.logs.push(`[ProjectHub] Error: ${err.message}`);
      projectState.status = 'failed';
    }
  };

  // Helper to run installation of npm packages
  const runNpmInstall = (cwd, callback) => {
    projectState.logs.push(`[ProjectHub] Running "npm install" in ${path.basename(cwd)}...`);
    projectState.status = 'installing';

    const installer = spawn('npm', ['install'], { cwd, shell: isWindows });
    projectState.childProcesses.push(installer);

    installer.stdout.on('data', (d) => {
      d.toString().split('\n').forEach(l => {
        if (l.trim()) projectState.logs.push(`[npm install] ${l.trim()}`);
      });
    });
    installer.stderr.on('data', (d) => {
      d.toString().split('\n').forEach(l => {
        if (l.trim()) projectState.logs.push(`[npm install stderr] ${l.trim()}`);
      });
    });
    installer.on('close', (code) => {
      if (code === 0) {
        projectState.logs.push(`[ProjectHub] npm install complete in ${path.basename(cwd)}.`);
        callback();
      } else {
        projectState.logs.push(`[ProjectHub] npm install failed with code ${code}.`);
        projectState.status = 'failed';
      }
    });
  };

  // Main launcher execution tree
  if (hasPackageJson) {
    const startRootApp = () => {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
        const scripts = Object.keys(pkg.scripts || {});
        const runScript = scripts.includes('dev') ? 'dev' : scripts.includes('start') ? 'start' : null;
        if (runScript) {
          spawnProcess('npm', ['run', runScript], projectPath, 'Frontend');
        } else {
          spawnProcess('node', ['server.js'], projectPath, 'Frontend');
        }
      } catch (e) {
        spawnProcess('node', ['server.js'], projectPath, 'Frontend');
      }
    };

    const startAppWithDependencies = () => {
      if (!hasNodeModules) {
        runNpmInstall(projectPath, () => {
          checkAndStartSubfolderServer();
        });
      } else {
        checkAndStartSubfolderServer();
      }
    };

    const checkAndStartSubfolderServer = () => {
      startRootApp();

      if (serverPath && fs.existsSync(path.join(serverPath, 'package.json'))) {
        const hasSubModules = fs.existsSync(path.join(serverPath, 'node_modules'));
        const startSubServer = () => {
          try {
            const subPkg = JSON.parse(fs.readFileSync(path.join(serverPath, 'package.json'), 'utf8'));
            const subScripts = Object.keys(subPkg.scripts || {});
            const subScript = subScripts.includes('dev') ? 'dev' : subScripts.includes('start') ? 'start' : null;
            if (subScript) {
              spawnProcess('npm', ['run', subScript], serverPath, 'Backend Server');
            } else {
              spawnProcess('node', ['index.js'], serverPath, 'Backend Server');
            }
          } catch (e) {
            spawnProcess('node', ['index.js'], serverPath, 'Backend Server');
          }
        };

        if (!hasSubModules) {
          runNpmInstall(serverPath, () => {
            startSubServer();
          });
        } else {
          startSubServer();
        }
      }
    };

    startAppWithDependencies();

  } else if (files.includes('server.js') || files.includes('app.js') || files.includes('index.js')) {
    const scriptFile = files.includes('server.js') ? 'server.js' : (files.includes('app.js') ? 'app.js' : 'index.js');
    const scriptContent = fs.readFileSync(path.join(projectPath, scriptFile), 'utf8');

    const needsExpress = scriptContent.includes("require('express')") || scriptContent.includes('require("express")');

    const runScript = () => {
      spawnProcess('node', [scriptFile]);
    };

    if (needsExpress) {
      projectState.logs.push('[ProjectHub] Node.js script detected express require but no package.json. Initializing basic setup...');
      projectState.status = 'installing';

      fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify({
        name: name.toLowerCase(),
        version: '1.0.0',
        main: scriptFile,
        dependencies: { express: "^4.19.2" }
      }, null, 2));

      runNpmInstall(projectPath, () => {
        runScript();
      });
    } else {
      runScript();
    }

  } else if (hasManagePy || hasAppPy || hasMainPy || hasRunPy || files.includes('requirements.txt')) {
    projectState.status = 'installing';

    const getPythonImports = () => {
      const imports = new Set();
      const pyFiles = files.filter(f => f.endsWith('.py'));

      pyFiles.forEach(pf => {
        try {
          const content = fs.readFileSync(path.join(projectPath, pf), 'utf8');
          if (content.includes('import streamlit') || content.includes('from streamlit')) imports.add('streamlit');
          if (content.includes('import fastapi') || content.includes('from fastapi')) {
            imports.add('fastapi');
            imports.add('uvicorn');
          }
          if (content.includes('import flask') || content.includes('from flask') || content.includes('import Flask') || content.includes('from Flask')) imports.add('Flask');
          if (content.includes('import django') || content.includes('from django')) imports.add('django');
          if (content.includes('import pygame') || content.includes('from pygame')) imports.add('pygame');
          if (content.includes('import pandas') || content.includes('from pandas')) imports.add('pandas');
          if (content.includes('import sklearn') || content.includes('from sklearn')) imports.add('scikit-learn');
          if (content.includes('import httpx') || content.includes('from httpx')) imports.add('httpx');
        } catch (e) {}
      });
      return Array.from(imports);
    };

    const packagesToInstall = getPythonImports();
    const hasReqFile = files.includes('requirements.txt');

    const startPythonExecution = () => {
      projectState.status = 'running';

      if (hasManagePy) {
        const djPort = 8000 + Math.floor(Math.random() * 1000);
        spawnProcess(pythonBin, ['manage.py', 'runserver', `127.0.0.1:${djPort}`]);
      } else if (hasRunPy) {
        spawnProcess(pythonBin, ['run.py']);
      } else if (hasAppPy || hasMainPy) {
        const targetFile = hasAppPy ? 'app.py' : 'main.py';
        try {
          const content = fs.readFileSync(path.join(projectPath, targetFile), 'utf8');

          if (content.includes('import streamlit') || content.includes('from streamlit') || content.includes('streamlit')) {
            const stPort = 8500 + Math.floor(Math.random() * 1000);
            spawnProcess(pythonBin, ['-m', 'streamlit', 'run', targetFile, '--server.port', stPort.toString(), '--server.headless', 'true']);
          } else if (content.includes('FastAPI') || content.includes('import fastapi') || content.includes('from fastapi')) {
            const pyPort = 8000 + Math.floor(Math.random() * 1000);
            const moduleName = targetFile.replace('.py', '');
            spawnProcess(pythonBin, ['-m', 'uvicorn', `${moduleName}:app`, '--host', '127.0.0.1', '--port', pyPort.toString()]);
          } else if (content.includes('import flask') || content.includes('from flask') || content.includes('Flask')) {
            // Flask apps — run them directly, Flask will start its own dev server
            spawnProcess(pythonBin, [targetFile]);
          } else {
            spawnProcess(pythonBin, [targetFile]);
          }
        } catch (e) {
          spawnProcess(pythonBin, [targetFile]);
        }
      } else {
        launchStaticAppServer();
      }
    };

    const installPythonDeps = () => {
      if (hasReqFile) {
        projectState.logs.push('[ProjectHub] Installing requirements.txt dependencies via pip...');
        const pip = spawn(pipBin, ['install', '-r', 'requirements.txt'], { cwd: projectPath, shell: isWindows });
        projectState.childProcesses.push(pip);

        pip.stdout.on('data', (d) => {
          d.toString().split('\n').forEach(l => { if (l.trim()) projectState.logs.push(`[pip] ${l.trim()}`); });
        });
        pip.on('close', () => {
          startPythonExecution();
        });
      } else if (packagesToInstall.length > 0) {
        projectState.logs.push(`[ProjectHub] Detected imports. Installing: ${packagesToInstall.join(', ')}...`);
        const pip = spawn(pipBin, ['install', ...packagesToInstall], { cwd: projectPath, shell: isWindows });
        projectState.childProcesses.push(pip);

        pip.on('close', () => {
          startPythonExecution();
        });
      } else {
        startPythonExecution();
      }
    };

    installPythonDeps();

  } else if (hasIndexHtml) {
    launchStaticAppServer();
  } else {
    launchStaticAppServer();
  }

  res.json({ success: true, message: 'Activation workflow triggered', status: projectState.status, url: projectState.url });
});

// Get logs for inline card console
app.get('/api/projects/:name/logs', (req, res) => {
  const { name } = req.params;
  const state = runningProjects.get(name);
  if (!state) {
    return res.json({ isRunning: false, status: 'idle', logs: [] });
  }
  res.json({
    isRunning: state.childProcesses.some(c => c.exitCode === null) || state.type === 'static',
    status: state.status,
    url: state.url,
    backendUrl: state.backendUrl || null,
    port: state.port,
    logs: state.logs
  });
});

// Stop project
app.post('/api/projects/:name/stop', (req, res) => {
  const { name } = req.params;
  const state = runningProjects.get(name);

  if (!state) {
    return res.status(404).json({ error: 'Project is not running' });
  }

  if (state.type === 'static' && state.serverInstance) {
    try {
      state.serverInstance.close();
    } catch (e) {}
  }

  if (state.childProcesses && state.childProcesses.length > 0) {
    state.childProcesses.forEach(child => {
      if (child && child.pid) {
        try {
          exec(`taskkill /pid ${child.pid} /T /F`);
        } catch (e) {
          try {
            child.kill('SIGKILL');
          } catch (err) {}
        }
      }
    });
  }

  runningProjects.delete(name);
  res.json({ success: true, message: 'Project stopped' });
});

// Serve frontend template
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 PROJECT HUB DEV SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`📂 Scanning location: ${PROJECTS_DIR}`);
  console.log(`==================================================`);
});
