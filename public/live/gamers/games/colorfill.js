// ╔══════════════════════════════════════════════════════════╗
// ║   COLOR FILL — Flood Fill mechanic + moves + levels      ║
// ╚══════════════════════════════════════════════════════════╝
const ColorFill = {
    SIZE:   8,
    COLORS: ['#f43f5e','#6366f1','#10b981','#f59e0b','#38bdf8','#a855f7'],
    LEVELS: [
        { maxMoves: 25 },
        { maxMoves: 22 },
        { maxMoves: 20 }
    ],

    init(container) {
        this.container  = container;
        this.level      = 0;
        this.maxMoves   = this.LEVELS[this.level].maxMoves;
        this.movesLeft  = this.maxMoves;
        this._generate();
        this._build();
    },

    _generate() {
        // Random grid
        this.board = Array(this.SIZE * this.SIZE).fill(0).map(
            () => Math.floor(Math.random() * this.COLORS.length)
        );
    },

    _build() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:460px;">
                <h2 style="font-weight:900;">Color <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Fill</span></h2>
                <div class="colorfill-header">
                    <div class="cf-stat">Moves left: <span id="cf-moves">${this.movesLeft}</span></div>
                    <div class="cf-stat">Level: <span id="cf-level">${this.level+1}</span></div>
                </div>
                <div class="colorfill-grid" id="cf-grid" style="grid-template-columns:repeat(${this.SIZE},1fr);"></div>
                <div class="colorfill-palette" id="cf-palette"></div>
                <p id="cf-msg" class="game-status-msg">Flood fill from top-left to cover the entire board!</p>
            </div>`;
        this._renderGrid();
        this._renderPalette();
    },

    _renderGrid() {
        const g = document.getElementById('cf-grid');
        if (!g) return;
        g.innerHTML = this.board.map((ci, i) =>
            `<div class="cf-cell" data-idx="${i}" style="background:${this.COLORS[ci]};"></div>`
        ).join('');
    },

    _renderPalette() {
        const p = document.getElementById('cf-palette');
        if (!p) return;
        p.innerHTML = this.COLORS.map((c, i) =>
            `<button class="cf-color-btn" style="background:${c};" onclick="ColorFill._floodFill(${i})" title="Fill with color"></button>`
        ).join('');
    },

    _floodFill(newColor) {
        const startColor = this.board[0]; // Always fill from top-left (index 0)
        if (newColor === startColor) return;

        this.movesLeft--;
        const mEl = document.getElementById('cf-moves');
        if (mEl) { mEl.textContent = this.movesLeft; mEl.style.color = this.movesLeft <= 5 ? '#f43f5e' : ''; }

        // BFS flood fill from cell 0
        const queue   = [0];
        const visited = new Set([0]);
        while (queue.length) {
            const idx = queue.shift();
            this.board[idx] = newColor;
            const row = Math.floor(idx / this.SIZE), col = idx % this.SIZE;
            const neighbors = [];
            if (row > 0)              neighbors.push(idx - this.SIZE);
            if (row < this.SIZE - 1)  neighbors.push(idx + this.SIZE);
            if (col > 0)              neighbors.push(idx - 1);
            if (col < this.SIZE - 1)  neighbors.push(idx + 1);
            neighbors.forEach(n => {
                if (!visited.has(n) && this.board[n] === startColor) {
                    visited.add(n); queue.push(n);
                }
            });
        }

        this._renderGrid();

        // Check win — all cells same color
        const firstColor = this.board[0];
        const allSame    = this.board.every(c => c === firstColor);
        const msg        = document.getElementById('cf-msg');

        if (allSame) {
            if (msg) msg.textContent = `🎉 Level ${this.level+1} cleared with ${this.movesLeft} moves left!`;
            App.logWin('Color Fill');
            if (this.level < this.LEVELS.length - 1) {
                setTimeout(() => {
                    this.level++;
                    this.maxMoves  = this.LEVELS[this.level].maxMoves;
                    this.movesLeft = this.maxMoves;
                    this._generate();
                    this._build();
                }, 1200);
            }
        } else if (this.movesLeft <= 0) {
            if (msg) msg.textContent = '💀 Out of moves! Try again.';
            const btns = document.querySelectorAll('.cf-color-btn');
            btns.forEach(b => b.disabled = true);
        }
    },

    restart() { this.init(this.container); },
    destroy()  { }
};
