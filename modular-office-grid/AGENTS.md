# Codex instructions

## Project goal

Continue building a polished flat 2D virtual office game. Keep the office modular and grid-based so rooms can be rearranged and characters can pathfind between them.

## Start here

1. Read `README.md`.
2. Open `index.html` and inspect the scripts in this order:
   - `core.js`
   - `rooms.js`
   - `character.js`
   - `scene.js`
3. Run the project locally:

```bash
python -m http.server 8080
```

4. Open `http://localhost:8080`.

## Architecture constraints

- Preserve `BaseRoom` as the common room implementation.
- New room types must inherit from `BaseRoom`.
- Furniture that blocks movement must register blockers with the navigation grid.
- Doorways must remain shared and walkable across adjacent room modules.
- Keep room placement defined by the module-grid layout rather than hard-coded page coordinates.
- Characters should remain front-facing rigged SVG actors unless a deliberate directional-rig system is added.
- Keep character movement synchronized with the A* navigation system.
- Keep the app dependency-free unless a dependency provides a clear, documented benefit.
- Preserve mobile and desktop responsiveness.

## Validation checklist

Before completing a change, verify:

- The page loads without console errors.
- All room subclasses render.
- Shared doors connect correctly.
- Navigation cells align with doors and avoid furniture.
- Click-to-move works across multiple rooms.
- Automatic roaming works.
- Character selection works from both the dropdown and character tap.
- Module, navigation, and path overlays still work.
- Mobile layout remains usable.

## Current priorities

- Improve character scale and visual consistency across rooms.
- Add reusable furniture classes.
- Add more inherited room types.
- Add a module-grid room-layout editor.
- Add per-character customisation and role behaviours.
- Add tests for room connectivity and pathfinding.

## Documentation

Update `README.md` and this file whenever the architecture, run commands, or validation process changes.
