# Civ7 Capability Realization Cutover Corpus

**Status:** Frozen migration classification at Ground source snapshot
**Date:** 2026-08-02

**Source snapshot:** commit
`b89db91f40604905ce502a20fd0ea95ff5c2676f`, repository tree
`88e7bec0358300bd691a9534ed09c66cef180bd3`. This ledger's pre-receipt Git blob
is `9ab0b15be096d98a4ca39ee6e93e1e6169ca578e`. The paired identity fixes both
the exact classification and the product files it classifies; Ground changed
neither.

This is the finite source-to-destination ledger for the final platform
initiative. [WORKSTREAM.md](./WORKSTREAM.md) selects its exact rows by product
container; this file does not require the whole ledger to move at once. It is
Engineer input only after the owning container passes its product, architecture,
Habitat, and testing freeze.

Every participating source has exactly one terminal disposition:

- `relocate`: preserve one coherent owner while changing its project root;
- `combine`: preserve behavior by composing it into the named authority;
- `inline`: retain a projection only at its sole consumer;
- `delete`: preserve no implementation after its replacement proof passes.

Brace notation names an exact finite set. A directory path names one intact
subtree only when every current member has the same disposition and
destination; it is not recursive discovery authority for future members.
Destination paths use the established local Civ7 service spine:
`src/service/modules/<module>`. A service's public face is `src/client.ts`,
which may re-export its own contract; its router and implementation remain
private. No compatibility facade, parallel oRPC contract package, or alternate
runtime constructor survives the cutover. The Studio API authors its caller
contracts, adapts Effect-backed procedures once at its private implementation
boundary, delegates bound clients, and exposes the public registration face.
The qualified Studio app owns transport and mounting. The API never composes a
service contract subtree and owns no independent semantic service state,
provider lifecycle, process startup, or nested proof.

The first structural migration is one Core Platform parent. Its first nested
construction slice selects rows from the Swooper definition/realization,
engine-adapter/map-entrypoint, consumer, and false-plugin sections only where
the destination is the admitted definition, realization, pure adapter package,
or MapGen CLI-topic instance. Studio-targeted writers, Studio-owned deployment
source, and Interactive-dependent live proof remain stationary for the second
slice, which also owns Direct Control, Studio, remaining CLI and consumer rows,
and the coupled deletions. The two slices retain distinct semantic owners but
share one terminal seal. Dacia and other explicitly excluded roots retain
separate later containers. This partition changes execution containment, not
any row's terminal disposition.

## Direct Control: Managed Tuner

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-direct-control/src/session/{config,constants,discovery,framing,listener-id,session,socket,state}.ts` | combine | `resources/civ7-tuner/providers/local-socket` | Provider `semantics`, `execution`, and `collaboration` proof |
| `packages/civ7-direct-control/src/session/types.ts` | combine | `resources/civ7-tuner/contract.ts` | Resource contract proof |
| `packages/civ7-direct-control/src/session/execute.ts` | delete | Qualified apps acquire the provider once; the control service consumes the ready resource contract directly | App assembly and service execution proof |
| `packages/civ7-direct-control/src/session/health.ts` | combine | `resources/civ7-tuner/providers/local-socket` | Raw provider health/acquisition semantics and execution proof |
| `packages/civ7-direct-control/src/session/reconnect.ts` | delete | Provider reconnection remains physical and transparent; semantic retry is rebuilt only where dispatch evidence makes repetition lawful | Control-service no-repeat semantics |
| `packages/civ7-direct-control/src/session/command-result.ts` | decompose | Provider-emitted raw command/disposition facts remain in the Tuner resource contract; private control `model/policy/tuner-result.ts` owns only JSON/schema interpretation for native module ports | Resource contract plus service semantics |
| `packages/civ7-direct-control/src/session/request-id.ts` | delete | Callers use the platform UUID facility directly | Calling command and live-proof suites |

The provider owns endpoint discovery, acquisition, framing, socket-epoch
lifetime, state selection, physical reconnection, raw health observations, raw
command/disposition facts, and release. It exposes one ready Tuner value
through the resource contract. Control may interpret those facts but does not
re-own them. The provider does not own gameplay-readiness thresholds,
command-output interpretation, semantic retry, gameplay helpers, or a raw
package facade. In particular, the legacy six-attempt reconnect helper is not
provider lifecycle: it can repeat an indeterminately dispatched mutation and
is deleted rather than relocated.

## Direct Control: Civ7 Control Service

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-direct-control/src/civ7-component-id.ts` | combine | `services/civ7-control/src/service/model/dto/primitives.ts` | Service contract proof |
| `packages/civ7-direct-control/src/validation.ts#boundedInteger` and `#validatePlayerId` | combine | `services/civ7-control/src/service/model/policy/bounded-input.ts` | Consuming module semantics |
| `packages/civ7-direct-control/src/validation.ts#validateIdentifier` | combine | `services/civ7-control/src/service/modules/map/model/policy/identifier.ts` | Map semantics |
| `packages/civ7-direct-control/src/runtime/command-serialization.ts` | combine | `services/civ7-control/src/service/model/ports/tuner-script.ts` | Service execution proof |
| `packages/civ7-direct-control/src/runtime/map-size-type-source.ts` | combine | `services/civ7-control/src/service/modules/game/model/ports/map-size-observation.ts` | Game setup semantics |
| `packages/civ7-direct-control/src/runtime/probe.ts` | combine | `services/civ7-control/src/service/model/dto/runtime-probe.ts` and private `model/ports/tuner-script.ts` lowering | Service contract and execution proof |
| `packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts` | combine | `services/civ7-control/src/service/modules/{app,game}/model/ports/app-ui-snapshot.ts` | App readiness and game setup semantics |
| `packages/civ7-direct-control/src/runtime/{playable-status,tuner-health}.ts` | combine | `services/civ7-control/src/service/modules/app` | App-readiness semantics |
| `packages/civ7-direct-control/src/game-ui/loading-states.ts` | combine | `services/civ7-control/src/service/modules/game/model/dto/loading-state.ts`; native scripts reference the ambient Civ7 enum by name rather than preserving a second numeric table | Game setup contract and semantics |
| `packages/civ7-direct-control/src/play/action-panel-turn.ts` | decompose | Exact raw control `ui` or `game.turn` observation plus `services/civ7-play/src/service/modules/turn` interpretation; Play never receives a Tuner-backed port | Control semantics plus Play turn semantics |
| `packages/civ7-direct-control/src/play/notifications/blocking-observation.ts` | decompose | Exact `control.game.notifications.observe` fact plus `services/civ7-play/src/service/modules/attention` blocker interpretation | Control notification semantics plus Play attention semantics |
| `packages/civ7-direct-control/src/play/autoplay.ts` | decompose | `services/civ7-play/src/service/modules/automation` for gameplay automation; `services/mapgen-runs/src/service/modules/autoplay` retains only run-operation admission and mutual exclusion | Play automation and MapGen-runs policy proof |
| `packages/civ7-direct-control/src/play/turn-completion.ts` | decompose | Exact `control.game.turn.completion` observe/send atoms plus `services/civ7-play/src/service/modules/turn` check/request/reconciliation | Control native semantics plus Play turn semantics |
| `packages/civ7-direct-control/src/play/city` | decompose | Exact `control.game.city` observe/check/send atoms plus `services/civ7-play/src/service/modules/city` actor policy and reconciliation | Control native semantics plus Play city semantics |
| `packages/civ7-direct-control/src/play/diplomacy` | decompose | Exact `control.game.diplomacy` check/send atoms plus `services/civ7-play/src/service/modules/diplomacy` actor policy and reconciliation | Control native semantics plus Play diplomacy semantics |
| `packages/civ7-direct-control/src/play/display/queue.ts` | combine | `services/civ7-control/src/service/modules/ui` | Foundational UI control semantics |
| `packages/civ7-direct-control/src/play/map/visibility.ts` and the explore choreography from `src/play/display` | combine | `services/civ7-control/src/service/modules/map` | Foundational map-visibility semantics |
| `packages/civ7-direct-control/src/play/government` and `src/play/narrative` | decompose | Exact `control.game.progression` native atoms plus `services/civ7-play/src/service/modules/progression` actor policy and reconciliation | Control native semantics plus Play progression semantics |
| `packages/civ7-direct-control/src/play/notifications/{advisor-warning,dismissal,view}.ts` | decompose | Exact `control.game.notifications` observe/check/send atoms plus `services/civ7-play/src/service/modules/notifications` actor policy and reconciliation | Control native semantics plus Play notification semantics |
| `packages/civ7-direct-control/src/play/progression` | decompose | Exact `control.game.progression` observe/check/send atoms plus `services/civ7-play/src/service/modules/progression` actor policy, polling, and reconciliation | Control native semantics plus Play progression semantics |
| `packages/civ7-direct-control/src/play/ready/{city,unit}.ts` | decompose | Exact `control.game.{city,unit}` observations plus `services/civ7-play/src/service/modules/attention` readiness interpretation | Control game facts plus Play attention semantics |
| `packages/civ7-direct-control/src/play/ready/move-preview.ts` and `src/play/tactical` | combine | `services/civ7-play/src/service/modules/planning` | Play planning semantics |
| `packages/civ7-direct-control/src/play/unit` | decompose | Exact `control.game.unit` observe/check/send atoms plus `services/civ7-play/src/service/modules/unit` actor policy, planning, and reconciliation | Control native semantics plus Play unit semantics |
| `packages/civ7-direct-control/src/play/view/{camera,clean-frame}.ts` | combine | `services/civ7-control/src/service/modules/ui` | Foundational UI control semantics |
| `packages/civ7-direct-control/src/play/map/{constants,full-grid,reads,surface-observation,types,validation}.ts` and `src/play/start-positions.ts` | combine | `services/civ7-control/src/service/modules/map` | Foundational map/world observation semantics and Swooper live proof |
| `packages/civ7-direct-control/src/play/summaries.ts` | decompose | Exact `services/civ7-control/src/service/modules/game/{player,city,unit}` observation leaves; caller-facing map summaries may compose them with control-map facts only in the qualified projection | Foundational game observation semantics plus projection proof |
| `packages/civ7-direct-control/src/play/map/gameinfo.ts` | relocate | Qualified CLI and Studio diagnostic adapters; arbitrary table access is not a game/map service promise | Diagnostic adapter proof |
| `packages/civ7-direct-control/src/setup/{constants,reads,start}.ts`, `src/setup/prepare.ts#{Civ7SetupOptionValue,Civ7PlayerSetupOptions,Civ7SavedGameConfigurationLoadRequestResult,Civ7SinglePlayerSetupValues,Civ7TargetModReconciliationResult,Civ7SetupMutationResult,requestCiv7SavedGameConfigurationLoad,applyCiv7SinglePlayerSetupIdentity,applyCiv7SinglePlayerSetupOptions,reconcileCiv7RequiredTargetMod,setupExpectationScriptSource,setupSnapshotSelectionFromInput,buildApplySinglePlayerSetupIdentityCommand,buildApplySinglePlayerSetupOptionsCommand,buildReconcileTargetModCommand,normalizeSinglePlayerSetupInput,assertPreparedSetupMatches}`, and `src/setup/restart.ts#beginCiv7Game` | combine | `services/civ7-control/src/service/modules/game` | Foundational game setup semantics |

Control owns foundational native admission, execution, and observation. Play
owns actor-facing admission, orchestration, outcomes, and next-action policy
over the public control client. Native lowering stays private to control; no
service contract is extracted through a facade or reconstructed by a consumer.

## Direct Control: Qualified Host And Projection Owners

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| ScreenCaptureKit helper source, content-addressed cache, platform/TCC translation, process execution, caller-supplied window selection, PNG admission, and managed-default retention in `packages/civ7-direct-control/src/play/view/window-shot.ts` | combine | `resources/window-capture/providers/macos-screencapturekit` | Provider semantics, execution, and collaboration |
| Civ7 window defaults, appshot destination policy, and public result projection in `packages/civ7-direct-control/src/play/view/window-shot.ts` | combine | `services/civ7-control/src/service/modules/ui` | Foundational UI/appshot semantics |
| Filesystem snapshot, rewrite detection, and fresh-byte mechanics in `packages/civ7-direct-control/src/proof/log-markers.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/fresh-log-files.ts` | Studio cold-adapter execution |
| Marker selection, timeout, acceptance, and result policy in `packages/civ7-direct-control/src/proof/log-markers.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game` | Run-in-game semantics |
| Pure saved-configuration DTO, byte parsing, admission, and ordering in `packages/civ7-direct-control/src/setup/prepare.ts` | combine | `packages/civ7-save-files/src/{index,saved-config}.ts` | Package contract and semantics |
| Default-root selection, directory traversal, metadata reads, and byte reads behind `packages/civ7-direct-control/src/setup/prepare.ts#{DEFAULT_CIV7_SINGLE_PLAYER_SAVE_DIR,listCiv7SavedGameConfigurations}` | combine | `apps/mapgen-studio/src/runtime/adapters/civ7-save-files.ts` | Studio adapter execution and composition proof |
| `packages/civ7-direct-control/src/runtime/{inspection,inspection-constants,root-inspection}.ts` | inline | `plugins/cli/topics/game/src/adapters/tuner-inspection.ts` | CLI adapter proof |
| Runtime capability projection in `packages/civ7-direct-control/src/catalog/capabilities.ts` | inline | `plugins/cli/topics/game/src/commands/game/catalog.ts` | Catalog command proof |
| `packages/civ7-direct-control/src/setup/restart.ts#{restartCiv7Game,restartCiv7GameAndBegin}` | relocate | Qualified CLI app adapter; the command projects the bound app-owned capability | CLI app execution and restart command proof |

Qualified CLI and Studio apps select the Tuner and generic macOS window-capture
providers. The Studio app selects the cold saved-config and fresh-log bindings.
The API, services, and CLI commands consume only ready typed clients or
capabilities.

## Direct Control: Deletion

| Exact source | Disposition | Replacement proof |
| --- | --- | --- |
| `packages/civ7-direct-control/src/{direct-control-error-boundary,direct-control-error,error-message}.ts` | delete | Resource failures plus module-native error maps |
| `packages/civ7-direct-control/src/timing.ts` | delete | Effect schedule and cancellation proof in consuming modules |
| `packages/civ7-direct-control/src/catalog/capabilities.ts#loadCiv7OfficialResourceCapabilities` | delete | Knip and negative consumer search |
| `packages/civ7-direct-control/src/proof/operation-telemetry.ts` | delete | Knip and negative consumer search |
| `packages/civ7-direct-control/src/live-control.ts` | delete | Qualified app binding and service execution proof |
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
| `apps/mapgen-studio/src/server/studio/context.ts` | combine | Studio app composition supplies control and MapGen-runs clients to the qualified API context |
| `apps/mapgen-studio/src/server/studio/engines.ts` | combine | Pure parsing/plans/comparison in `packages/studio-run-workspace`, MapGen-runs bindings, Studio filesystem adapters `{studio-run-files,fresh-log-files,swooper-map-config-source}`, and the Studio `swooper-map-realization` adapter over the public Swooper definition plus pure workspace/install packages; the mixed source file disappears and no mod-realization app source or target is consumed |
| `apps/mods/map/swooper-physics/scripts/live/verify-final-surface-parity.ts` | combine | Recipe-owned `plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/parity/final-surface-parity.live.test.ts`, consuming the control map client and Studio API client through the realization-owned live target |
| `apps/mods/map/swooper-physics/scripts/live/verify-studio-run-in-game-live.ts` | combine | The Studio API client through the realization-owned live target; the Studio app selects and binds control, MapGen-runs, `{civ7-save-files,studio-run-files,fresh-log-files,swooper-map-realization}`, and the Tuner provider |
| `plugins/mod/map/swooper-physics/src/recipes/standard/parity/live.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/parity/live.ts`, consuming the control map client at realization time |
| `packages/studio-contract/src/{civ7,live}.ts` `†` | combine | Exact Studio API control-module contracts over the public control-service client |
| `packages/studio-contract/src/shared.ts` `†` | inline | Exact owning Studio API module contracts |
| `packages/studio-server/src/context.ts` `†` | combine | Studio API context containing app-bound public clients |
| `packages/studio-server/src/liveGame/statusRead.ts` | combine | Studio API live-status projection over control clients |
| `packages/studio-server/src/ports/Civ7WorkflowControl.ts` | combine | MapGen-runs public control dependency and run-in-game private ports |
| `packages/studio-server/src/router/index.ts` | combine | Studio API authoring, control, runs, and studio module routers |
| `packages/studio-server/src/services/Civ7TunerClient.ts` | delete | App-bound control client and app-selected cold dependencies declared by the API |
| `packages/studio-server/src/services/Civ7TunerSession.ts` | delete | App-selected and acquired local-socket Tuner provider |
| `packages/studio-server/src/services/StudioConfig.ts` `†` | combine | Studio app configuration and API caller projection |
| `plugins/cli/topics/game/src/adapters/control/service-client.ts` | delete | App-owned command context supplies the bound public control-service client |
| `plugins/cli/topics/game/src/adapters/play/direct-control.ts` | combine | Topic-local play-input projection over control DTOs; endpoint selection moves to CLI app composition |
| `plugins/cli/topics/game/src/commands/game/{map/starts,map/visibility}.ts` | combine | Bound control `map` client |
| `plugins/cli/topics/game/src/commands/game/gameinfo.ts` | combine | Qualified CLI diagnostic adapter, not a control-service contract |
| `plugins/cli/topics/game/src/commands/game/ai/loaded-levers.ts` | combine | Bound control `game` client |
| `plugins/cli/topics/game/src/commands/game/autoplay.ts` | combine | MapGen-runs autoplay client |
| `plugins/cli/topics/game/src/commands/game/catalog.ts` | inline | Command-owned catalog projection over the ready Tuner resource |
| `plugins/cli/topics/game/src/commands/game/exec.ts` | combine | Runtime-injected `Civ7Tuner.execute` |
| `plugins/cli/topics/game/src/commands/game/health.ts` | combine | `Civ7Tuner.health` for socket state and control readiness client for semantic readiness |
| `plugins/cli/topics/game/src/commands/game/inspect.ts` | combine | Topic-local `adapters/tuner-inspection.ts` over the ready Tuner resource |
| `plugins/cli/topics/game/src/commands/game/play/choose-narrative.ts` | combine | Play progression client |
| `plugins/cli/topics/game/src/commands/game/play/notifications/list.ts` | combine | Play notifications client |
| `plugins/cli/topics/game/src/commands/game/play/{ready-city,unit/promotion-readiness,unit/ready}.ts` | combine | Play attention/unit clients |
| `plugins/cli/topics/game/src/commands/game/play/rehydrate.ts` | combine | Control app-readiness client plus play attention and notifications clients |
| `plugins/cli/topics/game/src/commands/game/play/{settlement-recommendations,unit/move-preview}.ts` | combine | Play planning client |
| `plugins/cli/topics/game/src/commands/game/restart.ts` | combine | Qualified CLI app restart adapter plus control game/setup client for begin/readback |
| `plugins/cli/topics/game/src/commands/game/status.ts` | combine | Control app client |
| `plugins/cli/topics/game/src/commands/game/watch.ts` | combine | Play notifications and attention clients |
| `services/civ7-control/src/service/model/dto/correlation.ts` | decompose | Exact control- or play-owned correlation and bounded failure projection over typed lower-owner failures; no shared resource/service vocabulary |
| `services/civ7-control/src/service/model/policy/direct-control-failure.ts` | combine | Service-owned dispatch-status policy derived from private module-port failures |
| `services/civ7-control/src/service/model/ports/{context,direct-control}.ts` | delete | Public client requirements plus exact module-private DTO and port owners |
| `services/civ7-control/src/service/model/ports/lifecycle.ts` | combine | Control `game` module-private ports |
| `services/civ7-control/src/service/modules/attention/router/{current,priorities}.ts` | decompose | Play `attention` contract/policy over typed control clients; native observations become exact control operations, never Tuner-backed play ports |
| `services/civ7-control/src/service/modules/display/router/explore-request.ts` | combine | Control `map` visibility DTO and private lowering |
| `services/civ7-control/src/service/modules/lifecycle/router/single-player-start.ts` | combine | Control `game` ports and loading-state DTO |
| `services/civ7-control/src/service/modules/readiness/router/current.ts` | combine | Control `app` readiness interpretation over raw resource facts |
| `services/civ7-control/src/service/modules/world/router/{current,map-reads}.ts` | decompose | Control `game` current-game facts and control `map` world/map observations with private lowering |

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

## Control And Play Service Substrate Migration

The technically green flat rewrite is migration evidence, not destination
authority. Two services are reconstructed under the same local Civ7 service
law. `services/civ7-control` has the finite module set `{app,game,map,ui}`;
`services/civ7-play` has `{attention,automation,city,diplomacy,notifications,
progression,planning,turn,unit}`. Each exposes only its native oRPC client; that
client may re-export the service-owned contract. Routers and implementations
stay private. Callers use clients, while API projections own caller contracts
and never compose either service contract subtree.

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `services/civ7-control/{AGENTS.md,project.json,package.json,tsconfig.json}` | combine | Foundational `services/civ7-control` envelope plus a separately admitted `services/civ7-play` envelope |
| `services/civ7-control/{scripts/build.mjs,tsconfig.tools.json,tsup.config.ts}` | delete | Service-owned compiler/build program scheduled by Nx |
| `services/civ7-control/src/client.ts` and `src/service/{base,contract,impl,router}.ts` | decompose | Matching control and play service spines with one public client each, optional owned-contract re-export, and private routers/implementations |
| `services/civ7-control/src/service/schema/typebox-standard-schema.ts` | relocate | Product-neutral `packages/typebox-standard-schema`, because TypeBox 1.3 does not publish a native Standard Schema adapter |
| Generic mutation middleware and controller-admission/proof machinery | delete | Exact control dispatch facts plus play-owned operation policy; qualified app composition supplies ready capabilities |
| Shared primitives, correlation, and failure projection | decompose | Smallest truthful control- or play-owned DTO/policy leaves; no cross-service shared cabinet |
| Current `{readiness,lifecycle,world,display,view}` modules | decompose | Control `{app,game,map,ui}` modules according to the exact operation table below |
| Current `{attention,city,diplomacy,government,narrative,notifications,progression,strategy,turn,unit}` modules | decompose | Raw native observations/checks/sends move beneath exact control `game`/`ui` subdomains; actor interpretation, requests, polling, no-repeat policy, reconciliation, and next action move to the finite Play modules below |
| Any play module import of `Civ7Tuner`, `WindowCapture`, provider state, arbitrary JavaScript execution, or private control source | delete | Public control-client dependency and exact typed control operations |
| `packages/civ7-control-orpc/dist` | delete | Ignored generated cleanup only; the deleted tracked package contributes no contract, behavior, or migration authority |

The target public module grammar is:

| Service module | Admitted operation families |
| --- | --- |
| `control.app` | readiness and current-application facts |
| `control.game` | setup/start, current-game lifecycle and state, and closed typed native game-operation families required by play |
| `control.map` | map plot/grid/surface observations, visibility, start positions, and legacy world-like reads |
| `control.ui` | display queue, camera, and Civ7 appshot meaning |
| `play.attention` | current attention, priorities, and blocker interpretation |
| `play.automation` | gameplay autoplay configuration/status/start/stop; MapGen-runs owns only cross-operation admission and mutual exclusion |
| `play.city` | population placement, production choice, and town focus |
| `play.diplomacy` | first-meet and diplomacy responses |
| `play.notifications` | queue, dismissal, and advisor-warning decisions |
| `play.progression` | technology, culture, government, celebration, narrative, attributes, and traditions |
| `play.planning` | formation, front, battlefield, destination, target, settlement, and civilian-route analysis |
| `play.turn` | turn completion |
| `play.unit` | command, target action, upgrade, resettle, and ready-unit decisions |

The control client is the only service construction dependency admitted into
play. If a current play operation cannot be expressed without raw Tuner access,
the missing typed control operation turns red first; bypassing the boundary is
not an implementation option.

## Completed Controller Island Retirement

Commit `8d0d4983ba` deleted all 52 tracked bridge files. The bridge never became
a product, service, API, or mod application. Its native Civ7 execution-realm
observations survive only as finite reference evidence; all callable behavior
is owned by the control service.

| Exact historical source | Completed disposition | Destination or replacement |
| --- | --- | --- |
| `mods/mod-civ7-intelligence-bridge/src/controller/game-ui.ts` and `src/controller/game-ui/{attention,map,strategy-front,unit-command}.ts` | combine | Verified native API and execution-realm facts in `docs/system/direct-control/SIEVE-ENGINE-REFERENCE.md`; the executable sources are then removed |
| `mods/mod-civ7-intelligence-bridge/src/controller/{intelligence-bridge,service-types}.ts` | delete | Accepted control-service client plus app-selected ready resources; no global bridge or extracted facade survives |
| `mods/mod-civ7-intelligence-bridge/src/{modinfo.ts,ui/civ7-intelligence-bridge.ts}` | delete | No controller mod is realized |
| `mods/mod-civ7-intelligence-bridge/{.gitignore,AGENTS.md,package.json,project.json,tsconfig.json,tsup.config.ts}` | delete | Negative workspace, export-map, and package-reference proof |
| `mods/mod-civ7-intelligence-bridge/scripts/{clean-generated-artifacts,generate-mod-artifacts}.ts` | delete | No controller artifact is generated |
| `mods/mod-civ7-intelligence-bridge/mod/civ7-intelligence-bridge.modinfo` | delete | Generated residue, not migration authority |

The same commit preserved accepted native facts in
`docs/system/direct-control/SIEVE-ENGINE-REFERENCE.md`, amended ADR-007, and
recorded the future-controller re-entry trigger. `git ls-files
mods/mod-civ7-intelligence-bridge` is empty; ignored dependency residue is not a
product owner or corpus member.

## Vendor Cutover And Habitat Law Boundary

Participating capability owners target the compatible core tuple `@orpc/*`
`2.0.0-beta.23`, Effect `4.0.0-beta.101`, and TypeBox `1.3.8`.
`@orpc/experimental-effect@2.0.0-beta.23` is a candidate adapter, not selected
law. The published global `dev:effect-orpc` skill verifies only the exact
beta.17 E4 profile, so it cannot authorize beta.23 spelling or behavior by
analogy.

The portable Effect-oRPC law is smaller: every Effect-authored procedure is
adapted directly and exactly once at its owning private service or API
implementation/router boundary. That boundary carries typed native context and
Effect dependencies, declared error lineage, unexpected defects, the request
signal, interruption, and cancellation into owner-specific proof. The
extension-free direct handler is the default. Exact beta.23 builder syntax,
Cause mapping, and extension use remain gated on the published beta.23 source,
declarations, and discriminating type, error, interruption, lifecycle, and
artifact fixtures. If an extension is selected, one qualified app bootstrap
owns and proves the physical-module-realm mutation exactly once before router
construction; feature modules never scatter side-effect imports.

The Ground receipt records the completed root manifest alignment. Each service,
API, and app boundary still owns the behavior it claims from the beta.23 tuple.
No repository-local vendor skill is created or changed by this cut; a later
skill update requires the exact beta.23 evidence receipt rather than design
intent.

| Exact current source | Disposition | Exact destination or replacement |
| --- | --- | --- |
| `services/civ7-control/package.json` | combine | Closed service package export for `src/client.ts` plus the compatible core vendor tuple; the optional Effect adapter remains source/test gated |

No `tools/habitat` source, package configuration, proof, runtime, command, or
service-kind implementation is assigned a disposition by this capability
cutover. Habitat supplies structural and bounded-source law only; it does not
adapt procedures, compile product code, bind clients, mount transports, run
hosts, or own product proof. This ledger neither invents an unowned Habitat
runtime target nor grants this cutover permission to edit Habitat.

Any remaining coupled dispositions for `package.json#catalog`,
`package.json#patchedDependencies`, `patches/effect-orpc@0.5.0.patch`, and
`bun.lock` belong to the Interactive product vendor cut that proves the exact
service/API/app tuple. `tools/habitat/package.json` remains outside and
unchanged. These are explicit prerequisites, not mutations assigned to a
shared runtime or smuggled into this corpus.

The current service packets at
`.habitat/blueprints/service/{require_orpc_error_authority,require_service_anchor_exports,require_service_boundary_platform_independence,require_service_context_boundaries,require_service_contract_authority,require_service_contract_property_descriptions,require_service_effect_error_authority,require_service_module_isolation,require_service_orpc_composition,require_service_proof_isolation,require_service_public_consumer_sealing,require_service_router_authorship,require_service_spine_topology}`
and `.habitat/blueprints/service/README.md` are likewise outside this cutover
and remain unchanged until a law-only Habitat maintenance workstream accepts
its corrected successor packet and exact portable inventory.

## CLI Shell, Topics, And App Binding

`apps/cli` remains commandless. Commands live only in the finite topic set
`plugins/cli/topics/{data,docs,game,git-mod,mapgen}`, nested below each topic's
`src/commands/<topic>`. `apps/cli/package.json#oclif.plugins` is the sole Oclif
discovery registry and is source-related to the app definition; it is not a
second topic-membership authority.

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/cli/{AGENTS.md,CHANGELOG.md,package.json,project.json,tsconfig.json}` | combine | Accepted composed app and CLI-shell envelope at `apps/cli` |
| `apps/cli/TESTING.md` | combine | `docs/system/TESTING.md` and CLI-specific links under `docs/system/cli` |
| `apps/cli/civ7.ts` | combine | `apps/cli/src/cli.ts`, the sole authored native Oclif entrypoint through the app-owned process scope |
| `apps/cli/bin/run.js` | combine | One executable shim delegating to `apps/cli/src/cli.ts`; it owns no startup plan |
| `plugins/cli/topics/{data,docs,git-mod}/{AGENTS.md,package.json,project.json,tsconfig.json,src}` | combine | Matching accepted topic roots under `plugins/cli/topics`; git-mod retains command projection while local-mod filesystem operations move to `apps/cli/src/runtime/adapters/local-mods.ts` |
| `plugins/cli/topics/game/{AGENTS.md,package.json,project.json,tsconfig.json,src/index.ts}` | combine | Accepted `game` topic envelope and public plugin entry |
| `plugins/cli/topics/game/src/adapters/control/service-client.ts` | delete | App-owned command context supplies the bound public control-service client |
| `plugins/cli/topics/game/src/adapters/play/direct-control.ts` | combine | `plugins/cli/topics/game/src/adapters/play/semantic-envelope.ts`; endpoint and provider selection move to CLI app composition |
| `plugins/cli/topics/game/src/adapters/{local-data,map,view}` and `src/adapters/play/semantic-envelope.ts` | combine | Matching topic-local projection adapters |
| `plugins/cli/topics/game/src/commands/game` | combine | Same nested command tree consuming declared app-bound requirements and public clients |

`src/runtime/composition.ts`, `context.ts`, and exact selected adapter leaves are
authored under the qualified app packet rather than migrated from an existing
owner. `package.json#oclif.plugins` alone owns topic membership; composition
owns provider, public-client, configuration, and process facts. `src/cli.ts`
enters native Oclif through the one app-owned composition and owns no commands
or semantic behavior. The shell uses one app-owned bootstrap and one managed command
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
| `civ7.mapSummary` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/map-summary.ts` | API-owned composition over bound control `map` plus exact `game.player`, `game.city`, and `game.unit` observation clients |
| `civ7.gameInfo` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/game-info.ts` | Qualified diagnostic adapter; arbitrary table access is not a control contract |
| `civ7.autoplay` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/autoplay.ts` | MapGen-runs autoplay client |
| `civ7.setupConfig` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/setup-config.ts` | Control `game` client |
| `civ7.savedConfigs` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/saved-configs.ts` | App-selected `civ7-save-files` adapter |
| `civ7.setupCatalog` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/setup-catalog.ts` | App-selected `civ7-official-data` adapter and app-owned roots |
| `civ7.live.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-status.ts` | Control `app` and `game` clients |
| `civ7.live.snapshot` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-snapshot.ts` | Control `map` client |
| `civ7.live.entities` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/live-entities.ts` | Foundational control game client |
| `civ7.live.gameInfo` | relocate or retire with consumer proof | Qualified Studio diagnostic contract/adapter, never the control game contract | Diagnostic adapter proof |
| `civ7.attention.{current,priorities}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/attention.ts` | Bound play `attention` client |
| `civ7.city.population.place.{check,request}`; `civ7.city.production.choice.{check,request}`; `civ7.city.townFocus.{change,review}.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/city.ts` | Bound play `city` client |
| `civ7.diplomacy.firstMeet.response.{check,request}`; `civ7.diplomacy.response.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/diplomacy.ts` | Bound play `diplomacy` client |
| `civ7.display.queue.{current,close}`; `civ7.display.explore.request` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/display.ts` | Bound control `ui` and `map` clients |
| `civ7.government.choice.{check,request}`; `civ7.government.celebration.choice.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/government.ts` | Bound play `progression` client |
| `civ7.lifecycle.singlePlayer.start` | retain as API-owned compatibility path | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/lifecycle.ts` | Bound control `game` client |
| `civ7.narrative.choice.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/narrative.ts` | Bound play `progression` client |
| `civ7.notifications.advisorWarning.viewed.{check,request}`; `civ7.notifications.dismiss.{check,request}`; `civ7.notifications.queue.current`; `civ7.notifications.queue.dismiss.request` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/notifications.ts` | Bound play `notifications` client |
| `civ7.progression.{dashboard,traditions}.current`; `civ7.progression.{technology,culture}.choice.{options,check,request}`; `civ7.progression.{technology,culture}.target.{check,request}`; `civ7.progression.attribute.{purchase,review}.{check,request}`; `civ7.progression.tradition.{change,review}.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/progression.ts` | Bound play `progression` client |
| `civ7.readiness.current` | retain as API-owned compatibility path | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/readiness.ts` | Bound control `app` client |
| `civ7.strategy.{civilianRouteTriage,formationSnapshot,frontSummary,battlefieldScan,destinationAnalysis,targetCandidates}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/strategy.ts` | Bound play `planning` client |
| `civ7.turn.complete.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/turn.ts` | Bound play `turn` client |
| `civ7.unit.{resettle,upgrade}.{check,request}`; `civ7.unit.target.action.{check,request}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/unit.ts` | Bound play `unit` client |
| `civ7.view.appshot.capture`; `civ7.view.camera.focus` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/view.ts` | Bound control `ui` client |
| `civ7.world.{current,plot,grid}` | retain as API-owned compatibility paths | `plugins/server/api/mapgen-studio/src/service/modules/control/contract/world.ts` | Bound control `map` client |
| `mapConfigs.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/map-config-status.ts` | MapGen-runs save-deploy client |
| `mapConfigs.saveDeploy` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/map-config-save-deploy.ts` | MapGen-runs save-deploy client |
| `runInGame.status` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-status.ts` | MapGen-runs run-in-game client |
| `runInGame.cancel` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-cancel.ts` | MapGen-runs run-in-game client |
| `runInGame.diagnostics` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-diagnostics.ts` | MapGen-runs run-in-game client |
| `runInGame.start` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/runs/contract/run-in-game-start.ts` | MapGen-runs run-in-game client |
| `studio.serverInfo` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/server-info.ts` | App-supplied process identity projected through API context |
| `studio.operations.current` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/operations-current.ts` | MapGen-runs client |
| `studio.events.watch` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/studio/contract/events-watch.ts` | API-owned projection over run and control observations |
| `recipeDag.get` | relocate | `plugins/server/api/mapgen-studio/src/service/modules/authoring/contract/recipe-dag.ts` | Swooper definition-authoring projection |

The finite brace expressions above expand to all 70 current route leaves,
including `lifecycle`, which the legacy composition comment omits. The root API
contract composes API-owned leaves at their existing paths. The API `control`
module projects the frozen caller-facing `civ7.*` namespace and delegates each
leaf through an explicit control or play client adapter. It does not compose
either service contract, pick types from another surface, import a service
router, or recombine private source. Other API leaves may call a public service
client or an app-selected cold adapter, but never import a provider
implementation or app.

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
| `packages/studio-contract/src/lib/typeboxStandardSchema.ts` and `src/index.ts` | combine | Product-neutral TypeBox/Standard-Schema adapter plus Studio-owned procedure-schema projection; retire the Studio wrapper when the API destination owns that projection |

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
| `packages/studio-server/src/ports/{DeployRunner,EvidenceBuilder,MapConfigStore,RunInGameArtifactGenerator,ScriptingLog}.ts` | combine | MapGen-runs public authored-config, realization, and fresh-log dependency descriptors plus matching service-private ports; Studio binds `{swooper-map-config-source,studio-run-files,fresh-log-files,swooper-map-realization}`, and the realization adapter composes the public Swooper definition plus pure workspace/install packages directly | Service contract, fake-port semantics, and Studio adapter proof |
| `packages/studio-server/src/ports/RuntimeObservation.ts` | combine | Run-in-game module observation port | Run-in-game semantics |
| `packages/studio-server/src/operationRuntime/launchEnvelope.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game/model/policy/launch-admission.ts` | Run-in-game semantics |
| `packages/studio-server/src/operationRuntime/{attributionReport,diagnostics,privateJson}.ts` | combine | `services/mapgen-runs/src/service/modules/run-in-game` | Run-in-game diagnostics semantics |
| `packages/studio-server/src/operationRuntime/ports.ts` | combine | Exact MapGen-runs construction dependencies and service-private `model/ports` owners | Service contract and fake-port semantics |
| `packages/studio-server/src/operationRuntime/diagnosticsWriteGates.ts` | combine | MapGen-runs service `model/actors` | Service execution |
| Record identity, parsing, lifecycle, lease, terminalization, and retention policy in `packages/studio-server/src/operationRuntime/operationRecords.ts` | combine | MapGen-runs service `model/{actors,entities,policy,ports}` | Service semantics and execution |
| Workspace directory, record, lease-lock, heartbeat-file, diagnostics-file, and retention-delete effects in `packages/studio-server/src/operationRuntime/operationRecords.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/studio-run-files.ts` | Studio cold-adapter execution |
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
`apps/mapgen-studio/src/runtime/adapters/studio-run-files.ts`; path injection does
not authorize a package filesystem effect.

The save/deploy module owns `prepare -> write -> deploy`, public phase evidence,
rollback policy, and once-only release. The Swooper definition owns pure config
admission and serialization; the Studio `swooper-map-config-source` adapter
owns the opaque prepared write/rollback transaction. The Swooper realization
app owns the deployable outcome of its own build/deploy targets. For Studio's
dynamic path, `swooper-map-realization` owns the physical materialization and
installation effects and returns opaque receipts. MapGen-runs owns their
ordering, correlation, reconciliation, and final semantic operation outcome.
These remain distinct dependencies; deployment never absorbs source mutation,
and Studio imports no realization app or shared runtime.

## Studio API Projection

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/studio-server/src/context.ts` | combine | `plugins/server/api/mapgen-studio/src/service/base.ts` | API contract and projection |
| `packages/studio-server/src/contract/index.ts` | combine | `plugins/server/api/mapgen-studio/src/service/contract.ts` plus exact module contracts | API contract and projection |
| `packages/studio-server/src/router/index.ts` | combine | Public `plugins/server/api/mapgen-studio/src/api.ts` registration over private `src/service/router.ts` and exact module composition | API registration and router projection |
| `packages/studio-server/src/errors.ts` and `src/errors` | combine | Exact API projection errors under `src/service/modules` | API error projection |
| `packages/studio-server/src/services/StudioEventHub.ts` | combine | API studio projection module under `src/service/modules/studio` | API-owned scoped execution |
| `packages/studio-server/src/liveGame/statusRead.ts` | combine | API control projection module under `src/service/modules/control` | API control projection |
| `packages/studio-server/src/liveGame/watcher.ts` | combine | API control watcher under `src/service/modules/control` | API-owned scoped execution |
| `packages/studio-server/src/recipeDag/service.ts` and `apps/mapgen-studio/src/server/recipeDag/service.ts` | combine | API authoring projection module under `src/service/modules/authoring` | API authoring projection |
| `packages/studio-server/src/services/{Civ7TunerClient,Civ7TunerSession}.ts` | delete | App-supplied control client and Tuner provider |
| `packages/studio-server/src/services/StudioConfig.ts` | combine | Studio runtime configuration and exact app-composition facts; no semantic service state enters the API projection |
| `packages/studio-server/src/{handler,index,runtime}.ts`, `src/workflows/index.ts`, and the package root | decompose | API registration and projection move to public `plugins/server/api/mapgen-studio/src/api.ts` over its private router; transport, client binding, mounting, and process lifecycle move to qualified `apps/mapgen-studio` composition and native host entrypoints; workflow behavior is already assigned to its semantic services, then the old package root retires | API registration/projection, app assembly/host execution, service behavior, Knip, and the coupled graph |

The API plugin owns caller projection and public registration through
`src/{api,client}.ts` over its private `src/service` packet. Each Effect-backed
procedure adapts directly once at the private implementation/router boundary;
`api.ts` registers that composed projection but does not mount it. The plugin
imports public service clients, not service-private source, and owns no
independent semantic service authority. The qualified app binds those clients
and owns provider selection, transport, server mounting, host entrypoints, and
application lifecycle.

## Studio Web And App

The selected web projection below receives browser application source from
`apps/mapgen-studio`. It may continue consuming
`packages/mapgen-studio-ui` as a component library; this corpus selects no
relocation or web-plugin identity for that separate package.

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `apps/mapgen-studio/src/{App.tsx,app,browser-runner,features,index.css,lib,recipes,shared,shims,stores,ui,vite-env.d.ts}` | relocate | Matching paths under `plugins/web/app/mapgen-studio/src` | Web `views`, `interactions`, and browser-execution proof |
| `apps/mapgen-studio/components.json` | relocate | `plugins/web/app/mapgen-studio` projection envelope | Web projection structure and type proof |
| `apps/mapgen-studio/tsconfig.json` | decompose | Project-local compiler programs at `plugins/web/app/mapgen-studio/tsconfig.json` and `apps/mapgen-studio/tsconfig.json`; neither is a shared runtime compiler | Web projection type proof plus app type/host proof |
| `apps/mapgen-studio/{index.html,vite.config.ts,tsconfig.tools.json}` and `src/main.tsx` | combine | Qualified app-owned Vite/compiler configuration and native `apps/mapgen-studio/src/{web,dev}.ts` host entrypoints, which import the web plugin's public projection | Exact app `web` and `dev` host execution proof |
| `apps/mapgen-studio/src/server/mapConfigs/requestValidation.ts` | combine | MapGen-runs save-deploy admission | Save-deploy semantics |
| `apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts` | combine | MapGen-runs run-in-game verification | Run-in-game semantics |
| Pure evidence schemas, digesting, marker and failure classification, bounded-log parsing, and comparison in `apps/mapgen-studio/src/server/runInGame/{authorshipEvidence,evidenceTypes,fileEvidence,logFailure,swooperLogEvidence}.ts` | combine | `packages/studio-run-workspace/src/{authorship-evidence,log-failure,materialization-evidence,run-evidence}.ts` | Package contract and semantics |
| Exact-authorship acceptance, unresolved-link, recovery, timeout, retry, and polling policy in the same Run-in-Game sources | combine | `services/mapgen-runs/src/service/modules/run-in-game/model/policy` | Run-in-game semantics |
| Filesystem reads in `apps/mapgen-studio/src/server/runInGame/{fileEvidence,logFailure,swooperLogEvidence}.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/{studio-run-files,fresh-log-files}.ts` | Studio cold-adapter execution |
| `apps/mapgen-studio/src/server/mapConfigs/deploy.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/swooper-map-realization.ts`, implementing the exact MapGen-runs realization descriptor from the public Swooper definition plus `packages/studio-run-workspace` and `packages/civ7-mod-install`; no mod-realization app source or target is consumed | Studio adapter execution proof; MapGen-runs separately proves semantic operation outcomes |
| Caller-facing setup-catalog DTO and route projection in `apps/mapgen-studio/src/server/civ7Resources/catalog.ts` | combine | Studio API authoring module | API authoring projection |
| Official-root selection, traversal, reads, XML parsing, admission, and ordering in `apps/mapgen-studio/src/server/civ7Resources/catalog.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/civ7-official-data.ts` | Studio adapter execution and composition proof |
| `apps/mapgen-studio/src/server/studio/{context,engines}.ts` manual construction | combine | Qualified `apps/mapgen-studio/src/runtime/composition.ts` directly constructs and binds exact adapters, public clients, and API context; no shared runtime compiler survives | App assembly and selected-adapter execution proof |
| `apps/mapgen-studio/src/server/daemon/daemon.ts` server construction, mounts, static serving, and disposal | combine | Native `apps/mapgen-studio/src/{server,web,dev}.ts` entrypoints mount the API registration and web projection through app-owned Bun/Vite/server/web hosts | Exact app server/web/dev host execution proof |
| Daemon configuration/process facts and role selection in `apps/mapgen-studio/src/server/daemon/daemon.ts` | combine | `apps/mapgen-studio/src/{runtime/config.ts,runtime/composition.ts,server.ts,web.ts,dev.ts}` | App composition and host execution proof |
| `apps/mapgen-studio/{Caddyfile,railway.json}` | combine | Qualified Studio app deployment configuration | App definition and delivery proof |
| `apps/mapgen-studio/{package.json,project.json}` | combine | Qualified app spine selected in `TOPOLOGY.md` | App assembly and host execution proof |
| `apps/mapgen-studio/tsconfig.test.json` | combine | `apps/mapgen-studio/test/tsconfig.json`, narrowed to app composition, host, and selected-adapter axes |
| `apps/mapgen-studio/.gitignore` | combine | Root ignore authority, then delete the app-local file | Generated/output hygiene proof |
| `apps/mapgen-studio/system.md` | combine | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, then delete the app-local file | Documentation link/currentness proof |
| `apps/mapgen-studio/README.md` | combine | `docs/projects/mapgen-studio/RUNBOOK.md`, then delete the app-local file | Documentation link/currentness proof |

The terminal app is a realization shell. Its qualified composition selects the
Studio API and web plugins plus the exact semantic adapter identities
`{civ7-save-files,studio-run-files,fresh-log-files,civ7-official-data,swooper-map-config-source,swooper-map-realization}`.
That composition also selects provider, configuration-root, public-client, and
process facts. It owns the project-local Bun/Vite compiler/build configuration;
`src/server.ts`, `src/web.ts`, and `src/dev.ts` each enter one native host role
and mount only selected plugin registration/projection faces. Host entrypoints
own no semantic service truth. The API plugin retains public registration and
caller projection. The app owns no feature, API router, semantic service,
provider implementation, or portable definition truth. Its
`swooper-map-realization` adapter directly implements the
MapGen-runs public descriptor from the public Swooper definition and pure
workspace/install packages. It owns the ephemeral run's physical effects and
receipts; MapGen-runs owns the final semantic operation outcome. It is not a
facade or a reusable cross-app library.

## Swooper Definition And Realization

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| Pure config admission, catalog membership/order, and serialization fragments in `plugins/mod/map/swooper-physics/scripts/{catalog-source,config-source-store}.ts` | combine | Swooper definition `authoring` surface | Definition config and catalog proof |
| Filesystem root selection, reads, writes, and rollback in `plugins/mod/map/swooper-physics/scripts/{catalog-source,config-source-store}.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/swooper-map-config-source.ts` | Studio cold-adapter execution |
| Pure catalog-metadata serialization in `plugins/mod/map/swooper-physics/scripts/generate-studio-map-catalog.ts` | combine | `plugins/mod/map/swooper-physics/authoring/targets.ts#mapCatalogMetadata` | Definition target and catalog projection proof |
| Pure recipe-authoring metadata serialization in `plugins/mod/map/swooper-physics/scripts/generate-studio-recipe-types.ts` | combine | `plugins/mod/map/swooper-physics/authoring/targets.ts#recipeAuthoringMetadata` | Definition target and generated-currentness proof |
| Filesystem reads and generated-file materialization in `plugins/mod/map/swooper-physics/scripts/{generate-studio-map-catalog,generate-studio-recipe-types}.ts` | combine | `apps/mapgen-studio/src/runtime/adapters/swooper-map-config-source.ts` applies the pure definition target plans through the app-owned source-writing boundary; no definition-owned filesystem adapter or shared runtime survives | Definition target currentness plus Studio adapter execution proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/diff-layers.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/diff.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/extract-trace.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/trace.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/list-layers.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/list.ts` | Mirrored CLI command proof |
| `plugins/mod/map/swooper-physics/scripts/diagnostics/run-standard-dump.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/diagnostics/dump.ts` | Mirrored CLI command proof and Swooper diagnostic integration |
| `plugins/mod/map/swooper-physics/scripts/metrics/report.ts` | relocate | `plugins/cli/topics/mapgen/src/commands/mapgen/metrics/report.ts` | Mirrored CLI command proof and metric-bank integration |
| `plugins/mod/map/swooper-physics/scripts/{tsconfig.json,tsup.studio-recipes.config.ts}` and `scripts/diagnostics/README.md` | delete | Definition-owned target/type proof, the Studio app-owned source-writer target and compiler program, mirrored command help, and canonical diagnostics docs |
| `apps/mods/map/swooper-physics/scripts/map-artifacts/file-plan.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/file-plan.ts` | Realization artifact proof |
| `apps/mods/map/swooper-physics/scripts/run-manifest-generator.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/run-manifest.ts` | Realization artifact and runtime proof |
| `apps/mods/map/swooper-physics/scripts/generate-map-artifacts.ts` plus tracked generated map sources and mod files | combine | `apps/mods/map/swooper-physics/src/build.ts` and `src/runtime/map-script/compiler.ts` build the final ignored `dist/mod` tree directly from virtual sources |
| `apps/mods/map/swooper-physics/scripts/generate-run-manifest.ts` | relocate | `apps/mods/map/swooper-physics/src/run-manifest.ts` | Thin request-local manifest entrypoint |
| `apps/mods/map/swooper-physics/scripts/live/verify-final-surface-parity.ts` | combine | `plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/parity/final-surface-parity.live.test.ts` | Recipe-owned proof executed by the uncached realization live target |
| `apps/mods/map/swooper-physics/scripts/live/verify-studio-run-in-game-live.ts` | combine | `apps/mods/map/swooper-physics/test/live/studio-run-in-game.live.test.ts` | Uncached realization live proof |
| `apps/mods/map/swooper-physics/scripts/{tsconfig.json,tsup.config.ts}` | delete | App source typecheck and realization-local virtual-source compiler |

The definition retains only pure config admission, catalog membership and
projection, and serialization. The Studio app owns authored-source filesystem
effects. The Swooper realization app owns the deployable artifact and outcome
of its own finite targets. Studio's qualified `swooper-map-realization` adapter
separately owns ephemeral run materialization/install effects by composing the
public definition and pure workspace/install packages, then supplies the exact
ready port to MapGen-runs. No app is imported as a library. Definition
authoring metadata remains cold build input, not a callable app export, managed
provider, or service facade.

## Civ7 Engine Adapter And Map Entrypoint

After the Core Platform parent seals the Swooper slice, `@civ7/adapter` is a
pure package. Until then it remains a hybrid current-state owner. Civ7 globals,
`/base-standard` imports, loader event registration, and live map execution move
together to the Swooper realization that runs inside the engine.

| Exact current source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| `packages/civ7-adapter/src/{types,mock-adapter,map-metadata,current-map-surface}.ts` | combine | Pure EngineAdapter contract/types, deterministic mock, static metadata, and private detached-comparison support under `packages/civ7-adapter/src` | Package contract and semantics |
| `packages/civ7-adapter/src/resource-age-policy.ts` | combine | `apps/mods/map/swooper-physics/src/runtime/map-script/adapter.ts`; the runtime query and answer validation are concrete adapter behavior | Mod realization runtime proof |
| `packages/civ7-adapter/src/civ7-adapter.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/map-script/adapter.ts` | Mod realization runtime proof |
| `packages/civ7-adapter/src/map-generation-setup.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/map-script/setup.ts` | Mod realization runtime proof |
| `packages/civ7-adapter/src/index.ts` | combine | Pure package exports only; engine-global exports disappear | Package contract typecheck |
| Pure map-definition/config-admission types in `packages/sdk/src/mapgen/{createMap,index}.ts` | combine | Swooper definition authoring contract | Definition typecheck and config admission |
| Engine globals, adapter creation, `RequestMapInitData`/`GenerateMap` registration, and live execution in `packages/sdk/src/mapgen/createMap.ts` | relocate | `apps/mods/map/swooper-physics/src/runtime/map-script/entrypoint.ts` | Mod realization runtime and map-entrypoint proof |

The package exports no live `createCiv7Adapter`, setup capture, engine-global
map entrypoint, or SDK `createMap` implementation after cutover.

## False Plugin Collapse

| Exact source | Disposition | Exact destination | Proof owner |
| --- | --- | --- | --- |
| Pure mod-id/path grammar, supplied-tree validation, wholesale replacement planning, digest comparison, and receipt construction latent in `packages/plugins/plugin-mods/src/index.ts#deployMod` | combine | `packages/civ7-mod-install/src/{index,installation-plan}.ts` | Package contract and semantics |
| Host root resolution, directory observation, replacement, copy, and receipt materialization in `packages/plugins/plugin-mods/src/index.ts#{resolveModsDir,listMods,deployMod}` used by the Swooper deployment target | combine | `apps/mods/map/swooper-physics/src/runtime/adapters/local-mod-install.ts` | Mod realization adapter and deployment proof |
| Host root resolution, directory observation, replacement, status, and copy in `packages/plugins/plugin-mods/src/index.ts#{resolveModsDir,listMods,deployMod,getModStatus}` used by CLI commands | combine | `apps/cli/src/runtime/adapters/local-mods.ts` | CLI app adapter execution and exact topic command mirrors |
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
| `tools/habitat`, its proof, and current `.habitat/blueprints/service` packets | Outside this corpus; no source disposition assigned | Separate law-only Habitat maintenance; no product runtime, vendor adapter, or repo-local vendor-skill destination |
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
42 + 38 + 5 + 10 + 70 + 63 + 2 + 188 + 8 + 2 + 0 + 3 + 30 = 461
```

That ledger is the only cutover authority for proof relocation, combination,
inlining, deletion, and unchanged exclusion. It also names the proof that must
be authored fresh because no current suite can be relabeled honestly. Closure
requires all 461 current files to reach their recorded terminal disposition,
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
