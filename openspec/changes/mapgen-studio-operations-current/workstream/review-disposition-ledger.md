# D6 Review Disposition Ledger

Status: accepted
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D6-R1 | Runtime projection / D4 ownership | Active operations were required to appear in both `active` and `recent`, while D6 otherwise treated `recent` as terminal retention. | P2 | accepted | Spec/design/testing now define `recent` as terminal-only and require active operations to be absent from `recent`. |
| D6-R2 | Runtime projection / D4 ownership | TTL/status agreement collapsed expired-known tombstones and physically pruned ids into generic not-found. | P2 | accepted | Spec/design/testing now require active, retained terminal, expired-known `OperationExpired`, physically pruned or never-known not-found, and daemon-mismatch cases. |
| D6-R3 | Browser recovery deletion | Recovery deletion search omitted current store/helper symbols: `runInGameSnapshot`, `lastRunInGameSource`, setters, and parser helpers. | P1 | accepted | Proposal/design/prework/testing now include the expanded symbol corpus and classify retained parser helpers as pure relation/proof logic only. |
| D6-R4 | Browser recovery deletion | Protected localStorage tests did not name current authoring, preset, and theme owners. | P2 | accepted | Prework/testing/proposal now name exact keys/files/tests for `mapgen-studio.authoring-state.v1`, `mapgen-studio.scratchConfigs`, and `theme-preference`. |
| D6-R5 | TypeBox/schema projection | TypeBox proof did not require recoverable `TSchema` origin, canonical DTO reuse, or static types no broader than runtime validation. | P2 | accepted | Spec/design/testing now require the Standard Schema adapter to preserve TypeBox origin, reuse canonical operation DTOs, and guard static/runtime type parity. |
| D6-R6 | Testing/parity | Recovery deletion search could miss generic storage API paths. | P2 | accepted | Prework/testing now add a generic storage API scan for `localStorage`, `sessionStorage`, `persist(`, `createJSONStorage`, `getItem(`, and `setItem(` in D6-relevant app paths. |
| D6-R7 | Hardening / black ice | D6 write set included `apps/mapgen-studio/src/app/hooks/**`, which accidentally covered D8/D9-owned `useStudioEvents.ts`. | P2 | accepted | Proposal narrows D6 app write set to `StudioShell.tsx` and `operationAdoption.ts`; downstream/design protect `useStudioEvents.ts`. |
| D6-R8 | Prework completeness | Prework said adoption references were traced but did not name `apps/mapgen-studio/src/app/operationAdoption.ts`. | P3 | accepted | Proposal/prework/downstream now list `operationAdoption.ts` as the D6-owned adoption helper. |

## Required Fresh Reviews

- Runtime projection / D4 ownership review: accepted by Newton after repair.
- Browser recovery deletion review: accepted by Russell after repair.
- TypeBox/schema projection review: accepted by Boole after repair.
- Testing/parity review: accepted by Boole after repair.
- Hardening/prework philosophy review: accepted by Mendel after repair.
- Black-ice disambiguation review: accepted by Mendel after repair.
- Downstream D8/D9 realignment review: covered by hardening/black-ice and storage review; `useStudioEvents.ts` protected and D8/D9 handoff recorded.

## Repair Review Acceptance

| Lane | Reviewer | Result | Evidence |
| --- | --- | --- | --- |
| Runtime lifecycle semantics | Newton | accepted | No remaining P1/P2 after terminal-only recent, exact expiry/prune/not-found/mismatch matrix, and D4 ownership repairs. |
| Browser recovery deletion / protected storage | Russell | accepted | No remaining P1/P2 after expanded recovery symbol corpus, generic storage scan, parser-helper pure-only rule, and protected storage owner tests. |
| TypeBox/schema/testing adequacy | Boole | accepted | No remaining P1/P2 after recoverable `TSchema` origin, canonical DTO reuse, static/runtime parity, exact lifecycle matrix, and negative-search gates. |
| Hardening/prework/black ice | Mendel | accepted | No remaining P1/P2 after ambiguity tightening, active-polling D8/D9 deletion target, exact daemon mismatch, and theme untouched-file proof. |

## Implementation-Diff Review Disposition

Status: implementation-diff review complete with no unresolved P1/P2; committed at current D6 branch tip.

| ID | Reviewer | Finding | Severity | Disposition | Repair / Evidence |
| --- | --- | --- | --- | --- | --- |
| D6-IMPL-R1 | Maxwell | The D6 implementation/test wording overclaimed “one daemon-current read” because `useStudioEvents.ts` can also read current on event-stream hello. | P2 | accepted/repaired | Test and docs now scope the claim to the D6-owned shell boot effect. The D8/D9-owned event-hook hello-current read is explicitly classified as protected residual behavior, not D6 closure proof. |
| D6-IMPL-R2 | Supervisor | Boot/no-replay proof omitted the accepted forbidden `fetchSaveDeployStatus` symbol. | P2 | accepted/repaired | `operationAdoption.test.ts` now guards `fetchRunInGameStatus`, `fetchSaveDeployStatus`, `runInGame.status`, and `mapConfigs.status` in the boot/adoption source corpus. |
| D6-IMPL-R3 | Supervisor | Retained `runInGameSnapshot`, `lastRunInGameSource`, setters, and parse helpers needed explicit session-only/proof-helper classification. | P2 | accepted/repaired | `operationAdoption.test.ts` asserts `runStore.ts` is session-only and has no storage adapter; `StudioShell.tsx` setter usage is storage-free; `clientState.ts` parse helpers have no storage read/write path. |
| D6-IMPL-R4 | Supervisor | Storage API proof must match the accepted broad scan or record a narrower executable guard plus raw scan classification. | P2 | accepted/repaired | Executable guard bans storage APIs and recovery key symbols outside protected owners. Raw broad scan is recorded as classified evidence: authoring/preset/theme/view/comment owners are unrelated protected storage; operation recovery-key production scan is zero-hit. |
