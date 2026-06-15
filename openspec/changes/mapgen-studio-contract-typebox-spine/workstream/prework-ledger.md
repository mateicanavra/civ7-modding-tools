# D2.5 Prework Ledger - Contract TypeBox Spine

Status: packet prework recorded
Date: 2026-06-14

## Systematic Gate Mapping

| Gate | D2.5 packet evidence | Implementation carry-forward |
| --- | --- | --- |
| 1 - frame | `packet-phase-record.md`, `proposal.md`, and `design.md` define the TypeBox spine objective, exterior, stop conditions, review lanes, and closure boundary. | Keep D2.5 scoped to public contract schema ownership; do not expand it into D3 error-service implementation or D4 runtime-service implementation. |
| 2 - repo state | Packet branch and dependency/build baseline are recorded in `OPENSPEC-PACKET-TRAIN.md`; D2.5 files are isolated under one OpenSpec change. | Before implementation edits, confirm selected implementation base has the accepted Nx/Habitat migration baseline or explicitly stop and reroute. |
| 3 - diagnosis | `schema-spine-ledger.md` names the current mixed baseline: TypeBox contracts exist, but origin recovery, app-local DTO authority, duplicate operation schemas, stale comments, permissive error details, and open mutation input residue remain. | Re-run the residue searches before editing; changed results are new evidence, not permission to skip classification. |
| 4 - corpus/action surfaces | `schema-spine-ledger.md` enumerates Studio success contracts, error data, adapter, recipe DAG, control-oRPC precedent, Run in Game, Save/Deploy, current/events, live-game, raw inputs, and import ownership. | Treat this as the minimum implementation corpus; additions require row-level classification before code changes. |
| 5 - grouping | The packet groups surfaces by contract origin, app-local mirror authority, operation projection, error-data bridge, raw-input hazard, event/live payload, and effect-orpc ownership. | Keep grouped changes visible in tests by family; do not let a generic "contracts pass" claim hide per-family coverage. |
| 6 - expectations | `testing-ledger.md` predeclares TypeBox `Value.Check`/`Value.Parse`, adapter origin, parity, negative-search, and raw-control rejection expectations. | Use these expectations as test design inputs before implementation observes current behavior. |
| 7 - architecture translation | `design.md` and spec deltas assign TypeBox public schema ownership to `@civ7/studio-server`, app UI-only ownership to app modules, and `effect-orpc` import ownership to router/runtime implementation only. | Any new owner requires a packet repair or D3+ realignment record; do not add local DTO authority in app code or recipe-DAG builder islands. |
| 8 - slice plan | `tasks.md` separates packet acceptance tasks from future implementation closure gates. | Implement as one D2.5 code slice on one Graphite branch before D3 depends on sealed error data. |
| 9/10 - proof labels | `closure-checklist.md` separates OpenSpec validation/diff checks from future package, app, contract, scenario, and same-stack D3 implementation proof. | Do not label packet validation as behavior proof; implementation closure needs package checks and residue scans. |
| 11 - review | Schema, testing, adversarial residue, hardening/prework, and black-ice review lanes are required before acceptance. | Re-run targeted review if implementation changes scope, ownership, or proof strategy. |
| 12 - closure | Closure checklist requires accepted packet status, validation, review disposition, and clean Graphite commit. | Future implementation cannot close with unchecked D3 guard, stale comments, or broad raw/unknown residue. |

## Packet-Authoring Prework Completed

- Inventoried `packages/studio-server/src/contract/**`, `packages/studio-server/src/typeboxStandardSchema.ts`, recipe-DAG schemas, live-game schemas, app Run in Game / Save&Deploy status modules, app response casts, and control-oRPC TypeBox adapter precedent.
- Classified the current state as mixed rather than absent: TypeBox already owns much of the public contract surface, but the adapter cannot yet prove recoverable origin and app-local DTO mirrors still act as public wire authority.
- Identified stale schema-technology comments in package and app/server code so the implementation slice removes misleading direction, not only imports.
- Identified duplicate operation-current/event schemas and required canonical operation DTO reuse across endpoint status, current projection, and operation events.
- Identified permissive expected-error `details?: unknown` as D3-bound bridge residue unless narrowed in D2.5.
- Identified `runInGame.start` open public mutation input as a raw-control hazard requiring closed schema or recovered-schema adversarial rejection proof.
- Classified effect-orpc import ownership as deterministic: router/runtime implementation is the only allowed owner; current recipe-DAG contract/error-builder imports are implementation residue to move/delete or encapsulate behind router-owned builders.

## Implementation Prework Required Before Code Edits

1. Re-run the schema inventory and residue searches from `schema-spine-ledger.md` on the selected implementation base.
2. Record each residue hit as one of: forbidden public wire authority, allowed non-executable status/proof evidence, allowed private implementation detail, or stale comment.
3. Confirm the TypeBox adapter implementation plan against the control-oRPC adapter precedent without copying control-domain ownership into Studio.
4. List every operation DTO consumer that must move to package-derived types before deleting app-local public wire authority.
5. Decide, from current code evidence, whether D2.5 narrows expected-error `details` or carries a same-stack D3 deletion/narrowing guard; the decision and, if needed, the D3 packet guard update must be recorded before D2.5 implementation closure.
6. Decide, from parser behavior and product requirements, whether `runInGame.start` closes its top-level input or keeps an open input with explicit raw-control rejection tests; no untested open input is allowed.
7. Confirm package/app checks and negative searches before any closure claim.

## Peer-Agent Prework Lanes

These lanes are safe to assign to peer agents before implementation begins:

- **Schema residue scout:** rerun and classify all TypeBox/Zod/stale-comment/effect-orpc/direct-API/raw-field/cast searches.
- **Consumer mapper:** enumerate app and package DTO consumers for Run in Game, Save/Deploy, `studio.operations.current`, and operation events.
- **Adapter parity scout:** compare Studio adapter behavior against control-oRPC recovery helpers and define the smallest Studio-owned recovery API.
- **Testing oracle designer:** turn the testing ledger into exact package/app test files and command gates.
- **Black-ice reviewer:** review implementation plan for fallback language, ambiguous ownership, unbounded bridge residue, proof inflation, and pass/fail claims without oracles.

## Resolved Black-Ice Decisions

- TypeBox is the public schema origin for Studio; Zod is not a parallel public-contract path.
- App modules may retain UI helpers, but they do not own public wire DTOs for Run in Game or Save/Deploy.
- Operation-current and event operation payloads reuse canonical operation DTO schemas rather than defining looser siblings.
- `details?: unknown` is not a harmless permanent escape; it must be narrowed in D2.5 or guarded as a same-stack D3 deletion/narrowing target.
- `runInGame.start` open input is not accepted as a generic tunnel; it must close or prove raw-control rejection before engine execution.
- effect-orpc ownership is fixed to router/runtime implementation only; recipe-DAG contract/error-builder imports are not a durable exception.

## Remaining Human Decisions

None for packet acceptance. Future implementation choices that remain are bounded engineering decisions with required evidence and tests, not open product questions.
