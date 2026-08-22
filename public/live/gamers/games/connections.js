// ╔══════════════════════════════════════════════════════════╗
// ║  CONNECTIONS — Real categories, mistake counter, reveal  ║
// ╚══════════════════════════════════════════════════════════╝
const Connections = {
    PUZZLE_SETS: [
        {
            groups: [
                { label: '🍎 Fruits',       color: '#10b981', items: ['Apple','Mango','Grape','Peach'] },
                { label: '🚗 Vehicles',     color: '#3b82f6', items: ['Car','Bus','Bike','Train'] },
                { label: '🎸 Instruments',  color: '#f59e0b', items: ['Guitar','Piano','Drums','Flute'] },
                { label: '⚽ Sports',       color: '#f43f5e', items: ['Soccer','Tennis','Hockey','Rugby'] }
            ]
        },
        {
            groups: [
                { label: '🌊 Oceans',       color: '#10b981', items: ['Pacific','Atlantic','Indian','Arctic'] },
                { label: '🦁 Big Cats',     color: '#3b82f6', items: ['Lion','Tiger','Cheetah','Jaguar'] },
                { label: '🌍 Planets',      color: '#f59e0b', items: ['Mars','Venus','Saturn','Jupiter'] },
                { label: '📚 Genres',       color: '#f43f5e', items: ['Mystery','Horror','Comedy','Romance'] }
            ]
        }
    ],

    init(container) {
        this.container = container;
        const puzzleSet = this.PUZZLE_SETS[Math.floor(Math.random() * this.PUZZLE_SETS.length)];
        this.groups     = puzzleSet.groups;
        this.mistakes   = 0;
        this.solved     = 0;
        this.selected   = [];
        this.solvedGroups = [];

        // Flatten and shuffle all items
        this.items = this.groups.flatMap((g, gi) => g.items.map(item => ({ item, group: gi })));
        this.items.sort(() => Math.random() - 0.5);

        this._build();
    },

    _build() {
        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:480px;">
                <h2 style="font-weight:900;">Connections</h2>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:16px;">Group 4 items that share a category. You have 4 mistakes.</p>
                <div id="conn-solved"></div>
                <div class="conn-grid" id="conn-grid"></div>
                <div class="conn-mistakes">
                    <span>Mistakes: </span>
                    <span id="conn-dots">${'🔴'.repeat(0)}${'⚪'.repeat(4)}</span>
                </div>
                <p id="conn-msg" class="game-status-msg">Select 4 related words!</p>
                <button class="glass-btn primary" style="width:auto;padding:12px 28px;margin-top:12px;" onclick="Connections._check()">SUBMIT</button>
            </div>`;
        this._render();
    },

    _render() {
        const g = document.getElementById('conn-grid');
        if (!g) return;
        const remaining = this.items.filter((_,i) => !this.solvedGroups.includes(
            this.items[i]?.group
        ));

        // Only show unsolved items
        const unsolved = this.items.filter(({group}) => !this.solvedGroups.includes(group));

        g.innerHTML = unsolved.map(({item}, i) => {
            const isSelected = this.selected.includes(item);
            return `<div class="conn-cell ${isSelected ? 'conn-selected' : ''}" data-item="${item}">${item}</div>`;
        }).join('');

        g.querySelectorAll('.conn-cell').forEach(c =>
            c.addEventListener('click', () => this._toggle(c.dataset.item))
        );
    },

    _toggle(item) {
        if (this.selected.includes(item)) {
            this.selected = this.selected.filter(i => i !== item);
        } else if (this.selected.length < 4) {
            this.selected.push(item);
        }
        this._render();
        const msg = document.getElementById('conn-msg');
        if (msg) msg.textContent = `Selected: ${this.selected.length}/4`;
    },

    _check() {
        if (this.selected.length !== 4) {
            const msg = document.getElementById('conn-msg');
            if (msg) msg.textContent = 'Select exactly 4 items!';
            return;
        }

        // Find which group each selected item belongs to
        const groupCounts = {};
        this.selected.forEach(item => {
            const obj = this.items.find(o => o.item === item);
            if (obj) groupCounts[obj.group] = (groupCounts[obj.group] || 0) + 1;
        });

        const groupIds   = Object.keys(groupCounts).map(Number);
        const isCorrect  = groupIds.length === 1 && groupCounts[groupIds[0]] === 4;

        if (isCorrect) {
            const gId = groupIds[0];
            this.solvedGroups.push(gId);
            this.solved++;
            this.selected = [];
            this._renderSolvedGroup(gId);
            this._render();

            const msg = document.getElementById('conn-msg');
            if (this.solved === 4) {
                if (msg) msg.textContent = '🎉 All groups found!';
                App.logWin('Connections');
            } else {
                if (msg) msg.textContent = `✅ Correct! ${4 - this.solved} groups left.`;
            }
        } else {
            this.mistakes++;
            this.selected = [];
            const dots = document.getElementById('conn-dots');
            if (dots) dots.innerHTML = '🔴'.repeat(this.mistakes) + '⚪'.repeat(4 - this.mistakes);
            const msg = document.getElementById('conn-msg');

            // Check if one away
            const maxCount = Math.max(...Object.values(groupCounts));
            const hint = maxCount === 3 ? ' (One away! 🔥)' : '';
            if (msg) msg.textContent = `❌ Wrong!${hint}`;

            if (this.mistakes >= 4) {
                if (msg) msg.textContent = '💀 Game Over! Revealing answers…';
                setTimeout(() => this._revealAll(), 800);
            }
        }
    },

    _renderSolvedGroup(gId) {
        const solved = document.getElementById('conn-solved');
        if (!solved) return;
        const g = this.groups[gId];
        const div = document.createElement('div');
        div.className = 'conn-solved-row';
        div.style.background = g.color + '33';
        div.style.borderColor = g.color;
        div.innerHTML = `<strong>${g.label}</strong>: ${g.items.join(' · ')}`;
        solved.appendChild(div);
    },

    _revealAll() {
        this.groups.forEach((g, gi) => {
            if (!this.solvedGroups.includes(gi)) this._renderSolvedGroup(gi);
        });
        const grid = document.getElementById('conn-grid');
        if (grid) grid.innerHTML = '';
    },

    restart() { this.init(this.container); },
    destroy()  { }
};
