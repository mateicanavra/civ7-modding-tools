# Design

## Setup Snapshot

The runtime creates one request setup snapshot after saved-config load and
generated-mod enablement. Row visibility and pre-Begin value readback are
performed against that snapshot. Start consumes that same reconciled setup
state and must not re-run a saved-config load that can remove the generated
mod.

The selected strategy is a direct-control-owned reconciled setup session.
Studio passes the saved setup config name, generated mod id, generated map row,
seed, map size, player count, and resources to a single direct-control
preparation operation. Direct-control loads the saved config, enables the
request-local generated mod in the active setup target, applies the generated
row and setup values, reads back active mod-set evidence, generated row, seed,
map size, and player count, and returns a prepared setup session. Resources are
verified through the visible UI selection, admitted request, generation
manifest, and retained evidence row.
Start consumes that prepared session and does not run another saved-config load.

Rejected live paths:

- patching the user's persisted saved config in place;
- generating a request-specific saved setup config file as the primary path;
- keeping a conditional strategy switch between saved-config patching,
  generated config files, and active setup mutation.

## Row Visibility

The row oracle is the expected generated map file for the admitted request:

```text
{mod-swooper-studio-run}/maps/${runArtifactId}.js
```

The row must be visible after saved-config/mod-set reconciliation. Seeing
`{swooper-maps}/maps/latest-juicy.js` is not sufficient because that is the
source catalog row, not the request-local generated artifact.

## File Topology

Likely source write set:

- `packages/civ7-direct-control/src/setup/**`
- `packages/civ7-direct-control/test/**`
- `packages/studio-server/src/workflows/RunInGameWorkflow.ts`
- `packages/studio-server/src/ports/workflowTypes.ts`
- `packages/studio-server/test/**`
- `apps/mapgen-studio/src/server/runInGame/**`
- `apps/mapgen-studio/test/runInGame/**`
- generated mod rendering code when implementation evidence assigns ownership
  to generated mod metadata

Runtime Civ7 control remains in `@civ7/direct-control`.

## Evidence Shape

Private diagnostics and workstream evidence record:

- saved setup config name;
- generated mod id;
- run artifact id;
- setup row readback after reconciliation;
- active mod-set readback after reconciliation;
- seed, map size, and player count readback before Begin;
- resources selected in UI, admitted request, generation manifest, and
  retained evidence row;
- start result.
