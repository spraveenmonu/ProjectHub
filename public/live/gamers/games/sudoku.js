// ╔══════════════════════════════════════════════════════════╗
// ║   SUDOKU — Validation + Error Highlight + Hint + Timer   ║
// ╚══════════════════════════════════════════════════════════╝
const Sudoku = {
    PUZZLES: {
        easy: {
            given: [5,3,0,0,7,0,0,0,0, 6,0,0,1,9,5,0,0,0, 0,9,8,0,0,0,0,6,0,
                    8,0,0,0,6,0,0,0,3, 4,0,0,8,0,3,0,0,1, 7,0,0,0,2,0,0,0,6,
                    0,6,0,0,0,0,2,8,0, 0,0,0,4,1,9,0,0,5, 0,0,0,0,8,0,0,7,9],
            solution: [5,3,4,6,7,8,9,1,2, 6,7,2,1,9,5,3,4,8, 1,9,8,3,4,2,5,6,7,
                       8,5,9,7,6,1,4,2,3, 4,2,6,8,5,3,7,9,1, 7,1,3,9,2,4,8,5,6,
                       9,6,1,5,3,7,2,8,4, 2,8,7,4,1,9,6,3,5, 3,4,5,2,8,6,1,7,9]
        },
        hard: {
            given: [0,0,0,0,0,0,0,0,0, 0,0,0,0,0,3,0,8,5, 0,0,1,0,2,0,0,0,0,
                    0,0,0,5,0,7,0,0,0, 0,0,4,0,0,0,1,0,0, 0,9,0,0,0,0,0,0,0,
                    5,0,0,0,0,0,0,7,3, 0,0,2,0,1,0,0,0,0, 0,0,0,0,4,0,0,0,9],
            solution: [9,8,7,6,5,4,3,2,1, 2,4,6,1,7,3,9,8,5, 3,5,1,9,2,8,7,4,6,
                       1,2,8,5,3,7,6,9,4, 6,3,4,8,9,2,1,5,7, 7,9,5,4,6,1,8,3,2,
                       5,1,9,2,8,6,4,7,3, 4,7,2,3,1,9,5,6,8, 8,6,3,7,4,5,2,1,9]
        }
    },

    init(container, options = {}) {
        this.container = container;
        this.diff      = options.difficulty || 'easy';
        const puzzle   = this.PUZZLES[this.diff];
        this.given     = [...puzzle.given];
        this.solution  = [...puzzle.solution];
        this.grid      = [...puzzle.given];
        this.fixed     = this.given.map(v => v !== 0);
        this.selected  = -1;
        this.errors    = 0;
        this.seconds   = 0;
        this.gameOver  = false;
        this.notes     = Array(81).fill(null).map(() => new Set());
        this.noteMode  = false;
        this._buildUI();
        this._startTimer();
    },

    _buildUI() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:500px;">
                <div class="sudoku-header">
                    <div class="sdk-stat">⏱ <span id="sdk-time">0:00</span></div>
                    <div class="sdk-stat">❌ Errors: <span id="sdk-errors">0</span>/3</div>
                    <div class="sdk-stat">📝 <button class="note-toggle glass-btn small" id="sdk-note-btn" style="width:auto;padding:6px 14px;font-size:0.75rem;" onclick="Sudoku._toggleNoteMode()">NOTES OFF</button></div>
                </div>
                <div class="sudoku-grid" id="sudoku-grid"></div>
                <div class="sudoku-numpad" id="sudoku-nums"></div>
                <div class="sdk-actions">
                    <button class="glass-btn small" style="width:auto;padding:10px 20px;" onclick="Sudoku._hint()">💡 HINT</button>
                    <button class="glass-btn small" style="width:auto;padding:10px 20px;" onclick="Sudoku._erase()">⌫ ERASE</button>
                </div>
                <p id="sudoku-msg" class="game-status-msg"></p>
            </div>`;
        this._renderGrid();
        this._renderNumpad();
        this._bindKeyboard();
    },

    _renderGrid() {
        const g = document.getElementById('sudoku-grid');
        if (!g) return;
        g.innerHTML = this.grid.map((v, i) => {
            const isFixed  = this.fixed[i];
            const isErr    = !isFixed && v !== 0 && v !== this.solution[i];
            const isSel    = this.selected === i;
            const isSameNum = this.selected >= 0 && this.grid[this.selected] !== 0 && this.grid[this.selected] === v && i !== this.selected;
            const isRelated = this._isRelated(this.selected, i);
            let cls = 'sudoku-cell';
            if (isFixed)  cls += ' fixed';
            if (isErr)    cls += ' error';
            if (isSel)    cls += ' selected';
            if (isSameNum && !isSel) cls += ' same-num';
            if (isRelated && !isSel) cls += ' related';
            const row = Math.floor(i/9), col = i%9;
            if (col === 2 || col === 5) cls += ' box-right';
            if (row === 2 || row === 5) cls += ' box-bottom';
            const notesHtml = v === 0 && this.notes[i].size > 0
                ? `<div class="sdk-notes">${[1,2,3,4,5,6,7,8,9].map(n =>
                    `<span>${this.notes[i].has(n) ? n : ''}</span>`).join('')}</div>` : '';
            return `<div class="${cls}" data-idx="${i}">${v || notesHtml || ''}</div>`;
        }).join('');
        g.querySelectorAll('.sudoku-cell').forEach(c =>
            c.addEventListener('click', () => {
                if (!this.gameOver) { this.selected = parseInt(c.dataset.idx); this._renderGrid(); }
            })
        );
    },

    _renderNumpad() {
        const n = document.getElementById('sudoku-nums');
        if (!n) return;
        n.innerHTML = [1,2,3,4,5,6,7,8,9].map(v =>
            `<button class="sdk-num-btn option-btn" onclick="Sudoku._setVal(${v})">${v}</button>`
        ).join('');
    },

    _bindKeyboard() {
        if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) this._setVal(num);
            else if (e.key === 'Backspace' || e.key === 'Delete') this._erase();
        };
        window.addEventListener('keydown', this._keyHandler);
    },

    _isRelated(a, b) {
        if (a < 0 || b < 0) return false;
        const ar = Math.floor(a/9), ac = a%9, br = Math.floor(b/9), bc = b%9;
        if (ar === br || ac === bc) return true;
        return (Math.floor(ar/3)*3 + Math.floor(ac/3)) === (Math.floor(br/3)*3 + Math.floor(bc/3));
    },

    _setVal(v) {
        if (this.gameOver || this.selected < 0 || this.fixed[this.selected]) return;
        if (this.noteMode) {
            const notes = this.notes[this.selected];
            if (notes.has(v)) notes.delete(v); else notes.add(v);
            this._renderGrid(); return;
        }
        if (this.grid[this.selected] === v) return;
        if (v !== this.solution[this.selected]) {
            this.errors++;
            const eEl = document.getElementById('sdk-errors');
            if (eEl) eEl.textContent = this.errors;
            if (this.errors >= 3) {
                this.grid[this.selected] = v;
                this.gameOver = true;
                this._stopTimer();
                this._renderGrid();
                const msg = document.getElementById('sudoku-msg');
                if (msg) msg.textContent = '❌ Too many errors! Game over.';
                return;
            }
        }
        this.notes[this.selected].clear();
        this.grid[this.selected] = v;
        for (let i = 0; i < 81; i++) { if (this._isRelated(this.selected, i)) this.notes[i].delete(v); }
        this._renderGrid();
        if (this.grid.every((val, i) => val === this.solution[i])) {
            this.gameOver = true; this._stopTimer();
            const msg = document.getElementById('sudoku-msg');
            if (msg) msg.textContent = `🎉 Solved in ${this._formatTime(this.seconds)} with ${this.errors} errors!`;
            App.logWin('Sudoku Nexus');
        }
    },

    _erase() {
        if (this.gameOver || this.selected < 0 || this.fixed[this.selected]) return;
        this.grid[this.selected] = 0; this.notes[this.selected].clear(); this._renderGrid();
    },

    _hint() {
        if (this.gameOver) return;
        const empties = this.grid.map((v,i) => v === 0 ? i : null).filter(v => v !== null);
        if (!empties.length) return;
        const idx = empties[Math.floor(Math.random() * empties.length)];
        this.grid[idx] = this.solution[idx]; this.selected = idx;
        for (let i = 0; i < 81; i++) { if (this._isRelated(idx, i)) this.notes[i].delete(this.solution[idx]); }
        this._renderGrid();
        if (this.grid.every((val, i) => val === this.solution[i])) {
            this.gameOver = true; this._stopTimer();
            const msg = document.getElementById('sudoku-msg');
            if (msg) msg.textContent = `🎉 Solved in ${this._formatTime(this.seconds)} with ${this.errors} errors!`;
            App.logWin('Sudoku Nexus');
        }
    },

    _toggleNoteMode() {
        if (this.gameOver) return;
        this.noteMode = !this.noteMode;
        const btn = document.getElementById('sdk-note-btn');
        if (btn) btn.textContent = this.noteMode ? 'NOTES ON' : 'NOTES OFF';
        if (btn) btn.style.background = this.noteMode ? 'var(--primary-gradient)' : '';
    },

    _formatTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; },

    _startTimer() {
        this._stopTimer();
        this._timerInterval = setInterval(() => {
            this.seconds++;
            const el = document.getElementById('sdk-time');
            if (el) el.textContent = this._formatTime(this.seconds);
        }, 1000);
    },

    _stopTimer() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    },

    restart() {
        this._stopTimer();
        if (this._keyHandler) { window.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        this.init(this.container, { difficulty: this.diff });
    },

    destroy() {
        this._stopTimer();
        if (this._keyHandler) { window.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
    }
};
