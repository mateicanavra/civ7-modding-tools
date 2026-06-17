## Why

`habitat-grit-m11-projection-band` records the executable owner for the M11
projection-band regression surface. The active Habitat rule already routes this
boundary through the Swooper Maps package architecture test; it is domain-logic
correctness proof, not a candidate for a duplicate Grit syntax rule.

The projection step must keep plate-boundary regime and signal projection from
collapsing to only the exact boundary line. Future agents need a durable
Habitat record that this invariant is enforced by the package-owned wrapped
test and that Grit proof classes remain intentionally unclaimed.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Record `arch-test-m11-projection-band` as the active wrapped-test owner for
  the projection-band boundary.
- Record deterministic test inventory, package-owned Nx target proof, Habitat
  per-rule wrapper proof, aggregate wrapped-test proof, baseline ownership, and
  downstream aggregate proof records for this row.
- Keep M11 projection-band enforcement separate from active Grit rule
  registration and from generated-output freshness ownership.

## What Does Not Change

- No active Grit check is registered for the M11 projection band.
- No native Grit fixture, Grit baseline, or injected Grit probe is added.
- No source remediation is needed; this row records the existing package-owned
  architecture test proof.
- No broader Foundation topology, tectonic model, generated-output freshness,
  apply safety, classify/generator behavior, hook/CI, or product/runtime proof
  is claimed.

## Owner Boundary

This workstream owns the Habitat wrapped-test proof record for the M11
projection-band package test. It does not own generated output, Grit rule
registration, model-wide tectonic correctness, or runtime product acceptance.

## Verification Gates

- `nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static --skip-nx-cache`
- `bun run habitat:check -- --json --rule arch-test-m11-projection-band`
- `bun run habitat:check -- --json --tool wrapped-test`
- deterministic M11 package-test inventory
- deterministic wrapped-test baseline inventory
- `bun run openspec -- validate habitat-grit-m11-projection-band --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
