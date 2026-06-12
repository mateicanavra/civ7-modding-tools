## 1. Implementation

- [x] 1.1 Remove the unlayered `* { margin; padding; box-sizing }` rule from
      `apps/mapgen-studio/index.html`; keep the `body` flash guard.
- [x] 1.2 Point the pre-paint theme script at `theme-preference` (the key
      `useTheme.ts` writes); keep dark-by-default and the try/catch fallback.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-spacing-substrate --strict`
- [x] 2.2 tsc + mapgen-studio vitest project green
- [x] 2.3 Live DOM proof on :5173: `px-3` row computes 12px inline padding;
      stage card computes 10px padding; screenshot the restored texture.
- [x] 2.4 Theme: with `theme-preference=light` persisted, reload shows no dark
      flash and the app mounts light; cleared key mounts dark.
- [x] 2.5 Full-app visual sweep (header, docks, footer, dialogs) for surfaces
      that over-inflate with restored spacing; log re-tunes to owning slices.
