# Codenames Clone — Design

**Date:** 2026-06-17
**Status:** Approved

## Summary

A single-page static web app for pass-and-play Codenames on one shared device.
No backend. The app acts as a full referee. Visual direction is faithful to the
physical board game: kraft/tan cardstock, the classic agent color palette, and
stamped-style typography.

## Decisions

- **Play model:** Single-device pass-and-play. One screen everyone gathers
  around. No accounts, no rooms, no networking.
- **Referee:** Full. The app tracks turns, clues, guess counts, score, win/loss.
- **Spymaster key reveal:** Hold-to-reveal button. While held (or toggled on),
  a color overlay appears on every card; releasing hides it before the device
  is passed to the guessers. Trust-based, like glancing at the key card.
- **Aesthetic:** Faithful to the real game.
- **Scope:** One game in memory at a time. Refresh = new game. No save/resume.
- **Words:** A generic, public word list (~400 words) — not Codenames' exact
  copyrighted list.

## Tech & Structure

Pure vanilla HTML/CSS/JS, no build step.

- `index.html` — markup and screen containers
- `style.css` — faithful cardstock aesthetic, animations
- `game.js` — game state, referee logic, rendering
- `words.js` — the word list array
- Static deploy (per CW&T conventions: GitHub repo, version number on the live
  site, deploy to `codenames.cwandt.com`). Favicon = solid agent-red circle,
  diameter 50% of width, centered, transparent background.

State lives in memory in a single game-state object. A version number is shown
in the footer.

## Game Model

### Card
```
{ word: string, role: 'red' | 'blue' | 'neutral' | 'assassin', revealed: bool }
```

### Key (standard Codenames split)
- Starting team: 9 cards
- Other team: 8 cards
- Neutral bystanders: 7 cards
- Assassin: 1 card
- Total: 25
- Starting team is chosen at random and takes the first turn (and the extra 9th card).

### Game State
```
{
  cards: Card[25],
  startingTeam: 'red' | 'blue',
  currentTeam: 'red' | 'blue',
  phase: 'clue' | 'guess' | 'gameover',
  currentClue: { word: string, number: number } | null,
  guessesRemaining: number,
  redRemaining: number,
  blueRemaining: number,
  winner: 'red' | 'blue' | null
}
```

## Screens & Flow

### Setup
- "New Game" generates 25 random words, builds and shuffles the key, assigns
  positions, picks the starting team.
- Optional "re-roll board" before play begins.

### Board
- 5×5 grid of word cards.
- Scoreboard: red ▸ N cards left, blue ▸ N cards left.
- Turn banner: whose turn, current phase.

### Clue phase (spymaster's turn)
- "Spymaster — hold to reveal key" button overlays each card's true color while
  held; release to hide.
- Spymaster enters a one-word clue + a number, then submits.
- Submitting sets `currentClue`, `guessesRemaining = number + 1`, moves to
  guess phase.

### Guess phase (pass to guessers)
- Tap a card to reveal it (flip animation). Referee resolves the tap:
  - **Own team color:** card revealed, decrement that team's remaining,
    decrement `guessesRemaining`. If team's remaining hits 0 → that team wins.
    If `guessesRemaining` hits 0 → turn ends. Otherwise keep guessing.
  - **Neutral:** card revealed, turn ends.
  - **Opponent color:** card revealed, decrement opponent remaining, turn ends.
    If opponent remaining hits 0 → opponent wins.
  - **Assassin:** card revealed, current team loses immediately → gameover.
- "End guessing" button lets guessers stop early and pass the turn.
- Turn switch: `currentTeam` flips, phase returns to `clue`.

### Game over
- Winner banner (which team won, and whether by assassin).
- "New Game" button resets to setup.

## Win / Loss Rules

- A team **wins** when all of its cards are revealed.
- A team **loses instantly** if it reveals the assassin.

## Out of Scope (YAGNI)

- Online/multiplayer rooms, accounts, networking.
- Save/resume, game history, statistics.
- Sound, custom word packs, alternate board sizes/variants.
- Undo (a wrong tap is part of the game; refresh starts over).
