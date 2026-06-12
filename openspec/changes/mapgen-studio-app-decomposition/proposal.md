## Why

`apps/mapgen-studio/src/App.tsx` is a 3,032-line god-module. Roughly 535 lines at
the top of the file (L127–668) are **non-React** helpers — fetch wrappers, config
builders, deterministic merge/path utilities, preset adapters, localStorage key
constants, and pure predicates — that have nothing to do with the component tree
yet sit in the same file as a 2,300-line `AppContent` closure. The provider shell
and the presentational chrome (the deck canvas stage and the error banner) are
also inlined. This makes the file unreviewable and blocks every later
decomposition slice.

This change performs a **behavior-preserving structural extraction**: it MOVES the
non-React helpers into focused feature modules and MOVES the provider shell and the
two purely-presentational chrome pieces into their own components. It does not
rewrite any logic, does not introduce client-state stores or server-data hooks
(those land in the client-data-layer slice), and does not touch any hard-core
behavior.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md`
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` (§4 component tree, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/audit/03-component-architecture.md` (§4 decomposition target, refactor #1)

## What Changes

- Extract the ~535 LoC of non-React helpers out of `App.tsx` into modules under
  existing `features/*` folders (and `shared/`): map-config save/deploy API, run-in-game
  API, Civ7 setup API + option helpers, config builders + deterministic merge,
  preset adapters, run-in-game source-snapshot storage + persistence keys, and
  small shared predicates.
- Extract the provider shell `App` wrapper into `app/StudioProviders` and the two
  purely-presentational chrome pieces (`CanvasStage`, `ErrorBanner`) and the layout
  frame (`StudioShell`) into components under `app/`.
- `App.tsx` re-imports every moved symbol; the `AppContent` closure logic is
  unchanged byte-for-byte except for the import sites and the JSX that now delegates
  to the extracted presentational components.

## Requires

- Design-system foundation, primitives, and shell-reskin slices (already in the stack).

## Enables Parallel Work

- The container/presentational store-reading split (RecipeConfigPanel, ExploreController,
  store-backed AppFooter) — deferred to the post-stores decomposition slice.

## Affected Owners

- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/features/{mapConfigSave,runInGame,civ7Setup,configOverrides,presets,studioState}/**`
- `apps/mapgen-studio/src/shared/**`
- `apps/mapgen-studio/src/app/**` (new)

## Forbidden Owners

- No change to map-generation, Deck.gl rendering, recipe semantics, or run-in-game flow.
- No change to the live-runtime poll staleness/backoff gating.
- No change to the localStorage schema (keys + serialized shapes preserved verbatim).
- No new client-state store or server-data hook (separate slice).

## Stop Conditions

- Any extraction would require rewriting logic rather than moving it.
- Behavior parity on recipe authoring, viz selection, or run-in-game cannot be preserved.

## Consumer Impact

Developers get a reviewable `App.tsx`: the non-React corpus lives in named,
testable modules, and the provider/chrome shell is separated from the authoring
closure. End users see no behavior change.

## Verification Gates

- `bun run check` (tsc --noEmit) clean.
- `bun run build` succeeds, including the worker-bundle check.
- Live preview renders with no console errors; recipe authoring, viz, and
  run-in-game controls behave identically.
- OpenSpec strict validation.
