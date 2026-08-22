// ╔══════════════════════════════════════════════════════════╗
// ║           TIC TAC TOE — Minimax AI + Win Line           ║
// ╚══════════════════════════════════════════════════════════╝
const TicTacToe = {
    init(container, options = {}) {
        this.mode    = options.mode || 'ai';
        this.p2Name  = options.p2Name || 'Player 2';
        this.p1Name  = App.user.name;
        this.scores  = { p1: 0, p2: 0, draw: 0 };
        this._build(container);
    },

    _build(container) {
        this.container = container;
        const opp = this.mode === 'ai' ? '🤖 Computer' : this.p2Name;
        container.innerHTML = `
            <div class="ttt-container">
                <div class="ttt-scoreboard">
                    <div class="ttt-score-box x-side">
                        <div class="ttt-score-name">${this.p1Name}</div>
                        <div class="ttt-score-num" id="s-p1">0</div>
                    </div>
                    <div class="ttt-score-box draw-side">
                        <div class="ttt-score-name">DRAW</div>
                        <div class="ttt-score-num" id="s-draw">0</div>
                    </div>
                    <div class="ttt-score-box o-side">
                        <div class="ttt-score-name">${opp}</div>
                        <div class="ttt-score-num" id="s-p2">0</div>
                    </div>
                </div>
                <div class="ttt-info-bar">
                    <div class="player-stat active" id="p1-stat">${this.p1Name} (X)</div>
                    <div class="vs">VS</div>
                    <div class="player-stat" id="p2-stat">${opp} (O)</div>
                </div>
                <div class="ttt-board" id="ttt-board">
                    ${Array(9).fill().map((_,i) => `<div class="ttt-cell" data-idx="${i}"></div>`).join('')}
                </div>
                <p id="ttt-status" class="game-status-msg">Your turn, ${this.p1Name}!</p>
                <button class="glass-btn small" onclick="TicTacToe.newRound()" style="margin-top:10px;width:auto;padding:10px 28px;">NEW ROUND</button>
            </div>`;
        this._resetBoard();
        this._bindCells();
    },

    _resetBoard() {
        this.board     = Array(9).fill(null);
        this.active    = true;
        this.isPlayerX = true;
        document.querySelectorAll('.ttt-cell').forEach(c => {
            c.textContent = '';
            c.className   = 'ttt-cell';
        });
        this._updateStatus(`Your turn, ${this.p1Name}!`);
        this._updateTurnUI();
    },

    _bindCells() {
        document.querySelectorAll('.ttt-cell').forEach(c =>
            c.addEventListener('click', () => this.humanMove(parseInt(c.dataset.idx)))
        );
    },

    newRound() { this._resetBoard(); },

    humanMove(idx) {
        if (!this.active || this.board[idx]) return;

        // In AI mode, only allow clicks during player's turn (X)
        if (this.mode === 'ai' && !this.isPlayerX) return;

        // Determine the current symbol based on whose turn it is
        const symbol = this.isPlayerX ? 'X' : 'O';
        this._place(idx, symbol);

        const win = this._checkWin(this.board, symbol);
        if (win)              return this._endGame(symbol, win);
        if (this._isFull())   return this._endGame(null, null);

        this.isPlayerX = !this.isPlayerX;
        this._updateTurnUI();

        if (this.mode === 'ai') setTimeout(() => this._aiTurn(), 450);
    },

    _aiTurn() {
        if (!this.active) return;
        const move = this._minimax(this.board, true).index;
        this._place(move, 'O');
        const win = this._checkWin(this.board, 'O');
        if (win)             return this._endGame('O', win);
        if (this._isFull())  return this._endGame(null, null);
        this.isPlayerX = true;
        this._updateTurnUI();
    },

    _place(idx, symbol) {
        this.board[idx] = symbol;
        const cell = document.querySelector(`.ttt-cell[data-idx="${idx}"]`);
        if (cell) {
            cell.textContent = symbol;
            cell.classList.add(symbol.toLowerCase());
        }
    },

    _checkWin(board, p) {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const l of lines) {
            if (l.every(i => board[i] === p)) return l;
        }
        return null;
    },

    _isFull() { return this.board.every(c => c); },

    _minimax(board, isMaximizing, depth = 0) {
        const aiWin  = this._checkWin(board, 'O');
        const humWin = this._checkWin(board, 'X');
        if (aiWin)  return { score:  10 - depth };
        if (humWin) return { score: -10 + depth };
        const empty = board.map((v,i) => v === null ? i : null).filter(v => v !== null);
        if (!empty.length) return { score: 0 };

        let best = isMaximizing ? { score: -Infinity } : { score: Infinity };
        for (const i of empty) {
            board[i] = isMaximizing ? 'O' : 'X';
            const result = this._minimax(board, !isMaximizing, depth + 1);
            board[i] = null;
            result.index = i;
            if (isMaximizing) { if (result.score > best.score) best = result; }
            else              { if (result.score < best.score) best = result; }
        }
        return best;
    },

    _endGame(symbol, winLine) {
        this.active = false;
        if (winLine) {
            winLine.forEach(i => {
                const cell = document.querySelector(`.ttt-cell[data-idx="${i}"]`);
                if (cell) cell.classList.add('winner');
            });
        }
        if (!symbol) {
            this.scores.draw++;
            document.getElementById('s-draw').textContent = this.scores.draw;
            this._updateStatus("It's a Draw! 🤝");
        } else if (symbol === 'X') {
            this.scores.p1++;
            document.getElementById('s-p1').textContent = this.scores.p1;
            this._updateStatus(`${this.p1Name} Wins! 🎉`);
            App.logWin('Tactical Toe');
        } else {
            this.scores.p2++;
            document.getElementById('s-p2').textContent = this.scores.p2;
            const name = this.mode === 'ai' ? 'Computer' : this.p2Name;
            this._updateStatus(`${name} Wins!`);
            if (this.mode === 'p2') App.logWin('Tactical Toe');
        }
    },

    _updateStatus(msg) {
        const el = document.getElementById('ttt-status');
        if (el) el.textContent = msg;
    },

    _updateTurnUI() {
        const p1 = document.getElementById('p1-stat');
        const p2 = document.getElementById('p2-stat');
        const opp = this.mode === 'ai' ? 'Computer' : this.p2Name;
        if (p1) p1.classList.toggle('active', this.isPlayerX);
        if (p2) p2.classList.toggle('active', !this.isPlayerX);
        if (this.active) {
            this._updateStatus(`Turn: ${this.isPlayerX ? this.p1Name : opp}`);
        }
    },

    restart() { this._resetBoard(); },
    destroy()  { /* nothing to clean up */ }
};
