// ╔══════════════════════════════════════════════════════════╗
// ║   MATH SPRINT — Timer + Streak + Difficulty Levels       ║
// ╚══════════════════════════════════════════════════════════╝
const MathSprint = {
    TOTAL_TIME: 60,

    init(container) {
        this.container = container;
        this.correct   = 0;
        this.total     = 0;
        this.streak    = 0;
        this.maxStreak = 0;
        this.seconds   = this.TOTAL_TIME;
        this.active    = false;
        this.ans       = 0;
        this._build();
    },

    _build() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:420px;">
                <h2 style="font-weight:900;">Math <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Sprint</span></h2>
                <div class="math-stats">
                    <div class="math-stat-box">⏱ <span id="math-time">${this.TOTAL_TIME}s</span></div>
                    <div class="math-stat-box">✅ <span id="math-correct">0</span></div>
                    <div class="math-stat-box">🔥 <span id="math-streak">0</span></div>
                </div>
                <div class="math-problem-area">
                    <div id="math-problem" class="math-problem">Press Start!</div>
                    <div id="math-feedback" class="math-feedback"></div>
                </div>
                <div class="math-options" id="math-options"></div>
                <p id="math-msg" class="game-status-msg">60-second math challenge!</p>
                <button class="glass-btn primary" id="math-start-btn" style="width:auto;padding:14px 36px;margin-top:12px;" onclick="MathSprint._start()">START!</button>
            </div>`;
    },

    _start() {
        const btn = document.getElementById('math-start-btn');
        if (btn) btn.style.display = 'none';
        this.active = true;
        this._startTimer();
        this._nextQuestion();
    },

    _nextQuestion() {
        if (!this.active) return;
        const level = Math.min(Math.floor(this.correct / 5), 3);
        let a, b, op, ans;
        const maxNum = 12 * (level + 1);
        const r = () => Math.floor(Math.random() * maxNum) + 1;
        const opList = level < 2 ? ['+','-','×'] : ['+','-','×','÷'];
        op = opList[Math.floor(Math.random() * opList.length)];

        if (op === '+') { a = r(); b = r(); ans = a + b; }
        else if (op === '-') { a = r(); b = Math.floor(Math.random()*a)+1; ans = a - b; }
        else if (op === '×') { a = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*12)+1; ans = a*b; }
        else { ans = Math.floor(Math.random()*12)+1; b = Math.floor(Math.random()*11)+2; a = ans * b; }

        this.ans = ans;

        const el = document.getElementById('math-problem');
        if (el) {
            el.textContent = `${a} ${op} ${b} = ?`;
            el.classList.remove('math-bounce');
            void el.offsetWidth;
            el.classList.add('math-bounce');
        }

        // Generate 4 unique multiple-choice options (no negatives, all distinct)
        const options  = [ans];
        let attempts = 0;
        while (options.length < 4 && attempts < 50) {
            // Generate offsets that stay non-negative and are unique
            const offset = Math.floor(Math.random() * 10) + 1;
            const sign = Math.random() < 0.5 ? 1 : -1;
            const w = ans + offset * sign;
            if (w >= 0 && !options.includes(w)) {
                options.push(w);
            }
            attempts++;
        }
        // Fallback: fill remaining slots with sequential values if random fails
        let fill = 1;
        while (options.length < 4) {
            const w = ans + fill;
            if (!options.includes(w)) options.push(w);
            fill++;
        }
        options.sort(() => Math.random() - 0.5);

        const optEl = document.getElementById('math-options');
        if (optEl) {
            optEl.innerHTML = options.map(v =>
                `<button class="math-opt-btn option-btn" onclick="MathSprint._answer(${v})">${v}</button>`
            ).join('');
        }
    },

    _answer(val) {
        if (!this.active) return;
        const fb = document.getElementById('math-feedback');
        if (val === this.ans) {
            this.correct++;
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;
            const cEl = document.getElementById('math-correct');
            const sEl = document.getElementById('math-streak');
            if (cEl) cEl.textContent = this.correct;
            if (sEl) sEl.textContent = this.streak;
            if (fb) { fb.textContent = '✅ Correct!'; fb.className = 'math-feedback correct'; }
        } else {
            this.streak = 0;
            const sEl = document.getElementById('math-streak');
            if (sEl) sEl.textContent = 0;
            if (fb) { fb.textContent = `❌ Answer was ${this.ans}`; fb.className = 'math-feedback wrong'; }
        }
        this.total++;
        setTimeout(() => {
            if (fb) fb.textContent = '';
            this._nextQuestion();
        }, 500);
    },

    _startTimer() {
        this._stopTimer();
        this._timerInterval = setInterval(() => {
            this.seconds--;
            const el = document.getElementById('math-time');
            if (el) { el.textContent = this.seconds + 's'; el.style.color = this.seconds <= 10 ? '#f43f5e' : ''; }
            if (this.seconds <= 0) {
                this._stopTimer();
                this.active = false;
                const optEl = document.getElementById('math-options');
                if (optEl) optEl.innerHTML = '';
                const prob = document.getElementById('math-problem');
                if (prob) prob.textContent = '⏱ Time\'s Up!';
                const msg  = document.getElementById('math-msg');
                const acc  = this.total > 0 ? Math.round((this.correct/this.total)*100) : 0;
                if (msg)  msg.textContent = `Score: ${this.correct} correct (${acc}% accuracy) | Best streak: ${this.maxStreak}`;
                if (this.correct >= 10) App.logWin('Math Sprint');
            }
        }, 1000);
    },

    _stopTimer() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    },

    restart() { this._stopTimer(); this.init(this.container); },
    destroy()  { this._stopTimer(); }
};
