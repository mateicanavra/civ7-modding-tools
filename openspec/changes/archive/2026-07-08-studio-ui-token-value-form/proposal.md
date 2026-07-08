## Why

`@swooper/mapgen-studio-ui` ships its authored design tokens in a legacy value
dialect: bare HSL channel triplets (`--primary: 216 18% 44%`) consumed as
`hsl(var(--token))`. That dialect is the root cause of three standing problems:

1. **No value-reading classifier can recognize the tokens as colors.** The live
   design-app self-check labels full color values (`oklch(...)`, `#000`)
   correctly and every bare triplet `"other"`, so authored semantic colors are
   perpetually misclassified — the exact blind spot the sibling change
   `studio-ui-token-noise-disposition` routed upstream (DEF-017, upstream item 2).
2. **It diverges from the current shadcn / Tailwind v4 convention** (full color
   values consumed as `var(--token)`), creating drift tax on every future
   component sync from the design project.
3. **It forces an inverted consumption rule** (`hsl(var(--token))` mandatory,
   bare `var(--token)` renders transparent) that already produced one
   silent-transparent bug class, recorded in `.design-sync/NOTES.md`.

This change modernizes the dialect: authored color tokens carry full CSS color
values and are consumed as `var(--token)`; opacity uses `color-mix`. It leaves
the classifier, the compiled bundle, and the two contract-enforced noise
findings alone.

## Authority

- Direct user decision (2026-07-08): modernize the token value dialect (Step A),
  leave the checker alone, keep visual fidelity as the gate; oklch re-authoring
  is a separate later design pass.
- `docs/projects/studio-ui-extraction/WORKSTREAM.md` — the design-sync contract
  facts (upload format, grade-key recipe, re-sync ritual, conventions
  validation) that this migration must ride without violating.
- `openspec/changes/studio-ui-token-noise-disposition/` — the sibling change
  that established the authored/framework token partition guard and the
  `studio-ui-design-sync` spec this delta extends; its DEF-017 disposition and
  `workstream/upstream-feedback.md` are updated here, not re-adjudicated.
- `openspec/specs/change-management/spec.md`: this change is implementation
  control downstream of the above; it does not redefine sync architecture.

## What Changes

- **Value form (the load-bearing flip).** `packages/mapgen-studio-ui/src/styles/theme.css`
  (the sole palette owner; the app's `index.css` only imports it): the dark
  (`:root, .dark`) and light (`.light`) palette blocks wrap every bare color
  triplet in `hsl()`; the `@theme inline` map drops its `hsl()` wrappers
  (`hsl(var(--x))` → `var(--x)`, 27 sites); the two aliases carry a bare
  `var(--other-token)` reference; the five base/component rules consume
  `var(--x)`; the single CSS alpha site (`hsl(var(--popover) / 0.95)`) becomes
  `color-mix`. Rendered colors are byte-identical (a lossless HSL rewrap), so
  there is zero pixel drift.
- **Consumers.** 19 TS/TSX sites across four files (`src/components/ui/sonner.tsx`,
  `src/components/panels/recipe-dag/PipelineStage.tsx`,
  `src/components/templates/StudioShellLayout.stories.tsx`,
  `apps/mapgen-studio/src/app/CanvasStage.tsx`) move to `var(--x)`; the 14 alpha
  sites among them adopt `color-mix(in oklab, var(--x) N%, transparent)`.
- **Guard re-pin (same commit as the flip).** `test/designTokens.test.ts`
  `VALUE_SHAPES.color` moves to the full-`hsl()` regex and `VALUE_SHAPES.alias`
  to `var(--...)`; `test/fixtures/token-contract.json` is re-captured from the
  new build with its `$comment` recording the re-capture reason;
  `authored-tokens.json` is unchanged (it is value-free). The
  name/kind/scope partition it enforces is preserved.
- **Knowledge surfaces.** `docs/design-tokens.md`, `.design-sync/NOTES.md` (the
  explorations rule un-inverts), `docs/system/DEFERRALS.md` (DEF-017 records
  upstream item 2 mooted, with a falsifier trigger), and the sibling change's
  `workstream/upstream-feedback.md` are updated.
- **Spec.** A value-form requirement is ADDED to `studio-ui-design-sync`.

## What Does Not Change

- The design-app classifier / `_adherence.oxlintrc.json` / findings #1 (`--tw-*`
  and `@theme` defaults) and #2 (selector-scoped custom props): contract-enforced
  noise; DEF-017 disposition stands.
- oklch re-authoring of the palette (Step B): a separate, design-led change.
- The compiled `dist/styles.css`, `_ds_bundle.*`, synced `components/**`,
  `conventions.md`, `.ds-sync/**` staged scripts: generated / app-contract
  surfaces, never hand-edited. No `--tw-*` hoisting to `:root`.

## Affected Owners

- `packages/mapgen-studio-ui/src/styles/theme.css` (palette owner)
- `packages/mapgen-studio-ui/src/components/ui/sonner.tsx`,
  `src/components/panels/recipe-dag/PipelineStage.tsx`,
  `src/components/templates/StudioShellLayout.stories.tsx`
- `apps/mapgen-studio/src/app/CanvasStage.tsx`
- `packages/mapgen-studio-ui/test/designTokens.test.ts`,
  `test/fixtures/token-contract.json`
- `packages/mapgen-studio-ui/.design-sync/light-canary-tokens.json` (regenerated,
  no script change)
- `packages/mapgen-studio-ui/docs/design-tokens.md`,
  `packages/mapgen-studio-ui/.design-sync/NOTES.md`, `docs/system/DEFERRALS.md`
- `openspec/changes/studio-ui-token-noise-disposition/workstream/upstream-feedback.md`
  (addendum)
- `openspec/changes/studio-ui-token-value-form/**`

## Forbidden Owners

- `packages/mapgen-studio-ui/dist/**`, `styles.css`, `_ds_bundle.*`,
  synced `components/**`, `_adherence.oxlintrc.json`
- `packages/mapgen-studio-ui/.ds-sync/**` (staged skill scripts),
  `.design-sync/conventions.md`
- The live DS project's synced artifacts (read-only by contract)
- Any `--tw-*` hoist to `:root`; any oklch re-authoring (Step B)

## Dependencies

- Requires: composes with `studio-ui-token-noise-disposition` (extends its
  `studio-ui-design-sync` spec and re-pins the guard it introduced). Base is
  current `main`.
- Enables parallel work: Step B (oklch palette re-authoring) becomes a clean,
  isolated design pass once the consumption architecture is `var(--x)`.
  Packetization: the flip, the guard re-pin, and the knowledge/disposition edits
  share one decision spine (dialect modernization at zero pixel drift) and one
  verification story, so they ship as one change executed as a small Graphite
  stack (this docs-only record first).

## Consumer Impact

- Rendered colors are byte-identical → the 47-component compare grades carry
  honestly; the only expected re-grade is the two story files whose bytes change
  (`StudioShellLayout.stories.tsx`), moving their sourceKeys/gradeKeys — a small,
  expected regrade, not a storm.
- JS consumers gain direct `var(--x)` consumption; the explorations rule
  un-inverts (bare `var(--token)` becomes correct).
- Design agents inherit a corrected value-form vocabulary in the synced
  guidelines.

## Verification Gates

- **Pre-commit trial build** (open question from the sweep): both compiles — the
  package Tailwind CLI and the app Vite build — emit valid
  `color-mix(in oklab, var(--x) N%, transparent)` over the new map for
  opacity-modifier utilities. If the app compile misbehaves, stop and reassess.
- `bunx nx run mapgen-studio-ui:test` green with the re-pinned value-shapes;
  negative proof (mutate one token value-shape → the guard trips).
- `light-canary` 7/7 zero drift after regenerating
  `.design-sync/light-canary-tokens.json`.
- `design-sync:check` green with a forced re-grade (internals-wave rule);
  47/47 grades match; four portal dialogs verified via the manual full-page path.
- `bun run openspec -- validate studio-ui-token-value-form --strict`.
- **Falsifier:** after the app self-check regenerates `_adherence.oxlintrc.json`,
  authored colors classify as `"color"`. If still `"other"`, the value-form
  hypothesis is wrong — record in DEF-017 and stop repo-side.
- `git diff --check`.

## Stop Conditions

- The app Vite compile emits invalid or drifted `color-mix` output over the new
  map — stop; do not commit a half-migrated theme (mid-states are mutually
  invalid).
- Any pixel drift beyond the two expected story re-grades — stop; the flip is
  meant to be lossless.
- The falsifier check still labels authored colors `"other"` — record in
  DEF-017; do not iterate further repo-side.
- Any step would require hand-editing a synced or generated artifact — stop.
