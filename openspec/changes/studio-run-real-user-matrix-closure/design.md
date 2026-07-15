# Design

## Authority-Ready Boundary

This changeset makes P21 authority-ready. A.2 and A.3 must reconverge because
their source is embedded into the generated `maps/studio-run.js` artifact; the
integrated deterministic gates then promote P21 to runtime-ready before live
execution.

P19 and P20 are preliminary live support. They do not close the final matrix,
but they remove the need for a duplicate preliminary three-row pass.

## Fixed Matrix

| Canonical config | Saved setup | Seed | Size | Players | Resources |
| --- | --- | --- | --- | --- | --- |
| `swooper-earthlike` | `ToT_BasicModsEnabled.Civ7Cfg` | `1538316415` | `MAPSIZE_HUGE` | 10 | `balanced` |
| `latest-juicy` | `ToT_BasicModsEnabled.Civ7Cfg` | `1538316415` | `MAPSIZE_HUGE` | 10 | `balanced` |
| `swooper-desert-mountains` | `ToT_BasicModsEnabled.Civ7Cfg` | `1538316415` | `MAPSIZE_HUGE` | 10 | `balanced` |

Each row is one visible click and one admitted lifecycle demand. Config
selection is rendered authoring state, not a launch-source union.

## Stable Row And Correlation

The Civ7 setup row is always:

```text
{mod-swooper-studio-run}/maps/studio-run.js
```

`runArtifactId` identifies the request's generated artifact in
`RunCorrelation`; it does not select a filename. Every row binds:

- request id and diagnostics id;
- run artifact id;
- canonical config, launch envelope, and generation manifest digests, including
  balanced resources in the admitted launch envelope and manifest;
- stable local/generated/deployed script identity;
- setup row and saved-config readback;
- scripting-log marker and bounded loaded-game readback;
- runtime dimensions/turn, recipe-owned nondegenerate/playability proof, Civ7
  process identity, and pre/post `/healthz` Studio daemon identity.

Generated and deployed digests must match. Exact-authorship evidence must have
`status: "complete"` and `unresolvedLinks: []`; the separate attribution report
must have `status: "complete"` and `missingSections: []`. Public projections
remain redacted.

## Deterministic Gates

The concrete Nx/test owners below must be green at the runtime-ready boundary;
they replace additional Civ7 mutations. Two proof repairs remain explicit:
public operation-adoption fixtures must validate against the exported TypeBox
schema, and same-content sequential operations must prove fresh workspace,
artifact, manifest, and deployment identity.

| Behavior | Nx target | Concrete owner |
| --- | --- | --- |
| Invalid input, saved-config mismatch, cancellation, ownership, and public/private projection | `control-studio-server:test` | `packages/studio-server/test/operationRuntime.test.ts`, `packages/studio-server/test/handler.test.ts` |
| Exact-once saved-config/setup/start lifecycle and no-repeat failure law | `control-orpc:test` | `packages/civ7-control-orpc/test/lifecycle-single-player-start-procedure.test.ts` |
| Runtime marker, row, and correlation mismatch | `mapgen-studio:test` | `apps/mapgen-studio/test/runInGame/runtimeObservation.test.ts` |
| Missed-event, reconnect, and reload terminal adoption with schema-valid public fixtures | `mapgen-studio:test` | `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` |
| Sequential same-content request, workspace, artifact, manifest, and deployment freshness | `control-studio-server:test`, `studio-run-workspace:test` | `packages/studio-server/test/operationRuntime.test.ts`, `packages/studio-run-workspace/test/generationManifest.test.ts` |
| Public live status and snapshot route projection | `control-studio-server:test` | `packages/studio-server/test/handler.test.ts` |
| Atomic reroll with one generation | `mapgen-studio:test` | `apps/mapgen-studio/test/controllers/useBrowserRun.test.tsx` |
| Nonempty bounded land/water for every shipped config at `106x66`, including seed `1538316415` | `mod-swooper-maps:test:studio-run-in-game` | `mods/mod-swooper-maps/test/maps/map-config-schema.test.ts` |

The frozen-tree playability verdict is joined to each live row by canonical
config id and `canonicalConfigDigest`; it does not require another live probe.

`mapConfigs.saveDeploy` retains its own operation authority and is not repeated
inside each P21 row.

## Execution And Invalidation

Run one existing continuous `mapgen-studio:dev` graph and execute the three
rows serially. Use the operation's own status and diagnostics; do not issue
independent Tuner probes or high-frequency polling.

Capture `/healthz` before admission and after terminal completion; matching
`repoRoot`, `serverInstanceId`, and `startedAt` prove one Studio daemon owned the
row. The matrix runs once at the frozen runtime-relevant tree. Any
runtime-relevant change invalidates all three rows so the accepted matrix binds
one exact tree. Record-only changes rerun their static validation, not Civ7.
Whole-application restart is operator-owned recovery after a real wedge and
never authorizes replay of an uncertain mutation.
