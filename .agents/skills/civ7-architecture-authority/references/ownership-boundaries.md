# Ownership Boundaries

Use this reference to place a capability after its actor outcome and sole fact
writers are known. The sealed topology remains normative; this is a compact
routing map, not a status ledger.

## Shared Kind Authority

Do not derive generic kind law from this file. Use the installed Habitat pack
for selected package/resource/provider/plugin/app structure and the sealed Civ7
topology for the qualified relationship. Civ7 keeps its unselected service law
and the product-specific owner maps below.

## Package Ownership

Use the exact selected-package ledger in
`docs/projects/civ7-capability-realization/TOPOLOGY.md` before placing package
source. The durable splits are:

| Package | Durable ownership |
| --- | --- |
| `packages/civ7-api` | Generated, state-scoped official Civ7 API declarations and provenance |
| `packages/civ7-adapter` | Portable engine-adapter contract, static capability vocabulary, and deterministic mock only; ambient engine implementation belongs to a qualified realization |
| `packages/civ7-map-policy` | Pure official-source-derived setup, placement, legality, and map facts |
| `packages/civ7-mod-install` | Pure rendered-tree admission, comparison, digest, replacement planning, and receipt construction over caller-supplied observations |
| `packages/civ7-save-files` | Pure saved-configuration byte parsing and bounded candidate classification |
| `packages/mapgen-core` | Portable authoring, compilation, execution, artifacts, trace, and product-neutral algorithms |
| `packages/mapgen-diagnostics` | Product-neutral diagnostic evidence, binary admission, dump/diff, and qualified publication mechanics |
| `packages/mapgen-metrics` | Product-neutral measurements, summaries, projections, and target-evaluation mechanics |
| `packages/mapgen-viz` | Environment-neutral visualization representations, geometry, projection, and injected materialization |
| `packages/mapgen-config` | Portable configuration envelope, identity, admission, snapshot, and serialization vocabulary |
| `packages/mapgen-studio-ui` | Reusable components and styles, not browser routes, providers, or process authority |
| `packages/sdk` | Generic Civ7 mod builders, definition contracts, and deterministic render plans |
| `packages/studio-run-workspace` | Pure paths, manifests, correlation, marker, and comparison mechanics over supplied values |
| `packages/typebox-standard-schema` | Product-free schema projection and validation mechanics |

A package may support several owner chains. Reuse does not give it semantic
product authority or permission to hide filesystem, socket, engine-global, or
process effects.

## Managed External Capabilities

### Tuner

- `resources/civ7-tuner` owns provider-neutral session value, epoch, health,
  raw-command, and foreign-failure vocabulary.
- `resources/civ7-tuner/providers/local-socket` owns connection, reconnect,
  execution, health, interruption, and release mechanics.
- A qualified host app selects and acquires the provider, then uses the ready
  value to bind the controller-owned public client to the realm-local ingress.
- The binding carries typed envelopes, correlation, realm/boot validation, and
  the live-proven completion mechanism only. It never regenerates a mature
  operation body.
- The controller owns native Civ7 semantics; Play owns gameplay meaning.
  Neither resource nor provider owns either.

### Window Capture

- `resources/window-capture` owns generic selected-window capture value and
  failure vocabulary.
- `resources/window-capture/providers/macos-screencapturekit` owns
  ScreenCaptureKit, permission translation, helper execution, child
  supervision, capture, interruption, and release.
- Window capture is generic diagnostic or qualified app evidence. It is not a
  Controller or Play dependency and does not acquire controller semantics.
- Civ7 matching, evidence interpretation, app activation, and restart remain
  qualified app concerns, not generic capture-resource policy.

## Semantic Services

### Civ7 Controller

`services/civ7-controller` owns typed native observation, check, and
single-dispatch operation semantics executed inside Civ7. Its outer modules
follow official Civ7 runtime realms and APIs; narrower city, diplomacy,
notification, player, progression, turn, and unit nouns stay nested beneath
the game boundary rather than becoming peer platform domains.

The service contract exposes bootstrap-issued API version, realm, and boot
identity alongside exact native evidence, refusal, failure, and uncertainty.
Its TypeScript implementation and private router are bundled into the
dedicated controller mod. It acquires no Tuner or window-capture capability,
executes no caller-authored JavaScript, owns no actor strategy or gameplay
reconciliation, and mounts no host transport. A named controller operation may
perform bounded native observation required by its own contract, but never
replays a mutation or decides actor meaning.

### Actor-Facing Play

`services/civ7-play` owns actor-facing modules such as attention, city,
diplomacy, notifications, progression, planning, turn, and unit only where
baseline behavior proves the capability:

- actor-facing situation and observation;
- checks and semantic requests;
- gameplay reconciliation and no-repeat policy;
- next lawful action.

It consumes only the public controller client. It receives no provider,
resource state, transport, arbitrary runtime execution, or private controller
source.
Narrower gameplay nouns compose beneath play rather than becoming peer
foundational services.

### MapGen Runs

`services/mapgen-runs` owns request-correlated Save & Deploy, Run in Game,
autoplay, adoption, inspection, and cancellation semantics:

- intent admission and request identity;
- transaction order and public phase evidence;
- process-scoped operation records, retention, adoption, cancellation, and
  events;
- correlation, timeout policy, reconciliation, and terminal outcome;
- autoplay admission/mutex policy and admitted live setup or observation
  through the public controller client.

It consumes exact app-bound authored-config, run-files, fresh-log,
mod-realization, and clock capabilities plus the public controller client. It
does not own recipe truth, filesystem effects, deployment receipts, controller
semantics, HTTP projection, or app startup.

## Projection Plugins

- `plugins/cli/topics/{data,docs,game,git-mod,mapgen}` own command names,
  flags, parsing, help, command-local presentation, and calls to app-bound
  public capabilities.
- `plugins/server/api/mapgen-studio` owns its caller-shaped contract, request
  context, projection, public caller client, and server-registration face. It
  delegates through bound controller, Play, and MapGen-runs clients; it owns no
  operation registry or semantic service state.
- `plugins/web/app/mapgen-studio` owns browser views and interactions over
  public API and definition clients. It does not own the retained Studio
  component package.
- `plugins/mod/map/swooper-physics` owns portable domains, recipe,
  configuration, diagnostics, metrics, trace, visualization, and cold
  authoring metadata. It performs no filesystem, deployment, provider, or
  live-runtime work.

A projection preserves the owner result vocabulary. A caller-specific API
grouping does not merge the services it projects or select a general-purpose
API for another caller.

## Apps And Qualified Adapters

### CLI App

`apps/cli` owns the commandless Oclif process, sole topic-membership
declaration, command-scope capability binding, provider selection when needed,
and idempotent finalization. Topic plugins keep command ownership.

### MapGen Studio App

`apps/mapgen-studio` owns its concrete Bun, Vite, server, and web hosts; selects
and acquires providers; binds the public controller client through selected
Tuner access; constructs Play and MapGen-runs clients; binds API context;
mounts roles; selects qualified adapters; and disposes the process scope. It
owns no Swooper truth, controller operation semantics, or service policy.

`apps/mapgen-studio/src/runtime/adapters/swooper-map-realization.ts` composes
the public Swooper definition with pure run-workspace and mod-install packages.
The adapter owns Studio's ephemeral physical materialization/install effects
and opaque receipts. Studio constructs it directly and passes it to
MapGen-runs. It does not import the production realization app, call another
app's targets, create a shared runtime, or decide the semantic operation
result.

### Swooper Production Realization App

`apps/mods/map/swooper-physics` owns finite production build/deploy
entrypoints, the deployable artifact, realization-local engine-global code,
its qualified install adapter, and its own deployment/loader/live proof. It
consumes the portable definition but never becomes its owner or a reusable
runtime for Studio.

### Controller Mod Realization App

`apps/mods/ui/civ7-controller` bundles `services/civ7-controller` with the
portable controller mod definition, installs the exact artifact, publishes the
versioned shell/game ingress, creates realm/boot instance identity, and keeps
generated, installed, loader, and live proof separate. It owns no Play policy
or host Tuner lifecycle.

## Required Deletions

- The legacy control facade and direct-control convenience shape have no target
  owner. Preserve their capability inventory only as migration evidence.
- Consumers call independently bound public controller or Play clients; no
  successor facade, parallel method interface, private contract picking, or
  forwarding service-adapter layer survives.
- Tuner acquisition leaves services and ordinary commands.
- Gameplay policy leaves the controller.
- Semantic operation state leaves Studio API and host code for MapGen-runs.
- Physical Studio realization effects leave MapGen-runs and remain in the
  qualified Studio adapter.

## Documentation And Evidence

The sealed project packet owns the accepted model. Upstream Habitat owns
selected shared-kind law; Civ7 retains local service law and qualified product
overlays. Global vendor skills plus exact installed source own generic
Effect/oRPC mechanics. Canonical docs receive promoted stable knowledge.
Current source, tests, generated files, and live checks remain scoped
evidence; none can silently reassign an owner.
