# Studio Effect State-Machine Recovery Investigation Brief

Date: 2026-06-16

## Purpose

Produce a verified prework package for the Studio Effect state-machine recovery workstream. The investigation must define the corpus, classify the problem space, record proof boundaries, and produce a next objective that drives sequential packet design before implementation.

## Primary Question

What complete set of Studio Effect/oRPC/runtime state-machine scenarios must be designed, implemented, and independently verified so a user can trust setup loading, live reads, operation lifecycle, browser recovery, dev startup, and live Civ7 proof?

## Secondary Questions

- Which server RPCs return declared runtime errors, embedded partial errors, operation DTO failures, or unexpected defects?
- Which Effect promise boundaries preserve causes, and which convert unknown failures into misleading user-facing categories?
- Which browser call sites preserve defined oRPC code/data, and which flatten errors to message-only UI failures?
- Which operation phases need explicit admission, progress, terminal, retry, restart, and stale-adoption proof?
- Which dev-startup failures are build graph, daemon, port, generated-output, ORPC handler, direct-control, or environment-state failures?
- Which docs or prior proof claims are stale relative to current code and runtime behavior?

## Exclusion Questions

- Does this require changing runtime code during prework? If yes, record it as a later packet, not a prework edit.
- Is the finding about MapGen algorithm quality rather than Studio runtime state behavior? If yes, exterior it.
- Is the evidence generated output without source/code/test traceability? If yes, treat it as operational evidence only.
- Is the evidence a stale transcript or design note contradicted by current code/tests? If yes, classify it as drift.

## Falsification Questions

- Can a basic user flow fail while all claimed proof labels remain green? If yes, the proof model is invalid.
- Can a declared runtime error still reach server `onError` as unexpected stack spam? If yes, router-boundary design is incomplete.
- Can an operation fail after admission and project as `InvalidRequest` or a generic message? If yes, lifecycle failure classification is incomplete.
- Can browser UI retain a stale local error after event-stream recovery? If yes, recovery state is incomplete.
- Can dev startup fail because another Nx process is active while docs claim Studio startup is proven? If yes, startup proof is overclaimed.

## Search Geometry

Use graph tracing plus hypothesis testing.

Graph-tracing path:

1. Promise rejection or direct-control failure.
2. `Effect.tryPromise` or Effect workflow fail path.
3. Runtime failure construction and operation registry projection.
4. effect-oRPC router leaf and declared error mapping.
5. Server handler logging and transport behavior.
6. Browser `safe`/`isDefinedError` wrappers.
7. UI state, event-stream adoption, retry/restart affordance.
8. Operational proof label: test, build, generated, deployed, tuner-exercised, logged, in-game observed.

Hypotheses to test:

- H1: The failure class is systemic proof-boundary collapse, not only `setupConfig`.
- H2: Server-side declared errors are more complete than browser-side typed projection.
- H3: Run in Game background failures are less phase-aware than save/deploy failures.
- H4: Event-stream recovery and daemon restart identity are under-tested user surfaces.
- H5: Dev startup can be blocked by Nx/process/port state independent of runtime error-boundary correctness.

## Evidence Policy

Authority order:

1. Current code, tests, commands, and runtime behavior.
2. Current project docs, root/domain `AGENTS.md`, OpenSpec records, and accepted architecture docs.
3. Git history and Graphite/worktree state.
4. Prior workstream docs and proof ledgers.
5. Session transcripts and model memory.

Evidence that does not count as closure:

- A build passing as proof that a browser flow works.
- Generated or deployed files as proof that Civ7 loaded them.
- Quiet logs as proof that UI state is coherent.
- Unavailable-tuner tests as proof of happy-path tuner behavior.
- Stale docs as proof over current code/tests.

## Stop And Reframe Rules

Stop before goal activation if:

- Any accepted P1/P2 review finding remains unresolved in the artifacts.
- Current code and accepted docs disagree on a contract that affects the next objective.
- The scenario corpus is missing a user-visible state path named in the plan.
- The next objective needs more than 4,000 characters to remain unambiguous.
- Prework requires runtime changes; those must become later packets.

FireTuner/Civ7 unavailability does not block prework completion. It marks live proof rows unresolved and blocks only later live proof closure.

## Artifact Contract

The prework package must contain:

- `FRAME.md`: standalone governing frame with no implementation HOW.
- `INVESTIGATION-BRIEF.md`: questions, search geometry, evidence policy, and stop rules.
- `WORKSTREAM-RECORD.md`: gates 1-8 for prework only.
- `SCENARIO-CORPUS-LEDGER.md`: user-visible and operational scenarios.
- `ERROR-BOUNDARY-LEDGER.md`: Effect, oRPC, operation, browser, and handler boundaries.
- `PROBLEM-CLASSIFICATION.md`: grouped problem spaces and packet implications.
- `REVIEW-DISPOSITION.md`: accepted/rejected/deferred review findings.
- `NEXT-OBJECTIVE.md`: exact objective text to activate after review.

