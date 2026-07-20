# Design

## Generated Mod Contract

The request-local generated mod is a first-class Civ7 map mod. Its rendered
files must include:

- stable mod id `mod-swooper-studio-run`;
- `.modinfo` and config rows that reference the request run artifact;
- localized text for the generated map row;
- runtime script at `maps/${runArtifactId}.js`;
- correlation markers embedded in generated runtime assets;
- dependency/action metadata needed for Civ7 shell/setup discovery.

Seeing the original catalog source row is not enough. The setup row must point
at `{mod-swooper-studio-run}/maps/${runArtifactId}.js`.

## Visibility Boundary

This packet validates generated mod visibility before saved-config composition.
After deployment changes `.modinfo`, config XML, or map-row metadata,
direct-control must reach an explicit Civ7 mod-catalog refresh boundary: Civ7 is
closed, relaunched, brought to shell/main-menu setup control, and then setup
rows are read. A process restart cannot be an unstated live path; it is either
the declared catalog-refresh step for this packet or the packet remains open.

## File Topology

Likely source write set:

- `mods/mod-swooper-maps/scripts/map-artifacts/file-plan.ts`
- `mods/mod-swooper-maps/scripts/run-manifest-generator.ts`
- `mods/mod-swooper-maps/test/config/run-manifest-generator.test.ts`
- `apps/mapgen-studio/src/server/studio/engines.ts`
- `apps/mapgen-studio/src/server/runInGame/**`

Runtime Civ7 control remains in `@civ7/direct-control`.

## Comments

Anchor comments belong at renderer/deployment boundaries where they explain
that Civ7 setup must discover a request-local generated row, not just load the
source catalog mod.
