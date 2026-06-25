# Codenames (pass-and-play clone)

A single-device, pass-and-play [Codenames]-style word game. One screen, two
teams, full referee. No backend — pure static HTML/CSS/JS.

## Play

Open `index.html` in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

The current spymaster presses and holds **Spymaster — hold to reveal key** to
see which cards belong to which team, types a one-word clue and a number, then
passes the device to their operatives to tap cards.

## Develop

```bash
npm test   # runs the referee unit tests (node --test)
```

- `game-logic.js` — DOM-free referee logic (unit-tested)
- `ui.js` — rendering + event wiring
- `words.js` — word list
- `scripts/make_favicon.py` — regenerate favicons (requires Pillow)

Words are a generic public list, not Codenames' copyrighted set.

## Version

v1.3.0
