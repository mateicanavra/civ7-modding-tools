# Planning Prerequisite Repair Re-review 01

Status: closed with residual findings; second repair required

Closed: 2026-07-09T21:35:10-04:00

## Assignments

| Branch | Agent/session | State | Result |
| --- | --- | --- | --- |
| environment repair | Parfit (`019f49a2-0b20-7b21-81e0-8f3591cb679a`) | closed | one P2 fixture-isolation finding |
| Foundry authority | Sagan (`019f49a2-0c7c-73b2-8d8c-86d8d2825874`) | closed | four P1 ontology/routing findings and one P2 API multiplicity finding |
| token value form | Mendel (`019f49a2-0d63-7890-9576-a5b17bf2a0cf`) | closed | two P2 canary completeness/order findings and one P3 record-drift finding |

All lanes were read-only. Worktree patches remained unchanged.

## Residual Findings

| Finding | Severity | Disposition | Repair demand |
| --- | --- | --- | --- |
| `ENV-RR-01` temp Git inherits host selectors/policy | P2 | accepted | sanitize Git config/environment for fixture and helper subprocesses, including signing, hooks, templates, `GIT_DIR`, and `GIT_INDEX_FILE`; retain portable behavior assertions |
| `FOUNDRY-RR-01` four roots still inverted | P1 | accepted | roots are `packages`, `services`, `plugins`, `apps`; `resources` is separate runtime-authoring; profiles/provider selection are app-owned |
| `FOUNDRY-RR-02` runtime realization narrowed/misowned | P1 | accepted | apps select providers/profiles; runtime realization spans compilation through adapter/harness handoff, diagnostics, and finalization |
| `FOUNDRY-RR-03` source order remains nondeterministic | P1 | accepted | align active frame index, descent specialization, and older DRA authority-map delegation to one order |
| `FOUNDRY-RR-04` worker/host species prematurely admitted | P1 | accepted | retain RAWR workflows/schedules/consumers and harness-native host semantics; route worker/host as candidate kinds/design gaps unless separately admitted |
| `FOUNDRY-RR-05` API multiplicity/selection wrong | P2 | accepted | distinguish one API kind from multiple instances/projections; app, not host, selects projections |
| `TOKEN-RR-01` empty/malformed sample can pass | P2 | accepted | validate navigation and complete nonempty sample shape, Storybook class, and every expected token before evaluating drift; add bad-case tests |
| `TOKEN-RR-02` cleanup-order test is synchronous | P2 | accepted | use deferred async cleanup and observable exit assignment; require cleanup completion before drift/exit |
| `TOKEN-RR-03` change record names removed regex | P3 | accepted | update proposal/design/tasks from `VALUE_SHAPES.color` regex to the accepted range-validating guard contract |

## Close Condition

Fresh implementation workers repair only these residuals. Fresh affected
reviewers then require zero open P1/P2. Passing local patches still do not close
the environment Desktop/CI gates or the token external upload/classifier gate.
