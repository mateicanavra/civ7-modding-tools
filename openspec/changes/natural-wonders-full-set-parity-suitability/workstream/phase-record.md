# Phase Record

## Phase

- Project: Natural Wonders full-set, parity, and physical-suitability placement
- Phase: Design complete → pre-implementation review
- Owner: agent-A
- Branch/Graphite stack: new slice stacked on `agent-A-mapgen-oddr-consumer-migration`
- Started: 2026-06-18
- Status: implementation complete + live-closed (the 3 fixes, ledger §D); DRAFT, awaiting publish approval.

## Latest status (2026-06-19, docs/JSDoc/refactor phase)

The 3 §D fixes (diminishing-returns variety, materialize retry, 4-tile
self-orient) are implemented + live-proven. This phase added, on top:
- **Documentation**: `workstream/natural-wonders-system-reference.md` (normative +
  reference + tradeoffs) and JSDoc across the NW surfaces.
- **Live re-diagnosis of the 3 remaining wonders** (ledger §E, full machine
  access): the odd-Q/odd-R AND `Direction:-1` self-orient hypotheses for Valley
  of Flowers are DISPROVEN live (Zhangjiajie, same 2-tile class, places at forced
  dir 0). VoF/Hoerikwaggo are terrain-limited (often no legal tile); Thera fails
  self-oriented (volcano∧coast rarity). FOURADJACENT + FOURPARALLELAGRM
  self-orient re-confirmed; FOURL stays code-path-proven only. No code fix shipped
  for the 3 wonders (the leading hypothesis was falsified, not papered over).
- **Refactor**: wonder groups unified into one `WONDER_GROUPS` registry
  (behavior-preserving); op/stage/step split assessed as already-correct and left
  unchanged (system-reference §13).
- Corrected the earlier wrong "odd-Q predicate is the VoF bug" claim across docs,
  JSDoc, ledger §D, and memory (the op's adjacency was already odd-R).

Gates: build green; map-policy 19 / mod 583 (the 1 fail is the pre-existing
FOREIGN `no-fudging` place-discoveries finding) / adapter 19; openspec strict-valid.
The original DESIGN-phase content below is retained for the record.

## Objective

- Target movement: all 20 natural wonders placeable, parity-correct on both row
  parities, selected by physical suitability (deterministic per seed), with
  vanilla effects active by correct placement.
- Non-goals: new FeatureTypes / hand-authored effects; truth-stage or
  mapgen-core edits; vanilla count changes; MockAdapter-only closure.
- Done condition: all spec requirements met; repo gates green; OpenSpec strict
  validation passes; live closure proof recorded across ≥2 seeds.

## Authority

- Root/subtree `AGENTS.md`: repo process docs.
- Product refs: `.agents/skills/civ7-product-authority` (full 20-wonder set).
- Architecture refs: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
  (placement splits at product/effect contracts).
- Project refs: `output/nw-scope.md`, `output/nw-design-inputs.md`,
  `openspec/changes/mapgen-core-hex-oddr-consumer-migration/`.
- Excluded/stale inputs: the "~24 wonders" guess (refuted; the data tree has 20).

## Current State

- Repo/Graphite state: worktree `wt-agent-A-mapgen-oddr-consumer-migration`,
  branch `agent-A-mapgen-oddr-consumer-migration` (tip prior NW/oddr work);
  resources refreshed via CLI and verified in sync.
- Dirty files and owner: this OpenSpec change dir (agent-A); see `git status`.
- Current code evidence: catalog == 10 (`NATURAL_WONDER_CATALOG.length`);
  `CIV7_DIRECTION_OFFSETS` == odd-row table; planner has no RNG and one priority
  scalar.
- Generated outputs affected: none (no edits to `civ7-tables.gen.ts`).
- Tests/guards affected: `map-policy.test.ts`, `natural-wonder-catalog.test.ts`,
  `verify-manual-catalogs.ts` (currently certify the 10-entry truncation).

## Scope

- Write set: see design.md §1 table (map-policy footprints/catalog/types;
  adapter live+mock; mod plan inputs/planner/contract/materialize; diagnostics;
  the three named tests).
- Protected files: `civ7-tables.gen.ts`, mapgen-core hex primitives, ecology/
  morphology/hydrology truth artifacts, game-data resources, studio UI.
- Owners: agent-A (this slice).
- Forbidden owners: truth stages, mapgen-core, generated tables.
- Consumer impact: NATURAL_WONDER_CATALOG consumers see 20; planner inputs gain
  forwarded signals.
- Downstream assumptions: diagnostics iterate the full catalog; any NW telemetry
  reflects 20.

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`, `specs/mapgen-normalization-workstreams/spec.md`.
- Tasks: `tasks.md` (8 groups, probe-first).
- Validation status: not yet run (`bun run openspec -- validate … --strict` pending).

## Review

- Review lanes: owner/architecture, product authority, adversarial (design.md §9).
- Blocking findings: _pending pre-code review_.
- Accepted findings repaired: —
- Rejected/invalidated/waived/deferred findings: —

## Agent Fleet State

- Active agents: none at rest (scope + design-investigation workflows completed).
- Completed agents: nw-scope (5+synth), nw-design-investigation (4+synth).
- Assigned write sets: n/a (read-only investigations).
- Latest evidence by agent: `output/nw-scope.md`, `output/nw-design-inputs.md`.
- Open findings by agent: open questions resolved into decisions (design.md §10).
- Running/stale status: none.
- Integration owner: agent-A.

## Implementation

- Completed tasks: none (design phase).
- Remaining tasks: all of `tasks.md`.
- Stop conditions triggered: none.

## Verification

- Commands run: resource refresh (`data zip`/`unzip`) + hash verification.
- Results: resources in sync with installed build.
- Skipped gates and rationale: build/tests deferred to implementation.
- Evidence boundary: no source change yet; no live proof yet.

## Realignment

- Downstream docs/specs/issues updated: memory `civ7-natural-wonders-scope`.
- Tests/guards updated: planned in tasks 5.1–5.2.
- Deferrals/triage updated: none.
- Downstream realignment ledger: to be added at closure.

## Next Action

- Exact next step: run the pre-code adversarial review lane on this packet, then
  begin Task 1 (live probes) once review clears.
- First files to inspect: `natural-wonder-footprints.ts`,
  `plan-natural-wonders/strategies/default.ts`, `derive-placement-inputs/inputs.ts`.
- Stop condition: a P1/P2 review finding, or a probe result that contradicts the
  design's geometry/predicate assumptions.
