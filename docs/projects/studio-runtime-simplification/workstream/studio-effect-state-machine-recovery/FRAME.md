# Studio Effect State-Machine Recovery Frame

Date: 2026-06-16

## Frame Summary

This frame governs the Studio Effect state-machine recovery workstream. It replaces the narrower `setupConfig`/single-boundary framing with a second-order frame: the failure mode is not only one bad RPC error path, but an under-proven Studio runtime state machine whose server RPCs, Effect/oRPC boundaries, browser state, stateful operations, dev startup, and live Civ7 proof have not been verified as separate user-visible surfaces.

The frame is normative for the next objective. It does not authorize runtime behavior changes during this prework phase.

## Prior-Frame Diagnostic

The prior frame treated the reported failure as a focused Effect promise-boundary issue. That produced useful local work, but it allowed proof to collapse into narrow checks: a few server tests, one live RPC probe, and quiet expected-error logging. The user reproduced the original bug class through a basic flow, which falsified the closure claim.

The deeper diagnostic is proof-boundary collapse. Build, tests, generated output, deployed files, tuner exercise, bounded logs, browser behavior, and in-game observation were allowed to imply each other. They cannot. Each label must be earned independently.

## Future State

Studio's runtime state machine is recoverable and demonstrably user-coherent:

- Expected unavailable-runtime states are typed, declared, and projected without server stack spam.
- Unexpected defects remain visible as defects and are not silently normalized into user-input failures.
- Stateful operations expose clear lifecycle states from admission through terminal status, including retries, daemon restart identity, event replay, and stale-operation adoption.
- Browser UI surfaces preserve or intentionally simplify defined errors consistently, with diagnostics and recovery affordances where users need them.
- Dev startup can run on isolated ports and is classified separately from runtime/Civ7 availability.
- Live Civ7 proof is not claimed unless direct tuner action, bounded logs, and in-game observation have actually occurred.

## In, Foreground, Exterior

In scope:

- Studio server read RPCs, live RPCs, and operation RPCs.
- Effect promise boundaries, effect-oRPC router leaves, server handler logging, direct-control exception conversion, and operation failure projection.
- Browser clients and UI surfaces that consume Studio runtime errors or state transitions.
- Dev server startup, daemon identity, event stream behavior, and port isolation.
- Operational proof design for build, generated output, deploy, direct tuner exercise, bounded Civ7 logs, and in-game observation.
- Documentation/control artifacts that define the scenario corpus, error-boundary corpus, review dispositions, and next objective.

Foreground:

- User-visible state-machine behavior across ordinary flows: setup loading, Run in Game, save/deploy, autoplay, live status, server restart, diagnostics, retry, and event-stream recovery.
- Exact separation of proof labels so later implementation cannot close by implication.
- Current code and current runtime behavior as evidence over stale session or design text.
- The current Graphite/worktree topology because it affects handoff safety.

Exterior:

- Broad MapGen algorithm correctness, map balance, or Civ7 design quality.
- Habitat build-system authority changes not directly required to run or verify Studio runtime surfaces.
- Manual edits to generated outputs or resource submodules.
- Public API, TypeScript contract, OpenSpec implementation spec, runtime behavior, or generated artifact changes during this prework phase.
- Graphite submission, broad restack, stack drain, or product closure claims.

## Hard Core

The next workstream must preserve these commitments:

- Cause preservation: rejected promises and direct-control failures must keep enough cause information to classify the user-facing runtime state without erasing defects.
- Typed projection: declared oRPC errors, browser state, operation DTOs, and event payloads must agree on which failures are expected runtime states and which are defects.
- State-machine completeness: every scenario in the corpus must have expected admission, progress, terminal, retry/restart, and recovery behavior.
- Proof separation: source tests, build, generated output, deployed files, tuner exercise, bounded logs, in-game observation, Graphite submission, and product proof are separate labels.
- Source authority: current code/tests/runtime evidence outrank stale docs or transcripts; stale docs become drift findings, not closure evidence.

## Protective Belt

The implementation may change local mechanics later if the hard core remains intact. Candidate protected assumptions include:

- effect-oRPC should own router-boundary conversion where a router leaf exposes declared runtime errors.
- Direct-control remains the runtime Civ7 transport; caller-local alternatives are exterior.
- Browser clients may choose simplified UI copy, but loss of actionable defined-error code/data must be intentional and tested.
- Dev startup may require isolated ports and Nx daemon/process hygiene; port conflict is an operational state, not proof that runtime code is broken.
- FireTuner/Civ7 unavailability blocks live proof labels but does not block source tests or prework completion.

## Falsifier

This frame is wrong or too broad if investigation shows, with current-code evidence, that the reproduced failures are isolated to one local handler and there are no cross-surface gaps in operation lifecycle, browser projection, dev startup, or proof labeling.

This prework cannot activate the next objective if accepted P1/P2 findings remain unresolved, unrepaired in the artifacts, unrejected with evidence, or not explicitly moved outside the closure claim with a re-entry trigger.

## Degeneration Trigger

Stop and reframe if two or more findings show the workstream is again substituting one proof label for another, treating stale docs as current truth, or collapsing distinct user scenarios into a single "server error handling" bucket.

## Structural Alternative

The structural alternative is not "patch another endpoint." It is a scenario-led packet train:

- First, enumerate the full scenario and error-boundary corpus.
- Then design all packets and review their write sets, proof labels, and stop conditions before implementation.
- Only after packet review, implement sequentially with explicit verification per label.

## Non-Goals

- Do not implement Studio runtime fixes in this prework phase.
- Do not change public contracts, TypeScript shapes, OpenSpec implementation records, generated outputs, or build graph structure.
- Do not claim Civ7/product proof without live tuner/log/in-game evidence.
- Do not run broad Graphite restacks, submit stacks, or alter unrelated worktrees.
- Do not treat the pre-existing untracked `docs/projects/mapgen-workstream-skill/` directory as part of this slice.

