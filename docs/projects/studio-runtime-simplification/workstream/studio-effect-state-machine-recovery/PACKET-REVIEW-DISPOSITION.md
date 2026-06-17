# Packet Review Disposition

Date: 2026-06-16
Status: accepted after review repairs and OpenSpec validation

This ledger tracks review findings for `PACKET-TRAIN.md`. Accepted P1/P2 findings block implementation.

## Review Lanes

| Lane | Status | Reviewer focus |
|---|---|---|
| Frame/packet integrity | complete | Packet train preserves frame hard core, exterior, falsifier, proof separation, and no-HOW-in-frame discipline. |
| Server/runtime code path | complete | Packets cover router, Effect/oRPC, error spine, workflows, registry, operation DTOs, and server tests without hidden gaps. |
| Browser/UI scenario | complete | Packets cover browser API projection, UI state, event recovery, busy gates, diagnostics, and scenario proof. |
| Operational proof | complete | Packets separate build/generated/deploy/tuner/log/in-game labels and keep direct-control authority. |
| Graphite/OpenSpec/worktree | complete | Packet sequence, branch IDs, OpenSpec IDs, worktree risk, generated-output hygiene, and validation gates are reviewable. |

## Findings

| ID | Severity | Lane | Finding | Disposition | Repair or evidence |
|---|---:|---|---|---|---|
| PRD-00 | P0 | Owner | Initial packet train drafted from prework corpus and current code inspection. | Recorded | Awaiting peer review before implementation. |
| PRD-01 | P1 | Graphite/OpenSpec/worktree | Packet validation commands referenced OpenSpec change IDs that did not exist. | Accepted; repaired | Added eight OpenSpec packet records. Each packet validates under `bun run openspec -- validate <id> --strict`, and `bun run openspec:validate` reports 194 passed / 0 failed. |
| PRD-02 | P1 | Graphite/OpenSpec/worktree | Proposed Graphite branches do not exist and current base is dirty/high-risk. | Accepted; repaired in plan | Packet train now requires clean packet-design layer before implementation and avoids broad restack/sync/submit until stack ownership is resolved. |
| PRD-03 | P1 | Server/runtime code path | SMR-01 omitted `recipeDag.get`, an effect-oRPC leaf with declared errors. | Accepted; repaired | Added RPC-01 and EB-16; SMR-01 write set, expected behavior, scenario rows, and tests now include recipe DAG declared errors and defect logging. |
| PRD-04 | P2 | Frame/packet integrity | Coverage matrix rows were not fully carried into packet bodies. | Accepted; repaired | Added READ browser portions, LIVE rows, RPC-01, EB-16, EB-17, and explicit rendered/manual browser portions to packet bodies and matrix. |
| PRD-05 | P2 | Operational proof | SMR-07 claimed deploy proof without a concrete deploy gate. | Accepted; repaired | SMR-07 now names `mod-swooper-maps:build:studio-deploy`, repo-owned `@civ7/plugin-mods` or `mod-swooper-maps:deploy`, target Mods dir, file count, and deployed `maps/studio-current.js` identity. |
| PRD-06 | P2 | Operational proof | Tuner proof was too coarse and could confuse listener readiness with command exercise. | Accepted; repaired | SMR-07 splits readiness from `tuner-exercised`; direct-control commands must record host, port, state id/name, command, result, request id, and timestamps. |
| PRD-07 | P2 | Server/runtime code path | SMR-02 did not require restart failure classification tests. | Accepted; repaired | SMR-02 now requires restart plain `Error` classification and terminal DTO diagnostics that do not collapse into `InvalidRequest`. |
| PRD-08 | P2 | Server/runtime code path | SMR-01 omitted `civ7.live.status` source write set despite requiring parity tests. | Accepted; repaired | Added `packages/studio-server/src/liveGame/statusRead.ts` to SMR-01 write set. |
| PRD-09 | P2 | Browser/UI scenario | Browser proof implied automation not present in repo. | Accepted; repaired | SMR-06 now uses existing Vitest/component tests plus documented manual full-shell browser protocol; Playwright addition requires a separate accepted test-stack packet. |
| PRD-10 | P2 | Browser/UI scenario | Event recovery testing lacked a concrete seam. | Accepted; repaired | SMR-04 now introduces `studioEventRecovery.ts` as a pure coordinator seam and requires coordinator plus hook delegation tests. |
| PRD-11 | P2 | Frame/packet integrity | Frame falsifier was not carried into the train. | Accepted; repaired | Added train-level falsifier/reframe gate and per-packet review obligation. |
| PRD-12 | P2 | Owner/user report | User reports `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js` immediately after `preparing-setup`; Civ7 stays at shell. | Accepted; repaired into packet design | Added OP-04/PROOF-02/PROOF-03/EB-17 priority blocker and SMR-07 stop condition requiring local bundle, deployed bundle, setup row visibility, bounded logs, and in-game readback for current request id. |
| PRD-13 | P3 | Operational proof | `dev-started` was not a canonical proof label. | Accepted; repaired | SMR-05 now calls it dev startup observed and explicitly prevents substitution for live labels. |
| PRD-14 | P3 | Operational proof | Live logs were too narrow. | Accepted; repaired | SMR-07 requires bounded `Scripting.log` and sibling `Modding.log`, `Database.log`, and `UI.log` ranges when part of a claim. |
| PRD-15 | P3 | Graphite/OpenSpec/worktree | `gt log --no-interactive` was not the local closeout command. | Accepted; repaired | SMR-08 now uses `gt ls` and `gt log short`. |
| PRD-16 | P3 | Graphite/OpenSpec/worktree | Generated-output write set in SMR-07 was too broad. | Accepted; repaired | SMR-07 now names exact `studio-current` generated/local/deployed evidence files. |
| PRD-17 | P3 | Browser/UI scenario | Daemon identity ownership was ambiguous. | Accepted; repaired | SMR-04 states browser uses hello/current identity and server contract expansion reopens the owning server packet. |
| PRD-18 | P3 | System record | Workstream census was stale after branch change. | Accepted; repaired | `WORKSTREAM-RECORD.md` updated to current branch `codex/studio-effect-state-machine-prework`, HEAD `f107448a3`, and current dirty state. |

## Acceptance Gate

Implementation remains blocked until:

- all review lanes are complete;
- accepted P1/P2 findings are repaired, rejected with evidence, invalidated with later evidence, or moved outside the implementation closure claim with explicit owner and trigger;
- `PACKET-TRAIN.md` status is updated from draft to accepted;
- OpenSpec packet records exist and validate under `--strict`;
- the packet-design package is committed as a clean Graphite layer excluding unrelated `docs/projects/mapgen-workstream-skill/`.
