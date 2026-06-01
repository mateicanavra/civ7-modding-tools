# normalize-import-boundaries Implementation Record

Date: 2026-05-30
Branch: `codex/normalize-import-boundaries-impl`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-normalize-authority-routing`

## Scope

This slice implements the first narrow import guard from the normalization
packet: standard recipe source may assemble named domain public surfaces, but
must not deep-import domain internals.

## Policy

The scoped import matrix is documented in
`docs/system/libs/mapgen/policies/IMPORTS.md`.

The first enforced rule covers only:

- Importing code: `mods/mod-swooper-maps/src/recipes/**`
- Blocked shape: `@mapgen/domain/<domain>/<internal-subpath>`
- Allowed domain surfaces:
  - `@mapgen/domain/<domain>`
  - `@mapgen/domain/<domain>/ops`
  - `@mapgen/domain/<domain>/config.js`

Broader cross-domain, test, and domain-internal restrictions remain policy-only
until their owner surfaces are normalized by later slices.

## Remediation

- Added public config surfaces for foundation and hydrology:
  - `mods/mod-swooper-maps/src/domain/foundation/config.ts`
  - `mods/mod-swooper-maps/src/domain/hydrology/config.ts`
- Extended the morphology config surface to export morphology knobs and knob
  multipliers.
- Updated standard recipe imports that reached into `shared/knobs`,
  `shared/knob-multipliers`, or ecology `types.js` to use root or `/config.js`
  public surfaces.
- Did not move catalogs, stages, ops, or topology files.

## Guard

- Added `scripts/lint/lint-mapgen-recipe-imports.sh`.
- Wired it into the root `check` script as `lint:mapgen-recipe-imports`.
- Added `mods/mod-swooper-maps/test/pipeline/recipe-import-boundary.test.ts`
  with a seeded deep-import violation string plus a current-tree scan.

## Verification

Commands run from the worktree:

- `bun run lint:mapgen-recipe-imports`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/recipe-import-boundary.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `rg -n "@mapgen/domain/[^'\\\"]+/(?!ops(?:\\.js)?['\\\"]|config(?:\\.js)?['\\\"])[^'\\\"]+" mods/mod-swooper-maps/src/recipes -g '*.ts' -P || true`
- `bun run openspec -- validate normalize-import-boundaries --strict`
- `bun run openspec:validate`
- `git diff --check`
