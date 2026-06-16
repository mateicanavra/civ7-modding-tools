# Runtime Effect Recovery Prework Frame

## Frame Identity

Frame name: Runtime Effect Recovery Prework
Built by: Codex
For situation: MapGen Studio runtime Effect refactor has substantial D0-D12 implementation and proof records on current `main`, but a durable prework pass is required before activating any new change-by-change design or implementation objective.
Built when: 2026-06-16
Mode: frame-discovery with audience-export handoff
Object-path: objective

## Scope And Provenance

In scope:

- Durable framing and investigation artifacts for the next runtime-refactor workstream objective.
- Current repo, Graphite, worktree, OpenSpec, packet, proof, and residue evidence needed to start later work without replaying chat.
- Classification of stale session/doc state versus current `main` evidence.
- Packet-by-packet design readiness for a later objective that must proceed sequentially through design, review, implementation, verification, and closeout.

Out of scope:

- Implementing or redesigning runtime code.
- Editing generated outputs or changing public contracts.
- Claiming final runtime refactor closure, live product proof beyond recorded evidence, or Graphite stack drain.
- Substituting this prework frame for the accepted runtime refactor frame or OpenSpec packet authority.

Source pointers:

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/final-proof-ledger.md`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/next-packet.md`
- `openspec/changes/mapgen-studio-nx-dev-runner/workstream/next-packet.md`
- Session takeover source: `019ec848-a3af-73d1-b5a5-8c0d51174798`
- Repo state observed in worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-prework`

## WHAT

This frame treats the next work not as another runtime patch, but as a recovery prework boundary that selects current authority, current implementation evidence, stale transcript/doc drift, proof-class gaps, and packet-by-packet readiness as the unit of analysis. It foregrounds whether a future agent can safely activate a sequential packet-design objective without assuming green closure from packet acceptance, merged PRs, local tests, or old session state. It holds runtime implementation, final Graphite drain, and live verification execution exterior until the frame, investigation brief, packet corpus, problem classification, and review dispositions are durable and reviewed.

## WHY

The structurally different alternative was to resume implementation directly from the takeover session tail. That alternative is rejected because current `main` already contains runtime PRs through `#1748`, while retained records still preserve proof caveats, stale status text, and final stack-drain obligations. Direct coding would repeat the failure mode the user identified: work advancing before user-scenario expectations, proof labels, and packet state are honestly mapped. This prework frame enables a later objective to start from a reviewed map of what is current, what is historical, what is open, and what must be designed before implementation.

## Construction History

Structural alternative considered:

Resume implementation from the takeover session tail and treat D1/D12 as the immediate work surface.

Why rejected or demoted:

The session tail is stale relative to `main` at `654f58d8f`, and current D12 records say live proof was later executed while final Graphite drain remains open. The correct unit is not "continue where the old thread stopped"; it is "reconstruct current truth and activate the next objective only after prework review."

Perspective / discovery passes used:

- Takeover transcript summary for historical intent and failure modes.
- Current `main`, OpenSpec records, and sidecar reviews for present evidence.
- Repo/worktree/Graphite census for operational constraints.

## Selection Commitments

In (selected):

- D0-D12 plus D2.5 packet authority and implementation/proof records.
- Current merged runtime PR evidence on `main`.
- Current Graphite/worktree hygiene and dirty-state risks.
- User-identified failure categories: untested flows, assumptions, shortcuts, proof overclaims, lazy code, stale docs, and live-verification gaps.
- The exact next objective to activate only after prework review.

Foreground (made salient):

- Proof-class separation: OpenSpec, tests, build, runtime logs, live proof, product proof, Graphite submit, and Graphite drain are distinct.
- Current versus historical authority: merged `main` can supersede the transcript tail only when verified from files.
- Packet sequence discipline: design and review the full change set before implementation resumes.
- User-scenario verification: future implementation must prove behavior through realistic Play, Save/Deploy, operation-current, event, live-game, and dev-runner flows when the claim requires it.

Exterior (deliberately off-frame):

- Code changes to runtime packages, Studio app, direct-control, control-oRPC, or Swooper map sources.
- New OpenSpec implementation packet design beyond identifying what the next objective must design.
- Final merge/drain execution for the existing runtime stack.
- Broad product redesign of MapGen Studio outside runtime reliability and proof discipline.
- Retconning accepted historical packet records to look cleaner than they were.

## Hard Core And Protective Belt

Hard core:

1. Prework must separate current evidence from stale transcript/session/doc state before any new objective is activated.
2. Packet acceptance, implementation evidence, live proof, and Graphite drain must remain distinct claims.
3. The future objective must require sequential change-by-change design and review before implementation.
4. User-scenario/live-verification gaps must be foregrounded instead of hidden behind green local tests.
5. The repo must not be left dirty by this prework slice.

Protective belt:

- Exact filenames and ledgers may evolve if review finds a clearer artifact split.
- Some sidecar review findings may be P3 residual risk rather than blockers.
- Root graph validation may expose unrelated debt; this prework may record it rather than repair it if outside scope.
- Current `main` may already resolve old session concerns; such findings should be marked resolved, not re-opened.

## Reframe Conditions

What would force a reframe:

If current repo evidence shows that the runtime refactor is fully merged, drained, proof-clean, and docs-current with no remaining packet/proof ambiguity, then the correct frame is not recovery prework but final archival/closure audit.

Degeneration trigger:

If two or more review findings show this prework is being used to smuggle implementation decisions, skip packet design review, or collapse proof classes, stop and run a framing re-diagnostic before activating the next objective.

## Composition And Assumptions

Perspectives composed:

- User objective perspective: force serious prework before design and development.
- Workstream-owner perspective: preserve continuity across agents, compaction, and Graphite state.
- Reviewer perspective: make proof overclaims and stale records visible.
- Implementer perspective: produce an objective that can later be executed without guessing.

Assumptions committed:

- `main` at `654f58d8f` is the current merged baseline for this prework.
- The primary checkout dirty `nx.json` is pre-existing external state and not part of this slice.
- Project-level docs are the correct location because this is pre-OpenSpec planning/control work.
- The later implementation objective may create or repair OpenSpec changes, but this phase does not.

## Lifecycle

Prior frame: Continue the takeover implementation thread through D0-D12.

What changed:

- The unit shifted from implementation continuation to prework recovery and objective construction.
- Current merged `main` became the evidence base rather than the session tail.
- Final Graphite drain and proof-class boundaries became foregrounded blockers for closure claims.

Named reframing move: double-loop change

Reframe trigger: User clarified that the current plan is explicitly prework before design, development, live verification, and closeout, and that the output must include a finalized framing document plus a framed objective for later activation.

Diagnostic pointer: this file plus `INVESTIGATION-BRIEF.md`.

## NOT HOW

This frame deliberately does not specify how to implement runtime code, how to redesign each packet, or how to run live Civ7 proof. Those belong to the later objective and packet-specific workstream artifacts.
