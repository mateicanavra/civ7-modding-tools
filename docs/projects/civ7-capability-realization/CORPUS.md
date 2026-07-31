# Civ7 Capability Realization Cutover Corpus

**Status:** Frozen migration classification
**Date:** 2026-07-31

This is the finite source-to-destination ledger for the first coupled
capability-realization cutover. It is Engineer input only after the authority
packet passes its architecture, Habitat, and testing freeze.

Every participating source has exactly one terminal disposition:

- `relocate`: preserve one coherent owner while changing its project root;
- `combine`: preserve behavior by composing it into the named authority;
- `inline`: retain a projection only at its sole consumer;
- `delete`: preserve no implementation after its replacement proof passes.

Brace notation names an exact finite set. A directory path names one intact
subtree only when every current member has the same disposition and
destination; it is not recursive discovery authority for future members.
Destination paths use the selected shared service spine:
`src/service/modules/<module>`. No compatibility facade, parallel oRPC
contract package, or alternate runtime constructor survives the cutover.
The Studio API selects that shared source packet at `src/service`, but the
selected depth remains caller projection: it owns no independent semantic
service state, provider lifecycle, process startup, or nested proof.

## Direct Control: Managed Tuner

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-direct-control/src/session/{config,constants,discovery,execute,framing,health,listener-id,reconnect,session,socket,state}.ts` | relocate | `resources/civ7-tuner/providers/local-socket` | Provider `semantics`, `execution`, and `collaboration` proof |
| `packages/civ7-direct-control/src/session/types.ts` | combine | `resources/civ7-tuner/contract.ts` | Resource contract proof |
| `packages/civ7-direct-control/src/session/command-result.ts` | relocate | `resources/civ7-tuner/providers/local-socket/protocol.ts` | Provider semantics |
| `packages/civ7-direct-control/src/session/request-id.ts` | delete | Callers use the platform UUID facility directly | Calling command and live-proof suites |

The provider owns discovery, framing, socket lifetime, state selection,
reconnection, health, execution, and release. It exposes one ready Tuner value
through the resource contract. It does not expose gameplay helpers or a raw
package facade.

## Direct Control: Civ7 Control Service

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-direct-control/src/civ7-component-id.ts` | combine | `services/civ7-control/src/service/model/dto/primitives.ts` | Service contract proof |
| `packages/civ7-direct-control/src/validation.ts#boundedInteger` and `#validatePlayerId` | combine | `services/civ7-control/src/service/model/policy/bounded-input.ts` | Consuming module semantics |
| `packages/civ7-direct-control/src/validation.ts#validateIdentifier` | combine | `services/civ7-control/src/service/modules/world/model/policy/identifier.ts` | World semantics |
| `packages/civ7-direct-control/src/runtime/command-serialization.ts` | combine | `services/civ7-control/src/service/model/ports/tuner-script.ts` | Service execution proof |
| `packages/civ7-direct-control/src/runtime/map-size-type-source.ts` | combine | `services/civ7-control/src/service/modules/lifecycle/model/ports/map-size-observation.ts` | Lifecycle semantics |
| `packages/civ7-direct-control/src/runtime/probe.ts` | combine | `services/civ7-control/src/service/model/dto/runtime-probe.ts` and private `model/ports/tuner-script.ts` lowering | Service contract and execution proof |
| `packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts` | combine | `services/civ7-control/src/service/modules/readiness/model/ports/app-ui-snapshot.ts` and `services/civ7-control/src/service/modules/lifecycle/model/ports/app-ui-snapshot.ts` | Readiness and lifecycle semantics |
| `packages/civ7-direct-control/src/runtime/{playable-status,tuner-health}.ts` | combine | `services/civ7-control/src/service/modules/readiness` | Readiness semantics |
| `packages/civ7-direct-control/src/game-ui/loading-states.ts` | combine | `services/civ7-control/src/service/modules/lifecycle/model/dto/loading-state.ts`; native scripts reference the ambient Civ7 enum by name rather than preserving a second numeric table | Lifecycle contract and semantics |
| `packages/civ7-direct-control/src/play/action-panel-turn.ts` | combine | `services/civ7-control/src/service/modules/turn/model/ports/action-panel.ts` | Turn semantics |
| `packages/civ7-direct-control/src/play/notifications/blocking-observation.ts` | combine | `services/civ7-control/src/service/model/ports/blocking-notification.ts` | Cross-module blocker-observation semantics |
| `packages/civ7-direct-control/src/play/autoplay.ts` | combine | `services/mapgen-runs/src/service/modules/autoplay` with exact control-service private dependencies | MapGen-runs autoplay semantics |
| `packages/civ7-direct-control/src/play/turn-completion.ts` | combine | `services/civ7-control/src/service/modules/turn` | Turn semantics |
| `packages/civ7-direct-control/src/play/city` | combine | `services/civ7-control/src/service/modules/city` | City semantics |
| `packages/civ7-direct-control/src/play/diplomacy` | combine | `services/civ7-control/src/service/modules/diplomacy` | Diplomacy semantics |
| `packages/civ7-direct-control/src/play/display` and `src/play/map/visibility.ts` | combine | `services/civ7-control/src/service/modules/display` | Display semantics |
| `packages/civ7-direct-control/src/play/government` | combine | `services/civ7-control/src/service/modules/government` | Government semantics |
| `packages/civ7-direct-control/src/play/narrative` | combine | `services/civ7-control/src/service/modules/narrative` | Narrative semantics |
| `packages/civ7-direct-control/src/play/notifications/{advisor-warning,dismissal,view}.ts` | combine | `services/civ7-control/src/service/modules/notifications` | Notification semantics |
| `packages/civ7-direct-control/src/play/progression` | combine | `services/civ7-control/src/service/modules/progression` | Progression semantics |
| `packages/civ7-direct-control/src/play/ready/{city,unit}.ts` | combine | `services/civ7-control/src/service/modules/attention` | Attention semantics |
| `packages/civ7-direct-control/src/play/ready/move-preview.ts` and `src/play/tactical` | combine | `services/civ7-control/src/service/modules/strategy` | Strategy semantics |
| `packages/civ7-direct-control/src/play/unit` | combine | `services/civ7-control/src/service/modules/unit` | Unit semantics |
| `packages/civ7-direct-control/src/play/view/{camera,clean-frame}.ts` | combine | `services/civ7-control/src/service/modules/view` | View semantics |
| `packages/civ7-direct-control/src/play/map/{constants,full-grid,gameinfo,reads,surface-observation,types,validation}.ts`, `src/play/start-positions.ts`, and `src/play/summaries.ts` | combine | `services/civ7-control/src/service/modules/world` | World semantics and Swooper live proof |
| `packages/civ7-direct-control/src/setup/{constants,reads,start}.ts`, `src/setup/prepare.ts#{Civ7SetupOptionValue,Civ7PlayerSetupOptions,Civ7SavedGameConfigurationLoadRequestResult,Civ7SinglePlayerSetupValues,Civ7TargetModReconciliationResult,Civ7SetupMutationResult,requestCiv7SavedGameConfigurationLoad,applyCiv7SinglePlayerSetupIdentity,applyCiv7SinglePlayerSetupOptions,reconcileCiv7RequiredTargetMod,setupExpectationScriptSource,setupSnapshotSelectionFromInput,buildApplySinglePlayerSetupIdentityCommand,buildApplySinglePlayerSetupOptionsCommand,buildReconcileTargetModCommand,normalizeSinglePlayerSetupInput,assertPreparedSetupMatches}`, and `src/setup/restart.ts#beginCiv7Game` | combine | `services/civ7-control/src/service/modules/lifecycle` | Lifecycle semantics |

The service owns semantic admission, orchestration, outcomes, and public
procedures. Native lowering stays private behind module ports. No service
contract is extracted through a facade or reconstructed by a consumer.

## Direct Control: Qualified Host And Projection Owners

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| ScreenCaptureKit helper, cache, platform/TCC translation, capture, and release in `packages/civ7-direct-control/src/play/view/window-shot.ts` | combine | `resources/civ7-window-capture/providers/macos-screencapturekit` | Provider semantics, execution, and collaboration |
| View policy and public result projection in `packages/civ7-direct-control/src/play/view/window-shot.ts` | combine | `services/civ7-control/src/service/modules/view` | View semantics |
| Filesystem snapshot, rewrite detection, and fresh-byte mechanics in `packages/civ7-direct-control/src/proof/log-markers.ts` | combine | `apps/mapgen-studio/runtime/adapters/fresh-log-files.ts` | Studio cold-adapter execution |
| Marker selection, timeout, acceptance, and result policy in `packages/civ7-direct-control/src/proof/log-markers.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game` | Run-in-game semantics |
| Pure saved-configuration DTO, byte parsing, admission, and ordering in `packages/civ7-direct-control/src/setup/prepare.ts` | combine | `packages/civ7-save-files/src/{index,saved-config}.ts` | Package contract and semantics |
| Default-root selection, directory traversal, metadata reads, and byte reads behind `packages/civ7-direct-control/src/setup/prepare.ts#{DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR,listCiv7SavedGameConfigurations}` | combine | `apps/mapgen-studio/runtime/adapters/civ7-save-files.ts` | Studio cold-adapter execution and profile proof |
| `packages/civ7-direct-control/src/runtime/{inspection,inspection-constants,root-inspection}.ts` | inline | `plugins/cli/topics/game/src/adapters/tuner-inspection.ts` | CLI adapter proof |
| Runtime capability projection in `packages/civ7-direct-control/src/catalog/capabilities.ts` | inline | `plugins/cli/topics/game/src/commands/game/catalog.ts` | Catalog command proof |
| `packages/civ7-direct-control/src/setup/restart.ts#{restartCiv7Game,restartCiv7GameAndBegin}` | inline | `plugins/cli/topics/game/src/commands/game/restart.ts` | Restart command proof |

Runtime profiles select the Tuner and window-capture providers. The Studio app
selects the cold saved-config and fresh-log bindings. The API, services, and
CLI commands consume only ready typed clients or capabilities.

## Direct Control: Deletion

| Exact source | Disposition | Replacement proof |
| --- | --- | --- |
| `packages/civ7-direct-control/src/{direct-control-error-boundary,direct-control-error,error-message}.ts` | delete | Resource failures plus module-native error maps |
| `packages/civ7-direct-control/src/timing.ts` | delete | Effect schedule and cancellation proof in consuming modules |
| `packages/civ7-direct-control/src/catalog/capabilities.ts#loadCiv7OfficialResourceCapabilities` | delete | Knip and negative consumer search |
| `packages/civ7-direct-control/src/proof/operation-telemetry.ts` | delete | Knip and negative consumer search |
| `packages/civ7-direct-control/src/live-control.ts` | delete | Runtime binding and service execution proof |
| `packages/civ7-direct-control/src/index.ts` and the package root | delete | Export-map removal, Knip, Narsil references, and the coupled graph |

The completed controller-island retirement and its finite native-fact
extraction receipt are recorded below. No current same-realm consumer earns a
controller mod.

## Direct-Control Consumer Closure

The current production graph contains 44 source or script importers of
`@civ7/direct-control`. Every importer edge has one terminal replacement below.
Five adjacent conceptual consumer files across four rows marked `†` encode or
project the same contract without a direct import; they are included so the
source closure does not preserve a parallel shape. The finite brace sets name
current files, not future path acquisition. Only raw Tuner diagnostics keep
direct resource access; every semantic command or projection consumes a
service client.

| Exact current consumer | Disposition | Terminal consumer boundary |
| --- | --- | --- |
| `apps/mapgen-studio/src/server/studio/context.ts` | delete | Shared runtime supplies control and MapGen-runs clients to the Studio API context selected by `rawr.mapgen-studio.ts` and its profile |
| `apps/mapgen-studio/src/server/studio/engines.ts` | combine | Pure parsing/plans/comparison in `packages/studio-run-workspace`, MapGen-runs bindings, and Studio filesystem adapters `{studio-run-files,fresh-log-files,swooper-map-config-source}`; mod installation moves to the Swooper realization adapter; the mixed source file then disappears |
| `apps/mods/map/swooper-physics/scripts/live/verify-final-surface-parity.ts` | combine | Recipe-owned `plugins/mod/map/swooper-physics/test/recipes/standard/parity/final-surface-parity.live.test.ts`, consuming the control world client and Studio API client through the realization-owned live target |
| `apps/mods/map/swooper-physics/scripts/live/verify-studio-run-in-game-live.ts` | combine | The Studio API client through the realization-owned live target; the Studio app selects control, MapGen-runs, and `{civ7-save-files,studio-run-files,fresh-log-files}`, while the shared runtime binds those capabilities and provisions Tuner |
| `plugins/mod/map/swooper-physics/src/recipes/standard/parity/live.ts` | relocate | `apps/mods/map/swooper-physics/runtime/parity/live.ts`, consuming the control world client at realization time |
| `packages/studio-contract/src/{civ7,live}.ts` `†` | combine | Exact Studio API control-module contracts over the public control-service client |
| `packages/studio-contract/src/shared.ts` `†` | inline | Exact owning Studio API module contracts |
| `packages/studio-server/src/context.ts` `†` | combine | Studio API context containing runtime-supplied public clients |
| `packages/studio-server/src/liveGame/statusRead.ts` | combine | Studio API live-status projection over control clients |
| `packages/studio-server/src/ports/Civ7WorkflowControl.ts` | combine | MapGen-runs public control dependency and run-in-game private ports |
| `packages/studio-server/src/router/index.ts` | combine | Studio API authoring, control, runs, and studio module routers |
| `packages/studio-server/src/services/Civ7TunerClient.ts` | delete | Runtime-supplied control client and API-owned cold requirements |
| `packages/studio-server/src/services/Civ7TunerSession.ts` | delete | Runtime-provisioned local-socket Tuner provider |
| `packages/studio-server/src/services/StudioConfig.ts` `†` | combine | Studio app profile and API cold configuration projection |
| `plugins/cli/topics/game/src/adapters/control/service-client.ts` | delete | Runtime-supplied public control-service client |
| `plugins/cli/topics/game/src/adapters/play/direct-control.ts` | combine | Topic-local play-input projection over control DTOs; endpoint selection moves to the runtime profile |
| `plugins/cli/topics/game/src/commands/game/{ai/loaded-levers,gameinfo,map/starts,map/visibility}.ts` | combine | Control world client, with display client added for visibility |
| `plugins/cli/topics/game/src/commands/game/autoplay.ts` | combine | MapGen-runs autoplay client |
| `plugins/cli/topics/game/src/commands/game/catalog.ts` | inline | Command-owned catalog projection over the ready Tuner resource |
| `plugins/cli/topics/game/src/commands/game/exec.ts` | combine | Runtime-injected `Civ7Tuner.execute` |
| `plugins/cli/topics/game/src/commands/game/health.ts` | combine | `Civ7Tuner.health` for socket state and control readiness client for semantic readiness |
| `plugins/cli/topics/game/src/commands/game/inspect.ts` | combine | Topic-local `adapters/tuner-inspection.ts` over the ready Tuner resource |
| `plugins/cli/topics/game/src/commands/game/play/choose-narrative.ts` | combine | Control notifications and narrative clients |
| `plugins/cli/topics/game/src/commands/game/play/notifications/list.ts` | combine | Control notifications client |
| `plugins/cli/topics/game/src/commands/game/play/{ready-city,unit/promotion-readiness,unit/ready}.ts` | combine | Control attention client |
| `plugins/cli/topics/game/src/commands/game/play/rehydrate.ts` | combine | Control readiness, attention, and notifications clients |
| `plugins/cli/topics/game/src/commands/game/play/{settlement-recommendations,unit/move-preview}.ts` | combine | Control strategy client |
| `plugins/cli/topics/game/src/commands/game/restart.ts` | inline | Ready Tuner resource for raw restart and control lifecycle client for begin/readback |
| `plugins/cli/topics/game/src/commands/game/status.ts` | combine | Control readiness client |
| `plugins/cli/topics/game/src/commands/game/watch.ts` | combine | Control notifications and attention clients |
| `services/civ7-control/src/service/model/dto/correlation.ts` | combine | Service/resource-owned bounded failure vocabulary |
| `services/civ7-control/src/service/model/policy/direct-control-failure.ts` | combine | Service-owned dispatch-status policy derived from private module-port failures |
| `services/civ7-control/src/service/model/ports/{context,direct-control}.ts` | delete | Public client requirements plus exact module-private DTO and port owners |
| `services/civ7-control/src/service/model/ports/lifecycle.ts` | combine | Lifecycle module-private ports |
| `services/civ7-control/src/service/modules/attention/router/{current,priorities}.ts` | combine | Attention-local DTOs and private Tuner-backed ports |
| `services/civ7-control/src/service/modules/display/router/explore-request.ts` | combine | Display-local DTO and port |
| `services/civ7-control/src/service/modules/lifecycle/router/single-player-start.ts` | combine | Lifecycle-local ports and loading-state DTO |
| `services/civ7-control/src/service/modules/readiness/router/current.ts` | combine | Readiness-local observation port |
| `services/civ7-control/src/service/modules/world/router/{current,map-reads}.ts` | combine | World-local DTOs and private observation ports |

The only direct Tuner command consumers after cutover are `exec`,
resource-level `health`, catalog inspection, `inspect`, and the raw restart
half. `status`, `watch`, map reads, autoplay, and play helpers are semantic
control consumers. Test importers move with the behavior classified in the
proof corpus. Dependency edges are removed from
`apps/mapgen-studio/package.json`,
`apps/mods/map/swooper-physics/package.json`,
`packages/studio-server/package.json`,
`plugins/cli/topics/game/package.json`, and
`services/civ7-control/package.json`.

## Control Service Substrate Migration

After the corrected shared packet is constructible,
`services/civ7-control` is reconstructed directly on that selected service
shape. Its finite module set is
`{attention,city,diplomacy,display,government,lifecycle,narrative,notifications,progression,readiness,strategy,turn,unit,view,world}`.
There is no facade, public contract subpath, public router, or second service
constructor.

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `services/civ7-control/{AGENTS.md,project.json,tsconfig.json,tsconfig.test.json,vitest.config.ts}` | combine | Same service envelope after the accepted service generator owns its closed root and proof programs |
| `services/civ7-control/{scripts/build.mjs,tsconfig.tools.json,tsup.config.ts}` | delete | Shared service build target and generated project configuration |
| `services/civ7-control/src/client.ts` | combine | `services/civ7-control/src/client.ts`, the sole public service face |
| `services/civ7-control/src/{contract,index}.ts` | delete | Contract composition and implementation remain private under `src/service`; consumers import only `src/client.ts` through the package root |
| `services/civ7-control/src/service/context.ts` | combine | `services/civ7-control/src/service/base.ts` |
| `services/civ7-control/src/service/{base,contract,impl,router}.ts` | combine | Matching accepted service anchors under `services/civ7-control/src/service` |
| `services/civ7-control/src/service/schema/typebox-standard-schema.ts` | delete | Native oRPC 2 contract schemas and TypeBox's accepted Standard Schema path |
| `services/civ7-control/src/service/middleware/{mutation-procedure-key,mutation-procedure,mutation-proof-boundary,mutation-readiness}.ts` | combine | `services/civ7-control/src/service/middleware` under the accepted service context and native error lineage |
| `services/civ7-control/src/service/middleware/controller-admission.ts` | delete | Runtime binding supplies ready Tuner and window-capture capabilities; no controller mode enters the service context |
| `services/civ7-control/src/service/model/dto/controller-proof.ts` | delete | Resource readiness and module outcomes are the only admitted evidence |
| `services/civ7-control/src/service/model/dto/primitives.ts` | combine | Matching service-owned DTO leaf |
| `services/civ7-control/src/service/model/policy/{metadata,mutation-result}.ts` | combine | Matching service-owned policy leaves |
| `services/civ7-control/src/service/model/errors/control.ts` | combine | Native oRPC 2 error maps declared by the exact module contracts that emit them |
| `services/civ7-control/src/service/modules/{attention,city,diplomacy,display,government,lifecycle,narrative,notifications,progression,readiness,strategy,turn,unit,view,world}/contract` | combine | Matching module `contract/index.ts` owners |
| `services/civ7-control/src/service/modules/{attention,city,diplomacy,display,government,lifecycle,narrative,notifications,progression,readiness,strategy,turn,unit,view,world}/module.ts` | combine | Matching accepted module operation-contract bindings |
| `services/civ7-control/src/service/modules/{city,diplomacy,government,narrative,notifications,turn,unit,view}/model` | combine | Matching module-qualified model owners |
| `services/civ7-control/src/service/modules/{attention,city,diplomacy,display,government,lifecycle,narrative,notifications,progression,readiness,strategy,turn,unit,view,world}/router/index.ts` | combine | Matching module-root `router.ts` |
| `services/civ7-control/src/service/modules/city/router/{population-placement,production-choice,town-focus}.ts`, `diplomacy/router/{first-meet-response,response}.ts`, `display/router/queue.ts`, `government/router/{celebration-choice,choice}.ts`, `narrative/router/choice.ts`, `notifications/router/{advisor-warning-request,dismiss,queue}.ts`, `progression/router/{attribute,choice,dashboard-current,target,tradition,traditions-current}.ts`, `strategy/router/{civilian-route-triage,formation-snapshot,front-summary,tactical-reads}.ts`, `turn/router/complete.ts`, `unit/router/{command,target-action}.ts`, and `view/router/{appshot-capture,camera-focus}.ts` | combine | Matching `<operation>.router.ts` leaves; the Tuner-importing leaves are classified in Direct-Control Consumer Closure |
| `packages/civ7-control-orpc/dist` | delete | Ignored generated cleanup only; the deleted tracked package contributes no contract, behavior, or migration authority |

Each module's current contract leaves combine into its
`contract/index.ts`; `module.ts` remains the operation-contract binding;
current router operation leaves become `<operation>.router.ts`; and each
`router/index.ts` combines into the module-root `router.ts`. The exact target
router set is:

| Module | Exact router operations |
| --- | --- |
| `attention` | `current`, `priorities` |
| `city` | `population-placement`, `production-choice`, `town-focus` |
| `diplomacy` | `first-meet-response`, `response` |
| `display` | `explore-request`, `queue` |
| `government` | `celebration-choice`, `choice` |
| `lifecycle` | `single-player-start` |
| `narrative` | `choice` |
| `notifications` | `advisor-warning-request`, `dismiss`, `queue` |
| `progression` | `attribute`, `choice`, `dashboard-current`, `target`, `tradition`, `traditions-current` |
| `readiness` | `current` |
| `strategy` | `civilian-route-triage`, `formation-snapshot`, `front-summary`, `tactical-reads` |
| `turn` | `complete` |
| `unit` | `command`, `target-action` |
| `view` | `appshot-capture`, `camera-focus` |
| `world` | `current`, `map-reads` |

## Completed Controller Island Retirement

Commit `8d0d4983ba` deleted all 52 tracked bridge files. The bridge never became
a product, service, API, or mod application. Its native Civ7 execution-realm
observations survive only as finite reference evidence; all callable behavior
is owned by the control service.

| Exact historical source | Completed disposition | Destination or replacement |
| --- | --- | --- |
| `mods/mod-civ7-intelligence-bridge/src/controller/game-ui.ts` and `src/controller/game-ui/{attention,map,strategy-front,unit-command}.ts` | combine | Verified native API and execution-realm facts in `docs/system/direct-control/SIEVE-ENGINE-REFERENCE.md`; the executable sources are then removed |
| `mods/mod-civ7-intelligence-bridge/src/controller/{intelligence-bridge,service-types}.ts` | delete | Accepted control-service client plus runtime-supplied resources; no global bridge or extracted facade survives |
| `mods/mod-civ7-intelligence-bridge/src/{modinfo.ts,ui/civ7-intelligence-bridge.ts}` | delete | No controller mod is realized |
| `mods/mod-civ7-intelligence-bridge/{.gitignore,AGENTS.md,package.json,project.json,tsconfig.json,tsup.config.ts}` | delete | Negative workspace, export-map, and package-reference proof |
| `mods/mod-civ7-intelligence-bridge/scripts/{clean-generated-artifacts,generate-mod-artifacts}.ts` | delete | No controller artifact is generated |
| `mods/mod-civ7-intelligence-bridge/mod/civ7-intelligence-bridge.modinfo` | delete | Generated residue, not migration authority |

The same commit preserved accepted native facts in
`docs/system/direct-control/SIEVE-ENGINE-REFERENCE.md`, amended ADR-007, and
recorded the future-controller re-entry trigger. `git ls-files
mods/mod-civ7-intelligence-bridge` is empty; ignored dependency residue is not a
product owner or corpus member.

## Vendor Cutover And Shared-Habitat Boundary

Participating capability owners target one coupled vendor family: `@orpc/*`
`2.0.0-beta.20`, official `@orpc/experimental-effect`, Effect
`4.0.0-beta.101`, and TypeBox `1.3.8`. The shared-Habitat workstream owns
the root-vendor transition required before those owners can cut over.

| Exact current source | Disposition | Exact destination or replacement |
| --- | --- | --- |
| `services/civ7-control/package.json` | combine | Closed service package export for `src/client.ts` plus the selected vendor family |

No `tools/habitat` source, package configuration, proof, runtime, command, or
service-kind implementation is assigned a disposition by this capability
cutover. Habitat is a consumer of the shared vendor substrate and belongs to
the separate shared-Habitat workstream; this ledger neither invents an unowned
Habitat target nor grants this cutover permission to edit Habitat.

That shared workstream also owns the coupled dispositions for
`package.json#catalog`, `package.json#patchedDependencies`,
`patches/effect-orpc@0.5.0.patch`, `bun.lock`, and
`tools/habitat/package.json`. They are prerequisites, not unowned mutations
smuggled into this corpus.

The current service packets at
`.habitat/blueprints/service/{require_orpc_error_authority,require_service_anchor_exports,require_service_boundary_platform_independence,require_service_context_boundaries,require_service_contract_authority,require_service_contract_property_descriptions,require_service_effect_error_authority,require_service_module_isolation,require_service_orpc_composition,require_service_proof_isolation,require_service_public_consumer_sealing,require_service_router_authorship,require_service_spine_topology}`
and `.habitat/blueprints/service/README.md` are likewise outside this cutover
and remain unchanged until the shared-Habitat workstream accepts its corrected
successor packet and exact imported portable inventory.

## CLI Shell, Topics, And Runtime Binding

`apps/cli` remains commandless. Commands live only in the finite topic set
`plugins/cli/topics/{data,docs,game,git-mod,mapgen}`, nested below each topic's
`src/commands/<topic>`. `apps/cli/package.json#oclif.plugins` is the sole Oclif
discovery registry and is source-related to the app definition; it is not a
second topic-membership authority.

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/cli/{AGENTS.md,CHANGELOG.md,package.json,project.json,tsconfig.json}` | combine | Accepted composed app and CLI-shell envelope at `apps/cli` |
| `apps/cli/TESTING.md` | combine | `docs/system/TESTING.md` and CLI-specific links under `docs/system/cli` |
| `apps/cli/civ7.ts` | combine | `apps/cli/civ7.ts`, the sole authored role entrypoint using native Oclif `run` through the shared harness |
| `apps/cli/bin/run.js` | combine | One executable shim delegating to `apps/cli/civ7.ts`; it owns no startup plan |
| `plugins/cli/topics/{data,docs,git-mod}/{AGENTS.md,package.json,project.json,tsconfig.json,src}` | combine | Matching accepted topic roots under `plugins/cli/topics`; git-mod retains command projection while local-mod filesystem operations move to `apps/cli/runtime/adapters/local-mods.ts` |
| `plugins/cli/topics/game/{AGENTS.md,package.json,project.json,tsconfig.json,src/index.ts}` | combine | Accepted `game` topic envelope and public plugin entry |
| `plugins/cli/topics/game/src/adapters/control/service-client.ts` | delete | Runtime command context supplies the public control-service client |
| `plugins/cli/topics/game/src/adapters/play/direct-control.ts` | combine | `plugins/cli/topics/game/src/adapters/play/semantic-envelope.ts`; endpoint and provider selection move to the app profile |
| `plugins/cli/topics/game/src/adapters/{local-data,map,view}` and `src/adapters/play/semantic-envelope.ts` | combine | Matching topic-local projection adapters |
| `plugins/cli/topics/game/src/commands/game` | combine | Same nested command tree consuming declared runtime requirements and public clients |

`rawr.civ7.ts`, `runtime/config.ts`, `runtime/processes.ts`, and exact selected
profile leaves are generated from the accepted app packet rather than migrated
from an existing owner. `rawr.civ7.ts` alone owns topic membership and semantic
adapter identities. Profiles own only provider, configuration, and process
facts. `civ7.ts` selects one app, one profile, and the CLI role and delegates
exactly once to `startApp`; it owns no assembly or runtime behavior beyond that
selection. The shell uses one shared Oclif harness and one managed command
scope. Help, version, and unknown-command paths acquire no live capability; a
selected command binds only its declared clients. No topic constructs a control
client, chooses a provider, imports the app, or introduces a second command or
topic registry.

## Studio Public Route Ledger

Every current caller-facing route is preserved at its exact route identity.
The cutover changes contract and implementation ownership, not the public
procedure tree. Existing TypeBox input/output schemas and declared error
identities remain the parity oracle until a later product-contract change
explicitly replaces one. No compatibility alias or second contract is added.

| Exact public route | Route disposition | Exact API contract owner | Underlying authority |
| --- | --- | --- | --- |
| `civ7.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/status.ts` | Control-service readiness client |
| `civ7.mapSummary` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/map-summary.ts` | Control-service world client |
| `civ7.gameInfo` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/game-info.ts` | Control-service world client |
| `civ7.autoplay` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/autoplay.ts` | MapGen-runs autoplay client |
| `civ7.setupConfig` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/setup-config.ts` | Control-service lifecycle client |
| `civ7.savedConfigs` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/saved-configs.ts` | App-selected `civ7-save-files` adapter |
| `civ7.setupCatalog` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/setup-catalog.ts` | App-selected `civ7-official-data` adapter and profile-selected roots |
| `civ7.live.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-status.ts` | Control-service readiness and lifecycle clients |
| `civ7.live.snapshot` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-snapshot.ts` | Control-service world client |
| `civ7.live.entities` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-entities.ts` | Control-service world client |
| `civ7.live.gameInfo` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-game-info.ts` | Control-service world client |
| `civ7.attention.{current,priorities}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `attention` contract and client |
| `civ7.city.population.place.{check,request}`; `civ7.city.production.choice.{check,request}`; `civ7.city.townFocus.{change,review}.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `city` contract and client |
| `civ7.diplomacy.firstMeet.response.{check,request}`; `civ7.diplomacy.response.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `diplomacy` contract and client |
| `civ7.display.queue.{current,close}`; `civ7.display.explore.request` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `display` contract and client |
| `civ7.government.choice.{check,request}`; `civ7.government.celebration.choice.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `government` contract and client |
| `civ7.lifecycle.singlePlayer.start` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `lifecycle` contract and client |
| `civ7.narrative.choice.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `narrative` contract and client |
| `civ7.notifications.advisorWarning.viewed.{check,request}`; `civ7.notifications.dismiss.{check,request}`; `civ7.notifications.queue.current`; `civ7.notifications.queue.dismiss.request` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `notifications` contract and client |
| `civ7.progression.{dashboard,traditions}.current`; `civ7.progression.{technology,culture}.choice.{options,check,request}`; `civ7.progression.{technology,culture}.target.{check,request}`; `civ7.progression.attribute.{purchase,review}.{check,request}`; `civ7.progression.tradition.{change,review}.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `progression` contract and client |
| `civ7.readiness.current` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `readiness` contract and client |
| `civ7.strategy.{civilianRouteTriage,formationSnapshot,frontSummary,battlefieldScan,destinationAnalysis,targetCandidates}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `strategy` contract and client |
| `civ7.turn.complete.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `turn` contract and client |
| `civ7.unit.{resettle,upgrade}.{check,request}`; `civ7.unit.target.action.{check,request}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `unit` contract and client |
| `civ7.view.appshot.capture`; `civ7.view.camera.focus` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `view` contract and client |
| `civ7.world.{current,plot,grid}` | retain through whole-contract composition | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/civ7-control.ts` | Public control-service `world` contract and client |
| `mapConfigs.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/map-config-status.ts` | MapGen-runs save-deploy client |
| `mapConfigs.saveDeploy` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/map-config-save-deploy.ts` | MapGen-runs save-deploy client |
| `runInGame.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-status.ts` | MapGen-runs run-in-game client |
| `runInGame.cancel` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-cancel.ts` | MapGen-runs run-in-game client |
| `runInGame.diagnostics` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-diagnostics.ts` | MapGen-runs run-in-game client |
| `runInGame.start` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-start.ts` | MapGen-runs run-in-game client |
| `studio.serverInfo` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/server-info.ts` | Shared process identity in API context |
| `studio.operations.current` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/operations-current.ts` | MapGen-runs client |
| `studio.events.watch` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/events-watch.ts` | API-owned projection over run and control observations |
| `recipeDag.get` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/recipe-dag.ts` | Swooper definition-authoring projection |

The finite brace expressions above expand to all 70 current control-service
route leaves, including `lifecycle`, which the legacy composition comment
omits. The root API contract composes Studio-owned leaves at their existing
paths. The control module composes the public control-service contract subtree
whole through `civ7-control.ts` and delegates through the matching public
client. It does not redeclare those schemas, pick types from the service
contract, or import the service router or private source. Other API leaves may
call a public service client or an app-selected cold adapter, but never import
a provider implementation or app.

## Studio Contract

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/studio-contract/src/mapConfigEnvelope.ts` | relocate | `packages/mapgen-config/src/map-config-envelope.ts`, exported through `src/index.ts` | Package contract and semantics |
| Materialization, launch-envelope, and exact-authorship schemas in `packages/studio-contract/src/runInGame.ts` | combine | Pure parse/serialize/compare owners in `packages/studio-run-workspace/src/{authorship-evidence,launch-envelope,materialization-evidence}.ts` | Package contract and semantics |
| Run phases, status, diagnostics, admission, cancellation, and public outcome in `packages/studio-contract/src/{runInGame,runInGamePublic}.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game/contract` | MapGen-runs contract and semantics |
| Save/deploy phases, status, and failure evidence in `packages/studio-contract/src/mapConfigs.ts` | combine | `services/mapgen-runs/src/service/modules/save-deploy/contract` | MapGen-runs contract and semantics |
| Studio runtime failure vocabulary in `packages/studio-contract/src/errors/failure.ts` | combine | `services/mapgen-runs/src/service/model/errors/failure.ts` | MapGen-runs contract |
| oRPC procedures in `packages/studio-contract/src/{civ7,live,mapConfigs,runInGame,studio}.ts` | combine | Exact `plugins/server/api/mapgen-studio/src/service/modules/{control,runs,studio}/contract` owner | API contract and projection |
| `packages/studio-contract/src/liveGame/model.ts` | combine | API control module model | API projection |
| `packages/studio-contract/src/recipeDag/{contract,errors,schema}.ts` | relocate | API authoring module contract | API contract and projection |
| `packages/studio-contract/src/shared.ts` | inline | Exact owning API module contracts | API contract proof |
| `packages/studio-contract/src/{errors.ts,errors/errorData.ts}` | combine | API error projection | API projection |
| `packages/studio-contract/src/lib/typeboxStandardSchema.ts` and `src/index.ts` | delete | Shared oRPC/TypeBox substrate and finite package exports |

The portable map-configuration envelope survives under the neutral
`@swooper/mapgen-config` package identity. It owns no oRPC contract, Studio
vocabulary, child source directory, or broad barrel. The
`packages/studio-contract` identity retires after all other rows move.

## Studio Run Authority

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/studio-server/src/workflows/{AutoplayWorkflow,RunInGameWorkflow,SaveDeployWorkflow}.ts` | combine | Exact `services/mapgen-runs/src/service/modules/{autoplay,run-in-game,save-deploy}` service | Module semantics |
| `packages/studio-server/src/workflows/workflowTransitions.ts` | inline | The three owning modules | Module semantics |
| `packages/studio-server/src/ports/Civ7WorkflowControl.ts` | combine | MapGen-runs public control dependency plus private module ports | Service contract and module semantics |
| `packages/studio-server/src/ports/{DeployRunner,EvidenceBuilder,MapConfigStore,RunInGameArtifactGenerator,ScriptingLog}.ts` | combine | MapGen-runs public authored-config, realization, and fresh-log dependency descriptors plus matching service-private ports; Studio selects `{swooper-map-config-source,studio-run-files,fresh-log-files}`, the realization selects `local-mod-install`, and the shared runtime performs both bindings | Service contract, fake-port semantics, and runtime binding proof |
| `packages/studio-server/src/ports/RuntimeObservation.ts` | combine | Run-in-game module observation port | Run-in-game semantics |
| `packages/studio-server/src/operationRuntime/launchEnvelope.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game/model/policy/launch-admission.ts` | Run-in-game semantics |
| `packages/studio-server/src/operationRuntime/{attributionReport,diagnostics,privateJson}.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game` | Run-in-game diagnostics semantics |
| `packages/studio-server/src/operationRuntime/ports.ts` | combine | Exact MapGen-runs construction dependencies and service-private `model/ports` owners | Service contract and fake-port semantics |
| `packages/studio-server/src/operationRuntime/diagnosticsWriteGates.ts` | combine | MapGen-runs service `model/actors` | Service execution |
| Record identity, parsing, lifecycle, lease, terminalization, and retention policy in `packages/studio-server/src/operationRuntime/operationRecords.ts` | combine | MapGen-runs service `model/{actors,entities,policy,ports}` | Service semantics and execution |
| Workspace directory, record, lease-lock, heartbeat-file, diagnostics-file, and retention-delete effects in `packages/studio-server/src/operationRuntime/operationRecords.ts` | combine | `apps/mapgen-studio/runtime/adapters/studio-run-files.ts` | Studio cold-adapter execution |
| `packages/studio-server/src/operationRuntime/ids.ts` | combine | MapGen-runs service `model/policy` | Service semantics |
| `packages/studio-server/src/operationRuntime/projection.ts` | combine | `services/mapgen-runs/src/service/modules/{run-in-game,save-deploy}/model/projection.ts` | Module semantics |
| `packages/studio-server/src/operationRuntime/model.ts` | combine | Module-owned MapGen-runs `model/{entities,policy}` leaves; no shared model file survives | Service semantics |
| `packages/studio-server/src/operationRuntime/registry.ts` | combine | Module-owned MapGen-runs `model/{actors,entities,policy}` admission, transition, cancellation, and event-state owners; no second registry authority survives | Service semantics and execution |
| `packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts` | combine | `services/mapgen-runs/src/client.ts`, exact module routers, and service `model/{actors,entities,policy,ports}`; the monolith is reconstructed rather than wrapped | Service semantics and execution |
| `packages/studio-server/src/{runInGamePublic,saveDeployPublic}.ts` | combine | Exact MapGen-runs run-in-game and save-deploy modules | Service contract and module semantics |
| `packages/studio-server/src/ports/{index,workflowTypes}.ts` and `src/operationRuntime/index.ts` | delete | Typed service clients, exact private ports, and app-adapter proof |

The closed public operation set is `autoplay.autoplay`,
`operations.current`, `run-in-game.{start,status,cancel,diagnostics}`, and
`save-deploy.{start,status}`. Service semantics proof mirrors those operation
leaves exactly; process-scoped state and lifecycle remain in
`test/execution/root.test.ts`.

`resources/mapgen-run-runtime` is not created. Runtime records, retention,
cancellation, leases, and event state are service facts, not a provider-neutral
resource capability. Only workspace filesystem effects cross the service port
into the Studio `studio-run-files` adapter.

The existing `packages/studio-run-workspace` identity remains pure:
`src/{correlation,paths}.ts` and the parse, plan, serialize, digest, and compare
fragments of `src/generationManifest.ts` remain package-owned. The
`readStudioRunGenerationManifest` and `writeStudioRunGenerationManifest`
filesystem fragments combine into
`apps/mapgen-studio/runtime/adapters/studio-run-files.ts`; path injection does
not authorize a package filesystem effect.

The save/deploy module owns `prepare -> write -> deploy`, public phase evidence,
rollback policy, and once-only release. The Swooper definition owns pure config
admission and serialization; the Studio `swooper-map-config-source` adapter
owns the opaque prepared write/rollback transaction. The Swooper realization
owns deployment. These remain distinct semantic dependencies; deployment never
absorbs source mutation.

## Studio API Projection

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/studio-server/src/context.ts` | combine | `plugins/server/api/mapgen-studio/src/service/base.ts` | API contract and projection |
| `packages/studio-server/src/contract/index.ts` | combine | `plugins/server/api/mapgen-studio/src/service/contract.ts` plus exact module contracts | API contract and projection |
| `packages/studio-server/src/router/index.ts` | combine | `plugins/server/api/mapgen-studio/src/api.ts` plus `src/service/{impl,router}.ts` and exact module composition | API router projection |
| `packages/studio-server/src/errors.ts` and `src/errors` | combine | Exact API projection errors under `src/service/modules` | API error projection |
| `packages/studio-server/src/services/StudioEventHub.ts` | combine | API studio projection module under `src/service/modules/studio` | API-owned scoped execution |
| `packages/studio-server/src/liveGame/statusRead.ts` | combine | API control projection module under `src/service/modules/control` | API control projection |
| `packages/studio-server/src/liveGame/watcher.ts` | combine | API control watcher under `src/service/modules/control` | API-owned scoped execution |
| `packages/studio-server/src/recipeDag/service.ts` and `apps/mapgen-studio/src/server/recipeDag/service.ts` | combine | API authoring projection module under `src/service/modules/authoring` | API authoring projection |
| `packages/studio-server/src/services/{Civ7TunerClient,Civ7TunerSession}.ts` | delete | Runtime-supplied control client and Tuner provider |
| `packages/studio-server/src/services/StudioConfig.ts` | combine | Studio runtime configuration and exact profile facts; no semantic service state enters the API projection |
| `packages/studio-server/src/{handler,index,runtime}.ts`, `src/workflows/index.ts`, and the package root | delete | Shared API/runtime harness, Knip, and coupled graph |

The API plugin owns caller projection only at the closed source surface
`src/{api,client,service}` with the selected shared packet at
`src/service/{base,contract,impl,router,modules}`. That selected service-source
depth imports public service clients, not service-private source, and owns no
nested proof or independent semantic service authority. It chooses no
provider, transport, server mount, process, or application lifecycle.

## Studio Web And App

The selected web projection below receives browser application source from
`apps/mapgen-studio`. It may continue consuming
`packages/mapgen-studio-ui` as a component library; this corpus selects no
relocation or web-plugin identity for that separate package.

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `apps/mapgen-studio/src/{App.tsx,app,browser-runner,features,index.css,lib,main.tsx,recipes,shared,shims,stores,ui,vite-env.d.ts}` | relocate | Matching paths under `plugins/web/app/mapgen-studio/src` | Web `views`, `interactions`, and `execution` proof |
| `apps/mapgen-studio/{components.json,index.html,vite.config.ts,tsconfig.json,tsconfig.tools.json}` | relocate | `plugins/web/app/mapgen-studio` project envelope | Web build and app entrypoint proof |
| `apps/mapgen-studio/src/server/mapConfigs/requestValidation.ts` | combine | MapGen-runs save-deploy admission | Save-deploy semantics |
| `apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts` | combine | MapGen-runs run-in-game verification | Run-in-game semantics |
| Pure evidence schemas, digesting, marker and failure classification, bounded-log parsing, and comparison in `apps/mapgen-studio/src/server/runInGame/{authorshipEvidence,evidenceTypes,fileEvidence,logFailure,swooperLogEvidence}.ts` | combine | `packages/studio-run-workspace/src/{authorship-evidence,log-failure,materialization-evidence,run-evidence}.ts` | Package contract and semantics |
| Exact-authorship acceptance, unresolved-link, recovery, timeout, retry, and polling policy in the same Run-in-Game sources | combine | `services/mapgen-runs/src/service/modules/run-in-game/model/policy` | Run-in-game semantics |
| Filesystem reads in `apps/mapgen-studio/src/server/runInGame/{fileEvidence,logFailure,swooperLogEvidence}.ts` | combine | `apps/mapgen-studio/runtime/adapters/{studio-run-files,fresh-log-files}.ts` | Studio cold-adapter execution |
| `apps/mapgen-studio/src/server/mapConfigs/deploy.ts` | combine | `apps/mods/map/swooper-physics/runtime/targets.ts` using `runtime/adapters/local-mod-install.ts`; `src/server/studio/engines.ts` is already classified as one mixed source in Direct-Control Consumer Closure | Mod realization artifact, deployment, and live proof |
| Caller-facing setup-catalog DTO and route projection in `apps/mapgen-studio/src/server/civ7Resources/catalog.ts` | combine | Studio API authoring module | API authoring projection |
| Official-root selection, traversal, reads, XML parsing, admission, and ordering in `apps/mapgen-studio/src/server/civ7Resources/catalog.ts` | combine | `apps/mapgen-studio/runtime/adapters/civ7-official-data.ts` | Studio cold-adapter execution and profile proof |
| `apps/mapgen-studio/src/server/studio/{context,engines}.ts` manual construction | delete | Shared runtime compiler and exact app adapter selection |
| `apps/mapgen-studio/src/server/daemon/daemon.ts` server construction, mounts, static serving, and disposal | delete | Shared server/web harness execution proof |
| Daemon configuration/process facts and role selection in `apps/mapgen-studio/src/server/daemon/daemon.ts` | combine | `apps/mapgen-studio/{runtime/config.ts,runtime/processes.ts,server.ts,web.ts,dev.ts}` | App profile and entrypoint proof |
| `apps/mapgen-studio/{Caddyfile,railway.json}` | combine | Qualified Studio app deployment configuration | App definition and delivery proof |
| `apps/mapgen-studio/{package.json,project.json}` | combine | Qualified app spine selected in `TOPOLOGY.md` | App definition, profile, and entrypoint proof |
| `apps/mapgen-studio/tsconfig.test.json` | combine | `apps/mapgen-studio/test/tsconfig.json`, narrowed to the app definition, profile, entrypoint, and selected adapter axes |
| `apps/mapgen-studio/.gitignore` | combine | Root ignore authority, then delete the app-local file | Generated/output hygiene proof |
| `apps/mapgen-studio/system.md` | combine | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, then delete the app-local file | Documentation link/currentness proof |
| `apps/mapgen-studio/README.md` | combine | `docs/projects/mapgen-studio/RUNBOOK.md`, then delete the app-local file | Documentation link/currentness proof |

The terminal app is a realization shell. `rawr.mapgen-studio.ts` alone selects
the Studio API and web plugins plus the exact semantic adapter identities
`{civ7-save-files,studio-run-files,fresh-log-files,civ7-official-data,swooper-map-config-source}`.
Profiles select only provider, configuration-root, and process facts. Each of
`server.ts`, `web.ts`, and `dev.ts` selects one app, one profile,
and one role and delegates exactly once to `startApp`; entrypoints own no mount,
provider acquisition, or service execution. The app owns no feature, router,
service, provider, or deployment implementation.

## Swooper Definition And Realization

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| Pure config admission, catalog membership/order, and serialization fragments in `plugins/mod/map/swooper-physics/scripts/{catalog-source,config-source-store}.ts` | combine | Swooper definition `authoring` surface | Definition config and catalog proof |
| Filesystem root selection, reads, writes, and rollback in `plugins/mod/map/swooper-physics/scripts/{catalog-source,config-source-store}.ts` | combine | `apps/mapgen-studio/runtime/adapters/swooper-map-config-source.ts` | Studio cold-adapter execution |
| Pure catalog-metadata serialization in `plugins/mod/map/swooper-physics/scripts/generate-studio-map-catalog.ts` | combine | `plugins/mod/map/swooper-physics/authoring/targets.ts#mapCatalogMetadata` | Definition target and catalog projection proof |
| Pure recipe-authoring metadata serialization in `plugins/mod/map/swooper-physics/scripts/generate-studio-recipe-types.ts` | combine | `plugins/mod/map/swooper-physics/authoring/targets.ts#recipeAuthoringMetadata` | Definition target and generated-currentness proof |
| Filesystem reads and generated-file materialization in `plugins/mod/map/swooper-physics/scripts/{generate-studio-map-catalog,generate-studio-recipe-types}.ts` | delete | Shared build materializer consumes the pure target plans; no definition-owned filesystem adapter survives |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/diff-layers.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/diff.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/extract-trace.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/trace.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/list-layers.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/list.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/run-standard-dump.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/dump.ts` | Mirrored CLI command proof and Swooper diagnostic integration |
| `plugins/mod/map/swooper-physics/scripts/metrics/report.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/metrics/report.ts` | Mirrored CLI command proof and metric-bank integration |
| `plugins/mod/map/swooper-physics/scripts/{tsconfig.json,tsup.studio-recipes.config.ts}` and `scripts/diagnostics/README.md` | delete | Qualified compiler programs, shared build targets, command help, and canonical diagnostics docs |
| `apps/mods/map/swooper-physics/scripts/map-artifacts/file-plan.ts` | relocate | `apps/mods/map/swooper-physics/runtime/file-plan.ts` | Realization artifact proof |
| `apps/mods/map/swooper-physics/scripts/run-manifest-generator.ts` | relocate | `apps/mods/map/swooper-physics/runtime/run-manifest.ts` | Realization artifact and runtime proof |
| `apps/mods/map/swooper-physics/scripts/{generate-map-artifacts,generate-run-manifest}.ts` | delete | Shared runtime invokes the cold realization target table directly |
| `apps/mods/map/swooper-physics/scripts/live/verify-final-surface-parity.ts` | combine | `plugins/mod/map/swooper-physics/test/recipes/standard/parity/final-surface-parity.live.test.ts` | Recipe-owned proof executed by the uncached realization live target |
| `apps/mods/map/swooper-physics/scripts/live/verify-studio-run-in-game-live.ts` | combine | `apps/mods/map/swooper-physics/test/live/studio-run-in-game.live.test.ts` | Uncached realization live proof |
| `apps/mods/map/swooper-physics/scripts/{tsconfig.json,tsup.config.ts}` | delete | Qualified realization compiler program and shared runtime execution |

The definition retains only pure config admission, catalog membership and
projection, and serialization. The Studio app owns authored-source filesystem
effects. Definition authoring metadata and realization targets are cold
runtime-compiler inputs, not callable app exports, managed providers, or
service facades.

## Civ7 Engine Adapter And Map Entrypoint

After the complete Swooper cutover, `@civ7/adapter` is a pure package. Until
then it remains a hybrid current-state owner. Civ7 globals, `/base-standard`
imports, loader event registration, and live map execution move together to the
Swooper realization that runs inside the engine.

| Exact current source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-adapter/src/{types,mock-adapter,map-metadata,current-map-surface}.ts` | combine | Pure EngineAdapter contract/types, deterministic mock, static metadata, and private detached-comparison support under `packages/civ7-adapter/src` | Package contract and semantics |
| `packages/civ7-adapter/src/resource-age-policy.ts` | combine | `apps/mods/map/swooper-physics/runtime/map-script/adapter.ts`; the runtime query and answer validation are concrete adapter behavior | Mod realization runtime proof |
| `packages/civ7-adapter/src/civ7-adapter.ts` | relocate | `apps/mods/map/swooper-physics/runtime/map-script/adapter.ts` | Mod realization runtime proof |
| `packages/civ7-adapter/src/map-generation-setup.ts` | relocate | `apps/mods/map/swooper-physics/runtime/map-script/setup.ts` | Mod realization runtime proof |
| `packages/civ7-adapter/src/index.ts` | combine | Pure package exports only; engine-global exports disappear | Package contract typecheck |
| Pure map-definition/config-admission types in `packages/sdk/src/mapgen/{createMap,index}.ts` | combine | Swooper definition authoring contract | Definition typecheck and config admission |
| Engine globals, adapter creation, `RequestMapInitData`/`GenerateMap` registration, and live execution in `packages/sdk/src/mapgen/createMap.ts` | relocate | `apps/mods/map/swooper-physics/runtime/map-script/entrypoint.ts` | Mod realization runtime and map-entrypoint proof |

The package exports no live `createCiv7Adapter`, setup capture, engine-global
map entrypoint, or SDK `createMap` implementation after cutover.

## False Plugin Collapse

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| Pure mod-id/path grammar, supplied-tree validation, wholesale replacement planning, digest comparison, and receipt construction latent in `packages/plugins/plugin-mods/src/index.ts#deployMod` | combine | `packages/civ7-mod-install/src/{index,installation-plan}.ts` | Package contract and semantics |
| Host root resolution, directory observation, replacement, copy, and receipt materialization in `packages/plugins/plugin-mods/src/index.ts#{resolveModsDir,listMods,deployMod}` used by the Swooper deployment target | combine | `apps/mods/map/swooper-physics/runtime/adapters/local-mod-install.ts` | Mod realization adapter and deployment proof |
| Host root resolution, directory observation, replacement, status, and copy in `packages/plugins/plugin-mods/src/index.ts#{resolveModsDir,listMods,deployMod,getModStatus}` used by CLI commands | combine | `apps/cli/runtime/adapters/local-mods.ts` | CLI app adapter execution and exact topic command mirrors |
| `packages/plugins/plugin-mods/src/index.ts` remote-link/subtree wrappers, planning stubs, validation stub, packaging stub, Steam stub, default export, and package root | delete | Existing `plugin-git` command paths, Knip, and negative consumer search |

`packages/civ7-mod-install` receives caller-supplied observations and returns
only validation, comparison, replacement-plan, digest, and receipt values. It
performs no root discovery, filesystem read or write, deployment, provider
selection, or process lifecycle; those effects remain at the qualified
realization and CLI app adapters.

`packages/plugins/{plugin-files,plugin-git,plugin-graph}` remain at their current
owners in this coupled cutover. Their later kind classification is independent;
they are not renamed merely to remove the word `plugin`.

## Explicitly Excluded Adjacent Corpus

| Root | Cutover boundary | Owning later container |
| --- | --- | --- |
| `mods/mod-swooper-civ-dacia` | Outside this corpus; no source disposition assigned | Qualified civilization definition and realization |
| `apps/docs` | Outside this corpus; no source disposition assigned | Content-app classification |
| `apps/playground` | Outside this corpus; no source disposition assigned | Example/build-app classification |
| `tools/habitat`, its proof, and current `.habitat/blueprints/service` packets | Outside this corpus; no source disposition assigned | Separate shared-Habitat vendor/service workstream |
| A new Civ7 controller mod | Not admitted by this cutover | Same-realm ingress proof, if a consumer earns it |
| A generic desktop-control or catalog resource | Not admitted by this cutover | Independent capability proof |
| `resources/mapgen-run-runtime` | Not admitted by this cutover | MapGen-runs service state plus the Studio `studio-run-files` adapter |
| A public Tuner protocol package | Not admitted by this cutover | A second independent protocol consumer |
| A Civ7 HQ API, MapGen generation service, or durable workflow plugin | Not admitted by this cutover | Separate product capability decision |

## Proof Corpus

The terminal file-by-file authority is
[PROOF-CORPUS.md](PROOF-CORPUS.md). It classifies all current proof and
proof-support files as:

```text
42 + 38 + 5 + 10 + 70 + 63 + 2 + 187 + 8 + 2 + 0 + 3 + 30 = 460
```

That ledger is the only cutover authority for proof relocation, combination,
inlining, deletion, and unchanged exclusion. It also names the proof that must
be authored fresh because no current suite can be relabeled honestly. Closure
requires all 460 current files to reach their recorded terminal disposition,
all new target-kind proof to pass, and every admitted test interior to be
closed by its kind-specific or domain-qualified confidence layers.

## Closure Gate

The coupled cutover reaches zero only when:

- every destination is admitted by its accepted closed kind law;
- every selected `test/` interior follows that kind's closed layered proof
  taxonomy and no generic support cabinet survives;
- exact behavior proof passes at the new owner before the old owner is deleted;
- all public consumers use service clients, resource contracts, or package
  exports rather than private source or extracted facades;
- package exports, Nx graph edges, Knip, and Narsil show no old-owner consumer;
- generated output is regenerated at the realization owner rather than moved;
- canonical architecture and ADR authority describe only the terminal model.
