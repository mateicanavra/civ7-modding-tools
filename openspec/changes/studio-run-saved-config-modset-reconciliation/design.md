# Design

## Setup Snapshot

The runtime creates one request setup snapshot after saved-config load and
targeted generated-mod reconciliation. Row visibility and pre-Begin value readback are
performed against that snapshot. Start consumes that same reconciled setup
state and must not re-run a saved-config load that can remove the generated
mod.

The selected strategy is a direct-control-owned reconciled setup session.
Studio passes the saved setup config name, generated mod id, stable generated
map row, seed, map size, player count, and resources to a direct-control
preparation operation. Direct-control loads the saved config, reconciles the
generated mod with the active setup target, applies the generated row and setup
values, reads back the targeted reconciliation result, generated row, seed, map
size, and player count, and returns a prepared setup session. Resources are
verified through the visible UI selection, admitted request, generation
manifest, and retained evidence row.
Start consumes that prepared session and does not run another saved-config load.

Broad active-mod inventory is diagnostic-only. It is not a success-path launch
invariant because enumerating the full installed/active mod set has live tuner
risk and is unnecessary when the launch question is whether the generated
Studio-run target was reconciled and the stable generated map row is visible.

Rejected live paths:

- patching the user's persisted saved config in place;
- generating a request-specific saved setup config file as the primary path;
- keeping a conditional strategy switch between saved-config patching,
  generated config files, and active setup mutation.

## Row Visibility

The row oracle is the stable generated Studio-run map file:

```text
{mod-swooper-studio-run}/maps/studio-run.js
```

The row must be visible after saved-config load and targeted generated-mod
reconciliation. Request
identity remains in `runArtifactId`, generation manifest digests, deployment
snapshot digests, and embedded runtime markers; it does not require Civ7 to
discover a brand-new setup row for every Play in Game click. Seeing
`{swooper-maps}/maps/latest-juicy.js` is not sufficient because that is the
source catalog row, not the generated Studio-run launch slot.

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
- targeted generated-mod reconciliation after saved-config load;
- seed, map size, and player count readback before Begin;
- resources selected in UI, admitted request, generation manifest, and
  retained evidence row;
- start result.
