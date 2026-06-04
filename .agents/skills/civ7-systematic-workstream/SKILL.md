---
name: civ7-systematic-workstream
description: |
  Use in the Civ7 Modding Tools repo when running a systematic, evidence-grounded domain workstream that must enumerate a canonical corpus, derive physical/ecological/gameplay/surface expectations, translate each entity/group/action surface into architecture-aligned slices, verify local statistics, prove runtime/log/readback behavior, coordinate reviewer agents, and close cleanly. Trigger phrases include "systematic workstream", "evidence-grounded pass", "canonical corpus", "expected ranges", "resource distribution pass", "feature placement audit", "biome pass", "brushing pass", "terrain/tile-type audit", "runtime proof", and "clean Graphite closure". Do not use for ordinary one-off debugging, generic project management, or a bounded OpenSpec phase that does not need corpus-wide systematic evidence.
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

## Vocabulary

- **Gate**: one of the 12 numbered method steps below. Cite gate numbers in
  phase records so the next operator sees the current step immediately.
- **Slice**: a bounded implementation unit mapped to one OpenSpec change and one
  Graphite branch.
- **Phase**: the OpenSpec-workstream loop term inherited from
  `civ7-open-spec-workstream` (a slice plus its review/closure records).
- **Proof class**: a kind of claim (OpenSpec validation, tests, local stats,
  deploy, runtime logs, Graphite submit, PR, product proof). A **proof label**
  is the exact string you write down asserting one proof class is satisfied.

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

Load only when the current gate needs them.

Repo-local companions (always available in this repo under `.agents/skills/`):

- `civ7-open-spec-workstream`: phase records, OpenSpec changes, review ledgers,
  downstream realignment, and handoff packets.
- `civ7-architecture-authority`: owner, stage, step, artifact, adapter, and
  generated-output boundaries.
- `civ7-product-authority`: product behavior, official-data authority, public
  contract, and proof-claim boundaries.
- `civ7-operational-debugging`: build, deploy, logs, FireTuner, and runtime
  proof.
- `dra-structural-watcher`: watcher notes, closure drift, and stack/proof audits.

External/global companions (live in the agent skill home, not in this repo; may
be absent in some runtimes — use the inline fallback if so):

- `framing-design`: objective, hard core, exterior, falsifier, and handoff
  frame. Fallback if absent: fill the **Frame** block in
  `assets/workstream-record.md` directly.
- `team-design`: multi-agent evidence/review team structure. Fallback if absent:
  use `references/team-review-lanes.md`.

## Default Workflow

The 12 gates, one line each. Open `references/method-loop.md` for the full
procedure, sub-steps, and per-domain examples of any gate. Cite the gate number
in the phase record so the next operator sees the current step immediately.

1. **Frame the workstream** — objective, non-goals, hard core, exterior, falsifier, proof gates, write set, closure boundaries.
2. **Isolate repo state** — worktree, branch, Graphite stack, dirty files, downstack deps, generated/read-only paths.
3. **Diagnose before designing** — prove the observed failure mode from code, history, stats, tests, logs, official data.
4. **Extract the canonical corpus** — every entity, action surface, or materialization target with IDs, sources, coverage, uncertainty.
5. **Group the corpus** — by shared inputs, constraints, owners, consumers, and verification shape; keep per-entity obligations visible.
6. **Predeclare expected behavior** — baselines and expected ranges/legality before tuning.
7. **Translate into architecture** — operations, contracts, artifacts, planners, projections, or mutation surfaces in the owning boundary.
8. **Implement or plan slices** — one coherent slice per OpenSpec change / Graphite branch, with write set, review lanes, tests, stop conditions.
9. **Verify local statistics** — observed vs predeclared over stable seeds/configs; coverage, diversity, legality, rejection/mismatch, spread.
10. **Prove runtime behavior** — when required, deploy/restart via the current canonical path; bound fresh logs to exact branch/commit/path/request/timestamp/payload.
11. **Review as a phase gate** — framed peer agents review specs, code, stats, runtime evidence, closure records, downstream realignment.
12. **Close deliberately** — complete tasks, disposition P1/P2, label proof classes separately, fix stale records, commit via Graphite, clean worktree or precise handoff.

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
2. Frame the objective with `framing-design` if available, otherwise fill the
   Frame block in `assets/workstream-record.md`; then check `git status`,
   `git worktree list`, and `gt log --no-interactive`.
3. Spawn only useful peer agents with framed prompts and explicit evidence
   outputs; keep the owner responsible for synthesis.
4. Fill the corpus and expectation ledgers before implementation.
5. Create OpenSpec/Graphite slices only after the diagnosis, corpus, and
   expectation gates are durable.
6. Record local stats and runtime proof separately.
7. Use `assets/closure-checklist.md` before claiming any closure boundary.
