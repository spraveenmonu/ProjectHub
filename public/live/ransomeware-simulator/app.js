// ============================================================
// Ransomware Defense Dashboard — Enhanced Application Logic
// FOR EDUCATIONAL USE ONLY — No encryption or malicious code
// ============================================================

(function () {
  'use strict';

  // ── State ──
  let activeSection = 'hero';
  let activeKillChainStage = 0;
  let simRunning = false;
  let simPaused = false;
  let simTimer = null;
  let simIndex = 0;
  let simFileStates = [];



  // ── Initialize ──
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initKillChain();
    initSimulation();
    initProfiles();
    initIncidentResponse();
    initDefenseStrategies();

  });

  // ═══════════════════════════════════════════════════════════
  // PARTICLE BACKGROUND
  // ═══════════════════════════════════════════════════════════
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 59, 59, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 107, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }



  // ═══════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════
  function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navigateToSection(link.dataset.section);
      });
    });
  }

  function navigateToSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
      section.classList.add('active');


    }

    activeSection = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════
  // KILL CHAIN
  // ═══════════════════════════════════════════════════════════
  function initKillChain() {
    renderKillChainTimeline();
    renderKillChainDetail(0);
  }

  function renderKillChainTimeline() {
    const timeline = document.getElementById('killchain-timeline');
    timeline.innerHTML = KILL_CHAIN_STAGES.map((stage, i) => `
      <div class="killchain-stage animate-in ${i === 0 ? 'active' : ''}" data-index="${i}" id="kc-stage-${i}">
        <div class="stage-num">Stage ${stage.id}</div>
        <span class="stage-icon">${stage.icon}</span>
        <div class="stage-name">${stage.name}</div>
      </div>
    `).join('');

    timeline.querySelectorAll('.killchain-stage').forEach(el => {
      el.addEventListener('click', () => {
        setActiveKillChainStage(parseInt(el.dataset.index));
      });
    });
  }

  function setActiveKillChainStage(index) {
    activeKillChainStage = index;
    document.querySelectorAll('.killchain-stage').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    renderKillChainDetail(index);
  }

  function renderKillChainDetail(index) {
    const stage = KILL_CHAIN_STAGES[index];
    const detail = document.getElementById('killchain-detail');
    detail.innerHTML = `
      <div class="killchain-detail">
        <div class="killchain-info">
          <h3>${stage.icon} ${stage.name}</h3>
          <div class="mitre-tag">🔗 ${stage.mitre}</div>
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Typical Duration</div>
              <div class="meta-value">${stage.duration}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Risk Level</div>
              <div class="meta-value"><span class="risk-badge ${stage.riskLevel}">${stage.riskLevel}</span></div>
            </div>
          </div>
          <p class="description">${stage.description}</p>
          <div class="killchain-list">
            <h4>⚔️ Attack Techniques</h4>
            <ul>
              ${stage.techniques.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="killchain-info">
          <div class="killchain-list defense">
            <h4>🛡️ Recommended Defenses</h4>
            <ul>
              ${stage.defenses.map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // ATTACK SIMULATION
  // ═══════════════════════════════════════════════════════════
  function initSimulation() {
    resetSimulation();
    renderFileGrid();

    document.getElementById('btn-start-sim').addEventListener('click', startSimulation);
    document.getElementById('btn-pause-sim').addEventListener('click', togglePauseSimulation);
    document.getElementById('btn-reset-sim').addEventListener('click', resetSimulation);
    document.getElementById('sim-speed').addEventListener('input', (e) => {
      document.getElementById('speed-label').textContent = e.target.value + 'x';
    });
  }

  function renderFileGrid() {
    const grid = document.getElementById('file-grid');
    grid.innerHTML = simFileStates.map((file, i) => `
      <div class="file-card animate-in ${file.status !== 'safe' ? file.status : ''}" data-index="${i}" id="file-${i}">
        <span class="file-icon">${FILE_TYPE_ICONS[file.type] || '📄'}</span>
        <div class="file-info">
          <div class="file-name" title="${file.name}">${file.name}</div>
          <div class="file-meta">
            <span>${file.size}</span>
            <span>${file.path}</span>
          </div>
        </div>
        <span class="file-status ${file.status}">${file.status}</span>
      </div>
    `).join('');
  }

  function startSimulation() {
    if (simRunning && !simPaused) return;

    if (simPaused) {
      simPaused = false;
      document.getElementById('btn-pause-sim').innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pause`;
    } else {
      resetSimulation();
      simIndex = 0;
    }

    simRunning = true;
    document.getElementById('btn-start-sim').disabled = true;
    document.getElementById('btn-pause-sim').disabled = false;

    runSimStep();
  }

  function runSimStep() {
    if (!simRunning || simPaused || simIndex >= simFileStates.length) {
      if (simIndex >= simFileStates.length) {
        simRunning = false;
        document.getElementById('btn-start-sim').disabled = false;
        document.getElementById('btn-pause-sim').disabled = true;
      }
      return;
    }

    simFileStates[simIndex].status = 'targeted';
    updateFileCard(simIndex);
    updateSimProgress();

    const speed = parseInt(document.getElementById('sim-speed').value);
    const delay = Math.max(200, 1200 - (speed * 200));

    const currentIndex = simIndex;
    simTimer = setTimeout(() => {
      simFileStates[currentIndex].status = 'locked';
      updateFileCard(currentIndex);
      simIndex++;
      updateSimProgress();
      runSimStep();
    }, delay);
  }

  function togglePauseSimulation() {
    if (!simRunning) return;
    simPaused = !simPaused;

    const btn = document.getElementById('btn-pause-sim');
    if (simPaused) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Resume`;
    } else {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pause`;
    }

    document.getElementById('btn-start-sim').disabled = !simPaused;

    if (!simPaused) {
      runSimStep();
    } else {
      clearTimeout(simTimer);
    }
  }

  function resetSimulation() {
    simRunning = false;
    simPaused = false;
    simIndex = 0;
    clearTimeout(simTimer);

    simFileStates = SIMULATED_FILES.map(f => ({ ...f }));

    document.getElementById('btn-start-sim').disabled = false;
    document.getElementById('btn-pause-sim').disabled = true;
    document.getElementById('btn-pause-sim').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      Pause`;

    renderFileGrid();
    updateSimProgress();
  }

  function updateFileCard(index) {
    const card = document.getElementById(`file-${index}`);
    if (!card) return;

    const file = simFileStates[index];
    card.className = `file-card ${file.status}`;

    const statusEl = card.querySelector('.file-status');
    statusEl.className = `file-status ${file.status}`;
    statusEl.textContent = file.status;
  }

  function updateSimProgress() {
    const locked = simFileStates.filter(f => f.status === 'locked').length;
    const total = simFileStates.length;
    const pct = Math.round((locked / total) * 100);

    document.getElementById('sim-counter').textContent = `${locked} / ${total}`;
    document.getElementById('sim-pct').textContent = `${pct}%`;

    // Update ring
    const ring = document.getElementById('sim-ring-fill');
    if (ring) {
      const circumference = 2 * Math.PI * 18;
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference * (1 - pct / 100);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RANSOMWARE PROFILES
  // ═══════════════════════════════════════════════════════════
  function initProfiles() {
    const grid = document.getElementById('profiles-grid');
    grid.innerHTML = RANSOMWARE_PROFILES.map((profile, i) => `
      <div class="profile-card animate-in" style="--profile-color: ${profile.color}; --profile-color-faint: ${profile.color}11;" id="profile-${i}">
        <div class="profile-header">
          <div class="name">
            <span>${profile.icon}</span>
            ${profile.name}
          </div>
          <span class="year">${profile.year}</span>
        </div>
        ${profile.killed
          ? '<span class="profile-killed">✓ Disrupted</span>'
          : '<span class="profile-active">⚡ Active Threat</span>'
        }
        <p class="profile-desc">${profile.description}</p>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="stat-label">Encryption</div>
            <div class="stat-value">${profile.encryption}</div>
          </div>
          <div class="profile-stat">
            <div class="stat-label">Ransom</div>
            <div class="stat-value">${profile.ransom}</div>
          </div>
          <div class="profile-stat">
            <div class="stat-label">Entry Vector</div>
            <div class="stat-value">${profile.vector}</div>
          </div>
          <div class="profile-stat">
            <div class="stat-label">Attribution</div>
            <div class="stat-value">${profile.attribution}</div>
          </div>
        </div>
        <div class="profile-lesson">
          <strong>🎓 Key Lesson:</strong> ${profile.lesson}
        </div>
      </div>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════
  // INCIDENT RESPONSE
  // ═══════════════════════════════════════════════════════════
  function initIncidentResponse() {
    renderIROverview();
    renderIRPhases();
  }

  function renderIROverview() {
    const container = document.getElementById('ir-overview');
    container.innerHTML = INCIDENT_RESPONSE_STEPS.map((phase, pi) => {
      const completed = phase.steps.filter(s => s.checked).length;
      return `
        <div class="ir-overview-item animate-in">
          <span class="ir-overview-dot" style="background: ${phase.color}; box-shadow: 0 0 8px ${phase.color}66;"></span>
          <span class="ir-overview-label">${phase.phase}</span>
          <span class="ir-overview-count" style="color: ${phase.color};" id="ir-ov-${pi}">${completed}/${phase.steps.length}</span>
        </div>
      `;
    }).join('');
  }

  function renderIRPhases() {
    const container = document.getElementById('ir-phases');
    container.innerHTML = INCIDENT_RESPONSE_STEPS.map((phase, pi) => `
      <div class="ir-phase ${pi === 0 ? 'open' : ''}" id="ir-phase-${pi}">
        <div class="ir-phase-header" data-phase="${pi}">
          <div class="phase-title">
            <span class="phase-icon">${phase.icon}</span>
            <span style="color: ${phase.color}">${phase.phase}</span>
          </div>
          <div class="phase-progress" id="ir-progress-${pi}">0 / ${phase.steps.length}</div>
          <span class="chevron">▼</span>
        </div>
        <div class="ir-phase-body">
          <ul class="ir-steps">
            ${phase.steps.map((step, si) => `
              <li class="ir-step" id="ir-step-${pi}-${si}">
                <div class="ir-checkbox" data-phase="${pi}" data-step="${si}" id="ir-check-${pi}-${si}">✓</div>
                <span class="ir-step-text">${step.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.ir-phase-header').forEach(header => {
      header.addEventListener('click', () => {
        header.closest('.ir-phase').classList.toggle('open');
      });
    });

    container.querySelectorAll('.ir-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const pi = parseInt(checkbox.dataset.phase);
        const si = parseInt(checkbox.dataset.step);
        toggleIRStep(pi, si);
      });
    });
  }

  function toggleIRStep(phaseIndex, stepIndex) {
    const step = INCIDENT_RESPONSE_STEPS[phaseIndex].steps[stepIndex];
    step.checked = !step.checked;

    const checkbox = document.getElementById(`ir-check-${phaseIndex}-${stepIndex}`);
    const stepEl = document.getElementById(`ir-step-${phaseIndex}-${stepIndex}`);

    checkbox.classList.toggle('checked', step.checked);
    stepEl.classList.toggle('completed', step.checked);

    const phase = INCIDENT_RESPONSE_STEPS[phaseIndex];
    const completed = phase.steps.filter(s => s.checked).length;
    document.getElementById(`ir-progress-${phaseIndex}`).textContent = `${completed} / ${phase.steps.length}`;

    // Update overview
    const ov = document.getElementById(`ir-ov-${phaseIndex}`);
    if (ov) ov.textContent = `${completed}/${phase.steps.length}`;
  }

  // ═══════════════════════════════════════════════════════════
  // DEFENSE STRATEGIES
  // ═══════════════════════════════════════════════════════════
  function initDefenseStrategies() {
    const grid = document.getElementById('defense-grid');
    grid.innerHTML = DEFENSE_STRATEGIES.map((strategy, i) => `
      <div class="defense-card animate-in" id="defense-${i}">
        <div class="defense-card-header">
          <span class="defense-icon">${strategy.icon}</span>
          <span class="risk-badge ${strategy.priority}">${strategy.priority}</span>
        </div>
        <h3>${strategy.title}</h3>
        <p class="defense-desc">${strategy.description}</p>
        <ul class="defense-details">
          ${strategy.details.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

})();
