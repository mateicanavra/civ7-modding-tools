# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| PRE-1 | P1 | owner/architecture | Daemon recipe-DAG imported deploy-written recipe `dist` artifacts, causing Bun watch to restart mid-operation. | boundary | accepted-repaired | Move daemon recipe-DAG stage imports to source-owned recipe stage modules and pin no package `recipes/*` imports in the daemon service. | `apps/mapgen-studio/src/server/recipeDag/service.ts`; `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts`; live Save&Deploy/Play proof held `serverInstanceId=studio-server-mqby0kyi-1zbz`. | no |
| PRE-2 | P1 | owner/architecture | Operation deploy build can replay dependency `dist` outputs that are also daemon imports. | boundary | accepted-repaired | Add Turbo `--only` to operation deploy build args so Play/Save&Deploy write only mod package outputs. | `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`; `apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts`; `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts`. | no |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
