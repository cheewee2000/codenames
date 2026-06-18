# In-App Instructions — Design

**Date:** 2026-06-17
**Status:** Approved
**Builds on:** [Codenames Clone](2026-06-17-codenames-clone-design.md)

## Summary

Add player-facing guidance to the Codenames web app so newcomers can play
without knowing the rules: (1) an always-visible rules panel, and (2) a
contextual instruction block that rewrites itself each turn to say exactly what
the current player should do. UI-only change — no game-logic or rules changes.

## Decisions

- **Rules display:** Always-visible side panel (beside the board on wide
  screens, stacked below on narrow screens). No modal, no toggle.
- **Contextual instructions:** A prominent block above the board that updates
  per phase (clue / guess / gameover), naming the active team + role and the
  steps they take, including device-handoff cues.
- **Trust model unchanged:** hold-to-reveal key stays as-is; no forced
  pass-screen overlay.
- **Version:** bumps to `v1.1.0`.

## Content

### Rules panel (`#rules-panel`, heading "How to Play")
- 🎯 **Goal** — Each team races to tap all of its agent words first. Tap the
  assassin and your team loses instantly.
- 👥 **Teams** — Red and Blue. Each team has one **Spymaster**; everyone else
  are **Operatives**.
- 🕵️ **Spymaster** — Hold the key button to see which words are your team's.
  Give a **one-word clue + a number** (how many words it points to).
- 🔍 **Operatives** — Tap the words your clue points to. You get up to
  **(number + 1)** guesses.
- 🃏 **Cards** — Your color → keep guessing. Neutral or the other team's →
  your turn ends. **Assassin (black) → instant loss.**
- 🔄 **One screen** — Pass the device between Spymaster and Operatives as
  prompted.

### Instruction block (`#instructions`), by phase
Team emoji: Red = 🔴, Blue = 🔵.

- **Clue phase** — Headline: `{emoji} {TEAM} Spymaster's turn`. Cue:
  `▸ Pass the device to the {TEAM} Spymaster.` Ordered steps:
  1. Hold the key button to see your team's words.
  2. Think of a one-word clue linking some of them.
  3. Enter the clue and a number, then press **Give clue**.
  4. Pass the device to your operatives.
- **Guess phase** — Headline: `{emoji} {TEAM} operatives — make your guesses`.
  Body: `Tap the words you think are yours. Correct → keep going (up to
  {guessesRemaining} left this turn). Wrong → your turn ends. Press End
  guessing to stop. Avoid the assassin!` (The clue itself remains shown in the
  existing `#clue-display`.)
- **Gameover** — `{emoji} {TEAM} wins!{ assassin note} Press New Game to play
  again.` Assassin note appears when the assassin was revealed.

## Structure & Files

- `index.html` — add `#instructions` block in the status area; wrap the board
  and a new `#rules-panel` aside in a `#game-area` flex container; bump version
  to `v1.1.0`.
- `style.css` — `#game-area` side-by-side layout (board flexible, rules panel
  ~260px), stacking below ~860px; kraft styling for `#rules-panel` and
  `#instructions` (headline, ordered steps, handoff cue).
- `ui.js` — add a pure helper `instructionFor(game)` returning the structured
  instruction content for the current phase; `render()` writes it into
  `#instructions`. No changes to `game-logic.js`.

## Testing

- `game-logic.js` and its 13 unit tests are untouched and must still pass.
- Extend the end-to-end DOM smoke test to assert `#instructions` text:
  - clue phase mentions the Spymaster and "Give clue",
  - after a valid clue, guess phase mentions "guesses" / operatives,
  - at gameover it names the winner and "New Game".

## Out of Scope (YAGNI)

- Tutorials, animations, tooltips on individual cards.
- Localization.
- Any change to game rules, scoring, or the hold-to-reveal mechanism.
