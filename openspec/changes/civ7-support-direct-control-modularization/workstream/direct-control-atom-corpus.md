# Direct-Control Atom Corpus

This ledger has the completed direct-control inventory and package-test boundary
reports merged. It is still pre-code planning: do not edit direct-control source
until the target atom row names exact source ranges, module owner,
public/private exports, required tests, consumers, and proof class for the
slice. The package evidence is now split across focused atom-owned package
tests; future source extraction starts from those owners, not from a broad
suite or source move first.

Each future source row must also classify its output by consumer before command
hierarchy or oRPC work depends on it:

- **Internal service machinery:** transport/session state, verification traces,
  correlation data, raw command payloads, retry/closeout internals, and
  postcondition plumbing that belongs inside `@civ7/direct-control` or procedure
  middleware.
- **Debug-only diagnostics:** intentional CLI/debug surfaces for inspecting
  connection health, route selection, transport failures, raw runtime probes, or
  proof artifacts.
- **Player-agent semantics:** normal CLI play output describing game state,
  blockers, decisions, safe/unsafe actions, and next steps without exposing the
  full service JSON payload.

Before CLI semantic, telemetry, AI-intelligence, or procedure-core work depends
on a direct-control atom, future rows or follow-up matrices must also classify:

- `playerScope`: global, local-player-scoped, agent-slot-scoped,
  human-turn-visible, or debug/observer-only.
- `consumerClass`: normal CLI player-agent view, AI-intelligence ingestion,
  debug/internal service output, Effect/oRPC procedure core, static profile
  shaping, or runtime proof support.
- `evidenceClass`: target-thread evidence, repo docs, local package tests, CLI
  tests, official resources, logs/database artifacts, live runtime proof, or
  in-game observation.
- `procedureCandidate`: ready for a typed procedure core, needs schema/type
  extraction first, needs live proof first, or debug-only.
- `normalCliProjection`: semantic projection, omitted field, summarized
  state-machine status, or debug flag/command only.
- `debugServiceProjection`: raw diagnostic projection, proof telemetry,
  transport/session detail, correlation/audit detail, or intentionally omitted.

Task 2.9 matrix-row acceptance is a hard dependency for any downstream command
hierarchy, semantic envelope, telemetry, schema/type ownership, runtime-status
projection, debug/internal service output, AI data artifact, Effect/Bun, or
oRPC procedure-core implementation. A row is not accepted until it carries:
`foundationThread`, `modelThread`, `dependencyDirection`, `surface`,
`primaryConsumer`, `sourceOwner`, `proofOwner`, `playerScope`,
`consumerClass`, `evidenceClass`, `procedureCandidate`,
`normalCliProjection`, `debugServiceProjection`, `proofLabel`,
`acceptanceStatus`, `blockingDependents`, and `stopCondition`.

The live row artifact is `compatibility-matrix.md`. Atom rows may continue as
local package/source relocation work only when they do not depend on the
pending matrix rows. Any atom that feeds CLI semantic envelopes, debug/internal
service output, AI ingestion, operation/proof telemetry, runtime-status
projection, or Effect/oRPC procedure cores must first satisfy or explicitly
remain blocked by the corresponding matrix row.

| Atom Candidate                            | Source Region                                                                                                                                                                                                             | Proposed Owner                                                                                          | Existing Evidence / Consumers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required Before Extraction                                                                                                                                                                                                                                                                         | Runtime Proof                                                                   | Status                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Public constants/types/schemas            | `index.ts` lines 8-1780: tuner defaults, state names, command constants, API roots, bounds, `Civ7ComponentIdSchema`, runtime probe and play result/input types, operation/postcondition types, capability catalog schemas | `src/primitives/*`, `src/types/*`, `src/constants/*` with package barrel compatibility                  | `test/public-api.test.ts` now owns component ID schema/assertion, capability catalog schema facade re-exports, default tuner host/port, state/command constants, API root catalogs, setup parameters, autoplay defaults, unit-target verification defaults, default scripting-log path, and representative limit constants. `test/validation.test.ts` owns focused bounded integer, simple identifier, player-id validation, map validation, error-message, and sleep primitive proof. `src/civ7-component-id.ts` owns the ComponentID schema/type guard/assertion; `src/direct-control-error.ts` owns direct-control error typing needed by that assertion and future session atoms. `src/action-approval.ts` owns the `Civ7ActionApproval` primitive and shared `assertApproved` helper; internal modules now import the approval type from its owner or the operation type owner instead of from the public facade, while public facade re-exports stay stable. `src/session/types.ts`, `src/session/session.ts`, runtime atom modules, and `src/play/operations/types.ts` own command/session/runtime/operation-family types used internally; internal source modules import those types from owners instead of from the public facade, while public facade re-exports stay stable for CLI and Studio consumers. `src/validation.ts` owns generic bounded integer, simple identifier, and player-id validation helpers while `src/play/map/validation.ts` owns map-specific validation. `src/error-message.ts` owns the facade-injected error stringifier and `src/timing.ts` owns the facade-injected sleep primitive while owner-local waits/errors remain in their current modules until a named Effect/Bun resource/schedule/layer pass. `src/session/types.ts` owns tuner state, tuner state selection, direct-control endpoint/options, command-result, and direct-control health public types while facade type re-exports stay in `index.ts`. `src/catalog/capabilities.ts` owns `Civ7CapabilityCatalogEntrySchema`, `Civ7CapabilityCatalogSchema`, their derived catalog entry/result types, `Civ7CapabilityCatalogOptions`, and capability catalog App UI/Tuner root defaults while public facade re-exports stay in `index.ts`. `src/runtime/inspection-constants.ts` owns the runtime inspection default App UI/Tuner root catalogs and bounded root `maxKeys`/`maxMethods` defaults while public facade re-exports stay in `index.ts`. `src/setup/constants.ts` owns setup/lifecycle command strings, UI loading-state values, the derived UI loading-state name type, and setup parameter IDs while public facade re-exports stay in `index.ts`. `src/session/constants.ts` owns default tuner host/port/timeout and App UI/Tuner state-name constants while public facade re-exports stay in `index.ts`. `src/play/map/constants.ts` owns GameInfo table defaults, map grid bounds, and GameInfo row bounds while public facade re-exports stay in `index.ts`. `src/play/autoplay.ts` owns autoplay default max-turn/wait/poll/stability constants while public facade re-exports stay in `index.ts`. `src/play/operations/unit-target-action.ts` owns unit-target post-send verification timing constants while public facade re-exports stay in `index.ts`. `src/proof/log-markers.ts` owns the default scripting-log path while public facade re-exports stay in `index.ts`. CLI and Studio import the public facade. Protected user TODO says tests first, then modularize/export constants/types where consumers need them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Continue extracting only named primitive/constant/type owners with existing or concrete consumer proof. Do not create a broad types dump or move runtime source strings under this row.                                                                                                              | not runtime proof for type-only extraction                                      | ComponentID primitive, direct-control error owner, action approval primitive/helper owner plus internal back-import cleanup, internal command/session/runtime/operation-family type back-import cleanup, generic validation primitive/helper owner, map validation helper owner, facade dependency error-message/sleep primitive owners, session endpoint/state/command-result/health result type owner, UI loading-state name type owner, capability catalog schema/options/root constants owner, runtime inspection constants owner, setup/lifecycle constants owner, session endpoint/state constants owner, map/GameInfo constants owner, autoplay constants owner, unit-target verification constants owner, and scripting-log path owner extracted; remaining constants/types source extraction pending. |
| Transport/session/framing                 | `index.ts` lines 1817-2076 and 3758-3904: config, endpoint discovery, `Civ7DirectControlSession`, state selection, frame encode/parse, socket lifecycle, pending requests                                                 | `src/session/{config,error,state,frame,socket,session,execute,reconnect,health,command-result}.ts`; `src/runtime/tuner-health.ts` for Tuner readiness waits | `test/session.test.ts` now owns health/env-host resolution, endpoint discovery fallback and `all-hosts-unavailable` details, direct-control wait readiness/timeout behavior, socket-open success and `connection-failed` classification, listener-id allocation, direct-control config resolution, state selection, LSQ state-parts parsing, frame encode/parse, framed command execution, command-result JSON payload parsing/error details, missing-state error classification, and fresh log marker proof. `test/public-api.test.ts` owns direct-control request-id helper format. `test/restart-lifecycle.test.ts` now owns restart/begin lifecycle routing, direct public Tuner-ready wait routing, and restart-output guards. `src/session/config.ts` owns direct-control config resolution and private host/env/port helpers behind facade re-export. `src/session/discovery.ts` owns the public endpoint discovery wrapper, dependency-injected endpoint discovery helper, host fallback, and unavailable-host classification while `src/session/execute.ts` owns state-query execution. `src/session/framing.ts` owns tuner frame encode/parse helpers behind the package facade. `src/session/command-result.ts` owns the command-result JSON payload parser and invalid JSON error details while wrappers still inject it from `index.ts`. `src/session/health.ts` owns `checkCiv7DirectControlHealth`, `waitForCiv7DirectControl`, endpoint discovery composition, health status classification, selected-state reporting, typed error wrapping, health polling, and timeout classification. `src/runtime/tuner-health.ts` owns `checkCiv7TunerHealth`, `checkCiv7TunerHealthWithSession`, `waitForCiv7TunerReady`, and `waitForCiv7TunerReadyWithSession` while `index.ts` still owns setup/restart lifecycle composition. `src/session/listener-id.ts` owns listener-id allocation and its private counter. `src/session/request-id.ts` owns the direct-control request-id helper behind facade re-export. `src/session/socket.ts` owns socket opening and connection error classification. `src/session/session.ts` owns `Civ7DirectControlSession`, private pending-request lifecycle, socket connection fallback, LSQ state queries, framed command execution, and request timeout/close/error classification. `src/session/execute.ts` owns package-level `queryCiv7TunerStates`, `executeCiv7Command`, `executeCiv7AppUiCommand`, and `executeCiv7TunerCommand` wrappers. `src/session/reconnect.ts` owns the private session command reconnect helper while `index.ts` still owns lifecycle composition and public facade call-through. `src/session/state.ts` owns tuner state selection, LSQ state-parts parsing, and the private role/name/id normalizer behind facade re-export. `src/session/types.ts` owns session endpoint/state/options, command-result, and direct-control health public types behind facade re-exports. All CLI/Studio consumers go through package API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Continue source extraction with the next named session owner only when dependencies stay narrow. Keep runtime inspection, setup lifecycle, and App UI source-builder moves out of framing.                          | no live proof for pure move; runtime proof for reconnect/state behavior changes | Session config, endpoint discovery helper/public wrapper, socket-open helper, listener-id allocator, request-id helper, tuner state-parts parser, tuner frame encode/parse, session state-selection helper, command-result JSON payload parser, and session endpoint/state/command-result/health result type owners extracted; unused standalone tuner message helper removed; session class and private request lifecycle extracted; package-level query/execute wrappers, private reconnect helper, direct-control health check owner, direct-control wait wrapper, and Tuner-ready wait ownership extracted; lifecycle composition, telemetry, procedure schemas, semantic CLI projection, AI ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance still pending.                 |
| Runtime command source builders           | `index.ts` lines 3909+ and 4714-4847: command builders and embedded JS helpers                                                                                                                                            | `src/runtime/{command-serialization,probe}.ts`; `src/runtime-sources/*` and atom-local source modules    | Direct package tests often match function names; CLI consumers invoke package wrappers. `test/runtime-and-catalog.test.ts` now owns focused command-source serializer proof. `src/runtime/command-serialization.ts` owns the current `jsLiteral` command-source serializer while facade wrappers still inject it into atom modules. `src/runtime/probe.ts` owns facade-used runtime probe helpers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Exact string/source behavior equivalence tests before moves. Keep command-source serialization as legacy embedded command-builder plumbing, not as a future Effect/oRPC procedure surface or raw command tunnel.                                                                                  | runtime proof required for embedded JS behavior changes                         | Command-source serializer and facade-used probe helper ownership extracted; atom-local source modules still own their embedded source strings, and broader public procedure schemas, telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC procedure cores, and Task 2.9.4 matrix-row acceptance remain pending. |
| Notification HUD/materialization          | Play types around 913-1000, wrapper around 2925, builder around 4714, source around 5119+                                                                                                                                 | `src/play/notifications/{view,details,decision-hints}.ts`                                               | `test/play-notification-view.test.ts` now owns package-level `getCiv7PlayNotificationView` materialization and decision-hint coverage. `src/play/notifications/view.ts` owns the embedded `readPlayNotifications` materialization and decision-hint source plus `getCiv7PlayNotificationView` orchestration and command builder while the public facade export stays in `index.ts`. CLI owns the broader scenario matrix in notification HUD, queue, and priorities suites.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Preserve package API shape and keep scenario expansion out of a broad shared notification catalog unless named consumers require it. Future details/decision-hint splits need their own owner/proof boundary.                                                                                     | runtime proof for live HUD/source behavior changes                              | Notification view/materialization embedded source and wrapper composition are extracted; only the public facade export surface remains in `index.ts`. |
| Notification dismissal/verification       | Types around 1005-1045, wrappers around 2935/2946, source around 7491, polling/identity verification around 10472-10534                                                                                                   | `src/play/notifications/{dismissal,verification,dismissal-request}.ts`                                  | `test/notification-dismissal.test.ts` now owns guarded read/send, verified dismissal, engine-front train absence, engine-front dismissed, none-blocker panel dismiss, and expired non-dismissible none-blocker coverage. `src/play/notifications/dismissal.ts` owns the embedded App UI dismissal source. `src/play/notifications/verification.ts` owns wrapper-level polling and identity verification for dismissal settling. `src/play/notifications/dismissal-request.ts` now owns the `getCiv7NotificationDismissal` / `requestCiv7NotificationDismissal` wrapper composition plus the guarded read/send dismissal command builder while the public facade exports stay in `index.ts`. CLI owns bulk-dismiss policy and stale nonblocking command behavior.                                                                                                                                                                                                                                                                                                                                                                                                              | Preserve verification semantics and App UI route proof. Do not move CLI bulk-dismiss candidate selection into direct-control. Future public-facade thinning should preserve the same approval-first and identity-verification contract.                                                              | runtime proof for timing/routes/identity behavior changes                       | Notification dismissal embedded source, wrapper-level verification helpers, and wrapper composition are extracted; only the public facade export surface remains in `index.ts`. |
| Operation validation/send/postconditions  | Operation types around 1190-1341, wrappers around 2996-3130, builders 4722/4729, router around 7753, classifiers 10660-11224; diplomacy/narrative wrappers around 3194/3246                                               | `src/play/operations/{types,validate-request,postconditions,production-choice,chooser-closeouts,diplomacy-request,narrative-request}.ts` | `test/unit-operation.test.ts` owns validator-first approved unit-operation send/postcondition coverage. `test/population-placement.test.ts` owns package-level ASSIGN_WORKER and EXPAND send/postcondition verification coverage. `src/action-approval.ts` owns `Civ7ActionApproval` and `assertApproved`; `src/play/operations/types.ts` re-exports the action approval type and owns shared operation family/target/input plus operation validation result public types while public facade type re-exports stay in `index.ts`. `src/play/operations/validate-request.ts` owns the generic operation request result public type while public facade type re-exports stay in `index.ts`. `src/play/operations/{unit-postconditions,population-postconditions,production-postconditions}.ts` own unit-operation, population-placement, and production postcondition public types while public facade type re-exports stay in `index.ts`. `src/play/operations/production-choice.ts` owns production-choice input, command payload, and result public types while public facade type re-exports stay in `index.ts`. `src/play/operations/diplomacy-request.ts` owns diplomacy response input, command payload, and result public types while `src/play/operations/diplomacy-postconditions.ts` owns diplomacy response postcondition public types; facade type re-exports stay in `index.ts`. `src/play/operations/narrative-request.ts` owns narrative choice input, command payload, and result public types while `src/play/operations/narrative-postconditions.ts` owns narrative choice postcondition public types; facade type re-exports stay in `index.ts`. Public procedure schemas, telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending. `src/play/operations/router.ts` owns the embedded operation validator/send router source used by generic unit/city/player operation wrappers. `src/play/operations/validate-request.ts` owns generic unit/city/player operation and command validation/request orchestration, operation command builders, operation input validation, approval-first send gating, validator-first request flow, and unit/population/production postcondition composition while the public facade exports stay in `index.ts`. `src/play/operations/unit-postconditions.ts` owns the synchronous unit-operation classifier group (`unitOperationPostcondition`, `classifyUnitOperationPostcondition`, `unitOperationPostconditionReason`). `src/play/operations/population-postconditions.ts` owns the population-placement classifier group (`populationPlacementPostcondition`, `populationPlacementPostconditionEligible`, `probeReadyCleared`, `classifyPopulationPlacementPostcondition`, `populationPlacementPostconditionReason`). `test/production-choice.test.ts` now owns package-level production-choice-cleared and production-state-changed-blocker-still-live postcondition verification through the official App UI production path. `src/play/operations/production-choice.ts` owns the embedded production-choice source plus `requestCiv7ProductionChoice` orchestration, command builder, status payload read, bounded post-send polling, and production argument validation while the public facade export stays in `index.ts`, and `src/play/operations/production-postconditions.ts` now owns the production postcondition helper group (`productionPostconditionFor`, `productionSnapshotChanged`, `productionBlockerStillLive`, `classifyProductionPostcondition`, `productionPostconditionReason`). `test/unit-target-action.test.ts` owns unit-target planning, approval-first guard, approved send, no-repeat-after-unverified no-op coverage, and default verification timing through public facade constants. `src/play/operations/unit-target-action.ts` owns unit-target plan/send orchestration, embedded source, post-send stabilization, default verification timing constants, and input/candidate/result public types while public facade exports and type re-exports stay in `index.ts`. `test/technology-choice-closeout.test.ts` and `test/culture-choice-closeout.test.ts` own semantic App UI chooser closeout sends; `src/play/progression/technology.ts` and `src/play/progression/culture.ts` own their embedded chooser closeout sources plus their technology/culture closeout command builders and input/result public types while public wrapper ownership and facade type re-exports stay in `index.ts`. `test/diplomacy-response.test.ts` now owns package-level `turn-unblocked`, `no-state-change`, `diplomacy-blocker-cleared`, `blocking-notification-changed`, `validation-changed`, and post-closeout `not-sent` proof for diplomacy response verification semantics, including the reachable `payload.sent === false` path after successful wrapper pre-validation. `src/play/operations/diplomacy-postconditions.ts` owns the wrapper-level diplomacy response wait/postcondition helper group (`waitForCiv7DiplomacyResponseAfter`, `diplomacyResponsePostcondition`, `classifyDiplomacyResponsePostcondition`, `diplomacyResponsePostconditionReason`, `findDiplomacyResponseNotification`, `notificationActionId`). `src/play/operations/diplomacy-request.ts` now owns `requestCiv7DiplomacyResponse` orchestration plus the App UI diplomacy response closeout command builder and embedded closeout source while the public facade export stays in `index.ts`. `test/narrative-choice.test.ts` now owns package-level `turn-unblocked`, `no-state-change`, `narrative-blocker-cleared`, `narrative-panel-cleared`, `validation-changed`, and reachable post-closeout `not-sent` proof for narrative choice verification semantics. `src/play/operations/narrative-postconditions.ts` now owns the wrapper-level narrative choice wait/postcondition helper group (`waitForCiv7NarrativeChoiceAfter`, `narrativeChoicePostcondition`, `classifyNarrativeChoicePostcondition`, `narrativeChoicePostconditionReason`), and `src/play/operations/narrative-request.ts` now owns `requestCiv7NarrativeChoice` orchestration plus the App UI narrative choice command builder and embedded source while the public facade export stays in `index.ts`. CLI has delayed/path-shortfall unit-target cases and play-surface diplomacy/narrative consumers. | Preserve approval-first semantics and no-repeat-after-unverified semantics. Before further source moves, compare candidate native paths against synced official resources and live `GameInfo` reads where behavior/components clearly match. Do not reintroduce Windows VM/FireTuner bridge control paths. Future telemetry/AI/semantic/procedure composition still needs named owner/proof boundaries. | runtime proof for mutation/postcondition behavior changes                       | Action approval primitive/helper ownership, shared operation primitive/validation public type ownership, operation request result public type ownership, unit-operation/population-placement/production postcondition public type ownership, production-choice, diplomacy-response, and narrative-choice public type ownership, operation router, generic operation wrapper composition, technology/culture chooser closeout source/builders/types, production-choice embedded source and wrapper, unit-operation/population-placement/production postcondition helpers, unit-target action/source/default verification constants/types, notification dismissal wrapper, diplomacy/narrative verification plus wrapper helpers extracted, and stale facade-local postcondition comparison helpers pruned; public procedure schemas, telemetry, AI ingestion, semantic CLI projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending. |
| Ready unit/city/move preview              | Ready-unit types 1392-1449, move preview 1451-1482, ready-city 1484-1549, wrappers 3313/3328/3344, sources 9094/9343/9481                                                                                                 | `src/play/ready/{unit,city,move-preview}.ts`                                                            | Package now covers `getCiv7ReadyUnitView`, `getCiv7ReadyCityView`, and `getCiv7UnitMovePreview` in focused files. `src/play/ready/move-preview.ts` owns the unit move preview embedded source plus `getCiv7UnitMovePreview` orchestration, command builder, and input/result public types while the public facade export and type re-exports stay in `index.ts`. `src/play/ready/unit.ts` owns the ready-unit embedded source plus `getCiv7ReadyUnitView` orchestration, command builder, and input/operation/nearby/promotion/result public types while the public facade export and type re-exports stay in `index.ts`. `src/play/ready/city.ts` owns the ready-city embedded source plus `getCiv7ReadyCityView` orchestration, command builder, and input/operation/production/town-focus/population-placement/result public types while the public facade export and type re-exports stay in `index.ts`. Ready-view tests own read-only/no-send assertions and local minimal fixtures; unit-move-preview owns read shape, command routing, bounds rejection, and conservative relationship policy. CLI covers compact envelopes.                                                                                                                                                                                                                                                                                              | Ready source owners are split. Future work may split ready-city internals only after naming production, town-focus, and population-placement consumers/proof boundaries; do not create a broad ready/common catalog.                                                                                | runtime proof for live read/source behavior changes                             | Unit move preview, ready-unit, and ready-city wrapper composition plus ready read public type ownership are extracted. A later domain-shape pass should regroup ready and movement code under topic-first owners rather than treat `src/play/ready/{unit,city,move-preview}.ts` as final authority. |
| Tactical/progression/read lenses          | Unit target source 8041, settlement 8258, target candidates 8349, battlefield 8637, destination 8927, traditions 4864, progress dashboard 4975                                                                            | `src/play/tactical/*` and `src/play/progression/*`                                                      | `test/settlement-recommendations.test.ts` owns App UI settlement recommendation routing/read-shape coverage. `src/play/tactical/settlement.ts` owns the settlement recommendation embedded source plus `getCiv7SettlementRecommendations` orchestration and command builder while the public facade export stays in `index.ts`. `test/progression-reads.test.ts` owns traditions view and progress dashboard read-only coverage; `src/play/progression/traditions.ts` owns the traditions embedded source and `src/play/progression/progress-dashboard.ts` owns the progress dashboard embedded source, and `src/play/progression/reads.ts` owns `getCiv7TraditionsView` / `getCiv7ProgressDashboard` orchestration plus their command builders while the public facade exports stay in `index.ts`. `test/tactical-reads.test.ts` owns target candidates, battlefield scan, and destination analysis read-only coverage with conservative relationship-label assertions; `src/play/tactical/target-candidates.ts` owns the target-candidates embedded source plus `getCiv7TargetCandidates` orchestration and command builder while the public facade export stays in `index.ts`; `src/play/tactical/battlefield.ts` owns the battlefield scan embedded source plus `getCiv7BattlefieldScan` orchestration and command builder while the public facade export stays in `index.ts`; `src/play/tactical/destination.ts` owns the destination analysis embedded source plus `getCiv7DestinationAnalysis` orchestration and command builder while the public facade export stays in `index.ts`. CLI owns command presentation and priorities consumers.                                                                                                          | Tactical/progression/read embedded source owners are split. Future work may split shared tactical helper semantics only after naming concrete consumers/proof boundaries; do not add broad shared read catalogs.                                                                                     | read-only live proof only when claiming runtime behavior                        | Progression, settlement recommendation, target-candidates, battlefield, and destination read wrappers are extracted; only public facade export surfaces remain in `index.ts` for those wrappers. |
| Map/visibility/gameinfo reads             | `index.ts` wrappers around 2358-2469 plus bounded map/grid source regions                                                                                                                                                 | `src/play/map/{summary,plot,grid,visibility,gameinfo,validation}.ts`; `src/play/summaries.ts`; `src/setup/reads.ts` | `test/map-and-visibility.test.ts` owns map summary, plot snapshot, bounded grid cap, visibility, reveal, and GameInfo row coverage. `test/runtime-and-catalog.test.ts` owns targeted GameInfo row coverage. `test/summary-reads.test.ts` owns focused player/unit/city summary wrapper coverage after repairing the prior proof gap. `test/setup-and-lifecycle.test.ts` owns setup snapshot and setup map row read coverage. `test/validation.test.ts` owns focused map location/bounds validation proof. `src/play/map/validation.ts` owns map location and bounds validation helpers while generic integer validation stays in `src/validation.ts`. `src/play/map/visibility.ts` owns visibility summary orchestration/source plus `revealCiv7MapForPlayer` mutation orchestration and classification while the public facade exports stay in `index.ts`; `src/play/map/gameinfo.ts` owns GameInfo rows orchestration and source while the public facade export stays in `index.ts`; `src/play/summaries.ts` owns player/unit/city summary orchestration and source while public facade exports stay in `index.ts`; `src/setup/reads.ts` owns setup snapshot/setup map rows orchestration and source while public facade exports stay in `index.ts`.                                                                                                                                                                                | Preserve hiddenInfoPolicy, local bounds caps, summary validation/defaults, read-only/no-send behavior, approval-first disposable reveal guard, setup map row materialization, and official-evidence-only relationship policy before source moves. Keep AI ingestion, static profile shaping, semantic CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure cores in separate owner/proof slices. | runtime proof only for reveal/mutation behavior changes                         | Map summary, plot snapshot, map grid, map validation, visibility summary, reveal-map mutation, GameInfo rows, player/unit/city summary, and setup snapshot/map-row wrapper/source ownership extracted; AI ingestion, static profile shaping, semantic CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure cores still pending. |
| Setup and lifecycle orchestration         | Setup types around 690-822, wrappers around 2488-2762, setup/start orchestration around 2488-2787                                                                                                                         | `src/setup/{reads,prepare,start,run,restart}.ts`                                                        | `test/setup-and-lifecycle.test.ts` owns setup snapshots/map rows, prepare/start/run, missing-map-row refresh, exit-to-shell orchestration, no replay after socket close, seed mismatch, and begin failure. `test/restart-lifecycle.test.ts` owns restart, begin, wait-for-Tuner readiness, and restart-output rejection coverage. `src/setup/reads.ts` owns `getCiv7SetupSnapshot`, `getCiv7SetupMapRows`, `ensureCiv7SetupMapRowVisible`, setup snapshot/map rows command builders, shared setup snapshot/map-row source, setup map-row visibility refresh polling, and `validateMapScript` while public facade exports stay in `index.ts`. `src/setup/prepare.ts` owns `prepareCiv7SinglePlayerSetup`, the prepare command builder, setup input normalization, setup map-row/readback assertions, and private setup parameter helpers while public facade exports stay in `index.ts`. `src/setup/start.ts` owns `startPreparedCiv7SinglePlayerGame`, the prepared start command builder, begin polling, setup pre-readback, Tuner/map verification, and post-start seed assertion while `index.ts` injects session creation/close, reconnect execution, Tuner readiness, and map summary reads. `src/setup/run.ts` owns `runCiv7SinglePlayerFromSetup` composition, active-game exit-to-shell guard, exit-to-main-menu command routing, shell wait, prepare/start chaining, and verified result shape while `index.ts` injects App UI execution, setup snapshot reads, setup phase wait, and prepare/start wrappers. `src/setup/restart.ts` owns `beginCiv7Game`, `restartCiv7Game`, `restartCiv7GameAndBegin` orchestration, and `Civ7RestartAndBeginResult` public type ownership, restart-output rejection, begin-ready polling, one-attempt begin send, and optional Tuner readiness wait while `index.ts` injects App UI execution, command execution, session creation/close, reconnect execution, Tuner readiness, and command constants. | Preserve no-replay semantics, approval-first setup mutations, setup readback proof, expected map row proof, exit-to-shell refresh semantics, restart/begin command semantics, and runtime proof boundaries before source moves. Keep any future lifecycle behavior changes proof-focused rather than rebuilding a broad lifecycle fake.                                                                            | runtime proof for start/setup mutation behavior changes                         | Setup snapshot/map-row read ownership, setup map-row visibility refresh ownership, setup preparation ownership, prepared start ownership, setup run ownership, and restart/begin lifecycle plus result type ownership extracted; runtime/live-game proof, AI ingestion, semantic CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure cores still pending. |
| Autoplay and turn completion              | Autoplay types around 849-872, turn completion types around 893-906, wrappers around 2788-2920                                                                                                                            | `src/play/autoplay.ts` and `src/play/turn-completion.ts`                                                | `test/autoplay-and-turn.test.ts` owns autoplay approval/configure/start/stop coverage plus turn-completion status, complete, and unready result-shape coverage. `src/play/autoplay.ts` owns `getCiv7AutoplayStatus`, `configureCiv7Autoplay`, `startCiv7Autoplay`, `stopCiv7Autoplay`, autoplay command builders, player inference, config matching, wait/stop-settling helpers, and autoplay default constants while the public facade exports stay in `index.ts` and inject App UI snapshot reads, command execution, approval assertion, validation/bounds helpers, serializer, sleep, and timing/default constants. `src/play/turn-completion.ts` owns `getCiv7TurnCompletionStatus`, `sendCiv7TurnComplete`, `sendCiv7TurnUnready`, the generated status command, and private fallback classifier helpers while the public facade exports stay in `index.ts` and inject App UI execution, JSON parsing, notification reads, and approval assertion. CLI `game play end-turn` remains the focused consumer proof for the public play surface.                                                                                                                                                                                                                                                    | Preserve approval gates, explicit unbounded start semantics, stop-settling/pause behavior, turn-completion action result shapes, stale notification fallback classification, and command strings. Keep hotseat runtime proof, AI ingestion, semantic CLI projection, telemetry, and Effect/oRPC procedure cores in separate slices. | runtime proof for autoplay/turn-completion behavior changes                     | Autoplay wrapper/source/default constants and turn-completion wrapper/source ownership extracted; hotseat runtime proof, AI ingestion, semantic CLI projection, telemetry, and Effect/oRPC procedure cores still pending. |
| Root inspection and runtime API snapshots | Root inspection types around 829-840, App UI/Tuner snapshots around 199-288 and wrappers around 2097-2349                                                                                                                 | `src/runtime/{inspection,inspection-constants,root-inspection,app-ui-snapshot,tuner-health,playable-status}.ts` | `test/runtime-and-catalog.test.ts` owns App UI/Tuner command routing, App UI snapshots, Tuner readiness, runtime API inspection, bounded root inspection, runtime inspection default-root selection, playable status, shell classification, unready Tuner handling, and targeted GameInfo row coverage. `src/runtime/inspection.ts` owns `inspectCiv7RuntimeApi`, the default-root selector, and the generated runtime API inspection command while the public facade export stays in `index.ts`. `src/runtime/inspection-constants.ts` owns the default App UI/Tuner root catalogs and bounded root `maxKeys`/`maxMethods` defaults while public facade re-exports stay in `index.ts`. `src/runtime/root-inspection.ts` owns `inspectCiv7Root` and the generated bounded root inspection command while `index.ts` injects command execution, validation, bounds, JSON parsing, command serialization, and error construction. `src/runtime/app-ui-snapshot.ts` owns `getCiv7AppUiSnapshot`, the generated App UI snapshot command, and `appUiSnapshotFromCommandResult` while the public facade export stays in `index.ts`; lifecycle/setup loops still reuse the internal builder/parser without moving lifecycle orchestration. `src/runtime/tuner-health.ts` owns `checkCiv7TunerHealth`, the generated Tuner health command, `tunerHealthFromCommandResult`, and the internal `checkCiv7TunerHealthWithSession` helper while `index.ts` still owns public facade call-through, session creation/close, reconnect execution, and readiness wait orchestration. `src/runtime/playable-status.ts` owns `getCiv7PlayableStatus` composition while `index.ts` injects App UI snapshot, Tuner health, and error-message dependencies. The runtime API inspection and bounded root inspection atoms are debug/internal service output: `playerScope` debug/observer-only, `consumerClass` debug/internal service output and future procedure-core support, `evidenceClass` local package tests only for relocation, `procedureCandidate` needs schema/type extraction before typed procedure cores, `normalCliProjection` omitted or debug-command only, and `debugServiceProjection` raw diagnostic projection. The App UI snapshot atom is internal service/runtime-status support: `playerScope` local-player-scoped plus debug/observer-only, `consumerClass` debug/internal service output and future semantic/procedure support, `evidenceClass` local package tests only for this relocation, `procedureCandidate` needs schema/type extraction and semantic projection before typed procedure cores, `normalCliProjection` omitted/debug-only or summarized state-machine status through later CLI semantic work, and `debugServiceProjection` raw App UI snapshot projection. The Tuner health and playable-status atoms are internal service/runtime-status support: `playerScope` local-player-scoped plus debug/observer-only, `consumerClass` debug/internal service output and future semantic/procedure support, `evidenceClass` local package tests only for relocation, `procedureCandidate` needs schema/type extraction and semantic readiness projection before typed procedure cores, `normalCliProjection` omitted/debug-only or summarized state-machine status through later CLI semantic work, and `debugServiceProjection` raw Tuner health/readiness diagnostics. | Preserve shell/playable classification, App UI snapshot/Tuner health status boundaries, root default selection, bounded root caps, raw diagnostic/debug-only classification, and live runtime claims separate from local fake-tuner proof. Keep broader public/procedure schemas, telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection, and Effect/oRPC procedure-core work in separate owner/proof slices. | runtime proof for runtime-state behavior changes                                | Runtime API inspection, bounded root inspection, App UI snapshot, Tuner health, playable-status, runtime inspection constants, capability catalog, and proof/log helper ownership extracted; broader public/procedure schemas, telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection, and Effect/oRPC procedure cores still pending. |
| Capability catalog and proof/log support  | Static entries around 10089, catalog exports 3594/3616, file/log proof helpers 3694-3758                                                                                                                                  | `src/catalog/*` and `src/proof/*`                                                                       | `test/runtime-and-catalog.test.ts` owns static catalog, runtime catalog, official-resource scanner fixture, `snapshotFile`, and `waitForFreshLogMarkers` coverage. `test/public-api.test.ts` owns capability catalog schema facade re-exports and the default scripting-log path facade export. `test/session.test.ts` also owns fresh ordered log marker behavior. `src/proof/log-markers.ts` owns `FileSnapshot`, `FreshLogMarkerProof`, `DEFAULT_CIV7_SCRIPTING_LOG`, `snapshotFile`, `waitForFreshLogMarkers`, and private ordered-marker/file helpers while the public facade exports stay in `index.ts`. `src/catalog/capabilities.ts` owns static catalog construction, runtime inspection catalog construction, official-resource capability scanning, sorting/deduplication, private catalog helpers, `Civ7CapabilityCatalogEntrySchema`, `Civ7CapabilityCatalogSchema`, derived catalog entry/result types, and `Civ7CapabilityCatalogOptions` while public facade exports stay in `index.ts`; runtime root inspection is injected from the facade. | Preserve generated-output-as-evidence policy and keep official-resource scanner tests fixture-bounded rather than crawling the full resource tree. Keep broader public constants/types, procedure schemas, operation/proof telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection, and Effect/oRPC procedure cores in separate owner/proof slices. | runtime proof only for live proof behavior claims                               | Proof/log helper/default scripting-log path, capability catalog source ownership, and capability catalog schema and options ownership extracted; broader public constants/types, telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof, and Effect/oRPC procedure cores still pending. |

Operation row update: `src/play/operations/unit-target-action.ts` now owns
`getCiv7UnitTargetAction` / `requestCiv7UnitTargetAction` orchestration, the
embedded `readUnitTargetAction` source, command builder, and bounded post-send
stabilizer while public facade exports stay in `index.ts`. This completes the
unit-target source/wrapper relocation; broader generic operation and
production-choice wrapper composition still need named owner/proof boundaries.

Map row update: `src/play/map/reads.ts` now owns `getCiv7MapSummary`,
`getCiv7PlotSnapshot`, and `getCiv7MapGrid` orchestration plus their map
summary, plot snapshot, and bounded grid command/source helpers while public
facade exports stay in `index.ts`. Visibility summary, reveal mutation,
GameInfo rows, setup map rows, and player/unit/city summaries remain pending
separate owner slices.

Map validation row update: `src/play/map/validation.ts` now owns map
location/bounds validation while `src/validation.ts` owns generic integer
validation. This preserves the existing location and map-grid hard-cap
messages/classification; map read source strings, runtime behavior, telemetry,
AI ingestion, semantic CLI projection, hotseat runtime proof, Effect/oRPC
procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending.

Visibility row update: `src/play/map/visibility.ts` now owns
`getCiv7VisibilitySummary` orchestration plus its bounded visibility-grid
command/source helper while the public facade export stays in `index.ts`.
Reveal mutation, GameInfo rows, setup map rows, and player/unit/city summaries
remain pending separate owner/proof slices.

GameInfo row update: `src/play/map/gameinfo.ts` now owns
`getCiv7GameInfoRows` orchestration plus its bounded GameInfo table row
command/source helper while the public facade export stays in `index.ts`.
Reveal mutation, setup map rows, player/unit/city summaries, AI ingestion, and
static profile shaping remain pending separate owner/proof slices.

Summary read update: `src/play/summaries.ts` now owns
`getCiv7PlayerSummary`, `getCiv7UnitSummary`, and `getCiv7CitySummary`
orchestration plus their command/source helpers while public facade exports stay
in `index.ts`. `test/summary-reads.test.ts` repairs the focused package proof
gap for command routing/source shape, validation and bounds, read-only/no-send
behavior, and unchanged component-id pass-through. Reveal mutation, setup map
rows, AI ingestion, static profile shaping, semantic CLI, telemetry, hotseat
runtime proof, and Effect/oRPC procedure cores remain pending separate slices.

Runtime API inspection update: `src/runtime/inspection.ts` now owns
`inspectCiv7RuntimeApi`, its default-root selector, and the generated runtime
API inspection command while the public facade export stays in `index.ts`.
`test/runtime-and-catalog.test.ts` owns explicit proof that custom roots bypass
defaults and that App UI/Tuner default roots stay selected by normalized state.
This atom is debug/internal service output with normal CLI projection omitted or
debug-only and debug service projection as raw diagnostic projection. Later
4.12 slices extracted bounded root inspection, App UI snapshot, Tuner health,
playable status, proof/log helpers, capability catalog, and runtime inspection
constants; broader public and procedure schemas, telemetry, hotseat runtime
proof, AI ingestion, CLI semantic projection, and Effect/oRPC procedure cores
remain pending separate slices.

Runtime type update: runtime result/input/probe type ownership now follows the
existing runtime atom owners while public facade type re-exports stay in
`index.ts`. `src/runtime/probe.ts` owns `Civ7RuntimeProbe`;
`src/runtime/inspection.ts` owns runtime API inspection/root/method result
types; `src/runtime/root-inspection.ts` owns bounded root inspection
input/result types; `src/runtime/app-ui-snapshot.ts` owns App UI snapshot
types; `src/runtime/tuner-health.ts` owns Tuner health snapshot/result types;
and `src/runtime/playable-status.ts` owns playable-status result typing. This
is local package/type relocation proof only and does not move source strings,
runtime/session/lifecycle behavior, TypeBox procedure schemas, telemetry, AI
ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
procedure-core work, or Task 2.9.4 matrix-row acceptance.

Runtime probe helper update: `src/runtime/probe.ts` now owns the facade-used
`probeHelperSource` and `probeValue` helpers alongside `Civ7RuntimeProbe`.
This preserves the generated `probe` helper source text and probe unwrapping
semantics while leaving module-local source-string helpers, shared serializer
ownership, public procedure schemas, telemetry, AI ingestion, hotseat runtime
proof, CLI semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
matrix-row acceptance pending. This is local package/source relocation proof
only, not runtime/live-game proof.

Map primitive type update: `src/play/map/types.ts` now owns
`Civ7MapLocation`, `Civ7MapBounds`, and `Civ7HiddenInfoPolicy` while public
facade type re-exports stay in `index.ts`. Internal map, ready, tactical, and
unit-target modules import those primitives from the map owner instead of from
the facade. This is local package/type relocation proof only and does not
change map validation, hidden-info policy semantics, source strings, runtime
behavior, procedure schemas, telemetry, AI ingestion, hotseat runtime proof,
CLI semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
matrix-row acceptance.

Map read type update: `src/play/map/types.ts` now also owns map summary, plot
snapshot, and map grid input/result types while public facade type re-exports
stay in `index.ts`. `src/play/map/reads.ts` consumes those map read types from
the map owner and session types from `src/session/types.ts`. This is local
package/type relocation proof only and does not change map read validation,
hidden-info policy semantics, source strings, runtime behavior, visibility or
GameInfo types, procedure schemas, telemetry, AI ingestion, hotseat runtime
proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
matrix-row acceptance.

Summary read type update: `src/play/summaries.ts` now also owns player, unit,
and city summary input/result types while public facade type re-exports stay in
`index.ts`. This is local package/type relocation proof only and does not change
summary validation, component-id pass-through behavior, source strings, runtime
behavior, relationship-label policy, visibility or GameInfo types, procedure
schemas, telemetry, AI ingestion, hotseat runtime proof, CLI semantic
projection, Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row
acceptance.

GameInfo row type update: `src/play/map/gameinfo.ts` now also owns GameInfo row
input/result types while public facade type re-exports stay in `index.ts`. This
is local package/type relocation proof only and does not change GameInfo table
or filter validation, lookup/filter semantics, source strings, runtime behavior,
AI ingestion, static profile shaping, procedure schemas, telemetry, hotseat
runtime proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task
2.9.4 matrix-row acceptance.

Visibility/reveal type update: `src/play/map/visibility.ts` now also owns
visibility summary input/result types and the reveal-map result type while
public facade type re-exports stay in `index.ts`. This is local package/type
relocation proof only and does not change visibility validation, bounded-grid
semantics, approval-first disposable reveal behavior, reveal classification,
source strings, runtime behavior, relationship-label policy, telemetry, AI
ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
procedure-core work, or Task 2.9.4 matrix-row acceptance.

Setup read type update: `src/setup/reads.ts` now also owns setup phase,
snapshot, map-row, map-row visibility, and setup read result types while public
facade type re-exports stay in `index.ts`. This is local package/type
relocation proof only and does not change setup snapshot/map-row source strings,
map-script validation, setup map-row refresh behavior, setup lifecycle
mutation behavior, runtime proof status, telemetry, AI ingestion, hotseat
runtime proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task
2.9.4 matrix-row acceptance. Setup prepare/start/run lifecycle input/result
types remain pending separate owner slices.

Setup phase wait update: `src/setup/reads.ts` now owns the shared
`waitForCiv7SetupPhase` polling helper used by setup map-row refresh and
setup-run exit-to-shell orchestration. The public facade still injects the
helper into `src/setup/run.ts` and keeps setup-run composition stable. This
preserves shell-phase polling, timeout details, and `setup-phase-invalid`
classification as local package/source relocation proof only; runtime/live-game
proof, AI ingestion, semantic CLI projection, telemetry, hotseat runtime proof,
Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
pending.

Setup lifecycle type update: `src/setup/prepare.ts` now owns single-player
setup input, setup option value, and prepared-setup result types;
`src/setup/start.ts` owns prepared-start input and single-player start result
types; and `src/setup/run.ts` owns single-player run input/result types while
public facade type re-exports stay in `index.ts`. This is local package/type
relocation proof only and does not change setup preparation/start/run source
strings, approval behavior, readback verification, setup lifecycle mutation
behavior, runtime proof status, telemetry, AI ingestion, hotseat runtime proof,
CLI semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
matrix-row acceptance. Tactical, operation, ready, public procedure schema, and
telemetry type ownership remain pending separate owner slices.

Autoplay/turn type update: `src/play/autoplay.ts` now owns autoplay status,
poll options, action options, and action result types, and
`src/play/turn-completion.ts` now owns turn-completion status/action result
types while public facade type re-exports stay in `index.ts`. This is local
package/type relocation proof only and does not change autoplay command source,
approval behavior, stop-settling/pause behavior, turn-completion command
strings, stale notification fallback classification, runtime proof status,
telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection,
Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row acceptance. Tactical,
operation, ready, public procedure schema, and telemetry type ownership remain
pending separate owner slices.

Notification type update: `src/play/notifications/view.ts` now owns play
decision hint/input/action, notification summary, decision queue item, and
notification view result types, and `src/play/notifications/dismissal-request.ts`
now owns notification dismissal input/summary/result types while public facade
type re-exports stay in `index.ts`. This is local package/type relocation proof
only and does not change notification materialization source strings, decision
hint classification, `maxNotifications` behavior, dismissal command source,
approval-first dismissal behavior, dismissal verification polling, CLI queue or
bulk-dismiss policy, runtime proof status, telemetry, AI ingestion, hotseat
runtime proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task
2.9.4 matrix-row acceptance. Diplomacy/narrative/progression closeout, tactical,
operation, ready, public procedure schema, and telemetry type ownership remain
pending separate owner slices.

Progression read type update: `src/play/progression/reads.ts` now owns
traditions view input/action/summary/result types and progress dashboard
input/legacy-path/result types while public facade type re-exports stay in
`index.ts`. This is local package/type relocation proof only and does not change
traditions or progress dashboard source strings, command serialization, parser
labels, read-only/no-send behavior, runtime proof status, telemetry, AI
ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
procedure-core work, or Task 2.9.4 matrix-row acceptance. Diplomacy/narrative
closeout, tactical, operation, ready, public procedure schema, and telemetry
type ownership remain pending separate owner slices.

Tactical read type update: tactical public read contracts now live with their
source owners: `src/play/tactical/settlement.ts` owns settlement recommendation
input/factor/origin/result types, `src/play/tactical/target-candidates.ts` owns
target-candidates input/candidate/result types, `src/play/tactical/battlefield.ts`
owns battlefield scan input/result types, and
`src/play/tactical/destination.ts` owns destination analysis input/result types
while public facade type re-exports stay in `index.ts`. This is local
package/type relocation proof only and does not change tactical source strings,
command serialization, parser labels, read-only/no-send behavior, conservative
relationship-label policy, runtime proof status, telemetry, AI ingestion,
hotseat runtime proof, CLI semantic projection, Effect/oRPC procedure-core work,
or Task 2.9.4 matrix-row acceptance. Diplomacy/narrative closeout, operation,
ready, public procedure schema, and telemetry type ownership remain pending
separate owner slices.

Bounded root inspection update: `src/runtime/root-inspection.ts` now owns
`inspectCiv7Root` and the generated bounded root inspection command while the
public facade export stays in `index.ts` and injects command execution,
validation, bounds, JSON parsing, command serialization, and error
construction. This preserves root identifier validation, root caps, state
defaulting, parse label, and result shape. The atom is debug/internal
inspection support with `normalCliProjection` omitted or debug-command only and
`debugServiceProjection` raw diagnostic projection. This is local
package/source relocation proof only, not live runtime proof, runtime reflection
authority, AI ingestion input, or procedure-core readiness.

App UI snapshot update: `src/runtime/app-ui-snapshot.ts` now owns
`getCiv7AppUiSnapshot`, the generated App UI snapshot command, and
`appUiSnapshotFromCommandResult` while the public facade export stays in
`index.ts`. Restart/setup lifecycle loops still reuse the internal
builder/parser helpers from that module; lifecycle orchestration remains in the
facade. This atom is internal service/runtime-status support: raw App UI
snapshot data belongs to debug/internal service output, normal CLI projection
is omitted/debug-only or summarized state-machine status through later semantic
surface work, and debug service projection is raw App UI snapshot projection.
Later 4.12 slices extracted Tuner health, playable status, proof/log helpers,
bounded root inspection, capability catalog, capability catalog schemas, and
runtime inspection constants; broader public and procedure schemas, telemetry,
hotseat runtime proof, AI ingestion, CLI semantic projection, and Effect/oRPC
procedure cores remain pending separate slices.

Tuner health update: `src/runtime/tuner-health.ts` now owns
`checkCiv7TunerHealth`, the generated Tuner health command,
`tunerHealthFromCommandResult`, the internal session helper needed by
readiness waits, `waitForCiv7TunerReady`, and
`waitForCiv7TunerReadyWithSession`. `index.ts` still owns public facade
call-through, session creation/close, reconnect execution injection, and
setup/restart lifecycle composition. This is local package/source relocation proof only, not live
runtime proof. The atom is debug/internal runtime-status support:
`normalCliProjection` is omitted/debug-only or later summarized through
semantic state-machine status, and `debugServiceProjection` is raw Tuner
health/readiness diagnostics. Playable status, proof/log helpers, bounded root
inspection, capability catalog, and capability catalog schemas have since been
extracted; broader public and procedure schemas, telemetry, hotseat runtime proof,
AI ingestion, CLI semantic projection, and Effect/oRPC procedure-core work
remain pending.

Playable-status update: `src/runtime/playable-status.ts` now owns
`getCiv7PlayableStatus` composition while the public facade export stays in
`index.ts` and injects App UI snapshot, Tuner health, and error-message
dependencies. This preserves shell/playable/readiness classification and
unready error capture. This is local package/source relocation proof only, not
live runtime proof. The atom is internal service/runtime-status support:
`normalCliProjection` is omitted/debug-only or later summarized through
semantic state-machine status, and `debugServiceProjection` is raw
playable-status/readiness diagnostics. Bounded root inspection has since been
extracted, and capability catalog schemas move with the catalog owner; broader
public and procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
ingestion, CLI semantic projection, and Effect/oRPC procedure-core work remain
pending.

## Forbidden Owners

- CLI must not own raw socket framing, state discovery, reconnect polling,
  embedded runtime JS, or postcondition classification.
- Direct-control must not own CLI flag parsing, compact envelope formatting,
  batch dismissal policy, or command-specific human guardrail prose.
- oRPC must compose stable direct-control atoms; it must not fork runtime source
  strings or define new proof semantics.
- Normal CLI play commands must not expose internal transport/proof JSON as
  their primary result. They should project direct-control service data into
  player-agent semantic envelopes; raw details belong in debug-owned surfaces.
- Effect can be evaluated for transport/stream/fixture mechanics, resource
  acquisition/release, layers, errors, and concurrency, not introduced as
  gameplay policy ownership before atom seams exist.
- New or refactored control code should prefer Effect and Bun-native APIs over
  Node APIs unless Node is the only practical or clearly better primitive.
