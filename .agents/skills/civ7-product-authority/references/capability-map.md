# Capability Map

Use this map to identify the actor outcome and sole writers before selecting a
container or public surface. The sealed product authority remains normative;
this reference carries no migration, admission, or proof status.

## Capability Chains

| Capability | Actor outcome | Semantic or fact-owner chain | Explicit non-owners |
| --- | --- | --- | --- |
| Official game knowledge | Establish which official Civ7 identifiers, schemas, relationships, and resources are supported by one identified source revision | Qualified extraction owns its receipt; published official corpus owns the source revision; generated type/policy packages own derived contracts | Studio, MapGen, runtime services, adapters, generated output as policy |
| Generic mod authoring | Express a complete portable mod definition and deterministic render plan | `packages/sdk` owns generic builders/contracts; each mod definition owns product identity and content | CLI, installer mechanics, realization app, generated tree, loader |
| Swooper map definition and generation | Author, run, inspect, compare, and explain one deterministic Swooper Physics map outside Civ7 | `plugins/mod/map/swooper-physics` owns domains, Standard recipe, authored config, product diagnostics/metrics/trace/visualization; MapGen packages own only product-neutral language and mechanics | Studio, CLI, adapter, generated map entry, production realization, engine readback |
| Production mod realization | Materialize, install, replace, and verify one exact deployable mod build | `apps/mods/map/swooper-physics` owns Swooper build/deploy meaning, qualified host effects, deployable artifact, and its own deployment/loader/live proof | Definition plugin, generic SDK, pure install planner, CLI topic, generated tree |
| Civ7 controller | Inspect or perform one closed typed native operation in the current Civ7 realm | `services/civ7-controller` owns the TypeScript operation inside the controller mod; the host app binds its public client through selected Tuner access without regenerating the operation body | Play owning native execution; Tuner/window resources owning controller semantics; CLI/API/web; MapGen-runs; raw diagnostics |
| Civ7 play | Understand the playable situation, check or perform one lawful gameplay action, reconcile uncertainty, and choose the next safe action | `services/civ7-play` owns actor-facing observation/check/request/reconciliation/no-repeat/next-action meaning over the public controller client | Controller for actor policy, resources/providers, CLI/API/web projections, postcondition observer |
| Map configuration authoring | Import, edit, validate, save, and export one stable MapGen configuration | The Swooper definition owns canonical admission/serialization; the qualified Studio source adapter owns exact write/rollback effects and receipts | Studio UI/API, MapGen-runs, production realization, generic filesystem package |
| Studio map realization operation | Save & Deploy, Run in Game, autoplay, adopt, inspect, or cancel one request-correlated operation | `services/mapgen-runs` owns semantic intent/order/state/correlation/retention/cancellation/reconciliation/outcome; Studio adapters own exact source/run/log and ephemeral materialization/install effects; the public controller client supplies admitted native facts | Studio API/browser/host as semantic owner, Tuner, Swooper definition for operation state, production realization targets |

## Selected Owner Inventories

### Civ7 Controller

The controller's outer modules follow official Civ7 runtime realms and APIs.
Narrower city, diplomacy, notification, player, progression, turn, and unit
nouns remain nested below the game boundary. Exact `observe`, `check`, and
single-dispatch `send` leaves own native facts and expose realm/boot identity.
The TypeScript implementation and private router run inside the dedicated
controller mod. Raw Tuner facts and window captures remain separate
resource/provider or qualified app evidence. Actor-facing requests and
gameplay reconciliation remain Play-owned.

### Actor-Facing Play

Play modules own gameplay situation, policy, reconciliation, no-repeat, and
next-action meaning where baseline behavior proves the capability. They consume
only the public controller client.

### MapGen Runs

The finite run modules are `{autoplay, operations, run-in-game, save-deploy}`.
The service owns semantic operation records and result meaning. App-bound
adapters own physical effects and exact receipts.

## Swooper Boundary Card

| Boundary | Owns | Does not own |
| --- | --- | --- |
| `plugins/mod/map/swooper-physics` | Portable product domains, recipe, config, diagnostics, metrics, trace, visualization, and cold authoring metadata | Filesystem effects, deployment, provider acquisition, live runtime |
| `apps/mods/map/swooper-physics` | Finite build/deploy entrypoints, deployable artifact, realization-local engine integration, production install/loader/live evidence | Definition truth, reusable Studio runtime |
| `apps/mapgen-studio/src/runtime/adapters/swooper-map-realization.ts` | Ephemeral physical materialization/install effects and opaque receipts from the public definition plus pure packages | Production target outcome, semantic run state, final operation result |
| `services/mapgen-runs` | Intent, transaction order, operation state, correlation, cancellation, retention, reconciliation, and final semantic outcome | Definition truth, physical filesystem/deployment effects |

## Product Surfaces

CLI topics, MapGen Studio API/web, SDK exports, docs/examples, and mod-loader
entrypoints are authorized projections or consumers, not additional semantic
owners. Each surface preserves owner results, typed errors, refusal,
uncertainty, and proof facts required for its claim.

The Studio API may delegate selected caller-specific routes to independently
bound controller, Play, and run clients. That grouping does not merge their
authorities or imply a general-purpose public API for another caller.

## Supporting Observations

Tuner health/raw execution, generic window capture, app restart, fresh-log
reads, generated artifacts, installation receipts, loader signals, and engine
readbacks remain facts of their exact resource, provider, qualified adapter,
realization, or external authority. They may support a capability Question;
they do not form one diagnostic service or inherit gameplay-success meaning.

## Deletion Boundary

The former facade/direct-control inventory is migration evidence only. It has no
semantic capability, compatibility promise, or target owner. Consumers move to
the exact resource diagnostic, controller client, Play client, MapGen-runs client,
or app-bound capability that owns the fact.
