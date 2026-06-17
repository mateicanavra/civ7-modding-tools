## Why

`grit-domain-ops-projection-effects` is an enforced Grit check for the
domain-refactor boundary profile. Domain ops must not encode map projection or
map effect dependency keys; map projection/effect surfaces are recipe/runtime
composition surfaces, not domain-op internals.

This checkpoint closes the row-owned active-check proof boundary: native Grit
fixture behavior, parser inventory over current domain source, full native
corpus health, Habitat wrapper/current-tree selector proof, aggregate
`grit-check` wrapper proof, explicit empty baseline ownership, and row-specific
injected violation/path-control proof. Current closure records are
`DOPE-NATIVE-FIXTURES-2026-06-15`,
`DOPE-DOMAIN-OPS-INVENTORY-2026-06-15`,
`DOPE-NATIVE-CORPUS-REFRESH-2026-06-16`,
`DOPE-PER-RULE-SELECTOR-2026-06-16`,
`DOPE-HABITAT-GRIT-TOOL-2026-06-16`,
`DOPE-BASELINE-FILES-2026-06-16`, and
`DOPE-INJECTED-PROBE-2026-06-16`. Raw direct Grit acquisition remains
explicitly unclaimed through `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`, and
aggregate injected-corpus closure remains unclaimed while unrelated DDIT remains
blocked.

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
- Record current per-rule wrapper, aggregate wrapper, explicit empty baseline,
  and row-specific injected violation/path-control proof for the existing active
  check.

## What Does Not Change

- No domain source is changed.
- No source remediation or baseline mutation is performed.
- No apply/codemod safety is claimed.
- No raw direct Grit acquisition is claimed.
- No aggregate injected-corpus closure is claimed while unrelated DDIT remains
  blocked.
- No classify or generator behavior is claimed.
- No product/runtime Civ7 behavior is claimed.
- No retired wrapped-script parity or broader domain-refactor closure is
  claimed.

## Owner Boundary

This workstream owns fixture, parser inventory, wrapper/current-tree, explicit
empty baseline, row-specific injected violation/path-control, and proof-record
truth for `grit-domain-ops-projection-effects`.

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
  aggregate injected-corpus closure, product/runtime behavior, or template
  literal closure.

## Stop Conditions

- Native fixture expansion reveals that current row identity cannot be
  projected to exact map projection/effect key classes.
- Parser inventory finds live current-predicate candidates and no owner accepts
  remediation, blocker, or baseline disposition.
- Records would cite scratch stdout files as durable proof instead of command
  shape, scan roots, exclusions, counts, and non-claims.
- Closure would claim raw acquisition, aggregate injected-corpus closure,
  source remediation, apply safety, broader domain-refactor parity, classify,
  generator, template-literal closure, or product proof from native
  fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_ops_projection_effects --json`
- Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-domain-ops-projection-effects`
- `bun run habitat:check -- --json --tool grit-check`
- Explicit empty Grit baseline inventory with DOP included.
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-domain-ops-projection-effects --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- Stale inherited/pending closure wording scan for this packet and aggregate DOP
  rows.
- `git diff --check HEAD^..HEAD`
- `git diff --check`
- `git ls-files --deleted`
