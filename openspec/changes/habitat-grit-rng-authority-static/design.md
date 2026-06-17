# Design - RNG Authority Static Proof

## Frame

### Objective

Make RNG authority enforcement truthful in Habitat by proving the existing
wrapped-test owner layer and retiring the ambiguous pending Grit-candidate
status for this row.

### Product Movement

Authored map generation must be deterministic and seed-stable. Future agents
should see that engine RNG and official generator calls in Swooper standard
recipe/domain authored generation are already enforced by a Habitat rule, and
that this invariant is intentionally test-owned rather than Grit-owned.

### Selection

- Candidate id: `habitat-grit-rng-authority-static`
- Active Habitat rule: `arch-test-rng-authority`
- Owner layer: `wrapped-test`
- Package target:
  `mod-swooper-maps:test:architecture-rng-authority`
- Test owner:
  `mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts`

### Hard Core

1. The invariant corpus classifies RNG authority as `keep-as-test`; Habitat
   invokes it but does not own it as Grit.
2. `rules.json` already registers `arch-test-rng-authority` as an enforced
   wrapped-test rule.
3. The package-owned Nx target depends on upstream builds and runs the
   boundary test through the Swooper Maps package.
4. The boundary test scans standard recipe and domain `.ts` files for engine
   RNG, ambient `Math.random`, official generator calls, and internal RNG
   imports, and fails on any finding.
5. The separate standard runtime RNG authority test proves authored generation
   does not consume adapter RNG at runtime; that runtime proof remains a test
   concern, not a Grit proof.
6. Aggregate `wrapped-test` closure is still blocked by the independent
   Swooper generated map bundle freshness issue, not by RNG authority.

### Exterior

- New Grit pattern registration for RNG authority.
- Grit baselines or injected Grit probes.
- Source remediation for RNG/official-generator call sites.
- Swooper generated map bundle freshness repair.
- Live Civ7 runtime proof or product acceptance.
- Classify/generator behavior.

### Falsifier

This checkpoint fails if Habitat cannot select `arch-test-rng-authority`, if
the target does not run through the Swooper package-owned Nx target, if the
RNG boundary test fails, or if records imply active Grit closure or aggregate
wrapped-test closure from this row.

## Source Synthesis

`docs/projects/habitat-harness/invariant-corpus.md` lists
`rng-authority-boundary` under architecture tests with disposition
`keep-as-test (runtime semantics)`. `docs/projects/habitat-harness/taxonomy.md`
places `scope:rng-authority` in the intra-project family but names
`rng-authority-boundary.test.ts` as the provenance and says it stays a test.

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-rng-authority` with `ownerTool: "wrapped-test"` and detect command
`nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`.
`mods/mod-swooper-maps/package.json` exposes that target and script, with the
target depending on upstream workspace builds.

`mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts` scans
`src/domain` and `src/recipes/standard` `.ts` files. It reports line-level
findings for direct adapter RNG calls, `TerrainBuilder.getRandomNumber`,
ambient `Math.random`, official lake/biome/feature/snow/resource/discovery/start
generator calls, and authored-generation imports from
`@swooper/mapgen-core/lib/rng`. `standard-rng-authority.test.ts` separately
proves the standard recipe runtime does not consume adapter RNG while running
authored generation.

## Fixture And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Engine RNG, ambient random, official generator, or internal RNG import in standard recipe/domain authored generation | `arch-test-rng-authority` fails through the package-owned Nx target |
| Current standard recipe/domain authored generation has no forbidden source hits | `arch-test-rng-authority` passes |
| Standard runtime attempts to consume adapter RNG during authored generation | package test fails under `standard-rng-authority.test.ts`; not claimed by this row's Habitat rule proof |
| RNG authority candidate is considered for Grit registration | rejected for this row because the canonical corpus says the invariant stays test-owned |
| Aggregate wrapped-test run includes RNG authority | RNG rule passes; aggregate still may fail on unrelated generated map bundle freshness |

## Proof Contract

This row checkpoint may record:

- `RNG-NX-TARGET-2026-06-15`: package-owned Nx target proof for
  `mod-swooper-maps:test:architecture-rng-authority`.
- `RNG-HABITAT-WRAPPED-TEST-2026-06-15`: Habitat per-rule selector/wrapper
  proof for `arch-test-rng-authority`.
- `RNG-WRAPPED-TEST-AGGREGATE-2026-06-15`: aggregate wrapped-test evidence
  showing RNG authority passes while a separate generated-map freshness
  blocker remains current-red.
- `RNG-BASELINE-FILES-2026-06-15`: explicit empty Habitat baseline for
  `arch-test-rng-authority`.

This row checkpoint must not record:

- active Grit rule closure;
- native Grit fixture proof;
- Grit baseline or injected Grit probe proof;
- source remediation;
- Swooper map bundle freshness repair;
- classify/generator behavior;
- apply/codemod safety;
- retired full-profile parity closure;
- product/runtime proof.
