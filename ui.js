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

function teamLabel(t) {
  return t === "red" ? "RED" : "BLUE";
}

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
        <li>Enter the clue and a number, then press "Give clue".</li>
        <li>Pass the device to your operatives.</li>
      </ol>`;
  }
  if (game.phase === "guess") {
    return `<p class="handoff">▸ ${team} operatives, it's your turn.</p>
      <p>Tap the words you think are yours. Correct → keep going (up to ${game.guessesRemaining} left this turn). Wrong → your turn ends. Press "End guessing" to stop. <strong>Avoid the assassin!</strong></p>`;
  }
  if (game.phase === "gameover") {
    const byAssassin = game.cards.some((c) => c.role === "assassin" && c.revealed);
    return `<p>${byAssassin ? "The assassin was revealed. " : ""}Press "New Game" to play again.</p>`;
  }
  return "";
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
}

function onCardClick(i) {
  if (game.phase !== "guess") return;
  applyGuess(game, i);
  render();
}

function onSubmitClue() {
  const word = el("clue-word").value.trim();
  const number = parseInt(el("clue-number").value, 10);
  if (!word || word.includes(" ") || Number.isNaN(number) || number < 0) return;
  submitClue(game, word, number);
  render();
}

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

// Hold-to-reveal key
const revealBtn = el("reveal-key");
const showKey = () => board.classList.add("key-peek");
const hideKey = () => board.classList.remove("key-peek");
revealBtn.addEventListener("mousedown", showKey);
revealBtn.addEventListener("mouseup", hideKey);
revealBtn.addEventListener("mouseleave", hideKey);
revealBtn.addEventListener("touchstart", (e) => { e.preventDefault(); showKey(); }, { passive: false });
revealBtn.addEventListener("touchend", (e) => { e.preventDefault(); hideKey(); });
revealBtn.addEventListener("touchcancel", hideKey);

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
