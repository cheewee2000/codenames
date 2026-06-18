import { WORDS } from "./words.js";
import { createGame, submitClue, applyGuess, endTurn } from "./game-logic.js";

const el = (id) => document.getElementById(id);
const board = el("board");

let game = createGame(WORDS);

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
revealBtn.addEventListener("touchcancel", hideKey);

el("submit-clue").addEventListener("click", onSubmitClue);
el("clue-word").addEventListener("keydown", (e) => { if (e.key === "Enter") onSubmitClue(); });
el("end-guessing").addEventListener("click", () => { endTurn(game); render(); });
el("new-game").addEventListener("click", newGame);
el("new-game-setup").addEventListener("click", newGame);

render();
