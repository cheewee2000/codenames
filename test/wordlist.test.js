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
