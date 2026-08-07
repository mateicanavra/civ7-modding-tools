# Civ7 Capability Realization Topology

**Status:** Selected destination topology
**Date:** 2026-08-06

This comparison expands each plausible architecture far enough to expose its
product owners, execution realms, relationship directions, and compensating
layers. The selection follows the Product, System, Outcome, and Actor/Outcome
models. It does not preserve a branch merely because transition code exists.

## Alternative A: Host-Injected Control

```text
packages/
  civ7-direct-control/
    session/ runtime/ setup/ play/ live/

resources/
  civ7-tuner/providers/local-socket/
  window-capture/providers/macos-.../

services/
  civ7-control/modules/{app,game,map,ui}/
  civ7-play/modules/{attention,city,diplomacy,notifications,
                     progression,planning,turn,unit}/

apps/
  cli/runtime/{providers,control-client,play-client}/
  mapgen-studio/runtime/{providers,control-client,play-client}/
```

Mature operations are assembled as JavaScript on the host and sent through
Tuner for evaluation in App UI.

### Product Card

| Question | Answer |
| --- | --- |
| Actor outcome | Live control and Play remain available through existing host paths |
| Apparent benefit | Least immediate source movement; existing tests are close to the mechanism |
| Actual owner | Ambiguous between package, service, resource, and app |
| Hidden cost | Every operation duplicates Civ7 code as a string, crosses realms without a stable implementation identity, and keeps the mixed package alive |
| Falsifier | A deployable realm-local controller can own mature operations and Tuner can invoke a bounded global ingress |

### Disposition

Rejected. Official UIScript loading makes a realm-local controller a
falsifiable selected direction. Container 1 must still prove actual Tuner
ingress and contract round-trip before mature consumers move. Continuing to
send mature operation bodies is not the destination; raw execution survives
only as an explicit diagnostic escape hatch.

## Alternative B: Layer-Per-Noun Platform

```text
packages/
  civ7-tuner-protocol/
  civ7-api/

resources/
  civ7-live-connector/providers/civ7-tuner/
  desktop-app/providers/civ7-macos/
  catalog/providers/civ7-official-data/

services/
  civ7-control/modules/{session,app,game,map,ui}/
  civ7-live/modules/{readiness,observation,logs}/
  civ7-play/modules/{attention,city,diplomacy,progression,turn,unit}/
  civ7-data/modules/{resources,mods,logs}/
  civ7-mapgen/modules/{recipe,generation,projection,diagnostics}/

plugins/
  server/api/{civ7-live,civ7-data,civ7-play,civ7-hq}/
  async/workflows/{civ7-control,mapgen}/

apps/
  server/civ7-control-plane/
  cli/civ7/
  web/mapgen-studio/
```

Every conceptual layer receives its own container and most are projected over a
network API.

### Product Card

| Question | Answer |
| --- | --- |
| Actor outcome | A broad control plane appears complete on paper |
| Apparent benefit | Symmetric repository tree and many extension points |
| Actual owner | Several services only forward resources or other services |
| Hidden cost | Duplicate lifecycle, reciprocal clients, caller-less APIs, premature workflows, and loss of portable MapGen ownership |
| Falsifier | Each proposed service/API/workflow can name an independent actor, state or policy authority, caller, and lifecycle boundary |

### Disposition

Rejected. Most extra layers are not earned by current actors or behavior. They
increase state space and create new places to hide policy. A future component
may re-enter independently when its falsifier is satisfied.

## Alternative C: Realm-Local Controller Chain

**Selected.**

```text
packages/
  civ7-api/
    src/
      catalog/
      provenance/
      map-script/
      app-ui/{shell,game}/
      tuner/
      engine/
      runtime-inventory/
  civ7-map-policy/
  civ7-adapter/                  # portable contract/static/mock only
  civ7-mod-install/              # pure install planning and receipts
  mapgen-{core,diagnostics,metrics,viz}/
  sdk/
  studio-run-workspace/

resources/
  civ7-tuner/
    contract.ts
    providers/local-socket/{protocol,session,socket}/
  window-capture/                # only while managed scope/release is proven
    contract.ts
    providers/macos-screencapturekit/

services/
  civ7-controller/              # physical spine comes from selected service@1
    instance/ping               # product module/operation; not a literal path
  civ7-play/
    src/{contract,router,client}.ts
    src/modules/{attention,city,diplomacy,government,narrative,
                 notifications,progression,strategy,turn,unit}/
  mapgen-runs/
    src/{contract,router,client}.ts
    src/modules/{operations,adoption,diagnostics,events}/

plugins/
  mod/ui/civ7-controller/
    src/{mod-definition,controller-config,bootstrap,global-ingress}/
  mod/map/swooper-physics/
    src/{mod-definition,domain,recipes,authoring}/
  cli/topics/{data,docs,game,mapgen,mod}/
  server/api/mapgen-studio/
    src/{api,client,service}/

apps/
  civ7-api-materializer/        exact official-evidence acquisition and API projection
  mods/ui/civ7-controller/
    src/{build,deploy}/
    test/live/realm-proof.test.ts
  mods/map/swooper-physics/
    src/{build,deploy}/
    src/runtime/map-script/
  cli/
    src/runtime/{tuner,controller-link,clients,diagnostics}/
  mapgen-studio/
    src/{browser,server}/
    src/runtime/{providers,controller-link,clients,mapgen-adapters}/
```

The topology is intentionally asymmetric. Official API knowledge is static;
Tuner is managed; controller semantics execute in Civ7; Play runs in a host
composition over the public controller client; MapGen remains portable; API
and workflow layers appear only where actors and lifetimes earn them.

### Package Cards

| Container | Authority | Producers | Consumers | Refusal |
| --- | --- | --- | --- | --- |
| `packages/civ7-api` | Generated state-scoped official API declarations and provenance | Exact official source/binary or controlled inventory-capture pipeline | Controller, qualified realizations, adapters, investigators | No handwritten wildcard, current-live claim, or cross-realm omnibus API |
| `packages/civ7-adapter` | Portable MapGen engine contract, static metadata, and mock | MapGen maintainers | MapGen SDK and previews | No concrete Civ7 globals or loader behavior |
| `packages/civ7-mod-install` | Pure path grammar, supplied-tree validation, replacement plan, digest and receipt data | Generic mod tooling | Qualified app adapters | No filesystem discovery or mutation |
| `packages/mapgen-*`, `sdk` | Portable authoring and deterministic execution | MapGen platform | Swooper and other map products | No Civ7 host effects |

### Resource Cards

| Container | Authority | Consumer | Refusal |
| --- | --- | --- | --- |
| `resources/civ7-tuner` | Provider-neutral session contract and foreign-failure vocabulary | Qualified host apps through a selected provider | No concrete epoch/health ownership, Civ7 operation meaning, or actor policy |
| `local-socket` provider | Socket acquisition, framing, state discovery, concrete epoch/health/request-response facts, reset and release | Host apps under the Tuner contract | No semantic retry after indeterminate mutation |
| `resources/window-capture` | Provider-neutral selected-window contract and failure vocabulary | Qualified apps and explicit observation adapters | No Civ7-specific matching or concrete runtime fact ownership |

### Service Cards

| Service | Durable authority | Primary consumers | Non-owner boundary |
| --- | --- | --- | --- |
| Controller | Typed native observation/check/dispatch semantics in current Civ7 realm | Play, MapGen-runs, qualified diagnostics and projections through public client | No Tuner lifecycle, OS effects, actor policy, HTTP or CLI |
| Play | Situation, intent, policy, orchestration, reconciliation, no-repeat and next action | CLI and selected API projections | No raw Tuner, private controller implementation, or provider state |
| MapGen-runs | Request-correlated run intent, phases, adoption, cancellation, retention and terminal reconciliation | Studio API | No portable config ownership, filesystem mechanics, or controller semantics |

### Plugin Cards

| Plugin | Authority | Realized by | Refusal |
| --- | --- | --- | --- |
| Controller mod definition | Portable identity, shell/game UIScript registrations, realm-local bootstrap, versioned global ingress and controller compatibility declaration | Controller mod app | No host transport, build/install effect or live proof |
| Swooper definition | Product domains, recipe, config and authored evidence | Swooper mod app and previews | No installation or concrete engine globals |
| CLI topics | Commands, flags, help and presentation | CLI app | No provider acquisition or semantic implementation |
| Studio API | Caller contract, transport/auth policy and response projection | Studio app | No run state or private service routers |

### App Cards

| App | Authority | Runtime composition | Refusal |
| --- | --- | --- | --- |
| Civ7 API materializer | Installed-root selection, exact staged evidence snapshot, provenance receipt, deterministic API projection and replacement | Identified Civ7 installation + pinned resource submodule + generated API destination | No public API authority, handwritten declarations, CLI presentation or reusable support owner without a second consumer |
| Controller mod app | Bundle, file plan, install and live realm proof | Controller service + mod definition | No controller semantics, ingress authorship or Play policy |
| Swooper mod app | Civ7 map-script realization, bundle, install and live proof | Swooper definition + MapGen + realization-local adapter | No portable product ownership |
| CLI app | oclif process, topic registration, provider selection, client binding, disposal | Tuner provider + controller/Play clients + diagnostic adapter | No command implementation in app root |
| Studio app | Browser/server host, provider selection, controller/Play/run binding, API mount and disposal | Public clients + qualified map/run adapters | No hidden shared runtime or duplicate semantic service |

## Runtime Flows

### Controller Construction

```text
official source revision
  -> generated civ7-api
  -> controller TypeScript service
  -> controller mod definition
  -> controller mod app bundle/install
  -> Civ7 shell/game loader
  -> versioned global ingress
```

### Host Invocation

```text
host app
  -> acquire Tuner
  -> discover App UI
  -> verify realm + controller boot
  -> bind controller client to narrow transport
  -> invoke typed procedure envelope
  -> prove ingress and actual controller contract round-trip
  -> select direct result or later correlated observation from live evidence
```

### Play

```text
actor -> CLI/API -> Play client -> Play service -> controller client
  -> native evidence -> Play reconciliation -> actor result
```

### Raw Diagnostic

```text
qualified operator -> explicit diagnostic command -> app raw-exec adapter
  -> Tuner resource -> exact raw response
```

This path is not imported by the other three flows.

## Relationship Proof

Public service dependencies are one-way:

```text
civ7-play   -> civ7-controller
mapgen-runs -> civ7-controller
```

Apps construct both clients and providers but own no service semantics. The
controller mod app realizes the controller router; it does not create a second
controller contract. The host link transports that same contract; it is not a
facade.

## Conditional Extensions

| Candidate | Exact admission evidence |
| --- | --- |
| Standalone Play API | A browser or network agent needs a caller contract distinct from Studio and CLI |
| Aggregate Civ7 HQ API | One concrete operator client needs a curated cross-service control-plane surface |
| Durable MapGen workflow | A run must survive request/process loss with stable intent, idempotency and reconciliation |
| Desktop-application resource | Process/window control has a reusable managed acquire/use/release lifetime |
| Generic catalog resource | Multiple qualified consumers need managed roots and generic catalog operations |
| Tuner protocol package | A second independently released consumer needs pure framing outside the provider |

## Mandatory Deletions

- `packages/civ7-direct-control`;
- `Civ7ControlOrpcDirectControlFacade` and all facade-derived types;
- host-generated mature operation bodies;
- direct provider acquisition in services or ordinary commands;
- duplicated Studio live observations where an owner-issued fact exists;
- false plugin packages that own support or mutation logic;
- stale docs, tests, skills, and Habitat rules that teach the rejected host
  control model;
- any alternate mature controller path retained as compatibility.

## Selection Rationale

Alternative C is the only topology in which each product authority has one
execution environment and each cross-environment edge is explicit. It adds the
controller mod because the product requires a durable in-engine implementation,
while deleting more host machinery than it adds. It preserves raw Tuner access
without allowing that escape hatch to shape the mature system. The selection is
conditional on the Container 1 ping/identity experiment; failure reopens the
transport and realm model before any mature consumer migrates.

## Falsifiers

The selection reopens if the controller realm experiment fails, the bounded
transport must resend implementation bodies, the owner graph requires a
service cycle, or a selected component cannot state a unique actor outcome,
semantic authority, caller, or lifecycle.
