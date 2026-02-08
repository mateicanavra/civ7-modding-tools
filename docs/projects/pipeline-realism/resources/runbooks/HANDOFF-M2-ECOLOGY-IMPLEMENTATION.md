# Handoff: M2 Ecology Architecture Alignment (Implementation Orchestrator)

This is the handoff context for a new orchestrator agent to execute **M2**: a behavior-preserving, maximal-modularity refactor of the Ecology domain.

## Why This Exists (Origin Story)

Ecology is currently **architecturally out of sync** with the repo’s target MapGen architecture (ops/modules vs steps/stages vs rules; compiler-owned op binding/normalization; truth vs projection).

We want Ecology to be refactorable and evolvable safely. The intent is:
- **Do the maximal greenfield architecture alignment now** (compute substrate + atomic per-feature ops, strict boundaries, correct contracts).
- **Do not change behavior** while doing it, so future algorithm/tuning work can happen safely without structural risk.

This milestone is “mechanical but maximal”: a lot of reshaping, modularization, and contract wiring, with strong gates to prove parity.

## Non-Negotiables (Decisions, Not Questions)

These are locked directives. Use them to resolve ambiguity quickly.

- **Atomic per-feature ops:** one feature family = one op (no multi-feature mega-ops).
- **Compute substrate model:** shared compute ops produce reusable layers; plan ops consume them to emit discrete intents/placements.
- **Maximal modularity:** design the ideal modular architecture; recover performance later via substrate reuse/caching.
- **Steps orchestrate; ops do not orchestrate.**
- **Rules posture:** behavior policy lives in `rules/**` imported by ops; steps never import rules.
- **Shared libs posture:** generic helpers belong in shared core MapGen SDK libs; look there first.
- **No ADR anchoring:** prioritize canonical specs/policies/guidelines; ADRs older than ~10 days are not authoritative.
- **No Narsil reindex:** other agents use it; use `rg`, `git show`, and direct file reads when needed.
- **Behavior preservation is a gate:** stable ids, stable viz keys, stable determinism labels, stable artifact outputs.

## Canonical Sources Of Truth (Follow These; Ignore Scratch)

Execution plan and slices:
- Milestone index: `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- Issue docs (the real execution units): `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M2-*.md`

Paper trail / evidence (background; not the plan):
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`
  - This directory is evidence and decision history.
  - **Ignore** `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/**` for implementation guidance.

## What “Success” Looks Like

At end of M2:
- Ecology is decomposed into a shared **compute substrate** + **atomic per-feature plan ops**.
- `features-plan` no longer bypasses compiler-owned op binding/normalization (no direct op imports, no hand-rolled schema).
- Truth vs projection is preserved:
  - `ecology` stage remains truth-only.
  - `map-ecology` remains gameplay/materialization.
- Compatibility surfaces are preserved:
  - step/stage ids
  - artifact ids and their shapes
  - viz keys (`dataTypeKey`, `spaceId`, `kind`)
  - determinism labels/RNG posture
- Gates are green and enforceable (build/test + parity + import bans + viz inventory).

## Implementation Posture (How To Execute)

### 1) Start with gates + guardrails, not refactor work

Begin with the issues that make future work safe:
- `LOCAL-TBD-PR-M2-001` (parity baselines + viz-key inventory gate)
- `LOCAL-TBD-PR-M2-002` (compat ledger + enforcement tests)
- `LOCAL-TBD-PR-M2-003` (guardrails: ban step deep imports + ban steps importing rules)
- `LOCAL-TBD-PR-M2-004` (compiler-owned binding seam for `features-plan`)

If these gates are not in place, later modular splits will silently drift behavior.

### 2) Then introduce compute substrate, then atomic ops, then cutover

Follow the slice order in the milestone index:
- substrate scaffolding (`LOCAL-TBD-PR-M2-005..006`)
- atomic planners (`LOCAL-TBD-PR-M2-007..010`)
- `features-plan` cutover + gameplay boundaries + viz enforcement (`LOCAL-TBD-PR-M2-011..014`)
- cleanup + docs (`LOCAL-TBD-PR-M2-015..016`)

### 3) “No behavior change” discipline

When you touch anything that can drift behavior (ordering, RNG usage, normalization defaults):
- treat it as a parity hazard
- run the prescribed gates early and often
- preserve determinism labels (`deriveStepSeed` labels; `createLabelRng` label strings) as contracts

### 4) Git / Graphite / worktrees

- Use isolated worktrees for multi-agent work; do not contaminate the user’s primary checkout.
- Use Graphite stack discipline: small reviewable branches; avoid global restacks (`gt sync --no-restack`).

## Common Failure Modes To Watch

- Compiler prefill makes “optional” planners always-on unless explicitly modeled as disabled-by-default internal ops.
- Accidental RNG drift from reordered loops or changed label strings.
- Breaking Studio by renaming/removing `dataTypeKey`/`spaceId`/`kind` identities.
- Letting step code import rules or op implementations (bypasses architecture and normalization).

