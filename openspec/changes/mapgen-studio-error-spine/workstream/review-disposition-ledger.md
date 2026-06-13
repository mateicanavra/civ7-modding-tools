# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| WATCH-1 | P2 | watcher | S1.2 requires Save&Deploy status 404 identity echo, but still-live `mapgen-studio-server-orpc` OpenSpec text asserted the old one-sided identity rule. | spec-conflict | accepted-repaired | Realign or explicitly disposition the older scenario inside the S1.2 slice before closure. | `openspec/changes/mapgen-studio-server-orpc/specs/mapgen-studio/spec.md` now requires Save&Deploy 404 identity echo; `packages/studio-server/test/handler.test.ts` covers Save&Deploy 404 identity/details. | no |
| WATCH-2 | P2 | watcher | Package contract/context files still documented or encoded Save&Deploy status 404 without identity echo. | contract-residue | accepted-repaired | Update `errors.ts`, `mapConfigs.ts`, and `context.ts` alongside implementation/tests so contract comments and data schema match S1.2 parity. | `packages/studio-server/src/contract/errors.ts`, `packages/studio-server/src/contract/mapConfigs.ts`, and `packages/studio-server/src/context.ts` now declare Save&Deploy 404 identity echo and unavailable errors. | no |
| USER-1 | P2 | operator | Retaining the legacy Run-in-Game-named error bridge would orphan a transport artifact instead of closing it. | bridge-closeout | accepted-repaired | Delete the legacy Run-in-Game-named error bridge in S1.2 or record a strong rationale and explicit deletion slice. | `apps/mapgen-studio/src/server/studio/engineErrors.ts` owns `StudioEngineError`; active code no longer defines or imports the retired bridge symbol. | no |
| USER-2 | P2 | operator | S1.2 initially extended Zod in a contract-data spot that should be TypeBox/Standard Schema. | schema-tech-drift | accepted-repaired | Convert S1.2 error data schemas to TypeBox/Standard Schema and record a closeout target for the pre-existing legacy Zod success I/O corpus. | `packages/studio-server/src/contract/errors.ts` uses TypeBox/Standard Schema for S1.2 error data; `docs/projects/studio-runtime-simplification/PLAN.md` S4.1 records the remaining legacy Zod success I/O closeout target. | no |
| WATCH-3 | P2 | closure watcher | Closure records overclaimed Save&Deploy identity-residue repair while older `mapgen-studio-server-orpc` proposal/design/tasks and `packages/studio-server/src/errors.ts` still asserted the old one-sided identity rule. | closure-overclaim | accepted-repaired | Patch every live one-sided identity reference, rerun focused scan, and revalidate OpenSpec before closure. | `mapgen-studio-server-orpc` proposal/design/tasks and `packages/studio-server/src/errors.ts` now state status-miss identity echo parity. | no |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.
- `accepted-repaired`: accepted material finding repaired inside this slice with
  evidence and no remaining closure block.

No material finding may remain undispositioned at phase closure.
