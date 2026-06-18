# Card Themes (Swappable Word Lists) — Design

**Date:** 2026-06-18
**Status:** Approved
**Builds on:** [Codenames Clone](2026-06-17-codenames-clone-design.md), [In-App Instructions](2026-06-17-in-app-instructions-design.md)

## Summary

Let players choose the deck's word theme — built-in preset lists plus a custom
"paste your own words" option. The current generic list stays the **Default**.
Game rules are unchanged; only the source word list varies.

## Decisions

- **Theme source:** presets **and** custom. Presets: Default (current 393
  words), Animals, Movies & TV, Food & Drink, Space, Sports (~50 words each).
- **Selector:** a `Deck` dropdown in the header listing the presets + "Custom…".
- **Custom:** choosing "Custom…" reveals a textarea; words are parsed and must
  total **≥ 25 unique** words or an inline error blocks the start.
- **Switching:** picking a preset (or applying valid custom words) starts a
  fresh game from that list. "New Game" reuses the currently selected deck.
- **Persistence:** the chosen theme (and custom words) persist in
  `localStorage` so a reload keeps the deck. This is a settings preference, not
  game state — "refresh = new game" is unchanged.
- **Version:** bumps to `v1.2.0`.

## Architecture

`game-logic.js` is untouched — `createGame(words, rng)` already accepts any word
array, so the 13 referee tests stay green.

### `words.js` (word-list module)
- Keep the existing `export const WORDS` (393-word Default array) as-is.
- Add `export const THEMES` — `{ "Default": WORDS, "Animals": [...], "Movies &
  TV": [...], "Food & Drink": [...], "Space": [...], "Sports": [...] }`.
- Add `export function parseWordList(text)` — pure: split on newlines/commas,
  trim, uppercase, drop blanks, dedupe; returns `string[]`. Unit-tested.

### `ui.js`
- Imports `THEMES`, `parseWordList`.
- Tracks `currentWords` (array) and the selected deck name.
- Populates the `<select>` from `Object.keys(THEMES)` + a `Custom…` entry.
- Handles: preset change → new game from that list; `Custom…` → reveal
  textarea; Apply → validate (≥25 unique) → new game or inline error.
- `newGame()` deals from `currentWords`.
- `localStorage` load on startup / save on change, wrapped in try/catch
  (private-mode safe). Keys: `codenames.theme`, `codenames.customWords`.

### `index.html` / `style.css`
- Header gains a `Deck` label + `#theme-select` next to New Game.
- A hidden `#custom-words` panel (textarea + Apply button + `#custom-error`).
- Rules panel gains a one-line note about the Deck menu.
- Kraft-styled to match; responsive.

## Constraints

- `MIN_WORDS = 25`. Fewer unique custom words → inline error, no game start.
- Custom textarea content and instruction templates are the only dynamic
  strings; they go to element `value`/`textContent`, never `innerHTML`
  (no injection surface).

## Testing

- New `test/wordlist.test.js` unit-tests `parseWordList` (split, trim,
  uppercase, dedupe, blanks, empty) and asserts every theme has ≥25 words and
  `THEMES.Default === WORDS`.
- `game-logic.js` untouched → 13 existing tests still pass.
- End-to-end DOM smoke test extended: switch preset → board uses that theme's
  words; apply valid custom → board uses them; <25 words → rejected with error.

## Out of Scope (YAGNI)

- Per-theme card art or color skins (this is vocabulary only).
- Importing word lists from a URL/file.
- Editing/saving multiple named custom decks.
