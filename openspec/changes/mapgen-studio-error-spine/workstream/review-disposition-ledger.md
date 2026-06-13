# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| WATCH-1 | P2 | watcher | S1.2 requires Save&Deploy status 404 identity echo, but still-live `mapgen-studio-server-orpc` OpenSpec text asserts the old no-echo asymmetry. | spec-conflict | accepted | Realign or explicitly disposition the older scenario inside the S1.2 slice before closure. | `openspec/changes/mapgen-studio-error-spine/specs/mapgen-studio/spec.md`; `openspec/changes/mapgen-studio-server-orpc/specs/mapgen-studio/spec.md`. | yes |
| WATCH-2 | P2 | watcher | Package contract/context files still document or encode Save&Deploy status 404 as no-echo. | contract-residue | accepted | Update `errors.ts`, `mapConfigs.ts`, and `context.ts` alongside implementation/tests so contract comments and data schema match S1.2 parity. | `packages/studio-server/src/contract/errors.ts`; `packages/studio-server/src/contract/mapConfigs.ts`; `packages/studio-server/src/context.ts`. | yes |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
