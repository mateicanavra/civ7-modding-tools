# Effect/oRPC Procedure-Core Contract

This is a planning contract for future Effect/oRPC procedure cores over stable
direct-control atoms. It is not a source implementation, accepted schema,
transport adapter, in-game controller router implementation, App UI bridge
implementation, telemetry persistence layer, AI-ingestion contract, runtime
proof, or Task 2.9.4 row acceptance.

Current owner seed: `packages/civ7-direct-control/src/procedure-core.ts`
records a direct-control-local descriptor owner for procedure keys, stable atom
owners, projection policy, proof boundary, player scope, consumer class, and
mutation gate metadata. The descriptor factory now performs TypeBox runtime
shape validation before semantic procedure guards and reports descriptor
failures as `Civ7DirectControlError` instances with the
`procedure-descriptor-invalid` code plus structured reason/details. The
descriptor also records a correlation policy: request IDs are generated per
call or caller-provided-and-validated, normal CLI omits them by default,
debug/proof diagnostics may include them, and telemetry attaches them only when
procedure telemetry is enabled. The descriptor now binds procedures to explicit
direct-control schema references through `inputSchema` and `outputSchema`
owner/export slots, with local guards that keep schema owners in
`@civ7/direct-control`, require simple exported schema identifiers, and reject
raw command-source/session schema references. The descriptor now also records
schema technology ownership: current descriptors declare `typebox`, while
`effect-schema` and `zod-adapter` claims are rejected until an accepted
schema-technology owner/proof slice defines their role. The descriptor also
records context requirements for direct-control facade access, endpoint
defaults, state selection, logger, evidence sink, and live-session policy where
relevant, and rejects host/port/state procedure input fields when those
responsibilities are declared context-owned. The procedure-core owner also
validates local input
and output payloads against explicitly resolved TypeBox schema artifacts and
reports schema mismatches through structured direct-control errors without
executing atoms, registering a router, or owning transport behavior. The
procedure-core owner also has a no-network call primitive over injected
handlers that validates input before handler execution, validates output after
handler execution, returns procedure output separately from debug/telemetry
diagnostics, resolves correlation IDs according to descriptor policy, and
normalizes handler failures with typed direct-control error details. The first
concrete descriptor
artifact is `packages/civ7-direct-control/src/play/ready/unit-procedure.ts`,
which owns the `unit.ready.view` descriptor adjacent to the ready-unit atom and
schema exports. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` rejects generic raw
command tunnel descriptors, rejects repo-local raw command-source/session
execution descriptors such as `runtime/command-serialization` / `jsLiteral`
and `session/execute` / `executeCiv7Command`, requires mutation descriptors to
carry approval, validator-first, postcondition, and no-repeat-after-unverified
gates, rejects malformed descriptor shapes before procedure promotion, and
snapshots schema-mismatch, raw-command-tunnel, and mutation-gates-missing error
details while rejecting `live-runtime-proof` claims from the local descriptor
owner, proving ready-unit descriptor schema references point to the
ready-unit schema exports, resolving those references against explicit
caller-provided TypeBox schema artifacts, rejecting descriptor field lists that
name fields missing from the resolved schema root properties, proving
correlation stays omitted from normal CLI by default, and proving telemetry
correlation is tied to the Effect/oRPC middleware hook rather than a separate
transport surface, and proving endpoint/state context ownership keeps
host/port/state selectors out of procedure input while raw command/session
fields remain blocked by the no-raw-command-tunnel guard. The second adjacent
read-atom descriptor artifact is
`packages/civ7-direct-control/src/play/ready/city-procedure.ts`, which owns the
`city.ready.view` descriptor adjacent to the ready-city atom and schema
exports. The third adjacent read-atom descriptor artifact is
`packages/civ7-direct-control/src/play/ready/move-preview-procedure.ts`, which
owns the `unit.move.preview` descriptor adjacent to the unit move-preview atom
and schema exports. The first adjacent runtime-support descriptor artifact is
`packages/civ7-direct-control/src/runtime/playable-status-procedure.ts`, which
owns the `runtime.playable.status` descriptor adjacent to the composed
playable-status atom and schema exports. The second adjacent runtime-support
descriptor artifact is
`packages/civ7-direct-control/src/runtime/app-ui-snapshot-procedure.ts`, which
owns the `runtime.app.ui.snapshot` descriptor adjacent to the App UI snapshot
atom and schema exports. The third adjacent runtime-support descriptor artifact
is `packages/civ7-direct-control/src/runtime/tuner-health-procedure.ts`, which
owns the `runtime.tuner.health` descriptor adjacent to the Tuner health atom and
schema exports. The adjacent turn-completion status descriptor artifact is
`packages/civ7-direct-control/src/play/turn-completion-procedure.ts`, which
owns the `runtime.turn.completion.status` descriptor adjacent to the
turn-completion status atom and schema exports. The adjacent unit-summary
descriptor artifact is
`packages/civ7-direct-control/src/play/unit-summary-procedure.ts`, which owns
the `unit.summary.read` descriptor adjacent to the unit summary atom and schema
exports. The adjacent city-summary descriptor artifact is
`packages/civ7-direct-control/src/play/city-summary-procedure.ts`, which owns
the `city.summary.read` descriptor adjacent to the city summary atom and schema
exports. The adjacent player-summary descriptor artifact is
`packages/civ7-direct-control/src/play/player-summary-procedure.ts`, which owns
the `player.summary.read` descriptor adjacent to the player summary atom and
schema exports, and is the first narrow `player` procedure-family owner. The
adjacent unit-target action request descriptor artifact is
`packages/civ7-direct-control/src/play/operations/unit-target-action-procedure.ts`,
which owns the `unit.target.action.request` mutation descriptor adjacent to the
approved unit-target action atom and schema exports. The adjacent
production-choice request descriptor artifact is
`packages/civ7-direct-control/src/play/operations/production-choice-procedure.ts`,
which owns the `city.production.choice.request` mutation descriptor adjacent to
the approved production-choice atom, schema exports, and production
postcondition schema exports while projecting procedure output without the
atom's raw command-bearing result field. The adjacent notification read
descriptor artifact is
`packages/civ7-direct-control/src/play/notifications/view-procedure.ts`, which
owns the `notifications.view` descriptor adjacent to the notification read atom
and schema exports. The adjacent settlement-recommendations descriptor artifact
is `packages/civ7-direct-control/src/play/tactical/settlement-procedure.ts`,
which owns the `strategy.settlement.recommendations` descriptor adjacent to the
read-only settlement recommendation atom and schema exports while staying under
the existing `strategy` procedure family. The adjacent target-candidates
descriptor artifact is
`packages/civ7-direct-control/src/play/tactical/target-candidates-procedure.ts`,
which owns the `strategy.target.candidates` descriptor adjacent to the
read-only target-candidates atom and schema exports while preserving the
neutral relationship evidence model. The adjacent battlefield-scan descriptor
artifact is
`packages/civ7-direct-control/src/play/tactical/battlefield-procedure.ts`,
which owns the `strategy.battlefield.scan` descriptor adjacent to the
read-only battlefield scan atom and schema exports while preserving the
neutral relationship evidence model. This is local package proof only; it does
not collect runtime evidence, add Effect/oRPC dependencies, create
`packages/civ7-control-orpc`, implement router/procedure behavior, choose a
broader schema migration, claim runtime proof, or accept the matrix row.

Concrete read-atom schema seeds:
`packages/civ7-direct-control/src/play/ready/unit.ts` now owns TypeBox schemas
for `getCiv7ReadyUnitView` input, output, operation candidates, nearby plots,
and promotion readiness. Focused proof in
`packages/civ7-direct-control/test/ready-unit-view.test.ts` validates the
existing fake-runtime ready-unit result against the output schema and rejects
out-of-bound input plus root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. This is one read atom's
schema-owner seed only; it does not choose Effect Schema, migrate existing
contracts, implement a router/procedure, claim runtime proof, or accept the
matrix row.

`packages/civ7-direct-control/src/play/ready/city.ts` now owns TypeBox schemas
for `getCiv7ReadyCityView` input, output, city operation candidates,
production candidates, town-focus options, and population-placement slots.
Focused proof in
`packages/civ7-direct-control/test/ready-city-view.test.ts` validates the
existing fake-runtime ready-city result against the output schema and rejects
out-of-bound input plus root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. Complex nested runtime values
remain `unknown` within named TypeBox owner fields until a later schema slice
accepts narrower nested contracts.

`packages/civ7-direct-control/src/play/ready/move-preview.ts` now owns TypeBox
schemas for `getCiv7UnitMovePreview` input, output, neutral relationship
policy, and read-only movement preview slots. The shared
`packages/civ7-direct-control/src/play/map/types.ts` owner now exports
`Civ7MapLocationSchema` with the same bounded-integer `0..1_000_000`
`x`/`y` boundary as `validateMapLocation`. Focused proof in
`packages/civ7-direct-control/test/unit-move-preview.test.ts` validates the
existing fake-runtime unit move-preview result against the output schema,
rejects out-of-bound preview limits, rejects fractional/negative/over-bound
map locations through both TypeBox and the existing atom validation path, and
rejects root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. Complex engine-derived movement
and path values remain `unknown` within named TypeBox owner fields until a
later schema slice accepts narrower nested contracts.

`packages/civ7-direct-control/src/runtime/playable-status.ts` now owns TypeBox
schemas for `getCiv7PlayableStatus` input, readiness labels, and output. The
supporting runtime owners
`packages/civ7-direct-control/src/runtime/{app-ui-snapshot,tuner-health}.ts`
now own TypeBox schemas for the App UI snapshot and Tuner health result shapes
that `getCiv7PlayableStatus` composes. The playable-status input schema is
empty with `additionalProperties: false`; endpoint/session selection remains a
procedure context concern, not host/port/state/raw-command input. Focused proof
in `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` validates
the existing fake App UI/Tuner results against the schemas, validates non-ready
shell and unavailable/error shapes including failed probes, omitted optional
`tuner`, and `errors` evidence, and rejects root-level raw command fields.
Public facade proof in `packages/civ7-direct-control/test/public-api.test.ts`
verifies the schemas are exported for future procedure-core consumers.

`packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts` now also owns an
empty TypeBox input schema for `getCiv7AppUiSnapshot`. Endpoint/session/state
selection remains a procedure context concern, not host/port/state/raw-command
input. Focused proof in
`packages/civ7-direct-control/test/app-ui-snapshot-procedure.test.ts` validates
the empty input and the existing App UI snapshot result schema through the
adjacent descriptor artifact, rejects endpoint/session/raw-command input
fields, and rejects root-level raw command output fields.

`packages/civ7-direct-control/src/play/notifications/view.ts` now owns TypeBox
schemas for `getCiv7PlayNotificationView` input, notification decision hints,
notification summaries, HUD decision queue items, and output. The input schema
admits only bounded `maxNotifications`; endpoint/session/state selection and
raw command fields remain procedure context/debug concerns. Focused proof in
`packages/civ7-direct-control/test/play-notification-view.test.ts` validates
the existing fake notification-view result against the output schema, rejects
out-of-bound input plus host/port/state/raw-command input, and rejects
root-level raw command output fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. This is a read-only notification
view schema seed; it does not change normal CLI output, notification
classification, dismissal behavior, runtime proof, or matrix-row acceptance.

`packages/civ7-direct-control/src/play/tactical/settlement.ts` now owns
TypeBox schemas for `getCiv7SettlementRecommendations` input, settlement
recommendation factors, origins, suggestions, recommendations, and output. The
input schema preserves the existing bounded `count` contract and uses the
shared bounded map-location schema for requested locations; endpoint/session/
state selection and raw command fields remain procedure context/debug
concerns. Focused proof in
`packages/civ7-direct-control/test/settlement-recommendations.test.ts`
validates the existing fake settlement recommendation result against the
output schema, rejects out-of-bound `count`, invalid map locations,
context/raw-command input, and root-level raw command output fields. Public
facade proof in `packages/civ7-direct-control/test/public-api.test.ts`
verifies the schemas are exported for future procedure-core consumers. This is
a read-only settlement recommendation schema seed; it does not change normal
CLI output, reinterpret recommendations as actions, add city-founding/send
behavior, claim runtime proof, or accept the matrix row.

`packages/civ7-direct-control/src/play/tactical/target-candidates.ts` now owns
TypeBox schemas for `getCiv7TargetCandidates` input, target-candidate
approach, target-candidate rows, relationship-label policy, and output. The
input schema preserves the existing bounded `playerId`, `origins`,
`maxCandidates`, `maxPlayers`, and `unitRadius` contracts. The output schema
keeps `relationshipLabelPolicy` constrained to `not-classified` / `none` /
`relationship-unproven`; endpoint/session/state selection and raw command
fields remain procedure context/debug concerns. Focused proof in
`packages/civ7-direct-control/test/tactical-reads.test.ts` validates the
existing fake target-candidates result against the output schema, rejects
out-of-bound inputs and invalid map locations, rejects context/raw-command
input and root-level raw command output fields, and rejects stronger
relationship-proof output. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas
are exported for future procedure-core consumers. This is a read-only
target-candidates schema seed; it does not change normal CLI output,
reinterpret candidates as action plans, infer hostile/enemy/non-friendly/
opponent/threat/war/ally/suzerain labels, add attack/move/send behavior, claim
runtime proof, or accept the matrix row.

`packages/civ7-direct-control/src/play/tactical/battlefield.ts` now owns
TypeBox schemas for `getCiv7BattlefieldScan` input, relationship-label policy,
unit rows, city rows, owner summaries, points of interest, and output. The
input schema preserves the existing bounded `playerId`, `origins`, `radius`,
`maxPlayers`, `maxUnits`, and `maxCities` contracts. The output schema keeps
`relationshipLabelPolicy` constrained to `not-classified` / `none` /
`relationship-unproven` and constrains row-level relationship proof/label slots
to `self`/`friendly` for local-player rows or `none`/`relationship-unproven`
for other-owner rows; endpoint/session/state selection and raw command fields
remain procedure context/debug concerns. Focused proof in
`packages/civ7-direct-control/test/tactical-reads.test.ts` validates the
existing fake battlefield scan result against the output schema, rejects
out-of-bound inputs and invalid map locations, rejects context/raw-command
input and root-level raw command output fields, and rejects stronger row-level
relationship proof or label output. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas
are exported for future procedure-core consumers. This is a read-only
battlefield-scan schema seed; it does not change normal CLI output,
reinterpret battlefield scan as action planning or validator output, infer
hostile/enemy/non-friendly/opponent/threat/war/ally/suzerain labels, add
attack/move/send behavior, claim runtime proof, or accept the matrix row.

The adjacent ready-unit descriptor artifact reuses those schema exports and
records root input/output field names from the actual TypeBox schemas,
including `legalOperations` for the ready-unit operation candidates. Focused
proof in `packages/civ7-direct-control/test/ready-unit-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties so stale fixture names do not become procedure contract fields. The
generic resolver guard in `packages/civ7-direct-control/src/procedure-core.ts`
now owns that field-list check for any descriptor resolved against explicit
schema artifacts. The same adjacent ready-unit, ready-city, and unit
move-preview procedure artifacts now export concrete `unit.ready.view`,
`city.ready.view`, and `unit.move.preview` call wrappers over
`getCiv7ReadyUnitView`, `getCiv7ReadyCityView`, and
`getCiv7UnitMovePreview`, composed through the local procedure-core call
primitive. Focused proof uses fake read-atom dependencies to prove
direct-control option forwarding, input validation before atom dependencies
run, output validation after the atoms return, separated output/diagnostics
without touching the live tuner, and neutral move-preview relationship-policy
preservation.

The adjacent ready-city descriptor artifact reuses the ready-city schema exports
and records `city.ready.view` beside `getCiv7ReadyCityView`. Focused proof in
`packages/civ7-direct-control/test/ready-city-procedure.test.ts` checks the
descriptor's input/output field lists against resolved schema root properties,
including `legalOperations`, `productionCandidates`, `townFocusOptions`, and
`populationPlacement`, without registering a router or transport adapter.

The adjacent unit move-preview descriptor artifact reuses the unit move-preview
schema exports and records `unit.move.preview` beside
`getCiv7UnitMovePreview`. Focused proof in
`packages/civ7-direct-control/test/unit-move-preview-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including reachability, queued/requested destination/path, and
neutral `relationshipPolicy`, without registering a router or transport
adapter.

The adjacent playable-status descriptor artifact reuses the playable-status
schema exports and records `runtime.playable.status` beside
`getCiv7PlayableStatus`. Focused proof in
`packages/civ7-direct-control/test/playable-status-procedure.test.ts` checks
the descriptor's empty input schema rejects endpoint/session/raw-command fields
and its output field list resolves against the composed playable-status schema
root properties, including non-ready unavailable output without a `tuner`
property, without registering a router or transport adapter.

The same adjacent playable-status procedure artifact now exports a concrete
`runtime.playable.status` call wrapper over `getCiv7PlayableStatus`, composed
through the local procedure-core call primitive. Focused proof uses fake App
UI/Tuner dependencies to prove direct-control option forwarding, input
validation before runtime dependencies run, ready and unavailable output
validation after the atom returns, separated output/diagnostics, and preserved
`errors` evidence plus omitted optional `tuner` for non-ready status. This is
local no-network runtime-support proof only; it does not execute live health
checks, add a router, add Effect/oRPC dependencies, choose Effect Schema, claim
runtime proof, or accept the matrix row.

The adjacent App UI snapshot procedure artifact reuses the App UI snapshot
schema exports and records `runtime.app.ui.snapshot` beside
`getCiv7AppUiSnapshot`. Focused proof in
`packages/civ7-direct-control/test/app-ui-snapshot-procedure.test.ts` checks
the descriptor's empty input schema rejects endpoint/session/raw-command fields
and its output field list resolves against the App UI snapshot result schema.
The same artifact exports a concrete call wrapper composed through the local
procedure-core call primitive. Focused proof uses a fake App UI command
dependency to prove direct-control option forwarding, input validation before
runtime dependencies run, output validation after the atom returns, and
separated output/diagnostics. This is local no-network runtime-support proof
only; it does not execute live App UI reads, add a router, add Effect/oRPC
dependencies, choose Effect Schema, claim runtime proof, or accept the matrix
row.

The adjacent notification-view procedure artifact reuses the notification-view
schema exports and records `notifications.view` beside
`getCiv7PlayNotificationView`. Focused proof in
`packages/civ7-direct-control/test/play-notification-view-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including notifications, decisions, HUD, and limits, without
registering a router or transport adapter. The same artifact exports a concrete
call wrapper over `getCiv7PlayNotificationView`, composed through the local
procedure-core call primitive. Focused proof uses fake atom dependencies to
prove direct-control option forwarding, input validation before atom
dependencies run, output validation after the atom returns, and separated
output/diagnostics. This is local no-network read-atom proof only; it does not
change CLI output, notification classification, dismissal behavior, add a
router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent settlement-recommendations procedure artifact reuses the
settlement recommendation schema exports and records
`strategy.settlement.recommendations` beside
`getCiv7SettlementRecommendations`. Focused proof in
`packages/civ7-direct-control/test/settlement-recommendations-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including requested locations, origins, recommendations, and notes,
without registering a router or transport adapter. The same artifact exports a
concrete call wrapper over `getCiv7SettlementRecommendations`, composed
through the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, input validation before
atom dependencies run, output validation after the atom returns, separated
output/diagnostics, and preservation of the read-only settlement lens boundary.
This is local no-network read-atom proof only; it does not change CLI output,
reinterpret recommendations as actions, add city-founding/send behavior, add
a router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent target-candidates procedure artifact reuses the target-candidates
schema exports and records `strategy.target.candidates` beside
`getCiv7TargetCandidates`. Focused proof in
`packages/civ7-direct-control/test/target-candidates-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including origins, neutral relationship label policy, candidates,
and notes, without registering a router or transport adapter. The same artifact
exports a concrete call wrapper over `getCiv7TargetCandidates`, composed
through the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, input validation before
atom dependencies run, output validation after the atom returns, separated
output/diagnostics, no-send read-only command text, and preservation of
relationship-unproven semantics. This is local no-network read-atom proof only;
it does not change CLI output, reinterpret candidates as action plans, infer
hostile/enemy/non-friendly/opponent/threat/war/ally/suzerain labels, add
attack/move/send behavior, add a broad tactical catalog, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

The adjacent battlefield-scan procedure artifact reuses the battlefield scan
schema exports and records `strategy.battlefield.scan` beside
`getCiv7BattlefieldScan`. Focused proof in
`packages/civ7-direct-control/test/battlefield-scan-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including origins, neutral relationship label policy, units,
cities, owners, points of interest, and notes, without registering a router or
transport adapter. The same artifact exports a concrete call wrapper over
`getCiv7BattlefieldScan`, composed through the local procedure-core call
primitive. Focused proof uses fake atom dependencies to prove direct-control
option forwarding, input validation before atom dependencies run, output
validation after the atom returns, separated output/diagnostics, no-send
read-only command text, and preservation of relationship-unproven semantics.
This is local no-network read-atom proof only; it does not change CLI output,
reinterpret battlefield scan as action planning or validator output, infer
hostile/enemy/non-friendly/opponent/threat/war/ally/suzerain labels, add
attack/move/send behavior, add a broad tactical catalog, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

The adjacent destination-analysis procedure artifact reuses the destination
analysis schema exports and records `strategy.destination.analysis` beside
`getCiv7DestinationAnalysis`. Focused proof in
`packages/civ7-direct-control/test/destination-analysis-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including required destination input, origin, bounded radii/caps,
neutral relationship label policy, corridor, destination pressure, points of
interest, and notes, without registering a router or transport adapter. The
same artifact exports a concrete call wrapper over
`getCiv7DestinationAnalysis`, composed through the local procedure-core call
primitive. Focused proof uses fake atom dependencies to prove direct-control
option forwarding, input validation before atom dependencies run, output
validation after the atom returns, separated output/diagnostics, no-send
read-only command text, and preservation of relationship-unproven semantics.
This is local no-network read-atom proof only; it does not change CLI output,
reinterpret destination analysis as pathfinding/route authority, movement/
attack/send planning, or validator output, infer hostile/enemy/non-friendly/
opponent/threat/war/ally/suzerain labels, add a broad tactical catalog, add a
router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent traditions-view procedure artifact reuses the traditions view
schema exports and records `strategy.traditions.view` beside
`getCiv7TraditionsView`. Focused proof in
`packages/civ7-direct-control/test/traditions-view-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including bounded player input, turn/government/slot state,
tradition action hints, recommended CLI affordances, hidden-info policy, and
notes, without registering a router or transport adapter. The same artifact
exports a concrete call wrapper over `getCiv7TraditionsView`, composed through
the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, input validation before
atom dependencies run, output validation after the atom returns, separated
output/diagnostics, no-send read-only command text, and preservation of
tradition action hints as read affordances rather than sends. This is local
no-network read-atom proof only; it does not change CLI output, send or
validate tradition changes, reinterpret the view as action execution, add a
progression taxonomy family or broad progression catalog, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

The adjacent progress-dashboard procedure artifact reuses the progress
dashboard schema exports and records `strategy.progress.dashboard` beside
`getCiv7ProgressDashboard`. Focused proof in
`packages/civ7-direct-control/test/progress-dashboard-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including bounded player input, age, player, legacy path, victory,
triumph, proof-source, hidden-info policy, and notes, without registering a
router or transport adapter. The same artifact exports a concrete call wrapper
over `getCiv7ProgressDashboard`, composed through the local procedure-core call
primitive. Focused proof uses fake atom dependencies to prove direct-control
option forwarding, input validation before atom dependencies run, output
validation after the atom returns, separated output/diagnostics, no-send
read-only command text, and preservation of progress dashboard data as a
read-only strategy/progress lens rather than chooser behavior. This is local
no-network read-atom proof only; it does not change CLI output, choose
technologies/civics/productions/policies/victory strategy, add a progression
taxonomy family or broad progression catalog, add a router, add Effect/oRPC
dependencies, choose Effect Schema, claim runtime proof, or accept the matrix
row.

The adjacent map-summary procedure artifact reuses the map summary schema
exports and records `map.summary.read` beside `getCiv7MapSummary`. Focused
proof in `packages/civ7-direct-control/test/map-summary-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including optional area-count input, bounded `maxIds`, map/game
runtime probes, optional area/region probe output, and raw/context input
separation, without registering a router or transport adapter. The same
artifact exports a concrete call wrapper over `getCiv7MapSummary`, composed
through the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, bounded input
validation before command execution, output validation after the atom returns,
separated output/diagnostics, and no-send read-only command text. This is local
no-network read-atom proof only; it does not change CLI output, implement plot
snapshot/map grid/GameInfo/visibility procedures, add a broad map catalog, add
a router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent plot-snapshot procedure artifact reuses the plot snapshot schema
exports and records `map.plot.snapshot` beside `getCiv7PlotSnapshot`. Focused
proof in `packages/civ7-direct-control/test/plot-snapshot-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including bounded map location input, field vocabulary, optional
hidden-info policy controls, plot location, revealed/visible probes,
hidden-info policy output, runtime-probe facts, and raw/context input
separation, without registering a router or transport adapter. The same
artifact exports a concrete call wrapper over `getCiv7PlotSnapshot`, composed
through the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, map-location validation
before Tuner execution, output validation after the atom returns, separated
output/diagnostics, and no-send read-only command text. This is local
no-network read-atom proof only; it does not change CLI output, implement map
grid/GameInfo/visibility procedures, add a broad map catalog, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

The adjacent map-grid procedure artifact reuses the map grid schema exports and
records `map.grid.read` beside `getCiv7MapGrid`. Focused proof in
`packages/civ7-direct-control/test/map-grid-procedure.test.ts` checks the
descriptor's input/output field lists against resolved schema root properties,
including exact bounds-or-locations input, validator-equivalent map bounds,
location, location-list, and maxPlots caps, field vocabulary, hidden-info
policy controls, omitted counts, optional map probes, plot outputs, and raw/
context input separation, without registering a router or transport adapter.
The same artifact exports a concrete call wrapper over `getCiv7MapGrid`,
composed through the local procedure-core call primitive. Focused proof uses
fake atom dependencies to prove direct-control option forwarding, bounded
maxPlots validation, map-bound validation before Tuner execution, output
validation after the atom returns, separated output/diagnostics, bounded
traversal command text, and no-send read-only command text. This is local
no-network read-atom proof only; it does not change CLI output, implement
GameInfo/visibility procedures, add a broad map catalog, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

The adjacent GameInfo-rows procedure artifact reuses the GameInfo rows schema
exports and records `runtime.gameinfo.rows` beside `getCiv7GameInfoRows`.
Focused proof in
`packages/civ7-direct-control/test/gameinfo-rows-procedure.test.ts` checks the
descriptor's input/output field lists against resolved schema root properties,
including table/filter identifiers, bounded `limit`/`offset`, lookup/filter/
include toggles, source `"GameInfo"`, row output, total/omitted status,
optional schema/primary-key runtime probes, and raw/context input separation,
without registering a router or transport adapter. The same artifact exports a
concrete call wrapper over `getCiv7GameInfoRows`, composed through the local
procedure-core call primitive. Focused proof uses fake atom dependencies to
prove direct-control option forwarding, identifier and bounded input
validation before Tuner execution, output validation after the atom returns,
separated output/diagnostics, Database schema/primary-key probe command text,
and no-send read-only command text. This is local no-network read-atom proof
only; it does not change CLI output, implement visibility procedures, add a
broad map/debug catalog, add a router, add Effect/oRPC dependencies, choose
Effect Schema, claim runtime proof, or accept the matrix row.

The adjacent visibility-summary procedure artifact reuses the visibility
summary schema exports and records `map.visibility.read` beside
`getCiv7VisibilitySummary`. Focused proof in
`packages/civ7-direct-control/test/visibility-summary-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including bounded player input, shared map-bounds input, the
existing `includeGrid`-requires-`bounds` invariant, bounded `maxPlots`,
revealed/visible runtime probes, counts/grid output, and raw/context input
separation, without registering a router or transport adapter. The same
artifact exports a concrete call wrapper over `getCiv7VisibilitySummary`,
composed through the local procedure-core call primitive. Focused proof uses
fake atom dependencies to prove direct-control option forwarding, player and
bounded input validation before Tuner execution, output validation after the
atom returns, separated output/diagnostics, visibility read command text, and
absence of reveal/send command text. This is local no-network read-atom proof
only; it does not wrap `revealCiv7MapForPlayer`, change CLI output, add a broad
map catalog, add a router, add Effect/oRPC dependencies, choose Effect Schema,
claim runtime proof, or accept the matrix row.

The adjacent turn-completion status procedure artifact reuses the
turn-completion status schema exports and records
`runtime.turn.completion.status` beside `getCiv7TurnCompletionStatus`.
Focused proof in
`packages/civ7-direct-control/test/turn-completion-status-procedure.test.ts`
checks the descriptor's empty input and output field lists against resolved
schema root properties, including turn, turn date, sent-turn-complete status,
end-turn availability, blocker, first ready unit, and raw/context input
separation, without registering a router or transport adapter. The same
artifact exports a concrete call wrapper over `getCiv7TurnCompletionStatus`,
composed through the local procedure-core call primitive. Focused proof uses
fake atom dependencies to prove direct-control option forwarding, input
validation before dependency execution, output validation after the atom
returns, separated output/diagnostics, turn-completion status read command
text, and absence of send/unready command text. This is local no-network
read-atom proof only; it does not change turn-completion send/unready mutation
behavior, autoplay behavior, CLI output, add a router, add Effect/oRPC
dependencies, choose Effect Schema, claim runtime proof, or accept the matrix
row.

The adjacent unit-summary procedure artifact reuses the unit summary schema
exports and records `unit.summary.read` beside `getCiv7UnitSummary`. Focused
proof in `packages/civ7-direct-control/test/unit-summary-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including bounded player, unit-id, and max-items input, unit
runtime-probe output, map-location output, and raw/context input separation,
without registering a router or transport adapter. The same artifact exports a
concrete call wrapper over `getCiv7UnitSummary`, composed through the local
procedure-core call primitive. Focused proof uses fake atom dependencies to
prove direct-control option forwarding, input validation before dependency
execution, output validation after the atom returns, separated output/
diagnostics, unit summary read command text, and absence of send-operation
command text. This is local no-network read-atom proof only; it does not add a
player-summary procedure atom, change CLI output, add a broad summary catalog,
add a router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent city-summary procedure artifact reuses the city summary schema
exports and records `city.summary.read` beside `getCiv7CitySummary`. Focused
proof in `packages/civ7-direct-control/test/city-summary-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including bounded player, city-id, and max-items input, city
runtime-probe output, map-location output, and raw/context input separation,
without registering a router or transport adapter. The same artifact exports a
concrete call wrapper over `getCiv7CitySummary`, composed through the local
procedure-core call primitive. Focused proof uses fake atom dependencies to
prove direct-control option forwarding, input validation before dependency
execution, output validation after the atom returns, separated output/
diagnostics, city summary read command text, and absence of send-operation
command text. This is local no-network read-atom proof only; it does not add a
player-summary procedure atom, change CLI output, add a broad summary catalog,
add a router, add Effect/oRPC dependencies, choose Effect Schema, claim runtime
proof, or accept the matrix row.

The adjacent player-summary procedure artifact reuses the player summary schema
exports, adds `player` as a narrow operational procedure family, and records
`player.summary.read` beside `getCiv7PlayerSummary`. Focused proof in
`packages/civ7-direct-control/test/player-summary-procedure.test.ts` checks the
descriptor's input/output field lists against resolved schema root properties,
including bounded player and max-items input, include toggles, player
runtime-probe output, component-id unit/city id output, and raw/context input
separation, without registering a router or transport adapter. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` proves the `player`
family/key pair without weakening family-prefix validation. The same artifact
exports a concrete call wrapper over `getCiv7PlayerSummary`, composed through
the local procedure-core call primitive. Focused proof uses fake atom
dependencies to prove direct-control option forwarding, input validation before
dependency execution, output validation after the atom returns, separated
output/diagnostics, player summary read command text, and absence of
send-operation command text. This is local no-network read-atom proof only; it
does not add a broad player procedure catalog, change CLI output, add a broad
summary catalog, add a router, add Effect/oRPC dependencies, choose Effect
Schema, claim runtime proof, or accept the matrix row.

The adjacent unit-target action request procedure artifact reuses the
unit-target action schemas and records `unit.target.action.request` beside
`requestCiv7UnitTargetAction`. Focused proof in
`packages/civ7-direct-control/test/unit-target-action-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties, including component-id input, validator-equivalent bounded target
coordinates, explicit `approvalReason`, optional disposable-session intent,
mutation gate metadata, caller-provided correlation, telemetry middleware
projection, and raw/context input separation, without registering a router or
transport adapter. The same artifact exports a concrete call wrapper over
`requestCiv7UnitTargetAction`, composed through the local procedure-core call
primitive. Focused proof uses a fake request dependency to prove direct-control
option forwarding, approval object construction before the existing atom send
path, input validation before dependency execution, output validation after the
atom returns, separated output/diagnostics, and no handler execution without a
caller-provided correlation ID. This is local no-network mutation-procedure
proof only; it does not execute live direct-control atoms, change CLI output,
weaken approval/validator/postcondition/no-repeat gates, add a router, add
Effect/oRPC dependencies, choose Effect Schema, claim runtime proof, or accept
the matrix row.

Local procedure-core payload validation now lives in
`packages/civ7-direct-control/src/procedure-core.ts`. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` validates ready-unit
input/output payloads and unit move-preview destination payloads against the
resolved descriptor schema artifacts, including ready-unit bounded input,
unit move-preview validator-equivalent map-location bounds, ready-unit output
shape, and raw root-field rejection. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the helpers are
exported. This is schema-payload proof only; it does not execute direct-control
atoms, add a router, add Effect/oRPC dependencies, choose Effect Schema, claim
runtime proof, or accept the matrix row.

Local no-network procedure-core calls now live in
`packages/civ7-direct-control/src/procedure-core.ts`. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` calls an injected
ready-unit handler through the procedure-core owner, proves validated input
reaches the handler, invalid input prevents handler execution, invalid output
fails after handler execution, caller-provided correlation ID policy is enforced,
and handler failures are normalized with procedure and correlation details.
Public facade proof in `packages/civ7-direct-control/test/public-api.test.ts`
verifies the call result/diagnostic schemas and call helper are exported. This
is local injected-handler proof only; it does not execute live direct-control
atoms, add a router, add Effect/oRPC dependencies, choose Effect Schema, claim
runtime proof, or accept the matrix row.

The procedure-core target exists to compose repo-owned direct-control
capabilities through typed procedures, context, middleware, error shaping,
correlation IDs, approval gates, and telemetry hooks. It must serve the
in-game controller router, external direct-control bridge, and future AI
services without turning any transport boundary into product authority.

## Core Boundary

Future procedure cores should be shared behavior modules. Callers may cross
different edges, but the core procedure/router contract should stay stable:

- CLI and no-network tests can call the router in-process.
- The game-scoped controller mod can call an in-process oRPC/Effect router
  behind serialized App UI ingress.
- `globalThis.Civ7IntelligenceBridge.invoke(...)` is serialized ingress through
  the existing Tuner/App UI boundary into that in-process router, not the
  product API.
- Studio browser clients may use HTTP `RPCHandler`/`RPCLink` after the core is
  coherent.
- OpenAPI or other external transports are edge adapters after procedure cores
  and tests exist.

No procedure core may expose arbitrary raw JavaScript command strings, raw
`game exec`, caller-owned socket/session state, raw SQL authority, or a generic
`control.call` tunnel.

## Future Procedure Atom Slots

Future implementation should converge on procedure atoms with these properties
or direct equivalents:

| Slot | Purpose |
|---|---|
| `procedureKey` | Stable router/procedure identity by capability, risk, and proof boundary. |
| `inputSchema` | Type-owned input contract with bounded values, player scope, approval reason when needed, and no raw JS literals. |
| `outputSchema` | Type-owned output contract with semantic result, debug/proof references, and evidence labels as appropriate. |
| `context` | Typed direct-control facade, controller facade if available, endpoint defaults, risk policy, approval, logger, clock, evidence sink, and live-session policy. |
| `middleware` | Reusable readiness, approval, validator-first, postcondition, relationship-authority, evidence-recording, error-normalization, and bounded polling policy. |
| `errorShape` | Typed errors that preserve direct-control parser labels, proof boundaries, and player-safe failure reasons without dumping raw internals by default. |
| `correlation` | Request/correlation identifiers for debug/proof/telemetry surfaces without leaking into normal CLI by default. |
| `projectionPolicy` | Explicit normal CLI, debug/internal service, AI-ingestion, telemetry, and procedure-core projection separation. |
| `proofBoundary` | Labels whether proof is local test, CLI verified, live-read, live-mutated, pending runtime proof, or planning evidence only. |

## Router Families

Procedure families should be named by operational surface, not transport:

- `health`;
- `runtime`;
- `controller`;
- `notifications`;
- `choices`;
- `player`;
- `city`;
- `unit`;
- `map`;
- `strategy`;
- `intelligence`;
- `session`.

The family list is a starting taxonomy, not an instruction to expose every
direct-control function.

## Schema Ownership

Current TypeBox public contracts stay in place until a consumer-backed schema
slice proves replacement value. Effect Schema is a candidate for new or
refactored Effect-native procedure-core, telemetry, and AI-ingestion contracts
where encode/decode, transformations, typed parse errors, Effect integration,
or machine-ingestion ergonomics materially help.

If oRPC requires Zod as an adapter layer, that boundary must be documented as
adapter-only. Zod must not become a third durable schema authority by drift.
The current descriptor metadata records this boundary explicitly:
`schemaTechnology: "typebox"` is accepted for local descriptor seeds, while
`effect-schema` and `zod-adapter` remain representable but unaccepted
descriptor claims.

Before schema migration or procedure-core row acceptance, the schema owner must
record:

- TypeBox ownership retained, replaced, or wrapped;
- Effect Schema ownership for new/refactored contracts if adopted;
- any Zod/oRPC adapter role;
- encode/decode behavior;
- typed error shape;
- runtime validation behavior;
- test ergonomics;
- migration blast radius;
- duplication cost;
- compatibility with normal CLI, debug/internal service, AI-ingestion,
  telemetry, and procedure-core projections.

## Middleware Boundaries

Middleware may centralize repeated policy only after procedure atoms make that
policy real. It may validate and record approval, but it must not invent
approval. Mutating procedures require approval-first, validator-first behavior,
postcondition classification, stale/unknown handling, and no-repeat guidance
where applicable.

Relationship authority remains structural: owner mismatch, contact, proximity,
visibility, or operation legality is not enough for hostile, enemy,
non-friendly, opponent, threat, war, ally, or suzerain labels without official
relationship/team/war/suzerain evidence.

## Acceptance Gaps

This contract plus the descriptor owner seed reduce the `contractArtifact`,
source-owner, descriptor runtime-validation, descriptor typed-error,
descriptor correlation-policy, descriptor live-runtime-proof guard, descriptor
context-policy, descriptor schema-technology guard, and no-raw-tunnel proof
gaps for the current TypeBox descriptor shape, generic raw fields,
repo-local command-source/session-execute
owners, context-owned endpoint/state input fields, and adjacent ready-unit,
ready-city, unit move-preview, playable-status, App UI snapshot, Tuner
health, notification-view, settlement-recommendations, target-candidates,
battlefield-scan, destination-analysis, traditions-view, and
progress-dashboard, map-summary, plot-snapshot, map-grid, GameInfo-rows, and
visibility-summary, turn-completion status, unit-summary, city-summary,
player-summary, unit-target action request, and production-choice request
descriptor artifacts with
schema-root field-list validation plus local payload validation against
resolved schema artifacts plus a local injected-handler call primitive in the
Effect/oRPC Procedure Cores row, plus concrete ready-unit, ready-city,
unit move-preview, playable-status, App UI snapshot, Tuner health, and
notification-view, settlement-recommendations, target-candidates,
battlefield-scan, destination-analysis, traditions-view, and
progress-dashboard, map-summary, plot-snapshot, map-grid, GameInfo-rows, and
visibility-summary, turn-completion status, unit-summary, city-summary,
player-summary, unit-target action request, and production-choice request
procedure call wrappers, but they do not accept the row.
Acceptance still needs:

- final concrete procedure schema and proof owners;
- accepted TypeBox versus Effect Schema/Zod adapter disposition for final
  procedure contracts;
- concrete procedure input/output owners over stable direct-control atoms
  beyond the current ready-read, move-preview, runtime-support, and
  notification-view, settlement-recommendations, target-candidates,
  battlefield-scan, destination-analysis, traditions-view, and
  progress-dashboard, map-summary, plot-snapshot, map-grid, GameInfo-rows, and
  visibility-summary, turn-completion status, unit-summary, city-summary,
  player-summary, unit-target action request, and production-choice request
  call wrappers;
- final middleware/error/correlation owners and runtime context construction
  beyond descriptor context-policy metadata and the local injected-handler call
  helper;
- final schema reference registration in the runtime router/procedure owner;
- explicit boundaries for in-game controller router, external direct-control
  bridge, and future AI services;
- final oRPC schema/procedure validation tests beyond the local TypeBox
  payload/call helper;
- final router/procedure error-shape snapshots;
- encode/decode round-trip tests;
- Bun runtime checks;
- CLI semantic projection tests;
- AI-ingestion contract fixture tests;
- final middleware approval/correlation/error tests;
- no-raw-command-tunnel tests over stable direct-control atoms;
- final proof-label guards in the procedure/router/runtime-proof owner.

## Stop Conditions

Stop and reframe if future procedure-core work:

- adds transport adapters before no-network procedure cores over stable atoms;
- adds `packages/civ7-control-orpc` behavior before procedure-core
  contracts/tests are accepted;
- exposes raw command strings, raw JavaScript literals, or generic control
  tunneling as procedure architecture;
- treats the App UI bridge or `Civ7IntelligenceBridge.invoke` as the product
  API instead of serialized ingress into the in-process router;
- lets handlers own tuner sockets, session reconnects, App UI/Tuner state
  discovery, or generated command strings outside `@civ7/direct-control`;
- starts schema migration without TypeBox / Effect Schema / Zod adapter
  disposition and tests;
- collapses normal CLI, debug/internal service, AI-ingestion, telemetry, and
  procedure-core outputs into one raw JSON shape;
- claims live/runtime proof from oRPC tests, type checks, local package tests,
  docs, target-thread evidence, or peer reports.
