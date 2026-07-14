# Modular Office Grid with Rigged SVG Characters

A browser-based flat 2D office scene built from modular room classes, a shared navigation grid, A* pathfinding, and front-facing rigged SVG office workers.

## Run locally

```bash
cd modular-office-grid
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Main architecture

- `BaseRoom` handles floors, walls, shared doorways, collision blockers, and navigation cells.
- Derived room classes implement reception, developer, designer, PM, toilet, coffee, and meeting rooms.
- `NavigationGrid` provides A* pathfinding across the full office.
- `OfficeCharacter` renders the earlier front-facing rigged SVG character design in a DOM overlay above the room canvas.
- `OfficeScene` coordinates room creation, pathfinding, rendering, selection, and automatic roaming.

## Key files

- `index.html` — application shell
- `styles.css` — responsive UI, room scene, and rigged-character styling
- `core.js` — shared constants, drawing helpers, `NavigationGrid`, and `BaseRoom`
- `rooms.js` — inherited room subclasses and `RoomFactory`
- `character.js` — rigged SVG `OfficeCharacter`
- `scene.js` — office layout, room connections, scene state, rendering, and UI controls
- `AGENTS.md` — Codex project instructions

## Interaction

- Select a character using the dropdown or tap the character.
- Tap a walkable location to send the selected character there.
- Select a room from the side panel to route the character into that room.
- Toggle module boundaries, navigation cells, paths, automatic roaming, and pause state from the toolbar.
