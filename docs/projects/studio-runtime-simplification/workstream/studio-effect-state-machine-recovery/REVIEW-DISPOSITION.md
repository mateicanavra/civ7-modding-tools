# Review Disposition

Date: 2026-06-16

Accepted P1/P2 findings must be repaired in this package, rejected with evidence, or explicitly moved outside the prework closure claim before `create_goal`.

## Dispositions

| ID | Severity | Source | Finding | Disposition | Repair or evidence |
|---|---:|---|---|---|---|
| R-01 | P1 | Operational reviewer | Do not claim live proof without direct tuner/runtime action, fresh bounded logs, and exact-authorship/in-game evidence. | Accepted, repaired. | `FRAME.md`, `SCENARIO-CORPUS-LEDGER.md`, and `WORKSTREAM-RECORD.md` separate proof labels; SMR-08 closeout records earned bounded `Scripting.log`, direct tuner, exact-authorship, and in-game labels while keeping Graphite/product proof separate. |
| R-02 | P1 | Operational reviewer | Direct tuner unavailability should not block prework; it blocks later live proof labels only. | Accepted, repaired. | `INVESTIGATION-BRIEF.md` stop rules and `SCENARIO-CORPUS-LEDGER.md` mark tuner rows unresolved rather than inferred. |
| R-03 | P1 | Graphite/worktree reviewer | Current checkout has pre-existing untracked `docs/projects/mapgen-workstream-skill/`; do not contaminate this slice. | Accepted, repaired by exclusion. | `WORKSTREAM-RECORD.md` records the untracked directory as pre-existing and excluded; only this package may be staged. |
| R-04 | P1 | Graphite/worktree reviewer | Graphite metadata renders Studio stack under unrelated habitat state; avoid broad restack/sync/submit. | Accepted, repaired. | `WORKSTREAM-RECORD.md` records the render risk and forbids broad stack mutation from this lane. |
| R-05 | P2 | Frame/investigation reviewer | Do not reuse broad D0-D12 packet frame unchanged; hard core must target Studio state-machine/error-boundary behavior. | Accepted, repaired. | `FRAME.md` hard core targets cause preservation, typed projection, state-machine completeness, proof separation, and source authority. |
| R-06 | P2 | Frame/investigation reviewer | Classify doc/code conflict around `Civ7TunerSession.use`; current code preserves rejection causes. | Accepted, repaired. | `ERROR-BOUNDARY-LEDGER.md` and `PROBLEM-CLASSIFICATION.md` mark stale design text as drift. |
| R-07 | P2 | Frame/investigation reviewer | Search geometry must trace promise rejection through Effect, operation, oRPC, browser, and proof boundaries. | Accepted, repaired. | `INVESTIGATION-BRIEF.md` graph-tracing path enumerates those boundaries. |
| R-08 | P2 | Code-path reviewer | Run in Game background plain exceptions can collapse into `InvalidRequest` instead of phase-specific failures. | Accepted, moved to next objective. | `SCENARIO-CORPUS-LEDGER.md` OP-04 and `ERROR-BOUNDARY-LEDGER.md` EB-05 make this a required packet/test row. |
| R-09 | P2 | Code-path reviewer | Browser wrappers flatten some declared errors to message-only failures. | Accepted, moved to next objective. | `SCENARIO-CORPUS-LEDGER.md` UI-06 and `ERROR-BOUNDARY-LEDGER.md` EB-10/EB-11 require typed projection decision and tests. |
| R-10 | P2 | Code-path reviewer | Event-stream local error may not clear on reconnect/recovery. | Accepted, moved to next objective. | `SCENARIO-CORPUS-LEDGER.md` STUDIO-02 and `ERROR-BOUNDARY-LEDGER.md` EB-12 require stream recovery proof. |
| R-11 | P2 | Mechanical verifier | Docs must call out repo not closure-clean and Graphite parent area needs restack. | Accepted, repaired. | `WORKSTREAM-RECORD.md` records dirty state and Graphite render risk. |
| R-12 | P2 | Mechanical verifier | Generated-output surfaces are broader than generic `dist/`. | Accepted, repaired. | `ERROR-BOUNDARY-LEDGER.md` names generated/read-only surfaces. |
| R-13 | P2 | Self-review | Dev probe did not prove startup because another Nx process was active. | Accepted, repaired. | `WORKSTREAM-RECORD.md` and `SCENARIO-CORPUS-LEDGER.md` classify DEV-01 as unresolved. |
| R-14 | P3 | Code-path reviewer | Autoplay/explore busy gates may return silently. | Accepted, moved to next objective. | `SCENARIO-CORPUS-LEDGER.md` UI-05 includes busy-gate row. |
| R-15 | P3 | Mechanical verifier | Mention isolated dev port support and root/Nx dev entrypoint. | Accepted, repaired. | `WORKSTREAM-RECORD.md` records env vars, daemon defaults, CLI overrides, and Nx orchestration. |
| R-16 | P3 | Validation | `bun run lint` exposed formatter-only drift outside the new docs package. | Accepted, repaired. | Biome fixed `mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json`, `nx.json`, and `packages/studio-server/test/workflowSessionGraph.test.ts`; rerun passed. |

## Activation Gate

No accepted P1/P2 finding remains unresolved inside the prework artifacts. Runtime/code issues are not closed; they are explicitly carried into the next objective as packet-design inputs.
