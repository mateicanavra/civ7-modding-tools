# Civ7 Modding Foundry Architecture

Status: `draft-normative-reference`
Owner: Habitat architecture/product stewardship
Scope: Proposed target product and technical architecture for Civ7 Modding Tools,
to be ratcheted through Habitat authority work

This document captures the proposed target architecture frame for Civ7 Modding
Tools. It is intentionally written as a normative draft: it describes the shape
the system should move toward, while not yet replacing the current canonical
system architecture docs or active MapGen normalization packet.

This document lives in the Habitat authority tree because Habitat is the
mechanism expected to ratchet this target architecture into the repo through
bounded authority slices, proof gates, guardrails, and overwatch.

The current organization of the repo mixes many concerns. This draft treats
current packages, apps, mods, and plugin folders as implementation evidence, not
as architecture authority.

## Product Vision

Civ7 Modding Tools should become a closed-loop modding foundry: semantic
modding capabilities are authored once, projected into CLI, Studio, agent,
runtime, and game surfaces, realized through explicit runtime plans, observed
through evidence, and shipped as verified Civ7 artifacts.

The north star:

> A modder should be able to describe a world, generate it deterministically,
> inspect why it became that shape, project it into Civ7, verify what the engine
> accepted, and iterate from evidence instead of superstition.

This is more than "a TypeScript SDK that emits XML." It is more than "a
procedural map mod." The deeper product is a trustworthy authoring,
simulation, projection, and verification loop for changing Civilization VII
with code.

The product should be a modding foundry with first-class realization.

Swooper Maps remains the flagship capability, but it should stop being
architecturally special. It is the first major product built on the foundry.
The foundry should support:

```text
semantic capability authoring
  MapGen, mod metadata, resource graphing, game control, Studio workflows

surface projection
  CLI commands, Studio UI/API, agent tools, runtime bridges

SDK derivation
  authored selections -> normalized capability, binding, surface, and artifact plans

runtime realization
  SDK-derived plan + app-owned profile/provider choices
    -> compiler plan/validation -> bootgraph lifecycle ordering
    -> Effect-scoped provider acquisition -> process-runtime live bindings
    -> adapter lowering and harness handoff/mounting -> startup/readiness
    -> execution/diagnostics -> shutdown -> Effect release
    -> bootgraph-ordered finalization

observation
  traces, generated artifacts, runtime readback, in-game evidence, diagnostics
```

Swooper Maps should become the flagship: beautiful, large-scale, physically
credible world generation with controllable identity. A user should feel like
they are shaping a planet, not twiddling random map scripts. Continents,
shelves, climate, rivers, lakes, biomes, resources, starts, discoveries, and
narrative overlays should all be legible products of a pipeline.

MapGen Studio should become the workbench for that pipeline: not a dashboard
bolted on after the fact, but the place where authors see the state-space. It
should show terrain truth, climate truth, ecology truth, placement intent,
projection results, and engine drift as separate layers. The user should be
able to ask: "why did this tile become this?" and get a traceable answer.

MapGen Studio becomes less "an app that knows MapGen internals" and more a
projection workbench. It selects and visualizes capabilities. It should not own
generation truth. It should consume service contracts, plan artifacts, traces,
and catalog records.

The SDK and CLI should remain boring in the best way: stable, typed,
predictable. They are public surfaces, not a dumping ground for capability
truth. They should help modders do real work without absorbing MapGen's
internal complexity. The CLI should orchestrate workflows as a projection
surface; SDK surfaces should author mods and derive plans; generated artifacts
should prove generation happened without becoming source authority.

The longer horizon is an intelligence layer: agents and tools that can play,
inspect, probe, and revise. Direct control, control APIs, the intelligence
bridge, Habitat, Studio, and MapGen all point at a closed loop where the repo
can not only generate a mod, but observe it in the game and reason about what
happened.

## Architectural Correction

The core correction:

```text
current package != owner
current app != product truth
current plugin package != plugin
current mod workspace != necessarily app
runtime transport != semantic capability
```

The right architectural question is not "which package currently contains
this?" The right question is:

```text
what owns truth?
what projects truth?
what selects projections?
what declares runtime capabilities?
what implements those capabilities?
what realizes selected runtime plans?
what observes the realized system?
```

The strongest practical rule:

```text
Services own Civ7 modding truth.
Plugins project that truth into surfaces.
Apps select projections, author runtime profiles, and supply provider choices.
Resources own host/game/workspace capability contracts and provider selectors.
Providers implement resource contracts without owning selection semantics.
The SDK derives plans without acquiring runtime resources.
Runtime realization starts by compiling the derived plan, then validates choices,
with distinct owners: the compiler plans and validates, bootgraph orders the
lifecycle and finalization, the Effect kernel scopes provider acquisition and
release, and the process runtime creates live bindings and coordinates adapter
and harness work.
Generated mods are artifacts, not authority.
```

## Target Roots

The repo should move toward five canonical roots, even if migration happens
gradually. Four are durable semantic/foundry roots: `packages/`, `services/`,
`plugins/`, and `apps/`. `resources/` is the separate runtime-realization
authoring root: it owns resource contracts and provider selectors, but not
business-capability truth.

```text
packages/
  platform and support matter
  public SDKs, pure libraries, reusable adapters, harness support, and
  packages/core/runtime compiler, bootgraph, Effect substrate, and process
  runtime machinery

resources/
  provisionable capability contracts and provider selectors
  Civ7 client control, filesystem, official resource corpus, mod output,
  telemetry, cache, and game runtime access

services/
  semantic capability truth
  map generation, mod authoring, official resource indexing, mod packaging,
  game control orchestration, interactive authoring session state

plugins/
  role/surface projections
  cli commands, server APIs, async workflows, agent tools, web projections,
  desktop/background surfaces

apps/
  product/runtime identities and final composition
  studio, cli, dev foundry, intelligence bridge, shipped mod build identities
  where appropriate; app-owned runtime profiles and provider choices
```

This is a semantic-authority layout, not a deployment layout, package-manager
layout, or current-file-tree preservation exercise.

`resources/` is one of the five canonical roots and the separate
runtime-realization authoring root, not one of the four durable
semantic/foundry roots. It must not be folded into `packages/`. A resource owns
its provisionable capability contract and the selector that defines legal
provider choices, but never business-capability truth. Apps supply choices
through those selectors; providers implement the selected contracts. Resource
definitions and provider modules do not own runtime lifecycle orchestration.
Within `packages/core/runtime`, the compiler plans and validates, bootgraph
orders lifecycle and finalization, the Effect kernel scopes acquisition and
release, and the process runtime creates live bindings and coordinates adapters
and harnesses.

A package does not gain semantic ownership merely because it implements a
service, plugin, app, or resource contract.

## Blueprint-Kind Ontology

Canonical roots, durable semantic/foundry roots, and Habitat blueprint kinds
are different axes. Canonical roots answer where platform support, resource
contracts and selectors, semantic truth, projections, and app composition live.
The four durable semantic/foundry roots are `packages`, `services`, `plugins`,
and `apps`; `resources` is the separate runtime-realization authoring root, not
a business-capability owner. Blueprint kinds answer what can be constructed and
governed. In particular, `api` remains a valid multi-root blueprint kind even
though there is no top-level `apis/` root.
`worker` and `host` remain candidate terms and design gaps unless Habitat admits
each kind separately; they do not imply `workers/` or `hosts/` roots.

| Blueprint kind | State shape | Semantic owner | Legal source location | Dependency direction | Constructibility and multiplicity | Not yet an admitted kind when |
| --- | --- | --- | --- | --- | --- | --- |
| `service` | Semantic state, invariants, operations, and dependency contracts; a service may be stateless but still owns meaning. | The named Civ7 capability domain. | `services/<service>/`; reusable implementation support may live in `packages/`. | Service truth may depend on other public service contracts, resource contracts, and pure support packages; it must not depend on API transports, async projections, native-host/harness wiring, or app composition. | The definition must be constructible. Runtime binding multiplicity is explicit; singleton behavior is never inferred from the kind. | It is only a package, module, or candidate folder without stable identity/version, instance anchor, canonical shape, construction path, dependency law, validation, migration posture, and positive current-tree proof. |
| `api` | A reusable multi-root construction grammar joining transport-neutral service-owned operation/schema state to protocol projections, lowering, and handler bindings; it owns no independent domain truth. | The service owns operation semantics; API projections own protocol and compatibility semantics; the blueprint owns the cross-root construction law. | A named API instance may join a service-owned contract under `services/<service>/` with one or more projections under `plugins/`. There is no `apis/` root. | API projections depend inward on the service public contract and declared resources; service truth never depends on API transport or app wiring. | One API kind may govern many named instances. Each instance declares its contract/projection facts, and an app explicitly selects the instances and projections it realizes. | It is only a schema, route list, handler collection, or app mount choice without stable kind law, a named instance, protocol boundaries, construction/mount paths, compatibility policy, and proof across every participating root. |

For API specifically, keep the ontology layers distinct:

- the `api` blueprint kind is reusable construction and governance law;
- an API instance is a named set of blueprint-defined facts spanning its
  service contract and plugin projections;
- a projection is a concrete protocol, handler, or compatibility surface of an
  instance, not another kind; and
- app composition selects API instances and projections and binds their
  app-owned profile/provider choices for realization.

`worker` must not replace RAWR's native workflow, schedule, and consumer
constructs. Those remain explicit async projection surfaces with their existing
workflows, schedules, and consumers. A broader `worker` kind needs separate
admission proof that it adds stable construction law rather than renaming those
surfaces. Likewise, the native process, web, or game host remains behind a
harness boundary. Apps own final composition, while harnesses adapt to native
hosts; a `host` blueprint kind requires separate admission and must not be
inferred from an app's current topology.

A candidate becomes admitted blueprint-kind authority only through Habitat's
constructive-definition contract: stable identity and version, instance-anchor
grammar, canonical shape, construction and migration paths, validation and
repair policy, capability policy, fixtures, positive current-tree proof, and an
accepted authority packet. Until then it belongs in niche-local `_blueprints/`
candidate inventory. In particular, naming something `worker` or `host` admits
neither a kind nor an instance. Concrete service and API instances still require
their blueprint-defined `habitat.toml` facts.

## Layer Shape

The better Civ7 platform chain is:

```text
define
  packages, resources, services, plugins, apps

declare
  resources own capability contracts and provider selectors

implement
  providers implement resource contracts

select
  app composition, runtime profile, provider choices, process roles,
  map/mod variant

derive
  SDK normalizes the capability graph, recipe plan, service bindings,
  surface plans, and artifact plan without acquiring resources

realize
  runtime compiler compiles and validates the SDK-derived plan without acquiring
  resources or binding live services
  bootgraph determines dependency, rollback, and finalization order
  Effect kernel acquires and releases provider values in managed scopes
  process runtime creates live bindings; coordinates adapter lowering, harness
  handoff/mounting, startup, diagnostics, and shutdown

observe
  traces, diagnostics, runtime catalog, generated files, engine readback,
  in-game evidence
```

This repo's platform chain should be:

```text
bind -> project -> compose -> derive
  -> realize [compile -> validate -> acquire -> bind -> lower
       -> harness handoff/mount -> start/ready -> execute/diagnose
       -> stop -> release/finalize]
  -> observe
```

Capabilities should be bound to declared resources and dependencies, projected
into surfaces, and composed into product/runtime identities. The SDK derives
plans. Runtime realization is the whole operational bridge: its compiler
performs pure planning and validation; bootgraph orders lifecycle and
finalization; the Effect kernel manages scoped acquisition and release; and the
process runtime creates live bindings and coordinates adapter lowering and
harness handoff. Generated artifacts may be produced during realization, but
they remain evidence rather than authority.

## Runtime Realization

Runtime realization is the full bridge from app-owned composition and provider
choices plus an SDK-derived plan to a mounted, observable, and stoppable
execution or completed artifact flow. Its first phase is compilation. The full
lifecycle is compilation, selection validation, provider acquisition, scoped
binding, adapter lowering, harness handoff and native mounting, startup and
readiness, execution and diagnostics, shutdown, binding release, and
dependency-ordered finalization. It coordinates those phases without
transferring their semantic ownership or creating a second public architecture.

The lifecycle:

```text
definition -> app selection -> SDK derivation
  -> runtime realization {
       compile -> validate -> acquire -> bind -> lower
       -> harness handoff/mount -> start -> ready -> execute/diagnose
       -> stop/shutdown -> release -> finalize
     }
  -> external observation
```

For Civ7 Modding Tools, runtime realization means keeping resources cold until
an app selects them, compiling before any provider is acquired, recording
scoped bindings, lowering plans and bindings to Civ7, oRPC, async, filesystem,
or process-native forms, and handing lowered entrypoints to the harness that
owns native attachment. The bridge remains open through startup, readiness,
execution, diagnostics, shutdown, release, and finalization.

The ownership boundaries are strict:

| Component or phase | Owns inside the realization bridge | Must not own |
| --- | --- | --- |
| App composition | Runtime profiles, provider choice values, selected projections, and process roles supplied to the bridge. | Resource selector semantics, provider acquisition, adapter mechanics, or native host lifecycle. |
| SDK derivation | Pure normalization and plan derivation from authored foundry roots and app selections before the bridge executes. | Provider acquisition, process lifecycle, host globals, or transport calls. |
| Runtime compiler (`packages/core/runtime/compiler`) | Pure compilation and validation of the selected app, profile, provider, service-binding, surface, and execution plans; emits `BootgraphInput` and diagnostics. | Resource acquisition or release, live service binding, lifecycle ordering, adapter or harness coordination, and host interaction. |
| Bootgraph (`packages/core/runtime/bootgraph`) | Stable lifecycle identity, dependency ordering, rollback order, and reverse finalization order for compiled provider modules. | Compilation or selection validation, scoped resource acquisition or release, live service binding, adapter lowering, or harness coordination. |
| Effect provisioning/execution kernel (`packages/core/runtime/substrate/effect`) | One managed process runtime plus scoped acquisition and release of provider values, with local execution and finalization mechanics inside bootgraph's order. | App selection, compiler planning or validation, lifecycle or finalizer ordering, live service binding, adapter lowering, or harness coordination. |
| Process runtime (`packages/core/runtime/process-runtime`) | Live service bindings, runtime access and execution-registry assembly, adapter lowering coordination, and harness handoff, mounting, startup, diagnostics, and shutdown coordination. | Compilation or selection validation, resource acquisition or release, lifecycle ordering, or finalizer ordering. |
| Resource contract and selector | Capability contract and legal provider-selection grammar supplied to app composition and compilation. | Provider implementation, app-owned choice values, acquisition, scope lifecycle, or finalizer ordering. |
| Provider implementation | Cold implementation plan for one resource contract, including acquisition and release effects run by the Effect kernel in bootgraph order. | Resource contract ownership, provider-selection semantics, app profile ownership, or lifecycle orchestration. |
| Adapter lowering | Translation from typed service/surface/artifact plans and realized bindings into target-native representations. | Resource lifecycle, app selection, process ownership, or semantic truth. |
| Harness/native host boundary | Entrypoint handoff, native attachment, startup/readiness, invocation, host-bound diagnostics, and native shutdown mechanics. | Plan derivation, provider policy, service invariants, or target-independent projection policy. |

This should apply to:

- app-selected interactive processes;
- CLI command execution;
- game-control sessions;
- mod build and deploy flows;
- MapGen generation/projection runs;
- agent tools;
- async build/verify/playtest workflows;
- generated mod artifact production.

The point is not to sprinkle runtime substrate code everywhere. The point is to
make execution explicit without corrupting semantic ownership.

## MapGen As Pilot Service

For MapGen specifically:

```text
MapGen service truth
  owns recipes, stages, steps, domains, artifacts, generation invariants

MapGen projection plugins
  CLI generate/inspect
  Studio visualization
  agent explain/triage
  game runtime projection
  async build/verify workflows

Civ7 runtime resources
  official corpus, game runtime access, tuner/direct-control, mod output,
  and trace-store contracts and provider selectors

Civ7 runtime providers
  implementations of the app-selected resource contracts

Swooper Maps app/product identity
  selects standard recipe
  owns runtime profile and supplies provider choices through resource selectors
  selects game-facing projection
  emits generated mod artifacts
```

This is cleaner than the current "core package plus mod package plus Studio
packages plus control packages" arrangement.

`@swooper/mapgen-core` is current implementation evidence. The target keeps the
preserved law that pure algorithms remain host-independent and that MapGen
semantic truth owns recipe contracts, generation plans, artifacts, invariants,
and truth/projection policy. The exact package-to-service decomposition is the
named `FG-001` design gap below rather than an implied move.

The core invariant still holds: truth and projection are separate. MapGen
produces truth artifacts. The adapter projects them into Civ7. The engine may
accept, reject, mutate, or hide details. The system records that honestly. It
does not pretend TypeScript tests prove runtime behavior, and it does not let
generated artifacts become source authority.

## Current Concern Reclassification

Current packages and apps should be reclassified by authority, not preserved as
architecture.

`@civ7/adapter`, `@civ7/direct-control`, and `@civ7/control-orpc` contain
evidence for distinct resource/provider, service, API, adapter, and harness
responsibilities. Game control is not simply a package. Tuner socket access is
a provisionable runtime capability. Game-control orchestration is semantic
capability. oRPC is a projection/transport boundary. Their exact target split
is `FG-002`, not a compatibility decomposition to invent while moving files.

`packages/plugins/*` is a misleading current name. Those packages are
unclassified implementation evidence: each must be assigned to support matter,
service-owned implementation, or a projection plugin through `FG-005` before
it moves. An actual plugin is a role/surface/capability projection, such as:

```text
plugins/cli/commands/resource-refresh
plugins/cli/commands/mod-build
plugins/server/api/session-control
plugins/server/internal/game-control
plugins/agent/tools/inspect-mapgen-trace
plugins/web/views/map-inspection
plugins/async/workflows/build-and-verify-mod
plugins/async/schedules/nightly-resource-refresh
plugins/async/consumers/game-observation
```

MapGen Studio has an app-selection concern, but its target service, API,
projection, profile, and harness composition are not yet decided. Current
containers are evidence for `FG-003`; this draft does not encode them as target
topology or predetermine whether a component survives, splits, moves, or is
deleted.

`mods/*` needs care. A mod is partly source product, partly generated artifact,
partly game-facing runtime projection. Do not blindly move mods under `apps`.
Classify each one:

```text
Swooper Maps source recipe/content
  unresolved product-content ownership; see FG-004

generated mod/
  artifact only

game entry scripts
  harness/projection into Civ7 native host

Dacia mod
  unresolved product-content ownership; see FG-004

intelligence bridge mod
  runtime bridge/harness surface, not semantic truth
```

### Named Design Gaps

These gaps remain inside the foundry migration container. They are not license
for fallback ownership or dual-path compatibility.

| Gap | Decision owner | Integration hook | Latest acceptable lock point |
| --- | --- | --- | --- |
| `FG-001 MapGen service boundary` | MapGen product authority with Habitat architecture stewardship. | Ownership map joining `@swooper/mapgen-core`, the active MapGen normalization packet, and the first `service` blueprint candidate. | Before the first OpenSpec implementation slice admits or relocates a MapGen service instance. |
| `FG-002 Civ7 control lowering and native-host boundary` | Civ7 platform architecture owner with Direct Control and adapter maintainers. | Responsibility map across `@civ7/adapter`, `@civ7/direct-control`, `@civ7/control-orpc`, resource providers, API projections, adapters, and harness entrypoints. | Before any of those packages is split or any control API instance is admitted. |
| `FG-003 Studio decomposition` | MapGen Studio product owner with MapGen and Habitat architecture stewardship. | A current-contract and consumer inventory that treats existing containers only as evidence and leaves service, API, projection, profile, and harness boundaries open. | Before Studio source relocation, public-contract replacement, or admission of a Studio service or API instance. |
| `FG-004 Mod source-product identity` | Each mod's product owner with Civ7 mod-SDK architecture stewardship. | Per-mod source/artifact/harness inventory rooted at `mods/<mod>`, linked to generated-output boundaries and app-selection candidates. | Before moving mod source from `mods/` or admitting Swooper Maps or Dacia as app instances. |
| `FG-005 Current plugin-package classification` | Habitat architecture stewardship with each package's current maintainer and semantic consumer. | Per-package ownership map for `packages/plugins/*`, including public consumers, state/invariant owner, and projected surface. | Before renaming, relocating, or admitting any current plugin package as a target plugin instance. |
| `FG-006 Worker and host kind admission` | Habitat architecture stewardship with RAWR workflow and runtime-harness owners. | Candidate comparison against existing RAWR workflows, schedules, and consumers plus the native-host-behind-harness boundary. | Before a `worker` or `host` candidate leaves `_blueprints/`, claims admitted-kind authority, or drives source relocation. |

## Orientation, Authority, And Proof

The next maturity step is making the repo's implicit intelligence executable.
For any path or diff, the system should answer:

```text
Where am I?
What domain owns this?
What public contract might I affect?
What altitude is this decision?
What proof is sufficient?
What drift should be watched after merge?
```

That suggests an operational loop:

```text
For any path/diff:
  orient: where am I?
  classify: what kind of thing is this?
  authorize: whose purview owns the decision?
  assess: what leverage/scale/altitude does it have?
  verify: what proof closes the loop?
  overwatch: what drift should be watched afterward?
```

Habitat classify should become the spine of this future. It should evolve from
project classifier toward authority router. It should triangulate from path,
nearest `AGENTS.md`, Nx metadata, package tags, docs, public exports,
generated-output rules, and tests. The result should be a small operational
map: owners, forbidden owners, named cascades, and verification gates.

The product/technical platform wants:

```text
orientation layer + authority layer + proof layer
```

Or, in foundry terms:

```text
semantic truth -> projection -> composition -> derivation
  -> realization [compile -> validate -> acquire -> bind -> lower
       -> harness handoff/mount -> start/ready -> execute/diagnose
       -> stop -> release/finalize]
  -> observation
```

## Strategic Bets

First: do not start with a mass folder rename. Start with an ownership map. For
each current package/app/mod, classify it as support matter, resource contract,
provider, service truth, plugin projection, app identity, harness, or artifact.
Some things will split.

Second: make MapGen the pilot service. Not necessarily by moving files
immediately, but by documenting and enforcing its species: which parts are
semantic truth, which are projection, which are app content, which are runtime
resource access.

Third: introduce runtime-resource thinking before introducing heavy runtime
machinery. Civ7 access, official resources, filesystem/mod output, telemetry,
trace storage, and caches should become explicit provisionable capabilities.
That alone would remove a lot of hidden coupling.

Fourth: make Studio contract-first around derived artifacts and runtime
catalogs. Studio should not scrape internal topology or invent authority. It
should consume selected, derived, compiled, executed, and observed state.

Fifth: treat agents as projections, not privileged backdoors. Agent tools
should project service truth and runtime capabilities through declared
boundaries. Durable repo/game work belongs in governed async/workstream
execution, not an omnipotent chat shell.

Sixth: keep SDK/CLI public surfaces conservative. The more ambitious MapGen
gets, the more boring the public contracts need to be. Every exported behavior
should have a consumer gate. Breaking changes are allowed, but not casually.

Seventh: promote architectural knowledge into guardrails only after the
structure exists. No red-bar theater. The right sequence is: decide, migrate,
prove, document, guard.

## What To Drop Or Rename

Drop "plugin libraries" as a product category. It confuses reusable support
matter with runtime projection.

Rename "CLI" from a core capability to a surface. The product capability is
resource ingestion, mod building, map generation, inspection, verification. CLI
is how some of that is projected.

Stop treating "adapter" as one architectural layer. There are at least three
concepts hiding there: resource/provider access to Civ7 runtime, semantic
game-control capability, and projection/materialization boundary.

Demote current package names as architecture evidence. They are implementation
evidence only.

Resist turning this into a generic modding IDE too early. The winning wedge is
procedural map generation plus verified game projection. Nail that.

Resist collapsing adapter/runtime concerns into core because it feels
convenient. That would poison the architecture.

Resist polishing docs that are not connected to executable contracts. The docs
should route, explain, and promise only what code/proof can carry.

Resist adding more stages, packages, or shared utilities until the owner is
obvious. `shared` is usually a symptom, not a design.

## Migration Posture

Applying this architecture literally is a system-level migration. It should be
handled as a Tier 3 workstream, not as a cosmetic reorganization.

The correct first move is an ownership map and one pilot slice, not a repo-wide
rename. This draft selects MapGen as the pilot because it already has the
clearest truth/projection problem, the strongest product pull, and the richest
proof surface. `FG-001` must lock before that pilot admits or moves source.

The migration should preserve scale continuity:

```text
placement may change;
semantic species may not.
```

A capability should not change meaning when it changes process, machine, app
boundary, repository boundary, harness, provider, generated artifact, or
runtime substrate.

## Final Shape

Civ7 Modding Tools should become a RAWR-shaped Civ7 modding foundry: services
own modding truth, plugins project it into CLI/Studio/agent/game surfaces, apps
select product/runtime identities and profiles and supply provider choices, and
packages carry platform/support machinery. Resources own capability contracts
and selectors; providers implement them. The runtime compiler starts realization
with pure compilation and validation; bootgraph owns ordering and finalization;
the Effect kernel scopes acquisition and release; and the process runtime owns
live bindings plus adapter/harness coordination. Generated mods remain verified
artifacts rather than source authority.

In one sentence:

> Civ7 Modding Tools should become a closed-loop, evidence-driven mod authoring
> platform: typed where it authors, deterministic where it generates, explicit
> where it projects, visual where humans need orientation, and ruthless about
> proof boundaries.
