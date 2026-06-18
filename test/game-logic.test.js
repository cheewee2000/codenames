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

test("guessing an opponent card they don't run out of switches the turn", () => {
  const g = fixedGame();
  g.cards[4].role = "blue";   // a second blue card so blue won't hit zero
  g.blueRemaining = 2;
  submitClue(g, "OCEAN", 2);
  applyGuess(g, 1); // red taps a blue card; blue still has 1 left
  assert.equal(g.cards[1].revealed, true);
  assert.equal(g.blueRemaining, 1);
  assert.equal(g.winner, null);
  assert.equal(g.phase, "clue");
  assert.equal(g.currentTeam, "blue");
});
