// ╔══════════════════════════════════════════════════════════╗
// ║  SNAKES & LADDERS — 2-4 players with AI support         ║
// ╚══════════════════════════════════════════════════════════╝
const SnakesLadders = {
    SPECIALS: {
        // Ladders ↑
        2:38, 7:14, 8:31, 15:26, 21:42, 28:84, 36:44, 51:67, 71:91, 78:98,
        // Snakes ↓
        16:6, 46:25, 49:11, 62:19, 64:60, 74:53, 89:68, 92:88, 95:75, 99:80
    },

    DICE_FACES: ['','⚀','⚁','⚂','⚃','⚄','⚅'],
    COLORS: ['#38bdf8','#f472b6','#4ade80','#fbbf24'],
    COLOR_NAMES: ['Blue','Pink','Green','Gold'],
    TOKEN_LABELS: ['P1','P2','P3','P4'],

    init(container, options = {}) {
        this.container = container;
        const total  = options.totalPlayers || 2;
        const humans = options.humanPlayers || 1;

        this.players = [];
        for (let i = 0; i < total; i++) {
            this.players.push({
                name:  i === 0 ? App.user.name : (i < humans ? `Player ${i+1}` : `Bot ${this.COLOR_NAMES[i]}`),
                bot:   i >= humans,
                pos:   0,
                color: this.COLORS[i],
                label: this.TOKEN_LABELS[i]
            });
        }

        this.numPlayers = total;
        this.turn    = 0;
        this.active  = true;
        this.rolling = false;
        this._lastOpts = options;
        this._build();
    },

    _build() {
        /* Build the 10×10 board */
        let cells = '';
        const lightColors = ['#ffebee','#e8f5e9','#fff9c4','#e3f2fd','#fff3e0'];
        for (let row = 9; row >= 0; row--) {
            const leftToRight = row % 2 === 0;
            for (let colIdx = 0; colIdx < 10; colIdx++) {
                const c = leftToRight ? colIdx : 9 - colIdx;
                const num = row * 10 + c + 1;
                const isSnake  = num in this.SPECIALS && this.SPECIALS[num] < num;
                const isLadder = num in this.SPECIALS && this.SPECIALS[num] > num;
                const visualRow = 9 - row;
                const bgColor = lightColors[(visualRow + colIdx) % 5];

                let cls = 'snl-cell';
                let extra = '';
                if (isSnake)  { cls += ' snl-snake-cell';  extra = `<span class="snl-icon">🐍</span>`; }
                if (isLadder) { cls += ' snl-ladder-cell'; extra = `<span class="snl-icon">🪜</span>`; }
                if (num === 1)   cls += ' snl-start';
                if (num === 100) cls += ' snl-finish';

                cells += `<div class="${cls}" style="background:${bgColor}" data-num="${num}">
                    <span class="snl-num">${num}</span>${extra}
                </div>`;
            }
        }

        // Player score boxes
        let scoreBoxes = this.players.map((p, i) => `
            <div class="snl-score-box" style="border-color:${p.color}40" id="snl-sb-${i}">
                <span class="snl-score-label">${p.bot ? '🤖' : '🎮'} ${p.name}</span>
                <span class="snl-score-pos" style="color:${p.color}" id="snl-pos-${i}">Start</span>
            </div>`).join('');

        // Build token elements
        let tokenEls = this.players.map((p, i) =>
            `<div id="snl-tok-${i}" class="snl-token" style="background:${p.color};border:3px solid #fff;color:#fff">${p.label}</div>`
        ).join('');

        this.container.innerHTML = `
            <div class="snl-game-wrap">
                <div class="snl-scores">${scoreBoxes}</div>
                <div class="snl-board-frame">
                    <div class="snl-board" id="snl-board">
                        <div class="snl-grid">${cells}</div>
                        ${tokenEls}
                    </div>
                </div>
                <div class="dice-area">
                    <div class="dice" id="sl-dice" title="Click to roll">🎲</div>
                    <p id="sl-msg" class="game-status-msg">${this.players[0].name}, click the dice!</p>
                    <div class="snl-legend">
                        <span>🐍 Snake — go down</span>
                        <span>🪜 Ladder — go up</span>
                    </div>
                </div>
            </div>`;

        this._updateTokens();
        this._updateScores();
        this._highlightTurn();
        document.getElementById('sl-dice').addEventListener('click', () => this._onDiceClick());

        // If first player is bot, auto-roll
        if (this.players[0].bot) {
            setTimeout(() => this._botRoll(), 800);
        }
    },

    _onDiceClick() {
        if (!this.active || this.rolling) return;
        const p = this.players[this.turn];
        if (p.bot) return; // humans only
        this._roll();
    },

    _botRoll() {
        if (!this.active || this.rolling) return;
        this._roll();
    },

    _roll() {
        this.rolling = true;
        const dice = document.getElementById('sl-dice');
        let ticks = 0;
        const interval = setInterval(() => {
            const r = Math.floor(Math.random() * 6) + 1;
            if (dice) dice.textContent = this.DICE_FACES[r];
            ticks++;
            if (ticks >= 8) {
                clearInterval(interval);
                const final = Math.floor(Math.random() * 6) + 1;
                if (dice) dice.textContent = this.DICE_FACES[final];
                this._move(this.turn, final);
            }
        }, 80);
    },

    _move(pi, v) {
        const p = this.players[pi];
        const pos = p.pos;
        const next = pos + v;
        // Bounce back if overshoot 100
        p.pos = next > 100 ? pos : next;

        this._updateTokens();
        this._updateScores();
        this._setMsg(`${p.name} rolled ${v}!`);
        this._highlightCell(p.pos);

        setTimeout(() => {
            this._applySpecial(pi, () => {
                if (p.pos >= 100) {
                    this._setMsg(`🎉 ${p.name} WINS!`);
                    this.active  = false;
                    this.rolling = false;
                    if (!p.bot) App.logWin('Snake Quest');
                    return;
                }
                this._advanceTurn();
            });
        }, 500);
    },

    _applySpecial(pi, cb) {
        const p = this.players[pi];
        if (this.SPECIALS[p.pos] !== undefined) {
            const dest = this.SPECIALS[p.pos];
            const isSnake = dest < p.pos;
            this._setMsg(isSnake
                ? `🐍 ${p.name}: Snake from ${p.pos} → ${dest}!`
                : `🪜 ${p.name}: Ladder from ${p.pos} → ${dest}!`);
            setTimeout(() => {
                p.pos = dest;
                this._updateTokens();
                this._updateScores();
                this._highlightCell(dest);
                setTimeout(cb, 400);
            }, 600);
        } else {
            cb();
        }
    },

    _advanceTurn() {
        this.turn = (this.turn + 1) % this.numPlayers;
        this.rolling = false;
        const p = this.players[this.turn];
        this._highlightTurn();
        this._setMsg(p.bot ? `🤖 ${p.name} rolling…` : `${p.name}, click the dice!`);

        if (p.bot) {
            setTimeout(() => this._botRoll(), 800);
        }
    },

    _highlightTurn() {
        this.players.forEach((_, i) => {
            const box = document.getElementById(`snl-sb-${i}`);
            if (box) {
                box.style.boxShadow = i === this.turn ? `0 0 15px ${this.players[i].color}50` : 'none';
                box.style.transform = i === this.turn ? 'scale(1.05)' : 'scale(1)';
            }
        });
    },

    _highlightCell(num) {
        document.querySelectorAll('.snl-cell.snl-active').forEach(c => c.classList.remove('snl-active'));
        const cell = document.querySelector(`.snl-cell[data-num="${num}"]`);
        if (cell) cell.classList.add('snl-active');
    },

    _setMsg(msg) {
        const el = document.getElementById('sl-msg');
        if (el) el.textContent = msg;
    },

    _updateScores() {
        this.players.forEach((p, i) => {
            const el = document.getElementById(`snl-pos-${i}`);
            if (el) el.textContent = p.pos === 0 ? 'Start' : p.pos >= 100 ? '🏆 100' : p.pos;
        });
    },

    _cellPos(num) {
        if (num <= 0) return { x: 0, y: 90 };
        const n = num - 1;
        const row = Math.floor(n / 10);
        const col = n % 10;
        const xCol = (row % 2 === 0) ? col : 9 - col;
        return { x: xCol * 10 + 1, y: (9 - row) * 10 + 1 };
    },

    _updateTokens() {
        this.players.forEach((p, i) => {
            const tok = document.getElementById(`snl-tok-${i}`);
            if (!tok) return;
            const pos = this._cellPos(p.pos);
            // Offset each token slightly so they don't fully overlap
            const offsets = [[1,1],[5,1],[1,5],[5,5]];
            const [ox, oy] = offsets[i] || [1,1];
            tok.style.left = (pos.x + ox) + '%';
            tok.style.top  = (pos.y + oy) + '%';
        });
    },

    restart() { this.init(this.container, this._lastOpts); },
    destroy()  { this.active = false; }
};
