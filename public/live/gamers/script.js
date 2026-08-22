/**
 * GAMER'S HUB — PREMIUM EDITION
 * Main App Controller
 */

const App = {
    user: {
        name: localStorage.getItem('gh-user-name') || 'Guest',
        totalWins: parseInt(localStorage.getItem('gh-total-wins')) || 0
    },

    currentGameId: null,
    currentGameModule: null,

    // Simple HTML escape to prevent XSS from user input
    _esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    GAMES_DATA: [
        { id: 'tic-tac-toe',   title: 'Tactical Toe',  desc: 'Classic 3×3 duel with unbeatable AI.',     icon: '✕○',  bg: 'ttt-bg',    hasSetup: true },
        { id: 'candy-crush',   title: 'Cyber Crush',   desc: 'Match 3 neon gems to score big.',           icon: '💎',  bg: 'candy-bg',  hasSetup: false },
        { id: 'memory',        title: 'Memory Pulse',  desc: 'Flip & match cards against the clock.',     icon: '🧠',  bg: 'memory-bg', hasSetup: true },
        { id: '2048',          title: 'Cyber 2048',    desc: 'Slide & merge tiles to reach 2048.',        icon: '⊞',   bg: 'g2048-bg',  hasSetup: false },
        { id: 'snakes-ladders',title: 'Snake Quest',   desc: 'Race to 100. Snakes drag you down!',       icon: '🐍',  bg: 'snakes-bg', hasSetup: true },
        { id: 'ludo',          title: 'Ludo Legends',  desc: 'Classic board game with token strategy.',  icon: '🎲',  bg: 'ludo-bg',   hasSetup: true },
        { id: 'sudoku',        title: 'Sudoku Nexus',  desc: 'Solve the 9×9 logic number grid.',         icon: '⑨',   bg: 'sudoku-bg', hasSetup: true },
        { id: 'queens',        title: 'Royal Queens',  desc: 'Place 8 queens — no conflicts allowed.',   icon: '👑',  bg: 'queens-bg', hasSetup: false },
        { id: 'puzzle',        title: 'Slide Master',  desc: 'Arrange tiles with minimum moves.',         icon: '⧉',   bg: 'puzzle-bg', hasSetup: false },
        { id: 'crossclimb',   title: 'Word Climb',    desc: 'Change one letter at a time to the goal.', icon: 'Aa',  bg: 'cross-bg',  hasSetup: false },
        { id: 'tango',         title: 'Logic Tango',   desc: 'Fill the binary grid by the rules.',       icon: '01',  bg: 'tango-bg',  hasSetup: false },
        { id: 'zip',           title: 'Speed Zip',     desc: 'Tap the target before time runs out!',     icon: '⚡',  bg: 'zip-bg',    hasSetup: false },
        { id: 'math-sprint',   title: 'Math Sprint',   desc: 'Rapid-fire arithmetic challenge.',         icon: '∑',   bg: 'tango-bg',  hasSetup: false },
        { id: 'color-fill',    title: 'Color Fill',    desc: 'Flood-fill the grid in limited moves.',    icon: '🎨',  bg: 'memory-bg', hasSetup: false },
        { id: 'connections',   title: 'Connections',   desc: 'Group 4 words that share a category.',    icon: '🔗',  bg: 'cross-bg',  hasSetup: false }
    ],

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.checkAuth();
        this.renderGames();
        this.updateUI();
    },

    cacheDOM() {
        this.el = {
            profileGate:      document.getElementById('profile-gate'),
            mainDashboard:    document.getElementById('main-dashboard'),
            gameSetupScreen:  document.getElementById('game-setup-screen'),
            gameViewport:     document.getElementById('game-viewport'),
            gameContent:      document.getElementById('game-content-container'),
            gameTitleBar:     document.getElementById('game-title-bar'),
            userNameInput:    document.getElementById('user-name-input'),
            enterHubBtn:      document.getElementById('enter-hub-btn'),
            totalWinsEl:      document.getElementById('total-wins'),
            backToHub:        document.getElementById('back-to-hub'),
            backToDashboard:  document.getElementById('back-to-dashboard'),
            startGameBtn:     document.getElementById('start-game-btn'),
            setupOptions:     document.getElementById('setup-options'),
            gameContainer:    document.getElementById('game-container'),
            gameSearch:       document.getElementById('game-search'),
            leaderboardList:  document.getElementById('leaderboard-list'),
            clearRankings:    document.getElementById('clear-rankings-btn'),
            winModal:         document.getElementById('win-modal'),
            winTitle:         document.getElementById('win-title'),
            winMessage:       document.getElementById('win-message'),
            closeWinModal:    document.getElementById('close-win-modal'),
            playAgainBtn:     document.getElementById('play-again-modal-btn'),
            restartBtn:       document.getElementById('restart-game-btn'),
            headerUser:       document.getElementById('header-user')
        };
    },

    bindEvents() {
        this.el.enterHubBtn.onclick   = () => this.handleAuth();
        this.el.userNameInput.onkeydown = e => { if (e.key === 'Enter') this.handleAuth(); };
        this.el.backToDashboard.onclick = () => this.showDashboard();
        this.el.backToHub.onclick     = () => { this.destroyCurrentGame(); this.showDashboard(); };
        this.el.gameSearch.oninput    = e => this.renderGames(e.target.value);
        this.el.clearRankings.onclick = () => this.clearAllData();
        this.el.closeWinModal.onclick = () => {
            this.el.winModal.classList.remove('show');
            document.getElementById('confetti').innerHTML = '';
            this.destroyCurrentGame();
            this.showDashboard();
        };
        this.el.playAgainBtn.onclick = () => {
            this.el.winModal.classList.remove('show');
            document.getElementById('confetti').innerHTML = '';
            // Restart same game
            if (this.currentGameModule && this.currentGameModule.restart) {
                this.currentGameModule.restart();
            } else {
                this.launchGame(this._lastOptions || {});
            }
        };
        this.el.restartBtn.onclick = () => {
            if (this.currentGameModule && this.currentGameModule.restart) {
                this.currentGameModule.restart();
            } else {
                this.launchGame(this._lastOptions || {});
            }
        };
        // Escape key to go back
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                if (this.el.winModal.classList.contains('show')) {
                    this.el.winModal.classList.remove('show');
                    document.getElementById('confetti').innerHTML = '';
                    this.destroyCurrentGame();
                    this.showDashboard();
                } else if (!this.el.gameViewport.classList.contains('hidden')) {
                    this.destroyCurrentGame();
                    this.showDashboard();
                } else if (!this.el.gameSetupScreen.classList.contains('hidden')) {
                    this.showDashboard();
                }
            }
        };
        window.addEventListener('keydown', this._escHandler);
    },

    checkAuth() {
        if (localStorage.getItem('gh-user-name')) {
            this.user.name = localStorage.getItem('gh-user-name');
            this.showDashboard();
        }
    },

    handleAuth() {
        const name = this.el.userNameInput.value.trim();
        if (name) {
            this.user.name = name;
            localStorage.setItem('gh-user-name', name);
            this.showDashboard();
        }
    },

    showDashboard() {
        this.el.profileGate.classList.add('hidden');
        this.el.gameSetupScreen.classList.add('hidden');
        this.el.gameViewport.classList.add('hidden');
        this.el.mainDashboard.classList.remove('hidden');
        this.renderGames(this.el.gameSearch.value);
        this.updateUI();
    },

    updateUI() {
        this.user.totalWins = parseInt(localStorage.getItem('gh-total-wins')) || 0;
        if (this.el.totalWinsEl) this.el.totalWinsEl.textContent = this.user.totalWins;
        if (this.el.headerUser) this.el.headerUser.textContent = '👤 ' + this.user.name;
        this.renderLeaderboard();
    },

    getGameScore(gameId) {
        const scores = JSON.parse(localStorage.getItem('gh-game-scores')) || {};
        return scores[gameId] || 0;
    },

    renderGames(filter = '') {
        const q = filter.toLowerCase();
        const filtered = this.GAMES_DATA.filter(g =>
            g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)
        );
        this.el.gameContainer.innerHTML = filtered.map(g => `
            <div class="game-card" onclick="App.openSetup('${g.id}')">
                <div class="game-bg ${g.bg}"></div>
                <div class="game-icon-wrapper">${g.icon}</div>
                <div class="game-info">
                    <h3>${g.title}</h3>
                    <p>${g.desc}</p>
                    <div class="game-card-score">WINS <span>${this.getGameScore(g.id)}</span></div>
                </div>
                <button class="play-btn">PLAY NOW</button>
            </div>
        `).join('');
    },

    openSetup(gameId) {
        this.currentGameId = gameId;
        const game = this.GAMES_DATA.find(g => g.id === gameId);

        if (game && game.hasSetup) {
            this.el.mainDashboard.classList.add('hidden');
            this.el.gameSetupScreen.classList.remove('hidden');
            document.getElementById('setup-title').innerHTML = `Setup <span>${game.title}</span>`;

            if (gameId === 'tic-tac-toe') {
                this.el.setupOptions.innerHTML = `
                    <div class="setup-step">
                        <label>CHOOSE YOUR OPPONENT</label>
                        <div class="option-grid">
                            <button class="option-btn active" id="opt-ai" onclick="App.setTTTMode('ai')">🤖 COMPUTER</button>
                            <button class="option-btn" id="opt-p2" onclick="App.setTTTMode('p2')">👤 PLAYER 2</button>
                        </div>
                    </div>
                    <div id="p2-name-step" class="setup-step hidden">
                        <label>PLAYER 2 NAME</label>
                        <input type="text" id="p2-name-input" class="glass-input" placeholder="Enter name..." autocomplete="off">
                    </div>`;
                this.tttMode = 'ai';
                this.el.startGameBtn.onclick = () => {
                    const p2Input = document.getElementById('p2-name-input');
                    const p2Name = p2Input ? p2Input.value.trim() || 'Player 2' : 'Player 2';
                    this.launchGame({ mode: this.tttMode, p2Name });
                };
            } else if (gameId === 'memory') {
                this.el.setupOptions.innerHTML = `
                    <div class="setup-step">
                        <label>DIFFICULTY</label>
                        <div class="option-grid">
                            <button class="option-btn active" id="diff-easy" onclick="App.setMemDiff('easy')">😊 EASY (4×4)</button>
                            <button class="option-btn" id="diff-hard" onclick="App.setMemDiff('hard')">💀 HARD (6×5)</button>
                        </div>
                    </div>`;
                this.memDiff = 'easy';
                this.el.startGameBtn.onclick = () => this.launchGame({ difficulty: this.memDiff });
            } else if (gameId === 'sudoku') {
                this.el.setupOptions.innerHTML = `
                    <div class="setup-step">
                        <label>DIFFICULTY</label>
                        <div class="option-grid">
                            <button class="option-btn active" id="sdk-easy" onclick="App.setSudokuDiff('easy')">😊 EASY</button>
                            <button class="option-btn" id="sdk-hard" onclick="App.setSudokuDiff('hard')">💀 HARD</button>
                        </div>
                    </div>`;
                this.sudokuDiff = 'easy';
                this.el.startGameBtn.onclick = () => this.launchGame({ difficulty: this.sudokuDiff });
            } else if (gameId === 'ludo' || gameId === 'snakes-ladders') {
                const gName = gameId === 'ludo' ? 'Ludo' : 'Snake Quest';
                this._mpPlayers = 2; this._mpHumans = 1;
                this.el.setupOptions.innerHTML = `
                    <div class="setup-step">
                        <label>NUMBER OF PLAYERS</label>
                        <div class="option-grid">
                            <button class="option-btn active" id="mp-2" onclick="App.setMPCount(2)">2 Players</button>
                            <button class="option-btn" id="mp-3" onclick="App.setMPCount(3)">3 Players</button>
                            <button class="option-btn" id="mp-4" onclick="App.setMPCount(4)">4 Players</button>
                        </div>
                    </div>
                    <div class="setup-step">
                        <label>HUMAN PLAYERS</label>
                        <div class="option-grid" id="mp-humans-grid">
                            <button class="option-btn active" id="mp-h1" onclick="App.setMPHumans(1)">1 Human</button>
                            <button class="option-btn" id="mp-h2" onclick="App.setMPHumans(2)">2 Humans</button>
                        </div>
                    </div>
                    <p class="setup-hint" id="mp-hint">1 human + 1 AI</p>`;
                this.el.startGameBtn.onclick = () => this.launchGame({ totalPlayers: this._mpPlayers, humanPlayers: this._mpHumans });
            }
        } else {
            this.launchGame({});
        }
    },

    setTTTMode(mode) {
        this.tttMode = mode;
        document.getElementById('opt-ai').classList.toggle('active', mode === 'ai');
        document.getElementById('opt-p2').classList.toggle('active', mode === 'p2');
        document.getElementById('p2-name-step').classList.toggle('hidden', mode === 'ai');
    },

    setMemDiff(diff) {
        this.memDiff = diff;
        document.getElementById('diff-easy').classList.toggle('active', diff === 'easy');
        document.getElementById('diff-hard').classList.toggle('active', diff === 'hard');
    },

    setSudokuDiff(diff) {
        this.sudokuDiff = diff;
        document.getElementById('sdk-easy').classList.toggle('active', diff === 'easy');
        document.getElementById('sdk-hard').classList.toggle('active', diff === 'hard');
    },

    setMPCount(n) {
        this._mpPlayers = n;
        [2,3,4].forEach(v => document.getElementById('mp-'+v).classList.toggle('active', v===n));
        // Clamp humans
        if (this._mpHumans > n) this._mpHumans = n;
        // Rebuild humans grid
        const grid = document.getElementById('mp-humans-grid');
        if (grid) {
            let html = '';
            for (let h = 1; h <= n; h++) {
                const active = h === this._mpHumans ? 'active' : '';
                html += `<button class="option-btn ${active}" id="mp-h${h}" onclick="App.setMPHumans(${h})">${h} Human${h>1?'s':''}</button>`;
            }
            grid.innerHTML = html;
        }
        this._updateMPHint();
    },

    setMPHumans(h) {
        this._mpHumans = h;
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById('mp-h'+i);
            if (btn) btn.classList.toggle('active', i===h);
        }
        this._updateMPHint();
    },

    _updateMPHint() {
        const hint = document.getElementById('mp-hint');
        const ai = this._mpPlayers - this._mpHumans;
        if (hint) hint.textContent = `${this._mpHumans} human${this._mpHumans>1?'s':''} + ${ai} AI${ai>1?'s':''}`;
    },

    destroyCurrentGame() {
        if (this.currentGameModule && this.currentGameModule.destroy) {
            this.currentGameModule.destroy();
        }
        this.currentGameModule = null;
    },

    launchGame(options = {}) {
        this._lastOptions = options;
        // Always destroy previous game first to clean up listeners/timers
        this.destroyCurrentGame();
        this.el.gameSetupScreen.classList.add('hidden');
        this.el.mainDashboard.classList.add('hidden');
        this.el.gameViewport.classList.remove('hidden');
        this.el.gameContent.innerHTML = '';

        const game = this.GAMES_DATA.find(g => g.id === this.currentGameId);
        this.el.gameTitleBar.innerText = game ? game.title.toUpperCase() : '';

        const modules = {
            'tic-tac-toe':    TicTacToe,
            'candy-crush':    CandyCrush,
            'memory':         MemoryMatch,
            '2048':           Game2048,
            'snakes-ladders': SnakesLadders,
            'ludo':           Ludo,
            'sudoku':         Sudoku,
            'queens':         QueensPuzzle,
            'puzzle':         SlidePuzzle,
            'crossclimb':     Crossclimb,
            'tango':          Tango,
            'zip':            ZipSpeed,
            'math-sprint':    MathSprint,
            'color-fill':     ColorFill,
            'connections':    Connections
        };

        const mod = modules[this.currentGameId];
        if (mod) {
            this.currentGameModule = mod;
            mod.init(this.el.gameContent, options);
        }
    },

    logWin(gameName, score = 1) {
        this.user.totalWins += score;
        localStorage.setItem('gh-total-wins', this.user.totalWins);

        let rankings = JSON.parse(localStorage.getItem('gh-rankings')) || [];
        let entry = rankings.find(r => r.name === this.user.name);
        if (entry) entry.score += score;
        else rankings.push({ name: this.user.name, score });
        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem('gh-rankings', JSON.stringify(rankings.slice(0, 10)));

        let gameScores = JSON.parse(localStorage.getItem('gh-game-scores')) || {};
        gameScores[this.currentGameId] = (gameScores[this.currentGameId] || 0) + score;
        localStorage.setItem('gh-game-scores', JSON.stringify(gameScores));

        this.celebrate(gameName);
        this.updateUI();
    },

    celebrate(gameName) {
        this.el.winTitle.innerHTML = 'YOU <span>WON!</span>';
        this.el.winMessage.innerText = gameName ? `Dominated ${gameName}!` : 'Incredible skills!';
        this.el.winModal.classList.add('show');
        this.firePoppers();
    },

    firePoppers() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';
        const colors = ['#f43f5e','#6366f1','#10b981','#f59e0b','#38bdf8','#ff4d94','#a855f7','#fbbf24'];
        const burst = (ox, oy, count, spread) => {
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'popper-particle';
                const angle = (Math.random() * spread) - (spread / 2) - 90;
                const rad   = (angle * Math.PI) / 180;
                const vel   = 250 + Math.random() * 600;
                const dx    = Math.cos(rad) * vel;
                const dy    = Math.sin(rad) * vel;
                const dur   = 1.2 + Math.random() * 1.5;
                const size  = 5 + Math.random() * 10;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const br    = ['50%','3px','0'][Math.floor(Math.random() * 3)];
                p.style.cssText = `left:${ox}%;bottom:${oy}%;width:${size}px;height:${size}px;background:${color};border-radius:${br};box-shadow:0 0 8px ${color};--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;--rot:${Math.random()*1080}deg;`;
                container.appendChild(p);
            }
        };
        burst(5, 10, 70, 90);
        burst(95, 10, 70, 90);
        burst(50, 100, 40, 360);
        setTimeout(() => { container.innerHTML = ''; }, 4000);
    },

    renderLeaderboard() {
        const rankings = JSON.parse(localStorage.getItem('gh-rankings')) || [];
        const medals = ['🥇','🥈','🥉'];
        this.el.leaderboardList.innerHTML = rankings.map((r, i) => `
            <li>
                <span class="rank-name">${medals[i] || (i+1)+'.'} ${r.name}</span>
                <span class="rank-score">${r.score} PTS</span>
            </li>
        `).join('') || '<li style="justify-content:center;opacity:0.4;">No rankings yet</li>';
    },

    clearAllData() {
        const btn = this.el.clearRankings;
        if (!btn) return;
        // Two-click confirmation pattern (confirm() can be blocked by some environments)
        if (btn.dataset.confirming === 'true') {
            localStorage.removeItem('gh-user-name');
            localStorage.removeItem('gh-total-wins');
            localStorage.removeItem('gh-rankings');
            localStorage.removeItem('gh-game-scores');
            localStorage.removeItem('gh-2048-best');
            this.user.name = 'Guest';
            this.user.totalWins = 0;
            // Show login gate again
            this.el.mainDashboard.classList.add('hidden');
            this.el.profileGate.classList.remove('hidden');
            btn.textContent = 'RESET ALL DATA';
            btn.dataset.confirming = 'false';
            btn.classList.remove('confirming');
            this.updateUI();
        } else {
            btn.dataset.confirming = 'true';
            btn.textContent = '⚠ TAP AGAIN TO CONFIRM';
            btn.classList.add('confirming');
            // Auto-cancel after 3 seconds
            setTimeout(() => {
                if (btn.dataset.confirming === 'true') {
                    btn.textContent = 'RESET ALL DATA';
                    btn.dataset.confirming = 'false';
                    btn.classList.remove('confirming');
                }
            }, 3000);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
