---
name: civ7-systematic-workstream
description: |
  Use in the Civ7 Modding Tools repo when running a systematic, evidence-grounded domain workstream that must enumerate a canonical corpus, derive physical/ecological/gameplay/surface expectations, translate each entity/group/action surface into architecture-aligned slices, verify local statistics, prove runtime/log/readback behavior, coordinate reviewer agents, and close cleanly. Trigger phrases include "systematic workstream", "evidence-grounded pass", "canonical corpus", "expected ranges", "resource distribution", "feature placement", "biome pass", "brushing pass", "terrain/tile-type audit", "runtime proof", and "clean Graphite closure". Do not use for ordinary one-off debugging or a bounded OpenSpec phase that does not need corpus-wide systematic evidence.
---

# Civ7 Systematic Workstream

## Purpose

Use this skill for Civ7 work where correctness depends on complete coverage of
a domain, not a single fix. It captures the resource-distribution recovery
method generically: frame the work, enumerate the full corpus, predeclare
expected behavior, design architecture-aligned strategies, verify with stats,
prove runtime behavior when needed, review with agents, and close honestly.

This skill owns the systematic evidence loop. It composes with
`civ7-open-spec-workstream`, `civ7-architecture-authority`,
`civ7-product-authority`, and `civ7-operational-debugging`; it does not replace
them.

## When To Use

- Resources, features, biomes, brushing/stamping, ecology, terrain, tile types,
  vegetation, wetlands, natural wonders, yields, or similar corpus-wide passes.
- Work that needs official/local corpus extraction, earthlike or physical
  expectations, per-entity/group/action strategies, stats, runtime proof, and
  durable closure records.
- Work where "some visible examples look good" is not enough proof.

## Non-Goals

- Not a resource-only skill.
- Not generic project management or "be systematic" advice.
- Not a replacement for OpenSpec phase mechanics, architecture/product
  authority, operational debugging, Graphite workflow, or watcher work.
- Not for one-off bugs that do not require corpus-wide evidence.

## Companion Skill Routing

Load only when the current gate needs them:

- `framing-design`: objective, hard core, exterior, falsifier, and handoff frame.
- `team-design`: multi-agent evidence/review team structure.
- `civ7-open-spec-workstream`: phase records, OpenSpec changes, review ledgers,
  downstream realignment, and handoff packets.
- `civ7-architecture-authority`: owner, stage, step, artifact, adapter, and
  generated-output boundaries.
- `civ7-product-authority`: product behavior, official-data authority, public
  contract, and proof-claim boundaries.
- `civ7-operational-debugging`: build, deploy, logs, FireTuner, and runtime
  proof.
- `dra-structural-watcher`: watcher notes, closure drift, and stack/proof audits.

## Default Workflow

1. **Frame the workstream.** Name objective, non-goals, hard core, exterior,
   falsifier, proof gates, write set, protected paths, and closure boundaries.
2. **Isolate repo state.** Check worktree, branch, Graphite stack, dirty files,
   downstack dependencies, and generated/read-only paths before editing.
3. **Diagnose before designing.** Use code, history, stats, tests, logs, official
   data, and Narsil where useful to prove the observed failure mode.
4. **Extract the canonical corpus.** Enumerate entities, action surfaces, or
   materialization targets from official/local authority, with IDs, sources,
   coverage state, and uncertainty.
5. **Group the corpus.** Slice by shared inputs, constraints, artifacts,
   architecture owners, consumers, and verification shape. Keep per-entity
   obligations visible.
6. **Predeclare expected behavior.** Record physical, ecological, earthlike,
   gameplay, surface-legality, readback, or effect-matrix expectations and
   expected ranges before tuning or implementation.
7. **Translate into architecture.** Design operations, contracts, artifacts,
   score layers, planners, projections, or mutation surfaces in the owning
   boundary.
8. **Implement or plan slices.** Map each coherent slice to OpenSpec/Graphite
   work with explicit write sets, review lanes, tests, and stop conditions.
9. **Verify local statistics.** Compare observed stats against predeclared
   ranges over stable seeds/configs; prove coverage, diversity, legality,
   rejection/mismatch counts, and spread.
10. **Prove runtime behavior.** When runtime proof is required, deploy/restart
    through the current canonical path and inspect fresh bounded logs tied to
    exact branch, commit, command/API path, request id, timestamps, and payloads.
11. **Review as a phase gate.** Use framed peer agents to review specs, code,
    stats, runtime evidence, closure records, and downstream realignment.
12. **Close deliberately.** Complete tasks, disposition P1/P2 findings, record
    proof classes, update stale records, commit via Graphite, and leave the
    worktree clean or write a precise handoff.

## Reference Map

| Reference | Path | Open When |
| --- | --- | --- |
| Method loop | `references/method-loop.md` | Running the 12 gates end to end |
| Corpus and expectations | `references/corpus-and-expectations.md` | Extracting entities/actions and modeling expected ranges |
| Evidence and proof | `references/evidence-and-proof.md` | Separating local stats, generated output, runtime logs, PR state, and product proof |
| Team review lanes | `references/team-review-lanes.md` | Designing framed agent waves and review disposition |
| Failure patterns | `references/failure-patterns.md` | Work feels systematic but is drifting or overclaiming |

## Asset Map

| Asset | Path | Use When |
| --- | --- | --- |
| Workstream record | `assets/workstream-record.md` | Opening a systematic workstream |
| Corpus ledger | `assets/corpus-ledger.md` | Recording official/local corpus coverage |
| Expectation strategy ledger | `assets/expectation-strategy-ledger.md` | Pairing expected ranges with strategy and tests |
| Verification and runtime proof | `assets/verification-and-runtime-proof.md` | Recording stats and runtime/log evidence |
| Closure checklist | `assets/closure-checklist.md` | Closing or handing off a slice |

## Core Invariants

<invariants>
<invariant name="corpus-before-tuning">Do not tune before the canonical entity/action/materialization corpus and coverage gaps are visible.</invariant>
<invariant name="expectations-before-stats">Expected ranges and evidence strength are declared before observed stats are used to justify changes.</invariant>
<invariant name="architecture-before-implementation">Each strategy names its owner, artifact/effect surface, consumers, forbidden owners, and verification boundary before code.</invariant>
<invariant name="groups-do-not-hide-entities">Groups organize work; they do not erase per-entity obligations, blocked rows, proxy gaps, or unverified IDs.</invariant>
<invariant name="proof-classes-stay-separate">OpenSpec validation, tests, stats, deploy, logs, runtime observation, Graphite submit, PR state, and product proof are separate claims.</invariant>
<invariant name="runtime-proof-is-bounded">Runtime proof names exact branch, commit, command/API path, request id, log paths, timestamps, parsed payload, and manual boundaries.</invariant>
<invariant name="review-findings-block">Accepted P1/P2 findings block dependent closure until repaired, rejected with evidence, or explicitly moved outside the closure claim.</invariant>
<invariant name="clean-closure-is-required">A systematic slice does not close with unexplained dirty files, stale tasks, stale phase records, stale next packets, or stale watcher notes.</invariant>
</invariants>

## Failure Signals

- The plan says "resources/features/biomes" but no complete corpus ledger
  exists: stop and extract the corpus.
- Expected ranges are backfilled from current output: stop and separate
  baseline expectation from observed calibration.
- A group slice makes some entities disappear: add blocked/proxy/unverified
  rows and per-entity coverage.
- A phase claims runtime success from green tests or a deploy log: relabel the
  proof and run runtime evidence if the claim requires it.
- A committed slice still has unchecked commit tasks or "ready to commit" phase
  text: repair closure records before stacking more claims on top.

## Quick Start

1. Copy `assets/workstream-record.md` into `openspec/changes/<change-id>/workstream/`
   for an OpenSpec implementation slice, or into `docs/projects/<project>/...`
   for pre-OpenSpec planning. Defer to `civ7-open-spec-workstream` if unsure.
2. Frame the objective with `framing-design`, then check `git status`,
   `git worktree list`, and `gt log --no-interactive`.
3. Spawn only useful peer agents with framed prompts and explicit evidence
   outputs; keep the owner responsible for synthesis.
4. Fill the corpus and expectation ledgers before implementation.
5. Create OpenSpec/Graphite slices only after the diagnosis, corpus, and
   expectation gates are durable.
6. Record local stats and runtime proof separately.
7. Use `assets/closure-checklist.md` before claiming any closure boundary.
