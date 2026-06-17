## Why

`habitat-grit-shim-cutover-terms` resolves the cutover-vocabulary candidate by
proving the existing executable owner layer instead of adding an overbroad Grit
keyword rule.

Swooper runtime source must not hide architecture-debt shims, shadow paths,
dual paths, legacy stage aliases, or foundation topology drift. The invariant
corpus records the four cutover checks as `keep-as-test`: Habitat should invoke
the package target, but the precise owner remains the package test suite because
the checks combine multiple structural scans.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts`
- `mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts`
- `mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts`
- `mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Record cutover/shim vocabulary enforcement as an already active Habitat
  wrapped-test rule: `arch-test-cutover`.
- Prove the package-owned Nx target and Habitat per-rule wrapper path for that
  rule.
- Record a deterministic zero-hit shim-term inventory over the same runtime
  source roots used by `no-shim-surfaces.test.ts`.
- Realign the corpus and aggregate proof records from pending manual/Grit
  candidate language to the current wrapped-test proof boundary.

## What Does Not Change

- No active Grit check is registered for cutover/shim terms.
- No Grit baseline or injected Grit probe is added.
- No source remediation is claimed.
- No natural-language documentation keyword rule is added.
- Current aggregate wrapped-test health is inherited from the accepted
  map-bundle/downstack freshness repair; this row does not own that repair.
- No generated-output freshness repair, apply safety, classify/generator
  behavior, or product/runtime proof is claimed.

## Owner Boundary

This workstream owns proof and record truth for the current Habitat enforcement
surface of the shim/cutover candidate. It does not own a new Grit pattern, the
separate Swooper generated map bundle freshness repair, generated-output repair,
or broad documentation vocabulary enforcement.

## Verification Gates

- `nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`
- `bun run habitat:check -- --json --rule arch-test-cutover`
- `bun run habitat:check -- --json --tool wrapped-test`
- deterministic no-shim source inventory over Swooper runtime roots
- deterministic wrapped-test baseline inventory
- `bun run openspec -- validate habitat-grit-shim-cutover-terms --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
