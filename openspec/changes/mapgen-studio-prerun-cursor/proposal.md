# Pre-run canvas: no grab cursor, no dead drag

## Why

In the "Awaiting matter" state the canvas showed a grab cursor but dragging
appeared to do nothing: the deck controller was always live, yet the only
visible pre-run texture is the DOM CSS graticule behind the canvas — the
camera moved an empty scene. The cursor advertised an affordance the user
couldn't perceive. The user offered two options (make pre-run drag real, or
suppress the affordance) and delegated the call: suppressing wins — making
pre-run drag visibly real would require moving the background texture into
deck layers, unjustified now (X3's mesh standardization is the natural
future hook if ever wanted).

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X5)

## What Changes

- `DeckCanvas` gains an `interactive` prop (default true): when false, the
  deck controller is off and `getCursor` returns `default`; when true, the
  controller (with the keyboard moveSpeed tuning) and the grab/grabbing
  cursor return. Toggles apply via `setProps` without remounting Deck.
- `CanvasStage` passes `interactive={hasManifest}` — the same gate as the
  "Awaiting matter" overlay.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/viz/DeckCanvas.tsx`,
  `apps/mapgen-studio/src/app/CanvasStage.tsx`
