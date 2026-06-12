## 1. Implementation

- [x] 1.1 `DeckCanvas`: `interactive` prop gates controller + `getCursor`;
      toggles via `setProps`, no Deck remount.
- [x] 1.2 `CanvasStage`: `interactive={hasManifest}` (same gate as the
      "Awaiting matter" overlay).

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-prerun-cursor --strict`
- [x] 2.2 tsc + vitest green
- [x] 2.3 Live: pre-run cursor `default`; post-run cursor `grab`, zoom/pan
      working (zoom inspection during X3 verification used the live wheel).
