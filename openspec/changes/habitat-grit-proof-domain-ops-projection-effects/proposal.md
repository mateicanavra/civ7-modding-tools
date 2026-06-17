## Why

`grit-domain-ops-projection-effects` is an enforced Grit check for the
domain-refactor boundary profile. Domain ops must not encode map projection or
map effect dependency keys; map projection/effect surfaces are recipe/runtime
composition surfaces, not domain-op internals.

This checkpoint opens the row packet before proof closure and limits the row to
the current row-owned check proof: native Grit fixture behavior, parser
inventory over current domain source, and record truth. Current restacked shared
wrapper selector/current-tree, explicit baseline file/integrity, and injected
probe API proof are inherited only through `HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
`HGPR-PER-RULE-SELECTORS-2026-06-15`,
`HGPR-BASELINE-FILES-2026-06-15`,
`HGPR-BASELINE-INTEGRITY-2026-06-15`, and
`HGPR-INJECTED-GRIT-ROWS-2026-06-15`. Raw direct Grit acquisition remains
explicitly unclaimed through `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/domain_ops_projection_effects.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json`

## What Changes

- Expand the native Grit fixture for
  `domain_ops_projection_effects`.
- Record current-predicate positives for `artifact:map.*` and `effect:map.*`
  string literal classes in Swooper domain-op `.ts` files.
- Record current-predicate controls for domain-owned artifact/effect keys,
  map-key lookalikes, non-op domain paths, other mods, `.tsx`, recipe paths,
  and template literals.
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
- No classify or generator behavior is claimed.
- No product/runtime Civ7 behavior is claimed.
- No retired wrapped-script parity or broader domain-refactor closure is
  claimed.

## Owner Boundary

This workstream owns fixture, parser inventory, and proof-record truth for
`grit-domain-ops-projection-effects`.

This workstream does not own domain source remediation, map projection
architecture, classify/generator behavior, broader domain-refactor full-profile
parity, safe writes, or product runtime proof.

## Requires

- Supervisor acceptance before stacking another Grit row above this checkpoint.
- Row-local source-owner disposition if future inventory finds live current-row
  map projection/effect key candidates.
- A separate apply/remediation row before mutating domain implementation source.
- A separate proof row before claiming raw acquisition, retired parity, broader
  projection architecture closure, classify/generator behavior, or
  product/runtime behavior.

## Stop Conditions

- Native fixture expansion reveals that current row identity cannot be
  projected to exact map projection/effect key classes.
- Parser inventory finds live current-predicate candidates and no owner accepts
  remediation, blocker, or baseline disposition.
- Records would cite scratch stdout files as durable proof instead of command
  shape, scan roots, exclusions, counts, and non-claims.
- Closure would claim wrapper/current-tree, raw acquisition, injected cleanup,
  baseline behavior, apply safety, broader domain-refactor parity, classify,
  generator, or product proof from native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_ops_projection_effects --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `bun run openspec -- validate habitat-grit-proof-domain-ops-projection-effects --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
