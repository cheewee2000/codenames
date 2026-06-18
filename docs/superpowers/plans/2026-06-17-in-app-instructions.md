# In-App Instructions Implementation Plan

**Goal:** Add an always-visible rules panel and a per-turn contextual instruction block to the Codenames app. UI-only; `game-logic.js` and its 13 tests are untouched.

**Tech Stack:** vanilla HTML/CSS/JS (ES modules), no build step.

## Global Constraints

- No game-logic/rules changes. `node --test` must still pass 13/13.
- `node --check ui.js` must pass.
- Version bumps to `v1.1.0` in the footer.
- All instruction HTML is from static templates (no user input interpolated), so `innerHTML` is safe.
- Relative asset paths only (deploys under a subdirectory).

---

### Task 1: Rules panel + instruction block (single cohesive change)

**Files:** Modify `index.html`, `style.css`, `ui.js`.

These three edits are interdependent (shared ids/classes) and must ship together.

#### Edit A — `index.html`

1. Replace the `#status` section + `<main id="board">` region. Find this block:

```html
  <section id="status">
    <div id="turn-banner"></div>
    <div id="scoreboard">
      <span id="score-red" class="score red"></span>
      <span id="score-blue" class="score blue"></span>
    </div>
  </section>

  <main id="board"></main>
```

Replace with:

```html
  <section id="status">
    <div id="turn-banner"></div>
    <div id="scoreboard">
      <span id="score-red" class="score red"></span>
      <span id="score-blue" class="score blue"></span>
    </div>
  </section>

  <section id="instructions"></section>

  <div id="game-area">
    <main id="board"></main>
    <aside id="rules-panel">
      <h2>How to Play</h2>
      <ul class="rules">
        <li><strong>🎯 Goal</strong> — Be the first team to tap all of your agent words. Tap the assassin and your team loses instantly.</li>
        <li><strong>👥 Teams</strong> — Red and Blue. Each team has one Spymaster; everyone else are Operatives.</li>
        <li><strong>🕵️ Spymaster</strong> — Hold the key button to see which words are your team's, then give a one-word clue and a number (how many words it points to).</li>
        <li><strong>🔍 Operatives</strong> — Tap the words the clue points to. You get up to (number + 1) guesses.</li>
        <li><strong>🃏 Cards</strong> — Your color: keep guessing. Neutral or the other team: your turn ends. Assassin (black): instant loss.</li>
        <li><strong>🔄 One screen</strong> — Pass the device between Spymaster and Operatives as the prompts say.</li>
      </ul>
    </aside>
  </div>
```

2. Bump the version. Find `<span id="version">v1.0.0</span>` and replace with `<span id="version">v1.1.0</span>`.

#### Edit B — `style.css`

1. Bump the three shared `max-width: 900px` rules (in `header`, `#status`, `#controls`) to `max-width: 1180px` so they align with the wider game area. (Leave all other properties of those rules unchanged.)

2. Replace the `#board` rule. Find:

```css
#board {
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
```

Replace with:

```css
#game-area {
  width: 100%;
  max-width: 1180px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin: 0 auto;
}

#board {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

#rules-panel {
  flex: 0 0 280px;
  background: var(--paper);
  border: 2px solid var(--kraft-dark);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--ink);
}
#rules-panel h2 {
  margin: 0 0 8px;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
#rules-panel ul.rules { list-style: none; margin: 0; padding: 0; }
#rules-panel ul.rules li { font-size: 0.8rem; line-height: 1.45; margin-bottom: 9px; }
#rules-panel ul.rules li:last-child { margin-bottom: 0; }

#instructions {
  width: 100%;
  max-width: 1180px;
  margin: 4px auto 10px;
  background: rgba(0, 0, 0, 0.18);
  border-left: 4px solid var(--kraft);
  border-radius: 6px;
  padding: 8px 14px;
  color: var(--paper);
}
#instructions .handoff { font-weight: bold; color: var(--kraft); margin: 0 0 6px; letter-spacing: 0.04em; }
#instructions ol.steps { margin: 0; padding-left: 1.3em; }
#instructions ol.steps li { margin-bottom: 3px; font-size: 0.9rem; line-height: 1.35; }
#instructions p { margin: 0 0 4px; font-size: 0.9rem; line-height: 1.4; }
#instructions p:last-child { margin-bottom: 0; }

@media (max-width: 860px) {
  #game-area { flex-direction: column; }
  #rules-panel { flex: 1 1 auto; width: 100%; }
}
```

#### Edit C — `ui.js`

1. After the existing `teamLabel` function, add two helpers:

```js
function teamEmoji(t) {
  return t === "red" ? "🔴" : "🔵";
}

function instructionFor(game) {
  const team = teamLabel(game.currentTeam);
  if (game.phase === "clue") {
    return `<p class="handoff">▸ Pass the device to the ${team} Spymaster.</p>
      <ol class="steps">
        <li>Hold the key button to see your team's words.</li>
        <li>Think of a one-word clue that links some of them.</li>
        <li>Enter the clue and a number, then press “Give clue”.</li>
        <li>Pass the device to your operatives.</li>
      </ol>`;
  }
  if (game.phase === "guess") {
    return `<p class="handoff">▸ ${team} operatives, it's your turn.</p>
      <p>Tap the words you think are yours. Correct → keep going (up to ${game.guessesRemaining} left this turn). Wrong → your turn ends. Press “End guessing” to stop. <strong>Avoid the assassin!</strong></p>`;
  }
  if (game.phase === "gameover") {
    const byAssassin = game.cards.some((c) => c.role === "assassin" && c.revealed);
    return `<p>${byAssassin ? "The assassin was revealed. " : ""}Press “New Game” to play again.</p>`;
  }
  return "";
}
```

2. In `render()`, update the three phase branches so the banner carries the team emoji + role headline, and set the instruction block. Find the existing branch block:

```js
  if (game.phase === "clue") {
    el("turn-banner").textContent = teamLabel(game.currentTeam) + " spymaster — give a clue";
    el("clue-word").value = "";
    el("clue-number").value = "1";
  } else if (game.phase === "guess") {
    el("turn-banner").textContent = teamLabel(game.currentTeam) + " operatives — make your guesses";
    el("clue-display").textContent =
      game.currentClue.word.toUpperCase() + " : " + game.currentClue.number;
    el("guesses-left").textContent = "Guesses left: " + game.guessesRemaining;
  } else if (game.phase === "gameover") {
    const byAssassin = game.cards.some((c) => c.role === "assassin" && c.revealed);
    el("winner-text").textContent =
      teamLabel(game.winner) + " WINS" + (byAssassin ? " (assassin!)" : "");
  }
```

Replace with:

```js
  if (game.phase === "clue") {
    el("turn-banner").textContent =
      teamEmoji(game.currentTeam) + " " + teamLabel(game.currentTeam) + " Spymaster's turn";
    el("clue-word").value = "";
    el("clue-number").value = "1";
  } else if (game.phase === "guess") {
    el("turn-banner").textContent =
      teamEmoji(game.currentTeam) + " " + teamLabel(game.currentTeam) + " Operatives — guessing";
    el("clue-display").textContent =
      game.currentClue.word.toUpperCase() + " : " + game.currentClue.number;
    el("guesses-left").textContent = "Guesses left: " + game.guessesRemaining;
  } else if (game.phase === "gameover") {
    const byAssassin = game.cards.some((c) => c.role === "assassin" && c.revealed);
    el("turn-banner").textContent = teamEmoji(game.winner) + " " + teamLabel(game.winner) + " WINS";
    el("winner-text").textContent =
      teamEmoji(game.winner) + " " + teamLabel(game.winner) + " WINS" + (byAssassin ? " (assassin!)" : "");
  }

  el("instructions").innerHTML = instructionFor(game);
```

#### Verification

- [ ] `node --test` → 13/13 passing, output pristine (logic untouched).
- [ ] `node --check ui.js` → no output.
- [ ] Confirm `index.html` contains ids `instructions`, `game-area`, `rules-panel` and `v1.1.0`.

#### Commit

```bash
git add index.html style.css ui.js
git commit -m "feat: add rules panel and per-turn instructions (v1.1.0)"
```

---

## Self-Review Notes

- Spec coverage: rules panel (Edit A/B), per-turn instructions with handoff cues (Edit C `instructionFor`), responsive stacking (Edit B media query), version bump (Edit A), logic untouched (no `game-logic.js` edits). All covered.
- `innerHTML` only ever receives static templates plus `game.guessesRemaining` (a number) — no injection surface.
