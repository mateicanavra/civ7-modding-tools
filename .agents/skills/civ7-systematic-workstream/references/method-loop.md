# Method Loop

Use this reference when running a systematic workstream end to end. It expands
the same 12 gates as `SKILL.md`; use these gate numbers in phase records so the
next operator can see the current gate immediately.

## 1. Frame The Workstream

Create the frame before implementation:

- objective and future state;
- non-goals and exterior;
- hard core and falsifier;
- proof gates and closure boundaries;
- owner and review cadence;
- redesign trigger.

## 2. Isolate Repo State

Map the work surface before editing:

- worktree and branch;
- Graphite stack position and downstack dependencies;
- dirty files and owner;
- write set and protected paths;
- generated/read-only paths;
- current gate, next gate, and blockers.

If the primary worktree is dirty, isolate the work in a clean worktree and
record the dirty paths as protected external state.

## 3. Diagnose Before Designing

Do not start with tuning. Prove the observed failure mode from available
evidence:

- code and tests;
- git history and hotspots;
- official/local data;
- stats and generated artifacts;
- logs and runtime observations;
- Narsil MCP code intelligence where useful.

Outcome: a named cause, a competing hypothesis list, and the next evidence that
would falsify the current diagnosis.

## 4. Extract The Corpus

The corpus may be:

- official entities, such as resources, features, biomes, terrains, yields, or
  natural wonders;
- filtered entity families, such as trees, wetlands, or geological resources;
- action surfaces, such as brushing/stamping APIs;
- materialization targets, such as terrain, biome, feature, resource, or plot
  tag writes;
- effect matrices, such as terrain/biome/feature yield changes.

Every row needs source path, ID/value, authority class, implementation coverage,
uncertainty, and the current verification state.

## 5. Group Without Hiding Rows

Group by shared inputs, physical constraints, architecture owner, output
artifact, consumer, and verification shape. Good groups reduce review cost
without erasing per-entity obligations.

Examples:

- resources: aquatic, cultivated, terrestrial, geological;
- features: vegetation, wetlands, reefs, floodplains, wonders;
- biomes: climate bands and valid terrain constraints;
- brushing: mutation actions and readback surfaces.

## 6. Predeclare Expectations

Expected behavior must be written before implementation uses stats:

- physical, ecological, gameplay, surface-legality, readback, or effect-matrix
  baseline;
- expected range or categorical expectation;
- condition where the range applies;
- confidence and uncertainty;
- sources or inference rationale;
- blocked, unassignable, proxy, or not-applicable status.

False precision is a defect. Use ranges, categorical gates, or evidence-strength
labels where exact counts are not defensible.

## 7. Translate Into Architecture

For each entity/group/action surface, name:

- owning domain/stage/step/package;
- forbidden owners;
- consumed artifacts and published artifacts/effects;
- runtime or projection boundary;
- operation/strategy contract;
- tests and stats;
- runtime proof requirement, if any.

Promote a stage or step only when the domain has real artifacts, trace identity,
consumers, and verification boundaries. Otherwise keep it as an operation or
strategy inside the owning boundary.

## 8. Slice Implementation

Map each coherent unit to an OpenSpec change and Graphite branch when the work
is implementation-facing. A healthy slice has:

- one objective;
- explicit write set;
- protected paths;
- review lanes;
- tasks that are implementation steps, not open questions;
- focused tests and validation gates;
- downstream realignment;
- clean local closure.

## 9. Verify Local Statistics

Use stable seeds/configs and compare observed output against the predeclared
expectations. Depending on domain, record:

- coverage and missing rows;
- diversity and spread;
- legality and invalid combinations;
- rejection and mismatch reasons;
- before/after diffs;
- idempotence for brushing/stamping;
- parity between truth artifacts and projection/readback.

## 10. Prove Runtime When Required

Runtime proof is conditional. Use it when the claim depends on deployed mod
behavior, Civ7 engine legality, FireTuner, generated logs, or live readback.

Do not substitute local tests for runtime proof when the claim is in-game
behavior.

## 11. Review As A Phase Gate

Use fresh framed reviewers for material phases. Accepted P1/P2 findings block
dependent closure.

Record reviewer findings in a review-disposition ledger before claiming the
phase is ready to close.

## 12. Close Deliberately

Close only when the records agree:

- tasks complete;
- phase record matches actual branch/commit state;
- review ledger dispositions are current;
- downstream realignment is recorded;
- next packet is absent or accurate;
- local commit, Graphite submit, PR state, stats proof, runtime proof, and
  product proof are labeled separately;
- worktree is clean or explicitly handed off.
