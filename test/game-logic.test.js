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
