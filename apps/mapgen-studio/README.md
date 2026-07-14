# mapgen-studio

The MapGen Studio frontend (React 19 + Vite + Tailwind v4). See
[`system.md`](./system.md) for the as-built design language.

## UI components, Storybook, and the design sync live in the package

The studio's 45-component presentational surface is
**`@swooper/mapgen-studio-ui`** (`packages/mapgen-studio-ui`) — a real workspace
package with a compiled dist, generated `.d.ts`, and a compiled stylesheet. The
app imports it like any dependency; its theme/fonts seams feed this app's
Tailwind compile (`src/index.css`).

Everything that used to sit app-side moved with it (B7 extraction repoint):

- **Storybook workbench** — package-hosted, stories co-located in the package
  `src/`: `nx run mapgen-studio-ui:storybook`. The app has zero story files;
  `packages/mapgen-studio-ui/.storybook/EXCLUSIONS.md` records which app-side
  hosts (StudioShell, StudioProviders, DeckCanvas, CanvasStage) deliberately
  stay unstoried.
- **Design sync (claude.ai/design)** — `packages/mapgen-studio-ui/.design-sync/`
  + `.ds-sync/`, repointed at the package's real artifacts. One-command local
  check: `bunx nx run 'mapgen-studio-ui:"design-sync:check"'`. The operator's
  manual is the package's `.design-sync/NOTES.md` (append-only, read bottom-up).
