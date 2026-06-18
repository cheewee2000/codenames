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
