# Phase Record: Studio Effect RPC Boundary Completion

Status: implemented and locally verified.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-01---server-rpc-boundary-completion`.

Priority rows: READ-01 through READ-06, RPC-01, LIVE-01 through LIVE-04, EB-01 through EB-04, EB-08 mapping portions, EB-16.

## Implementation Notes

- `recipeDag.get` now treats only `RecipeDagNotFound` and `RecipeDagUnavailable` as declared expected errors.
- Unexpected recipe DAG exceptions remain defects and reach shared handler logging instead of being converted to `RECIPE_DAG_UNAVAILABLE`.
- Read/live unavailable mappings are pinned by handler tests with an injected `Civ7TunerClient`.
- `civ7.live.status` partial-error parity is pinned at 200 with per-field `{ error }` entries.
- Merged `@civ7/control-orpc` procedures remain exterior except shared handler behavior.

## Verification

- `nx run @civ7/studio-server:test --outputStyle=static` passed with 72 tests.
- `nx run @civ7/studio-server:build --outputStyle=static` passed.
- `bun run openspec -- validate studio-effect-rpc-boundary-completion --strict` passed.
- `bun run openspec:validate` passed with 194 items.
