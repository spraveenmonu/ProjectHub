// ╔══════════════════════════════════════════════════════════╗
// ║   QUEENS PUZZLE — Conflict Highlight + Clear + Auto solve ║
// ╚══════════════════════════════════════════════════════════╝
const QueensPuzzle = {
    N: 8,

    init(container) {
        this.container = container;
        this.board     = Array(this.N * this.N).fill(false);
        this.autoSolved = false;
        this._build();
    },

    _build() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:460px;">
                <h2 style="font-weight:900;">Royal <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Queens</span></h2>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:10px;">Place exactly one queen per row, column and diagonal.</p>
                <div class="queens-grid" id="queens-grid"></div>
                <p id="queens-msg" class="game-status-msg">Queens placed: 0 / ${this.N}</p>
                <div style="display:flex;gap:10px;margin-top:12px;justify-content:center;">
                    <button class="glass-btn small" style="width:auto;padding:10px 22px;" onclick="QueensPuzzle._clear()">🗑 CLEAR</button>
                    <button class="glass-btn small" style="width:auto;padding:10px 22px;" onclick="QueensPuzzle._solve()">✨ SOLVE</button>
                </div>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('queens-grid');
        if (!g) return;
        const conflicts = this._getConflicts();
        g.innerHTML = this.board.map((v, i) => {
            const row = Math.floor(i / this.N), col = i % this.N;
            const shade = (row + col) % 2 === 0 ? 'chess-light' : 'chess-dark';
            const conflict = v && conflicts.has(i) ? ' queen-conflict' : '';
            return `<div class="queens-cell ${shade}${conflict}" data-idx="${i}">${v ? '👑' : ''}</div>`;
        }).join('');
        g.querySelectorAll('.queens-cell').forEach(c =>
            c.addEventListener('click', () => this._toggle(parseInt(c.dataset.idx)))
        );
        const queens = this.board.map((v,i) => v ? i : null).filter(v => v !== null);
        const msg    = document.getElementById('queens-msg');
        if (msg) {
            const conf = this._getConflicts();
            if (queens.length === this.N && conf.size === 0) {
                msg.textContent = '👑 PERFECT! All queens placed safely!';
            } else if (conf.size > 0) {
                msg.textContent = `⚠️ ${conf.size} queen(s) in conflict!`;
            } else {
                msg.textContent = `Queens placed: ${queens.length} / ${this.N}`;
            }
        }
    },

    _toggle(idx) {
        this.board[idx] = !this.board[idx];
        this._render();
        const queens  = this.board.map((v,i) => v ? i : null).filter(v => v !== null);
        const conflicts = this._getConflicts();
        if (queens.length === this.N && conflicts.size === 0 && !this.autoSolved) {
            App.logWin('Royal Queens');
        }
    },

    _getConflicts() {
        const queens   = this.board.map((v,i) => v ? i : null).filter(v => v !== null);
        const conflict = new Set();
        for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
                const r1 = Math.floor(queens[i] / this.N), c1 = queens[i] % this.N;
                const r2 = Math.floor(queens[j] / this.N), c2 = queens[j] % this.N;
                if (r1 === r2 || c1 === c2 || Math.abs(r1-r2) === Math.abs(c1-c2)) {
                    conflict.add(queens[i]);
                    conflict.add(queens[j]);
                }
            }
        }
        return conflict;
    },

    _clear() {
        this.board = Array(this.N * this.N).fill(false);
        this._render();
    },

    _solve() {
        // Backtracking solver
        this.board = Array(this.N * this.N).fill(false);
        this.autoSolved = true;
        const cols = new Set(), diag1 = new Set(), diag2 = new Set();
        const solve = (row) => {
            if (row === this.N) return true;
            for (let col = 0; col < this.N; col++) {
                if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
                this.board[row * this.N + col] = true;
                cols.add(col); diag1.add(row-col); diag2.add(row+col);
                if (solve(row + 1)) return true;
                this.board[row * this.N + col] = false;
                cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);
            }
            return false;
        };
        solve(0);
        this._render();
    },

    restart() { this._clear(); },
    destroy()  { }
};
