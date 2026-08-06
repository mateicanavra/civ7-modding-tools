# Civ7 Platform Destination Reference

**Status:** Accepted destination platform reference

This packet records the destination architecture recovered from the earlier
platform proposal and re-ratified against the product, system, outcome, actor,
topology, corpus, proof, and vendor models. It is not a migration backlog and
does not preserve a component merely because the component exists today.

Ground is now sealed on the installed Habitat 0.5.2 consumer release. Its
shared `app@1`, `package@1`, `plugin@1`, `plugin-nx@1`, `provider@1`, and
`resource@1` shells are ready; `service@1` remains deliberately unselected.
Shared substrate readiness does not close Civ7-qualified overlays, consumer
movement, or product proof. Those remain separate implementation and evidence
gates under the accepted destination model.

The controlling idea is simple:

> External capabilities are described by resources and acquired by providers.
> Product capabilities are owned by services or by their already-qualified pure
> owner. Consumer boundaries are projected by plugins. Apps select, construct,
> bind, mount, and run the graph. Durable workflows coordinate work that
> outlives one request or process.

## Kind Grammar

| Kind | Owns | Does not own |
| --- | --- | --- |
| Package | Pure reusable data, schemas, protocol, algorithms, and SDK logic | Acquisition, mutable external state, product write authority, transport hosts |
| Resource | Provider-neutral external-capability contract, value, lifecycle vocabulary, and failures | Concrete acquisition, Civ7 product meaning, actor policy, API projection |
| Provider | One concrete acquisition, health, interruption, and release implementation for a resource contract | Provider selection, product policy, process composition |
| Service | One durable semantic capability, its contract, implementation, policy, and write authority | Process bootstrap, HTTP exposure, provider lifecycle, cross-request orchestration |
| API plugin | A caller-shaped oRPC boundary over public service clients and exact public capabilities supplied by its app | Service or definition semantics, resource acquisition, hidden second implementations |
| Workflow plugin | Durable orchestration that can outlive or re-enter a request/process | Product truth, service writes, provider effects without idempotency/reconciliation |
| CLI topic plugin | Oclif commands for one user-facing topic over exact app-supplied public capabilities | Root runtime construction, duplicate product policy, provider selection or private provider access |
| Mod plugin | Portable Civ7 mod definition and realm-specific source owned by a product | Installation path, deployment process, application runtime configuration |
| Web plugin | One browser product projection over public API and product-definition clients | Server process startup, provider selection, service or definition truth |
| App | Runtime configuration, Layer/resource construction, plugin mounting, process lifetime, and shutdown | Reusable domain truth or an alternate service implementation |

The call and construction directions stay distinct:

```text
caller -> API/topic/web projection -> public service, definition, or qualified diagnostic capability

app -> select provider -> acquire resource value -> bind service client
  +-> mount API/topic/web/mod plugins
  +-> select qualified adapters and process lifetime

all qualified owners may import their required pure packages
```

An app may call a service or API plugin in process. Crossing a network adds a
handler and link; it does not create a different product owner.

## Recovered Proposal Inventory

The earlier discussion named more candidate components than the smallest
selected spine. This ledger keeps that proposal visible while testing every
part against its actual pressure.

| Earlier proposal | Current judgment | Reason |
| --- | --- | --- |
| `packages/civ7-tuner-protocol` | Conditional | Keep protocol inside the Tuner resource/provider until a second independently released consumer earns a package |
| `resources/civ7-live-connector/providers/civ7-tuner` | Refine to `resources/civ7-tuner/providers/local-socket` | Tuner is the concrete managed capability; a generic live connector hides rather than clarifies it |
| `resources/catalog/providers/civ7-official-data` | Conditional | Earn only if the current data estate needs managed roots and generic catalog lifecycle beyond pure generation packages |
| Generic desktop-app control with a Civ7 provider | Conditional; retain a cold app adapter until managed lifecycle is proven | Process/window control is generic, but a one-shot launch/restart command does not by itself earn a scoped resource |
| `services/civ7-control` | Select | Foundational typed live app/game/map/UI authority |
| `services/civ7-live` | Collapse into `civ7-control` | A second service would only forward the same foundational live capability |
| `services/civ7-play` | Select | Actor-facing gameplay policy and outcomes are a distinct capability built on control |
| `services/civ7-mapgen` | Narrow to `services/mapgen-runs` | Pure MapGen truth remains in SDK/definition packages; the service owns run intent, state, correlation, reconciliation, and semantic outcomes while app adapters own physical host effects |
| `services/civ7-resources` | Reject as named | Resources are already owners; only a proven Civ7 data capability may earn a semantic service |
| `services/civ7-data` | Conditional | Requires an estate-backed semantic query/write authority, not merely file/resource access |
| `plugins/server/api/civ7-live` | Not independently selected | Studio or a future HQ projection can consume control; a 1:1 live mirror adds no caller contract |
| `plugins/server/api/civ7-data` | Conditional | Follows an earned data service and a concrete network caller |
| `plugins/server/api/civ7-play` | Conditional | Follows a concrete browser/network agent contract; CLI may call play in process without it |
| `plugins/server/api/civ7-hq` | Conditional | Earn only from one concrete operator contract spanning several services, never as a projection cabinet |
| `plugins/async/workflows/mapgen` | Conditional, likely | Select when Run in Game/new game must survive process loss with durable intent and reconciliation |
| `plugins/async/workflows/civ7-control-worker` | Not selected | Background possibility alone does not earn a generic worker |
| `apps/cli/civ7`, `apps/server/civ7`, web apps, and mod apps | Select when their mounted product surfaces exist | Apps are the proper runtime, provisioning, mount, and shutdown owners |
| Civ7 game/UI controller mod | Conditional | Requires exact realm, ingress, lifecycle, and replacement proof; it must not coexist as a second control path |

## Selected Platform Spine

```text
packages/
  civ7-types/
  civ7-adapter/
  civ7-map-policy/
  civ7-mod-install/
  civ7-save-files/
  mapgen-core/
  mapgen-diagnostics/
  mapgen-metrics/
  mapgen-viz/
  mapgen-config/
  mapgen-studio-ui/
  sdk/
  studio-run-workspace/
  typebox-standard-schema/

resources/
  civ7-tuner/
    providers/local-socket/
  window-capture/
    providers/macos-screencapturekit/

services/
  civ7-control/
    modules/{app,game,map,ui}/
  civ7-play/
    modules/{attention,automation,city,diplomacy,notifications,
             planning,progression,turn,unit}/
  mapgen-runs/
    modules/{autoplay,operations,run-in-game,save-deploy}/

plugins/
  cli/topics/{data,docs,game,git-mod,mapgen}/
  mod/map/swooper-physics/
  server/api/mapgen-studio/
  web/app/mapgen-studio/       # semantic destination; qualified law pending

apps/
  cli/
  mapgen-studio/
  mods/map/swooper-physics/
```

This is the smallest currently earned semantic spine. The MapGen Studio web
plugin is selected by product ownership but remains unconstructible until its
qualified Habitat packet exists. A generic desktop-application resource remains
conditional: the current launch/restart operation first has to prove a reusable
acquire/use/release capability rather than a one-shot cold app adapter.

The matching owner-consumer-proof ledger for all 14 selected package roots is
normative in [TOPOLOGY.md](./TOPOLOGY.md#selected-package-spine-ledger). A
package's presence in this inventory selects its destination role; it does not
claim its qualified proof or consumer migration has closed.

## Capability Chains

### Foundational Live Control

```text
Civ7 process + Tuner + visible window
  -> selected Tuner and window-capture providers
  -> provider-neutral resource values
  -> app-bound civ7-control client
  -> typed app/game/map/UI facts and native operations
  -> API or CLI projection
  -> operator observes or controls the live application
```

`civ7-control` owns native interpretation, admission, dispatch, bounded
readback, and exact native uncertainty. It does not own gameplay goals,
priorities, no-repeat policy, or next-action recommendations.

The root remains exactly `{app,game,map,ui}`. `game` nests explicit native
subdomains rather than flattening city, diplomacy, notifications, player,
progression, turn, or unit into peer modules. Leaves expose exact `observe`, `check`, and
`send` operations. `send` means one fresh native check, at most one invocation,
and honest dispatch evidence with optional same-evaluation `immediateAfter`
readback. A generic operation dispatcher or discriminated family union is a
facade by another name and is not admitted. Polling, postconditions,
no-repeat behavior, actor-facing `request`, and reconciliation do not belong
inside those native action leaves. A named foundational operation may perform
bounded observation required by its own explicit contract, without replaying
a mutation or deciding actor meaning.

### Play

```text
civ7-control public client
  -> civ7-play
  -> attention, automation, city, diplomacy, notifications,
     progression, planning, turn, unit
  -> game-play CLI or selected MapGen Studio API route delegation
  -> player/agent receives a situation, acts, and gets honest reconciliation
```

City and diplomacy are modules of play, not peer control services. `civ7-play`
never receives Tuner, window capture, a provider, arbitrary JavaScript, or
private control implementation. Shared admission does not collapse control and
play into one semantic owner.

The current MapGen Studio API is a caller-specific projection that delegates
selected frozen play routes to the bound play client. It does not earn a
standalone general public `plugins/server/api/civ7-play` surface; that remains
future-only until a distinct browser or network-agent caller contract exists.

### Map Generation

```text
MapGen packages + Swooper definition plugin
  -> qualified authored-config capability
Public Swooper definition + pure run-workspace/mod-install packages
  -> Studio app's swooper-map-realization adapter
  -> physical ephemeral materialization/install effects and receipts
Studio app binds that exact capability plus authored config, run-files,
fresh-log, and control
  -> mapgen-runs operation intent, ordering, state, and reconciliation
  -> final semantic operation outcome
  -> MapGen Studio API
  -> Studio web app or CLI

Swooper definition plugin -> Swooper realization app Nx targets
  -> that app's separate deployable realization outcome
```

Pure recipe execution and canonical config admission remain in the MapGen SDK
and definition plugin. The Swooper realization app owns only the deployable
artifact and outcome of its own Nx targets. The Studio app directly constructs
its `apps/mapgen-studio/src/runtime/adapters/swooper-map-realization.ts`
adapter against the exact public MapGen-runs dependency descriptor from the
public Swooper definition plus pure run-workspace and mod-install packages.
That adapter owns Studio's
physical ephemeral materialization/install effects and returns opaque receipts;
it neither imports the mod-realization app nor introduces a facade or shared
runtime. Other qualified app adapters own their bounded host reads and writes.
`mapgen-runs` owns accepted operation intent, transaction order, state,
correlation, terminal reconciliation, and the final semantic operation outcome.
It consumes exact bound capabilities; it does not absorb their definition,
physical realization effects, receipts, or foundational control authority.

### Mod Realization

```text
portable mod definition plugin
  -> mod application runtime configuration
  -> materialization and deployment capability
  -> Civ7 installation
```

Swooper and Dacia reuse this grammar. A definition plugin is not a deployed
application; an app is not the portable mod product.

## Service And API Shape

Each service owns one atomic oRPC authority:

```text
contract   public boundary truth owned by the service
router     private complete executable implementation
client     public callable projection and qualified construction face
```

These are three views of one service authority, not three contracts. Consumers
call the public client. Production implementation authority stays inside that
service; a test may supply an explicitly scoped non-authoritative substitute at
a consuming boundary. An API plugin may project selected public operations, but
no caller extracts method types with `Parameters<...>`, picks private contract
leaves, invents a parallel method interface, or imports router implementation.

A contract-derived `createClient(...)` is not a facade. It may bind the exact
ready dependencies supplied by the qualified app/API composition root. The
public client face can re-export the owned contract; the router and
implementation remain private. That construction call is not distributed to
ordinary consumers, and it introduces no second method vocabulary; consumers
receive the resulting typed client.

A service-owned public dependency descriptor may likewise be implemented by a
qualified app adapter. For MapGen-runs, Studio composition constructs the
`swooper-map-realization` adapter directly and passes that ready value to
`createClient(...)`. Habitat owns the adapter's closed structural and import
law, and TypeScript proves the exact descriptor. The adapter composes only the
public Swooper definition and pure workspace/install packages; no generic
runtime discovers or lowers a descriptor, no facade is introduced, and no app
or cross-app target is imported.

oRPC owns procedure composition, validation, handler/link exposure, and client
projection. Effect supplies typed dependencies, scoped-lifecycle mechanics,
error channels, and interruption semantics. The resource contract owns
lifecycle meaning, the provider owns concrete acquisition/release, and the app
owns provider selection, dependency-context construction, request context,
process lifetime, shutdown, and telemetry drain. A concrete Layer or runtime is
selected only when the exact installed vendor lane proves it is required. The
Effect-oRPC bridge adapts an Effect computation at the procedure boundary; it
does not become a service, resource, provider, or runtime owner.

API plugins own consumer contracts. Their own oRPC contract, private router,
public client, and public server-registration face are API boundary machinery,
not a second product service. They project public service clients and any exact
public definition/package capabilities selected by the app, then add caller
policy, auth, transport metadata, and translation. Services are never made
public over the wire by mounting private service routers or copying service
contract subtrees.

```text
src/
  api.ts       public server-registration face
  client.ts    public caller face
  service/     private API-owned contract, router, implementation, and modules
```

The nested packet is selected. A competing flat contract/router/modules spine
would create two structural descriptions of the same API kind and is refused.

## Durable Workflow Boundary

Inngest is selected only when work must survive a request or process and needs
durable scheduling, retry, waits, replay, or flow control. Product state remains
service-owned. A workflow records stable operation/effect identities, calls
public service clients, rechecks product authority on re-entry, and reconciles
ambiguous external effects.

The likely earned candidate is a future durable MapGen/new-game workflow. It is
not admitted until the product requires process-independent resumption. A
generic `civ7-control-worker` is not created merely because background work is
possible.

## Conditional Extensions

These components are admissible only when their named pressure exists:

| Candidate | Re-entry evidence |
| --- | --- |
| `packages/civ7-tuner-protocol` | A second independently released consumer needs the pure wire contract outside the Tuner provider |
| Generic file-catalog resource plus Civ7 provider | Multiple qualified consumers need managed roots, lifecycle, and generic catalog operations |
| Generic desktop-application resource | More than a one-shot app adapter needs reusable acquire/use/release process or window lifecycle |
| `services/civ7-data` | A named actor task requires durable query/write facts with one semantic owner and a concrete consumer boundary that pure packages and resources cannot satisfy |
| `plugins/server/api/civ7-hq` | A concrete operator client needs one curated control-plane contract across several services |
| `plugins/server/api/civ7-play` | A browser or network agent needs a stable play projection distinct from CLI composition |
| Durable MapGen workflow | A run must survive request/process loss and has stable intent, idempotency, and reconciliation owners |
| Civ7 controller mod | Exact game/UI realm, ingress, lifecycle, and a same-realm consumer are proven; it replaces rather than parallels host-injected scripts |

The controller-mod candidate would be a portable mod plugin plus a mod app. Its
realm-local loader may install a closed control API on that realm's
`globalThis`. It is not automatically another host service, and it cannot land
as a second live-control path.

## Mandatory Deletions

The destination contains none of the following:

- `Civ7ControlOrpcDirectControlFacade` or any replacement facade;
- `liveCiv7DirectControl` or `liveCiv7LifecycleControl` convenience surfaces;
- `Parameters<Facade["method"]>` or private service-contract picking;
- the mixed `packages/civ7-direct-control` owner after its resource, service,
  diagnostic, and app responsibilities reach qualified destinations;
- service adapter packages that only forward another public client;
- Tuner/session acquisition inside services or ordinary caller commands;
- gameplay policy inside foundational control;
- HTTP, CLI, or workflow orchestration inside services;
- service implementations exposed directly over the wire;
- a broad HQ API, data service, catalog, workflow, or controller mod created
  without a concrete consumer and lifecycle owner.

The legacy facade is deletion evidence only. Its former method inventory helps
prove capability parity; none of its type or ownership shape survives.

## Falsifiers

This reference must change if any of these are demonstrated:

1. Control and play have the same actor intent, policy, result, and change
   authority rather than merely sharing live prerequisites.
2. A selected resource contains durable Civ7 product semantics rather than
   external capability lifecycle.
3. A selected service has no independent writer or behavioral outcome.
4. An API plugin cannot state a concrete caller contract distinct from a raw
   service mirror.
5. A proposed workflow does not cross a request/process lifetime.
6. A component exists only to preserve a legacy import or directory.

These falsifiers were tested against the exact estate during re-ratification.
Future evidence satisfying one reopens the model before implementation
continues. Acceptance still does not admit source by itself; kind law and the
frozen migration corpus own that gate.

## Current Model Comparison

The current normative packet already preserves most of this architecture, but
the comparison exposed these concrete corrections:

| Model area | Disposition |
| --- | --- |
| Control versus play | Keep the newly restored two-service direction; the former one-service model was a real collapse |
| Control modules | Select `{app,game,map,ui}`; native uncertainty stays in control while no-repeat and next-action policy stay in play |
| Legacy facade | Delete with no target shape; retain only its capability inventory as migration evidence |
| Service client | Keep the contract-derived client factory; forbid parallel interfaces, private picking, and construction outside qualified composition roots |
| Resource facts | Tuner epoch/health/raw execution and capture evidence remain resource/provider facts; control owns their Civ7 interpretation and correlated semantic outcomes only |
| MapGen ownership | Definition owns canonical authoring; the Swooper realization app owns its own deployable outcome; Studio's qualified adapter owns ephemeral physical materialization/install effects and receipts from public definition plus pure packages; MapGen-runs owns intent/order/state/correlation/reconciliation and the final semantic operation outcome |
| API projection | Select the nested MapGen Studio API-owned oRPC packet with public client and server-registration faces, private router/implementation, API-owned caller contracts, and delegation through bound control, play, and run capabilities; selected Studio play routes are current scope, while a standalone public Play API remains future-only |
| Provider realization | CLI and Studio must actually acquire the selected providers and bind clients; the current working tree has not closed that chain |
| Active guidance | The sealed model now drives an explicit keep/repair/consolidate/delete pass over local skills, AGENTS routers, ADRs, and architecture docs before source movement |
| API/workflow/data/controller expansion | Keep explicit re-entry gates rather than creating layers for topology symmetry |
| Vendor lane | The selected destination lane is oRPC/Effect-oRPC `2.0.0-beta.23` with Effect `4.0.0-beta.101`; at the model seal the root consumer pins remain Effect-oRPC `0.5.0` and Effect `3.21.3`, while the destination versions appear in nested Habitat dependencies only. The root transition belongs to semantic-service migration in WORKSTREAM section 1.2.2, not the model seal. The published global vendor skills classify the destination tuple as an unclassified preview lane and route it to exact installed-source and discriminating proof rather than repository-local syntax guidance |
