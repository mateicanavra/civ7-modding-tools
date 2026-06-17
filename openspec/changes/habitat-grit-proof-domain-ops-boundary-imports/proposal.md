## Why

`grit-domain-ops-boundary-imports` is an enforced Grit check for the
domain-refactor boundary profile. Domain ops must stay pure and composable; Civ7
adapter access and map-context crossing belong outside domain implementation
ops.

This checkpoint closes the row-owned active-check proof boundary: native Grit
fixture/predicate repair, parser inventory over current domain source, full
native Grit corpus health, Habitat wrapper/current-tree selector proof,
explicit empty baseline ownership, and row-specific injected violation plus
path-control proof. The current closure records are
`DOBI-NATIVE-CORPUS-REFRESH-2026-06-16`,
`DOBI-PER-RULE-SELECTOR-2026-06-16`,
`DOBI-HABITAT-GRIT-TOOL-2026-06-16`,
`DOBI-BASELINE-FILES-2026-06-16`, and
`DOBI-INJECTED-PROBE-2026-06-16`. Raw direct Grit acquisition remains
explicitly unclaimed through `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/domain_ops_boundary_imports.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-domain-ops-boundary-imports`.
- Repair and expand the native Grit predicate/fixture for the current row:
  adapter value imports, type-only imports, side-effect imports, named
  re-exports, star re-exports, `ExtendedMapContext` identifiers, and `.adapter`
  property access in Swooper domain-op `.ts` files.
- Add controls for non-op domain paths, other mods, `.tsx`, adapter source
  lookalikes, source strings, element access, ordinary context value access,
  and dynamic import syntax.
- Record deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`, with exact current-predicate counts and
  zero current-row candidates.
- Update aggregate proof matrix, command proof log, and corpus ledger for this
  row's current checkpoint.

## What Does Not Change

- No domain source is changed.
- No source remediation or baseline mutation is performed.
- No apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No product/runtime Civ7 behavior is claimed.
- No clean closure is claimed for dynamic import or element-access semantics.
- No aggregate injected-corpus closure is claimed while DDIT remains blocked.
- No retired wrapped-script parity or broader domain-refactor closure is
  claimed.

## Owner Boundary

This workstream owns fixture, predicate, parser inventory, and proof-record
truth for `grit-domain-ops-boundary-imports`.

This workstream does not own domain source remediation, map-context API
redesign, broader domain-refactor full-profile parity, safe writes, or product
runtime proof.

## Requires

- Supervisor acceptance before stacking another Grit row above this checkpoint.
- Row-local source-owner disposition if future inventory finds live current-row
  adapter/context candidates.
- A separate apply/remediation row before mutating domain implementation source.
- A separate proof row before claiming dynamic import, element access, raw
  acquisition, retired parity, or product/runtime behavior.

## Stop Conditions

- Native fixture expansion reveals that adapter imports, re-exports,
  `ExtendedMapContext`, or `.adapter` property access cannot project exact row
  identity.
- Parser inventory finds live current-predicate candidates and no owner accepts
  remediation, blocker, or baseline disposition.
- Records would cite scratch stdout files as durable proof instead of command
  shape, scan roots, exclusions, counts, and non-claims.
- Closure would claim raw acquisition, dynamic import, element-access, source
  remediation, aggregate injected-corpus closure, apply safety, broader
  domain-refactor parity, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_ops_boundary_imports --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `bun run habitat:check -- --json --rule grit-domain-ops-boundary-imports`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-domain-ops-boundary-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
