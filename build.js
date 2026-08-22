#!/usr/bin/env node
// ============================================================================
// BUILD SCRIPT — Pre-generates static project data for Vercel deployment
// Run: node build.js
// Output: public/projects-data.json
// ============================================================================

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.resolve('D:\\Projects\\Spraveenmonu');
const OUTPUT_FILE = path.join(__dirname, 'public', 'projects-data.json');

// Projects to hide from the dashboard (mirrors server.js EXCLUDED_PROJECTS)
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

// ============================================================================
// DETECTION HELPERS (same logic as server.js)
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
  const readmeFile = files.find(f => /^readme\.md$/i.test(f) || /^project_overview\.md$/i.test(f));
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
  const readmeFile = files.find(f => /^readme\.md$/i.test(f) || /^project_overview\.md$/i.test(f));
  if (readmeFile) {
    try {
      return fs.readFileSync(path.join(projectPath, readmeFile), 'utf8');
    } catch (e) {}
  }
  return null;
}

// ============================================================================
// MAIN BUILD
// ============================================================================

function build() {
  console.log('🔨 ProjectHub Build — Generating static project data...');
  console.log(`📂 Scanning: ${PROJECTS_DIR}`);

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`❌ Projects directory not found: ${PROJECTS_DIR}`);
    console.log('⚠️  Generating empty projects-data.json');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ projects: [], buildTime: new Date().toISOString() }, null, 2));
    return;
  }

  const dirs = fs.readdirSync(PROJECTS_DIR).filter(file => {
    try {
      const fullPath = path.join(PROJECTS_DIR, file);
      return fs.statSync(fullPath).isDirectory() && !EXCLUDED_PROJECTS.has(file);
    } catch (e) {
      return false;
    }
  });

  console.log(`📁 Found ${dirs.length} projects (after exclusions)\n`);

  const projects = dirs.map(dirName => {
    const projectPath = path.join(PROJECTS_DIR, dirName);
    const info = {
      name: dirName,
      icon: 'package',
      category: 'other',
      techStack: [],
      description: null,
      readme: null,
      hasReadme: false,
      status: 'idle',
      url: null
    };

    try {
      const files = fs.readdirSync(projectPath);
      const techStack = detectTechStack(projectPath, files);
      const category = detectCategory(dirName, techStack, files);
      const description = getProjectDescription(projectPath, files);
      const readme = getReadmeContent(projectPath, files);

      info.techStack = techStack;
      info.category = category;
      info.icon = getCategoryIcon(category);
      info.description = description;
      info.readme = readme;
      info.hasReadme = !!readme;

      console.log(`  ✅ ${dirName} [${category}] — ${techStack.join(', ') || 'no stack detected'}`);
    } catch (err) {
      info.icon = 'alert-circle';
      console.log(`  ⚠️  ${dirName} — Error: ${err.message}`);
    }

    return info;
  });

  const output = {
    projects,
    buildTime: new Date().toISOString(),
    totalProjects: projects.length,
    categories: {
      webapp: projects.filter(p => p.category === 'webapp').length,
      python: projects.filter(p => p.category === 'python').length,
      security: projects.filter(p => p.category === 'security').length,
      static: projects.filter(p => p.category === 'static').length,
      other: projects.filter(p => p.category === 'other').length
    }
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✨ Build complete!`);
  console.log(`📄 Output: ${OUTPUT_FILE}`);
  console.log(`📊 ${output.totalProjects} projects | webapp:${output.categories.webapp} python:${output.categories.python} security:${output.categories.security} static:${output.categories.static}`);
}

build();
