// ╔══════════════════════════════════════════════════════════╗
// ║  MEMORY PULSE — Uses real images, reshuffled every game  ║
// ╚══════════════════════════════════════════════════════════╝
const MemoryMatch = {
    /* Large pool of themed image sets — random subset picked each game */
    IMAGE_POOL: [
        /* Animals */
        { id: 'lion',       url: 'https://picsum.photos/seed/lion/120/120',       label: '🦁' },
        { id: 'tiger',      url: 'https://picsum.photos/seed/tiger2/120/120',     label: '🐯' },
        { id: 'elephant',   url: 'https://picsum.photos/seed/elephant3/120/120',  label: '🐘' },
        { id: 'dolphin',    url: 'https://picsum.photos/seed/dolphin4/120/120',   label: '🐬' },
        { id: 'eagle',      url: 'https://picsum.photos/seed/eagle5/120/120',     label: '🦅' },
        { id: 'butterfly',  url: 'https://picsum.photos/seed/butterfly6/120/120', label: '🦋' },
        { id: 'panda',      url: 'https://picsum.photos/seed/panda7/120/120',     label: '🐼' },
        { id: 'wolf',       url: 'https://picsum.photos/seed/wolf8/120/120',      label: '🐺' },
        /* Nature */
        { id: 'mountain',   url: 'https://picsum.photos/seed/mountain1/120/120',  label: '🏔️' },
        { id: 'ocean',      url: 'https://picsum.photos/seed/ocean2/120/120',     label: '🌊' },
        { id: 'forest',     url: 'https://picsum.photos/seed/forest3/120/120',    label: '🌲' },
        { id: 'sunset',     url: 'https://picsum.photos/seed/sunset4/120/120',    label: '🌅' },
        { id: 'desert',     url: 'https://picsum.photos/seed/desert5/120/120',    label: '🏜️' },
        { id: 'waterfall',  url: 'https://picsum.photos/seed/waterfall6/120/120', label: '💧' },
        { id: 'aurora',     url: 'https://picsum.photos/seed/aurora7/120/120',    label: '🌌' },
        /* Cities */
        { id: 'city',       url: 'https://picsum.photos/seed/city1/120/120',      label: '🏙️' },
        { id: 'bridge',     url: 'https://picsum.photos/seed/bridge2/120/120',    label: '🌉' },
        { id: 'temple',     url: 'https://picsum.photos/seed/temple3/120/120',    label: '🛕' },
        { id: 'castle',     url: 'https://picsum.photos/seed/castle4/120/120',    label: '🏰' },
        { id: 'tower',      url: 'https://picsum.photos/seed/tower5/120/120',     label: '🗼' },
        /* Tech */
        { id: 'robot',      url: 'https://picsum.photos/seed/robot1/120/120',     label: '🤖' },
        { id: 'rocket',     url: 'https://picsum.photos/seed/rocket2/120/120',    label: '🚀' },
        { id: 'satellite',  url: 'https://picsum.photos/seed/satellite3/120/120', label: '🛰️' },
        { id: 'circuit',    url: 'https://picsum.photos/seed/circuit4/120/120',   label: '🔌' },
        /* Food */
        { id: 'pizza',      url: 'https://picsum.photos/seed/pizza1/120/120',     label: '🍕' },
        { id: 'sushi',      url: 'https://picsum.photos/seed/sushi2/120/120',     label: '🍣' },
        { id: 'cake',       url: 'https://picsum.photos/seed/cake3/120/120',      label: '🎂' },
        { id: 'icecream',   url: 'https://picsum.photos/seed/icecream4/120/120',  label: '🍦' },
        { id: 'coffee',     url: 'https://picsum.photos/seed/coffee5/120/120',    label: '☕' },
        { id: 'fruit',      url: 'https://picsum.photos/seed/fruit6/120/120',     label: '🍎' },
    ],

    SETS: {
        easy: { cols: 4, rows: 4, pairs: 8  },
        hard: { cols: 6, rows: 5, pairs: 15 }
    },

    init(container, options = {}) {
        this.container = container;
        this.diff      = options.difficulty || 'easy';
        this.set       = this.SETS[this.diff];
        this.pairs     = this.set.pairs;
        this.totalCards = this.set.cols * this.set.rows;

        // Pick random images from pool — different each game
        const shuffledPool = [...this.IMAGE_POOL].sort(() => Math.random() - 0.5);
        // Add a random salt to URLs so images differ between games
        const salt = Date.now();
        this.selectedImages = shuffledPool.slice(0, this.pairs).map((img, i) => ({
            ...img,
            url: `https://picsum.photos/seed/${img.id}${salt}${i}/120/120`
        }));

        // Create pairs and shuffle
        this.cards = [];
        this.selectedImages.forEach((img, idx) => {
            this.cards.push({ pairIdx: idx, ...img });
            this.cards.push({ pairIdx: idx, ...img });
        });
        this.cards.sort(() => Math.random() - 0.5);

        this.flipped   = [];
        this.found     = 0;
        this.moves     = 0;
        this.locked    = false;
        this.seconds   = 0;
        this.foundSet  = new Set();
        this._buildUI();
        this._startTimer();
    },

    _buildUI() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:${this.diff === 'hard' ? '650px' : '520px'};">
                <div class="memory-header">
                    <div class="mem-stat">⏱ <span id="mem-time">0s</span></div>
                    <div class="mem-stat">🃏 <span id="mem-pairs">0/${this.pairs}</span></div>
                    <div class="mem-stat">🔄 <span id="mem-moves">0</span></div>
                </div>
                <div class="memory-grid" id="m-grid"
                     style="grid-template-columns:repeat(${this.set.cols},1fr);"></div>
                <p id="mem-status" class="game-status-msg">Find all ${this.pairs} pairs!</p>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('m-grid');
        if (!g) return;

        g.innerHTML = this.cards.map((card, i) => {
            const isFound = this.foundSet.has(i);
            return `
            <div class="memory-card ${isFound ? 'found' : ''}" data-idx="${i}">
                <div class="card-inner">
                    <div class="card-back">
                        <div class="card-back-design">
                            <span class="card-back-icon">❓</span>
                        </div>
                    </div>
                    <div class="card-front">
                        <img src="${card.url}" alt="${card.label}"
                             class="mem-card-img"
                             loading="lazy"
                             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <span class="mem-card-emoji" style="display:none">${card.label}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        g.querySelectorAll('.memory-card').forEach(c => {
            c.addEventListener('click', () => this._flip(c));
        });
    },

    _flip(card) {
        const idx = parseInt(card.dataset.idx);
        if (this.locked || card.classList.contains('flipped') || card.classList.contains('found')) return;

        card.classList.add('flipped');
        this.flipped.push({ el: card, idx });

        if (this.flipped.length === 2) {
            this.locked = true;
            this.moves++;
            const mEl = document.getElementById('mem-moves');
            if (mEl) mEl.textContent = this.moves;

            const [a, b] = this.flipped;
            if (this.cards[a.idx].pairIdx === this.cards[b.idx].pairIdx) {
                // Match!
                setTimeout(() => {
                    a.el.classList.add('found');
                    b.el.classList.add('found');
                    this.foundSet.add(a.idx);
                    this.foundSet.add(b.idx);
                    this.found++;
                    const pEl = document.getElementById('mem-pairs');
                    if (pEl) pEl.textContent = `${this.found}/${this.pairs}`;
                    this.flipped = [];
                    this.locked  = false;
                    if (this.found === this.pairs) this._win();
                }, 500);
            } else {
                // No match — flip back
                setTimeout(() => {
                    a.el.classList.remove('flipped');
                    b.el.classList.remove('flipped');
                    this.flipped = [];
                    this.locked  = false;
                }, 1000);
            }
        }
    },

    _startTimer() {
        this._stopTimer();
        this._timerInterval = setInterval(() => {
            this.seconds++;
            const el = document.getElementById('mem-time');
            const m  = Math.floor(this.seconds / 60);
            const s  = this.seconds % 60;
            if (el) el.textContent = m > 0 ? `${m}m${s}s` : `${s}s`;
        }, 1000);
    },

    _stopTimer() {
        if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
    },

    _win() {
        this._stopTimer();
        const el = document.getElementById('mem-status');
        if (el) el.textContent = `Cleared in ${this.seconds}s with ${this.moves} moves! 🎉`;
        App.logWin('Memory Pulse');
    },

    restart() {
        this._stopTimer();
        this.init(this.container, { difficulty: this.diff });
    },

    destroy() { this._stopTimer(); }
};
