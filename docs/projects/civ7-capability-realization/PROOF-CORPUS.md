# Civ7 Capability Realization Proof Corpus

**Status:** Superseded destination ledger; frozen proof census only
**Date:** 2026-08-02
**Scope:** Current proof and proof-support files participating in the final
platform initiative

> **Authority notice (2026-08-06):** the file identities and source assertions
> below remain baseline evidence. Destination paths and target proof ownership
> predate the ratified in-engine Controller, access, and Play model and are not
> construction authority. Each workstream vertical must preserve, reconstruct,
> or delete the selected assertions against the current
> [Outcome Model](./OUTCOME-MODEL.md),
> [Source Reconciliation](./SOURCE-RECONCILIATION.md), and
> [Public Surface Disposition](./PUBLIC-SURFACE-DISPOSITION.md).

**Proof snapshot:** commit
`b89db91f40604905ce502a20fd0ea95ff5c2676f`, repository tree
`88e7bec0358300bd691a9534ed09c66cef180bd3`. The exact sorted 461-path manifest
has SHA-256 `1e08fa783ab27596d01b46a9723acaf55963fe64dcf6cc1f7f9275da589f2fca`;
the sorted Git mode/type/blob/path manifest has SHA-256
`c546d9cf434879e1208c52626f69e93f6e30f157366e152a09f5cc3e8142a847`.
Both digests use bytewise-sorted UTF-8 rows with exactly one trailing line
feed; object rows are the unmodified `git ls-tree -r <snapshot> --
<path-manifest>` output.

## Authority

This ledger records the complete 461-file proof/support census selected by the
earlier model. Its source assertions remain evidence; its terminal destination
choices must be re-ratified inside the owning vertical:

- `relocate`: preserve the file's coherent oracle at the named owner;
- `combine`: preserve its useful assertions by reconstructing them at the named
  owner, possibly with another current suite;
- `inline`: keep a helper only inside the exact proof leaves that consume it;
- `delete`: carry no assertion or support implementation forward;
- `excluded unchanged`: leave the file outside this cutover.

An exact named `describe` or `test` block after `#` is a fragment selector used
only where one current file crosses distinct owners or proof axes. A split file
still counts once in the coverage arithmetic. Brace notation denotes the
listed finite identities in order. A named directory is a frozen current
subtree only where this ledger states its file count and every current member
has the same destination transform. It grants no authority to future files.

The destination kind law owns a closed finite, disjoint confidence taxonomy.
An instance manifest may select exact subject identities only inside those
blueprint-defined axes; it cannot invent case-by-case proof structure. This
ledger does not create generic `behavior`, `mechanics`, `runtime`, `support`,
or `integration` cabinets.

Habitat supplies that structure and bounded-source law; it does not compile,
bind, mount, execute, or prove a product runtime. An API plugin proves its
public registration and caller projection. Qualified app proof owns selected
adapter/client binding and the observable behavior of each native Bun, Vite,
server, web, or Oclif host entrypoint.

Effect-backed oRPC proof is portable at this stage: one direct adaptation per
procedure at the owning private service or API implementation/router boundary,
with typed context/dependencies and declared-error, defect, signal,
interruption, and cancellation lineage preserved. Extension-free direct
handlers are the default. Exact beta.23 syntax, Cause behavior, and any
`@orpc/experimental-effect` extension remain gated on the exact published
source/declarations plus discriminating artifact, type, error, interruption,
lifecycle, and module-realm fixtures. If an extension is later selected, one
qualified process bootstrap must own and prove the physical mutation exactly
once; no feature module may acquire it by side-effect import.

## Coverage

| Current owner | Files |
| --- | ---: |
| `packages/civ7-direct-control` proof and compiler configuration | 42 |
| `services/civ7-control` proof and compiler configuration | 38 |
| `packages/studio-contract` proof | 5 |
| `packages/studio-server` proof and compiler configuration | 10 |
| `apps/mapgen-studio` proof and compiler configuration | 70 |
| `plugins/cli/topics/{data,docs,game,git-mod}` proof | 63 |
| `apps/cli` proof | 2 |
| `plugins/mod/map/swooper-physics` proof | 188 |
| `apps/mods/map/swooper-physics` proof | 8 |
| `packages/plugins/plugin-mods` proof | 2 |
| `mods/mod-civ7-intelligence-bridge` proof/support | 0 |
| `packages/studio-run-workspace` proof and compiler configuration | 3 |
| `packages/mapgen-studio-ui` proof and compiler configuration | 30 |
| **Total** | **461** |

The current-tree census was recomputed at Ground and contains exactly 461
tracked proof/support files. The earlier 460 count understated the finite
Swooper domain set by one; no file or terminal disposition was added by this
correction. Destination leaves are not a parity count:
API consolidation, strategy qualification, fixture dissolution, and new
target-law proof may change their total without changing this source census.

`WORKSTREAM.md` partitions this frozen census inside one Core Platform parent.
Swooper definition, realization, adjacent adapter, and MapGen CLI rows form its
first construction slice only where their destination is already admitted.
Studio-targeted writers and Interactive-dependent fresh-live rows remain
stationary for the second slice alongside Direct Control, Studio, remaining
CLI, MapGen-runs, and caller-projection rows. Neither slice claims an independent
migration. The parent seal drives all 461 current files to terminal
dispositions, including `excluded unchanged`; the final Platform Seal later
reconfirms that completed census against the materialized estate.

## Direct Control

### Foundational control and play behavior

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/civ7-direct-control/test/advisor-warning.test.ts` | decompose | Exact control `game/notifications-advisor-warning-viewed-{check,send}.test.ts` plus Play notification request/reconciliation proof |
| `packages/civ7-direct-control/test/autoplay.test.ts` | decompose | `services/civ7-play/test/semantics/modules/automation/autoplay.test.ts` plus MapGen-runs autoplay-admission proof |
| `packages/civ7-direct-control/test/diplomacy-response-atoms.test.ts` | decompose | Exact control `game/diplomacy-response-{check,send}.test.ts` plus Play diplomacy request/reconciliation proof |
| `packages/civ7-direct-control/test/display-queue.test.ts` | decompose | Exact `services/civ7-control/test/semantics/modules/ui/{display-queue-current,display-queue-close}.test.ts` |
| `packages/civ7-direct-control/test/first-meet-response-atoms.test.ts` | decompose | Exact control `game/diplomacy-first-meet-response-{check,send}.test.ts` plus Play diplomacy request/reconciliation proof |
| `packages/civ7-direct-control/test/government-choice-atoms.test.ts` | decompose | Exact control game-progression native leaf proofs plus Play progression request/reconciliation proof |
| `packages/civ7-direct-control/test/map-and-visibility.test.ts#map and visibility reads` | decompose | Exact control map `{current,plot,grid,visibility-current}.test.ts` proofs |
| `packages/civ7-direct-control/test/map-and-visibility.test.ts#explore grant atoms` | decompose | Exact control map `{visibility-grant-set,visibility-grant-remove}.test.ts` proofs; display choreography is not preserved here |
| `packages/civ7-direct-control/test/map-surface-observation.test.ts` | combine | `services/civ7-control/test/semantics/modules/map/surface.test.ts` |
| `packages/civ7-direct-control/test/narrative-choice-atoms.test.ts` | decompose | Exact control game-progression native leaf proofs plus Play progression request/reconciliation proof |
| `packages/civ7-direct-control/test/notification-dismissal.test.ts` | decompose | Exact control `game/notifications-dismissal-{check,send}.test.ts` plus Play notification request/reconciliation proof |
| `packages/civ7-direct-control/test/play-notification-view.test.ts` | decompose | Exact control `game/notifications-observe.test.ts` plus Play notification/attention interpretation proof |
| `packages/civ7-direct-control/test/population-placement.test.ts` | decompose | Exact control game city worker/expansion check/send proofs plus Play city request/reconciliation proof |
| `packages/civ7-direct-control/test/production-choice-atoms.test.ts` | decompose | Exact control `game/city-production-choice-{check,send}.test.ts` plus Play city request/reconciliation proof |
| `packages/civ7-direct-control/test/progression-native-atoms.test.ts` | decompose | Exact control game-progression observe/check/send leaf proofs plus Play progression request/reconciliation proof |
| `packages/civ7-direct-control/test/progression-reads.test.ts` | decompose | Exact control game-progression observation proofs plus Play progression interpretation proof |
| `packages/civ7-direct-control/test/ready-city-view.test.ts` | decompose | Exact control game-city observation proof plus Play attention interpretation proof |
| `packages/civ7-direct-control/test/ready-unit-view.test.ts` | decompose | Exact control game-unit observation proof plus Play attention interpretation proof |
| `packages/civ7-direct-control/test/settlement-recommendations.test.ts` | combine | `services/civ7-play/test/semantics/modules/planning/civilian-route-triage.test.ts` |
| `packages/civ7-direct-control/test/start-positions.test.ts` | combine | `services/civ7-control/test/semantics/modules/map/start-positions.test.ts` |
| `packages/civ7-direct-control/test/summary-reads.test.ts` | decompose | Exact `services/civ7-control/test/semantics/modules/game/{player,city,unit}-observe.test.ts`; caller-shaped combined summary behavior stays in the qualified projection proof |
| `packages/civ7-direct-control/test/tactical-reads.test.ts` | combine | `services/civ7-play/test/semantics/modules/planning/tactical-reads.test.ts` |
| `packages/civ7-direct-control/test/town-focus-atoms.test.ts` | decompose | Exact control game city town-focus check/send proofs plus Play city request/reconciliation proof |
| `packages/civ7-direct-control/test/turn-completion-atoms.test.ts` | decompose | Exact control `game/turn-completion-{observe,send}.test.ts` plus Play turn request/reconciliation proof |
| `packages/civ7-direct-control/test/unit-command-admission.test.ts` | decompose | Exact control game unit upgrade/resettle and target-action check proofs plus Play unit admission proof |
| `packages/civ7-direct-control/test/unit-command-atoms.test.ts` | decompose | Exact control game unit upgrade/resettle and target-action check/send proofs plus Play unit request/reconciliation proof |
| `packages/civ7-direct-control/test/unit-move-preview.test.ts` | combine | `services/civ7-play/test/semantics/modules/planning/tactical-reads.test.ts` |
| `packages/civ7-direct-control/test/unit-target-atoms.test.ts` | decompose | Exact control game unit-target observe and action-specific check/send proofs plus Play unit request/reconciliation proof |
| `packages/civ7-direct-control/test/view-camera.test.ts` | combine | `services/civ7-control/test/semantics/modules/ui/camera-focus.test.ts` |
| `packages/civ7-direct-control/test/view-clean-frame.test.ts` | combine | `services/civ7-control/test/semantics/modules/ui/appshot-capture.test.ts` |

### Mixed infrastructure suites

| Exact current source or fragment | Disposition | Exact destination |
| --- | --- | --- |
| `packages/civ7-direct-control/test/session.test.ts#{parses command JSON payloads with endpoint and state context,reports invalid command JSON with the original command result details}` | decompose | Tuner resource contract proof preserves the provider-emitted command/disposition fields; `services/civ7-control/test/semantics/tuner-result.test.ts` proves control-owned JSON/schema interpretation over that supplied result |
| `packages/civ7-direct-control/test/session.test.ts#{uses defaults and env hosts when resolving health,handles empty env when resolving health,waits for direct-control health readiness,times out waiting for direct-control health readiness}` | combine | `resources/civ7-tuner/providers/local-socket/test/{semantics/provider,execution/lifecycle}.test.ts`; these are raw provider configuration, acquisition, health, and wait facts, not app-readiness interpretation |
| `packages/civ7-direct-control/test/session.test.ts#{resolves direct-control config from explicit and env options,selects a tuner state by role, name, and id,parses tuner LSQ response parts into state pairs,allocates positive increasing tuner listener ids,parses fragmented and concatenated tuner frames}` | combine | `resources/civ7-tuner/providers/local-socket/test/semantics/provider.test.ts` |
| `packages/civ7-direct-control/test/session.test.ts#{discovers a reachable endpoint after earlier hosts fail,reports unavailable endpoint discovery with per-host details,opens tuner sockets and reports connection failures with typed errors,issues framed commands and interprets the server response,returns a typed command state error when requested state is unavailable}` | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts` |
| `packages/civ7-direct-control/test/session.test.ts#rejects an empty command as not dispatched without opening a socket` | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts` preserves typed not-dispatched and zero request writes after ready acquisition; the old lazy-connect assertion is retired because apps acquire one ready scoped resource before consumers execute |
| `packages/civ7-direct-control/test/session.test.ts#waits for fresh ordered log markers` filesystem snapshot assertions | combine | `apps/mapgen-studio/test/execution/adapters/fresh-log-files.test.ts` |
| `packages/civ7-direct-control/test/session.test.ts#waits for fresh ordered log markers` marker acceptance assertions | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `packages/civ7-direct-control/test/shared-session.test.ts` | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts`, including exact acquisition, socket-epoch, command-disposition, and release facts |
| `packages/civ7-direct-control/test/restart-lifecycle.test.ts#waits for Tuner readiness through the public wrapper` | combine | `services/civ7-control/test/semantics/modules/app/readiness-current.test.ts` |
| `packages/civ7-direct-control/test/restart-lifecycle.test.ts` excluding the Tuner-readiness wrapper assertion | decompose | Qualified CLI app restart-adapter proof plus `services/civ7-control/test/semantics/modules/game/single-player-start.test.ts` |
| `packages/civ7-direct-control/test/setup-and-lifecycle.test.ts#{reads exact Civ7Cfg setup scalars without reinterpreting numeric metadata,omits Civ7Cfg seed evidence for malformed or non-exact record cardinality}` pure byte parsing, admission, and ordering assertions | combine | `packages/civ7-save-files/test/semantics/saved-config.test.ts` |
| The same two saved-configuration tests' directory traversal, metadata, and byte-read assertions | combine | `apps/mapgen-studio/test/execution/adapters/civ7-save-files.test.ts` |
| `packages/civ7-direct-control/test/setup-and-lifecycle.test.ts` setup admission, mutation, readback, and lifecycle assertions | combine | `services/civ7-control/test/semantics/modules/game/single-player-start.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` command serialization assertions | combine | `services/civ7-control/test/semantics/tuner-script.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` state-selection and command-dispatch assertions | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts#reads App UI snapshots, Tuner readiness, and playable status shapes` raw Tuner command/health assertions | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts` |
| The same test's App UI and playable-status interpretation assertions, plus `#classifies shell status without claiming Tuner gameplay readiness` and `#validates playable status when Tuner health is unavailable` | combine | `services/civ7-control/test/semantics/modules/app/readiness-current.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` runtime-root and GameInfo inspection assertions | combine | `plugins/cli/topics/game/test/adapters/tuner-inspection.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` capability-catalog assertions | combine | `plugins/cli/topics/game/test/commands/game/catalog.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` fresh-log snapshot/rewrite assertions | combine | `apps/mapgen-studio/test/execution/adapters/fresh-log-files.test.ts` |
| `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` marker acceptance and timeout assertions | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `packages/civ7-direct-control/test/view-window-shot.test.ts#window-shot helper lifecycle` | combine | `resources/window-capture/providers/macos-screencapturekit/test/{semantics/provider,execution/lifecycle}.test.ts` |
| `packages/civ7-direct-control/test/view-window-shot.test.ts#captureCiv7WindowShot` generic selection, process, platform/TCC, PNG, and failure assertions | split | `resources/window-capture/test/contract/contract.typecheck.ts` plus `resources/window-capture/providers/macos-screencapturekit/test/{semantics/provider,execution/lifecycle}.test.ts` |
| `packages/civ7-direct-control/test/view-window-shot.test.ts#captureCiv7WindowShot` Civ7 defaults and public result assertions | combine | `services/civ7-control/test/semantics/modules/ui/appshot-capture.test.ts` |
| `packages/civ7-direct-control/test/view-window-shot.test.ts#appshot retention` generic configured-root pruning and explicit-destination noninterference | combine | `resources/window-capture/providers/macos-screencapturekit/test/execution/lifecycle.test.ts` |
| `packages/civ7-direct-control/test/view-window-shot.test.ts#appshot retention` Civ7 default root, prefix, and retention selection | combine | `services/civ7-control/test/semantics/modules/ui/appshot-capture.test.ts`; the service supplies policy while the provider performs only generic configured-root effects |
| `packages/civ7-direct-control/test/validation.test.ts#{bounds integers with existing command-failed classification,validates player ids through the existing bounded range}` | combine | `services/civ7-control/test/semantics/bounded-input.test.ts` |
| `packages/civ7-direct-control/test/validation.test.ts#{validates simple identifiers without broadening accepted input,validates map locations and bounds with existing map-specific ranges}` | combine | `services/civ7-control/test/semantics/modules/map/map-reads.test.ts` |
| `packages/civ7-direct-control/test/validation.test.ts#formats dependency errors and exposes the current timer primitive` | delete | No destination; Effect scheduling and owner-native errors replace the assertion |

### Deleted package proof

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/civ7-direct-control/test/{direct-control-error-boundary,operation-telemetry,probe-river-writer,public-api}.test.ts` | delete | No destination; owner proof, Knip, and negative old-export search replace these suites |
| `packages/civ7-direct-control/{tsconfig.test.json,vitest.config.ts}` | delete | No destination; each qualified owner supplies its own proof compiler/runner |

The section covers 40 test leaves and two compiler/runner files.

## Civ7 Control And Play Services

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| The exact 30 current files under `services/civ7-control/test/behavior/modules` | decompose | Foundational app/game/map/UI assertions move to `services/civ7-control/test/semantics/modules/<module>/<operation>.test.ts`; actor-facing gameplay assertions move to the matching `services/civ7-play` mirror without Tuner-backed play ports |
| `services/civ7-control/test/integration/client-context.test.ts` | decompose | Control and play `test/execution/root.test.ts` prove their independent contexts and the one-way public-client dependency |
| `services/civ7-control/test/mechanics/mutation-result-policy.test.ts` | relocate | `services/civ7-play/test/semantics/mutation-result-policy.test.ts` |
| `services/civ7-control/test/mechanics/primitive-schemas.test.ts` | delete | No destination; contract type proof and TypeBox's own behavior own this guarantee |
| `services/civ7-control/test/support/{direct-control-facade,playable-status,standard-schema}.ts` | delete | No destination; public clients, module-local DTOs, and colocated fixtures replace the support cabinet |
| `services/civ7-control/{tsconfig.test.json,vitest.config.ts}` | delete | No destination; the accepted service packet owns the proof compiler/runner |

The section covers 36 proof/support files and two compiler/runner files.
`packages/civ7-control-orpc` is ignored generated residue, not a second tracked
service or proof owner.

## Studio Contract And Server

### Studio contract

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/studio-contract/test/civ7.test.ts#Civ7 saved-configuration public DTO` | combine | `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` |
| `packages/studio-contract/test/civ7.test.ts#Civ7 live setup public DTO` | combine | `plugins/server/api/mapgen-studio/test/projection/control.test.ts` |
| `packages/studio-contract/test/mapConfigEnvelope.test.ts` | relocate | `packages/mapgen-config/test/semantics/map-config-envelope.test.ts` |
| `packages/studio-contract/test/recipeDag.test.ts` | combine | `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` |
| `packages/studio-contract/test/runInGame.test.ts#Run in Game launch envelope seed admission` | combine | `packages/studio-run-workspace/test/semantics/launch-envelope.test.ts` |
| `packages/studio-contract/test/runInGame.test.ts#Run in Game exact Civ7 setup seed evidence` | combine | `packages/studio-run-workspace/test/semantics/authorship-evidence.test.ts` |
| `packages/studio-contract/test/tsconfig.json` | delete | No destination; destination kinds own their proof compilers |

### Studio server

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/studio-server/test/civ7WorkflowControl.test.ts` | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `packages/studio-server/test/contractTypeboxSpine.test.ts` | delete | No destination; accepted contract construction/type fixtures own this guarantee |
| `packages/studio-server/test/diagnosticsWriteGates.test.ts` | combine | `services/mapgen-runs/test/execution/root.test.ts` |
| `packages/studio-server/test/errorSpine.test.ts` | combine | `plugins/server/api/mapgen-studio/test/projection/errors.test.ts` |
| `packages/studio-server/test/handler.test.ts` authoring-route assertions | combine | `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` |
| `packages/studio-server/test/handler.test.ts` control-route assertions | combine | `plugins/server/api/mapgen-studio/test/projection/control.test.ts` |
| `packages/studio-server/test/handler.test.ts` Run-in-Game, Save/Deploy, status, diagnostics, and cancellation projections | combine | `plugins/server/api/mapgen-studio/test/projection/runs.test.ts` |
| `packages/studio-server/test/handler.test.ts` declared-error and unexpected-defect projection assertions | combine | `plugins/server/api/mapgen-studio/test/projection/errors.test.ts` |
| `packages/studio-server/test/handler.test.ts` exact route-tree and collision assertions | combine | `plugins/server/api/mapgen-studio/test/projection/router.test.ts` |
| `packages/studio-server/test/handler.test.ts` hello, replay, publish, cancellation, and subscriber-release assertions for `studio.events.watch` | combine | `plugins/server/api/mapgen-studio/test/execution/studio-events.test.ts` |
| `packages/studio-server/test/handler.test.ts` service admission, cancellation-fence, and operation-lifecycle assertions | combine | Exact `services/{civ7-control,civ7-play,mapgen-runs}/test/execution/root.test.ts` owner |
| `packages/studio-server/test/handler.test.ts` raw handler construction, HTTP status, `/rpc` mounting, non-RPC fallthrough, and aborted-transport-only assertions | decompose | Direct private procedure adaptation plus public registration move to `plugins/server/api/mapgen-studio/test/projection/router.test.ts`; HTTP status, `/rpc` mounting, fallthrough, and request-signal delivery move to `apps/mapgen-studio/test/execution/hosts/server.test.ts`; service root execution proves resulting interruption/cancellation lineage |
| `packages/studio-server/test/liveGameWatcher.test.ts` | combine | `plugins/server/api/mapgen-studio/test/execution/live-game-watcher.test.ts` |
| `packages/studio-server/test/operationRuntime.test.ts` public operation admission, outcome, and projection assertions | combine | Exact operation mirrors at `services/mapgen-runs/test/semantics/modules/{autoplay/autoplay,operations/current,run-in-game/start,run-in-game/status,run-in-game/cancel,run-in-game/diagnostics,save-deploy/start,save-deploy/status}.test.ts` |
| `packages/studio-server/test/operationRuntime.test.ts` registry, records, retention, cancellation-fence, leases, service lifecycle, and event-state assertions | combine | `services/mapgen-runs/test/execution/root.test.ts` |
| `packages/studio-server/test/operationRuntime.test.ts` workspace directory, record, diagnostics, lease-file, heartbeat-file, and retention-delete assertions | combine | `apps/mapgen-studio/test/execution/adapters/studio-run-files.test.ts` |
| `packages/studio-server/test/portableJsonAdmission.test.ts` | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `packages/studio-server/{tsconfig.test.json,vitest.config.ts}` | delete | No destination; destination kinds own their proof compilers/runners |

These sections cover five Studio-contract files and ten Studio-server files.

## MapGen Studio App

### Web projection: views

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mapgen-studio/test/browserRunner/errorFormat.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/browser-run-error.test.tsx` |
| `apps/mapgen-studio/test/civ7Setup/{mapSizes,seedPolicy,setupConfig}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/{map-sizes,seed-policy,setup-config}.test.tsx` |
| `apps/mapgen-studio/test/liveRuntime/model.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/live-runtime-model.test.tsx` |
| `apps/mapgen-studio/test/mapConfigSave/status.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/map-save-status.test.tsx` |
| `apps/mapgen-studio/test/runInGame/status.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/run-in-game-status.test.tsx` |
| `apps/mapgen-studio/test/ui/appHeaderMarkupPin.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/views/app-header.test.tsx` |
| `apps/mapgen-studio/test/ui/fixtures/appHeaderMarkup.json` | combine | `plugins/web/app/mapgen-studio/test/views/app-header.fixture.ts`, a typed colocated fixture consumed only by `app-header.test.tsx` |
| `apps/mapgen-studio/test/viz/{binaryLoading,eraSelection,overlaySuggestions,palettePresentation,tileOrientation}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/views/{binary-loading,era-selection,overlay-suggestions,palette-presentation,tile-orientation}.test.tsx` |

### Web projection: interactions

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mapgen-studio/test/config/{canonicalConfig,configEditing,importExport}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/{config-admission,config-editing,config-import-export}.test.tsx` |
| `apps/mapgen-studio/test/controllers/useBrowserRun.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/browser-run.test.tsx` |
| `apps/mapgen-studio/test/controllers/useConfigAuthoring.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/config-authoring.test.tsx` |
| `apps/mapgen-studio/test/controllers/useDeckAutofit.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/deck-autofit.test.tsx` |
| `apps/mapgen-studio/test/controllers/useKeyboardShortcuts.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/keyboard-shortcuts.test.tsx` |
| `apps/mapgen-studio/test/controllers/useLiveRuntime.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/live-runtime.test.tsx` |
| `apps/mapgen-studio/test/controllers/useRunInGame.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/run-in-game.test.tsx` |
| `apps/mapgen-studio/test/controllers/useSaveDeploy.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/save-deploy.test.tsx` |
| `apps/mapgen-studio/test/controllers/useSetupControls.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/setup-controls.test.tsx` |
| `apps/mapgen-studio/test/controllers/useStudioOperations.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/studio-operations.test.tsx` |
| `apps/mapgen-studio/test/controllers/useViewportLayout.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/viewport-layout.test.tsx` |
| `apps/mapgen-studio/test/controllers/useVizSelection.test.tsx` | relocate | `plugins/web/app/mapgen-studio/test/interactions/viz-selection.test.tsx` |
| `apps/mapgen-studio/test/mapConfigSave/api.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/map-save.test.tsx` |
| `apps/mapgen-studio/test/recipeDag/prunePipelineExpansion.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/prune-pipeline.test.tsx` |
| `apps/mapgen-studio/test/runInGame/{clientState,requestValidation}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/{run-in-game-client,run-in-game-request}.test.tsx` |
| `apps/mapgen-studio/test/shared/shortcutPolicy.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/keyboard-shortcut-policy.test.tsx` |
| `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/operation-adoption.test.tsx` |
| `apps/mapgen-studio/test/studioState/persistence.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/state-persistence.test.tsx` |
| `apps/mapgen-studio/test/viz/inspectorSelection.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/interactions/viz-inspector.test.tsx` |

### Web projection: browser execution

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mapgen-studio/test/browserRunner/{recipeRuntime,standardLayerVisibility,workerTraceSink}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/execution/{recipe-runtime,standard-layer-visibility,worker-trace-sink}.test.tsx` |
| `apps/mapgen-studio/test/config/{defaultConfigSchema,standardRecipeArtifactGuards}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/execution/{default-config-schema,standard-recipe-artifacts}.test.tsx` |
| `apps/mapgen-studio/test/viz/{dataTypeModel,riverLakeInspector,worker-viz-facet-sink}.test.ts` | relocate | `plugins/web/app/mapgen-studio/test/execution/{viz-data-model,river-lake-inspector,worker-viz-facet-sink}.test.tsx` |
| `apps/mapgen-studio/test/viz/standardRecipeConfig.ts` | relocate | `plugins/web/app/mapgen-studio/test/execution/standard-recipe-config.fixture.ts` |

### Server, run, package, and realization evidence

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mapgen-studio/test/civ7Resources/catalog.test.ts` | combine | XML parsing, admission, ordering, traversal, and file-read assertions move to `apps/mapgen-studio/test/execution/adapters/civ7-official-data.test.ts`; root selection moves to `apps/mapgen-studio/test/assembly/composition.test.ts` |
| `apps/mapgen-studio/test/contracts/mapConfigEnvelope.test.ts` | combine | `packages/mapgen-config/test/semantics/map-config-envelope.test.ts` |
| `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts` | combine | `apps/mods/map/swooper-physics/test/deployment/save-deploy.test.ts` |
| `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts` | combine | Preserve observable proxy streaming in `apps/mapgen-studio/test/execution/hosts/web.test.ts`; do not preserve Vite wiring details |
| `apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts` | combine | `apps/mods/map/swooper-physics/test/deployment/save-deploy.test.ts` |
| `apps/mapgen-studio/test/mapConfigSave/requestValidation.test.ts` | combine | `services/mapgen-runs/test/semantics/modules/save-deploy/start.test.ts` |
| `apps/mapgen-studio/test/recipeDag/artifactDomainCoverage.test.ts` | combine | `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` |
| `apps/mapgen-studio/test/runInGame/deploymentSnapshot.test.ts` | combine | `apps/mods/map/swooper-physics/test/deployment/studio-run-in-game.test.ts` |
| `apps/mapgen-studio/test/runInGame/evidenceIdentity.test.ts` file-digest, marker-classification, bounded-log parsing, and pure evidence-comparison assertions | combine | `packages/studio-run-workspace/test/semantics/run-evidence.test.ts` |
| The same evidence-identity suite's file observation assertions | combine | `apps/mapgen-studio/test/execution/adapters/studio-run-files.test.ts` |
| The same evidence-identity suite's exact-authorship acceptance, unresolved-link, and pre-launch gap policy assertions | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `apps/mapgen-studio/test/runInGame/logFailure.test.ts` low-level log-signature and failure-code classification assertions | combine | `packages/studio-run-workspace/test/semantics/log-failure.test.ts` |
| The same log-failure suite's dismissal, recovery-boundary, hint, timeout, retry, and polling-policy assertions | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts`; host log observation remains in the selected `fresh-log-files` adapter proof |
| `apps/mapgen-studio/test/runInGame/materializationStatus.test.ts` | combine | `packages/studio-run-workspace/test/semantics/materialization-evidence.test.ts` |
| `apps/mapgen-studio/test/runInGame/runtimeObservation.test.ts` | combine | `services/mapgen-runs/test/semantics/modules/run-in-game/start.test.ts` |
| `apps/mapgen-studio/test/server/daemonFetch.test.ts` daemon argument, environment, and process-configuration assertions | combine | `apps/mapgen-studio/test/assembly/composition.test.ts` |
| `apps/mapgen-studio/test/server/daemonFetch.test.ts` health, static serving, route mounting, HTTP status, and retired-path assertions | combine | Preserve public host behavior in `apps/mapgen-studio/test/execution/hosts/server.test.ts`; delete implementation-shaped assertions |
| `apps/mapgen-studio/test/server/engineErrorSpine.test.ts` | combine | `plugins/server/api/mapgen-studio/test/projection/errors.test.ts` |
| `apps/mapgen-studio/test/server/oneMount.test.ts` app/client/provider selection and delegation setup | combine | `apps/mapgen-studio/test/assembly/composition.test.ts` and `test/execution/hosts/server.test.ts` |
| `apps/mapgen-studio/test/server/oneMount.test.ts#studio, civ7-control, and recipeDag namespaces answer over one handler` app-host mount assertion | combine | `apps/mapgen-studio/test/execution/hosts/server.test.ts`; the qualified app mounts the API plugin's public registration once |
| The same test's `civ7.setupCatalog` and `recipeDag.get` route-projection assertions | combine | `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` |
| The same test's readiness, lifecycle-error, and sanitization route-projection assertions | combine | `plugins/server/api/mapgen-studio/test/projection/control.test.ts` |
| The same test's `studio.serverInfo` route-projection assertion | combine | `plugins/server/api/mapgen-studio/test/projection/router.test.ts` |
| The same test's `studio.operations.current` route-projection assertion | combine | `plugins/server/api/mapgen-studio/test/projection/runs.test.ts` |
| The same test's exact-one session binding and reuse assertions | combine | `apps/mapgen-studio/test/assembly/composition.test.ts` proves one app-bound ready client/session selection, and `test/execution/hosts/server.test.ts` proves reuse across the mounted host lifetime |
| The same test's lifecycle-admission assertions | delete | The superseded controller-admission middleware has no target service obligation |
| The same test's provider acquisition and release assertions | combine | `resources/civ7-tuner/providers/local-socket/test/execution/lifecycle.test.ts` |
| `apps/mapgen-studio/test/server/oneMount.test.ts#{serializes complete public control procedures on the daemon Tuner lease,removes an aborted queued control procedure before it can enter,drains an admitted control procedure before cancellation releases its lease}` | delete | The target public client has no controller lease or admission queue; provider concurrency and interruption remain provider-owned |
| `apps/mapgen-studio/test/server/oneMount.test.ts#daemon disposal drains an admitted control procedure before closing the session` | combine | Local-socket provider release proof and Studio host disposal proof; Control owns neither provider nor host lifetime |
| `apps/mapgen-studio/test/server/oneMount.test.ts#the civ7 namespace merge is collision-free` | combine | `plugins/server/api/mapgen-studio/test/projection/router.test.ts` |
| `apps/mapgen-studio/test/server/oneMount.test.ts#out-of-scope paths fall through to the host 404` | combine | `apps/mapgen-studio/test/execution/hosts/server.test.ts`; this is app-host behavior, not API semantics |
| `apps/mapgen-studio/test/studioErrors/definedErrorProjection.test.ts` | combine | `plugins/server/api/mapgen-studio/test/projection/errors.test.ts` |

### Deleted app-local proof machinery

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mapgen-studio/test/browserRunner/{query-modules.d.ts,recipeRuntime.type-test.ts}` | combine | Preserve the positive and negative compile assertions with a colocated declaration fixture inside `plugins/web/app/mapgen-studio/test/execution/recipe-runtime.test.tsx`, compiled by that projection's own test program rather than a shared compiler |
| `apps/mapgen-studio/test/config/standardRecipeGeneratedTypes.type-test.ts` | delete | No destination; Swooper definition currentness and public types own the guarantee |
| `apps/mapgen-studio/test/controllers/{_setup.ts,harness.smoke.test.tsx,useLatestRef.test.tsx}` | delete | No destination; colocated fixtures and product behavior replace generic harness proof |
| `apps/mapgen-studio/test/server/tunerSession.test.ts` | delete | No destination; Tuner provider proof owns session lifecycle |
| `apps/mapgen-studio/test/setup.ts` | delete | No destination; fixtures colocate with their exact consumer |
| `apps/mapgen-studio/tsconfig.test.json` | combine | `apps/mapgen-studio/test/tsconfig.json`, narrowed to the app's closed assembly, host, and selected-adapter proof |

The section covers 69 app test/support files and one compiler file.

## CLI

### Data and docs topics

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| The exact eight current files under `plugins/cli/topics/data/test` | excluded unchanged | Same exact paths; six command mirrors, one adapter mirror, and `test/tsconfig.json` already satisfy the selected topic layers |
| The exact two current files under `plugins/cli/topics/docs/test` | excluded unchanged | Same exact paths; the serve command mirror and `test/tsconfig.json` already satisfy the selected topic layers |

### Game topic

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/cli/topics/game/test/adapters/{local-data/inspect,view/camera-flags}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/control.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/{ai/loaded-levers,catalog,exec,gameinfo,health,inspect,map/index,map/visibility,status}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/map/starts.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/map/topic.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/map/{index,grid,plot,summary,visibility}.test.ts`; duplicate `index` and `visibility` assertions combine with `control.test.ts` |
| `plugins/cli/topics/game/test/commands/game/map/visibility.test.ts` | excluded unchanged | Same exact path; it owns the current Explore classification and typed-error projection oracle |
| `plugins/cli/topics/game/test/commands/game/play/attribute-tradition.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{buy-attribute,change-tradition,consider-attributes,consider-traditions}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/celebration-government.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{choose-celebration,choose-government}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/culture.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{choose-culture,set-culture-target}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/diplomacy/{respond-first-meet,respond}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/play/end-turn.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/play/narrative.test.ts` | relocate | `plugins/cli/topics/game/test/commands/game/play/choose-narrative.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/notifications/{advisor-warning,dismiss-reviewed,dismiss,list,schedule}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/play/population-placement.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{assign-worker,expand-city}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/priorities.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/play/production.test.ts` | relocate | `plugins/cli/topics/game/test/commands/game/play/build-production.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/progression-read.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{progress-dashboard,traditions}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/{ready-city,rehydrate}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/play/screen/{dismiss,show}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/play/semantic-envelope.test.ts` | relocate | `plugins/cli/topics/game/test/adapters/play/semantic-envelope.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/settlement-recommendations.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/play/tactical-read.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{civilian-route-triage,destination-analysis,formation-snapshot,front/scan,front/summary,front/target-candidates}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/technology.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{choose-tech,set-tech-target}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/topics.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/play/town-focus.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/{consider-town-project,set-town-focus}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/unit/{move-preview,promotion-readiness,ready,target}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/play/unit/resettle-upgrade.test.ts` | combine | `plugins/cli/topics/game/test/commands/game/play/unit/{resettle,upgrade}.test.ts` |
| `plugins/cli/topics/game/test/commands/game/play/watch.test.ts` | relocate | `plugins/cli/topics/game/test/commands/game/watch.test.ts` |
| `plugins/cli/topics/game/test/commands/game/restart.test.ts` | excluded unchanged | Same exact path |
| `plugins/cli/topics/game/test/commands/game/view/{appshot,camera}.test.ts` | excluded unchanged | Same exact paths |
| `plugins/cli/topics/game/test/commands/game/surface-contract.test.ts` | delete | No destination; Habitat topology and exact command mirrors own the surface |
| `plugins/cli/topics/game/test/support/normal-output-boundary.ts` | inline | Inline the output-boundary assertion into each exact consuming command proof |
| `plugins/cli/topics/game/test/support/normal-output-boundary.test.ts` | delete | No destination; command proofs own output projection |
| `plugins/cli/topics/game/test/support/{progression-tuner-server,tuner-socket-server,unit-command-tuner-server}.ts` | delete | No destination; command proofs consume test-supplied client fakes shaped like the app-bound command context rather than private socket servers |
| `plugins/cli/topics/game/test/tsconfig.json` | excluded unchanged | Same exact path |

### Git/mod topic and CLI shell

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| The exact five current files under `plugins/cli/topics/git-mod/test` | excluded unchanged | Same exact paths; four command mirrors and `test/tsconfig.json` |
| `apps/cli/test/shell.test.ts` | combine | `apps/cli/test/assembly/composition.test.ts` |
| `apps/cli/test/tsconfig.json` | excluded unchanged | Same exact path |

The CLI section covers 63 topic proof/support files and two shell files.

## Swooper Physics Definition

### Domain proof

The following finite current roots contain exactly 99 files:

- `plugins/mod/map/swooper-physics/test/domains/ecology/biomes`;
- `plugins/mod/map/swooper-physics/test/domains/ecology/features`;
- `plugins/mod/map/swooper-physics/test/domains/ecology/pedology`;
- `plugins/mod/map/swooper-physics/test/domains/ecology/plot-effects`;
- `plugins/mod/map/swooper-physics/test/domains/foundation`;
- `plugins/mod/map/swooper-physics/test/domains/hydrology`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/coasts`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/erosion`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/shelf`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/terrain`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/continental-margin-depth.test.ts`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/artifacts`;
- `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops`;
- `plugins/mod/map/swooper-physics/test/domains/placement`;
- `plugins/mod/map/swooper-physics/test/domains/resources/demand/artifacts`;
- `plugins/mod/map/swooper-physics/test/domains/resources/sites/artifacts`;
- `plugins/mod/map/swooper-physics/test/domains/resources/support/artifacts`.

That set is not a wholesale unchanged subtree. The following exact 36
operation-root tests select a concrete strategy and therefore relocate to that
strategy owner:

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-floodplains/planning.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-floodplains/strategies/highest-confidence/planning.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-ice/planning.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-ice/strategies/score-threshold/planning.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-reefs/habitat-and-stride.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-reefs/strategies/diagonal-stride/habitat-and-stride.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-wetlands/selection.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/features-plan-wetlands/strategies/habitat-confidence/selection.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/ecology/pedology/ops/pedology-classify/relief.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/ecology/pedology/ops/pedology-classify/strategies/balanced/relief.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/lithosphere/ops/compute-plate-graph/{polar-plates,resistance}.test.ts` | relocate | Preserve each filename under `plugins/mod/map/swooper-physics/test/domains/foundation/lithosphere/ops/compute-plate-graph/strategies/resistance-weighted-voronoi` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/mantle/ops/compute-mantle-potential/potential-field.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/mantle/ops/compute-mantle-potential/strategies/poisson-source-field/potential-field.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/mesh/ops/compute-mesh/topology.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/mesh/ops/compute-mesh/strategies/jittered-delaunay/topology.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-era-plate-membership/config.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-era-plate-membership/strategies/backward-drift/config.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-plate-motion/rigid-body-fit.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-plate-motion/strategies/rigid-body-fit/rigid-body-fit.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-tectonic-history-rollups/rollups.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-tectonic-history-rollups/strategies/cumulative-era-rollup/rollups.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-tectonic-segments/classification.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/foundation/tectonics/ops/compute-tectonic-segments/strategies/relative-motion-regimes/classification.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-atmospheric-circulation/geostrophic-proxy.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-atmospheric-circulation/strategies/geostrophic-proxy/geostrophic-proxy.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-pressure-field/thermal-continental.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-pressure-field/strategies/thermal-continental/thermal-continental.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-land-water-budget/riparian-moisture.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-land-water-budget/strategies/pet-aridity/riparian-moisture.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-precipitation/orographic-lift.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/compute-precipitation/strategies/vector/orographic-lift.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/refine-precipitation/riparian-basin-wetness.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/refine-precipitation/strategies/riparian-basin-wetness/riparian-basin-wetness.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/transport-moisture/advection.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/climate/ops/transport-moisture/strategies/vector-advection/advection.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/accumulate-discharge/{drainage-networks,sink-classification}.test.ts` | relocate | Preserve each filename under `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/accumulate-discharge/strategies/topological-runoff` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/compute-drainage-routing/terminal-routing.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/compute-drainage-routing/strategies/priority-flood/terminal-routing.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/plan-lakes/terminal-basins.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/plan-lakes/strategies/sink-discharge-budget/terminal-basins.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/project-river-network/classification.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/hydrography/ops/project-river-network/strategies/discharge-percentiles/classification.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-geometry/geometry.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-geometry/strategies/connected-basins/geometry.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-surface-currents/projection.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-surface-currents/strategies/wind-gyre-projection/projection.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-thermal-state/thermal-state.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/hydrology/ocean/ops/compute-ocean-thermal-state/strategies/latitude-current-advection/thermal-state.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/coasts/ops/compute-coastal-adjacency/shoreline.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/coasts/ops/compute-coastal-adjacency/strategies/wrapped-hex-adjacency/shoreline.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/coasts/ops/compute-distance-to-coast/distance.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/coasts/ops/compute-distance-to-coast/strategies/multi-source-hex-bfs/distance.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/compute-landmasses/components.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/compute-landmasses/strategies/wrapped-hex-components/components.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-foothills/skirt-controls.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-foothills/strategies/mountain-proximity/skirt-controls.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-ridges/{physics-gating,range-controls}.test.ts` | relocate | Preserve each filename under `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-ridges/strategies/orogenic-range-growth` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-rough-lands/constraints.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-rough-lands/strategies/relief-substrate-clusters/constraints.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-volcanoes/surface-coherence.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/plan-volcanoes/strategies/plate-hotspot-ranking/surface-coherence.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/morphology/shelf/ops/compute-shelf-mask/physical-break.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/shelf/ops/compute-shelf-mask/strategies/physical-break-connectivity/physical-break.test.ts` |

The following two cross-owner fixture cabinets do not survive:

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics/test/domains/morphology/terrain/ops/compute-belt-drivers/fixtures/belt-driver-evidence.ts` | inline | Exact consuming `boundary-closeness.test.ts` and `history-provenance.test.ts` leaves at their qualified owner; no fixture directory remains |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/compute-island-topography/fixtures/island-topography.ts` | inline | Exact consuming `microcontinent.test.ts` and `surface-coherence.test.ts` leaves at their qualified owner; no fixture directory remains |
| `plugins/mod/map/swooper-physics/test/domains/morphology/terrain/ops/compute-belt-drivers/{boundary-closeness,history-provenance}.test.ts` | combine | Preserve each filename under `plugins/mod/map/swooper-physics/test/domains/morphology/terrain/ops/compute-belt-drivers/strategies/history-derived`, with only its own evidence builder |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/compute-island-topography/{microcontinent,surface-coherence}.test.ts` | combine | Preserve each filename under `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/ops/compute-island-topography/strategies/plate-aware-volcanic`, with only its own setup |

These exact 35 further members currently import the root `test/setup.ts`; each
retains that import after moving to its otherwise selected destination.
Suite-wide Civ7 preset, map-seed, game-seed, and generic test-kit composition
remain centralized there. Subject-specific setup stays inline or colocated:

Every suffix below is relative to
`plugins/mod/map/swooper-physics/test/`.

- `domains/ecology/biomes/{artifacts/biome-classification,ops/classify-biomes/classification}.test.ts`;
- `domains/ecology/features/{artifacts/feature-intents,ops/compute-feature-substrate/substrate,ops/features-plan-vegetation/selection,ops/floodplain-score/alluvial-relief,reef-family-habitats,vegetation-family-habitats,vegetation-moisture-flow,wetland-family-habitats}.test.ts`;
- `domains/ecology/plot-effects/{ops/plan-plot-effects/jungle-hazard,ops/plan-plot-effects/sand-hazard,ops/plan-plot-effects/snow-hazard,snow-planning}.test.ts`;
- `domains/foundation/projection/artifacts/plate-topology.test.ts`;
- `domains/foundation/tectonics/artifacts/{tectonic-history,tectonic-provenance}.test.ts`;
- `domains/hydrology/climate/artifacts/climate-field.test.ts`;
- `domains/hydrology/hydrography/artifacts/{hydrography,lake-plan,projected-navigable-rivers}.test.ts`;
- `domains/morphology/erosion/ops/compute-geomorphic-cycle/{stream-power,surface-coherence}.test.ts`;
- `domains/morphology/landforms/artifacts/{mountains,volcanoes}.test.ts`;
- `domains/morphology/terrain/ops/{compute-base-topography/crust-baseline,compute-landmask/reconciliation,compute-sea-level/hypsometry}.test.ts`;
- `domains/placement/regions/ops/project-landmass-regions/assignment.test.ts`;
- `domains/placement/starts/{artifacts/start-assignment,ops/plan-starts/viability}.test.ts`;
- `domains/placement/wonders/{artifacts/natural-wonder-plan,ops/plan-natural-wonders/planning}.test.ts`;
- `domains/resources/{demand/artifacts/resource-demand-plan,sites/artifacts/resource-plan}.test.ts`.

The exact remaining 22 members of the frozen 99-file set are `excluded
unchanged` at the same relative path. "Remaining" means the 99 identities under
the exact roots above minus the 36 strategy rows, two fixture rows, four
fixture-consuming test rows, and 35 root-setup consumers, not a future
directory glob.

Eight domain proofs move to their now-qualified kind owner:

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/mountain-family/physics-anchored.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/morphology/landforms/mountain-family-physics.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/resources/demand/policy/{earthlike-expectations,initial-map-authoring,resource-region-minimum}.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/resources/demand/model/policy/{earthlike-expectations,initial-map-authoring,resource-region-minimum}.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/resources/demand/resolution/planning.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/resources/demand/ops/resolve-resource-demands/planning.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/resources/habitat/derive-fields.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/resources/habitat/ops/derive-habitat-fields/derive-fields.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/resources/sites/selection.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/resources/sites/ops/select-resource-sites/selection.test.ts` |
| `plugins/mod/map/swooper-physics/test/domains/resources/support/adjustment.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/domains/resources/support/ops/adjust-resource-support/adjustment.test.ts` |

One additional policy proof already occupies its qualified owner and remains
outside the frozen root set:

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics/test/domains/resources/model/policy/qualifying-landmass-density.test.ts` | excluded unchanged | Same exact path |

### Standard recipe proof

All 70 files move from the exact old root
`plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard` to the
exact new root `plugins/mod/map/swooper-physics/test/recipes/standard`.

The following 46 files preserve their relative suffix:

- `{generation,initial-setup,rng-authority}.test.ts`;
- `metrics/catalog-identity.test.ts`;
- `metrics/families/{ecology/classification,geography/integrity,hydrology/integrity,hydrology/lake-projection,hydrology/pressure-structure,hydrology/river-network,hydrology/wind-structure,placement/discovery-placement,placement/homeland-distribution,placement/natural-wonder-placement,placement/natural-wonder-plan-input,placement/resource-placement,product/integrity,product/studies,relief/elevation,resources/distribution}.test.ts`;
- `parity/{correlation,live-observation,placement-exact-log,report}.test.ts`;
- `trace/morphology-emissions.test.ts`;
- `viz/{ecology/biomes,ecology/feature-types,ecology/plot-effects,emissions,placement}.test.ts`;
- `stages/ecology/projection/steps/{features-apply/projection,plot-biomes/projection,plot-effects/projection}.test.ts`;
- `stages/foundation/tectonics/steps/tectonics/config.test.ts`;
- `stages/hydrology/climate/baseline/steps/climate-baseline/{composition,config}.test.ts`;
- `stages/hydrology/climate/refine/steps/climate-refine/config.test.ts`;
- `stages/hydrology/hydrography/steps/{lakes/config,rivers/config}.test.ts`;
- `stages/hydrology/rivers/steps/plot-rivers/config.test.ts`;
- `stages/morphology/coasts/steps/landmass-plates/config.test.ts`;
- `stages/morphology/erosion/steps/geomorphology/config.test.ts`;
- `stages/morphology/features/steps/{mountains/config,volcanoes/config}.test.ts`;
- `stages/morphology/shelf/steps/compute-shelf/config.test.ts`;
- `stages/placement/discovery-generation.test.ts`.

The three cross-owner fixture cabinets dissolve into their exact current
consumers:

| Exact old relative suffix | Disposition | Exact destination |
| --- | --- | --- |
| `fixtures/standard-recipe.ts` | inline | The 23 exact current importing proof leaves at their own recipe, stage, step, or map-config destination; no recipe-root fixture survives |
| `metrics/fixtures/standard-product.ts` | inline | The nine exact current importing metric-family leaves; no cross-family metric fixture survives |
| `stages/ecology/features/fixtures/feature-score-layers.ts` | inline | The four exact current importing feature-publication step leaves; no stage fixture cabinet survives |

These exact 21 files normalize to these exact suffixes:

| Exact old relative suffix | Disposition | Exact new relative suffix |
| --- | --- | --- |
| `complete-config-boundary.type-test.ts` | relocate | `complete-config-boundary.typecheck.ts` |
| `initial-setup.type-test.ts` | relocate | `initial-setup.typecheck.ts` |
| `metrics/metric-scenario.test.ts` | relocate | `metrics/scenario.test.ts` |
| `stages/ecology/biomes/steps/biomes/publication.test.ts` | relocate | `stages/ecology/biomes/steps/biomes/artifacts/biome-classification.test.ts` |
| `stages/ecology/features/model/policy/derive-feature-occupancy.test.ts` | relocate | `stages/ecology/features/derive-feature-occupancy.test.ts` |
| `stages/ecology/features/steps/plan-floodplains/publication.test.ts` | relocate | `stages/ecology/features/steps/plan-floodplains/artifacts/floodplain-intents.test.ts` |
| `stages/ecology/features/steps/plan-reefs/publication.test.ts` | relocate | `stages/ecology/features/steps/plan-reefs/artifacts/reef-intents.test.ts` |
| `stages/ecology/features/steps/plan-vegetation/publication.test.ts` | relocate | `stages/ecology/features/steps/plan-vegetation/artifacts/vegetation-intents.test.ts` |
| `stages/ecology/features/steps/plan-wetlands/publication.test.ts` | relocate | `stages/ecology/features/steps/plan-wetlands/artifacts/wetland-intents.test.ts` |
| `stages/hydrology/projection/steps/lakes.store-water-data.test.ts` | relocate | `stages/hydrology/projection/steps/lakes/store-water-data.test.ts` |
| `stages/hydrology/projection/steps/project-rainfall.test.ts` | relocate | `stages/hydrology/projection/steps/project-rainfall/projection.test.ts` |
| `stages/hydrology/rivers/model/policy/navigable-river-projection.test.ts` | relocate | `stages/hydrology/rivers/navigable-river-projection.test.ts` |
| `stages/hydrology/rivers/steps/plot-rivers.post-refresh.test.ts` | relocate | `stages/hydrology/rivers/steps/plot-rivers/post-refresh.test.ts` |
| `stages/morphology/elevation/steps/build-elevation.no-water-drift.test.ts` | relocate | `stages/morphology/elevation/steps/build-elevation/no-water-drift.test.ts` |
| `stages/morphology/projection/steps/plot-coasts.test.ts` | relocate | `stages/morphology/projection/steps/plot-coasts/projection.test.ts` |
| `stages/placement/steps/assign-starts.materialization.test.ts` | relocate | `stages/placement/steps/assign-starts/materialization.test.ts` |
| `stages/placement/steps/observe-placement-parity.test.ts` | relocate | `stages/placement/steps/observe-placement-parity/observation.test.ts` |
| `stages/placement/steps/place-natural-wonders.materialization.test.ts` | relocate | `stages/placement/steps/place-natural-wonders/materialization.test.ts` |
| `stages/placement/steps/place-resources.materialization.test.ts` | relocate | `stages/placement/steps/place-resources/materialization.test.ts` |
| `stages/placement/steps/plan-natural-wonders.test.ts` | relocate | `stages/placement/steps/plan-natural-wonders/planning.test.ts` |
| `stages/placement/steps/plot-landmass-regions.materialization.test.ts` | relocate | `stages/placement/steps/plot-landmass-regions/materialization.test.ts` |

### Definition root and maps

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics/test/setup.ts` | combine | Same exact path, narrowed to suite-wide switchable Civ7 map-size, map-seed, game-seed, and generic test-kit composition; its 105 current importers retain only the shared defaults they actually consume, while subject-specific tests opt out explicitly |
| `plugins/mod/map/swooper-physics/test/maps/catalog-generation.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/maps/catalog/projection.test.ts` |
| `plugins/mod/map/swooper-physics/test/maps/catalog-membership.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/maps/catalog/membership.test.ts` |
| `plugins/mod/map/swooper-physics/test/maps/create-map-config.type-test.ts` | relocate | `plugins/mod/map/swooper-physics/test/maps/configs/authoring.typecheck.ts` |
| `plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts` catalog-order assertions | combine | `plugins/mod/map/swooper-physics/test/maps/catalog/membership.test.ts` |
| `plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts` envelope admission assertions | combine | `plugins/mod/map/swooper-physics/test/maps/configs/admission.test.ts` |
| `plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts` source write/rollback assertions | combine | `apps/mapgen-studio/test/execution/adapters/swooper-map-config-source.test.ts` |
| `plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts` whole-recipe compilation assertions | combine | `plugins/mod/map/swooper-physics/test/recipes/standard/configuration.test.ts` |
| `plugins/mod/map/swooper-physics/test/generated/standard-generated-artifacts.test.ts` | relocate | `apps/mods/map/swooper-physics/test/artifact/standard-generated-artifacts.test.ts` |
| `plugins/mod/map/swooper-physics/test/{.gritignore,README.md,scripts/diagnostic-command-inputs.test.ts,tsconfig.json}` | delete | No destination; Habitat structure/source law, CLI command mirrors, and owning-project compiler programs own these concerns |

The section covers 108 domain files, 70 recipe files, and ten root/map/script
files, for 188 files total.

## Swooper Physics Realization

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `apps/mods/map/swooper-physics/test/build/fixtures/civ7-map-script-compatibility.ts` | relocate | `apps/mods/map/swooper-physics/test/runtime/civ7-map-script-compatibility.fixture.ts` |
| `apps/mods/map/swooper-physics/test/build/map-bundle-runtime-compatibility.test.ts` | relocate | `apps/mods/map/swooper-physics/test/runtime/map-bundle-runtime-compatibility.test.ts` |
| `apps/mods/map/swooper-physics/test/maps/map-artifact-file-plan.test.ts` | relocate | `apps/mods/map/swooper-physics/test/artifact/map-artifact-file-plan.test.ts` |
| `apps/mods/map/swooper-physics/test/maps/run-manifest-generation.test.ts` | relocate | `apps/mods/map/swooper-physics/test/artifact/run-manifest.test.ts` |
| `apps/mods/map/swooper-physics/test/scripts/verify-final-surface-parity.test.ts` | relocate | `plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/parity/final-surface-parity.test.ts` |
| `apps/mods/map/swooper-physics/test/scripts/verify-studio-run-in-game-live.test.ts` | relocate | `apps/mods/map/swooper-physics/test/deployment/studio-run-in-game.test.ts` |
| `apps/mods/map/swooper-physics/test/setup.ts` | combine | Same exact path, narrowed to suite-wide switchable Civ7 map-size, map-seed, and game-seed defaults; subject fixtures remain with their exact consumers |
| `apps/mods/map/swooper-physics/test/tsconfig.json` | combine | Same exact path, narrowed to the realization's closed generic-app, artifact, deployment, runtime, and live axes |

No current Swooper realization test is a live proof. The two required live
suites listed below are new and must run against real Civ7 observations. Final
surface parity remains recipe-owned even though the realization's live target
executes it.

### Adjacent engine-adapter proof realignment

The following 17 current proof files were not members of the sealed 461-file
census and therefore do not change its arithmetic. They are nevertheless
mandatory downstream realignment for the engine-adapter split:

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/civ7-adapter/test/{civ7-current-map-layers,civ7-natural-wonder-placement,civ7-official-discovery-generation,civ7-resource-placement,civ7-river-projection,civ7-runtime-warning,resource-age-requirement}.test.ts` | combine | `apps/mods/map/swooper-physics/test/runtime/map-script-adapter.test.ts` |
| `packages/civ7-adapter/test/map-generation-setup.test.ts` | combine | `apps/mods/map/swooper-physics/test/runtime/map-script-setup.test.ts` |
| `packages/civ7-adapter/test/map-script-build.test.ts` | combine | `apps/mods/map/swooper-physics/test/runtime/map-script-entrypoint.test.ts` |
| `packages/civ7-adapter/test/{map-metadata,mock-adapter-rng,mock-adapter,mock-terrain-policy,placement-outcomes}.test.ts` | relocate | Preserve each filename under `packages/civ7-adapter/test/semantics` after engine-global fragments have moved |
| `packages/civ7-adapter/test/tsconfig.json` | combine | `packages/civ7-adapter/tsconfig.test.json`, narrowed to the selected contract and semantics leaves |
| `packages/sdk/test/mapgen-create-map.test.ts` | combine | `apps/mods/map/swooper-physics/test/runtime/map-script-entrypoint.test.ts` |
| `packages/sdk/test/mapgen-create-map.type-test.ts` | combine | Type assertions compile inside `apps/mods/map/swooper-physics/test/runtime/map-script-entrypoint.test.ts`; no unselected realization proof axis is invented |

`packages/mapgen-core/test/lib/noise/perlin.test.ts` is adjacent portable
MapGen proof and remains `excluded unchanged`; it is not part of the 461-file
capability-realization census.

## False Plugin, Bridge, Workspace, And UI

### False plugin collapse

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/plugins/plugin-mods/test/basic.test.ts#deployMod validates input and id then copies` pure validation, path-plan, and receipt assertions | combine | `packages/civ7-mod-install/test/semantics/installation-plan.test.ts` |
| `packages/plugins/plugin-mods/test/basic.test.ts#{resolveModsDir returns darwin path on mac,resolveModsDir returns Documents/My Games path on win32}` | combine | The eventual qualified local-mod installation provider during Estate Reconciliation; no decorative app profile destination |
| `packages/plugins/plugin-mods/test/basic.test.ts#listMods filters to directories` | combine | `apps/cli/test/execution/adapters/local-mods.test.ts` |
| `packages/plugins/plugin-mods/test/basic.test.ts#deployMod validates input and id then copies` Swooper identity binding | combine | `apps/mods/map/swooper-physics/test/deployment/local-mod-install.test.ts`; generic copy/provider proof remains with the transitional package until Estate Reconciliation |
| `packages/plugins/plugin-mods/test/tsconfig.json` | delete | No destination; the pure package, mod realization, and CLI app adapter own their exact proof compilers |

### Completed intelligence-bridge retirement

Commit `8d0d4983ba` deleted all 19 historical files under
`mods/mod-civ7-intelligence-bridge/test`. Native engine facts moved to the
engine reference, and control semantics remain with the control-service
modules. No bridge support helper or duplicate behavior suite remains in the
current 461-file corpus.

### Studio run workspace

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/studio-run-workspace/test/generationManifest.test.ts#{allocates request workspace paths and a stable artifact id,preserves signed seed boundaries and rejects invalid manifest seed values,computes the manifest digest from canonical sorted payload JSON only}` | relocate | `packages/studio-run-workspace/test/semantics/generation-manifest.test.ts` |
| `packages/studio-run-workspace/test/generationManifest.test.ts#{writes exactly one manifest under the request workspace,gives sequential same-content requests fresh manifest identity,finalizes snapshot bytes and digest before filesystem awaits}` | combine | `apps/mapgen-studio/test/execution/adapters/studio-run-files.test.ts` |
| `packages/studio-run-workspace/tsconfig.test.json` | excluded unchanged | Same exact path |
| `packages/studio-run-workspace/vitest.config.ts` | excluded unchanged | Same exact path |

### MapGen Studio UI

| Exact current source | Disposition | Exact destination |
| --- | --- | --- |
| `packages/mapgen-studio-ui/test/{GameConsole,PipelineStage}.test.tsx` | combine | Same exact paths after the public DTO owner changes |
| `packages/mapgen-studio-ui/test/recipeDagLayout.test.ts` | combine | Same exact path after the public DTO owner changes |
| `packages/mapgen-studio-ui/test/{AppBrand,AppFooter,AppHeader,MapConfigSaveDialog,RecipePanel,SegmentedControl,configFormStructure,plainCnMarkup,rjsfFieldTemplateErrors,sonnerTheme,waterStatsSection}.test.tsx` | excluded unchanged | Same exact paths |
| `packages/mapgen-studio-ui/test/{artifactPresentation,designSyncOutputAssertions,designTokens,domainPresentation,lightCanaryResult,lightCanaryServer,storyContract,themeTokens,typeboxRjsfValidator}.test.ts` | excluded unchanged | Same exact paths |
| `packages/mapgen-studio-ui/test/pipelineConfig.type-test.ts` | excluded unchanged | Same exact path |
| `packages/mapgen-studio-ui/test/fixtures/{authored-tokens,framework-tokens,plain-cn-markup,recipe-dag-layout,token-contract}.json` | excluded unchanged | Same exact paths |
| `packages/mapgen-studio-ui/tsconfig.test.json` | excluded unchanged | Same exact path |

This final UI table covers three combined tests, 26 unchanged proof/support
files, and one unchanged compiler file.

## New Proof Required By The Target Laws

The following proof cannot be obtained by renaming a current suite. It is new
proof against the target construction and must be authored after its
destination law exists:

The Studio API has no selected service-contract subtree or nested service-test
interior. Its root owns the complete closed caller contract, delegates only
bound clients, and owns the projection and selected execution proof below.

| Exact new proof | Required oracle |
| --- | --- |
| `resources/civ7-tuner/test/contract/contract.typecheck.ts` | Consumers compile against only the provider-neutral ready Tuner contract carrying raw health, command, and connection facts; provider assignability is proved independently by its public implementation typecheck and one-way Nx edge |
| `resources/window-capture/test/contract/contract.typecheck.ts` | Provider and consumers compile against only generic window selection, destination, raw capture evidence, and typed provider-neutral failures; no Civ7 identity or appshot policy is reachable |
| `resources/civ7-tuner/providers/local-socket/test/collaboration/provider.live.test.ts` | Real local-socket framing and listener collaboration against the supported Tuner |
| `resources/window-capture/providers/macos-screencapturekit/test/execution/lifecycle.test.ts` | New target law: interruption and release close admission, apply bounded `SIGTERM`/`SIGKILL` escalation, and drain admitted work without escaping filesystem effects; released providers refuse work; interrupted writes leave no partial destination, while an entered publication commit completes atomically |
| `resources/window-capture/providers/macos-screencapturekit/test/collaboration/provider.live.test.ts` | One opt-in real ScreenCaptureKit/TCC/window proof on macOS without Civ7-specific matching or semantic claims |
| `services/civ7-control/test/contract/client.typecheck.ts` | The sole public client face, including any owned-contract re-export, exposes exactly `{app,game,map,ui}` without router, implementation, facade, or provider leakage |
| `services/civ7-control/test/execution/root.test.ts` | App-supplied dependency binding, per-call correlation isolation, and once-only execution through the public client with distinct fake dependencies; provider lifecycle and generic oRPC/Effect internals remain with their owning proofs |
| `services/civ7-play/test/contract/client.typecheck.ts` | The sole public client face, including any owned-contract re-export, exposes exactly `{attention,automation,city,diplomacy,notifications,progression,planning,turn,unit}` over the public control client with no Tuner-backed port, router, implementation, or provider leakage |
| `services/civ7-play/test/execution/root.test.ts` | Private-router middleware order, request isolation, one-way delegation through the bound control client, and once-only direct Effect-to-procedure adaptation with typed dependency, error, interruption, cancellation, and finalization lineage |
| `services/mapgen-runs/test/contract/client.typecheck.ts` | Save/Deploy and Run-in-Game clients expose only the accepted public service contract |
| `services/mapgen-runs/test/execution/root.test.ts` | Middleware order, request isolation, records, retention, cancellation, leases, event state, and once-only direct Effect-to-procedure adaptation through fake ready ports, including typed dependency, error, interruption, and finalization lineage |
| `plugins/server/api/mapgen-studio/test/contract/client.typecheck.ts` | The exact public Studio route tree compiles from API-owned caller contracts without importing a service contract subtree, router, implementation, or other service-private source |
| `plugins/server/api/mapgen-studio/test/projection/authoring.test.ts` | Saved configurations, official setup catalog, and recipe-DAG routes faithfully project their declared app-selected dependencies |
| `plugins/server/api/mapgen-studio/test/projection/control.test.ts` | Every frozen control, live-control, and play-compatibility route delegates the bound control or play client, while `civ7.autoplay` explicitly delegates the bound MapGen-runs autoplay client; no service contract subtree is composed |
| `plugins/server/api/mapgen-studio/test/projection/errors.test.ts` | Every declared route error is exact, unexpected defects remain sealed, and the private adaptation preserves error/interruption origin rather than manufacturing a compatibility tunnel |
| `plugins/server/api/mapgen-studio/test/projection/router.test.ts` | The frozen route tree and server-identity projection compose once without collision or alias; every Effect-backed route adapts directly at the private implementation/router boundary and public `api.ts` registers that router once without choosing or mounting transport |
| `plugins/server/api/mapgen-studio/test/projection/runs.test.ts` | Current operations, Autoplay, Save/Deploy, Run-in-Game, diagnostics, status, and cancellation faithfully project MapGen-runs clients |
| `plugins/server/api/mapgen-studio/test/execution/live-game-watcher.test.ts` | Watcher publication, quiet equality, diagnostics-only failures, replay, and scoped release |
| `plugins/server/api/mapgen-studio/test/execution/studio-events.test.ts` | Hello, replay, publication, cancellation, and subscriber release use the accepted API-owned event scope |
| `packages/mapgen-config/test/contract/contract.typecheck.ts` | Consumers compile against only the portable map-config envelope contract |
| `packages/civ7-adapter/test/contract/contract.typecheck.ts` | Consumers compile against only pure EngineAdapter/types/mock/static-metadata exports; no engine-global or map-entrypoint export is reachable |
| `packages/civ7-mod-install/test/contract/contract.typecheck.ts` | Consumers compile against only pure path grammar, supplied-tree validation, replacement-plan, digest, and typed-receipt exports without filesystem capability |
| `packages/civ7-mod-install/test/semantics/installation-plan.test.ts` | Invalid identifiers and paths are rejected; supplied observations deterministically yield wholesale replacement plans, digest comparisons, counts, and typed receipts without reading or mutating a host filesystem |
| `packages/civ7-save-files/test/contract/contract.typecheck.ts` | Consumers compile against pure saved-config parsing and DTO contracts without filesystem capability |
| `packages/studio-run-workspace/test/contract/contract.typecheck.ts` | Consumers compile against pure correlation, path-plan, manifest parse/serialize, and comparison contracts without filesystem capability |
| `apps/cli/test/assembly/composition.test.ts` | Exact topic membership, Tuner and window-capture providers, app-bound public clients, configuration, and process facts |
| `apps/cli/test/execution/{binding,finalization}.test.ts` | Native Oclif demand binding and once-only command-process finalization |
| `apps/mapgen-studio/test/assembly/composition.test.ts` | Exact Tuner/window-capture providers, app-bound public clients, configuration roots, cold adapters, API/web plugins, and process facts, including official-data roots; while extension-free adaptation is selected, no prototype-mutation bootstrap is present |
| `apps/mapgen-studio/test/execution/hosts/{server,web,dev}.test.ts` | Each native Bun/Vite/server/web host entrypoint starts, mounts only the selected API registration and web projection, preserves request-signal/interruption behavior, observes, and disposes its exact roles |
| `apps/mapgen-studio/test/execution/adapters/{civ7-save-files,studio-run-files,fresh-log-files,civ7-official-data,swooper-map-config-source}.test.ts` | Each selected Studio cold adapter alone owns its exact filesystem effects and release/failure behavior |
| `apps/mapgen-studio/test/execution/adapters/swooper-map-realization.test.ts` | The app-owned adapter implements the public MapGen-runs realization descriptor by invoking only the Swooper realization's finite public Nx targets, preserves target failure/cancellation evidence, and imports neither realization source nor outcome authority |
| `plugins/mod/map/swooper-physics/test/definition.test.ts` | Product identity, public definition face, and finite authored capability membership |
| `plugins/mod/map/swooper-physics/test/authoring/targets.test.ts` | Exact cold authoring target table and deterministic currentness contract |
| `apps/mods/map/swooper-physics/test/runtime/{map-script-adapter,map-script-setup,map-script-entrypoint}.test.ts` | The exact manifest-selected runtime subjects prove engine-global adapter/setup and map-loader execution only at the mod realization; the entrypoint suite also compiles its definition/EngineAdapter boundary |
| `apps/mods/map/swooper-physics/test/deployment/local-mod-install.test.ts` | The finite app binds its built tree to the exact Swooper Civ7 mod identity through the qualified local-install adapter |
| `plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/parity/final-surface-parity.live.test.ts` | Recipe-owned uncached real-Civ7 final-surface parity, executed by the realization's live target |
| `apps/mods/map/swooper-physics/test/live/studio-run-in-game.live.test.ts` | Uncached real loader/runtime acceptance of the Studio-run realization |

The CLI topic mirror law also makes these current gaps new proof if their
production leaves survive the source cutover:

- `plugins/cli/topics/game/test/commands/game/{autoplay,local-data/inspect}.test.ts`;
- `plugins/cli/topics/game/test/adapters/map/world-read.test.ts`;
- `plugins/cli/topics/game/test/adapters/play/semantic-envelope.test.ts`;
- `plugins/cli/topics/mapgen/test/commands/mapgen/diagnostics/{diff,trace,list,dump}.test.ts`;
- `plugins/cli/topics/mapgen/test/commands/mapgen/metrics/report.test.ts`;
- `apps/cli/test/execution/adapters/local-mods.test.ts`;
- `plugins/cli/topics/git-mod/test/commands/git/subtree/{clear,import,list,pull,push,remove,setup,status,update}.test.ts`;
- `plugins/cli/topics/git-mod/test/commands/mod/git/{clear,list,pull,push,remove,setup,update}.test.ts`;
- `plugins/cli/topics/git-mod/test/adapters/subtree/{subtree-clear-config-base,subtree-command,subtree-config-remote-base,subtree-import-base,subtree-list-config-base,subtree-pull-base,subtree-push-base,subtree-remove-config-base,subtree-status-base}.test.ts`.

These leaves are not relabels of mixed command tests. Their command/adapter
oracles must be written at the exact source mirror after the target source
surface is frozen. The CLI app adapter proves runtime-context translation,
host effects, failure translation, and cleanup; topic tests prove command
presentation over that bound capability without repeating adapter or pure
package semantics.

## Separate DRA Corpus

Architecture rules, baselines, injected fixtures, and Habitat runner support
under `.habitat/blueprints`, `.habitat/civ7`, `.habitat/baselines`, and
`tools/habitat` are excluded unchanged from this 461-file corpus. They form a
separate Designer/Engineer workstream. No target source move may mutate or
baseline them until the corresponding target kind law, membership authority,
fixture strategy, and current-tree proof are accepted. This capability ledger
does not invent a Habitat service-kind implementation target or any Habitat
proof leaf.

## Closure

The proof cutover is closed only when:

1. every one of the 461 current files has the single disposition recorded
   here;
2. every reconstructed assertion passes at its named owner before the old
   source is deleted;
3. every new proof listed above passes against the target substrate;
4. every admitted test directory is closed by its kind-specific, domain-shaped
   proof law;
5. no generic support cabinet, facade fixture, socket-server fixture, old
   compiler, duplicate schema test, or deterministic suite mislabeled as live
   proof survives;
6. the exact arithmetic remains
   `42 + 38 + 5 + 10 + 70 + 63 + 2 + 188 + 8 + 2 + 0 + 3 + 30 = 461`.
