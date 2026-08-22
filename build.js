#!/usr/bin/env node
// ============================================================================
// PROJECT HUB BUILD SCRIPT
// Generates:
// 1. public/projects-data.js (embedded window.PROJECTS_DATA with full source trees)
// 2. public/projects-data.json
// 3. public/live/<project_slug>/ (copies runnable web apps for live in-browser preview)
// ============================================================================

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.resolve('D:\\Projects\\Spraveenmonu');
const PUBLIC_DIR = path.join(__dirname, 'public');
const LIVE_DIR = path.join(PUBLIC_DIR, 'live');
const OUTPUT_JS = path.join(PUBLIC_DIR, 'projects-data.js');
const OUTPUT_JSON = path.join(PUBLIC_DIR, 'projects-data.json');

// Projects excluded from cockpit
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

// Ignored folders during file tree scan
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'venv',
  '.venv',
  '__pycache__',
  '.idea',
  '.vscode',
  '.data'
]);

// Extensions recognized for code viewing
const CODE_EXTENSIONS = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.txt': 'plaintext',
  '.sh': 'shell',
  '.bat': 'shell',
  '.vbs': 'vbscript',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.csv': 'csv'
};

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
  const securityKeywords = ['phishing', 'vulnerability', 'malware', 'firewall', 'ransomware', 'ransomeware', 'cyber', 'port scanner', 'password', 'scanner'];
  if (securityKeywords.some(kw => nameLower.includes(kw))) return 'security';

  if (techStack.some(t => ['Flask', 'FastAPI', 'Django', 'Streamlit', 'Python', 'Pandas', 'Scikit-learn', 'Pygame'].includes(t))) return 'python';
  if (techStack.some(t => ['React', 'Vue', 'Svelte', 'Next.js', 'Vite', 'Express', 'Node.js', 'Socket.IO'].includes(t))) return 'webapp';
  if (files.includes('index.html')) return 'static';

  return 'other';
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

function getProjectDescription(projectPath, files) {
  const readmeFile = files.find(f => /^readme.*\.md$/i.test(f) || /^project_overview\.md$/i.test(f));
  if (readmeFile) {
    try {
      const content = fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#') || line.startsWith('!') || line.startsWith('[') || line.startsWith('---')) continue;
        const clean = line.replace(/[#*`~_\[\]()]/g, '').replace(/<[^>]*>/g, '').trim();
        if (clean.length > 15) return clean.slice(0, 160) + (clean.length > 160 ? '...' : '');
      }
    } catch (e) {}
  }
  return null;
}

function getReadmeContent(projectPath, files) {
  const readmeFile = files.find(f => /^readme.*\.md$/i.test(f) || /^project_overview\.md$/i.test(f));
  if (readmeFile) {
    try {
      return fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
    } catch (e) {}
  }
  return null;
}

// Recursively scan and gather source files for in-browser Code Viewer
function scanProjectSourceFiles(projectPath, relPrefix = '') {
  const fileTree = [];
  const entries = fs.readdirSync(projectPath, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(projectPath, entry.name);
    const relPath = path.join(relPrefix, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      // Avoid deep dist/build trees in source view
      if (entry.name === 'dist' || entry.name === 'build') continue;
      fileTree.push(...scanProjectSourceFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const stat = fs.statSync(fullPath);

      // Only include text code files under 300KB
      if (CODE_EXTENSIONS[ext] && stat.size < 300000) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          fileTree.push({
            path: relPath,
            name: entry.name,
            size: stat.size,
            language: CODE_EXTENSIONS[ext] || 'plaintext',
            content
          });
        } catch (e) {}
      }
    }
  }

  return fileTree;
}

// Copy runnable apps to public/live/<slug>
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (IGNORED_DIRS.has(element)) return;
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function deployLiveApp(dirName, projectPath, files) {
  const slug = dirName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const targetDir = path.join(LIVE_DIR, slug);

  // 1. If project has a dist folder with index.html (Vite/React builds)
  if (fs.existsSync(path.join(projectPath, 'dist', 'index.html'))) {
    copyFolderSync(path.join(projectPath, 'dist'), targetDir);
    return `/live/${slug}/index.html`;
  }

  // 2. If project has a root index.html (Pure HTML/CSS/JS)
  if (files.includes('index.html')) {
    copyFolderSync(projectPath, targetDir);
    return `/live/${slug}/index.html`;
  }

  // 3. If project has frontend/index.html (AI phishing url detector)
  if (fs.existsSync(path.join(projectPath, 'frontend', 'index.html'))) {
    copyFolderSync(path.join(projectPath, 'frontend'), targetDir);
    return `/live/${slug}/index.html`;
  }

  return null;
}

function build() {
  console.log('🚀 ProjectHub Deep Build — Synchronizing workspace code for real-world deployment...');
  console.log(`📂 Source: ${PROJECTS_DIR}`);

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('⚠️ Running in cloud build environment (D:\\Projects does not exist).');
    if (fs.existsSync(OUTPUT_JS)) {
      console.log('✅ Preserving existing bundled projects data.');
      return;
    }
    console.warn('Generating default placeholder.');
    fs.writeFileSync(OUTPUT_JS, 'window.PROJECTS_DATA = { projects: [] };');
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ projects: [] }));
    return;
  }

  if (!fs.existsSync(LIVE_DIR)) fs.mkdirSync(LIVE_DIR, { recursive: true });

  const dirs = fs.readdirSync(PROJECTS_DIR).filter(file => {
    try {
      const fullPath = path.join(PROJECTS_DIR, file);
      return fs.statSync(fullPath).isDirectory() && !EXCLUDED_PROJECTS.has(file);
    } catch (e) {
      return false;
    }
  });

  console.log(`📁 Found ${dirs.length} projects to bundle.\n`);

  let totalCodeFiles = 0;

  const projects = dirs.map(dirName => {
    const projectPath = path.join(PROJECTS_DIR, dirName);
    const files = fs.readdirSync(projectPath);
    const techStack = detectTechStack(projectPath, files);
    const category = detectCategory(dirName, techStack, files);
    const description = getProjectDescription(projectPath, files);
    const readme = getReadmeContent(projectPath, files);
    const sourceFiles = scanProjectSourceFiles(projectPath);
    const liveUrl = deployLiveApp(dirName, projectPath, files);

    totalCodeFiles += sourceFiles.length;

    console.log(`  📦 ${dirName}`);
    console.log(`     Category: [${category}] | Stack: ${techStack.join(', ') || 'HTML/CSS'}`);
    console.log(`     Source Files: ${sourceFiles.length} files | Live URL: ${liveUrl || 'None'}\n`);

    return {
      name: dirName,
      slug: dirName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: getCategoryIcon(category),
      category,
      techStack,
      description,
      readme,
      hasReadme: !!readme,
      liveUrl,
      sourceFiles,
      status: 'idle'
    };
  });

  const payload = {
    projects,
    buildTime: new Date().toISOString(),
    totalProjects: projects.length,
    totalCodeFiles,
    categories: {
      webapp: projects.filter(p => p.category === 'webapp').length,
      python: projects.filter(p => p.category === 'python').length,
      security: projects.filter(p => p.category === 'security').length,
      static: projects.filter(p => p.category === 'static').length,
      other: projects.filter(p => p.category === 'other').length
    }
  };

  // 1. Write JavaScript module (synchronous load in browser, immune to fetch/routing errors)
  const jsContent = `/* Generated by ProjectHub Build at ${payload.buildTime} */\nwindow.PROJECTS_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_JS, jsContent);

  // 2. Write JSON format as well
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2));

  console.log(`✨ Build Complete!`);
  console.log(`📄 Generated: ${OUTPUT_JS}`);
  console.log(`📄 Generated: ${OUTPUT_JSON}`);
  console.log(`📊 ${projects.length} projects bundled with ${totalCodeFiles} source code files for live in-browser manipulation!`);
}

build();
