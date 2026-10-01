# Civ7 System Model

**Status:** Normative destination model
**Date:** 2026-08-06
**Owner:** Civ7 platform architecture

This model places the capabilities in
[PRODUCT-AUTHORITY.md](./PRODUCT-AUTHORITY.md) into one directional system. It
defines ownership and relationships, not migration chronology or permission to
copy the current estate into similarly named folders.

## System Boundary

Inside the Civ7 modding platform:

- official-data extraction and generated API authority;
- portable mod and MapGen authorship;
- in-engine controller semantics and realization;
- host access, Play policy, MapGen run state, and caller projections;
- qualified app composition and proof.

Outside the boundary:

- Firaxis' engine, UI documents, loader, files, sockets, processes, and windows;
- Steam and operating-system lifecycle;
- actor goals that the product has not explicitly admitted;
- unproven future network APIs and durable workflows.

Foreign systems cross the boundary only through generated evidence, resource
contracts, or qualified realization adapters. Their globals and failures do
not become platform-wide state.

## Placement Laws

| Kind | Owns | Must not own |
| --- | --- | --- |
| Package | Runtime-free reusable or generated authority | Foreign lifecycle, process selection, product orchestration |
| Resource | Provider-neutral foreign capability contract and failure vocabulary | Concrete runtime facts, product semantics, controller operations, caller policy |
| Provider | Concrete acquisition, use mechanics, runtime facts, and release under a resource contract | Product meaning or app membership |
| Service | One semantic contract, policy, state, and operation authority | Provider acquisition, HTTP/CLI presentation, foreign process lifetime |
| Plugin | A portable definition or caller projection | Host realization, service write authority, provider lifecycle |
| App | Concrete selection, binding, mounting, process lifetime, and disposal | Portable definition or reusable product semantics |
| Workflow | Durable orchestration across a request/process boundary | Service state, public API envelopes, provider ownership |

Habitat owns the generic closed kind shells. Civ7 owns qualified instances,
domain overlays, and product proof. Missing generic kinds are upstream
construction refusals; Civ7 neither copies nor substitutes shared Habitat law.

## Selected Semantic Topology

```text
packages/
  civ7-api/                    generated official API authority
  civ7-map-policy/             generated map policy
  mapgen-*/ sdk/               portable authoring and execution substrate
  civ7-mod-install/            pure planning, validation, digest, receipt data

resources/
  civ7-tuner/
    providers/local-socket/    managed foreign Tuner session
  window-capture/
    providers/macos-.../       generic selected-window evidence and scoped child lifecycle

services/
  civ7-controller/             TypeScript native operations, executed in Civ7
  civ7-play/                   actor intent, policy, reconciliation, next action
  mapgen-runs/                 correlated Studio run-operation state

plugins/
  mod/ui/civ7-controller/      portable controller mod definition
  mod/map/swooper-physics/     portable Swooper product definition
  cli/topics/.../              command projections
  server/api/mapgen-studio/    Studio caller contract and projection

apps/
  mods/ui/civ7-controller/     controller bundle, install, loader and live proof
  mods/map/swooper-physics/    Swooper Civ7 realization
  cli/                         local composition and command host
  mapgen-studio/               browser, API, providers and run composition
```

Names beneath an unimplemented destination are semantic cards, not permission
to scaffold an empty container. A component lands only when its complete
capability chain and qualified Habitat law are ready.

## Service Shape

Each service owns one contract and one implementation authority:

```text
contract  -> public boundary truth
router    -> complete private implementation
client    -> typed callable projection of that contract
```

The three faces are not three contracts. Consumers receive the public client.
API plugins compose clients; they do not mount private service routers or pick
contract leaves to manufacture parallel interfaces.

The controller is unusual only in its execution environment, not its semantic
model. Its TypeScript implementation and router are bundled into the controller
mod. The portable controller definition owns the realm-local bootstrap and
versioned global ingress around that router. The mod app bundles and installs
the definition without owning its engine behavior. Host apps bind the
controller's public client to that ingress through a narrow oRPC transport. The
transport owns envelopes, correlation, realm/boot validation, and the
live-proven completion mechanism only. It knows no controller operation
semantics.

No separate controller resource is selected. Tuner already owns the foreign
acquire/use/release lifetime; the controller link is an app-bound integration
over a ready Tuner capability and a controller-owned contract. It becomes a
resource only if an independently managed lifecycle appears.

## Authority Direction

```text
official Civ7 corpus
  -> generated civ7-api
  -> controller contract and TypeScript implementation
  -> controller mod definition
  -> controller mod app
  -> Civ7 loader
  -> realm-local controller instance

host app
  -> selected Tuner provider
  -> ready Tuner resource value
  -> app-owned controller transport binding
  -> public controller client

actor
  -> CLI or API projection
  -> public Play client
  -> Play service
  -> public controller client
  -> realm-local controller
  -> official Civ7 API
  -> native evidence
  -> Play reconciliation
  -> caller result
```

The synchronous semantic service graph is acyclic:

```text
civ7-play   -> civ7-controller
mapgen-runs -> civ7-controller
civ7-controller -> none
```

An app binding, durable data reference, projection call, or workflow obligation
does not create a reciprocal service dependency.

## Cross-Owner Relationships

| From | To | Relationship | Rule |
| --- | --- | --- | --- |
| Controller | Generated Civ7 API | Conformist static contract | Controller imports state-qualified official declarations; it does not redefine them |
| Controller mod definition | Controller | In-engine realization | Definition bootstraps the service router and exposes one versioned realm-local ingress through the unchanged controller contract |
| Controller mod app | Controller definition | Host realization | App bundles and installs the exact definition and records build/install/live receipts without owning ingress behavior |
| Controller mod app | Civ7 loader | Foreign realization | Generated, installed, loaded, and ready remain separate receipts |
| Host app | Tuner provider | Runtime realization | App selects and scopes the provider; the provider implements the resource contract and owns concrete acquisition/use/release facts |
| Host app | Controller | Transport binding | App supplies a ready link to the controller-owned client factory; no facade |
| Play | Controller | Public client dependency | One-way, semantic, and typed |
| MapGen-runs | Controller | Public client dependency | Used only for admitted live setup/observation operations |
| CLI/API plugin | Services | Caller projection | May translate and compose, never write owner state directly |
| Workflow | Public service clients | Durable orchestration | Admitted only when work crosses request/process lifetime |
| Definition plugin | Realization app | Product realization | Definition supplies portable truth; app supplies target effects |

## Civ7 V8 Runtime Closure

`runtime:civ7-v8` is an orthogonal execution-realm fact, not a replacement for
Habitat service, plugin, package, or app kinds. It applies only to a whole
closed production project that is admissible inside Civ7's embedded V8. Every
workspace dependency reachable from that production source carries the same
tag. Every npm import belongs to the exact compatibility set proved for the
emitted bundle. Qualified source law refuses `node:` and `bun:` imports and
same-project escape into host tools or deployment code.

The generated Civ7 API activates this closure first, in the same cut as its
executable import proof. The controller service and portable controller
definition each earn the tag later, atomically with their own import and bundle
proof. The controller mod app, Tuner resource/provider, host bindings,
build/install code, and live proof do not. A mixed project must split before
selection; it never receives an exception. Live shell/game loading remains the
final behavior oracle.

## Controller Runtime Realms

Official Civ7 resources prove separate shell, loading, and game document roots
and support shell- and game-scoped `UIScripts`. They do not yet prove how the
Tuner-observed App UI global behaves across those transitions. The selected
architecture proposes the same controller bootstrap in both scopes and must
prove its versioned callable surface through the live gate before source
migration depends on it.

The model therefore requires:

- a bootstrap-created controller boot identity whose replacement behavior is
  measured across document transitions;
- explicit observation of whether the controller is absent, retained, or
  replaced during the dedicated loading document;
- fresh Tuner state discovery and controller probing before every operation or
  lifecycle phase;
- no stable numeric Tuner state ID;
- idempotent bootstrap installation;
- no mutation replay after an indeterminate transport result.

The current Tuner protocol proves only request/response framing. Live proof must
first discriminate direct Promise handling, continued asynchronous work, and
later global visibility. Only then may the transport select a direct response
or bounded correlated mailbox. No mutating asynchronous controller operation is
admitted before that selection.

## Control And Play Boundaries

Controller modules follow official platform realms and remain mechanical.
Gameplay nouns can appear beneath the controller's game boundary as native
operation groups, but they do not become root platform services or policy
owners.

Play uses actor language and may organize around city, diplomacy, progression,
planning, turn, unit, or other proven gameplay concerns. It owns:

- situation and attention;
- goal and choice admission;
- multi-operation coordination;
- post-dispatch observation;
- uncertainty and no-repeat policy;
- next-action recommendation.

The controller owns:

- fresh native observation and readiness checks;
- exact native operands;
- at-most-once dispatch;
- immediate engine evidence when available;
- exposure of bootstrap-issued realm/boot identity and ownership of operation
  identity.

This boundary removes the old facade rather than moving it.

## Supporting Host Capabilities

Raw Tuner execution remains a qualified app diagnostic. It can prototype an
operation before that operation graduates into controller TypeScript, but no
ordinary service may import it.

Window capture is selected as a generic managed capability because its provider
scope owns admitted in-flight capture children and release drains or terminates
them. The resource owns only the provider-neutral selected-window contract and
failure vocabulary; the macOS provider owns concrete preparation, capture,
child lifecycle, and release facts. Current use remains an explicit diagnostic
or qualified app observation; Play has no unnamed window-capture dependency.

OS process launch, restart, and focus similarly become a generic desktop-app
resource only when their managed lifecycle is implemented and reused. Until
then they are explicit qualified app effects, never controller operations.

## MapGen Realization Chains

```text
portable Swooper definition
  -> deterministic MapGen execution and evidence
  -> Swooper realization app
  -> generated mod artifact
  -> install receipt
  -> Civ7 loader and live proof

canonical map config
  -> qualified source-write adapter
  -> MapGen-runs accepted operation
  -> qualified materialize/install/log adapters
  -> public controller client for live phases
  -> correlated terminal outcome
  -> Studio API and web projection
```

MapGen-runs owns operation intent, order, state, cancellation, adoption,
retention, and reconciliation. It does not own portable configuration,
filesystem mechanics, controller semantics, or Studio transport.

The Swooper realization app installs the stable product mod under its own mod
identity. Studio run adapters install only the reserved ephemeral run mod under
its request-correlated identity. Their target trees and receipts are disjoint;
neither app may overwrite or issue facts for the other's installation.

## System Dynamics

The legacy reinforcing loop was:

```text
mixed direct-control consumers
  -> more convenience exports and facade methods
  -> more consumers bypass semantic owners
  -> more local rules needed to protect the hybrid
  -> greater direct-control gravity
```

The selected balancing loop is:

```text
product authority
  -> closed kind and dependency law
  -> violations become explicit
  -> each behavior moves to one qualified owner or is deleted
  -> consumer proof removes the displaced owner
```

Live operation stability has its own balancing loop: every realm transition
invalidates controller identity; fresh discovery and boot validation prevent a
stale caller from dispatching into the wrong document.

## Forbidden Relations

- controller or Play -> raw Tuner execute;
- controller -> host process, window, filesystem, CLI, HTTP, or workflow;
- Play -> Tuner provider, controller router, or controller implementation;
- API plugin -> private service router or provider;
- provider -> product policy;
- app -> duplicated service semantics;
- service -> app construction or another service's private state;
- package -> runtime acquisition or host mutation;
- mature operation -> generated JavaScript implementation body;
- deleted or transitional source -> destination authority.

## Construction Gate

Before source migration resumes, the model packet must prove:

1. every baseline behavior has one owner and disposition;
2. every cross-owner edge has one relationship kind and direction;
3. the service dependency graph is acyclic;
4. controller realm, bootstrap, transport, and proof gaps are explicit;
5. every generic destination kind is constructible through the installed
   Habitat substrate, with only qualified Civ7 overlays layered above it;
6. no compatibility facade or alternate mature execution path survives.

## Falsifiers

Reopen the system topology if a live experiment disproves the controller realm
model, a selected owner requires reciprocal service calls, an app binding grows
independent lifecycle authority, or a claimed service/resource cannot state an
owned semantic transition or acquire/use/release obligation respectively.
