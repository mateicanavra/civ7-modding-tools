# Civ7 Capability Realization Frame

**Status:** Accepted; entry convergence active, coupled cutover gated on the Template-owned Habitat successor
**Date:** 2026-07-30
**Owner:** Civ7 platform architecture and product stewardship

## Intent

Close the current architecture initiative by aligning each shipped Civ7 product
capability with one Habitat role and one execution environment. The migration
must simplify the working product, not preserve current folders under cleaner
names or instantiate every plausible platform layer.

The unit of analysis is a **product capability realization chain**:

```text
definition -> projection -> composition -> realization -> observation
```

Within one app realization, the runtime lifecycle is:

```text
definition -> selection -> derivation -> compilation
  -> provisioning -> mounting -> observation
```

The first chain decides what each capability *is* and who owns it. The second
decides how one app selects and runs those capabilities without creating a
second semantic architecture. Civ7 may specialize the concrete runtime, but it
does not collapse package, resource, provider, service, plugin, and app into
one convenience owner.

Directories and package edges are evidence about that chain. They are not
authority by themselves.

## Rolling Focus

**Attractors:** Intent. Capability. Authority. Environment. Kind. Boundary.
Chain. Destination. Collapse. Proof. Closure.

**Current container:** converge the independent product lanes that must be
settled before their capability roots move. First, restack and re-prove the
remaining Studio design-sync stack on current `main`, then merge it before any
Studio API or app relocation. Second, reconstruct the accepted wind/pressure
behavior and metric proof in the current Swooper topology; the obsolete
flat-path branch is evidence, not an integration candidate. The active Fluree
inquiry lane remains independently owned and non-blocking until its owner
finishes a clean package-shaped result.

RAWR HQ-Template concurrently owns the corrected Habitat successor:
`@habitat/cli` source and releases, generic blueprint policy, its data-only
policy pack, production loading, generation, Nx projection, initialization,
and vendor modernization. Civ7's four admission-through-classification commits
remain scoped implementation evidence on a sibling stack. Civ7 does not add
local Habitat machinery or move capability-owner source into a transition
shape while waiting. Once entry convergence and the shared release both seal,
the first source migration is the coupled capability-chain cutover, not an
isolated CLI, service, Studio, resource, or mod move.

**Gradient:** current behavior -> capability owner -> execution realm -> target
kind -> positive law -> destination -> parity proof -> source deletion.

## Settled Ground

The following work is complete and is not reopened by this frame:

- CLI ownership is settled: the app owns the oclif process and no commands,
  while `plugins/cli/topics/*` own nested command projections. The current
  `cli-shell` and `cli-topic-plugin` roots remain legacy, unsealed instances
  until their anchors, closed proof interiors, and support-cabinet correction
  land.
- Habitat structure proves that the CLI app is commandless. A bounded source
  relation proves the sole `package.json#oclif.plugins` registry and forbids a
  second topic enumeration. Shell tests observe runtime discovery, collision
  freedom, help, executable-shim equivalence, and shared-harness delegation
  only.
- The accepted corrected Template successor must use
  `plugins/cli/topics/*`, never package-per-command roots or app-owned command
  source, before Civ7 imports its shared app law.
- `plugins/mod/map/swooper-physics` owns Swooper's portable mod definition:
  domains, recipe, metrics, diagnostics, trace, and visualization.
- `apps/mods/map/swooper-physics` owns the deployable Civ7 realization,
  generated entrypoints, build output, deployment, and live proof. Its
  corrected destination composes generic app definition/profile/entrypoint law
  with a `local-civ7` profile, `build` and `deploy` entrypoints, and qualified
  artifact, deployment, optional runtime, and live layers; it does not bypass
  generic app law. No current Swooper test is genuine live proof.
- `packages/mapgen-core` owns the portable MapGen authoring and execution SDK,
  not Swooper's product domain.
- `services/civ7-control` owns semantic live-control admission, policy,
  orchestration, and outcomes.
- Closed positive Habitat law is the ratchet. A destination is not valid merely
  because files were moved into it.

## Current Facts

1. CLI and Studio use the host-side Tuner socket path in production.
2. App UI, Tuner, and gameplay `ScriptSystem` are distinct Civ7 JavaScript
   states. Their `globalThis` objects and lifecycles are not shared.
3. The intelligence-bridge mod installs an async nested client in App UI, but
   has no deploy target, no tracked external caller, and no live product proof.
4. Tuner `CMD` evaluation is synchronous. Calling the async bridge from the
   host would require a deliberate mailbox or another proven async transport.
5. `@civ7/direct-control` mixes protocol framing, managed session state,
   exact Civ7 command lowering, observations, and product-facing convenience
   surfaces.
6. `Civ7ControlOrpcDirectControlFacade` mirrors that mixed package as one large
   service dependency and encourages type extraction from a facade rather than
   module-owned capability contracts.
7. The game CLI also calls direct-control outside the semantic service for raw
   execution, health, catalog, inspection, map reads, watch, restart, and
   focused diagnostic/read helpers.
8. Studio Run in Game and Save & Deploy are not request-local functions. Their
   process-lifetime operation runtime owns admission, retention, adoption,
   cancellation, diagnostics, and public state across caller interruption.
9. MapGen remains portable across browser preview, generated mod runtime, and
   tests. Moving its product truth into a network-shaped service would reduce
   that portability without adding an earned capability.
10. Studio is the only current HTTP host for the control service. The CLI calls
    the service in process.
11. Civ7's current service blueprint and implementation are pinned to oRPC 1
    and the patched `effect-orpc` bridge. They are migration corpus, not target
    authority. The inspected shared commit is only an audit baseline pointing
    toward native oRPC 2 and its official Effect integration; destination law
    is the accepted corrected successor, not that baseline.
12. `packages/civ7-adapter` is hybrid: its port, mock, and static metadata are
    portable, while its concrete adapter and setup capture import Civ7 engine
    modules and globals.
13. Proposed mod-install, saved-config, fresh-log, run-workspace, and authored-
    config owners currently perform Node filesystem effects. Those effects are
    runtime bindings, not package or mod-definition truth.
14. Studio's operation registry, records, retention, cancellation, and event
    state are semantic process-scoped MapGen-runs state, not a provider-neutral
    foreign resource.
15. The Studio API reads official-data roots separately from saved-game
    configuration roots; its target context must preserve those as distinct
    cold capabilities.

## Role Model

| Role | Owns | Must not own |
| --- | --- | --- |
| Package | Pure protocol, SDK, algorithm, schema, parser, plan, or comparison matter | Filesystem/network/engine effects, managed external state, product orchestration, host startup |
| Resource | A provider-neutral foreign capability with a real acquire/use/release lifetime and typed failure vocabulary | Stateless external calls, service-owned state, semantic product policy, provider selection, caller projection |
| Provider | One concrete resource realization and foreign-failure translation | Resource contract authority, app profile, service policy |
| Service | A named domain capability, invariants, policy, operations, required semantic capabilities, and scoped semantic state | Transport mount, provider construction, ambient host globals |
| Plugin projection | A qualified projection or integration for one real role, host, or caller; an API may reuse shared service-source construction law for its own oRPC projection; a CLI topic may own command-local host translation | Independent product truth, domain-service state, process lifecycle |
| Mod definition | Authored product content and one stable mod identity | Generated output, deployment, process lifecycle |
| App | Product/runtime identity, selected plugin membership, semantic adapter selection, and qualified cold effect implementations | Provider acquisition, service binding, mounting, reusable capability truth |
| Runtime profile | Provider selection, configuration roots, and process/harness defaults | Capability truth, acquisition, plugin membership, adapter identity |
| Entrypoint | One app, one profile, and one role/process selection through `startApp(...)` | App membership, provider acquisition, manual mounting |
| Runtime substrate | Derivation, compilation, provisioning, semantic-target lowering, service binding, context materialization, mounting, observation, and disposal | Product capability truth or app membership |
| Instance manifest | Concrete blueprint identity, version, governed roots, selected capabilities, and accepted niche facts | Blueprint policy, source topology, runtime composition |

These are architecture roles, not folder folklore or a claim that every noun
has one generic blueprint. Independent Habitat packets select the exact depths
they govern; qualified Civ7 niches own only product-specific law where the
shared substrate has no generic packet. The corrected successor RAWR HQ
Template Habitat packets and canonical runtime realization model are
destination authority; the currently inspected Template commit is an audit
baseline with recorded law corrections. Magic Migration is executable
corroboration, not a competing source. Existing Civ7 mechanics do not earn an
exception merely because they already work.

## Authority Order

```text
product intent
  -> capability owner
  -> execution environment
  -> kind law
  -> public contract
  -> app composition
  -> behavior proof
```

- Habitat owns positive structure and kind-local source relationships.
- Nx owns project dependency direction and proof ordering.
- TypeScript owns assignability and exact public construction surfaces.
- Knip owns unreachable code and exports.
- Tests own product behavior and cross-boundary runtime proof through the
  closed, disjoint confidence layers selected by each kind. Domain-qualified
  kinds may impose a stronger domain-shaped proof grammar.
- Every admitted test root is closed by its blueprint around a small set of
  meaningful confidence axes. Generic kinds reuse their generic layers;
  qualified and domain kinds refine them. No kind admits a case-by-case or
  open test cabinet.
- Proof membership comes from the owning source relation or exact identities
  selected by the instance or product manifest. A wildcard names only the
  terminal filename grammar; it never discovers app, API, web, or product
  proof.
- Generic app proof mirrors source exactly: every admitted
  `runtime/profiles/<profile>.ts` and every authored role entrypoint has one
  matching suite. API projection and optional execution leaves, web layers,
  and qualified product layers use their exact manifest-selected component ids
  instead; the API contract anchor remains fixed by its kind.
- Narsil and Fluree support discovery and corroboration; neither defines
  architecture authority.

## Recommended System Shape

```mermaid
flowchart LR
  Resource["Tuner resource"] --> Provider["Local-socket provider"]
  Control["Civ7 control service"] --> CLI["CLI projection"]
  Control --> StudioAPI["Studio API projection"]
  Runs["MapGen runs service"] --> StudioAPI
  Web["Studio web projection"] --> Studio["MapGen Studio app definition"]
  StudioAPI --> Studio
  CLI --> CLIApp["CLI app definition"]
  Provider --> Profile["Runtime profile"]
  Studio --> Runtime["Shared runtime realization"]
  CLIApp --> Runtime
  Profile --> Runtime
  Entry["Entrypoint role selection"] --> Runtime
  Runtime --> Process["Realized process"]

  classDef truth fill:#24303a,stroke:#101820,color:#f4f7f8;
  classDef projection fill:#3d4851,stroke:#101820,color:#f4f7f8;
  classDef runtime fill:#0f6b63,stroke:#101820,color:#ffffff;
  class Resource,Provider,Control,Runs truth;
  class CLI,StudioAPI,Web projection;
  class Studio,CLIApp,Profile,Entry,Runtime,Process runtime;
```

The service remains callable in process. An API plugin projects it only when a
network caller exists. The app definition selects plugins; its runtime profile
selects the concrete provider. The shared runtime provisions the resource,
binds the public service client, supplies API context, mounts the selected
roles, and owns disposal. The service client maps the ready capability into
private service ports; no facade or adapter project sits between resource and
service.

The local-socket provider keeps its framing and command codecs private. A
standalone Tuner protocol package is admitted only when a second independent
consumer proves that public boundary.

## Explicit Decisions

### Adopt the shared service substrate

Do not extend Civ7's oRPC 1 and patched `effect-orpc` service law. Import the
accepted corrected successor Habitat service, API-plugin, and app packet set,
converge the workspace vendor catalog on its native oRPC/Effect line, and burn
the control service and future MapGen runs service directly into that shape.
Product names, roots, and optional interiors remain Civ7-owned; generic
contract, implementation, context, module, router, error, proof, and consumer
laws do not fork locally.

The reusable service source blueprint is independently selected at
`src/service` in both a standalone service project and an API composition. It
never owns `test/`: the standalone project owns contract, module-semantics, and
execution proof, while the containing API project owns its contract,
projection, and selected execution proof.

Any exception requires a concrete incompatibility that survives a focused
shared-substrate spike. Migration convenience is not sufficient.

### Keep one control service

Do not split `civ7-control`, `civ7-live`, and `civ7-play` merely because those
nouns are plausible. The current city, diplomacy, display, government,
notification, progression, turn, unit, view, world, and strategy procedures
share one live-game admission and policy boundary. A later split requires a
different authority, runtime, access policy, or consumer lifecycle.

### Keep MapGen portable

Do not create `services/civ7-mapgen` in this initiative. Map generation is a
portable deterministic capability used in a browser worker and a Civ7 mod
runtime. `mapgen-core`, the Swooper definition plugin, and the realization app
already express its actual ownership.

Studio's operation lifecycle is a different capability. A focused MapGen runs
service may own long-lived Save & Deploy and Run in Game state without owning
recipes, generation algorithms, or Studio transport.

Save & Deploy composes two authorities rather than hiding them in one target.
The matching definition supplies pure complete-config admission and canonical
serialization. The Studio app's selected config-source adapter supplies an
opaque prepared write with exact rollback; the matching realization supplies
materialization and deployment operations. MapGen-runs owns their prepare ->
write -> deploy transaction and public phase evidence. The Studio app selects
the effect adapters, while shared runtime binds them without importing their
implementations into the service.

### Keep external effects at realization

Path injection and one-shot calls do not make external I/O pure.
`packages/civ7-adapter` retains only its portable EngineAdapter port, static
metadata, and mock; the concrete Civ7-global adapter, setup capture, and map
entrypoint belong to the Swooper realization's generated map-script runtime.
Pure mod-install, save-file, and Studio-run packages may retain parsing,
planning, hashing, serialization, and comparison only. The Studio app, Swooper
realization app, and qualified CLI topic own the exact cold filesystem adapters
they select or project. App profiles choose roots and providers, but never
redefine adapter identities.

### Do not create an HQ API

Do not create `plugins/server/api/civ7-hq` as a container for unrelated
capabilities. API plugins are caller projections, not service catalogs.
Studio's current caller boundary earns a Studio API projection. A public
control API can be added when a non-Studio network consumer and its auth,
compatibility, and lifecycle requirements are concrete.

### Do not promote the controller island

Do not make the current intelligence bridge the primary control path. A
controller-primary design depends on an unbuilt async mailbox, deployed-version
negotiation, lifecycle readiness, and live proof. The current package is not a
shipped capability.

The terminal state of this initiative contains no unconsumed bridge package.
Verified native behavior facts may inform the control service implementation. A future App UI
controller starts as a new qualified mod plugin and app only after a real
same-realm consumer or async ingress contract exists.

Any deletion or ownership change lands with the corresponding ADR-007
supersession. Accepted authority never knowingly contradicts a mergeable
intermediate layer.

### Admit resources only for managed capabilities

The Tuner session is an earned resource: it has acquisition, reconnect,
health, command execution, and release semantics. Civ7 window capture
independently earns a narrow resource because it acquires and revisions a
compiled ScreenCaptureKit helper, translates TCC/platform failures, and serves
two app runtimes. Neither fact earns a generic desktop-control resource. The
official resource corpus is currently a static submodule and generated-data
authority, not automatically a runtime `resource` package. A generic catalog or
desktop-app resource still waits for a concrete managed consumer and provider
corpus.

MapGen operation records, retention, cancellation, and event state are not a
foreign capability. They remain scoped state inside the MapGen-runs service.
Saved configurations, official-data roots, fresh-log reads, run-workspace
writes, authored-config transactions, and local mod installation are cold app
or CLI adapters because they have no independent acquire/release lifetime.

## Scope

### In

- Current capability-chain authority and canonical architecture alignment.
- Shared or qualified Habitat kind-law adoption for packages, resources,
  providers, services, caller projections, mod definitions, and apps.
- Shared service/API law adoption and oRPC/Effect vendor convergence.
- Shared runtime-realization adoption for app definitions, profiles,
  entrypoints, provisioning, service binding, mounting, and disposal.
- Tuner resource/provider extraction.
- Control-service client and private capability-port normalization.
- Deletion of the mixed direct-control package and the facade mirror.
- A complete direct-control consumer-to-destination ledger, including raw CLI
  diagnostics and non-Tuner host capabilities.
- Extraction of host-scoped MapGen run-state authority.
- Studio API/app realization ownership.
- Classification of the misleading `packages/plugins/*` set.
- Mod definition/realization normalization for existing mods.
- Canonical docs, OpenSpec disposition, dead-code proof, and stack/worktree
  closure.

### Out

- New gameplay or MapGen behavior.
- A Tuner-to-App-UI async mailbox.
- A gameplay `ScriptSystem` controller without a proven loading rail.
- A generic Civ7 catalog or macOS process-control resource without a working
  consumer.
- A MapGen service, Civ7 HQ API, or durable workflow merely to complete the
  five-root visual pattern.
- A public Tuner protocol package with only one provider consumer.
- Product-specific forks of the shared service or API substrate without a
  proven incompatibility.

## Falsifiers

Reopen the frame if any of the following becomes true:

- A current product capability cannot be expressed without duplicating
  semantic authority across these kinds.
- The Tuner session has no independently managed lifetime after the mixed
  direct-control package is decomposed.
- A shipped direct-control consumer has no qualified destination in the
  resource, service, diagnostic projection, or app runtime.
- A proven App UI ingress can await the nested client without a mailbox or
  transport addition.
- Control modules prove independent authorities or runtime admission policies
  that require separate services.
- Moving Studio's server surface into an API plugin destroys a required
  same-origin or shared-session invariant rather than relocating its owner.
- MapGen run-state cannot be separated from Studio transport without losing
  operation adoption, retention, or cancellation behavior.
- The shared service substrate cannot preserve a current control behavior after
  one focused native migration spike.
- A proposed portable Habitat law cannot be expressed without encoding Civ7
  instance names or current directory enumerations.

## Decision Gate

This frame, [current capability chains](./CURRENT-CAPABILITY-CHAINS.md),
[topology alternatives](./TOPOLOGY.md), [kind-law matrix](./KIND-LAW-MATRIX.md),
[migration corpus](./CORPUS.md), and [workstream](./WORKSTREAM.md) must be
reviewed together. After acceptance, implementation proceeds one sealed
container at a time: positive destination law, injected fixtures,
promotion/enforcement in the exact burn-down branch, observed live red,
qualified dispositions, zero, behavior proof, source deletion, and Graphite
seal.
