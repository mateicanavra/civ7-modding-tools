# Civ7 Product Authority

**Status:** Normative project authority for the capability-realization cutover
**Date:** 2026-07-31
**Owner:** Civ7 product stewardship

This model names the durable Civ7 product capabilities, their outcomes, their
semantic owners, and their explicit non-owners. It is not a file tree,
dependency graph, migration sequence, or claim that a selected destination has
already shipped.

The current implementation remains recorded in
[CURRENT-CAPABILITY-CHAINS.md](./CURRENT-CAPABILITY-CHAINS.md). The selected
destination remains recorded in [TOPOLOGY.md](./TOPOLOGY.md). This model is the
authority bridge between them.

## Independent Status Axes

Never infer one axis from another.

| Axis | Values | Meaning |
| --- | --- | --- |
| Product authority | `authorized`, `compatibility-retained`, `excluded`, `retired`, `deferred` | Whether the product promises the capability or surface |
| Target ownership | `selected`, `proposed`, `unresolved` | Whether every fact and transition in the owner chain has one accepted authority |
| Shared substrate readiness | `ready`, `unselected`, `not-applicable` | Whether the exact installed Habitat release supplies and enforces the selected generic shell; this is a repository-wide kind fact, not product proof |
| Qualified destination admission | `admitted`, `partially-admitted`, `legacy-only`, `qualified-pending`, `not-applicable` | Whether the complete Civ7-local instance and qualified overlays can admit source; `legacy-only` means current source exists without that destination admission |
| Migration | `current`, `hybrid`, `migrated` | Whether source and consumers occupy the selected ownership graph |
| Proof | a set of `contract`, `semantics`, `execution`, `projection`, `assembly`, `generated`, `installed`, `loader`, `live-behavior` | The disjoint claims supported by current evidence |

A product capability may be authorized with selected ownership while one of
its qualified destination overlays is still pending. A shared shell may be
ready while owning no authorized product capability. A generated or installed
artifact is not live proof.

Ground is sealed on the exact installed `@habitat-ai/cli@0.5.2` consumer
release and its exact `@habitat-ai/sdk@0.5.2` dependency. Shared `app@1`,
`package@1`, `plugin@1`, `plugin-nx@1`, `provider@1`, and `resource@1` are
`ready`; `service@1` remains deliberately `unselected`, so Civ7 service law
stays local. That closes shared substrate readiness only. It does not admit a
missing qualified Civ7 overlay, move product source, close a consumer gate, or
upgrade any product proof claim. The model's overall status is unchanged.

## Product Laws

1. **Capability precedes container.** Name the actor outcome and semantic owner
   before choosing a package, resource, service, plugin, or app.
2. **One authority per fact.** Every durable fact, policy decision, transition,
   and correction law has one owner. An actor capability may traverse an owner
   chain, but no fact has shared writers. Projections may compose owners but
   never acquire their write authority.
3. **Channels preserve meaning.** CLI, Studio, API, SDK, and mod-loader paths
   may project the same capability. They do not create separate capabilities or
   change its result vocabulary.
4. **Definition differs from realization.** Portable authored truth belongs to
   a definition owner. Host effects, generated files, installation, loader
   behavior, and live proof belong to a qualified realization owner.
5. **Map truth differs from engine projection.** A deterministic MapGen
   artifact is pipeline truth. A Civ7 readback is engine-owned observation.
   Neither silently substitutes for the other.
6. **Foreign capability is admitted.** A resource owns the provider-neutral
   lifecycle contract and failure vocabulary. A selected provider acquires the
   concrete capability and emits its epoch, health, command, and foreign-failure
   facts under that contract. A service consumes the ready capability and owns
   semantic policy.
7. **Outcomes remain honest.** Accepted intent, dispatch, observation,
   consumer acceptance, and final product outcome are distinct facts.
8. **Generated output is evidence.** Generated source, bundles, manifests,
   installed trees, and logs prove only their named stage.
9. **Public surfaces require consumer gates.** A path move does not authorize a
   command, route, SDK export, mod entrypoint, or package identity change.
10. **Deferred is not optional implementation.** A deferred capability remains
    absent until its recorded re-entry trigger is satisfied.

## Durable Vocabulary

| Term | Meaning |
| --- | --- |
| Official game fact | A fact extracted from an identified Civ7 installation or official resource corpus |
| Generated policy | Repo-owned static types, identifiers, or policy derived from official facts |
| Mod definition | Portable authored content and stable mod identity |
| Map definition | Portable domains, recipe, configuration, diagnostics, metrics, trace, and visualization semantics |
| Realization | Environment-qualified rendering, bundling, installation, startup, engine integration, or live proof |
| Preview | Deterministic execution through a non-Civ7 projection; never live-game proof |
| Run operation | A request-correlated, host-scoped Save & Deploy, Run in Game, or autoplay operation with observable state |
| Live observation | Resource-epoch- and time-correlated semantic evidence read from the running Civ7 authority |
| Foundational control | Civ7 interpretation and closed native app/game/map/UI operations over a ready resource, without owning its raw health, epoch, or command facts |
| Play | Actor-facing gameplay observation, checks, requests, reconciliation, no-repeat policy, and next-action meaning composed over foundational control |
| Raw diagnostic | Explicit transport or engine inspection, including raw command results, that makes no semantic gameplay-success claim |
| Receipt | An owner-issued fact about one exact input, transition, effect, or accepted offer |
| Reconciliation | An explicit state used when dispatch or observation cannot prove acceptance or final outcome |

## Capability Registry

The registry names actor-facing capability chains. A chain may contain several
owner-local facts; each card names that split explicitly. The axes below are
the current migration state, not an inferred implementation plan.

| Capability chain | Product authority | Target ownership | Qualified destination admission | Migration | Current proof set |
| --- | --- | --- | --- | --- | --- |
| Official game knowledge | `authorized` | `selected` | `not-applicable` | `current` | `{generated, contract, semantics}` |
| Generic mod authoring | `authorized` | `selected` | `legacy-only` | `hybrid` | `{contract, semantics, generated}` |
| Swooper map definition and generation | `authorized` | `selected` | `partially-admitted` | `hybrid` | `{contract, semantics, execution, projection, generated}` |
| Mod realization and deployment | `authorized` | `selected` | `partially-admitted` | `hybrid` | `{generated, installed}`; no sealed loader or live-behavior proof |
| Foundational live Civ7 control | `authorized` | `selected` | `partially-admitted` | `hybrid` | `{contract, semantics, execution}` plus operation-specific live evidence |
| Civ7 play | `authorized` | `selected` | `qualified-pending` | `hybrid` | `{contract, semantics, execution}` plus operation-specific live evidence |
| Map configuration authoring | `authorized` | `selected` | `partially-admitted` | `hybrid` | `{contract, semantics, projection}` |
| Map realization operations | `authorized` | `selected` | `qualified-pending` | `hybrid` | `{contract, semantics, execution, projection}`; no sealed live-behavior proof |

`partially-admitted` means at least one required Civ7-local destination packet
is closed while another owner or overlay in the same capability chain remains
open. It is not an intermediate proof class and does not imply migration.

### Official Game Knowledge

- **Actor outcome:** an investigator or tool can answer which official Civ7
  identifiers, schemas, relationships, and resources exist in one identified
  source revision.
- **Owner chain:** the qualified extraction command owns the extraction
  receipt; `.civ7/outputs/resources` owns the published source revision;
  generated type and policy packages own their public derived contracts.
- **Explicit non-owners:** Studio, MapGen, adapters, generated output, and
  runtime services.
- **Current realization:** shipped extraction/publication and generated-policy
  chain.
- **Disposition:** `preserve`; repair stale ownership language.
- **Honest outcome:** source identity, extraction/publication receipt, digest,
  and generated-currentness proof. No runtime-behavior claim.

### Generic Mod Authoring

- **Actor outcome:** a mod author can express a complete Civ7 mod definition
  and deterministically render its expected tree and `.modinfo`.
- **Owner chain:** `@mateicanavra/civ7-sdk` owns generic authoring contracts and
  builders; each mod definition owns its product-specific content and identity.
- **Explicit non-owners:** CLI, installer mechanics, realization apps,
  generated output, and the Civ7 loader.
- **Current realization:** shipped SDK and mod definitions.
- **Disposition:** `preserve`; split any remaining definition/runtime hybrids.
- **Honest outcome:** admitted definition and deterministic rendered plan. No
  installation or loader-acceptance claim.

### Swooper Map Definition And Generation

- **Actor outcome:** a map author can author, run, inspect, compare, and explain
  the deterministic Swooper Physics map product outside Civ7.
- **Semantic owner:** `plugins/mod/map/swooper-physics` for product domains,
  Standard recipe, authored configuration, product diagnostics, metrics,
  trace, and visualization; `@swooper/mapgen-core` owns only the reusable
  authoring and execution language.
- **Explicit non-owners:** Civ7 adapter, Studio, CLI, generated map script,
  realization app, and engine readback.
- **Current realization:** the definition/realization split is present and the
  portable definition behavior is current; no Swooper suite is sealed as
  genuine live Civ7 proof.
- **Disposition:** `preserve`; complete definition-boundary and consumer
  cleanup.
- **Honest outcome:** admitted config plus deterministic artifacts, trace,
  metrics, and projection evidence for exact seeds and map size. Browser
  preview is not Civ7 realization.

### Mod Realization And Deployment

- **Actor outcome:** a release operator can materialize, install, replace, and
  verify one exact mod build for Civ7.
- **Semantic owner:** the matching mod realization app, for example
  `apps/mods/map/swooper-physics`.
- **Explicit non-owners:** definition plugin, generic SDK, pure installation
  planner, CLI topic, and generated tree.
- **Current realization:** Swooper has a partial qualified realization; other
  mods remain hybrid.
- **Disposition:** `repair`; move host effects and engine globals to qualified
  realization owners and retire false plugin ownership.
- **Honest outcome:** rendered artifact, exact installation receipt, then a
  separate loader/live acceptance result.

### Foundational Live Civ7 Control

- **Actor outcome:** an operator, integrator, or product capability can inspect
  and control one running Civ7 session through closed app, game, map, and UI
  operations correlated to the resource-supplied epoch, without learning Tuner
  or provider mechanics.
- **Semantic owner:** `services/civ7-control`.
- **Finite module inventory:** exactly `{app, game, map, ui}`.
- **Consumes:** ready `resources/civ7-tuner` and generic window-capture
  capabilities supplied by the realizing app.
- **Explicit non-owners:** Tuner and window-capture resources/providers for
  Civ7 interpretation, `services/civ7-play` for native execution, CLI, Studio
  API/web, MapGen-runs, Swooper live proof, and raw diagnostics.
- **Current realization:** shipped but hybrid with direct-control transport,
  actor-facing play policy, Studio-specific reads, and incomplete setup/map
  observation.
- **Disposition:** `repair`; retain exact native lowering and epoch-correlated
  observation in one public control client, while removing gameplay policy,
  provider mechanics, facade access, and duplicate observations.
- **Honest outcome:** exact Civ7 readiness interpretation, setup, game, map, UI,
  dispatch, and readback facts correlated to the resource-owned epoch, with
  explicit stale, partial, unavailable, refused, and uncertain classifications.
  Raw Tuner health, epoch, and command facts remain resource/provider facts; a
  native semantic fact is not a gameplay recommendation.

### Civ7 Play

- **Actor outcome:** a human or agent can understand the current playable
  situation, check one lawful gameplay choice, perform it, and determine the
  next safe action without repeating an uncertain effect.
- **Semantic owner:** `services/civ7-play`.
- **Finite module inventory:** exactly `{attention, automation, city,
  diplomacy, notifications, progression, planning, turn, unit}`.
- **Consumes:** only the public foundational control capability; it never
  receives Tuner, arbitrary JavaScript execution, provider state, or a private
  control router.
- **Explicit non-owners:** `services/civ7-control` for actor intent and play
  policy, resources/providers, CLI commands, API projections, UI elements, and
  postcondition observers.
- **Current realization:** play-oriented source and CLI language exist, but the
  prior model flattened them beside readiness, setup, world, and view in one
  control service. The current MapGen Studio API also delegates selected frozen
  caller routes to play-owned operations; that caller-specific delegation is
  not a standalone general public Play API.
- **Disposition:** `repair`; reconstruct the actor-facing service around its
  finite module inventory and exact observation/check/request/reconciliation,
  no-repeat, and next-action contracts. Preserve narrower subdomains only
  beneath the outer play authority.
- **Honest outcome:** separate situation, check, request, dispatch,
  postcondition, refusal, uncertainty, no-repeat, and next-action facts. Shared
  live admission is a prerequisite, not evidence of shared product ownership.

### Map Configuration Authoring

- **Actor outcome:** a map author can import, edit, validate, save, and export
  one stable MapGen configuration.
- **Owner chain:** the Swooper definition owns canonical config admission and
  serialization; the qualified app adapter owns source mutation and rollback.
- **Explicit non-owners:** Studio UI, Studio API, MapGen-runs, realization app,
  and generic filesystem package.
- **Current realization:** shipped but spread across definition, Studio
  contract/server, and host files.
- **Disposition:** `repair`; preserve portable config identity and source-write
  receipt while moving effects to the app.
- **Honest outcome:** schema-admitted canonical configuration plus an exact
  durable source-write receipt. Saved is not deployed.

### Map Realization Operations

- **Actor outcome:** a map author or playtester can Save & Deploy, Run in Game,
  adopt, inspect, or cancel one request-correlated realization operation.
- **Semantic owner:** `services/mapgen-runs`.
- **Physical effect owner:** the Studio app's qualified
  `swooper-map-realization` adapter, built from the public Swooper definition
  and pure run-workspace/mod-install packages.
- **Explicit non-owners:** Studio API, Studio host, browser caller, run-files
  adapter, Tuner resource, Swooper definition, and the separate Swooper
  realization app's production Nx targets.
- **Current realization:** shipped inside `packages/studio-server`.
- **Disposition:** `repair`; extract the semantic operation owner and bind its
  exact app-selected dependencies.
- **Honest outcome:** explicit phase and terminal state with config, artifact,
  deployment, setup, fresh-log, and live-readback provenance. Failure,
  cancellation, stale adoption, and uncertainty remain observable.

### Product Surfaces

CLI, Studio web, Studio API, docs, examples, and mod-loader entrypoints are
authorized product surfaces, not additional semantic capability owners.

- `apps/cli` owns one commandless oclif process and topic registration.
- `plugins/cli/topics/*` own command and presentation projections.
- `plugins/server/api/mapgen-studio` owns the Studio caller contract and
  transport projection. Its frozen route ledger may delegate selected
  play-owned routes to the bound play client.
- `plugins/web/app/mapgen-studio` owns browser application views and
  interactions. It may consume the retained `packages/mapgen-studio-ui`
  component library; that package has no selected web-plugin relocation.
- `apps/mapgen-studio` owns its qualified Bun/Vite/server/web composition,
  selected providers and adapters, public-client binding, role mounting, and
  process disposal.
- Docs and examples promise only the public contracts and proof class they name.

The current Studio projection is the only selected API use of the play client
in this cutover. A standalone `plugins/server/api/civ7-play` surface remains a
future-only candidate that requires its own browser or network-agent caller
contract; it is not implied by Studio route delegation.

Raw diagnostics are explicit supporting surfaces, not one semantic product
capability. The Tuner resource defines health, epoch, and raw-command
vocabulary while its selected provider emits the concrete facts. The generic
window-capture resource defines raw image/window evidence while its macOS
provider owns ScreenCaptureKit execution. The control service alone interprets
those facts as
a Civ7 appshot. App restart belongs to the qualified app boundary, and each
projection reports only the exact evidence emitted by its owner. These
surfaces must not be gathered under a new diagnostic service or inherit
gameplay-success semantics.

## Consumer Gates

The exact file and route ledgers remain in [CORPUS.md](./CORPUS.md). This table
names the known consumer class, compatibility disposition, and migration owner;
an unknown external consumer keeps the gate open.

| Public surface | Known consumers | Compatibility disposition | Migration owner and closure |
| --- | --- | --- | --- |
| CLI | Terminal users/agents, scripts, oclif discovery, docs | Retain command discovery, nouns, flags, help, structured output, exit behavior, and dev/production parity | CLI app and each topic plugin; exact command mirrors and help proof close the gate |
| Studio `/rpc` | MapGen Studio browser and any local RPC caller | Each frozen Studio and `civ7.*` route is assigned to control, play, another owner, or retire-with-consumer-proof | Studio API plugin; the 70-route ledger and its exact owner delegations in `CORPUS.md` close together |
| Control, play, and direct-control exports | Game topic, Studio host, MapGen Studio app, Swooper realization/proof, control service, and play consumers | Foundational app/game/map/UI consumers move to the control client; actor-facing gameplay consumers move to the play client; raw escape hatches remain qualified diagnostics | Joint live/play cutover; all facade imports, mixed package imports, and private cross-service edges must reach zero |
| SDK `createMap` | Generated Swooper map entries, SDK tests/types, docs/examples | Reshape runtime behavior into the qualified realization while preserving admitted definition/config semantics | Swooper engine-boundary cutover; generated entrypoint, SDK type, doc, and external-consumer search close the gate |
| Adapter exports | SDK `createMap`, realization compiler, Swooper proof, external SDK callers | Retain pure contract/static/mock; retire concrete engine-global and setup exports | Swooper engine-boundary cutover; package exports and all live-subpath imports reach zero |
| Swooper configuration | Studio authoring, Swooper definition/realization, generated entries, tests | Retain canonical identity, admission, serialization, defaults, map/game seeds, and authored source | Swooper definition plus Studio source adapter; config and source-write proof close separately |
| Mod entrypoints | Civ7 loader, generated files, and production deployment targets | Retain identity, action groups, generated paths, loader entrypoint, compatibility, and target behavior; do not reuse the target as Studio's dynamic materializer | Matching realization app; generated, installation, loader, and live evidence remain separate |
| Generated Civ7 types/policy | SDK, adapters, MapGen, Studio, docs | Retain public identifiers or record a source-backed correction | Official-data generator owners; deterministic regeneration and currentness proof close the gate |
| Docs/examples | Mod authors, tool builders, Playground, canonical links | Update or retire with the public contract they promise | Corresponding capability owner plus docs owner; links and executable examples must resolve |
| Raw diagnostic commands | Game CLI users/scripts and selected Studio diagnostics | Preserve exact bounded evidence; do not translate it into gameplay success | Owning resource or qualified app adapter plus projection; each exact command receives a disposition |
| Package identity | Workspace imports, export maps, registries, docs, generated inputs, external callers | Retain until all known and searched consumers move | Owning cutover; dependency graph, text search, Knip, and build proof close the gate |

## Hybrid Owner Register

| Current hybrid | Target split | Deletion trigger |
| --- | --- | --- |
| `@civ7/direct-control` | Managed Tuner and generic window-capture resources/providers, foundational control service, gameplay service, qualified diagnostics, and app adapters | All live, play, run, and diagnostic consumers use their exact target owner; no facade or convenience surface remains |
| `Civ7ControlOrpcDirectControlFacade` | Delete; its method inventory is parity evidence only and no destination component replaces its shape | Public control and play clients are independently callable; all facade imports, facade-shaped extraction, and private contract picking reach zero |
| `packages/studio-contract` | Portable MapGen config package plus Studio API-owned caller contract | All routes and config consumers have explicit dispositions and the old package has no imports |
| `packages/studio-server` | MapGen-runs service, Studio API projection, and Studio app runtime | Operation state, projection, and host startup each have one owner with parity proof |
| `packages/civ7-adapter` | Portable contract/static/mock package plus realization-local engine-global implementation | No portable consumer imports ambient Civ7 globals or loader/setup code |
| `packages/plugins/plugin-mods` | Pure mod-install planning plus qualified app filesystem adapters | Exact install behavior passes through target owners and package identity has no consumers |
| Dacia mixed mod root | Definition plugin plus realization app | Qualified Civ mod laws exist and both halves preserve loader behavior |
| Remaining `packages/plugins/*` | Classify by actual capability, not name | Each file has `relocate`, `combine`, `inline`, or `delete` disposition and no false plugin remains |

The intelligence bridge/controller island is not a current hybrid. Commit
`8d0d4983ba` deleted its 52 tracked files after preserving native facts in the
engine reference and recording the future-controller re-entry trigger. A
controller mod remains deferred below rather than surviving as a transition
owner.

## Deferred And Excluded Capabilities

| Candidate | Status | Re-entry trigger |
| --- | --- | --- |
| In-game controller mod | `deferred` | A proven same-realm consumer, lifecycle owner, loader boundary, and simpler control path |
| Third `civ7-live` forwarding service | `excluded` | A distinct fact owner, policy, or lifecycle not already owned by foundational control or actor-facing play |
| Public Tuner protocol package | `deferred` | A second independent protocol consumer |
| Generic desktop-app control resource | `deferred` | Two concrete apps share one acquire/use/release capability |
| Durable workflow plugin | `deferred` | A process-independent, resumable, long-running operation with durable retry/replay needs |
| Civ7 HQ API | `excluded` from this cutover | An independent caller boundary requiring a composed control-plane product surface |
| MapGen generation service | `excluded` | A network or process boundary that cannot consume portable MapGen directly |
| Generic catalog resource | `deferred` | A managed foreign catalog with multiple independent consumers and lifecycle |
| MapGen run resource/runtime | `retired` as a target | New evidence that run state is independently acquired rather than service-owned |

## Claims And Proof

| Evidence | Allowed claim | Forbidden claim |
| --- | --- | --- |
| Type/schema tests | Contract admits or rejects the tested values | Runtime or engine behavior |
| Package/service tests | Selected semantics and transitions hold locally | Installation, loader, or live Civ7 behavior |
| Browser preview | Deterministic browser projection matches the tested MapGen truth | Civ7 projection or loader acceptance |
| Generated artifact | Exact source produced the recorded files/digests | Installed or loaded behavior |
| Installation receipt | Exact files replaced the selected Mods tree | Civ7 loaded or executed the mod |
| Fresh logs/readback | The selected runtime emitted the observed evidence | Unobserved gameplay outcome |
| Live proof | The exact build/config/game setup produced the observed behavior | General behavior outside that setup |

## Promotion Ledger

This packet outranks stale project descriptions while the cutover is active.
Stable product vocabulary and proof laws may be promoted immediately. Target
paths and migration-complete claims promote only after the target owner is real
and proven. Promotion destinations are:

- `docs/PRODUCT.md`;
- `docs/system/ARCHITECTURE.md`;
- root and subtree `AGENTS.md` routing;
- `.agents/skills/civ7-product-authority/references/{capability-map,flow-set,policy-map}.md`;
- affected ADRs and durable deferrals.

Do not promote target paths as current behavior before their source, consumer,
and proof gates close.

## Transition Test

The product model is stable enough to open system placement only when:

- every authorized capability assigns every fact and transition in its owner
  chain to one authority with explicit non-owners;
- every current hybrid has a target split and deletion trigger;
- every public surface has a consumer gate;
- every deferred candidate has a re-entry trigger;
- no route, file, package name, vendor, or generated artifact defines product
  meaning; and
- current behavior, accepted target ownership, shared substrate readiness,
  qualified destination admission, migration, and proof remain independently
  visible.
