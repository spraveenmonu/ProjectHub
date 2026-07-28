const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4200;
const PROJECTS_DIR = path.resolve('D:\\Projects\\Spraveenmonu');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store running processes
// Key: project name, Value: { childProcesses: ChildProcess[], logs: string[], port: number, startTime: Date, type: string, serverInstance: http.Server, url: string, status: 'idle' | 'installing' | 'running' | 'failed' }
const runningProjects = new Map();

// Helper: Detect project details
function inspectProject(dirName) {
  const projectPath = path.join(PROJECTS_DIR, dirName);
  const info = {
    name: dirName,
    path: projectPath,
    icon: '📦',
    hasReadme: false,
    readmeSnippet: '',
    isRunning: false,
    status: 'idle',
    url: null
  };

  try {
    const files = fs.readdirSync(projectPath);
    
    if (files.includes('package.json')) {
      info.icon = '⬢';
    } else if (files.includes('app.py') || files.includes('main.py') || files.includes('requirements.txt')) {
      info.icon = '🐍';
    } else if (files.includes('index.html')) {
      info.icon = '🌐';
    }

    const readmeFile = files.find(f => f.toLowerCase() === 'readme.md' || f.toLowerCase() === 'project_overview.md');
    if (readmeFile) {
      info.hasReadme = true;
      try {
        const readmeContent = fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
        info.readmeSnippet = readmeContent.slice(0, 200) + (readmeContent.length > 200 ? '...' : '');
      } catch (err) {}
    }

    if (runningProjects.has(dirName)) {
      const state = runningProjects.get(dirName);
      info.isRunning = state.status === 'running' || state.status === 'installing';
      info.status = state.status;
      info.url = state.url;
    }

  } catch (err) {
    info.icon = '❌';
  }

  return info;
}

// Helper to open project in System Explorer and VS Code
function openSystemTools(projectPath) {
  exec(`code "${projectPath}"`, (err) => {});
  exec(`explorer "${projectPath}"`, (err) => {});
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/projects', (req, res) => {
  try {
    const dirs = fs.readdirSync(PROJECTS_DIR).filter(file => {
      const fullPath = path.join(PROJECTS_DIR, file);
      const isDir = fs.statSync(fullPath).isDirectory();
      
      // Filter out user-requested excluded projects
      const isExcluded = [
        'ProjectHub',
        'Portfolio',
        'Riddles',
        'Night Safe NiZHal',
        'traffic_sim',
        'traffic_simulation'
      ].includes(file);
      
      return isDir && !isExcluded;
    });

    const projects = dirs.map(dir => inspectProject(dir));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read projects', details: err.message });
  }
});

// Activate Endpoint (Launches VS Code, Explorer, and starts all services)
app.post('/api/projects/:name/activate', async (req, res) => {
  const { name } = req.params;
  const projectPath = path.join(PROJECTS_DIR, name);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // 1. Instantly trigger VS Code & Explorer in background
  openSystemTools(projectPath);

  // If already running, re-trigger browser open
  if (runningProjects.has(name)) {
    const state = runningProjects.get(name);
    if (state.status === 'running' && state.url) {
      exec(`start ${state.url}`);
    }
    return res.json({ success: true, message: 'Project is already active', url: state.url, status: state.status });
  }

  const logs = [`[ProjectHub] Activating workspace for ${name}...`, `[ProjectHub] Launched VS Code & File Explorer.`];
  
  const projectState = {
    childProcesses: [],
    logs,
    port: null,
    startTime: new Date(),
    type: 'unknown',
    serverInstance: null,
    url: null,
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

  // Port detector and browser opener
  const parseLogsForPortAndOpen = (dataStr) => {
    if (projectState.url) return;

    // Check localhost, 127.0.0.1, 0.0.0.0, or specific url messages
    const portMatch = dataStr.match(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/) ||
                      dataStr.match(/port\s*(?:is|on)?\s*:?\s*(\d+)/i) ||
                      dataStr.match(/listening on\s*:?\s*(\d+)/i) ||
                      dataStr.match(/http:\/\/localhost:(\d+)/i) ||
                      dataStr.match(/Network:\s*http:\/\/192\.\d+\.\d+\.\d+:(\d+)/i);
                      
    if (portMatch) {
      projectState.port = parseInt(portMatch[1]);
      projectState.url = `http://127.0.0.1:${projectState.port}`;
      projectState.status = 'running';
      projectState.logs.push(`[ProjectHub] Detected active port. Opening web application: ${projectState.url}`);
      
      exec(`start ${projectState.url}`);
    }
  };

  const spawnProcess = (cmd, args, cwd = projectPath, prefix = '') => {
    projectState.logs.push(`[ProjectHub] Spawning: ${cmd} ${args.join(' ')}`);
    projectState.type = 'process';
    projectState.status = 'running';

    const child = spawn(cmd, args, {
      cwd,
      shell: isWindows,
      env: { ...process.env, PORT: undefined }
    });

    projectState.childProcesses.push(child);

    child.stdout.on('data', (data) => {
      const text = data.toString();
      text.split('\n').forEach(line => {
        const t = line.trim();
        if (t) {
          projectState.logs.push(prefix ? `[${prefix}] ${t}` : t);
          parseLogsForPortAndOpen(t);
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
          parseLogsForPortAndOpen(t);
        }
      });
      if (projectState.logs.length > 500) projectState.logs = projectState.logs.slice(-500);
    });

    child.on('close', (code) => {
      projectState.logs.push(`[ProjectHub] Process ${prefix || cmd} exited with code ${code}`);
      
      // Failsafe fallback: If the process failed to run (code !== 0) and we don't have a port URL,
      // boot the static file server so the project can still be loaded!
      if (code !== 0 && !projectState.url && projectState.status !== 'idle') {
        projectState.logs.push(`[ProjectHub] Process failed. Falling back to static web hosting...`);
        launchStaticAppServer();
      } else {
        const activeCount = projectState.childProcesses.filter(c => c.pid !== child.pid && c.exitCode === null).length;
        if (activeCount === 0) {
          projectState.status = 'idle';
        }
      }
    });

    child.on('error', (err) => {
      projectState.logs.push(`[ProjectHub] Process ${prefix || cmd} error: ${err.message}`);
      
      // Failsafe fallback on startup error
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
        
        exec(`start ${url}`);
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
    // 1. STANDARD NPM / VITE FRONTEND PROJECT
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

      // Check if subfolder has package.json (e.g. Chatting application/server)
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
    // 2. NODE JS CODE PROJECT WITHOUT package.json (e.g. Chatbot)
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
    // 3. PYTHON PROJECT (Django, Flask, Streamlit, or script)
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
          if (content.includes('import Flask') || content.includes('from flask')) imports.add('Flask');
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
        // Run Django server on a random port
        const djPort = 8000 + Math.floor(Math.random() * 1000);
        spawnProcess(pythonBin, ['manage.py', 'runserver', `127.0.0.1:${djPort}`]);
      } else if (hasRunPy) {
        spawnProcess(pythonBin, ['run.py']);
      } else if (hasAppPy || hasMainPy) {
        const targetFile = hasAppPy ? 'app.py' : 'main.py';
        try {
          const content = fs.readFileSync(path.join(projectPath, targetFile), 'utf8');
          
          if (content.includes('import streamlit') || content.includes('streamlit')) {
            // Run Streamlit on random port and headless
            const stPort = 8500 + Math.floor(Math.random() * 1000);
            spawnProcess(pythonBin, ['-m', 'streamlit', 'run', targetFile, '--server.port', stPort.toString(), '--server.headless', 'true']);
          } else if (content.includes('FastAPI') || content.includes('import fastapi')) {
            // Run FastAPI/uvicorn on dynamic port
            const pyPort = 8000 + Math.floor(Math.random() * 1000);
            const moduleName = targetFile.replace('.py', '');
            spawnProcess(pythonBin, ['-m', 'uvicorn', `${moduleName}:app`, '--host', '127.0.0.1', '--port', pyPort.toString()]);
          } else {
            // Standard script or Flask with built-in app.run()
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
        projectState.logs.push('[ProjectHub] Installing requirements.txt dependencies via pip (this may take a minute)...');
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
    // 4. STATIC SITE
    launchStaticAppServer();
  } else {
    // 5. ANY OTHER GENERAL FOLDER FALLBACK
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

// Simplified stats API
app.get('/api/stats', (req, res) => {
  try {
    const dirs = fs.readdirSync(PROJECTS_DIR).filter(file => {
      return fs.statSync(path.join(PROJECTS_DIR, file)).isDirectory() && file !== 'ProjectHub';
    });
    res.json({
      totalProjects: dirs.length,
      runningProjects: runningProjects.size
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats error' });
  }
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
