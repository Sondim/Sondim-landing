(function () {
    const DATA = window.STUDY_DATA;
    const KEY = "sondim-cst-study-v1";
    const RUN_LEN = 10;
    const HEARTS = 5;
    const MASTER_HITS = 2;
    const UNLOCK_NEED = 8;
    const XP_PER_LEVEL = 120;

    const DAYS = {
        1: { title: "What it is", blurb: "Each source's model of the inner voice." },
        2: { title: "Cost & bind", blurb: "What it costs, why it sticks, the 'I need this' trap." },
        3: { title: "What to do", blurb: "Methods — kept distinct. Contrast items live here too." },
    };

    const cardById = Object.fromEntries(DATA.cards.map((c) => [c.id, c]));

    function todayStamp() {
        return new Date().toISOString().slice(0, 10);
    }

    function defaultState() {
        return {
            xp: 0,
            comboBest: 0,
            streak: { last: "", count: 0 },
            correct: {},
            review: [],
            unlocked: [1],
            seen: [],
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return defaultState();
            return Object.assign(defaultState(), JSON.parse(raw));
        } catch {
            return defaultState();
        }
    }

    function save() {
        localStorage.setItem(KEY, JSON.stringify(state));
    }

    let state = load();
    let run = null;
    let audioCtx = null;

    function beep(freq, dur, type, gain) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type || "square";
            o.frequency.value = freq;
            g.gain.value = gain || 0.04;
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start();
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
            o.stop(audioCtx.currentTime + dur);
        } catch {
            /* ignore */
        }
    }

    function sfxCorrect(combo) {
        beep(520, 0.08);
        setTimeout(() => beep(720 + Math.min(combo, 8) * 20, 0.12), 70);
    }
    function sfxWrong() {
        beep(180, 0.18, "sawtooth", 0.05);
    }
    function sfxUnlock() {
        [392, 494, 587, 784].forEach((f, i) => setTimeout(() => beep(f, 0.14, "square", 0.05), i * 90));
    }

    function levelOf(xp) {
        return Math.floor(xp / XP_PER_LEVEL) + 1;
    }
    function xpIntoLevel(xp) {
        return xp % XP_PER_LEVEL;
    }
    function masteredCount(cardId) {
        return state.correct[cardId] || 0;
    }
    function isMastered(cardId) {
        return masteredCount(cardId) >= MASTER_HITS && !state.review.includes(cardId);
    }
    function masteredOnDay(day) {
        return DATA.cards.filter((c) => c.day === day && isMastered(c.id)).length;
    }
    function cardsOnDay(day) {
        return DATA.cards.filter((c) => c.day === day).length;
    }
    function sourceMastery(sourceId) {
        const all = DATA.cards.filter((c) => c.sourceId === sourceId);
        const got = all.filter((c) => isMastered(c.id)).length;
        return { got, all: all.length };
    }

    function touchStreak() {
        const t = todayStamp();
        if (state.streak.last === t) return;
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yesterday = y.toISOString().slice(0, 10);
        if (state.streak.last === yesterday) state.streak.count += 1;
        else state.streak.count = 1;
        state.streak.last = t;
    }

    function maybeUnlock() {
        const unlocked = [];
        if (!state.unlocked.includes(2) && masteredOnDay(1) >= UNLOCK_NEED) {
            state.unlocked.push(2);
            unlocked.push(2);
        }
        if (!state.unlocked.includes(3) && masteredOnDay(2) >= UNLOCK_NEED) {
            state.unlocked.push(3);
            unlocked.push(3);
        }
        return unlocked;
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function pickQuestions(filterFn) {
        const pool = DATA.questions.filter((q) => filterFn(q, cardById[q.cardId]));
        const reviewFirst = pool.filter((q) => state.review.includes(q.cardId));
        const rest = pool.filter((q) => !state.review.includes(q.cardId));
        rest.sort((a, b) => {
            const ac = masteredCount(a.cardId);
            const bc = masteredCount(b.cardId);
            if (ac !== bc) return ac - bc;
            const as = state.seen.includes(a.id) ? 1 : 0;
            const bs = state.seen.includes(b.id) ? 1 : 0;
            return as - bs;
        });
        const ordered = shuffle(reviewFirst).concat(rest);
        const picked = [];
        const usedCards = new Set();
        for (const q of ordered) {
            if (usedCards.has(q.cardId)) continue;
            picked.push(q);
            usedCards.add(q.cardId);
            if (picked.length >= RUN_LEN) break;
        }
        if (picked.length < Math.min(RUN_LEN, pool.length)) {
            for (const q of shuffle(pool)) {
                if (picked.find((p) => p.id === q.id)) continue;
                picked.push(q);
                if (picked.length >= RUN_LEN) break;
            }
        }
        return picked;
    }

    const $ = (id) => document.getElementById(id);
    const views = ["hub", "quiz", "feedback", "summary", "notebook"];

    function show(name) {
        views.forEach((v) => {
            const el = $("view-" + v);
            if (!el) return;
            el.classList.toggle("hidden", v !== name);
            if (v === name) {
                el.classList.remove("fade-in");
                void el.offsetWidth;
                el.classList.add("fade-in");
            }
        });
    }

    function renderHud() {
        const lv = levelOf(state.xp);
        const into = xpIntoLevel(state.xp);
        $("hud-level").textContent = String(lv);
        $("hud-streak").textContent = String(state.streak.count);
        $("hud-xp-fill").style.width = (into / XP_PER_LEVEL) * 100 + "%";
        $("hud-xp-label").textContent = into + " / " + XP_PER_LEVEL + "  ·  " + state.xp + " XP";
        $("review-count").textContent = String(state.review.length);
        $("best-combo").textContent = String(state.comboBest);
    }

    function renderHub() {
        renderHud();
        const grid = $("day-grid");
        grid.innerHTML = "";
        [1, 2, 3].forEach((day) => {
            const open = state.unlocked.includes(day);
            const m = masteredOnDay(day);
            const tot = cardsOnDay(day);
            const btn = document.createElement("button");
            btn.className = "btn-8bit day-card" + (open ? " btn-yellow" : "");
            btn.disabled = !open;
            btn.innerHTML =
                '<div class="font-8bit" style="font-size:11px;">Day ' + day + "</div>" +
                '<div style="font-family:Open Sans,sans-serif;text-transform:none;font-size:13px;line-height:1.4;font-weight:700;">' +
                DAYS[day].title + "</div>" +
                '<div style="font-family:Open Sans,sans-serif;text-transform:none;font-size:12px;line-height:1.4;color:#3f3f46;">' +
                (open ? DAYS[day].blurb : "Master " + UNLOCK_NEED + " cards on Day " + (day - 1) + " to unlock.") +
                "</div>" +
                '<div class="font-8bit" style="font-size:8px;margin-top:auto;">' +
                (open ? m + " / " + tot + " mastered" : "LOCKED") + "</div>";
            if (open) btn.addEventListener("click", () => startRun({ kind: "day", day }));
            grid.appendChild(btn);
        });

        const srcGrid = $("src-grid");
        srcGrid.innerHTML = "";
        Object.values(DATA.sources).forEach((src) => {
            const m = sourceMastery(src.id);
            if (!m.all) return;
            const b = document.createElement("button");
            b.className = "btn-8bit";
            b.style.flexDirection = "column";
            b.innerHTML =
                '<div>' + src.short + "</div>" +
                '<div style="font-family:Open Sans,sans-serif;text-transform:none;font-size:11px;margin-top:6px;">' +
                m.got + " / " + m.all + "</div>";
            b.addEventListener("click", () => startRun({ kind: "source", sourceId: src.id }));
            srcGrid.appendChild(b);
        });
    }

    function startRun(mode) {
        let qs;
        let label;
        if (mode.kind === "day") {
            qs = pickQuestions((_q, card) => card.day === mode.day);
            label = "DAY " + mode.day + " · " + DAYS[mode.day].title;
        } else if (mode.kind === "source") {
            qs = pickQuestions((_q, card) => card.sourceId === mode.sourceId);
            label = DATA.sources[mode.sourceId].short.toUpperCase();
        } else {
            qs = pickQuestions((_q, card) => state.review.includes(card.id));
            label = "REVIEW PILE";
        }
        if (!qs.length) {
            alert("Nothing to quiz here yet.");
            return;
        }
        run = {
            mode,
            label,
            questions: qs,
            i: 0,
            hearts: HEARTS,
            combo: 0,
            gained: 0,
            hits: 0,
            misses: 0,
            awaiting: false,
        };
        touchStreak();
        save();
        renderQuiz();
        show("quiz");
    }

    function heartsHtml(n) {
        return "♥".repeat(n) + '<span style="color:#d4d4d8">' + "♥".repeat(Math.max(0, HEARTS - n)) + "</span>";
    }

    function renderQuiz() {
        const q = run.questions[run.i];
        $("quiz-meta").textContent = run.label + "  ·  " + (q.type === "contrast" ? "CONTRAST" : q.type.toUpperCase());
        $("quiz-hearts").innerHTML = heartsHtml(run.hearts);
        $("quiz-combo").textContent = String(run.combo);
        const pct = (run.i / run.questions.length) * 100;
        $("quiz-progress-fill").style.width = pct + "%";
        $("quiz-progress-label").textContent = run.i + 1 + " / " + run.questions.length;
        $("quiz-prompt").textContent = q.prompt;
        const box = $("quiz-choices");
        box.innerHTML = "";
        q.choices.forEach((text, idx) => {
            const b = document.createElement("button");
            b.className = "btn-8bit choice";
            b.textContent = text;
            b.addEventListener("click", () => answer(idx, b));
            box.appendChild(b);
        });
        run.awaiting = false;
    }

    function floatCombo(n) {
        const el = $("combo-float");
        el.textContent = n >= 3 ? "COMBO x" + n : "+XP";
        el.classList.remove("hidden");
        setTimeout(() => el.classList.add("hidden"), 500);
    }

    function answer(idx) {
        if (run.awaiting) return;
        run.awaiting = true;
        const q = run.questions[run.i];
        const card = cardById[q.cardId];
        const src = DATA.sources[card.sourceId];
        const ok = idx === q.correct;
        const buttons = [...document.querySelectorAll("#quiz-choices .choice")];
        buttons.forEach((b, i) => {
            b.disabled = true;
            if (i === q.correct) b.classList.add("correct");
            if (i === idx && !ok) b.classList.add("wrong");
        });

        if (!state.seen.includes(q.id)) {
            state.seen.push(q.id);
            if (state.seen.length > 400) state.seen = state.seen.slice(-300);
        }

        if (ok) {
            run.combo += 1;
            run.hits += 1;
            const mult = 1 + Math.floor(run.combo / 3);
            const gain = 10 * mult;
            run.gained += gain;
            state.xp += gain;
            state.comboBest = Math.max(state.comboBest, run.combo);
            state.correct[card.id] = (state.correct[card.id] || 0) + 1;
            state.review = state.review.filter((id) => id !== card.id);
            sfxCorrect(run.combo);
            if (run.combo >= 2) floatCombo(run.combo);
            $("fb-banner").textContent = mult > 1 ? "CORRECT  x" + mult : "CORRECT";
            $("fb-banner").style.color = "#3f6212";
        } else {
            run.combo = 0;
            run.misses += 1;
            run.hearts -= 1;
            if (!state.review.includes(card.id)) state.review.push(card.id);
            sfxWrong();
            $("view-quiz").classList.add("shake");
            setTimeout(() => $("view-quiz").classList.remove("shake"), 300);
            $("fb-banner").textContent = "MISSED";
            $("fb-banner").style.color = "#991b1b";
        }

        $("fb-source").textContent = src.short + " · " + card.where + " · Day " + card.day;
        $("fb-claim").textContent = card.claim;
        $("fb-why").textContent = card.whyItMatters;
        $("fb-conflict").textContent = card.conflict ? "Do not flatten: " + card.conflict : "";
        $("fb-hint").textContent = q.hint || "";
        save();
        renderHud();

        setTimeout(() => show("feedback"), 280);
    }

    function afterFeedback() {
        const dead = run.hearts <= 0;
        const last = run.i >= run.questions.length - 1;
        if (dead || last) {
            endRun(dead);
            return;
        }
        run.i += 1;
        renderQuiz();
        show("quiz");
    }

    function endRun(dead) {
        const newDays = maybeUnlock();
        save();
        $("sum-title").textContent = dead ? "Hearts gone" : "Run complete";
        $("sum-body").innerHTML =
            "Hits <b>" + run.hits + "</b> · Misses <b>" + run.misses + "</b> · XP this run <b>" + run.gained + "</b>" +
            "<br>Level " + levelOf(state.xp) + " · Review pile " + state.review.length +
            (dead ? "<br>Progress is kept. Review pile is waiting." : "");
        const u = $("sum-unlock");
        if (newDays.length) {
            u.classList.remove("hidden");
            u.textContent = "UNLOCKED: Day " + newDays.join(" & Day ");
            sfxUnlock();
        } else {
            u.classList.add("hidden");
        }
        renderHud();
        show("summary");
    }

    function renderNotebook() {
        const body = $("nb-body");
        body.innerHTML = "";
        [1, 2, 3].forEach((day) => {
            const h = document.createElement("h3");
            h.className = "font-8bit";
            h.style.cssText = "font-size:10px;margin:18px 0 8px;";
            h.textContent = "Day " + day + " — " + DAYS[day].title;
            body.appendChild(h);
            const list = DATA.cards.filter((c) => c.day === day && isMastered(c.id));
            if (!list.length) {
                const p = document.createElement("p");
                p.className = "muted";
                p.textContent = "No mastered cards yet.";
                body.appendChild(p);
                return;
            }
            list.forEach((c) => {
                const src = DATA.sources[c.sourceId];
                const n = document.createElement("div");
                n.className = "note";
                n.innerHTML =
                    '<div class="badge">' + src.short + " · " + c.where + "</div>" +
                    "<p style='margin-top:8px;font-size:14px;'>" + c.claim + "</p>";
                body.appendChild(n);
            });
        });
    }

    $("btn-next").addEventListener("click", afterFeedback);
    $("btn-hub").addEventListener("click", () => {
        renderHub();
        show("hub");
    });
    $("btn-review").addEventListener("click", () => {
        if (!state.review.length) {
            alert("Review pile is empty. Misses land here.");
            return;
        }
        startRun({ kind: "review" });
    });
    $("btn-notebook").addEventListener("click", () => {
        renderNotebook();
        show("notebook");
    });
    $("btn-nb-back").addEventListener("click", () => {
        renderHub();
        show("hub");
    });

    if (!DATA || !DATA.cards) {
        document.body.innerHTML = "<p style='padding:2rem'>data.js failed to load. Open index.html from the study-app folder.</p>";
        return;
    }
    renderHub();
    show("hub");
})();
