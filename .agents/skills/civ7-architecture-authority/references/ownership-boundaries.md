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
| `packages/civ7-types` | Type-only Civ7 scripting/runtime declarations and generated declaration surfaces |
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
- A qualified app selects and acquires the provider, then supplies the ready
  value when constructing the control client.
- Control owns Civ7 interpretation; play owns gameplay meaning. Neither
  resource nor provider owns either.

### Window Capture

- `resources/window-capture` owns generic selected-window capture value and
  failure vocabulary.
- `resources/window-capture/providers/macos-screencapturekit` owns
  ScreenCaptureKit, permission translation, helper execution, child
  supervision, capture, interruption, and release.
- Control alone interprets raw capture evidence as a Civ7 appshot.
- Civ7 matching, app activation, and restart remain qualified app concerns,
  not generic capture-resource policy.

## Semantic Services

### Foundational Control

`services/civ7-control` owns exactly the execution domains `{app, game, map,
ui}`:

- readiness and current-application facts;
- setup/start and current-game facts;
- observation, visibility, plot, grid, and surface facts;
- display queue, camera, and semantic Civ7 appshot behavior;
- native admission, dispatch, bounded readback, and exact native uncertainty.

It consumes app-supplied ready Tuner and window-capture capabilities. It does
not acquire providers, expose arbitrary JavaScript, own raw resource facts,
interpret actor goals, recommend actions, or mount a transport.

### Actor-Facing Play

`services/civ7-play` owns exactly `{attention, automation, city, diplomacy,
notifications, progression, planning, turn, unit}`:

- actor-facing situation and observation;
- checks and semantic requests;
- gameplay reconciliation and no-repeat policy;
- next lawful action.

It consumes only the public control capability. It receives no provider,
resource state, arbitrary runtime execution, or private control source.
Narrower gameplay nouns compose beneath play rather than becoming peer
foundational services.

### MapGen Runs

`services/mapgen-runs` owns exactly `{autoplay, operations, run-in-game,
save-deploy}` and the semantic operation model:

- intent admission and request identity;
- transaction order and public phase evidence;
- process-scoped operation records, retention, adoption, cancellation, and
  events;
- correlation, timeout policy, reconciliation, and terminal outcome;
- autoplay admission/mutex policy and delegation to control.

It consumes exact app-bound authored-config, run-files, fresh-log,
mod-realization, control, and clock capabilities. It does not own recipe truth,
filesystem effects, deployment receipts, HTTP projection, or app startup.

## Projection Plugins

- `plugins/cli/topics/{data,docs,game,git-mod,mapgen}` own command names,
  flags, parsing, help, command-local presentation, and calls to app-bound
  public capabilities.
- `plugins/server/api/mapgen-studio` owns its caller-shaped contract, request
  context, projection, public caller client, and server-registration face. It
  delegates through bound control, play, and MapGen-runs clients; it owns no
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

`apps/mapgen-studio` owns its concrete Bun, Vite, server, and web hosts; selects and
acquires providers; constructs control, play, and MapGen-runs clients; binds
API context; mounts roles; selects qualified adapters; and disposes the process
scope. It owns no Swooper truth or service policy.

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

## Required Deletions

- The legacy control facade and direct-control convenience shape have no target
  owner. Preserve their capability inventory only as migration evidence.
- Consumers call independently bound public control or play clients; no
  successor facade, parallel method interface, private contract picking, or
  forwarding service-adapter layer survives.
- Tuner acquisition leaves services and ordinary commands.
- Gameplay policy leaves foundational control.
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
