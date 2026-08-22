// ╔══════════════════════════════════════════════════════════╗
// ║   WORD CLIMB — Real 1-letter diff validation + chains    ║
// ╚══════════════════════════════════════════════════════════╝
const Crossclimb = {
    CHAINS: [
        { steps: ['CATS','BATS','HATS','HITS','HIPS','TIPS','TOPS','TOSS'] },
        { steps: ['COLD','BOLD','BOLT','BOOT','BOAT','COAT','COST','LOST'] },
        { steps: ['GAME','CAME','CASE','CASH','BASH','BASE','BARE','CARE'] },
        { steps: ['WORD','WARD','WARM','FARM','FIRM','FIRE','HIRE','WIRE'] },
        { steps: ['HEAD','HEAT','HEAP','REAP','READ','ROAD','LOAD','LEAD'] },
        { steps: ['SHIP','SHOP','SHOT','SLOT','SLOW','FLOW','FLAW','FLAG'] }
    ],

    init(container) {
        this.container = container;
        this.chain     = this.CHAINS[Math.floor(Math.random() * this.CHAINS.length)];
        this.steps     = this.chain.steps;
        this.current   = 0;
        this.wrong     = 0;
        this._build();
    },

    _build() {
        const start = this.steps[0];
        const goal  = this.steps[this.steps.length - 1];
        const total = this.steps.length - 1;

        this.container.innerHTML = `
            <div class="ttt-container" style="max-width:420px;">
                <h2 style="font-weight:900;">Word <span style="background:var(--primary-gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Climb</span></h2>
                <div class="word-climb-trail" id="word-trail">
                    ${this.steps.map((w,i) => `
                        <div class="word-step ${i===0?'confirmed':''}" id="wstep-${i}">
                            ${i===0 ? this._renderWord(w,w) : w.split('').map((_,j) => `<span class="wletter" data-pos="${j}">?</span>`).join('')}
                        </div>
                    `).join('<div class="word-arrow">↓</div>')}
                </div>
                <div class="word-climb-input">
                    <input type="text" id="cross-input" class="glass-input" maxlength="4"
                        placeholder="Type next word…" autocomplete="off" style="text-transform:uppercase;">
                    <button class="glass-btn primary" style="width:auto;padding:14px 28px;margin-top:0;" onclick="Crossclimb._submit()">SUBMIT</button>
                </div>
                <p id="cross-msg" class="game-status-msg">Change 1 letter each step. Start: <strong>${start}</strong> → Goal: <strong>${goal}</strong></p>
                <p style="color:var(--text-secondary);font-size:0.8rem;">Steps: ${this.current}/${total} | Wrong: <span id="cross-wrong">0</span></p>
            </div>`;

        const inp = document.getElementById('cross-input');
        if (inp) {
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') this._submit(); });
            inp.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
            inp.focus();
        }

        this._updateTrail();
    },

    _renderWord(word, reference) {
        return word.split('').map((ch, i) => {
            const diff = reference && ch !== reference[i] ? ' changed' : '';
            return `<span class="wletter confirmed-letter${diff}">${ch}</span>`;
        }).join('');
    },

    _submit() {
        const inp  = document.getElementById('cross-input');
        if (!inp) return;
        const word = inp.value.trim().toUpperCase();
        inp.value  = '';

        const prev   = this.steps[this.current];
        const target = this.steps[this.current + 1];
        const msg    = document.getElementById('cross-msg');

        if (word.length !== prev.length) {
            if (msg) msg.textContent = `❌ Must be ${prev.length} letters!`;
            return;
        }

        const diffs = prev.split('').filter((ch, i) => ch !== word[i]).length;
        if (diffs !== 1) {
            this.wrong++;
            const wEl = document.getElementById('cross-wrong');
            if (wEl) wEl.textContent = this.wrong;
            if (msg) msg.textContent = diffs === 0 ? '❌ That\'s the same word!' : `❌ Change exactly 1 letter (changed ${diffs})`;
            return;
        }

        if (word !== target) {
            this.wrong++;
            const wEl = document.getElementById('cross-wrong');
            if (wEl) wEl.textContent = this.wrong;
            if (msg) msg.textContent = `❌ Valid change, but not the right word! Hint: ${target[0]}???`;
            return;
        }

        this.current++;
        this._updateTrail();

        if (this.current === this.steps.length - 1) {
            if (msg) msg.textContent = `🎉 You climbed the word ladder! ${this.wrong} wrong guesses.`;
            App.logWin('Word Climb');
        } else {
            if (msg) msg.textContent = `✅ Correct! ${this.steps.length - 1 - this.current} steps left.`;
            inp.focus();
        }
    },

    _updateTrail() {
        this.steps.forEach((word, i) => {
            const el = document.getElementById(`wstep-${i}`);
            if (!el) return;
            if (i <= this.current) {
                const prev = i > 0 ? this.steps[i-1] : word;
                el.classList.add('confirmed');
                el.innerHTML = this._renderWord(word, prev);
            }
        });
    },

    restart() { this.init(this.container); },
    destroy()  { }
};
