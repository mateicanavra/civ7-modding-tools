## Why

The resource stage cannot safely move from "some resources appear" to
per-resource operations until each official resource has an explicit earthlike
expectation envelope. The prior corpus slice proved the 55 official
base-standard `Resources` rows and kept runtime numeric ids unverified. This
slice defines the expectation layer that downstream resource ops must satisfy:
which conditions make each resource eligible, what range is expected on
standard earthlike maps, and what proof can later show the operation is
healthy.

## Target Authority Refs

- `openspec/changes/resource-distribution-planning`: per-resource coverage,
  expected values, and stats proof requirements.
- `openspec/changes/resource-stage-architecture`: resources target stage and
  resource-owned artifacts before behavior migration.
- `openspec/changes/resource-corpus-contract`: official 55-row corpus,
  `artifact:resources.corpus`, static row slots, and unverified runtime ids.
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml` and
  `resources-v2.xml`: official placement constraints, ages, weights, and
  distribution facts.

## What Changes

- Define resource expectation groups that cover all 55 official resources
  exactly once.
- Add a durable expectation artifact design for
  `artifact:resources.earthlikeExpectations` without moving placement behavior
  or verifying runtime numeric ids.
- Record the evidence policy for earthlike expected ranges, including when a
  range is source-backed, inference-backed, or blocked.
- Record per-resource obligations that later operation slices must implement:
  eligibility predicates, expected count/range envelopes, condition
  multipliers, scarcity class, caveats, and stats proof requirements.
- Preserve the five blocked/no-biome corpus caveats as blocked expectation
  rows until a source-backed map-placement disposition exists.

## Explicit Non-Goals

- No movement of `placement/plan-resources` or `place-resources`.
- No resource stage shell, recipe order change, or runtime behavior change.
- No runtime `GameInfo.Resources` numeric id verification.
- No symbolic joining of adapter numeric placement diagnostics to resource
  symbols.
- No generated-output, official submodule, lockfile, adapter constant, or SDK
  constant edits.
- No final tuning of placement counts; downstream operation slices own tuning
  and stats proof.

## Verification Gates

- `bun run openspec -- validate resource-earthlike-expectations --strict`
- `bun run openspec:validate`
- `git diff --check`

Focused code/tests gates will be added only if this slice introduces typed
expectation artifacts in source.
