// ╔══════════════════════════════════════════════════════════╗
// ║  SLIDE PUZZLE — Timer + Best Moves + 4×4 option          ║
// ╚══════════════════════════════════════════════════════════╝
const SlidePuzzle = {
    init(container) {
        this.container = container;
        this.size      = 3;  // 3×3
        this.total     = this.size * this.size;
        this.moves     = 0;
        this.seconds   = 0;
        this.bestKey   = `gh-puzzle-best-${this.size}`;
        this.best      = parseInt(localStorage.getItem(this.bestKey)) || Infinity;
        this._shuffle();
        this._buildUI();
        this._startTimer();
    },

    _shuffle() {
        do {
            this.board = Array.from({length: this.total}, (_, i) => i); // 0 = blank
            // Fisher-Yates shuffle
            for (let i = this.board.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
            }
        } while (!this._isSolvable() || this._isSolved());
    },

    _isSolvable() {
        const b   = this.board.filter(v => v !== 0);
        let inv   = 0;
        for (let i = 0; i < b.length; i++)
            for (let j = i+1; j < b.length; j++)
                if (b[i] > b[j]) inv++;
        if (this.size % 2 === 1) return inv % 2 === 0;
        const blankRow = Math.floor(this.board.indexOf(0) / this.size);
        return (inv + blankRow) % 2 === 1;
    },

    _isSolved() {
        return this.board.every((v, i) => {
            if (i === this.total - 1) return v === 0;
            return v === i + 1;
        });
    },

    _buildUI() {
        const bestText = isFinite(this.best) ? this.best : '—';
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:400px;">
                <h2 style="font-weight:900;">Slide <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Master</span></h2>
                <div class="puzzle-header">
                    <div class="puz-stat">⏱ <span id="puz-time">0:00</span></div>
                    <div class="puz-stat">Moves: <span id="puz-moves">0</span></div>
                    <div class="puz-stat">Best: <span id="puz-best">${bestText}</span></div>
                </div>
                <div class="puzzle-grid" id="puzzle-grid" style="grid-template-columns:repeat(${this.size},1fr);"></div>
                <p id="puz-msg" class="game-status-msg">Arrange tiles 1–${this.total-1} in order!</p>
                <div style="display:flex;gap:10px;margin-top:12px;justify-content:center;">
                    <button class="glass-btn small" style="width:auto;padding:10px 22px;" onclick="SlidePuzzle.restart()">🔀 SHUFFLE</button>
                </div>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('puzzle-grid');
        if (!g) return;
        g.innerHTML = this.board.map((v, i) =>
            `<div class="puzzle-tile ${v === 0 ? 'empty' : ''}" data-idx="${i}">${v || ''}</div>`
        ).join('');
        g.querySelectorAll('.puzzle-tile').forEach(t =>
            t.addEventListener('click', () => this._move(parseInt(t.dataset.idx)))
        );
    },

    _move(idx) {
        const blank = this.board.indexOf(0);
        const r1 = Math.floor(idx/this.size),   c1 = idx%this.size;
        const r2 = Math.floor(blank/this.size),  c2 = blank%this.size;
        if (Math.abs(r1-r2) + Math.abs(c1-c2) !== 1) return;
        [this.board[idx], this.board[blank]] = [this.board[blank], this.board[idx]];
        this.moves++;
        const mEl = document.getElementById('puz-moves');
        if (mEl) mEl.textContent = this.moves;
        this._render();
        if (this._isSolved()) {
            this._stopTimer();
            if (!isFinite(this.best) || this.moves < this.best) {
                this.best = this.moves;
                localStorage.setItem(this.bestKey, this.best);
                const bEl = document.getElementById('puz-best');
                if (bEl) bEl.textContent = this.best;
            }
            const msg = document.getElementById('puz-msg');
            if (msg) msg.textContent = `🎉 Solved in ${this.moves} moves & ${this._formatTime(this.seconds)}!`;
            App.logWin('Slide Master');
        }
    },

    _formatTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; },

    _startTimer() {
        this._stopTimer();
        this._timerInterval = setInterval(() => {
            this.seconds++;
            const el = document.getElementById('puz-time');
            if (el) el.textContent = this._formatTime(this.seconds);
        }, 1000);
    },

    _stopTimer() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    },

    restart() {
        this._stopTimer();
        this.moves   = 0;
        this.seconds = 0;
        this._shuffle();
        this._buildUI();
        this._startTimer();
    },

    destroy() { this._stopTimer(); }
};
