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
