## Why

`grit-control-app-surface` turns the game-door invariant into a Habitat Grit
check for production app/package code. Browser, server, CLI, and feature code
must not construct caller-local `Civ7DirectControlSession` instances; direct
session lifecycle belongs to `@civ7/direct-control` and the Studio server
session service.

This checkpoint owns the row-specific Grit pattern, native fixture proof,
current parser inventory, active registration, explicit empty baseline,
injected-probe metadata, and record truth for
`habitat-grit-proof-control-app-surface`.

## Target Authority Refs

- `docs/system/direct-control/GAME-DOOR-INVARIANT.md`
- `docs/system/ARCHITECTURE.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `packages/studio-server/test/gameDoorInvariant.test.ts`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Add `.grit/patterns/habitat/checks/control_app_surface.md`.
- Register `grit-control-app-surface` as an enforced Grit check over
  production `apps` and `packages` TypeScript/TSX files.
- Add explicit empty baseline
  `tools/habitat-harness/baselines/grit-control-app-surface.json`.
- Add injected-probe metadata for the row-specific constructor violation and
  sanctioned-owner control.
- Record deterministic parser inventory over `apps` and `packages`.
- Update aggregate corpus, proof matrix, and command proof records for this
  row.

## What Does Not Change

- No application or package source is remediated.
- No broad `@civ7/direct-control` import ban is claimed.
- No control-oRPC contract ownership, root-index schema export, or neighboring
  control architecture proof is claimed.
- No raw direct Grit acquisition, apply/codemod safety, classify/generator
  behavior, or product/runtime proof is claimed.
- The full shared injected-probe corpus remains blocked by the accepted DDIT
  adapter activation gap; this row records a CAS-only injected proof.

## Owner Boundary

This workstream owns row-specific Grit check proof for
`grit-control-app-surface`.

This workstream does not own direct-control package internals, Studio server
session implementation, control-oRPC contract ownership, DDIT adapter scan-root
activation, source remediation, safe writes, or product runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_app_surface --json`
- Deterministic TypeScript parser inventory over `apps` and `packages`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-control-app-surface`
- `bun run habitat:check -- --json --tool grit-check`
- Deterministic baseline inventory over Grit rules and baselines
- CAS-only injected probe through the accepted harness API from a clean start
- `bun run openspec -- validate habitat-grit-proof-control-app-surface --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
