# Structural Authority Matrix

Status: required packet-train contract

Every permanent structural assertion in the Run in Game runtime packet train has
one owning runner. Behavior tests may cover behavior that depends on these
structures, but they are not the enforcement surface for the structures.

## Rows

| Row | Packet | Assertion | Runner | Rule id / target | Owner surface | Scan roots | Lifecycle | Baseline / current-tree action | Hook scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SA-01 | `studio-run-public-status-diagnostics` | Public Run in Game DTOs are closed public schemas owned by `@civ7/studio-contract`; private diagnostics are served only by lookup. | Grit | `grit-studio-run-public-contract-closed` | public schema source | `packages/studio-contract/src`, `packages/studio-server/src/operationRuntime` | registered enforced | committed empty baseline after schema closure; current-tree scan blocks open public catch-all fields | none |
| SA-02 | `studio-run-operation-registry-identity` | Run in Game admission indexes active operations by request id and uses a single active runtime lease slot. | Grit | `grit-studio-run-operation-identity-owner` | operation runtime registry source | `packages/studio-server/src/operationRuntime` | registered enforced | committed empty baseline after cutover; current-tree scan blocks content-digest admission ownership | none |
| SA-03 | `studio-run-explicit-cancellation` | Public cancellation is owned by one `runInGame.cancel({ requestId })` command. | Grit | `grit-studio-run-cancel-command-owner` | public contract and runtime command handlers | `packages/studio-contract/src`, `packages/studio-server/src` | registered enforced | committed empty baseline after command lands | none |
| SA-04 | `swooper-catalog-source-index` | Swooper catalog source index has one tracked source location and entry shape. | structure-check | `structure-swooper-catalog-source-index` | Swooper map source tree | `mods/mod-swooper-maps/src/maps` | registered enforced | committed empty baseline after index lands | none |
| SA-05 | `studio-run-launch-source-resolution` | Public start input is the closed launch-source union, and server runtime owns source resolution. | Grit | `grit-studio-run-launch-source-boundary` | public start schema and server resolver | `packages/studio-contract/src`, `packages/studio-server/src`, `apps/mapgen-studio/src/app` | registered enforced | committed empty baseline after input cutover | none |
| SA-06 | `swooper-map-artifact-file-plan` | Swooper render modules produce file plans without filesystem writer authority; writer ports own writes. | Grit | `grit-swooper-map-render-file-plan-boundary` | Swooper artifact generator plus artifact-plan renderer/writer modules | `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`, `mods/mod-swooper-maps/scripts/map-artifacts` | registered enforced | committed empty baseline after render extraction; future artifact owners outside these paths must update this row and rule | none |
| SA-07 | `studio-run-generation-manifest` / `swooper-run-manifest-generator` | Studio Run in Game request-workspace artifact contract lives under `packages/studio-run-workspace/src`; generated `.mapgen-studio/run-in-game/<requestId>/` state remains runtime evidence, not source topology. | structure-check | `structure-studio-run-workspace-topology` | Shared private workspace artifact contract | `packages/studio-run-workspace/src` | registered enforced | committed empty baseline after workspace writer lands; Packet 8 moves the manifest handoff out of server internals so Swooper can validate the same private manifest without depending on `@civ7/studio-server` | none |
| SA-08 | `swooper-run-manifest-generator` | Swooper Run in Game generation has exactly one manifest input and one generated-mod output root from the manifest. | Grit | `grit-swooper-run-manifest-generator-boundary` | Swooper generator command/port | `mods/mod-swooper-maps/scripts/generate-run-manifest.ts`, `mods/mod-swooper-maps/scripts/run-manifest-generator.ts`, `mods/mod-swooper-maps/project.json` | registered enforced | committed empty baseline after generator lands | none |
| SA-09 | `swooper-catalog-index-cutover` | Catalog index cutover keeps one tracked catalog source owner and a distinct Studio catalog metadata generator while retiring the Packet 4 transitional advisory. | structure-check | `structure-swooper-catalog-index-target-topology` | Swooper catalog source and generator topology | `mods/mod-swooper-maps/src/maps/catalog`, `mods/mod-swooper-maps/scripts`, `.habitat/civ7/mapgen/studio/run-in-game/rules` | registered enforced | committed empty baseline after catalog cutover; behavior/Nx gates prove metadata-only target output classes | none |
| SA-10 | `studio-run-generator-integration` | Studio Run in Game invokes the manifest generator port with the manifest path from the request workspace. | Grit | `grit-studio-run-generator-port-boundary` | Studio server workflow source | `packages/studio-server/src`, `apps/mapgen-studio/src/server` | registered enforced | committed empty baseline after integration | none |
| SA-11 | `studio-run-deployment-snapshot-lease` | Run in Game deployment source is copy-only from generated mod to stable Studio-run mod id under the active runtime lease; runtime/generated filesystem state remains behavior evidence, not source topology. | Grit | `grit-studio-run-copy-deploy-boundary` | Studio deploy workflow source | `packages/studio-server/src`, `apps/mapgen-studio/src/server` | registered enforced | committed empty baseline after copy-deploy lands | none |
| SA-12 | `studio-run-runtime-observation` | Studio runtime observation calls Civ7 through `@civ7/direct-control` and consumes deployment snapshot/correlation records. | Grit | `grit-studio-run-direct-control-observation-boundary` | observation workflow source | `packages/studio-server/src`, `apps/mapgen-studio/src/server` | registered enforced | committed empty baseline after observation lands | none |
| SA-13 | `studio-run-attribution-report` | Attribution report source is owned by the runtime diagnostics/reporting boundary; request-workspace attribution files are runtime evidence and are only exposed through diagnostics lookup. | Grit + behavior evidence | `grit-studio-run-attribution-report-boundary` | attribution report source and diagnostics projection | `packages/studio-server/src`, `apps/mapgen-studio/src/server` | registered enforced | behavior and live endpoint evidence cover request-workspace records; no source-topology structure row is appropriate for runtime output | none |
| SA-14 | `studio-run-diagnostics-retention-guards` | All temporary packet-local Grit patterns are removed or promoted; authority rows SA-01 through SA-13 are green. | Habitat command check | `habitat-studio-run-runtime-authority-closure` | authority ledger and registered rule outputs | `.habitat`, `docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets`, packet write set | registered enforced | closure command checks all rows and blocks unresolved temporary patterns | none |

## Pattern Authority Requirements

Every Grit row above must carry a Pattern Authority record when implemented:

- lifecycle: `registered-enforced`;
- owner surface from the row;
- scan roots from the row;
- fixture strategy: positive examples, negative examples, parser edge cases, and
  false-positive controls;
- current-tree scan result: zero findings or committed baseline;
- baseline/introduction contract;
- hook-scope decision: `none`, unless an implementation packet separately
  proves pre-commit cost and staged-scope behavior;
- promotion/removal condition for any packet-local temporary pattern.

## Temporary Patterns

Temporary patterns may be introduced only to control a migration hazard before a
permanent row is active. They must name:

- owner packet;
- scan roots;
- hazard assertion;
- removal condition;
- replacement permanent row.

Packet 14 cannot invent missing Pattern Authority metadata. It only verifies
that each earlier packet either registered its permanent row or removed/promoted
its temporary pattern.
