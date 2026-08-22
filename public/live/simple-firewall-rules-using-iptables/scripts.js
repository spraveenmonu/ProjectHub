// ═══ STATE ═══
let isPaused = false, isScanning = false, isAborted = false, startTime = Date.now(), eventCount = 0;
let blockedIPs = [
    { ip: '184.102.250.61', reason: 'Telnet probe', geo: 'BR', time: '11:09:45' },
    { ip: '3.147.31.252', reason: 'Telnet probe', geo: 'UA', time: '11:09:43' }
];
let rules = [
    { name: 'Allow HTTPS', chain: 'INPUT', port: '443', action: 'ACCEPT' },
    { name: 'Block Telnet', chain: 'INPUT', port: '23', action: 'DROP' }
];
let attackStats = {}, sourceStats = {}, geoStats = {}, trafficData = [];
const ATTACKS = ['Telnet probe','Port scan','SQL injection','SSH brute force','DDoS sync','HTTPS probe','DNS amplify'];
const GEOS = [['🇺🇸','US'],['🇳🇬','NG'],['🇰🇷','KR'],['🇨🇳','CN'],['🇩🇪','DE'],['🇷🇺','RU'],['🇮🇳','IN'],['🇧🇷','BR']];
const SERVICES = {21:'FTP',22:'SSH',25:'SMTP',53:'DNS',80:'HTTP',110:'POP3',143:'IMAP',443:'HTTPS',993:'IMAPS',3306:'MySQL',5432:'Postgres',8080:'HTTP-Alt',8443:'HTTPS-Alt'};
const RISK = {21:'HIGH',22:'CRITICAL',25:'MEDIUM',53:'LOW',80:'LOW',110:'HIGH',143:'HIGH',443:'LOW',993:'LOW',3306:'CRITICAL',5432:'CRITICAL',8080:'MEDIUM',8443:'MEDIUM'};

// ═══ NAVIGATION ═══
function showView(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById('view-'+id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-'+id).classList.add('active');
    if (id === 'def') updateExport();
}

// ═══ TOAST ═══
function toast(title, msg, color) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = color || 'var(--crit)';
    t.innerHTML = `<div class="toast-title">${title}</div><div>${msg}</div>`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4500);
}

// ═══ DASHBOARD STREAM ═══
function toggleStream() {
    isPaused = !isPaused;
    document.getElementById('scan-text').textContent = isPaused ? 'RESUME' : 'PAUSE';
    document.getElementById('scan-icon').textContent = isPaused ? '▶' : '⏸';
}

function clearStream() { document.getElementById('attack-stream').innerHTML = ''; }

function filterStream() {
    const q = document.getElementById('stream-filter').value.toLowerCase();
    document.querySelectorAll('#attack-stream tr').forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function addLiveAttack() {
    if (isPaused) return;
    const s = document.getElementById('attack-stream'); if (!s) return;
    const ip = `${Math.floor(Math.random()*223+1)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const g = GEOS[Math.floor(Math.random()*GEOS.length)];
    const port = Math.floor(Math.random()*65535);
    const type = ATTACKS[Math.floor(Math.random()*ATTACKS.length)];
    const sevs = ['crit','high','med','clean'];
    const sev = sevs[Math.floor(Math.random()*sevs.length)];
    const isBlocked = blockedIPs.some(b => b.ip === ip);
    
    eventCount++;
    attackStats[type] = (attackStats[type]||0) + 1;
    sourceStats[ip] = (sourceStats[ip]||0) + 1;
    geoStats[g[1]] = (geoStats[g[1]]||0) + 1;

    const row = document.createElement('tr');
    row.innerHTML = `<td><div class="dot ${sev==='crit'?'pulse':''}" style="width:6px;height:6px;border-radius:50%;background:var(--${sev});"></div></td>
        <td>${ip}</td><td>${g[0]} ${g[1]}</td><td>:${port}</td><td style="color:var(--med)">TCP</td><td>${type}</td>
        <td><span class="severity-tag tag-${sev}">${sev.toUpperCase()}</span></td>
        <td>${isBlocked ? '<span style="color:var(--text-dim)">BLOCKED</span>' : `<button class="action-btn ${sev==='crit'||sev==='high'?'btn-block':''}" onclick="blockIP('${ip}','${type}','${g[1]}')">${sev==='crit'||sev==='high'?'BLOCK':'ALLOW'}</button>`}</td>`;
    s.prepend(row);
    if (s.children.length > 50) s.lastElementChild.remove();

    if (sev === 'crit') toast('⚠ Critical Threat', `${type} from ${ip}`, 'var(--crit)');
    updateCharts();
}

function updateCharts() {
    renderBarChart('chart-attacks', attackStats, 'var(--crit)');
    renderBarChart('chart-sources', sourceStats, 'var(--high)');
    renderGeoChart();
}

function renderBarChart(id, data, color) {
    const el = document.getElementById(id); if (!el) return;
    const sorted = Object.entries(data).sort((a,b) => b[1]-a[1]).slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    el.innerHTML = sorted.map(([k,v]) => `<div class="bar-row"><div class="bar-label">${k.substring(0,14)}</div><div class="bar-track"><div class="bar-fill" style="width:${(v/max)*100}%;background:${color};"></div></div><div style="width:25px;text-align:right;">${v}</div></div>`).join('');
}

function renderGeoChart() {
    const el = document.getElementById('geo-chart'); if (!el) return;
    const sorted = Object.entries(geoStats).sort((a,b) => b[1]-a[1]).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    const colors = ['var(--clean)','var(--med)','var(--high)','var(--info)','var(--crit)','var(--text-dim)'];
    el.innerHTML = sorted.map(([k,v],i) => `<div class="bar-row"><div class="bar-label" style="width:40px;">${k}</div><div class="bar-track"><div class="bar-fill" style="width:${(v/max)*100}%;background:${colors[i%6]};"></div></div><div style="width:25px;text-align:right;">${v}</div></div>`).join('');
}

// ═══ BLOCK/UNBLOCK ═══
function blockIP(ip, reason, geo) {
    if (blockedIPs.find(b => b.ip === ip)) return;
    blockedIPs.unshift({ ip, reason, geo, time: new Date().toLocaleTimeString('en-GB') });
    renderBlocked();
    toast('🛡️ IP Blocked', `${ip} added to blocklist`, 'var(--clean)');
}

function unblockIP(i) {
    const ip = blockedIPs[i].ip;
    blockedIPs.splice(i, 1);
    renderBlocked();
    toast('🔓 IP Unblocked', `${ip} removed from blocklist`, 'var(--med)');
}

function manualBlockIP() {
    const ip = document.getElementById('manual-ip').value;
    const reason = document.getElementById('manual-reason').value || 'Manual Block';
    if (!ip) return;
    blockIP(ip, reason, '??');
    document.getElementById('manual-ip').value = '';
    document.getElementById('manual-reason').value = '';
}

function renderBlocked() {
    const el = document.getElementById('blocked-list'); if (!el) return;
    document.getElementById('blocked-count').textContent = blockedIPs.length;
    document.getElementById('tb-blocked').textContent = blockedIPs.length;
    el.innerHTML = blockedIPs.map((b,i) => `<div class="blocked-item"><div class="blocked-info"><strong>${b.ip}</strong><span>${b.reason} • ${b.geo} • ${b.time}</span></div><div class="unblock-link" onclick="unblockIP(${i})">unblock</div></div>`).join('');
}

// ═══ QUICK HARDENING ═══
function quickHarden(type) {
    const templates = {
        ssh: [{ name: 'Block SSH', chain: 'INPUT', port: '22', action: 'DROP' }],
        telnet: [{ name: 'Kill Telnet', chain: 'INPUT', port: '23', action: 'DROP' }],
        mysql: [{ name: 'Guard MySQL', chain: 'INPUT', port: '3306', action: 'DROP' }],
        all: [
            { name: 'Drop Telnet', chain: 'INPUT', port: '23', action: 'DROP' },
            { name: 'Drop FTP', chain: 'INPUT', port: '21', action: 'DROP' },
            { name: 'Drop SSH External', chain: 'INPUT', port: '22', action: 'DROP' },
            { name: 'Drop MySQL External', chain: 'INPUT', port: '3306', action: 'DROP' }
        ]
    };
    (templates[type] || []).forEach(r => {
        if (!rules.find(x => x.port === r.port && x.action === r.action)) rules.push(r);
    });
    renderPerimeter(); updateExport();
    toast('🔒 Hardened', `${type.toUpperCase()} hardening applied`, 'var(--clean)');
}

// ═══ EXPORT ═══
function exportScript() {
    let s = "#!/bin/bash\n# Sentinel Firewall Export — " + new Date().toLocaleString() + "\n\niptables -F SENTINEL 2>/dev/null || iptables -N SENTINEL\niptables -I INPUT -j SENTINEL\n\n";
    blockedIPs.forEach(b => s += `iptables -A SENTINEL -s ${b.ip} -j DROP  # ${b.reason}\n`);
    s += "\n";
    rules.forEach(r => s += `iptables -A ${r.chain} -p tcp --dport ${r.port} -j ${r.action}  # ${r.name}\n`);
    const blob = new Blob([s], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sentinel_rules.sh'; a.click();
    toast('📄 Exported', 'Firewall script downloaded', 'var(--clean)');
}

// ═══ RECON ENGINE ═══
async function probe(host, port) {
    return new Promise(r => {
        const t0 = performance.now();
        const img = new Image();
        const to = setTimeout(() => { img.src=''; r(2000); }, 1500);
        img.onload = () => { clearTimeout(to); r(performance.now()-t0); };
        img.onerror = () => { clearTimeout(to); const d=performance.now()-t0; r(d<5?-1:d); };
        img.src = `http://${host}:${port}/p_${Math.random()}`;
    });
}

function loadPreset(type) {
    const presets = {
        web: '80, 443, 8080, 8443',
        mail: '25, 110, 143, 993, 995',
        db: '3306, 5432, 1433, 27017, 6379',
        full: '21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 3306, 5432, 8080'
    };
    document.getElementById('target-ports').value = presets[type] || '';
}

async function startScan() {
    if (isScanning) return;
    const host = document.getElementById('target-host').value;
    const ports = document.getElementById('target-ports').value.split(',').map(p=>parseInt(p.trim())).filter(p=>!isNaN(p));
    if (!ports.length) return;
    isScanning = true; isAborted = false;
    document.getElementById('start-recon-btn').style.display = 'none';
    document.getElementById('stop-recon-btn').style.display = 'block';
    document.getElementById('recon-results').innerHTML = '';
    let nO=0, nC=0, nF=0;
    const t0 = Date.now();
    const timer = setInterval(() => {
        if (!isScanning) return clearInterval(timer);
        document.getElementById('val-time').textContent = ((Date.now()-t0)/1000).toFixed(1)+'s';
    }, 100);
    const suggestions = [];
    for (let i=0; i<ports.length; i++) {
        if (isAborted) break;
        const port = ports[i];
        document.getElementById('recon-pct').textContent = Math.round(((i+1)/ports.length)*100)+'%';
        document.getElementById('recon-status').textContent = 'PROBING: '+port;
        const lat = await probe(host, port);
        const status = lat===-1?'CLOSED':(lat<1000?'OPEN':'FILTERED');
        if (status==='OPEN') nO++; else if (status==='CLOSED') nC++; else nF++;
        document.getElementById('val-open').textContent = nO;
        document.getElementById('val-closed').textContent = nC;
        document.getElementById('val-filtered').textContent = nF;
        const risk = RISK[port] || 'UNKNOWN';
        const riskColor = risk==='CRITICAL'?'crit':risk==='HIGH'?'high':risk==='MEDIUM'?'med':'clean';
        const row = document.createElement('tr');
        row.innerHTML = `<td>${port}</td><td>${SERVICES[port]||'Custom'}</td><td><span class="severity-tag tag-${status==='OPEN'?'clean':'crit'}">${status}</span></td><td>${lat.toFixed(1)}ms</td><td><span class="severity-tag tag-${riskColor}">${risk}</span></td><td>${status==='OPEN'?`<button class="action-btn btn-block" onclick="blockPort(${port})">Block</button>`:'-'}</td>`;
        document.getElementById('recon-results').prepend(row);
        if (status === 'OPEN' && (risk==='CRITICAL'||risk==='HIGH')) {
            suggestions.push({ port, service: SERVICES[port]||'Custom', risk });
        }
    }
    isScanning = false;
    document.getElementById('start-recon-btn').style.display = 'block';
    document.getElementById('stop-recon-btn').style.display = 'none';
    document.getElementById('recon-status').textContent = isAborted?'ABORTED':'COMPLETE';
    renderSuggestions(suggestions);
}

function stopScan() { isAborted = true; }

function blockPort(port) {
    const name = `Block ${SERVICES[port]||'Port '+port}`;
    if (!rules.find(r=>r.port===String(port)&&r.action==='DROP')) {
        rules.push({ name, chain:'INPUT', port:String(port), action:'DROP' });
        renderPerimeter();
        toast('🛡️ Port Blocked', `Port ${port} added to perimeter`, 'var(--clean)');
    }
}

function renderSuggestions(sugs) {
    const el = document.getElementById('suggested-rules');
    if (!sugs.length) { el.innerHTML = '<div style="color:var(--clean);">No high-risk ports found.</div>'; return; }
    el.innerHTML = sugs.map(s => `<div style="padding:8px;border:1px solid var(--border);border-radius:4px;margin-bottom:6px;"><div style="color:var(--crit);font-weight:700;">${s.service} :${s.port}</div><div style="font-size:10px;color:var(--text-dim);">Risk: ${s.risk}</div><button class="action-btn btn-block" style="margin-top:4px;" onclick="blockPort(${s.port})">Add DROP Rule</button></div>`).join('');
}

// ═══ PERIMETER DEFENSE ═══
function renderPerimeter() {
    const el = document.getElementById('perimeter-rules-list'); if (!el) return;
    el.innerHTML = rules.map((r,i) => `<tr><td><strong>${r.name}</strong></td><td><code style="color:var(--med);font-size:10px;">iptables -A ${r.chain} -p tcp --dport ${r.port} -j ${r.action}</code></td><td><span class="severity-tag tag-clean">ACTIVE</span></td><td><button class="action-btn btn-block" onclick="removeRule(${i})">REMOVE</button></td></tr>`).join('');
    document.getElementById('nav-badge-rules').textContent = rules.length;
    document.getElementById('stat-total-rules').textContent = rules.length;
    document.getElementById('stat-drop').textContent = rules.filter(r=>r.action==='DROP').length;
    document.getElementById('stat-accept').textContent = rules.filter(r=>r.action==='ACCEPT').length;
    updateExport();
}

function addPerimeterRule() {
    const n=document.getElementById('rule-name').value, c=document.getElementById('rule-chain').value, p=document.getElementById('rule-port').value, a=document.getElementById('rule-action').value;
    if (!n||!p) return toast('⚠ Error', 'Name and Port required', 'var(--high)');
    rules.unshift({name:n, chain:c, port:p, action:a});
    renderPerimeter(); document.getElementById('rule-name').value=''; document.getElementById('rule-port').value='';
    toast('✅ Rule Deployed', `${n} committed`, 'var(--clean)');
}

function removeRule(i) { rules.splice(i,1); renderPerimeter(); }

function applyTemplate(type) {
    const t = {
        webserver: [{name:'Allow HTTP',chain:'INPUT',port:'80',action:'ACCEPT'},{name:'Allow HTTPS',chain:'INPUT',port:'443',action:'ACCEPT'},{name:'Block FTP',chain:'INPUT',port:'21',action:'DROP'}],
        database: [{name:'Block MySQL Ext',chain:'INPUT',port:'3306',action:'DROP'},{name:'Block Postgres Ext',chain:'INPUT',port:'5432',action:'DROP'}],
        ssh: [{name:'Block SSH',chain:'INPUT',port:'22',action:'DROP'}],
        paranoid: [{name:'Drop Telnet',chain:'INPUT',port:'23',action:'DROP'},{name:'Drop FTP',chain:'INPUT',port:'21',action:'DROP'},{name:'Drop SSH',chain:'INPUT',port:'22',action:'DROP'},{name:'Drop MySQL',chain:'INPUT',port:'3306',action:'DROP'},{name:'Drop SMTP',chain:'INPUT',port:'25',action:'DROP'}]
    };
    (t[type]||[]).forEach(r => { if(!rules.find(x=>x.port===r.port&&x.action===r.action)) rules.push(r); });
    renderPerimeter(); toast('📋 Template Applied', type+' rules deployed', 'var(--clean)');
}

function updateExport() {
    const el = document.getElementById('export-terminal'); if (!el) return;
    let s = "#!/bin/bash\n# Sentinel Export — "+new Date().toLocaleString()+"\niptables -F\n\n";
    rules.forEach(r => s += `iptables -A ${r.chain} -p tcp --dport ${r.port} -j ${r.action}\n`);
    el.textContent = s;
}

function copyExport() {
    navigator.clipboard.writeText(document.getElementById('export-terminal').textContent);
    toast('📋 Copied', 'Script copied to clipboard', 'var(--clean)');
}

// ═══ TRAFFIC GRAPH ═══
function initTrafficGraph() {
    const c = document.getElementById('traffic-canvas'); if (!c) return;
    const ctx = c.getContext('2d');
    for (let i=0; i<60; i++) trafficData.push(0);
    function draw() {
        c.width = c.parentElement.clientWidth; c.height = c.parentElement.clientHeight - 30;
        const w=c.width, h=c.height, step=w/59;
        ctx.clearRect(0,0,w,h);
        ctx.strokeStyle='rgba(255,77,77,0.4)'; ctx.lineWidth=1.5; ctx.beginPath();
        trafficData.forEach((v,i)=>{ const x=i*step, y=h-(v/100)*h; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.stroke();
        ctx.lineTo((trafficData.length-1)*step,h); ctx.lineTo(0,h); ctx.closePath();
        ctx.fillStyle='rgba(255,77,77,0.05)'; ctx.fill();
        requestAnimationFrame(draw);
    }
    draw();
}

// ═══ CANVAS PARTICLES ═══
function initReconCanvas() {
    const c = document.getElementById('recon-canvas'); if (!c) return;
    const ctx = c.getContext('2d'); let pts = [];
    const resize = () => { c.width=c.parentElement.offsetWidth; c.height=c.parentElement.offsetHeight; };
    for(let i=0;i<80;i++) pts.push({x:Math.random()*800,y:Math.random()*400,v:Math.random()*0.5+0.3,a:Math.random()*Math.PI*2});
    (function anim(){ ctx.clearRect(0,0,c.width,c.height); pts.forEach(p=>{ p.x+=Math.cos(p.a)*p.v; p.y+=Math.sin(p.a)*p.v; if(p.x<0||p.x>c.width||p.y<0||p.y>c.height){p.x=c.width/2;p.y=c.height/2;} ctx.fillStyle='rgba(255,77,77,0.08)'; ctx.beginPath(); ctx.arc(p.x,p.y,1,0,Math.PI*2); ctx.fill(); }); requestAnimationFrame(anim); })();
    window.addEventListener('resize', resize); resize();
}

// ═══ TOP BAR UPDATES ═══
function updateTopBar() {
    const d = Date.now() - startTime;
    const h=String(Math.floor(d/3600000)).padStart(2,'0'), m=String(Math.floor((d%3600000)/60000)).padStart(2,'0'), s=String(Math.floor((d%60000)/1000)).padStart(2,'0');
    document.getElementById('tb-uptime').textContent = `${h}:${m}:${s}`;
    document.getElementById('tb-clock').textContent = new Date().toLocaleTimeString('en-GB');
    document.getElementById('tb-epm').textContent = Math.round(eventCount / Math.max(1, d/60000));
    // Simulated resource meters
    const cpu = 15+Math.random()*30; document.getElementById('cpu-val').textContent=Math.round(cpu)+'%'; document.getElementById('cpu-bar').style.width=cpu+'%'; document.getElementById('cpu-bar').style.background=cpu>70?'var(--crit)':'var(--clean)';
    const mem = 55+Math.random()*15; document.getElementById('mem-val').textContent=Math.round(mem)+'%'; document.getElementById('mem-bar').style.width=mem+'%';
    const net = 5+Math.random()*25; document.getElementById('net-val').textContent=Math.round(net)+' MB/s'; document.getElementById('net-bar').style.width=Math.min(net*3,100)+'%';
    trafficData.push(Math.random()*60+10); if(trafficData.length>60) trafficData.shift();
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
    renderBlocked(); renderPerimeter(); initTrafficGraph(); initReconCanvas();
    setInterval(addLiveAttack, 2500);
    setInterval(updateTopBar, 1000);
});