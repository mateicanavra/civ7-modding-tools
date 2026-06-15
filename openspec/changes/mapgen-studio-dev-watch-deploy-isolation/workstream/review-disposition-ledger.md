# Review Disposition Ledger

Historical superseded S1.1a implementation ledger. This file records the
pre-Nx failure repair that proved the failure mode. It is not active
implementation guidance for the accepted D1 packet; the active packet authority
is `packet-review-disposition-ledger.md`, `proposal.md`, `design.md`, and
`tasks.md`.

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| PRE-1 | P1 | owner/architecture | Daemon recipe-DAG imported deploy-written recipe `dist` artifacts, causing Bun watch to restart mid-operation. | boundary | accepted-repaired | Move daemon recipe-DAG stage imports to source-owned recipe stage modules and pin no package `recipes/*` imports in the daemon service. | `apps/mapgen-studio/src/server/recipeDag/service.ts`; `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts`; live Save&Deploy/Play proof held `serverInstanceId=studio-server-mqby0kyi-1zbz`. | no |
| PRE-2 | P1 | owner/architecture | Operation deploy build can replay dependency `dist` outputs that are also daemon imports. | boundary | invalidated by D1 packet rewrite | The pre-Nx Turbo `--only` repair is superseded. The active D1 packet requires repo-local Nx `mod-swooper-maps:build:studio-deploy --outputStyle=static` and forbids Turbo as final deploy authority. | `packet-review-disposition-ledger.md`; `proposal.md`; `design.md`; `tasks.md`. | no |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
