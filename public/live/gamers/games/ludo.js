// ╔══════════════════════════════════════════════════════════╗
// ║   LUDO LEGENDS — 2-4 players, visual 15×15 board        ║
// ╚══════════════════════════════════════════════════════════╝
const Ludo = {
    DICE_FACES: ['','⚀','⚁','⚂','⚃','⚄','⚅'],
    COLORS: ['red','green','yellow','blue'],
    COLOR_EMOJI: ['🔴','🟢','🟡','🔵'],
    COLOR_NAMES: ['Red','Green','Yellow','Blue'],

    PATH_LEN: 52,
    HOME_LEN: 6,
    FINISH:   58,

    START_OFFSET:  { red:0, green:13, yellow:26, blue:39 },
    HOME_ENTRY_SQ: { red:50, green:11, yellow:24, blue:37 },
    SAFE_SET: new Set([0, 8, 13, 21, 26, 34, 39, 47]),

    RING: null,

    HOME_COLS: {
        red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
        green:  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
        yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
        blue:   [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
    },

    BASE_POS: {
        red:    [[2,2],[2,4],[4,2],[4,4]],
        green:  [[2,10],[2,12],[4,10],[4,12]],
        yellow: [[10,10],[10,12],[12,10],[12,12]],
        blue:   [[10,2],[10,4],[12,2],[12,4]]
    },

    _buildRing() {
        if (this.RING) return;
        const r = [];
        for (let c = 1; c <= 5; c++) r.push([6, c]);
        for (let rr = 5; rr >= 0; rr--) r.push([rr, 6]);
        r.push([0, 7]); r.push([0, 8]);
        for (let rr = 1; rr <= 5; rr++) r.push([rr, 8]);
        for (let c = 9; c <= 13; c++) r.push([6, c]);
        for (let rr = 6; rr <= 8; rr++) r.push([rr, 14]);
        for (let c = 13; c >= 9; c--) r.push([8, c]);
        for (let rr = 9; rr <= 14; rr++) r.push([rr, 8]);
        r.push([14, 7]); r.push([14, 6]);
        for (let rr = 13; rr >= 9; rr--) r.push([rr, 6]);
        for (let c = 5; c >= 1; c--) r.push([8, c]);
        for (let rr = 8; rr >= 6; rr--) r.push([rr, 0]);
        this.RING = r;
    },

    _tokenRC(color, pos) {
        if (pos < 0) return null;
        if (pos >= this.FINISH) return [7, 7];
        const offset = this.START_OFFSET[color];
        if (pos < this.PATH_LEN) {
            const globalSq = (pos + offset) % this.PATH_LEN;
            return this.RING[globalSq];
        }
        const homeIdx = pos - this.PATH_LEN;
        return this.HOME_COLS[color][homeIdx];
    },

    _cellType(r, c) {
        if (r >= 0 && r <= 5 && c >= 0 && c <= 5) return 'base-red';
        if (r >= 0 && r <= 5 && c >= 9 && c <= 14) return 'base-green';
        if (r >= 9 && r <= 14 && c >= 9 && c <= 14) return 'base-yellow';
        if (r >= 9 && r <= 14 && c >= 0 && c <= 5) return 'base-blue';
        if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return 'home-centre';
        if (this.RING) {
            for (let i = 0; i < this.RING.length; i++) {
                if (this.RING[i][0] === r && this.RING[i][1] === c) return 'path';
            }
        }
        for (const col of Object.keys(this.HOME_COLS)) {
            for (const [hr, hc] of this.HOME_COLS[col]) {
                if (hr === r && hc === c) return 'home-' + col;
            }
        }
        return 'empty';
    },

    /* ═══════════════════════ INIT ═══════════════════════ */
    init(container, options = {}) {
        this.container = container;
        this._buildRing();

        const total  = options.totalPlayers || 2;
        const humans = options.humanPlayers || 1;

        // Build player list: pick colours based on count
        // 2P → red+yellow (opposite), 3P → red+green+yellow, 4P → all
        const colorPicks = total === 2 ? [0, 2] : total === 3 ? [0, 1, 2] : [0, 1, 2, 3];
        this.players = colorPicks.map((ci, i) => ({
            color: this.COLORS[ci],
            name:  i === 0 ? App.user.name : (i < humans ? `P${i+1}` : `Bot ${this.COLOR_NAMES[ci]}`),
            bot:   i >= humans
        }));

        this.numPlayers = this.players.length;
        this.tokens     = this.players.map(() => [-1, -1, -1, -1]);
        this.turn       = 0;
        this.rolled     = false;
        this.lastRoll   = 0;
        this.active     = true;
        this.finished   = new Set(); // indices of players who finished
        this._build();
    },

    _build() {
        // Build player indicators
        let playerInfo = this.players.map((p, i) => {
            const finished = this._finishedCount(i);
            const isTurn = i === this.turn;
            return `<div class="lb-player-badge ${p.color} ${isTurn ? 'lb-active-turn' : ''}" id="lb-badge-${i}">
                <span class="lb-badge-dot"></span>
                <span class="lb-badge-name">${p.bot ? '🤖' : '👤'} ${p.name}</span>
                <span class="lb-badge-home">${finished}/4 🏠</span>
            </div>`;
        }).join('');

        this.container.innerHTML = `
            <div class="ludo-container">
                <div class="lb-player-bar" id="lb-player-bar">${playerInfo}</div>
                <div class="ludo-visual-board" id="ludo-vboard"></div>
                <div class="dice-area">
                    <div class="dice" id="ludo-dice" title="Roll">?</div>
                    <p id="ludo-msg" class="game-status-msg">Roll to begin!</p>
                </div>
            </div>`;
        this._renderBoard();
        document.getElementById('ludo-dice').addEventListener('click', () => this._rollDice());
    },

    _updatePlayerBar() {
        const bar = document.getElementById('lb-player-bar');
        if (!bar) return;
        bar.innerHTML = this.players.map((p, i) => {
            const finished = this._finishedCount(i);
            const isTurn = i === this.turn;
            return `<div class="lb-player-badge ${p.color} ${isTurn ? 'lb-active-turn' : ''}" id="lb-badge-${i}">
                <span class="lb-badge-dot"></span>
                <span class="lb-badge-name">${p.bot ? '🤖' : '👤'} ${p.name}</span>
                <span class="lb-badge-home">${finished}/4 🏠</span>
            </div>`;
        }).join('');
    },

    _renderBoard() {
        const board = document.getElementById('ludo-vboard');
        if (!board) return;

        const tokenMap = {};
        this.players.forEach((p, pi) => {
            this.tokens[pi].forEach((pos, ti) => {
                let rc = pos < 0 ? this.BASE_POS[p.color][ti] : this._tokenRC(p.color, pos);
                if (rc) {
                    const key = rc[0] + ',' + rc[1];
                    if (!tokenMap[key]) tokenMap[key] = [];
                    tokenMap[key].push({ pi, ti, color: p.color, pos });
                }
            });
        });

        let html = '';
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                const type = this._cellType(r, c);
                let cls = 'lb-cell';
                let content = '';

                if (type.startsWith('base-')) {
                    const bcolor = type.replace('base-', '');
                    cls += ` lb-base lb-${bcolor}`;
                    // Only show base for active colors
                    const isActive = this.players.some(p => p.color === bcolor);
                    if (!isActive) cls += ' lb-inactive-base';
                    if (this._isBaseInner(r, c, bcolor)) cls += ' lb-base-inner';
                } else if (type === 'home-centre') {
                    cls += ' lb-centre';
                } else if (type === 'path') {
                    cls += ' lb-path';
                    for (let i = 0; i < this.RING.length; i++) {
                        if (this.RING[i][0] === r && this.RING[i][1] === c) {
                            if (this.SAFE_SET.has(i)) { cls += ' lb-star'; content = '★'; }
                            if (i === 0)  cls += ' lb-start-red';
                            if (i === 13) cls += ' lb-start-green';
                            if (i === 26) cls += ' lb-start-yellow';
                            if (i === 39) cls += ' lb-start-blue';
                            break;
                        }
                    }
                } else if (type.startsWith('home-')) {
                    const hcolor = type.replace('home-', '');
                    cls += ` lb-home-col lb-hc-${hcolor}`;
                } else {
                    cls += ' lb-empty';
                }

                const key = r + ',' + c;
                if (tokenMap[key]) {
                    content = tokenMap[key].map(t => {
                        const clickable = this.rolled && t.pi === this.turn && t.pos < this.FINISH ? 'lb-clickable' : '';
                        return `<div class="lb-token lb-t-${t.color} ${clickable}" data-pi="${t.pi}" data-ti="${t.ti}"></div>`;
                    }).join('');
                }

                html += `<div class="${cls}">${content}</div>`;
            }
        }

        board.innerHTML = html;
        board.querySelectorAll('.lb-clickable').forEach(t => {
            t.addEventListener('click', e => {
                e.stopPropagation();
                this._moveToken(parseInt(t.dataset.pi), parseInt(t.dataset.ti));
            });
        });
    },

    _isBaseInner(r, c, color) {
        return this.BASE_POS[color].some(([br, bc]) => br === r && bc === c);
    },

    _finishedCount(pi) {
        return this.tokens[pi].filter(p => p >= this.FINISH).length;
    },

    /* ═══════════════════════ DICE ═══════════════════════ */
    _rollDice() {
        if (!this.active || this.rolled) return;
        // Only allow human to roll on their turn
        const p = this.players[this.turn];
        if (p.bot) return;

        this._doRoll();
    },

    _doRoll() {
        const val = Math.floor(Math.random() * 6) + 1;
        this.lastRoll = val;
        const d = document.getElementById('ludo-dice');
        if (d) {
            let t = 0;
            const anim = setInterval(() => {
                d.textContent = this.DICE_FACES[Math.floor(Math.random() * 6) + 1];
                if (++t >= 8) { clearInterval(anim); d.textContent = this.DICE_FACES[val]; }
            }, 70);
        }

        this.rolled = true;
        const p = this.players[this.turn];
        const moveable = this._getMoveableTokens(this.turn, val);

        if (moveable.length === 0) {
            this._setMsg(`${p.name} rolled ${val} — no moves!`);
            setTimeout(() => this._nextTurn(val === 6), 900);
            return;
        }

        this._setMsg(`${p.name} rolled ${val}! ${p.bot ? '' : 'Click a token.'}`);
        this._renderBoard();

        if (p.bot) {
            setTimeout(() => {
                const ti = this._botChoose(this.turn, val, moveable);
                this._moveToken(this.turn, ti);
            }, 700);
        }
    },

    _botChoose(pi, roll, moveable) {
        const color = this.players[pi].color;
        // Priority: capture > finish > leave base > advance
        for (const ti of moveable) {
            const pos = this.tokens[pi][ti];
            let newPos = pos === -1 ? 0 : pos + roll;
            if (newPos < this.PATH_LEN) {
                const globalSq = (newPos + this.START_OFFSET[color]) % this.PATH_LEN;
                if (!this.SAFE_SET.has(globalSq)) {
                    for (let opi = 0; opi < this.players.length; opi++) {
                        if (opi === pi) continue;
                        const oColor = this.players[opi].color;
                        for (const oPos of this.tokens[opi]) {
                            if (oPos >= 0 && oPos < this.PATH_LEN) {
                                if (((oPos + this.START_OFFSET[oColor]) % this.PATH_LEN) === globalSq) return ti;
                            }
                        }
                    }
                }
            }
        }
        for (const ti of moveable) { if (this.tokens[pi][ti] >= 0 && this.tokens[pi][ti] + roll === this.FINISH) return ti; }
        for (const ti of moveable) { if (this.tokens[pi][ti] === -1) return ti; }
        // Advance furthest token
        let best = moveable[0], bestPos = -2;
        for (const ti of moveable) { if (this.tokens[pi][ti] > bestPos) { bestPos = this.tokens[pi][ti]; best = ti; } }
        return best;
    },

    _getMoveableTokens(pi, roll) {
        return this.tokens[pi].map((pos, ti) => {
            if (pos >= this.FINISH) return null;
            if (pos === -1 && roll !== 6) return null;
            if (pos === -1 && roll === 6) return ti;
            if (pos + roll > this.FINISH) return null;
            return ti;
        }).filter(v => v !== null);
    },

    _moveToken(pi, ti) {
        if (!this.rolled || pi !== this.turn) return;
        const roll  = this.lastRoll;
        const color = this.players[pi].color;
        let pos     = this.tokens[pi][ti];

        if (pos === -1 && roll !== 6) return;
        if (pos >= this.FINISH) return;

        if (pos === -1) {
            pos = 0;
        } else {
            pos = pos + roll;
            if (pos > this.FINISH) return;
        }
        this.tokens[pi][ti] = pos;

        // Capture logic
        if (pos >= 0 && pos < this.PATH_LEN) {
            const globalSq = (pos + this.START_OFFSET[color]) % this.PATH_LEN;
            if (!this.SAFE_SET.has(globalSq)) {
                this.players.forEach((other, opi) => {
                    if (opi === pi) return;
                    const oOffset = this.START_OFFSET[other.color];
                    this.tokens[opi].forEach((oPos, oti) => {
                        if (oPos >= 0 && oPos < this.PATH_LEN) {
                            if (((oPos + oOffset) % this.PATH_LEN) === globalSq) {
                                this.tokens[opi][oti] = -1;
                                this._setMsg(`🎯 ${this.players[pi].name} captured ${other.name}'s token!`);
                            }
                        }
                    });
                });
            }
        }

        // Check if this player finished all 4
        if (this._finishedCount(pi) === 4 && !this.finished.has(pi)) {
            this.finished.add(pi);
            if (this.finished.size === 1) {
                // First player to finish wins
                this._renderBoard();
                this._updatePlayerBar();
                this._setMsg(`🏆 ${this.players[pi].name} WINS!`);
                this.active = false;
                if (!this.players[pi].bot) App.logWin('Ludo Legends');
                return;
            }
        }

        this._renderBoard();
        this._updatePlayerBar();
        this._nextTurn(roll === 6);
    },

    _nextTurn(extraTurn) {
        this.rolled = false;
        if (!extraTurn) {
            // Skip finished players
            let next = (this.turn + 1) % this.numPlayers;
            let safety = 0;
            while (this.finished.has(next) && safety < this.numPlayers) {
                next = (next + 1) % this.numPlayers;
                safety++;
            }
            this.turn = next;
        }
        if (!this.active) return;

        const p = this.players[this.turn];
        this._updatePlayerBar();
        this._setMsg(p.bot ? `🤖 ${p.name} is thinking…` : `${p.name}'s turn! Roll the dice.`);

        if (p.bot) {
            setTimeout(() => this._doRoll(), 600);
        }
    },

    _setMsg(msg) {
        const el = document.getElementById('ludo-msg');
        if (el) el.textContent = msg;
    },

    restart() { this.init(this.container, this._lastOpts); },
    destroy() { this.active = false; },

    // Override init to save options
    _origInit: null
};

// Wrap init to remember options
(function() {
    const origInit = Ludo.init.bind(Ludo);
    Ludo.init = function(container, options) {
        this._lastOpts = options || {};
        origInit(container, options);
    };
})();
