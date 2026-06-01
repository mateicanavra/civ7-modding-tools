# Graphite Stack Integration Reference Frame

**Status:** Active reference
**Built:** 2026-06-01
**Scope:** Civ7 MapGen/direct-control local Graphite integration workstream
**Current doc branch:** `codex/integration-stack-reference-frame`
**Parent branch:** `codex/studio-sdk-authoring-surface-guards`

This reference captures the frame and handoff objective for integrating the
current local Graphite work into one forward-building stack. It is a frame for
the next workstream, not a record of completed integration.

Current execution evidence is recorded in
[`workstream-record.md`](workstream-record.md). Treat that file as the current
Gate 1-8 operating record before source integration begins.

## Source Pointers

- Read-only audit of local worktrees, `gt log`, `gt branch info`, `git status`,
  and targeted `git merge-tree` checks on 2026-06-01.
- Agent topology audit covering active worktrees and Graphite parentage.
- Agent MapGen audit covering config surface, morphology realism, Earthlike
  tuning, and resource distribution branch intent.
- Agent non-MapGen audit covering Studio Run in Game robustness, resource
  closure state, systematic skill branches, foundation packet, and authoring
  guards.
- Project architecture authority: public recipe config is semantic and flat;
  generated artifacts are outputs; raw step/op envelopes are internal.
- Domain, stage, and behavior workstreams own their intended semantic changes
  inside their boundaries. The integration job is to synthesize those
  intentions and express the result through the clean public surface.

## Frame

This frame treats the integration problem as semantic preservation across
divergent Graphite branches, not as ordinary conflict resolution. The primary
signal is whether the integration recovers the intentional delta of each
workstream: behavior that was meant to change, domain/stage boundaries that
were meant to move, config properties that were intentionally added or removed,
and stale carryover that should be discarded as noise.

The objective is not to make Git accept all branches. The objective is to make
the resulting stack tell one forward story: synthesize the accepted intentions
from the workstreams, express those intentions through the current public
authoring surface, update that surface where accepted domain/stage behavior
requires it, and keep dirty/incomplete Studio robustness work out of the
critical integration path until it is stable.

## Selection Commitments

### In

- Local branches and worktrees participating in MapGen, resource distribution,
  config surface, direct-control, Studio, and process-skill work.
- Branch intent as inferred from commits, OpenSpec records, project docs, and
  available session/thread context.
- Textual and semantic conflict risk between those branches.
- A proposed Graphite stack shape that builds forward only.

### Foreground

- Intent synthesis across domain, stage, behavior, and config workstreams.
- Public authoring surface as the clean expression boundary for accepted intent.
- Preservation of intended behavior from morphology realism, Earthlike tuning,
  resource runtime proof, and Studio/direct-control work.
- Dirty worktree state and branch readiness before any restack.
- Generated artifact handling: regenerate from source inputs, do not resolve by
  hand.

### Exterior

- Submitting PRs, merging branches, or changing remote state.
- Solving unrelated type-check failures that predate the integration work.
- Replacing the existing Graphite workflow with ad-hoc merge branches.
- Treating old public config shapes as authoritative merely because they merge
  cleanly.
- Treating the current public config schema as immutable when a later
  domain/stage workstream intentionally changed the behavior that should be
  exposed.
- Carrying forward properties that an incoming branch only retained
  accidentally after another branch intentionally removed them.

## Hard Core

1. Authority follows intentional ownership, not branch precedence. Domain,
   stage, and behavior workstreams are authoritative for their intended
   semantic changes when the commit train, docs, tests, and proof records show
   that intent.
2. The standard recipe public config surface is the clean expression boundary
   for accepted intent, not a veto over valid domain/stage changes. It must be
   changed when accepted behavior requires new or revised public shape, and it
   must reject stale carryover, accidental leftovers, and intentionally removed
   properties.
3. Realism repairs are behavior, not just knob changes. Morphology rough-land
   ownership and ecology habitat fixes should be preserved when replayed.
4. Resource distribution work is broader than placement tuning. Its corpus,
   group-planning contracts, materialization behavior, and runtime proof are
   valuable, but the resource boundary must be realigned to the current public
   config/stage architecture.
5. Generated map artifacts are downstream outputs. Any config integration must
   regenerate generated files after source decisions are made.
6. Dirty or incomplete worktrees are not safe restack inputs. They must be
   committed, parked, or intentionally excluded before Graphite topology is
   reshaped.

## Protective Belt

- Exact branch names may change during cleanup.
- `studio-run-in-game-robustness` can either remain separate or sit at the top
  of the combined stack after it is finished.
- `foundation-architecture-packet` can remain separate as planning context or
  be inserted as a small docs-only layer.
- The systematic skill branches can be extracted as a separate docs/process
  stack if reviewer ergonomics outweigh the desire for one literal stack.
- Resource stage placement may land as a dedicated `resources` stage or as a
  transitional placement-owned materialization layer, but it must not expose
  raw internal step/op config as public authoring surface.

## Observed Worktree State

At audit time the active local worktrees were:

- Repo root: `codex/studio-run-in-game-robustness`, dirty/incomplete.
- Resource worktree: `codex/resource-runtime-proof`, dirty only in
  `NOTE-TO-DRA.md`.
- Systematic skill review: `codex/systematic-skill-review-fixes`, clean.
- Systematic skill framing: `codex/systematic-evidence-workstream-skill`,
  clean.
- Foundation packet: `codex/foundation-architecture-packet`, clean.
- Authoring surface guards: `codex/studio-sdk-authoring-surface-guards`, clean.
- Morphology repairs: `codex/morphology-peer-review-repairs`, clean.

After the audit, the repo root branch was observed as
`codex/studio-operation-state-completion`. Treat root worktree state as
externally active and re-check it before execution.

## Conflict Model

### Known Textual Conflict

`codex/morphology-peer-review-repairs` conflicts with the authoring surface
guard stack in:

- `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
- `mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`

This should be resolved by preserving the morphology/ecology behavior and
translating intentional old-shape config deltas into the clean semantic public
config surface. If the morphology/ecology work intentionally changed what
should be configurable, update the public surface to accommodate that intent.
Then regenerate the generated map artifact.

### Known Semantic Conflict

`codex/resource-runtime-proof` does not necessarily produce large textual
conflicts against the authoring surface branches, but it is semantically risky.
The branch carries valid resource behavior and runtime proof, while parts of
the implementation still reflect a transitional placement/config boundary.
Integration must distinguish intended resource/domain changes from stale
carryover. The public surface may need to change to express accepted resource
intent, but stale raw placement envelopes, accidental leftovers, and public
`candidateResourceTypes` style controls should not re-enter merely because
they are present in an older incoming branch.

### Low Direct Conflict

`codex/studio-run-in-game-robustness` is mostly orthogonal by file path to the
MapGen config/resource stack, but it is dirty and unfinished. It should not be
used as an integration base until its status is explicit.

## Current Integration Design

Build forward from synthesized intent, then express it through the clean public
authoring surface.

1. Anchor on the standard recipe authoring surface stack through
   `codex/placement-authoring-surface-alignment` as the current expression
   boundary and guardrail.
2. Add `codex/studio-sdk-authoring-surface-guards` immediately above it. This
   is the guard layer that prevents regressions to raw internal config.
3. Replay morphology live readback and peer-review repairs above the guards.
   Classify each delta as intended behavior/domain-stage change, intentional
   config cleanup, or stale carryover. Keep intended behavior changes; update
   the public surface if needed; discard stale leftovers; regenerate generated
   map artifacts.
4. Replay any missing Earthlike-only tuning as a narrow config regeneration
   layer, not as a broad schema rollback.
5. Replay resource distribution above the guarded public surface and morphology
   repairs. Classify resource deltas the same way, then realign resource
   contracts/stage boundaries and public config shape to accepted intent rather
   than reviving older placement internals.
6. Keep Studio Run in Game robustness separate or topmost until committed,
   verified, and no longer a dirty WIP.
7. Extract systematic skill branches as a separate docs/process stack unless a
   literal single stack is required.

## Structural Alternative Considered

An alternative frame was to build one chronological stack by preserving the
current branch chronology and resolving conflicts as they appear.

That was rejected because chronology would make older config shapes compete
with the public authoring surface. The resulting stack might merge, but it
would not protect the architectural decision that semantic public config is
authoritative.

A second rejected frame was "current public schema wins." That is too rigid:
it would incorrectly treat the public surface cleanup as a veto over later
domain/stage or behavior work that had legitimate authority to change what the
public surface should expose. The chosen frame is intent synthesis: keep
intentional changes from all workstreams, remove accidental carryover and
noise, and express the result in the cleanest architecture-aligned surface.

## Reframe Conditions

Reframe this integration design if one of these becomes true:

- A branch currently believed to be behavior-only actually owns an intentional
  domain/stage/config contract that the current public surface does not express.
- Resource distribution has already been migrated elsewhere to a dedicated
  `resources` stage, making the proposed replay boundary stale.
- Studio Run in Game robustness becomes required for runtime proof before
  MapGen/resource integration can be validated.
- Three or more generated artifact conflicts trace back to source schema
  disagreements rather than normal regeneration churn.

## Goal Objective Draft

Use this as the next `/goal` if you want the agent to execute the workstream:

```text
/goal Execute the Civ7 Graphite integration workstream using docs/projects/graphite-stack-integration/REFERENCE.md as the frame and the repo-local civ7-systematic-workstream method as the operating discipline. Re-check all current worktrees and Graphite parentage first, because root worktree activity may have changed since the audit. Treat this as a systematic evidence-grounded integration pass, not an ordinary merge: cite the current systematic gate in records, preserve proof classes separately, and do not close a slice with dirty files, stale tasks, stale phase records, stale next packets, or unreviewed P1/P2 findings.

Gate 1: frame the workstream before editing. Hard core: authority follows intentional ownership, not branch precedence; domain, stage, behavior, and config workstreams are authoritative for their intended semantic changes when the commit train, docs, tests, and proof records show that intent; the standard recipe public config surface is the clean expression boundary for accepted intent, not a veto over valid domain/stage behavior changes; morphology realism repairs are behavior, not mere tuning; resource distribution must preserve corpus/group-planning/materialization/runtime-proof behavior while realigning to the accepted public config and resource/stage boundary; generated map artifacts are downstream outputs to regenerate, not resolve by hand; dirty or incomplete worktrees are unsafe restack inputs. Exterior: do not reintroduce raw step/op envelopes, stale placement internals, public candidateResourceTypes-style controls, ad-hoc merge branches, unbounded proof claims, or properties that were intentionally removed by another workstream. Also do not freeze the current public schema if an incoming domain/stage workstream intentionally changed behavior that the public surface should now expose.

Gate 2: isolate repo state. Re-run git status --short --branch, git worktree list --porcelain, and the relevant gt log/branch info in every active worktree before mutation. Record dirty files, owners, protected external state, generated/read-only paths, downstack dependencies, and the current stop condition. Stabilize, commit, park, or explicitly exclude dirty WIP before restacking; do not restack over dirty worktrees.

Gates 3-7: diagnose before designing, then preserve behavior through architecture-aligned replay. Confirm the actual conflict model before changing files: distinguish textual conflicts, semantic conflicts, generated-artifact churn, and intention conflicts. For each incoming branch or branch train, read enough commit history, docs, OpenSpec records, tests, and diffs to classify deltas as intended behavior change, intended domain/stage boundary change, intended config cleanup/removal, required public surface accommodation, or accidental/stale carryover. Make codex/studio-sdk-authoring-surface-guards the guard layer above codex/placement-authoring-surface-alignment as the current cleanup/guardrail layer, not as an immutable schema ceiling. Replay morphology-live-readback-boundary and morphology-peer-review-repairs above it, preserving rough-land ownership and ecology habitat behavior; translate old Earthlike config deltas into the clean semantic public surface, and update that surface if the morphology/ecology work intentionally changed what should be exposed. Discard stale leftovers and regenerate generated map artifacts after source decisions. Before replaying resources, extract/refresh the relevant corpus and expectation view: resource IDs/groups, materialization targets, unassignable/proxy rows, expected legality/spread/diversity ranges, confidence, and blocked status. Then replay the resource distribution stack above the guarded public surface and morphology repairs, preserving resource corpus/group-planning/materialization/runtime-proof behavior while realigning it to the accepted public config and resource/stage boundary rather than reviving old placement config shapes. Promote a dedicated resources stage only if the architecture gate is satisfied: real artifacts, trace identity, consumers, and verification boundaries; otherwise keep transitional work inside the proper owning boundary.

Gate 8: slice implementation into small Graphite branches, one coherent integration concern per branch, with explicit write set, protected paths, OpenSpec/change records where behavior or contracts change, focused tests, review lanes, stop conditions, and downstream realignment notes. Prefer slices that each synthesize one intention boundary cleanly: guard/public-surface alignment, morphology/Earthlike behavior replay, resource boundary realignment, generated artifact regeneration, and proof/closure repair. Keep studio-run-in-game robustness separate or topmost only after it is committed and verified; extract/fold systematic skill branches separately unless a literal single stack is required.

Gates 9-10: verify statistics and runtime proof separately. Run focused config/schema guard tests after authoring and morphology replay, generated artifact checks after regeneration, resource placement/resource stats tests after resource replay, and OpenSpec strict validation for changed specs. If claiming in-game/resource runtime behavior, provide bounded runtime proof with branch, commit, deploy/control path, request id, response, log paths, timestamp/mtime bounds, parsed payload summary, and exact claim satisfied. Do not treat OpenSpec validation, tests, local stats, build, deploy, FireTuner/API response, Graphite submit, PR state, runtime logs, or product proof as interchangeable.

Gates 11-12: review and close deliberately. Use framed peer review for material phases; accepted P1/P2 findings block dependent closure until repaired, rejected with evidence, or explicitly moved outside the closure claim. End with clean worktrees, a clear final stack order, proof labels that do not overclaim, conflict resolutions explained semantically, regenerated artifacts tied to source changes, and a short handoff note naming deferred branches, unresolved proof, or validation that could not be completed. The final stack should synthesize the intentions of all included workstreams and remove extra noise/fluff; it should not be a mechanical union of properties from every side.
```

## Verification Expectations

- Re-run `git status --short --branch` in every active worktree before any
  mutation.
- Use Graphite parentage intentionally; avoid global restacks while unrelated
  worktrees are dirty.
- Keep generated artifact changes paired with the source config/stage change
  that produced them.
- Validate public config guard tests before integrating resources.
- Treat successful textual merge as insufficient if it violates the hard core.
