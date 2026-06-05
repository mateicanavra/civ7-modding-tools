# Semantic Capability Hierarchy

Status: target hierarchy seed for Task 5.3.
Date: 2026-06-04.

## Purpose

This record defines the semantic capability hierarchy the native control-oRPC
service should move toward before more procedure leaves are added. It is a
service-ownership map, not a rename plan for the existing transitional
facade-only procedures.

The current package modules still mirror direct-control implementation
containers such as `runtime`, `map`, `unit`, `city`, `player`, and
`notifications`. Those modules proved in-process oRPC mechanics, but they are
not the continuing Sieve/player-agent service model. Future work should use the
hierarchy below to decide where service-owned behavior, context dependencies,
middleware policy, and direct-control runtime ports belong.

## Authority Inputs

- `workstream/native-slice-authority.md`
- `workstream/atom-policy-dependency-inventory.md`
- current `packages/civ7-control-orpc/**` source and package `AGENTS.md`
- current direct-control procedure descriptors and proof-policy helper slices
- Magic API runtime refactor reference provided by the user, specifically the
  pattern that API/procedure layers own caller-facing behavior while runtime
  adapters assemble concrete dependencies

## Target Families

### `readiness`

Answers whether support can safely observe or act now.

Source evidence:

- `runtime.playable.status`
- `runtime.tuner.health`
- `runtime.app.ui.snapshot`
- `runtime.turn.completion.status`

Service ownership:

- compose App UI/Tuner readiness into a support-safe status;
- consume endpoint defaults and state selection from context;
- keep raw state/session/command details in debug/internal projections;
- do not claim live gameplay proof from local procedure tests.

### `attention`

Represents current player-support blockers and required attention, not every
possible recommendation.

Source evidence:

- `notifications.view`
- ready unit and ready city views;
- turn completion status;
- production/narrative/diplomacy/progression blockers surfaced through current
  notification and closeout reads.

Service ownership:

- classify blockers, decisions, actions, and next steps for normal
  player-agent output;
- keep non-blocking observations out of blocker slots;
- route mutation candidates to approved domain procedures, never to raw
  command text.

### `world`

Represents stable game-state reads that support reasoning but do not ask the
player to act by themselves.

Source evidence:

- map summary, grid, plot snapshot, and visibility reads;
- player, city, and unit summaries;
- game info rows when used as bounded runtime support/debug evidence.

Service ownership:

- expose bounded state views for Sieve/future consumers;
- preserve relationship neutrality in world and actor summaries;
- keep raw GameInfo/root inspection under debug/internal ownership.

### `strategy`

Represents planning and recommendation reads.

Source evidence:

- settlement recommendations;
- target candidates;
- battlefield scan;
- destination analysis;
- progress dashboard and traditions/progression reads when used for planning.

Service ownership:

- present read-only recommendation and planning evidence;
- never reinterpret planning candidates as approved actions;
- preserve `relationship-unproven` semantics unless official
  relationship/team/war/suzerain evidence proves stronger labels.

### Domain Choice Procedures

Represents player choices that close a blocker or select an option. Choice,
decision, request, response, and action are procedure roles, not service root
families. The owning Civ domain should come first.

Source evidence:

- `city.production.choice.request`;
- `progression.technology.choice.request` and
  `progression.culture.choice.request`;
- implemented `narrative.choice.request` under the `narrative` domain root;
- implemented `diplomacy.response.request` under the `diplomacy` domain root;
- population placement under `city`.

Service ownership:

- own the caller-facing domain procedure shape and semantic output;
- consume direct-control validators, postcondition classifiers, and proof
  helpers as runtime/proof ports;
- require approval and no-repeat proof policy before any send;
- do not infer repeat safety from legacy `verified` booleans.

### Domain-Owned Mutations

Represents approved gameplay sends owned by the domain whose state and
language define the action. Operations are verbs/capabilities, not a semantic
entry family.

Source evidence:

- unit target action under `unit`;
- notification dismissal under the notification/attention mutation domain;
- setup/restart/begin actions;
- autoplay actions;
- turn completion sends;
- future movement or city/unit sends under their owning domains.

Service ownership:

- compose approval, validator-first checks, send receipts, post-read
  evidence, postcondition/proof classification, and no-repeat policy through
  native oRPC/effect-orpc procedures and middleware;
- use direct-control only for runtime authority, command serialization,
  validators, proof classifiers, and telemetry facts;
- never expose raw command strings as normal input or output.

### `debug`

Represents intentional support/debug inspection.

Source evidence:

- App UI snapshot;
- Tuner health;
- GameInfo rows;
- capability catalog/root inspection;
- raw proof/debug telemetry projections.

Service ownership:

- keep raw diagnostics behind explicit debug/internal procedures or projections;
- do not let debug shape become normal CLI/player-agent or AI-ingestion shape;
- redact or bound raw command-bearing error/cause details.

## Transitional Burn-Down Map

| Current module family | Target semantic family |
|---|---|
| `runtime.playable.status` | replaced by `readiness.current`; direct-control playable status remains the runtime port |
| `readiness.current` | `readiness` |
| `runtime.tuner.health`, `runtime.app.ui.snapshot`, `runtime.gameinfo.rows` | `debug`, with readiness summaries consumed by `readiness` |
| `runtime.turn.completion.status` | `attention` and `readiness` |
| `notifications.view` | burned down; `attention.current` consumes the direct-control notification port |
| `notifications.dismiss.request` | notification domain mutation; semantic target still needs rebaseline |
| `unit.ready.view` | burned down; `attention.current` consumes the direct-control ready-unit port |
| `city.ready.view` | burned down; `attention.current` consumes the direct-control ready-city port |
| `unit.summary.read`, `city.summary.read`, `player.summary.read` | burned down as public oRPC wrappers; future `world` service must decompose lower-level runtime/probe resources or move semantic summary behavior into control-oRPC |
| `unit.move.preview` | `world` read plus future unit validation evidence |
| `unit.target.action.request` | `unit` |
| `city.production.choice.request` | `city` |
| `progression.technology.choice.request`, `progression.culture.choice.request` | `progression` |
| `narrative.choice.request` | `narrative` |
| `diplomacy.response.request` | `diplomacy` |
| `map.summary.read`, `map.grid.read`, `map.plot.snapshot`, `map.visibility.read` | `map.summary.read` wrapper burned down; future `world` service must not treat direct-control summary envelopes as bare runtime ports |
| `strategy.*` planning reads | `strategy` |
| narrative, diplomacy, culture, technology, population closeouts | owning Civ domain, not a generic decisions/action root |
| setup, restart, autoplay, reveal-map, turn-send behavior | domain-owned mutation or `debug`, depending on approval/risk class |

Existing `packages/civ7-control-orpc/src/modules/**` files may remain while
the router is transitional. New implementation slices should not add another
facade-only leaf to those modules. A future code reorganization should create
semantic modules only when it also moves service-owned behavior into those
modules or explicitly burns down an old wrapper.

## 5.4-Ready Ownership Matrix

| Target family | Service-owned behavior | Direct-control runtime/proof ports | Context dependencies | Middleware candidates |
|---|---|---|---|---|
| `readiness` | Support-safe readiness status and action/read permission summary | App UI snapshot, Tuner health, playable status, turn completion read | `directControl`, `endpointDefaults`, `stateSelection`, `logger`, `clock` | readiness, safe error projection |
| `attention` | Current blockers, required decisions, ready actors, and semantic next steps | notifications view, ready unit/city reads, turn completion status, closeout blocker reads | `directControl`, `endpointDefaults`, `stateSelection`, projection policy, `logger` | readiness, projection separation, relationship authority when actor labels appear |
| `world` | Bounded world/actor state views for reasoning | map reads, visibility, plot/grid reads, player/city/unit summaries | `directControl`, `endpointDefaults`, `stateSelection`, relationship policy | relationship authority, bounded-read policy |
| `strategy` | Planning/recommendation views without action authority | settlement, target candidates, battlefield, destination, progress/tradition reads | `directControl`, `endpointDefaults`, relationship policy, risk policy | relationship authority, projection separation |
| domain choice procedures | Choice procedures that close blockers or select player options under their owning Civ domain | production, culture, technology, narrative, diplomacy, population validators/postconditions/proof helpers | `directControl`, approval, risk policy, evidence sink, clock, correlation, logger | approval, validator-first, postcondition/proof, no-repeat |
| domain-owned mutations | Approved gameplay sends with explicit pre/post proof, placed under the owning domain router rather than an `operations` root | unit target, notification dismissal, setup/autoplay/turn/movement runtime ports and proof owners | `directControl`, approval, risk policy, evidence sink, clock, correlation, logger | approval, validator-first, postcondition/proof, no-repeat, readiness |
| `debug` | Intentional diagnostics and support-only inspection | Tuner/App UI snapshots, GameInfo rows, capability catalog, root inspection, raw proof/debug projections | `directControl`, endpoint/state debug context, logger, correlation | safe error projection, debug projection separation |

This matrix is preparatory evidence for Task 5.4, not acceptance of Task 5.4.
It names the owners the next source slice should prove in code. It does not
construct providers, context materializers, middleware, or service clients.

## Next Slice Guidance

Good next slices:

- create a service-owned `attention` module that composes notifications, ready
  units/cities, and turn-completion status into a semantic blocker/decision
  view without raw diagnostics;
- continue Task 5.2 only for narrow write-capable proof-policy owners with
  source-owned validators/postconditions; population placement is now seeded
  by `workstream/population-placement-proof-policy-source-slice.md`;
- create a mutation procedure only after approval, validator-first, and
  postcondition/no-repeat policies are composed through native oRPC/effect-orpc
  primitives;
- add a native middleware only when at least two target semantic families share
  a proven policy and the implementation uses oRPC/effect-orpc primitives
  directly.

Bad next slices:

- another direct-control facade method wrapper;
- a custom procedure-core, context composer, before/after handler pipeline,
  error bus, correlation bus, or transport adapter;
- a normal output shape that exposes raw command/session/debug telemetry;
- a strategy or world view that labels owners as hostile, enemy, opponent,
  threat, ally, allied, suzerain, or war without official evidence.

## Proof Boundary

This slice is OpenSpec hierarchy work only. It does not implement procedure
source, rename current procedure keys, add middleware, add transports, accept
Task 5.x or 6.x as implemented, or claim runtime proof.

Verification for this slice is limited to strict OpenSpec validation, diff
hygiene, and clean Graphite state.
