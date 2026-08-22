// ╔══════════════════════════════════════════════════════════╗
// ║   SPEED ZIP — Countdown Timer + Shrinking Target         ║
// ╚══════════════════════════════════════════════════════════╝
const ZipSpeed = {
    TOTAL_TIME: 30,

    init(container) {
        this.container = container;
        this.hits    = 0;
        this.seconds = this.TOTAL_TIME;
        this.active  = false;
        this._build();
    },

    _build() {
        this.container.innerHTML = `
            <div class="zip-container">
                <h2 style="font-weight:900;">Speed <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Zip</span></h2>
                <div class="zip-stats">
                    <div class="zip-stat-box">⏱ <span id="zip-time">${this.TOTAL_TIME}s</span></div>
                    <div class="zip-stat-box">⚡ <span id="zip-hits">0</span> hits</div>
                </div>
                <div class="zip-area" id="zip-area">
                    <div class="zip-target" id="zip-target">TAP!</div>
                </div>
                <p id="zip-status" class="game-status-msg">Click the target to start!</p>
            </div>`;

        this._positionTarget();
        document.getElementById('zip-target').addEventListener('click', () => this._onHit());
    },

    _positionTarget() {
        const t = document.getElementById('zip-target');
        if (!t) return;
        const size = Math.max(50, 100 - this.hits * 4); // shrinks with each hit
        t.style.width  = size + 'px';
        t.style.height = size + 'px';
        t.style.fontSize = Math.max(0.6, 1.2 - this.hits * 0.04) + 'rem';
        // Random position inside the zip-area
        const area = document.getElementById('zip-area');
        if (!area) return;
        const aw = area.clientWidth  || 300;
        const ah = area.clientHeight || 200;
        const maxX = Math.max(0, aw - size);
        const maxY = Math.max(0, ah - size);
        t.style.left = Math.floor(Math.random() * maxX) + 'px';
        t.style.top  = Math.floor(Math.random() * maxY) + 'px';
    },

    _onHit() {
        if (!this.active) {
            // First hit — start timer
            this.active = true;
            this._startTimer();
        }
        this.hits++;
        const el = document.getElementById('zip-hits');
        if (el) el.textContent = this.hits;

        // Flash effect
        const t = document.getElementById('zip-target');
        if (t) { t.classList.add('zip-hit'); setTimeout(() => t.classList.remove('zip-hit'), 150); }

        this._positionTarget();
    },

    _startTimer() {
        this._stopTimer();
        this._timerInterval = setInterval(() => {
            this.seconds--;
            const el = document.getElementById('zip-time');
            if (el) el.textContent = this.seconds + 's';
            if (el) el.style.color = this.seconds <= 10 ? '#f43f5e' : '';

            if (this.seconds <= 0) {
                this._stopTimer();
                this.active = false;
                const t = document.getElementById('zip-target');
                if (t) t.style.display = 'none';
                const msg = document.getElementById('zip-status');
                if (msg) msg.textContent = `⏱ Time's up! You scored ${this.hits} hits!`;
                if (this.hits >= 10) App.logWin('Speed Zip');
            }
        }, 1000);
    },

    _stopTimer() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    },

    restart() { this._stopTimer(); this.init(this.container); },
    destroy()  { this._stopTimer(); }
};
