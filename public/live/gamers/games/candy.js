// ╔══════════════════════════════════════════════════════════╗
// ║        CANDY CRUSH — Match-3 with Cascade & Combos      ║
// ╚══════════════════════════════════════════════════════════╝
const CandyCrush = {
    SIZE: 8,
    CANDIES: ['🍎','🍇','🍊','🍋','🍒','💎'],

    init(container) {
        this.container = container;
        this.score     = 0;
        this.selected  = null;
        this.busy      = false;
        this.won       = false;
        container.innerHTML = `
            <div class="ttt-container" style="max-width:480px;">
                <div class="candy-header">
                    <div class="candy-stat">SCORE<br><span id="candy-score">0</span></div>
                    <div class="candy-stat">TARGET<br><span>500</span></div>
                    <div class="candy-stat">MOVES<br><span id="candy-moves">30</span></div>
                </div>
                <div class="candy-grid" id="candy-grid"></div>
                <p id="candy-msg" class="game-status-msg"></p>
            </div>`;
        this.moves = 30;
        this._createBoard();
        this._render();
    },

    _createBoard() {
        do {
            this.board = Array(this.SIZE * this.SIZE).fill(null).map(
                () => this.CANDIES[Math.floor(Math.random() * this.CANDIES.length)]
            );
        } while (this._findMatches().size > 0);
    },

    _render() {
        const grid = document.getElementById('candy-grid');
        if (!grid) return;
        grid.innerHTML = this.board.map((v, i) =>
            `<div class="candy" data-idx="${i}">${v || ''}</div>`
        ).join('');
        grid.querySelectorAll('.candy').forEach(c =>
            c.addEventListener('click', () => !this.busy && !this.won && this._handleSelect(c))
        );
    },

    _handleSelect(c) {
        const idx = parseInt(c.dataset.idx);
        if (!this.board[idx]) return;

        if (this.selected === null) {
            this.selected = idx;
            c.classList.add('selected');
            return;
        }

        if (this.selected === idx) {
            this.selected = null;
            c.classList.remove('selected');
            return;
        }

        const prev = this.selected;
        this.selected = null;
        document.querySelectorAll('.candy.selected').forEach(el => el.classList.remove('selected'));

        if (this._isAdj(prev, idx)) {
            this._trySwap(prev, idx);
        } else {
            this.selected = idx;
            c.classList.add('selected');
        }
    },

    _isAdj(a, b) {
        const r1 = Math.floor(a / this.SIZE), c1 = a % this.SIZE;
        const r2 = Math.floor(b / this.SIZE), c2 = b % this.SIZE;
        return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    },

    _swap(a, b) {
        [this.board[a], this.board[b]] = [this.board[b], this.board[a]];
    },

    _trySwap(a, b) {
        this.busy = true;
        this._swap(a, b);
        this._render();

        const matches = this._findMatches();
        if (matches.size === 0) {
            setTimeout(() => {
                this._swap(a, b);
                this._render();
                this.busy = false;
            }, 300);
        } else {
            this.moves--;
            const mEl = document.getElementById('candy-moves');
            if (mEl) mEl.textContent = this.moves;
            this._cascade(() => {
                this.busy = false;
                if (this.score >= 500 && !this.won) {
                    this.won = true;
                    App.logWin('Cyber Crush');
                } else if (this.moves <= 0 && !this.won) {
                    const msg = document.getElementById('candy-msg');
                    if (msg) msg.textContent = 'Out of moves! Score: ' + this.score;
                }
            });
        }
    },

    _findMatches() {
        const toClear = new Set();
        const S = this.SIZE;
        // Horizontal
        for (let r = 0; r < S; r++) {
            for (let c = 0; c < S - 2; c++) {
                const i = r * S + c;
                if (this.board[i] && this.board[i] === this.board[i+1] && this.board[i] === this.board[i+2]) {
                    toClear.add(i); toClear.add(i+1); toClear.add(i+2);
                }
            }
        }
        // Vertical
        for (let c = 0; c < S; c++) {
            for (let r = 0; r < S - 2; r++) {
                const i = r * S + c;
                if (this.board[i] && this.board[i] === this.board[i+S] && this.board[i] === this.board[i+S*2]) {
                    toClear.add(i); toClear.add(i+S); toClear.add(i+S*2);
                }
            }
        }
        return toClear;
    },

    _cascade(done) {
        const matches = this._findMatches();
        if (!matches.size) return done();

        this.score += matches.size * 10;
        const sEl = document.getElementById('candy-score');
        if (sEl) sEl.textContent = this.score;

        matches.forEach(i => { this.board[i] = null; });
        this._render();

        setTimeout(() => {
            const S = this.SIZE;
            for (let c = 0; c < S; c++) {
                let emptyCount = 0;
                for (let r = S - 1; r >= 0; r--) {
                    const i = r * S + c;
                    if (this.board[i] === null) {
                        emptyCount++;
                    } else if (emptyCount > 0) {
                        this.board[(r + emptyCount) * S + c] = this.board[i];
                        this.board[i] = null;
                    }
                }
                for (let r = 0; r < emptyCount; r++) {
                    this.board[r * S + c] = this.CANDIES[Math.floor(Math.random() * this.CANDIES.length)];
                }
            }
            this._render();
            setTimeout(() => this._cascade(done), 300);
        }, 300);
    },

    restart() { this.init(this.container); },
    destroy()  { }
};
