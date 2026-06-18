# Card Themes Implementation Plan

**Goal:** Add swappable word-list themes (presets + custom) to the Codenames app, default unchanged.

**Tech Stack:** vanilla HTML/CSS/JS (ES modules), Node `--test`, no build step.

## Global Constraints

- `game-logic.js` is NOT modified. `node --test` must keep passing the 13 referee tests, plus the new word-list tests.
- `MIN_WORDS = 25` unique words required for a custom deck.
- Dynamic strings go to `value`/`textContent`, never `innerHTML`.
- Version bumps to `v1.2.0`.
- Relative asset paths only.

---

### Task 1: `words.js` themes + `parseWordList` (TDD)

**Files:** Modify `words.js`. Create `test/wordlist.test.js`.

**Interfaces produced:**
- `THEMES`: object mapping theme name → `string[]` (includes `"Default": WORDS`).
- `WORDS`: unchanged (the Default 393-word array).
- `parseWordList(text) -> string[]`: split on newlines/commas, trim, uppercase, drop blanks, dedupe.

- [ ] **Step 1: Write the failing tests** — create `test/wordlist.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMES, WORDS, parseWordList } from "../words.js";

test("parseWordList splits on newlines and commas, trims, uppercases", () => {
  assert.deepEqual(parseWordList("cat, dog\nbird"), ["CAT", "DOG", "BIRD"]);
});

test("parseWordList drops blanks and dedupes (case-insensitive)", () => {
  assert.deepEqual(parseWordList("  cat ,, cat \n\n DOG \n Cat "), ["CAT", "DOG"]);
});

test("parseWordList returns [] for empty/whitespace input", () => {
  assert.deepEqual(parseWordList(""), []);
  assert.deepEqual(parseWordList("   \n , \n"), []);
});

test("THEMES has Default aliased to WORDS plus the preset decks", () => {
  assert.equal(THEMES["Default"], WORDS);
  for (const name of ["Default", "Animals", "Movies & TV", "Food & Drink", "Space", "Sports"]) {
    assert.ok(Array.isArray(THEMES[name]), name + " is an array");
    assert.ok(THEMES[name].length >= 25, name + " has at least 25 words");
  }
});

test("every preset deck is unique uppercase words", () => {
  for (const [name, list] of Object.entries(THEMES)) {
    assert.equal(new Set(list).size, list.length, name + " has no duplicates");
    assert.ok(list.every((w) => w === w.toUpperCase()), name + " is all uppercase");
  }
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test` → FAIL (`THEMES`/`parseWordList` not exported).

- [ ] **Step 3: Implement** — in `words.js`, keep the existing `export const WORDS = [ ... ];` block exactly as-is. APPEND the following after it:

```js

export const THEMES = {
  "Default": WORDS,
  "Animals": [
    "LION", "TIGER", "BEAR", "WOLF", "FOX", "DEER", "MOOSE", "RABBIT", "SQUIRREL",
    "BEAVER", "OTTER", "BADGER", "HEDGEHOG", "MOLE", "BAT", "OWL", "EAGLE", "HAWK",
    "FALCON", "ROBIN", "SPARROW", "CROW", "RAVEN", "PARROT", "PENGUIN", "OSTRICH",
    "FLAMINGO", "PEACOCK", "SWAN", "DUCK", "GOOSE", "CHICKEN", "TURKEY", "HORSE",
    "DONKEY", "ZEBRA", "GIRAFFE", "ELEPHANT", "RHINO", "HIPPO", "CAMEL", "KANGAROO",
    "KOALA", "PANDA", "MONKEY", "GORILLA", "SLOTH", "CROCODILE", "SNAKE", "LIZARD",
    "TURTLE", "FROG", "SHARK", "WHALE", "DOLPHIN", "OCTOPUS", "JELLYFISH", "CRAB",
    "LOBSTER", "STARFISH", "SEAHORSE", "SEAL", "WALRUS"
  ],
  "Movies & TV": [
    "ACTOR", "DIRECTOR", "SCRIPT", "SCENE", "CAMERA", "STUDIO", "SEQUEL", "TRAILER",
    "POPCORN", "OSCAR", "VILLAIN", "HERO", "SIDEKICK", "PLOT", "TWIST", "CLIFFHANGER",
    "PILOT", "EPISODE", "SEASON", "FINALE", "REBOOT", "REMAKE", "CARTOON", "ANIMATION",
    "COMEDY", "DRAMA", "THRILLER", "HORROR", "WESTERN", "MUSICAL", "ROMANCE",
    "DOCUMENTARY", "BLOCKBUSTER", "CASTING", "STUNT", "CAMEO", "MONTAGE", "SOUNDTRACK",
    "CREDITS", "PREMIERE", "RED CARPET", "SCREEN", "THEATER", "MATINEE", "BINGE",
    "STREAMING", "NETWORK", "CHANNEL", "SITCOM", "SPINOFF", "FRANCHISE", "PREQUEL",
    "SCREENPLAY", "BOX OFFICE"
  ],
  "Food & Drink": [
    "APPLE", "BANANA", "ORANGE", "GRAPE", "LEMON", "LIME", "CHERRY", "PEACH", "MANGO",
    "MELON", "BERRY", "BREAD", "BUTTER", "CHEESE", "EGG", "BACON", "SAUSAGE", "STEAK",
    "RICE", "PASTA", "NOODLE", "PIZZA", "BURGER", "TACO", "SUSHI", "SALAD", "SOUP",
    "STEW", "CURRY", "SAUCE", "PEPPER", "SALT", "SUGAR", "HONEY", "JAM", "CAKE",
    "COOKIE", "PIE", "DONUT", "CHOCOLATE", "CANDY", "ICE CREAM", "COFFEE", "TEA",
    "JUICE", "SODA", "MILK", "WINE", "SMOOTHIE", "PANCAKE", "WAFFLE", "CEREAL",
    "TOAST", "OMELETTE"
  ],
  "Space": [
    "STAR", "PLANET", "MOON", "SUN", "COMET", "ASTEROID", "METEOR", "GALAXY", "NEBULA",
    "COSMOS", "ORBIT", "GRAVITY", "ECLIPSE", "CRATER", "ROCKET", "SHUTTLE", "SATELLITE",
    "PROBE", "ROVER", "LANDER", "ASTRONAUT", "COSMONAUT", "SPACESUIT", "HELMET",
    "LAUNCH", "COUNTDOWN", "MISSION", "STATION", "TELESCOPE", "OBSERVATORY", "MERCURY",
    "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO",
    "BLACK HOLE", "SUPERNOVA", "CONSTELLATION", "ASTRONOMY", "UNIVERSE", "METEORITE",
    "SOLAR", "LUNAR", "ALIEN", "UFO"
  ],
  "Sports": [
    "SOCCER", "FOOTBALL", "BASEBALL", "BASKETBALL", "HOCKEY", "TENNIS", "GOLF",
    "CRICKET", "RUGBY", "VOLLEYBALL", "BADMINTON", "BOXING", "WRESTLING", "JUDO",
    "KARATE", "FENCING", "ARCHERY", "ROWING", "SAILING", "SURFING", "SKIING",
    "SNOWBOARD", "SKATING", "CYCLING", "RUNNING", "SPRINT", "MARATHON", "HURDLES",
    "JAVELIN", "DISCUS", "GYMNASTICS", "DIVING", "SWIMMING", "BOWLING", "BILLIARDS",
    "DARTS", "CURLING", "LACROSSE", "POLO", "REFEREE", "UMPIRE", "COACH", "STADIUM",
    "JERSEY", "TROPHY", "MEDAL", "WHISTLE", "PENALTY", "OFFSIDE", "TOUCHDOWN", "DUNK",
    "SERVE", "RALLY"
  ],
};

export function parseWordList(text) {
  const seen = new Set();
  const out = [];
  for (const raw of String(text).split(/[\n,]+/)) {
    const w = raw.trim().toUpperCase();
    if (w && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}
```

- [ ] **Step 4: Run to verify it passes** — `node --test` → all tests pass (13 referee + 5 wordlist), pristine.

- [ ] **Step 5: Commit**

```bash
git add words.js test/wordlist.test.js
git commit -m "feat: add preset word-list themes and parseWordList util"
```

---

### Task 2: Theme selector UI (presets + custom + persistence)

**Files:** Modify `index.html`, `style.css`, `ui.js`.

**Interfaces consumed:** `THEMES`, `parseWordList` from `words.js`.

#### Edit A — `index.html`

1. Replace the `<header>` block. Find:

```html
  <header>
    <h1>CODENAMES</h1>
    <button id="new-game-setup" type="button">New Game</button>
  </header>
```

Replace with:

```html
  <header>
    <h1>CODENAMES</h1>
    <div id="setup">
      <label id="theme-label" for="theme-select">Deck</label>
      <select id="theme-select"></select>
      <button id="new-game-setup" type="button">New Game</button>
    </div>
  </header>

  <section id="custom-words" hidden>
    <label for="custom-input">Your own words — one per line or comma-separated (at least 25):</label>
    <textarea id="custom-input" rows="4" placeholder="APPLE&#10;BANANA&#10;CHERRY&#10;..."></textarea>
    <div class="custom-actions">
      <button id="apply-custom" type="button">Use these words</button>
      <span id="custom-error" class="error" role="alert"></span>
    </div>
  </section>
```

2. Add a rules-panel note. Find the last rules `<li>`:

```html
        <li><strong>🔄 One screen</strong> — Pass the device between Spymaster and Operatives as the prompts say.</li>
```

Replace with that same line followed by:

```html
        <li><strong>🔄 One screen</strong> — Pass the device between Spymaster and Operatives as the prompts say.</li>
        <li><strong>🎨 Deck</strong> — Pick a word theme — or paste your own — from the Deck menu up top.</li>
```

3. Bump version: find `<span id="version">v1.1.0</span>` → `<span id="version">v1.2.0</span>`.

#### Edit B — `style.css`

Append at the end of the file:

```css
#setup { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#theme-label {
  color: var(--paper);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
}
#theme-select {
  font-family: inherit;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.5em 0.6em;
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 6px;
  cursor: pointer;
}

#custom-words {
  width: 100%;
  max-width: 1180px;
  margin: 8px auto 0;
  background: var(--paper);
  border: 2px solid var(--kraft-dark);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--ink);
}
#custom-words label { display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 6px; }
#custom-input {
  width: 100%;
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.5em;
  border: 2px solid var(--ink);
  border-radius: 6px;
  resize: vertical;
}
.custom-actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
#custom-error { color: var(--red); font-weight: bold; font-size: 0.85rem; }
```

#### Edit C — `ui.js`

1. Replace the import lines at the top. Find:

```js
import { WORDS } from "./words.js";
import { createGame, submitClue, applyGuess, endTurn } from "./game-logic.js";

const el = (id) => document.getElementById(id);
const board = el("board");

let game = createGame(WORDS);
```

Replace with:

```js
import { THEMES, parseWordList } from "./words.js";
import { createGame, submitClue, applyGuess, endTurn } from "./game-logic.js";

const el = (id) => document.getElementById(id);
const board = el("board");

const CUSTOM = "Custom…";
const MIN_WORDS = 25;
const THEME_KEY = "codenames.theme";
const CUSTOM_KEY = "codenames.customWords";

function loadSetting(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
}

// Resolve the deck to start with from saved settings.
let currentDeck = "Default";
let currentWords = THEMES["Default"];
(function restoreDeck() {
  const saved = loadSetting(THEME_KEY);
  if (saved === CUSTOM) {
    const words = parseWordList(loadSetting(CUSTOM_KEY) || "");
    if (words.length >= MIN_WORDS) { currentDeck = CUSTOM; currentWords = words; }
  } else if (saved && THEMES[saved]) {
    currentDeck = saved; currentWords = THEMES[saved];
  }
})();

let game = createGame(currentWords);
```

2. Replace the `newGame` function. Find:

```js
function newGame() {
  game = createGame(WORDS);
  render();
}
```

Replace with:

```js
function newGame() {
  game = createGame(currentWords);
  render();
}

// Populate the theme dropdown from THEMES plus a Custom… entry.
function buildThemeOptions() {
  const select = el("theme-select");
  select.innerHTML = "";
  for (const name of Object.keys(THEMES).concat(CUSTOM)) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.value = currentDeck;
}

function onThemeChange() {
  const value = el("theme-select").value;
  if (value === CUSTOM) {
    el("custom-words").hidden = false;
    el("custom-input").value = loadSetting(CUSTOM_KEY) || "";
    el("custom-error").textContent = "";
    return; // wait for Apply before starting a custom game
  }
  el("custom-words").hidden = true;
  el("custom-error").textContent = "";
  currentDeck = value;
  currentWords = THEMES[value];
  saveSetting(THEME_KEY, value);
  newGame();
}

function onApplyCustom() {
  const words = parseWordList(el("custom-input").value);
  if (words.length < MIN_WORDS) {
    el("custom-error").textContent =
      "Need at least " + MIN_WORDS + " words — you have " + words.length + ".";
    return;
  }
  el("custom-error").textContent = "";
  currentDeck = CUSTOM;
  currentWords = words;
  saveSetting(THEME_KEY, CUSTOM);
  saveSetting(CUSTOM_KEY, el("custom-input").value);
  newGame();
}
```

3. At the end of the file, BEFORE the final `render();` line, wire the new controls and show the custom panel if the restored deck is custom. Find the existing tail:

```js
el("submit-clue").addEventListener("click", onSubmitClue);
el("clue-word").addEventListener("keydown", (e) => { if (e.key === "Enter") onSubmitClue(); });
el("end-guessing").addEventListener("click", () => { endTurn(game); render(); });
el("new-game").addEventListener("click", newGame);
el("new-game-setup").addEventListener("click", newGame);

render();
```

Replace with:

```js
el("submit-clue").addEventListener("click", onSubmitClue);
el("clue-word").addEventListener("keydown", (e) => { if (e.key === "Enter") onSubmitClue(); });
el("end-guessing").addEventListener("click", () => { endTurn(game); render(); });
el("new-game").addEventListener("click", newGame);
el("new-game-setup").addEventListener("click", newGame);
el("theme-select").addEventListener("change", onThemeChange);
el("apply-custom").addEventListener("click", onApplyCustom);

buildThemeOptions();
if (currentDeck === CUSTOM) {
  el("custom-words").hidden = false;
  el("custom-input").value = loadSetting(CUSTOM_KEY) || "";
}

render();
```

#### Verification

- [ ] `node --test` → all pass (13 referee + 5 wordlist), pristine.
- [ ] `node --check ui.js` → no output.
- [ ] Confirm new ids present: `node -e "const h=require('fs').readFileSync('index.html','utf8'); ['id=\"theme-select\"','id=\"custom-words\"','id=\"custom-input\"','id=\"apply-custom\"','id=\"custom-error\"','v1.2.0'].forEach(s=>{if(!h.includes(s))throw new Error('missing '+s)}); console.log('index.html OK')"`

#### Commit

```bash
git add index.html style.css ui.js
git commit -m "feat: deck theme selector with presets, custom words, and persistence (v1.2.0)"
```

---

## Self-Review Notes

- Spec coverage: presets + Default (Task 1 THEMES), parseWordList + tests (Task 1), selector + custom panel + ≥25 validation (Task 2 Edit A/C), persistence with private-mode guard (Task 2 Edit C `loadSetting`/`saveSetting`), rules note + version bump (Task 2 Edit A), logic untouched (no game-logic.js edits). All covered.
- Type consistency: `THEMES`, `parseWordList`, `CUSTOM`, `MIN_WORDS`, `currentWords`, `currentDeck`, `newGame`, `buildThemeOptions`, `onThemeChange`, `onApplyCustom` are used consistently between tasks.
- Injection: custom words go to `textContent`/`value` and into `createGame` (rendered per-card via `textContent`), never `innerHTML`.
