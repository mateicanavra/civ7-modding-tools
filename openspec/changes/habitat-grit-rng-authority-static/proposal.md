## Why

`habitat-grit-rng-authority-static` resolves the RNG-authority candidate by
proving the existing executable owner layer instead of forcing duplicate Grit
syntax over a runtime-semantics invariant.

Standard recipe and domain authored generation must stay off engine RNG and
official generator calls so generation remains deterministic and seed-stable.
The invariant corpus classifies this guard as `keep-as-test`: Habitat may
invoke the test, but the test remains the owner because it combines static
source scanning with runtime RNG-consumption semantics.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts`
- `mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Record RNG authority as an already active Habitat wrapped-test rule:
  `arch-test-rng-authority`.
- Prove the package-owned Nx target and Habitat per-rule wrapper path for that
  rule.
- Record why no active Grit rule, Grit baseline, or injected Grit probe is
  added for this candidate.
- Realign the corpus and aggregate proof records from pending candidate
  language to the current wrapped-test proof boundary.

## What Does Not Change

- No source generation code is remediated.
- No active Grit check is registered for RNG authority.
- No Grit baseline or injected Grit probe is added.
- No aggregate wrapped-test closure is claimed while the separate Swooper map
  bundle freshness blocker remains current-red.
- No apply safety, classify/generator behavior, retired full-profile parity,
  or product/runtime proof is claimed.

## Owner Boundary

This workstream owns proof and record truth for the RNG authority candidate's
current Habitat enforcement surface. It does not own the Swooper map bundle
freshness blocker, live Civ7 runtime proof, generated-output repair, or a new
Grit pattern for runtime-semantics behavior.

## Verification Gates

- `nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`
- `bun run habitat:check -- --json --rule arch-test-rng-authority`
- `bun run habitat:check -- --json --tool wrapped-test`
- `bun run openspec -- validate habitat-grit-rng-authority-static --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`
