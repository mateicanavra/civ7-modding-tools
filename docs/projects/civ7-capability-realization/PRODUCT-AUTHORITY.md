# Civ7 Product Authority

**Status:** Normative destination authority
**Date:** 2026-08-06
**Owner:** Civ7 product stewardship
**Baseline evidence:** `fd60a16ad7605ad34c8afa9668aa847b52931022`

This model names the durable capabilities of the Civ7 modding platform before
choosing their repository containers. It replaces the transitional model that
treated host-injected JavaScript as mature control and collapsed foundational
control with actor-facing play.

Current code is behavior evidence. Deleted controller experiments are not
evidence. Later migration shapes are not authority merely because they already
exist on the working stack.

## Operational Goal

Give modders, map authors, operators, players, and agents one coherent platform
for understanding Civ7, authoring and realizing mods, operating a live Civ7
session, and pursuing gameplay outcomes. Every result must identify the owner
that produced it and the exact proof it carries.

## Product Laws

1. **Outcome precedes container.** An actor outcome and its authority are named
   before a package, resource, service, plugin, app, or module is selected.
2. **One fact has one writer.** A projection may compose owners but never
   acquire their policy, state, or write authority.
3. **Official truth is generated.** Static Civ7 API knowledge is extracted
   from an identified official corpus and emitted with provenance. Handwritten
   ambient guesses and wildcard declarations are not authority.
4. **Controller differs from access.** The controller owns typed native Civ7
   operations inside the Civ7 realm. Tuner and other host capabilities own only
   access, lifecycle, and foreign failures.
5. **Control differs from play.** The controller performs mechanical native
   operations. Play owns actor intent, decision policy, orchestration,
   reconciliation, no-repeat behavior, and next-action meaning.
6. **Definition differs from realization.** Portable authored truth is not a
   generated artifact, installed tree, loaded mod, running controller, or
   observed product outcome.
7. **Raw execution is an escape hatch.** Arbitrary JavaScript over Tuner is a
   qualified diagnostic and prototyping surface. It is never the implementation
   mechanism for a mature controller or Play operation.
8. **Status axes remain independent.** Generated, installed, loaded,
   controller-ready, dispatched, accepted, observed, and behavior-confirmed are
   separate facts.
9. **Channels preserve meaning.** CLI, HTTP, browser, SDK, and mod-loader
   projections do not create new semantic owners.
10. **No owner is invented for relocation.** A forwarding facade, convenience
    aggregate, or legacy import does not earn a destination.

## Durable Vocabulary

| Term | Meaning |
| --- | --- |
| Official Civ7 knowledge | Facts extracted from an identified official source, binary, or controlled API-inventory capture and emitted as static authority with provenance |
| Controller | The TypeScript service that runs inside a Civ7 App UI realm and owns closed native operations |
| Controller instance | One versioned controller installation in one shell or game document, identified by realm and boot identity |
| Live access | Host-side acquisition and use of foreign Civ7 capabilities such as Tuner, process state, or window evidence |
| Play | Actor-facing observation, intent, policy, action, reconciliation, and next-action capability over the public controller client |
| Raw diagnostic | Explicit low-level inspection or JavaScript execution that makes no controller or gameplay-success claim |
| Mod definition | Portable authored content and stable product identity |
| Mod realization | Rendering, bundling, installation, loader admission, and live proof for one target environment |
| Map truth | Deterministic MapGen artifacts and evidence produced outside Civ7 |
| Engine observation | Time-, realm-, and instance-correlated evidence read from running Civ7 |
| Reconciliation | An explicit outcome used when dispatch or later observation cannot prove acceptance or final effect |

## Capability Registry

| Capability | Product status | Durable authority | Current disposition |
| --- | --- | --- | --- |
| Official Civ7 knowledge | Authorized | Generated Civ7 API and policy owners | Preserve extraction; complete and consolidate generated authority |
| Generic mod authoring | Authorized | Civ7 SDK and each portable mod definition | Preserve |
| Mod realization | Authorized | Each qualified mod application | Repair incomplete loader and live proof |
| Swooper map definition and generation | Authorized | Swooper definition plus reusable MapGen SDK | Preserve and finish boundary cleanup |
| Civ7 controller | Authorized | In-engine controller service | Reconstruct from mature native behavior |
| Live controller access | Authorized supporting capability | Host resource/provider plus app binding | Repair from the mixed direct-control estate |
| Civ7 Play | Authorized | Play service | Reconstruct from actor-facing behavior |
| Raw Tuner diagnostics | Authorized supporting surface | Qualified app adapter and diagnostic projection | Narrow and protect |
| Map configuration and run operations | Authorized | Definition config authority, MapGen-runs, and qualified app adapters | Extract from Studio hybrid |
| Product projections | Authorized | CLI, API, web, and mod projection owners | Preserve caller contracts; remove semantic ownership |

## Capability Cards

### Official Civ7 Knowledge

- **Actor outcome:** an investigator or generator can state which Civ7 APIs,
  identifiers, schemas, resources, and runtime realms exist in one identified
  official revision.
- **Authority:** the extraction and publication chain owns source or controlled
  inventory-capture identity; generated API and policy packages own their
  static public derived contracts.
- **Boundary:** no service, Studio view, MapGen adapter, or generated mod output
  may become official API authority.
- **Correction:** replace the partial handwritten `civ7-types` surface with one
  systematic, provenance-bearing, state-scoped API authority. Do not publish an
  omnibus root that pretends every global exists in every realm.
- **Honest outcome:** exact source/capture identity, extraction receipt,
  generated digest, provenance tier, and currentness proof. A controlled
  runtime inventory can prove that a member was observable during that capture;
  it does not prove current availability or product behavior.

### Generic Mod Authoring And Realization

- **Actor outcome:** a mod author can express a complete portable mod, while a
  release operator can materialize and install one exact build.
- **Definition authority:** the Civ7 SDK and the product-specific definition.
- **Realization authority:** the matching mod app, which owns target binding,
  bundle generation, installation, loader proof, and live proof.
- **Boundary:** SDKs and definitions perform no host installation; generated
  trees own no behavior; CLI commands project rather than own deployment.
- **Honest outcome:** admitted definition, deterministic rendered plan, exact
  artifact, installation receipt, then separate loader and live results.

### Swooper Map Definition And Generation

- **Actor outcome:** a map author can author, execute, inspect, compare, and
  explain deterministic Swooper maps outside Civ7, then realize the selected
  map product in Civ7.
- **Authority:** Swooper owns its domains, recipe, configuration, diagnostics,
  metrics, trace, visualization, and mod identity. MapGen packages own only the
  reusable language and algorithms. The Swooper app owns Civ7 realization.
- **Boundary:** browser preview is not live proof; engine readback is not map
  truth; concrete Civ7 globals do not live in a reusable adapter package.

### Civ7 Controller

- **Actor outcome:** another trusted capability can inspect or operate one
  current Civ7 realm through typed, closed, native operations without knowing
  Tuner framing or injecting an implementation body.
- **Authority:** one TypeScript service compiled into a controller mod and
  instantiated independently in the shell and game App UI documents.
- **Scope:** mechanical readiness, observation, checks, and native operations.
  Outer modules follow official Civ7 runtime domains; narrower nouns such as
  city, diplomacy, progression, or unit remain nested beneath gameplay rather
  than becoming peer platform domains.
- **Boundary:** no actor strategy, no-repeat policy, arbitrary JavaScript,
  socket lifecycle, OS process control, window capture, CLI formatting, or HTTP
  projection.
- **Honest outcome:** the bootstrap-issued realm/controller identity exposed by
  the contract, operation admission, native dispatch evidence, exact immediate
  evidence when available, and an explicit native refusal or failure. Host
  availability, delivery, and staleness remain access facts.

### Live Controller Access

- **System outcome:** an admitted Play, run, or operator scene receives a
  callable current controller without learning Tuner or provider mechanics and
  survives shell/game document replacement without replaying a mutation.
- **Authority:** the Tuner resource owns only the provider-neutral lifecycle
  contract and failure vocabulary; the local-socket provider emits concrete
  acquisition, framing, state-discovery, epoch, request/response, health, and
  release facts; the host app selects and scopes the provider and binds its
  ready value to the controller's public client.
- **Boundary:** the access path transports a typed envelope only. It does not
  contain or regenerate the operation implementation.
- **Honest outcome:** provider-issued epoch, selected runtime state, controller
  version/realm/boot identity, request correlation, transport result, and
  release outcome.

### Civ7 Play

- **Actor outcome:** a human or agent can understand the current playable
  situation, choose a lawful goal, perform an action, reconcile its result, and
  determine the next safe action without unsafe repetition.
- **Authority:** the Play service, consuming only the public controller client.
- **Scope:** actor-oriented modules may use gameplay language such as city,
  diplomacy, progression, planning, turn, or unit because those nouns are
  subordinate to the Play authority.
- **Boundary:** Play receives no Tuner session, provider state, raw JavaScript,
  private controller router, or facade-shaped mirror.
- **Honest outcome:** situation, check, intent admission, request, dispatch,
  later observation, refusal, uncertainty, no-repeat, and next action remain
  distinct.

### Raw Tuner Diagnostics

- **Actor outcome:** a qualified developer can inspect Tuner state or execute
  deliberate JavaScript while prototyping or diagnosing a missing capability.
- **Authority:** a narrow app-owned adapter over the ready Tuner resource,
  exposed only through an explicit diagnostic projection.
- **Boundary:** it is not imported by controller, Play, MapGen-runs, or ordinary
  product commands. Mature operations graduate into owned controller
  TypeScript and leave no duplicate host-injected implementation.
- **Honest outcome:** qualification refusal; exact submitted source, target
  state, epoch, raw response and audit identity on success; `not-dispatched`
  when transport proves no possible execution; or `indeterminate` after
  possible execution. Raw commands never retry automatically. Nothing more.

### Map Configuration And Run Operations

- **Actor outcome:** a map author can edit and durably save canonical config,
  then start, observe, adopt, cancel, or diagnose one correlated realization
  operation.
- **Authority:** the definition owns config admission and serialization;
  qualified Studio app adapters own source writes, per-request materialization,
  installation under the reserved ephemeral run-mod identity, process and log
  effects; MapGen-runs owns accepted intent, ordering, state, correlation,
  retention, cancellation, and terminal reconciliation. Product realization
  apps separately own stable release installation under their own mod identity.
- **Boundary:** Studio API and web are projections. A run is service-owned state,
  not a managed resource. Generated and installed evidence do not prove Civ7
  startup or map behavior.

## Public Surfaces

The CLI app, CLI topic plugins, MapGen Studio API, Studio web app, docs, and mod
entrypoints are product surfaces. They may compose public clients and translate
results for a caller. They do not acquire service write authority or import
private routers.

A standalone network Play API, an aggregate Civ7 HQ API, durable workflows,
desktop-application resource, or generic catalog resource is admitted only by a
concrete caller or lifecycle requirement. Topology symmetry is not evidence.

## Explicit Exterior

- No `packages/civ7-direct-control`, facade, compatibility mirror, or second
  mature control path.
- No deleted controller experiment as design or implementation authority.
- No host-generated mature operation body.
- No arbitrary JavaScript in controller or Play contracts.
- No gameplay policy in the controller, resource, provider, API, or app.
- No controller semantics in Tuner or window-capture resources.
- No direct service exposure over HTTP; API plugins own caller projections.
- No resource merely because a helper is reusable; a resource must own a real
  acquire/use/release lifetime.

## Falsifiers

Reopen this model only if exact evidence proves one of the following:

1. A controller mod cannot load a versioned callable surface into the required
   Civ7 shell and game realms.
2. A bounded host transport cannot invoke that surface without resending the
   operation implementation as arbitrary JavaScript.
3. A mature controller operation inherently requires Node or OS authority and
   cannot be split into a native operation plus an explicit host capability.
4. Play and controller genuinely own the same intent, policy, and outcome
   rather than only sharing native prerequisites.
5. A proposed resource has no foreign acquire/use/release lifecycle.
6. A proposed service has no independent semantic fact, transition, or policy
   authority.

## Transition Test

The model is ready to drive structure when every baseline behavior has exactly
one `preserve`, `correct`, or `retire` disposition; every cross-owner edge has
one direction; no service cycle exists; and the official realm experiment has
an explicit proof plan. Until then, source remains evidence rather than
destination authority.
