// ╔══════════════════════════════════════════════════════════╗
// ║    2048 — Score + Best Score + Game Over + Touch/Swipe   ║
// ╚══════════════════════════════════════════════════════════╝
const Game2048 = {
    MIN_SWIPE: 30, // minimum pixels for a swipe to register

    init(container) {
        this.container = container;
        this.score     = 0;
        this.best      = parseInt(localStorage.getItem('gh-2048-best')) || 0;
        this.won       = false;
        this.over      = false;
        this.board     = Array(16).fill(0);
        this._add(); this._add();
        this._buildUI();
        this._bindKeys();
        this._bindSwipe();
    },

    _buildUI() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:420px;">
                <div class="g2048-header">
                    <div class="g2048-title">CYBER <span>2048</span></div>
                    <div class="g2048-scores">
                        <div class="g2048-score-box">SCORE<br><span id="g2048-score">0</span></div>
                        <div class="g2048-score-box">BEST<br><span id="g2048-best">${this.best}</span></div>
                    </div>
                </div>
                <div class="grid-2048" id="g2048"></div>
                <p id="g2048-msg" class="game-status-msg">Use arrow keys or swipe to merge tiles!</p>
                <div style="display:flex;gap:10px;margin-top:12px;">
                    <button class="glass-btn small" onclick="Game2048.restart()" style="width:auto;padding:10px 24px;">NEW GAME</button>
                </div>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('g2048');
        if (!g) return;
        g.innerHTML = this.board.map(v =>
            `<div class="tile-2048" data-val="${v}">${v || ''}</div>`
        ).join('');
    },

    _add() {
        const empty = this.board.map((v,i) => v === 0 ? i : null).filter(v => v !== null);
        if (empty.length) {
            this.board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
        }
    },

    _slide(dir) {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let line = [];
            for (let j = 0; j < 4; j++) {
                const idx = this._idx(dir, i, j);
                if (this.board[idx]) line.push(this.board[idx]);
            }
            for (let j = 0; j < line.length - 1; j++) {
                if (line[j] === line[j+1]) {
                    const merged = line[j] * 2;
                    line[j] = merged;
                    line.splice(j+1, 1);
                    this.score += merged;
                    if (merged === 2048 && !this.won) {
                        this.won = true;
                        setTimeout(() => App.logWin('Cyber 2048'), 100);
                    }
                    moved = true;
                }
            }
            while (line.length < 4) line.push(0);
            line.forEach((v, j) => {
                const idx = this._idx(dir, i, j);
                if (this.board[idx] !== v) moved = true;
                this.board[idx] = v;
            });
        }
        return moved;
    },

    _idx(dir, i, j) {
        if (dir === 0) return i * 4 + j;
        if (dir === 1) return i * 4 + (3 - j);
        if (dir === 2) return j * 4 + i;
        if (dir === 3) return (3 - j) * 4 + i;
    },

    _move(dir) {
        if (this.over) return;
        const moved = this._slide(dir);
        if (moved) {
            this._add();
            this._render();
            const sEl = document.getElementById('g2048-score');
            if (sEl) sEl.textContent = this.score;
            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem('gh-2048-best', this.best);
                const bEl = document.getElementById('g2048-best');
                if (bEl) bEl.textContent = this.best;
            }
            if (this._isGameOver()) {
                this.over = true;
                const msg = document.getElementById('g2048-msg');
                if (msg) msg.textContent = `Game Over! Final score: ${this.score}`;
            }
        }
    },

    _isGameOver() {
        if (this.board.includes(0)) return false;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const v = this.board[i * 4 + j];
                if (j < 3 && v === this.board[i * 4 + j + 1]) return false;
                if (i < 3 && v === this.board[(i+1) * 4 + j]) return false;
            }
        }
        return true;
    },

    _bindKeys() {
        this.destroy();
        this._handler = e => {
            const map = { ArrowLeft:0, ArrowRight:1, ArrowUp:2, ArrowDown:3 };
            if (!(e.key in map)) return;
            e.preventDefault();
            this._move(map[e.key]);
        };
        window.addEventListener('keydown', this._handler);
    },

    _bindSwipe() {
        const el = this.container;
        let startX, startY;
        this._touchStart = e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        this._touchEnd = e => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            // Require minimum swipe distance to avoid accidental triggers
            if (Math.abs(dx) < this.MIN_SWIPE && Math.abs(dy) < this.MIN_SWIPE) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                this._move(dx > 0 ? 1 : 0);
            } else {
                this._move(dy > 0 ? 3 : 2);
            }
        };
        el.addEventListener('touchstart', this._touchStart, { passive: true });
        el.addEventListener('touchend', this._touchEnd, { passive: true });
    },

    restart() {
        this.destroy();
        this.init(this.container);
    },

    destroy() {
        if (this._handler) {
            window.removeEventListener('keydown', this._handler);
            this._handler = null;
        }
        if (this._touchStart && this.container) {
            this.container.removeEventListener('touchstart', this._touchStart);
            this.container.removeEventListener('touchend', this._touchEnd);
            this._touchStart = null;
            this._touchEnd = null;
        }
    }
};
