# Codenames Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-device pass-and-play Codenames web app that acts as a full referee, with a faithful physical-board-game aesthetic.

**Architecture:** Pure vanilla HTML/CSS/JS, no build step. Referee logic lives in a DOM-free ES module (`game-logic.js`) of pure functions, unit-tested with Node's built-in test runner. The UI layer (`ui.js`) imports those functions, renders the board, and wires events. Words live in `words.js`. All game state is held in one in-memory object; refresh starts a new game.

**Tech Stack:** HTML, CSS, vanilla JavaScript (ES modules), Node `--test` for unit tests, Python/Pillow for favicon generation.

## Global Constraints

- No backend, no networking, no accounts. Single-device pass-and-play only.
- No build step. Files are served statically and run directly in the browser via `<script type="module">`.
- One game in memory at a time. Refresh = new game. No save/resume, no undo.
- Standard Codenames key split: starting team 9, other team 8, neutral 7, assassin 1, total 25.
- A team wins when all its cards are revealed; a team loses instantly on the assassin.
- Aesthetic: faithful to the physical game — kraft/tan cardstock, classic agent palette (red/blue/neutral tan/black assassin), stamped-style typography.
- A version number is shown in the footer (start at `v1.0.0`). Bump it on changes.
- Favicon: solid agent-red circle (`#b03a2e`) on transparent background, diameter = 50% of width, centered. Generate `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180).
- Per CW&T conventions: a GitHub repo is created and the site deploys to `codenames.cwandt.com`.

---

### Task 1: Project scaffold and word list

**Files:**
- Create: `package.json`
- Create: `words.js`
- Create: `.gitignore`

**Interfaces:**
- Produces: `words.js` default-exports `export const WORDS` — a `string[]` of uppercase single words used by `game-logic.js`.

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.DS_Store
```

- [ ] **Step 2: Create `package.json`** (enables ES modules + the test script)

```json
{
  "name": "codenames-clone",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 3: Create `words.js`** with a generic public word list (no build tooling needed; it's a plain ES module)

```js
// A generic word list (not Codenames' copyrighted list).
export const WORDS = [
  "AFRICA", "AGENT", "AIR", "ALIEN", "ALPS", "AMAZON", "ANCHOR", "ANGEL",
  "ANTARCTICA", "APPLE", "ARM", "ATLANTIS", "AZTEC", "BACK", "BALL", "BAND",
  "BANK", "BAR", "BARK", "BEACH", "BEAR", "BEAT", "BED", "BEIJING",
  "BELL", "BELT", "BERLIN", "BERMUDA", "BERRY", "BILL", "BLOCK", "BOARD",
  "BOLT", "BOMB", "BOND", "BOOM", "BOOT", "BOTTLE", "BOW", "BOX",
  "BRIDGE", "BRUSH", "BUCK", "BUFFALO", "BUG", "BUGLE", "BUTTON", "CALF",
  "CANADA", "CAP", "CAPITAL", "CAR", "CARD", "CARROT", "CASINO", "CAST",
  "CAT", "CELL", "CENTAUR", "CENTER", "CHAIR", "CHANGE", "CHARGE", "CHECK",
  "CHEST", "CHICK", "CHINA", "CHOCOLATE", "CHURCH", "CIRCLE", "CLIFF", "CLOAK",
  "CLUB", "CODE", "COLD", "COMIC", "COMPOUND", "CONCERT", "CONDUCTOR", "CONTRACT",
  "COOK", "COPPER", "COTTON", "COURT", "COVER", "CRANE", "CRASH", "CRICKET",
  "CROSS", "CROWN", "CYCLE", "CZECH", "DANCE", "DATE", "DAY", "DEATH",
  "DECK", "DEGREE", "DIAMOND", "DICE", "DINOSAUR", "DISEASE", "DOCTOR", "DOG",
  "DRAFT", "DRAGON", "DRESS", "DRILL", "DROP", "DUCK", "DWARF", "EAGLE",
  "EGYPT", "EMBASSY", "ENGINE", "ENGLAND", "EUROPE", "EYE", "FACE", "FAIR",
  "FALL", "FAN", "FENCE", "FIELD", "FIGHTER", "FIGURE", "FILE", "FILM",
  "FIRE", "FISH", "FLUTE", "FLY", "FOOT", "FORCE", "FOREST", "FORK",
  "FRANCE", "GAME", "GAS", "GENIUS", "GERMANY", "GHOST", "GIANT", "GLASS",
  "GLOVE", "GOLD", "GRACE", "GRASS", "GREECE", "GREEN", "GROUND", "HAM",
  "HAND", "HAWK", "HEAD", "HEART", "HELICOPTER", "HIMALAYAS", "HOLE", "HOLLYWOOD",
  "HONEY", "HOOD", "HOOK", "HORN", "HORSE", "HOSPITAL", "HOTEL", "ICE",
  "INDIA", "IRON", "IVORY", "JACK", "JAM", "JET", "JUPITER", "KANGAROO",
  "KETCHUP", "KEY", "KID", "KING", "KIWI", "KNIFE", "KNIGHT", "LAB",
  "LAP", "LASER", "LAWYER", "LEAD", "LEMON", "LEPRECHAUN", "LIFE", "LIGHT",
  "LIMOUSINE", "LINE", "LINK", "LION", "LITTER", "LOCH", "LOCK", "LOG",
  "LONDON", "LUCK", "MAIL", "MAMMOTH", "MAPLE", "MARBLE", "MARCH", "MASS",
  "MATCH", "MERCURY", "MEXICO", "MICROSCOPE", "MILLIONAIRE", "MINE", "MINT", "MISSILE",
  "MODEL", "MOLE", "MOON", "MOSCOW", "MOUNT", "MOUSE", "MOUTH", "MUG",
  "NAIL", "NEEDLE", "NET", "NEW YORK", "NIGHT", "NINJA", "NOTE", "NOVEL",
  "NURSE", "NUT", "OCTOPUS", "OIL", "OLIVE", "OLYMPUS", "OPERA", "ORANGE",
  "ORGAN", "PALM", "PAN", "PANTS", "PAPER", "PARACHUTE", "PARK", "PART",
  "PASS", "PASTE", "PENGUIN", "PHOENIX", "PIANO", "PIE", "PILOT", "PIN",
  "PIPE", "PIRATE", "PISTOL", "PIT", "PLANE", "PLASTIC", "PLATE", "PLATYPUS",
  "PLAY", "PLOT", "POINT", "POISON", "POLE", "POLICE", "POOL", "PORT",
  "POST", "POUND", "PRESS", "PRINCESS", "PUMPKIN", "PUPIL", "PYRAMID", "QUEEN",
  "RABBIT", "RACKET", "RAY", "REVOLUTION", "RING", "ROBIN", "ROBOT", "ROCK",
  "ROME", "ROOT", "ROSE", "ROULETTE", "ROUND", "ROW", "RULER", "SATELLITE",
  "SATURN", "SCALE", "SCHOOL", "SCIENTIST", "SCORPION", "SCREEN", "SCUBA DIVER", "SEAL",
  "SERVER", "SHADOW", "SHAKESPEARE", "SHARK", "SHIP", "SHOE", "SHOP", "SHOT",
  "SINK", "SKYSCRAPER", "SLIP", "SLUG", "SMUGGLER", "SNOW", "SNOWMAN", "SOCK",
  "SOLDIER", "SOUL", "SOUND", "SPACE", "SPELL", "SPIDER", "SPIKE", "SPINE",
  "SPOT", "SPRING", "SPY", "SQUARE", "STADIUM", "STAFF", "STAR", "STATE",
  "STICK", "STOCK", "STRAW", "STREAM", "STRIKE", "STRING", "SUB", "SUIT",
  "SUPERHERO", "SWING", "SWITCH", "TABLE", "TABLET", "TAG", "TAIL", "TAP",
  "TEACHER", "TELESCOPE", "TEMPLE", "THEATER", "THIEF", "THUMB", "TICK", "TIE",
  "TIME", "TOKYO", "TOOTH", "TORCH", "TOWER", "TRACK", "TRAIN", "TRIANGLE",
  "TRIP", "TRUNK", "TUBE", "TURKEY", "UNDERTAKER", "UNICORN", "VACUUM", "VAN",
  "VET", "WAKE", "WALL", "WAR", "WASHER", "WASHINGTON", "WATCH", "WATER",
  "WAVE", "WEB", "WELL", "WHALE", "WHIP", "WIND", "WITCH", "WORM", "YARD"
];
```

- [ ] **Step 4: Verify the module loads and has enough words**

Run: `node -e "import('./words.js').then(m => { if (m.WORDS.length < 25) throw new Error('too few'); console.log('words:', m.WORDS.length); })"`
Expected: prints `words:` followed by a number ≥ 25 (around 360).

- [ ] **Step 5: Commit**

```bash
git add package.json words.js .gitignore
git commit -m "feat: scaffold project and word list"
```

---

### Task 2: Game creation logic (createGame + helpers)

**Files:**
- Create: `game-logic.js`
- Test: `test/game-logic.test.js`

**Interfaces:**
- Consumes: `WORDS` from `words.js` (passed in by callers; logic stays DOM-free and takes the word array as an argument).
- Produces:
  - `shuffle(array, rng = Math.random) -> array` (returns a new shuffled array; Fisher-Yates).
  - `other(team) -> 'red'|'blue'` (opponent of the given team).
  - `createGame(words, rng = Math.random) -> GameState` where
    `GameState = { cards: {word,role,revealed}[], startingTeam, currentTeam, phase, currentClue, guessesRemaining, redRemaining, blueRemaining, winner }`.
    On a fresh game: `phase='clue'`, `currentTeam=startingTeam`, `currentClue=null`, `guessesRemaining=0`, `winner=null`.

- [ ] **Step 1: Write the failing test**

```js
// test/game-logic.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, shuffle, other } from "../game-logic.js";

const WORDS = Array.from({ length: 100 }, (_, i) => "W" + i);

// Deterministic RNG: cycles through a fixed sequence in [0,1).
function seededRng(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

test("other returns the opponent", () => {
  assert.equal(other("red"), "blue");
  assert.equal(other("blue"), "red");
});

test("shuffle returns a new array with same elements", () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input, seededRng());
  assert.notEqual(out, input); // new array
  assert.deepEqual([...out].sort(), [...input].sort());
});

test("createGame builds a standard 25-card board", () => {
  const g = createGame(WORDS, seededRng(7));
  assert.equal(g.cards.length, 25);
  const roles = g.cards.map((c) => c.role);
  const count = (r) => roles.filter((x) => x === r).length;
  assert.equal(count("assassin"), 1);
  assert.equal(count("neutral"), 7);
  // starting team has 9, other has 8
  assert.equal(count(g.startingTeam), 9);
  assert.equal(count(other(g.startingTeam)), 8);
  assert.equal(g.redRemaining, count("red"));
  assert.equal(g.blueRemaining, count("blue"));
  assert.equal(g.currentTeam, g.startingTeam);
  assert.equal(g.phase, "clue");
  assert.equal(g.currentClue, null);
  assert.equal(g.guessesRemaining, 0);
  assert.equal(g.winner, null);
  assert.ok(g.cards.every((c) => c.revealed === false));
});

test("createGame picks 25 distinct words from the list", () => {
  const g = createGame(WORDS, seededRng(3));
  const set = new Set(g.cards.map((c) => c.word));
  assert.equal(set.size, 25);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — cannot find module `../game-logic.js` / functions not defined.

- [ ] **Step 3: Write minimal implementation**

```js
// game-logic.js
export function shuffle(array, rng = Math.random) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function other(team) {
  return team === "red" ? "blue" : "red";
}

export function createGame(words, rng = Math.random) {
  const picked = shuffle(words, rng).slice(0, 25);
  const startingTeam = rng() < 0.5 ? "red" : "blue";
  const second = other(startingTeam);

  const roles = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(second),
    ...Array(7).fill("neutral"),
    "assassin",
  ];
  const shuffledRoles = shuffle(roles, rng);

  const cards = picked.map((word, i) => ({
    word,
    role: shuffledRoles[i],
    revealed: false,
  }));

  return {
    cards,
    startingTeam,
    currentTeam: startingTeam,
    phase: "clue",
    currentClue: null,
    guessesRemaining: 0,
    redRemaining: cards.filter((c) => c.role === "red").length,
    blueRemaining: cards.filter((c) => c.role === "blue").length,
    winner: null,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add game-logic.js test/game-logic.test.js
git commit -m "feat: game creation logic with key distribution"
```

---

### Task 3: Clue + guess referee logic

**Files:**
- Modify: `game-logic.js`
- Test: `test/game-logic.test.js` (add tests)

**Interfaces:**
- Consumes: `GameState`, `createGame`, `other` from Task 2.
- Produces (all mutate `game` in place and return it):
  - `submitClue(game, word, number) -> game` — sets `currentClue={word, number}`, `guessesRemaining = number + 1`, `phase='guess'`. No-op if `phase !== 'clue'`.
  - `endTurn(game) -> game` — flips `currentTeam`, sets `phase='clue'`, `currentClue=null`, `guessesRemaining=0`. No-op if `phase==='gameover'`.
  - `applyGuess(game, index) -> game` — resolves a tap per the referee rules below. No-op if `phase !== 'guess'`, index out of range, or card already revealed.

- [ ] **Step 1: Write the failing tests**

```js
// append to test/game-logic.test.js
import { submitClue, applyGuess, endTurn } from "../game-logic.js";

// Build a game with a known board layout for deterministic referee tests.
function fixedGame() {
  const g = createGame(Array.from({ length: 100 }, (_, i) => "W" + i), () => 0.1);
  // Force a known layout: index 0 red, 1 blue, 2 neutral, 3 assassin, rest neutral.
  g.cards.forEach((c, i) => { c.role = "neutral"; c.revealed = false; });
  g.cards[0].role = "red";
  g.cards[1].role = "blue";
  g.cards[3].role = "assassin";
  g.startingTeam = "red";
  g.currentTeam = "red";
  g.phase = "clue";
  g.currentClue = null;
  g.guessesRemaining = 0;
  g.winner = null;
  g.redRemaining = 1;
  g.blueRemaining = 1;
  return g;
}

test("submitClue moves to guess phase with number+1 guesses", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2);
  assert.deepEqual(g.currentClue, { word: "OCEAN", number: 2 });
  assert.equal(g.guessesRemaining, 3);
  assert.equal(g.phase, "guess");
});

test("guessing your own color decrements remaining and continues", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2); // guessesRemaining 3
  applyGuess(g, 0); // red card, current team red
  assert.equal(g.cards[0].revealed, true);
  assert.equal(g.redRemaining, 0);   // was 1, now 0 -> red wins
  assert.equal(g.winner, "red");
  assert.equal(g.phase, "gameover");
});

test("guessing a neutral ends the turn", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2);
  applyGuess(g, 2); // neutral
  assert.equal(g.cards[2].revealed, true);
  assert.equal(g.phase, "clue");
  assert.equal(g.currentTeam, "blue");
  assert.equal(g.guessesRemaining, 0);
});

test("guessing the opponent color decrements them and ends turn", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2);
  applyGuess(g, 1); // blue card while red is guessing
  assert.equal(g.blueRemaining, 0); // was 1 -> blue wins
  assert.equal(g.winner, "blue");
  assert.equal(g.phase, "gameover");
});

test("guessing the assassin loses immediately", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2);
  applyGuess(g, 3); // assassin
  assert.equal(g.phase, "gameover");
  assert.equal(g.winner, "blue"); // red guessed it, so blue wins
});

test("running out of guesses ends the turn", () => {
  const g = fixedGame();
  g.cards[4].role = "red";
  g.redRemaining = 2;
  submitClue(g, "OCEAN", 0); // guessesRemaining = 1
  applyGuess(g, 0); // red, correct, guessesRemaining 1 -> 0 -> end turn
  assert.equal(g.phase, "clue");
  assert.equal(g.currentTeam, "blue");
});

test("applyGuess ignores already-revealed cards and wrong phase", () => {
  const g = fixedGame();
  applyGuess(g, 0); // phase is 'clue' -> no-op
  assert.equal(g.cards[0].revealed, false);
  submitClue(g, "OCEAN", 2);
  applyGuess(g, 2); // reveal neutral, ends turn (phase clue again)
  const before = g.cards[2].revealed;
  applyGuess(g, 2); // phase clue now -> no-op
  assert.equal(g.cards[2].revealed, before);
});

test("endTurn flips team and resets clue", () => {
  const g = fixedGame();
  submitClue(g, "OCEAN", 2);
  endTurn(g);
  assert.equal(g.currentTeam, "blue");
  assert.equal(g.phase, "clue");
  assert.equal(g.currentClue, null);
  assert.equal(g.guessesRemaining, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `submitClue`, `applyGuess`, `endTurn` not exported.

- [ ] **Step 3: Add the implementation to `game-logic.js`**

```js
// append to game-logic.js
export function submitClue(game, word, number) {
  if (game.phase !== "clue") return game;
  game.currentClue = { word, number };
  game.guessesRemaining = number + 1;
  game.phase = "guess";
  return game;
}

export function endTurn(game) {
  if (game.phase === "gameover") return game;
  game.currentTeam = other(game.currentTeam);
  game.phase = "clue";
  game.currentClue = null;
  game.guessesRemaining = 0;
  return game;
}

function remainingKey(team) {
  return team === "red" ? "redRemaining" : "blueRemaining";
}

export function applyGuess(game, index) {
  if (game.phase !== "guess") return game;
  const card = game.cards[index];
  if (!card || card.revealed) return game;

  card.revealed = true;

  if (card.role === "assassin") {
    game.winner = other(game.currentTeam);
    game.phase = "gameover";
    return game;
  }

  if (card.role === "red" || card.role === "blue") {
    const key = remainingKey(card.role);
    game[key] -= 1;
    if (game[key] === 0) {
      game.winner = card.role;
      game.phase = "gameover";
      return game;
    }
    if (card.role === game.currentTeam) {
      game.guessesRemaining -= 1;
      if (game.guessesRemaining <= 0) endTurn(game);
      return game;
    }
    // revealed opponent's card (but they haven't won) -> turn ends
    endTurn(game);
    return game;
  }

  // neutral
  endTurn(game);
  return game;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — all referee tests pass.

- [ ] **Step 5: Commit**

```bash
git add game-logic.js test/game-logic.test.js
git commit -m "feat: clue submission and guess referee logic"
```

---

### Task 4: HTML structure and screen containers

**Files:**
- Create: `index.html`

**Interfaces:**
- Produces: DOM elements with stable ids that `ui.js` (Task 6) queries:
  - `#board` (the 5×5 grid container)
  - `#turn-banner`, `#score-red`, `#score-blue`
  - `#clue-controls` (contains `#clue-word`, `#clue-number`, `#submit-clue`)
  - `#guess-controls` (contains `#clue-display`, `#guesses-left`, `#end-guessing`)
  - `#reveal-key` (hold-to-reveal button)
  - `#gameover` (contains `#winner-text`, `#new-game`)
  - `#new-game-setup` (start/reset button always available in header)
  - `<body>` has `<script type="module" src="ui.js"></script>`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Codenames</title>
  <link rel="icon" href="favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>CODENAMES</h1>
    <button id="new-game-setup" type="button">New Game</button>
  </header>

  <section id="status">
    <div id="turn-banner"></div>
    <div id="scoreboard">
      <span id="score-red" class="score red"></span>
      <span id="score-blue" class="score blue"></span>
    </div>
  </section>

  <main id="board"></main>

  <section id="controls">
    <div id="clue-controls">
      <button id="reveal-key" type="button">Spymaster — hold to reveal key</button>
      <div class="clue-entry">
        <input id="clue-word" type="text" placeholder="Clue word" autocomplete="off" />
        <input id="clue-number" type="number" min="0" max="9" value="1" />
        <button id="submit-clue" type="button">Give clue</button>
      </div>
    </div>

    <div id="guess-controls" hidden>
      <div id="clue-display"></div>
      <div id="guesses-left"></div>
      <button id="end-guessing" type="button">End guessing</button>
    </div>

    <div id="gameover" hidden>
      <div id="winner-text"></div>
      <button id="new-game" type="button">New Game</button>
    </div>
  </section>

  <footer>
    <span id="version">v1.0.0</span>
  </footer>

  <script type="module" src="ui.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify it opens without console errors (manual)**

Run: `open index.html` (macOS)
Expected: page loads showing the header, empty board, and footer `v1.0.0`. The browser console will show a 404/parse path only for `ui.js` (created in Task 6) and favicons (Task 7) — that's expected at this stage. No HTML parse errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: html structure and screen containers"
```

---

### Task 5: Faithful cardstock styling

**Files:**
- Create: `style.css`

**Interfaces:**
- Consumes: the ids/classes from `index.html` (Task 4) and the runtime classes that `ui.js` (Task 6) adds to cards: `.card`, and on reveal `.revealed` plus one of `.red`, `.blue`, `.neutral`, `.assassin`; plus `.key-peek` added to `#board` while the key is revealed (renders unrevealed cards' true colors as a tint).
- Produces: no JS interface; purely visual.

- [ ] **Step 1: Create `style.css`**

```css
:root {
  --kraft: #c8a96a;
  --kraft-dark: #b8975a;
  --paper: #efe6d2;
  --ink: #2b2620;
  --red: #b03a2e;
  --blue: #2e5f8a;
  --neutral: #d9c6a0;
  --assassin: #1c1815;
  font-family: "Courier New", Courier, monospace;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #3a322a;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 12px;
}

header {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

header h1 {
  color: var(--paper);
  letter-spacing: 0.3em;
  font-size: 1.8rem;
  margin: 0.4em 0;
}

button {
  font-family: inherit;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--kraft);
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 6px;
  padding: 0.6em 1em;
  cursor: pointer;
}
button:active { transform: translateY(1px); }

#status {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

#turn-banner {
  color: var(--paper);
  font-weight: bold;
  letter-spacing: 0.1em;
}

#scoreboard { display: flex; gap: 12px; }
.score {
  font-weight: bold;
  font-size: 1.2rem;
  padding: 0.2em 0.6em;
  border-radius: 6px;
  color: var(--paper);
}
.score.red { background: var(--red); }
.score.blue { background: var(--blue); }

#board {
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.card {
  aspect-ratio: 3 / 2;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4px;
  background: var(--paper);
  border: 2px solid var(--kraft-dark);
  border-radius: 8px;
  box-shadow: inset 0 0 0 4px rgba(0,0,0,0.04), 0 2px 3px rgba(0,0,0,0.3);
  font-weight: bold;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  font-size: clamp(0.55rem, 2.2vw, 1rem);
  transition: transform 0.15s ease, background 0.25s ease, color 0.25s ease;
}

.card.revealed { cursor: default; transform: rotateX(4deg); color: var(--paper); }
.card.revealed.red { background: var(--red); border-color: #7c281f; }
.card.revealed.blue { background: var(--blue); border-color: #1f4360; }
.card.revealed.neutral { background: var(--neutral); color: var(--ink); border-color: var(--kraft-dark); }
.card.revealed.assassin { background: var(--assassin); border-color: #000; }

/* Spymaster hold-to-reveal: tint unrevealed cards with their true color. */
#board.key-peek .card:not(.revealed).red { box-shadow: inset 0 0 0 6px var(--red); }
#board.key-peek .card:not(.revealed).blue { box-shadow: inset 0 0 0 6px var(--blue); }
#board.key-peek .card:not(.revealed).neutral { box-shadow: inset 0 0 0 6px var(--neutral); }
#board.key-peek .card:not(.revealed).assassin { box-shadow: inset 0 0 0 6px var(--assassin); }

#controls {
  width: 100%;
  max-width: 900px;
  margin-top: 12px;
  color: var(--paper);
}
.clue-entry { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
#clue-word { flex: 1; min-width: 140px; }
input {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5em;
  border: 2px solid var(--ink);
  border-radius: 6px;
}
#clue-number { width: 70px; }
#reveal-key { width: 100%; background: var(--kraft-dark); }
#clue-display { font-size: 1.3rem; font-weight: bold; letter-spacing: 0.1em; }
#guesses-left { margin: 6px 0; }
#gameover { text-align: center; }
#winner-text { font-size: 1.6rem; font-weight: bold; margin-bottom: 10px; }

footer { margin-top: auto; padding-top: 16px; }
#version { color: var(--kraft); font-size: 0.8rem; letter-spacing: 0.1em; }
```

- [ ] **Step 2: Verify styling renders (manual)**

Run: `open index.html`
Expected: dark backdrop, kraft-colored header/buttons, paper-colored board area (still empty until Task 6). No layout overflow.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: faithful cardstock styling"
```

---

### Task 6: UI wiring (render + events)

**Files:**
- Create: `ui.js`

**Interfaces:**
- Consumes: `createGame`, `submitClue`, `applyGuess`, `endTurn`, `other` from `game-logic.js`; `WORDS` from `words.js`; the ids from `index.html`.
- Produces: a self-initializing module. Holds the single `game` state object, renders it, and wires all buttons. No exports.

- [ ] **Step 1: Create `ui.js`**

```js
import { WORDS } from "./words.js";
import { createGame, submitClue, applyGuess, endTurn, other } from "./game-logic.js";

const el = (id) => document.getElementById(id);
const board = el("board");

let game = createGame(WORDS);

function teamLabel(t) {
  return t === "red" ? "RED" : "BLUE";
}

function render() {
  // Board
  board.innerHTML = "";
  game.cards.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "card " + card.role;
    if (card.revealed) div.classList.add("revealed");
    div.textContent = card.word;
    div.addEventListener("click", () => onCardClick(i));
    board.appendChild(div);
  });

  // Scoreboard
  el("score-red").textContent = "RED " + game.redRemaining;
  el("score-blue").textContent = "BLUE " + game.blueRemaining;

  // Status + controls visibility
  const clueC = el("clue-controls");
  const guessC = el("guess-controls");
  const overC = el("gameover");
  clueC.hidden = game.phase !== "clue";
  guessC.hidden = game.phase !== "guess";
  overC.hidden = game.phase !== "gameover";

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
}

function onCardClick(i) {
  if (game.phase !== "guess") return;
  applyGuess(game, i);
  render();
}

function onSubmitClue() {
  const word = el("clue-word").value.trim();
  const number = parseInt(el("clue-number").value, 10);
  if (!word || Number.isNaN(number) || number < 0) return;
  submitClue(game, word, number);
  render();
}

function newGame() {
  game = createGame(WORDS);
  render();
}

// Hold-to-reveal key
const revealBtn = el("reveal-key");
const showKey = () => board.classList.add("key-peek");
const hideKey = () => board.classList.remove("key-peek");
revealBtn.addEventListener("mousedown", showKey);
revealBtn.addEventListener("mouseup", hideKey);
revealBtn.addEventListener("mouseleave", hideKey);
revealBtn.addEventListener("touchstart", (e) => { e.preventDefault(); showKey(); }, { passive: false });
revealBtn.addEventListener("touchend", (e) => { e.preventDefault(); hideKey(); });

el("submit-clue").addEventListener("click", onSubmitClue);
el("clue-word").addEventListener("keydown", (e) => { if (e.key === "Enter") onSubmitClue(); });
el("end-guessing").addEventListener("click", () => { endTurn(game); render(); });
el("new-game").addEventListener("click", newGame);
el("new-game-setup").addEventListener("click", newGame);

render();
```

- [ ] **Step 2: Manually play a full game**

Run: `open index.html`
Expected, in order:
1. Board shows 25 word cards; scoreboard shows 9 and 8; turn banner names a spymaster.
2. Press-and-hold "Spymaster — hold to reveal key" → unrevealed cards show colored borders; release → tints vanish.
3. Type a clue word + number, click "Give clue" → controls switch to guess view showing the clue and "Guesses left".
4. Click a card → it flips to its color; clicking your team's color decrements its score and lets you keep guessing; clicking neutral/opponent passes turn back to clue phase for the other team.
5. Reveal all of one team's cards → "RED/BLUE WINS" banner; clicking the assassin → other team wins "(assassin!)".
6. "New Game" reshuffles the board.

- [ ] **Step 3: Commit**

```bash
git add ui.js
git commit -m "feat: ui rendering and event wiring"
```

---

### Task 7: Favicon generation

**Files:**
- Create: `scripts/make_favicon.py`
- Create: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (generated)

**Interfaces:**
- Produces: favicon files referenced by `index.html` (Task 4). Solid `#b03a2e` circle, diameter 50% of canvas width, centered, transparent background.

- [ ] **Step 1: Create `scripts/make_favicon.py`**

```python
#!/usr/bin/env python3
"""Generate CW&T-style favicons: a solid agent-red circle on transparent bg,
circle diameter = 50% of width, centered."""
from PIL import Image, ImageDraw

COLOR = (176, 58, 46, 255)  # #b03a2e

def make(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    d = size * 0.5
    x0 = (size - d) / 2
    y0 = (size - d) / 2
    draw.ellipse([x0, y0, x0 + d, y0 + d], fill=COLOR)
    return img

make(16).save("favicon-16x16.png")
make(32).save("favicon-32x32.png")
make(180).save("apple-touch-icon.png")
# Multi-size .ico
make(64).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("favicons written")
```

- [ ] **Step 2: Run it**

Run: `python3 scripts/make_favicon.py`
Expected: prints `favicons written`; the four files exist (`ls favicon* apple-touch-icon.png`).

- [ ] **Step 3: Verify in the page (manual)**

Run: `open index.html`
Expected: the browser tab shows the red-circle favicon and the console no longer 404s on favicon files.

- [ ] **Step 4: Commit**

```bash
git add scripts/make_favicon.py favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png
git commit -m "feat: agent-red circle favicons"
```

---

### Task 8: README and final verification

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: project documentation. No code interface.

- [ ] **Step 1: Create `README.md`**

````markdown
# Codenames (pass-and-play clone)

A single-device, pass-and-play [Codenames]-style word game. One screen, two
teams, full referee. No backend — pure static HTML/CSS/JS.

## Play

Open `index.html` in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

The current spymaster presses and holds **Spymaster — hold to reveal key** to
see which cards belong to which team, types a one-word clue and a number, then
passes the device to their operatives to tap cards.

## Develop

```bash
npm test   # runs the referee unit tests (node --test)
```

- `game-logic.js` — DOM-free referee logic (unit-tested)
- `ui.js` — rendering + event wiring
- `words.js` — word list
- `scripts/make_favicon.py` — regenerate favicons (requires Pillow)

Words are a generic public list, not Codenames' copyrighted set.

## Version

v1.0.0
````

- [ ] **Step 2: Run the full test suite**

Run: `node --test`
Expected: PASS — all tests from Tasks 2 and 3 pass.

- [ ] **Step 3: Final manual smoke test**

Run: `python3 -m http.server 8000` then visit `http://localhost:8000`
Expected: full game playable as described in Task 6, favicon visible, footer shows `v1.0.0`.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Deferred: Deployment (per CW&T conventions)

After the app is verified locally, deployment is a separate step requiring the
user's GitHub and VPS access:

1. Create a GitHub repo and push.
2. Deploy the static files to `codenames.cwandt.com` on the DreamHost VPS via
   SSH/rsync.
3. Confirm the live site shows the version number and favicon.

This is intentionally out of the build plan because it needs the user's
credentials; raise it with the user once local verification passes.

---

## Self-Review Notes

- **Spec coverage:** play model (single-device, no backend — Tasks 4/6, Global Constraints); full referee (Tasks 2/3); hold-to-reveal key (Tasks 5/6); faithful aesthetic (Task 5); 9/8/7/1 key split (Task 2); win/loss incl. assassin (Task 3); one game in memory, refresh = new game (Task 6, `newGame`); generic word list (Task 1); version number in footer (Task 4); agent-red circle favicon (Task 7); GitHub repo + deploy (Deferred section). All covered.
- **Type consistency:** `createGame`, `submitClue`, `applyGuess`, `endTurn`, `other` signatures match between `game-logic.js` (Tasks 2/3) and `ui.js` (Task 6). Card runtime classes (`.card`, `.revealed`, role classes, `.key-peek`) match between `style.css` (Task 5) and `ui.js` (Task 6).
- **No placeholders:** every code step contains complete code; the word list is concrete.
