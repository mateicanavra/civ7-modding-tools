# State-Role Architecture Report

Date: 2026-05-31
Lane: State-role architect
Scope: `@civ7/direct-control` control-surface expansion

## Evidence Labels

- [source] Claim comes from repo instructions, project/workstream docs, OpenSpec
  artifacts, or current source.
- [official-resource] Claim comes from `.civ7/outputs/resources` evidence
  described by the inventory reports.
- [recorded-live-proof] Claim comes from recorded runtime probes/reports already
  captured in project artifacts.
- [fresh-live-proof] Claim comes from a live probe run for this report.
- [inference] Claim is a reasoned architecture conclusion from the labeled
  evidence.
- [unresolved] Claim is not proven enough to authorize implementation.

No fresh live probes were run for this report; there are no [fresh-live-proof]
claims.

## Selected Architecture

- [source] `packages/civ7-direct-control` remains the single repo-owned boundary
  for Civ7 tuner socket defaults, `LSQ:` state discovery, state selection,
  `CMD:<stateId>:<javascript>` execution, frame parsing, reconnect polling,
  health checks, classified errors, restart/begin orchestration, runtime API
  inspection, and fresh log proof helpers.
- [source] App UI and Tuner are state roles inside the same direct-control
  boundary, not interchangeable transports, not caller-selected substitutes,
  and not a parity surface.
- [source] App UI owns lifecycle/client/session controls: restart, native begin,
  loading state, UI shell/game status, network/session status, local context,
  App UI snapshot, and App UI-facing automation/status reads.
- [recorded-live-proof] `Network.restartGame()` and `UI.notifyUIReady()` are
  recorded as App UI commands, while Tuner lacks `Network`, `UI`, and
  `GameContext` in recorded post-Begin probes.
- [source] Tuner owns post-Begin gameplay/map/control APIs after a read-only
  gameplay canary proves readiness; `LSQ:` state presence alone is not readiness.
- [recorded-live-proof] Recorded Tuner health returned `Game`, `Autoplay`,
  `GameplayMap`, and `Players` with turn/date, map dimensions, and alive player
  ids after Begin Game.
- [inference] The smallest durable architecture is a state-role API layer over
  the existing direct socket package: shared transport/session/error machinery
  below, App UI lifecycle domain and Tuner gameplay domains above, and raw
  command execution kept as an explicit expert escape hatch rather than a safe
  high-level API.

## Ownership Boundaries

| Owner | Owns | Must not own |
|---|---|---|
| [source] `@civ7/direct-control` transport/session core | Socket endpoint config, request framing, state discovery, state selection, command execution, reconnect polling, classified errors, raw state-scoped command helpers. | CLI output formatting, Studio HTTP shape, generated outputs, deployed mods, official resource files, caller-local socket protocol code. |
| [source] App UI role API | `restartCiv7Game`, `beginCiv7Game`, `restartCiv7GameAndBegin`, App UI snapshot, loading/session/client/local context reads, future bounded App UI automation controls. | Post-Begin gameplay/map ownership, generic gameplay command routers, Tuner readiness proof. |
| [source] Tuner role API | `checkCiv7TunerHealth`, `waitForCiv7TunerReady`, post-Begin map/player/unit/city/visibility/catalog reads, future validator-first gameplay controls. | Restart, native begin, lifecycle loading flow, network/account/session client controls. |
| [source] CLI | Command parsing, flags, terminal/JSON output, command names, process exit semantics. | Socket framing, state discovery implementation, reconnect logic, independent state-role semantics. |
| [source] Studio | HTTP endpoint shape, UI copy, save/deploy workflow, runtime comparison presentation. | Socket framing, direct runtime protocol logic, package-internal wrapper ownership. |
| [official-resource] Official resources | Game facts, schemas, examples of Firaxis call shapes, reference-client usage evidence. | Repo API ownership, package architecture, product promise, generated source truth. |

## OpenSpec Change Recommendations

- [source] Keep the existing `civ7-direct-control-surface` requirement for one
  direct-control owner and state-specific App UI/Tuner behavior; do not reopen
  transport ownership in this lane.
- [source] Add a new OpenSpec slice for state-role read APIs before mutating
  action APIs. It should specify App UI lifecycle reads separately from Tuner
  post-Begin map/gameplay reads.
- [inference] The read slice should define stable output contracts, bounded
  result sizes, state role used, proof boundary, and error behavior for each
  wrapper; implementation can then land in small Graphite layers.
- [source] Add a later OpenSpec slice for mutating gameplay/action APIs only
  after read APIs exist, with validator-first contracts, explicit mutation
  labels, no automatic replay after socket failure, and before/after proof.
- [inference] Add a catalog/types slice after the read slice, because catalog
  entries need state-role provenance and read-wrapper experience before they can
  classify roots, methods, constants, and risk accurately.
- [source] Avoid spec text that says App UI and Tuner are equivalent surfaces,
  allows generic state substitution, or implies callers can route lifecycle
  controls through Tuner.
- [source] Avoid daemon/service scope until a future accepted decision proves
  multiple external clients or shared long-lived sessions need process
  lifecycle ownership.

## Required API Domains

| Priority | Domain | State role | Minimal API shape |
|---|---|---|---|
| [source] P1 | Lifecycle/client status | App UI | Existing restart/begin helpers plus `getCiv7AppUiSnapshot`; keep names state-explicit where ambiguity matters. |
| [source] P1 | Tuner readiness | Tuner | Existing `checkCiv7TunerHealth` and `waitForCiv7TunerReady`; readiness remains a command canary with gameplay globals and basic map/player facts. |
| [source] P1 | Map summary/grid/plot reads | Tuner | `getCiv7MapSummary`, `getCiv7PlotSnapshot`, `getCiv7MapGrid`, with field/bounds limits and projection-proof wording. |
| [source] P1 | Player/unit/city reads | Tuner | `getCiv7PlayerSummary`, `getCiv7UnitSummary`, `getCiv7CitySummary`, all bounded by player/filter options and clear visibility semantics. |
| [source] P1 | Visibility reads | Tuner | `getCiv7VisibilitySummary(playerId)` and optional bounded revealed-state grid; no reveal mutation in the read slice. |
| [source] P2 | Catalog/table reads | Tuner preferred | `getCiv7GameInfoRows(table, options)` or catalog snapshot helpers with allowlists/limits; raw SQL remains outside first-class safe APIs. |
| [source] P2 | Runtime inspection | Both | Keep `inspectCiv7RuntimeApi` and add state-role convenience wrappers only if they preserve root allowlists and provenance labels. |
| [source] P2 | Autoplay controls | App UI or Tuner, explicit | Later mutating API with max-turn cap, before/after status, stop semantics, and caller-visible mutation label. |
| [source] P2 | Gameplay actions | Tuner | Later validator-first `canStart*` wrappers before any `sendRequest` wrapper; action execution requires named operation contracts and postcondition reads. |
| [unresolved] P2 | Map editing/builders | Tuner research/raw | `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`, `AreaBuilder`, and related map mutation helpers need disposable-session proof and ownership decisions before wrapping. |

## Stop And Reframe Triggers

- [source] Stop if a proposed API duplicates socket/state ownership outside
  `@civ7/direct-control`.
- [source] Stop if a proposed spec or implementation treats App UI and Tuner as
  parity surfaces or permits lifecycle commands to drift into Tuner ownership.
- [source] Stop if a mutating wrapper can be retried automatically after socket
  failure or reconnect without an explicit new caller request.
- [source] Stop if a high-level wrapper is just a generic operation/request
  launcher without a named state role, validator contract, bounded inputs, and
  observable result.
- [source] Reframe if fresh runtime evidence shows App UI no longer owns restart
  or native begin in supported lifecycle phases.
- [source] Reframe if fresh runtime evidence shows Tuner cannot reliably provide
  post-Begin gameplay readiness, map reads, or basic player facts.
- [unresolved] Reframe if useful gameplay actions require UI selection/input
  state outside `CMD:<stateId>:<javascript>`.
- [unresolved] Reframe if `GameInfo`/`Database` result sizes or query semantics
  cannot be bounded for safe package APIs.
- [unresolved] Reframe if map/player mutation proof shows persistent corruption
  or validation bypass that cannot be contained to disposable sessions.

## P1 Risks

- [source] Duplicate ownership: CLI, Studio, or a future service could regain
  socket/state behavior if wrapper contracts are vague. Mitigation: specs must
  require imports from `@civ7/direct-control` for runtime control and tests
  should cover presentation-only callers.
- [source] State-role collapse: generic helper names can hide whether App UI or
  Tuner owns behavior. Mitigation: public APIs should encode the role where
  ambiguity changes semantics, and docs/specs should state the selected role.
- [source] Mutation replay: reconnect helpers can accidentally replay commands
  if action wrappers share read-polling machinery. Mitigation: retry only
  read-only discovery/health probes; each mutation needs one caller-owned
  attempt plus follow-up proof.
- [inference] Over-broad service scope: adding a long-running daemon now would
  create lifecycle, port, concurrency, and auth questions before the API domains
  are stable. Mitigation: keep this lane inside package/session APIs.

## P2 Risks

- [source] Catalog overclaim: runtime introspection finds roots/method names but
  weak signatures and native `length` values. Mitigation: catalog entries need
  provenance, confidence, and manual mutation classification.
- [source] Raw database/query exposure: `GameInfo` and `Database` are useful but
  dynamic and potentially large. Mitigation: allowlisted tables, row limits, and
  safe read helpers before any general query convenience.
- [source] Hidden-information reads: map/player snapshots may expose facts a
  player should not see. Mitigation: visibility-aware options and explicit
  proof labels for omniscient developer reads versus player-visible reads.
- [source] FireTuner panel globals: official panel code is useful call-shape
  evidence, but panel globals are not proven direct-control roots. Mitigation:
  require state-scoped live proof before treating panel globals as callable.
- [unresolved] Map editing semantics: builder and constructible APIs may require
  worldbuilder/session modes or cleanup semantics. Mitigation: keep raw until
  disposable-session proof and postcondition checks exist.

## Review Checklist For Implementation

- [ ] [source] Every new public API states its role: App UI, Tuner, or both with
  separate behavior.
- [ ] [source] Lifecycle/client APIs target App UI and do not assume Tuner
  globals.
- [ ] [source] Post-Begin gameplay/map APIs target Tuner and require the Tuner
  readiness canary where appropriate.
- [ ] [source] CLI and Studio code import package APIs and contain no socket
  framing, state discovery, or reconnect ownership.
- [ ] [source] Specs avoid language that makes App UI and Tuner equivalent or
  allows hidden alternate-control paths.
- [ ] [source] Mutating APIs are labeled as mutating, bounded, single-attempt,
  and paired with before/after or postcondition reads.
- [ ] [source] Read APIs have bounded result sizes, explicit filters, and clear
  visibility/omniscience semantics.
- [ ] [source] Catalog/type outputs carry state, source, confidence, risk, and
  wrapper recommendation; native runtime metadata is not promoted into precise
  signatures without corroboration.
- [ ] [source] No daemon/service process is introduced without a separate
  accepted architecture decision.
- [ ] [source] Generated outputs, logs, deployed mods, and official resources are
  used only as evidence, not edited as source.
- [ ] [source] Tests cover state selection, role-specific failures, output
  bounds, classified errors, and no replay of mutating commands.
- [ ] [recorded-live-proof] Runtime proof claims name the exact session/phase
  they prove and do not generalize beyond that boundary.
