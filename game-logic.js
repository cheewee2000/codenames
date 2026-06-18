// game-logic.js
export function shuffle(array, rng = Math.random) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function other(team) {
  return team === "red" ? "blue" : "red";
}

export function createGame(words, rng = Math.random) {
  const picked = shuffle(words, rng).slice(0, 25);
  const startingTeam = rng() < 0.5 ? "red" : "blue";
  const second = other(startingTeam);

  const roles = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(second),
    ...Array(7).fill("neutral"),
    "assassin",
  ];
  const shuffledRoles = shuffle(roles, rng);

  const cards = picked.map((word, i) => ({
    word,
    role: shuffledRoles[i],
    revealed: false,
  }));

  return {
    cards,
    startingTeam,
    currentTeam: startingTeam,
    phase: "clue",
    currentClue: null,
    guessesRemaining: 0,
    redRemaining: cards.filter((c) => c.role === "red").length,
    blueRemaining: cards.filter((c) => c.role === "blue").length,
    winner: null,
  };
}

export function submitClue(game, word, number) {
  if (game.phase !== "clue") return game;
  game.currentClue = { word, number };
  game.guessesRemaining = number + 1;
  game.phase = "guess";
  return game;
}

export function endTurn(game) {
  if (game.phase === "gameover") return game;
  game.currentTeam = other(game.currentTeam);
  game.phase = "clue";
  game.currentClue = null;
  game.guessesRemaining = 0;
  return game;
}

function remainingKey(team) {
  return team === "red" ? "redRemaining" : "blueRemaining";
}

export function applyGuess(game, index) {
  if (game.phase !== "guess") return game;
  const card = game.cards[index];
  if (!card || card.revealed) return game;

  card.revealed = true;

  if (card.role === "assassin") {
    game.winner = other(game.currentTeam);
    game.phase = "gameover";
    return game;
  }

  if (card.role === "red" || card.role === "blue") {
    const key = remainingKey(card.role);
    game[key] -= 1;
    if (game[key] === 0) {
      game.winner = card.role;
      game.phase = "gameover";
      return game;
    }
    if (card.role === game.currentTeam) {
      game.guessesRemaining -= 1;
      if (game.guessesRemaining <= 0) endTurn(game);
      return game;
    }
    // revealed opponent's card (but they haven't won) -> turn ends
    endTurn(game);
    return game;
  }

  // neutral
  endTurn(game);
  return game;
}
