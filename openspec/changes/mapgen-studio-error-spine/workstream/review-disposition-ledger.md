# D3 Review Disposition Ledger

Status: packet accepted; implementation-diff review repairs recorded
Date: 2026-06-15

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D3-R1 | packet diagnosis | Existing D3 records were old implementation closure artifacts, including merged PR state and all tasks checked, not packet-train-ready acceptance records. | P1 | accepted | Reset proposal/design/tasks/spec/workstream records to packet draft status and future implementation closure gates. |
| D3-R2 | D2.5 bridge guard | Existing D3 allowed permissive `details?: unknown` declared error data as the durable safety mechanism. | P1 | accepted | D3 now requires TypeBox-owned sanitized error data and deletes/narrows expected-failure unknown details. |
| D3-R3 | schema authority | Existing D3 design said legacy success I/O schemas remain Zod; D2.5 now makes TypeBox the Studio public schema origin. | P2 | accepted | Removed Zod allowance from D3 target and anchored D3 error data in the D2.5 TypeBox spine. |
| D3-R4 | black ice | Existing D3 claimed live proof reuse without a precise boundary under the new packet train. | P2 | accepted | Live proof is now an implementation closure gate only if success-path execution/watch/deploy behavior changes; otherwise package/app scenario proof plus explicit boundary is required. |
| D3-R5 | architecture | Current code maps by status-derived `StudioEngineError` kind and raw app-host `ORPCError`; this is not the final Effect-native failure model. | P1 | accepted | D3 now requires a typed failure ADT, package-owned mapping, router/runtime-only raw ORPC construction, and D4-compatible Effect failures. |
| D3-R6 | error-corpus scout | Recovery actions are currently arbitrary strings across Run and Save; the packet needs a starting vocabulary that covers current actions. | P2 | accepted | Expanded recovery-action vocabulary and required TypeBox vocabulary tests. |
| D3-R7 | black-ice scout | Private app-host bridge deletion target was too soft. | P2 | accepted | Replaced the bridge transition with a binary D3 implementation closure rule: no production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, or bridge mapping remains. |
| D3-R8 | black-ice scout | D2.5 router-only `effect-orpc` ownership was not executable in D3 verification. | P2 | accepted | Added `effect-orpc` import scan and classification gate to proposal, design, testing, and closure records. |
| D3-R9 | testing/black-ice review | Failure-path testing and recovery-action coverage were described broadly but lacked a normative failure vocabulary and operation-state projection coverage. | P2 | accepted | Added `failure-vocabulary-ledger.md`, operation-state projection rows, vocabulary tests, and sealed recovery-action spec scenarios. |
| D3-R10 | testing review | Proposal wording could be read as claiming fresh live failure-path proof during packet acceptance. | P2 | accepted | Reworded the gate: D3 packet acceptance does not claim fresh live failure proof; future error-only implementation uses local package/app proof unless execution/watch/deploy behavior changes. |
| D3-R11 | schema/effect review | `UnexpectedDefect` was included in expected-failure ADT examples, which would put defects inside workflow `Effect.fail` unions. | P1 | accepted | Removed defects from expected-failure tag language, kept `UnexpectedDefectData` as router-edge containment only, and added tests requiring workflow unions to exclude defect wrappers. |
| D3-R12 | effect review | The D3 vocabulary omitted frame-required `StudioOperationFailure` lifecycle variants: expired operation, daemon identity mismatch, runtime disposed, and unsupported operation type. | P1 | accepted | Added lifecycle variants to design, spec, failure vocabulary, corpus, downstream realignment, and testing requirements. |
| D3-R13 | schema review | Reason-code ownership was acceptable but could drift without a visible schema-first checklist. | P3 | accepted | Added reason-code ownership guidance to the failure vocabulary, testing ledger, and closure checklist. |
| D3-R14 | testing review | Autoplay failure coverage only named mutex/dependency and left start/stop plus verification failed under-specified. | P1 | accepted | Added `AutoplayStartStopFailed` and `AutoplayVerificationFailed` vocabulary rows, spec scenarios, corpus rows, and tests. |
| D3-R15 | testing review | Lifecycle mapper totality still used implementation-selected wording. | P2 | accepted | Added an exact lifecycle mapping matrix for Run in Game start/status, Save/Deploy start/status, and Autoplay. |
| D3-R16 | black-ice review | D3 still allowed a retained production bridge as a possible D4 cleanup path. | P1 | accepted | Made D3 implementation closure binary and removed retained-bridge/D4-deletion language from packet gates. |
| D3-R17 | black-ice/effect review | Reason codes were illustrative rather than sealed. | P1 | accepted | Promoted reason codes into a normative matrix with family, tag, code/status, TypeBox data, recovery actions, and oracle. |
| D3-R18 | black-ice review | Frame-required `@civ7/control-orpc` and `@civ7/direct-control` package gates were missing from future implementation verification. | P2 | accepted | Added control package check/test/build gates or untouched-package negative-scan disposition. |
| D3-IMPL-R1 | Kepler implementation review | Save/Deploy background failures still stored string-plus-arbitrary-details status data rather than a package-owned `DeployFailed` projection. | P1 | accepted | Converted `runSaveDeployEngine` failure catch and `createMapConfigSaveDeployOperationStore().fail` to consume `StudioRuntimeFailure`, project bounded diagnostics, and test `DeployFailed` status details. |
| D3-IMPL-R2 | Kepler implementation review | Autoplay command and verification failures could still fall through generic dependency/proof failure taxonomy. | P1 | accepted | Converted Autoplay start/stop command failures to `AutoplayStartStopFailed`, failed verification to `AutoplayVerificationFailed`, and updated mapper tests to use Autoplay-specific tags. |
| D3-IMPL-R3 | Kepler implementation review | Closure wording overclaimed operation-state typed projections while Save/Deploy details and public recovery actions were still open. | P2 | accepted | Narrowed Save/Deploy status `details` to bounded diagnostic values and wired Run in Game / Save-Deploy public `recoveryActions` to `studioRecoveryActionSchema`. |
| D3-IMPL-R4 | Supervisor boundary review | Router-facing non-`ORPCError` stateful host defects mapped to namespace `*_FAILED` without `UnexpectedDefectData`. | P1 | accepted | Routed stateful router defect catches through package `mapUnexpectedDefectToDefinedError` and updated handler tests to assert sanitized defect data. |
| D3-IMPL-R5 | Supervisor browser-boundary review | Browser feature modules value-imported the root `@civ7/studio-server` server/runtime entrypoint for operation constants, causing `apps/mapgen-studio build` to pull direct-control Node built-ins into Vite. | P1 | accepted | Moved browser DTO constants/types in `features/mapConfigSave/status.ts` and `features/runInGame/status.ts` to `@civ7/studio-server/contract`; package rebuild, app build, and exact-root value-import scans now pass. |
| D3-IMPL-R6 | Rawls browser-boundary review | `@civ7/studio-server/contract` still imported the root `@civ7/control-orpc` contract value, and the line-oriented root `@civ7/studio-server` scan was underpowered for multiline imports. | P1 | accepted | Added browser-safe `@civ7/control-orpc/contract` export/build entrypoint, moved Studio contract value import to that subpath, and recorded multiline-safe exact-root scans plus non-server zero-hit proof. |
| D3-IMPL-R7 | Supervisor control-package gate review | D3 docs claimed `packages/civ7-control-orpc` untouched while the diff added a contract subpath and changed package build inputs; the initial control build was not declaration-green. | P1 | accepted | D3 now owns the touched control package paths, includes `scripts/build.mjs`, records the `tsup`/DTS/`tsconfig.tsbuildinfo` root cause, and gates `packages/civ7-control-orpc` check/build/test before Studio package/app closure. |

## Required Fresh Reviews

- Error-corpus / runtime-surface review: accepted through corpus/prework scout findings and repaired ledgers.
- TypeScript/schema authority review: accepted.
- Effect/lifecycle alignment review: accepted after lifecycle matrix and reason-code repairs.
- Testing/parity review: accepted after Autoplay failed-outcome and lifecycle totality repairs.
- Hardening/prework philosophy review: accepted.
- Black-ice disambiguation review: accepted after bridge deletion, reason-code, and control package gate repairs.
- Adversarial residue/orphan review: accepted; no unresolved P1/P2 findings remain.

## Implementation-Diff Review

- Fresh D3 implementation review requested from Kepler on 2026-06-15 over the
  current dirty diff. Scope: package failure ADT/TypeBox schema/mapping, app
  engine conversion, raw oRPC ownership, operation-state projections, residue
  scans, and proof/doc claims.
- [x] Kepler P1/P2 findings and supervisor boundary findings accepted and
  repaired before Graphite commit. Focused package/app gates and residue scans
  were rerun after repair; no live Civ7 Play/Save&Deploy proof is claimed.
- [x] Rawls/browser-boundary and supervisor control-package blockers accepted
  and repaired before Graphite commit. Remaining live Civ7 proof remains
  explicitly unclaimed.
