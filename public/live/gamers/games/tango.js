// ╔══════════════════════════════════════════════════════════╗
// ║   LOGIC TANGO — Full Rule Validation (Binary Puzzle)     ║
// ╚══════════════════════════════════════════════════════════╝
const Tango = {
    SIZE: 6,

    PUZZLES: [
        // Each puzzle: array of 36, values 0/1/null, null=player fills
        { given: [1,null,null,null,null,0, null,null,1,null,null,null, null,1,null,null,0,null, null,null,null,1,null,null, null,null,0,null,null,null, 0,null,null,null,null,1],
          solution: [1,0,0,1,1,0, 0,0,1,0,1,1, 1,1,0,0,0,1, 0,1,1,1,0,0, 1,1,0,0,1,0, 0,0,1,1,0,1] }
    ],

    init(container) {
        this.container = container;
        this.puzzle    = this.PUZZLES[0];
        this.board     = [...this.puzzle.given];
        this.fixed     = this.board.map(v => v !== null);
        this.selected  = -1;
        this._build();
    },

    _build() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:400px;">
                <h2 style="font-weight:900;">Logic <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Tango</span></h2>
                <p style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:12px;">Each row & column must have equal 0s and 1s. No 3 identical adjacent.</p>
                <div class="tango-grid" id="tango-grid"></div>
                <p id="tango-msg" class="game-status-msg">Fill the grid!</p>
                <div style="display:flex;gap:10px;margin-top:12px;justify-content:center;">
                    <button class="glass-btn small" style="width:auto;padding:10px 22px;" onclick="Tango._clear()">🗑 CLEAR</button>
                    <button class="glass-btn small" style="width:auto;padding:10px 22px;" onclick="Tango._hint()">💡 HINT</button>
                </div>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('tango-grid');
        if (!g) return;
        const errors = this._getErrors();
        g.innerHTML = this.board.map((v, i) => {
            let cls = 'tango-cell';
            if (this.fixed[i])   cls += ' tango-fixed';
            if (errors.has(i))   cls += ' error';
            if (this.selected===i) cls += ' selected';
            return `<div class="${cls}" data-idx="${i}">${v === null ? '' : v}</div>`;
        }).join('');
        g.querySelectorAll('.tango-cell').forEach(c =>
            c.addEventListener('click', () => this._toggle(parseInt(c.dataset.idx)))
        );
        this._updateMsg();
    },

    _toggle(idx) {
        if (this.fixed[idx]) return;
        this.board[idx] = this.board[idx] === null ? 0 : (this.board[idx] === 0 ? 1 : null);
        this._render();
        if (!this.board.includes(null) && this._getErrors().size === 0) {
            const msg = document.getElementById('tango-msg');
            if (msg) msg.textContent = '🎉 Perfect! Grid solved!';
            App.logWin('Logic Tango');
        }
    },

    _getErrors() {
        const errors = new Set();
        const N = this.SIZE;
        // Check each row
        for (let r = 0; r < N; r++) {
            const row = Array.from({length: N}, (_, c) => this.board[r*N+c]);
            const errIdx = this._checkLine(row);
            errIdx.forEach(c => errors.add(r*N+c));
        }
        // Check each column
        for (let c = 0; c < N; c++) {
            const col = Array.from({length: N}, (_, r) => this.board[r*N+c]);
            const errIdx = this._checkLine(col);
            errIdx.forEach(r => errors.add(r*N+c));
        }
        return errors;
    },

    _checkLine(line) {
        const errors = new Set();
        const zeros  = line.filter(v => v === 0).length;
        const ones   = line.filter(v => v === 1).length;
        const half   = this.SIZE / 2;
        if (zeros > half)  line.forEach((v,i) => { if(v===0) errors.add(i); });
        if (ones  > half)  line.forEach((v,i) => { if(v===1) errors.add(i); });
        // Three in a row
        for (let i = 0; i < line.length - 2; i++) {
            if (line[i] !== null && line[i] === line[i+1] && line[i] === line[i+2]) {
                errors.add(i); errors.add(i+1); errors.add(i+2);
            }
        }
        return errors;
    },

    _updateMsg() {
        const msg = document.getElementById('tango-msg');
        if (!msg) return;
        if (this.board.includes(null)) {
            const filled = this.board.filter(v => v !== null).length - this.fixed.filter(Boolean).length;
            msg.textContent = `Filled: ${filled} / ${this.SIZE*this.SIZE - this.fixed.filter(Boolean).length}`;
        } else {
            const errs = this._getErrors();
            msg.textContent = errs.size > 0 ? `⚠️ ${errs.size} error(s) — check red cells!` : '✅ Check complete!';
        }
    },

    _clear() {
        this.board = this.puzzle.given.map(v => v);
        this._render();
    },

    _hint() {
        const empties = this.board.map((v,i) => v === null ? i : null).filter(v => v !== null);
        if (!empties.length) return;
        const idx = empties[Math.floor(Math.random() * empties.length)];
        this.board[idx] = this.puzzle.solution[idx];
        this._render();
    },

    restart() { this._clear(); },
    destroy()  { }
};
