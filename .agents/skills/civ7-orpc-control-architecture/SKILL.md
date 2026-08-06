---
name: civ7-orpc-control-architecture
description: |
  Use in the Civ7 Modding Tools repo when designing, migrating, or reviewing
  Civ7 oRPC service boundaries, service clients, API projections, app binding,
  or durable-workflow candidates. Trigger phrases include "where should this
  oRPC router live", "is this control or play", "should this service mount
  HTTP", "who acquires the provider", "can this API expose the service router",
  "does this need Inngest", and "remove the facade". This is a Civ7 ownership
  and proof overlay; generic oRPC, Effect, and Inngest mechanisms belong to the
  global dev skills.
---

# Civ7 oRPC Architecture Overlay

## Purpose

Use this skill to place Civ7 service and projection behavior in the accepted
destination model. It owns Civ7-specific semantic boundaries, dependency
direction, mutation safety, and proof classification. It does not teach vendor
syntax, runtime construction, transport setup, Effect lifecycle primitives, or
Inngest APIs.

Ground decisions in the sealed platform packet before following current source:

- `docs/projects/civ7-capability-realization/destination-platform-reference.md`
- `docs/projects/civ7-capability-realization/PRODUCT-AUTHORITY.md`
- `docs/projects/civ7-capability-realization/SYSTEM-MODEL.md`
- `docs/projects/civ7-capability-realization/TOPOLOGY.md`
- `docs/projects/civ7-capability-realization/KIND-LAW-MATRIX.md`

## Vendor Authority

| Need | Load |
| --- | --- |
| oRPC contracts, routers, middleware, clients, handlers, links, or testing | Global `dev:orpc` |
| An Effect computation crossing an oRPC procedure boundary | Global `dev:effect-orpc` and `dev:effect-ts` |
| A genuinely durable workflow | Global `dev:inngest`; also `dev:effect-inngest` when Effect participates |

Those global skills own all generic syntax and lifecycle guidance. Before
selecting any concrete mechanism, identify the installed package tuple from
the workspace manifest and lockfile, inspect that exact package's published
source and declarations, and prove the choice with a discriminating type or
lifecycle fixture. Do not infer an API from another prerelease, a transitive
dependency, or remembered examples.

## Destination Boundaries

### Services

Each service is one semantic authority with a public contract and callable
client over one private complete router. `src/client.ts` is the public caller
and qualified construction face; `src/service/**` is private implementation.
Qualified app composition constructs the bound client and supplies it to API
context when needed. Ordinary consumers receive that client and do not supply
dependencies, extract private types, or import router source.

- `services/civ7-control` owns foundational Civ7 interpretation and closed
  native operations in exactly `{app, game, map, ui}`.
- `services/civ7-play` owns actor-facing gameplay meaning in exactly
  `{attention, automation, city, diplomacy, notifications, progression,
  planning, turn, unit}` and consumes only the public control client.
- `services/mapgen-runs` remains a separate operation authority in exactly
  `{autoplay, operations, run-in-game, save-deploy}`.

Control's `game` module composes explicit native subdomains such as `city`,
`diplomacy`, `notifications`, `player`, `progression`, `turn`, and `unit`; those nouns do
not become peer control modules. Native leaves use `observe`, `check`, and
`send`. A `send` performs one fresh native check and at most one invocation,
then returns exact dispatch evidence and optional same-evaluation
`immediateAfter` readback. A generic operation union or caller-authored
operation name is the deleted facade under another spelling.

Those native action leaves do not own polling, gameplay postconditions,
no-repeat policy, actor-facing `request`, reconciliation, or next action. A
separately named foundational control operation may perform bounded observation
required by its own explicit contract, but cannot replay a mutation or decide
actor meaning. Play may preserve native evidence returned by control, but only
play interprets it as a gameplay outcome. MapGen-runs owns run intent, ordering,
state, correlation,
reconciliation, and final semantic outcome; it does not own portable MapGen
definition truth or app-qualified physical effects.

### API Plugins

An API plugin owns the caller boundary, not another product service:

- `src/client.ts` is the public caller face.
- `src/api.ts` is the public server-registration face.
- `src/service/**` is the private API-owned contract, router, implementation,
  and projection modules.

Every caller-facing contract leaf is API-owned and delegates explicitly to a
matching public service client or exact public capability supplied in context.
The API does not copy a service contract subtree, import a private service
router, acquire a provider, or own service state. The app materializes request
context and mounts the API registration face.

### Apps

Qualified apps select and acquire concrete providers, construct ready typed
resource values and app adapters, bind public service clients, materialize API
context, mount selected plugins and native hosts, observe the process, and
dispose the scope. Services and projections receive only the ready values they
declare. Provider selection, process lifetime, and transport mounting do not
transfer semantic authority to the app.

### Durable Workflows

No Civ7 workflow is selected merely because an operation has several steps.
Admit one only when work must survive a request or process and needs durable
resume, retry, scheduling, waits, replay, fanout, or progress. A workflow calls
public clients, rechecks product authority on re-entry, and reconciles stable
effect identities; it never becomes the writer of service-owned facts.

## Domain Safety

- Keep accepted intent, native dispatch, observation, caller acceptance, and
  final product outcome distinct.
- Preserve stale, partial, unavailable, refused, and uncertain results rather
  than translating them into success.
- An uncertain gameplay mutation retains a no-repeat identity and is reconciled
  through fresh control facts before retry.
- Owner mismatch, proximity, or attack legality is not proof of
  hostile/enemy/opponent/threat status. Require official relationship, team,
  war, suzerain, or equivalent validator evidence.
- Raw resource health, epoch, command, and capture facts remain owned by their
  resource/provider boundary. Control may interpret them into Civ7 meaning but
  does not rewrite them.
- Type, schema, service, projection, assembly, installation, and live-game
  evidence prove different claims. Report only the strongest proof collected.

## Default Workflow

1. Read the sealed model and classify the actor outcome as control, play,
   MapGen-runs, API projection, app composition, or a still-deferred workflow.
2. Load the applicable global vendor skills and complete the exact-source gate
   before choosing an implementation mechanism.
3. Place the operation in one selected module and name its stable input,
   output, failure, uncertainty, and proof boundary.
4. Keep the service contract/client public, the complete router private, and
   all ready dependencies supplied by qualified composition.
5. For a network caller, author an API-owned contract leaf and explicit
   delegation through bound public clients; do not expose service internals.
6. Verify the owning contract, semantics, execution, projection, or assembly
   layer, then label any live evidence separately.
7. Run `references/migration-gates.md` and the bounded residue checks before
   handoff.

## Reference Map

| Reference | Open when |
| --- | --- |
| `references/orpc-server-shape.md` | Placing public/private service, API, and app composition faces |
| `references/civ7-procedure-map.md` | Selecting the owning Civ7 service and finite module |
| `references/migration-gates.md` | Planning or closing a migration slice |
| `references/failure-patterns.md` | Reviewing ownership, safety, or proof drift |

## Asset Map

Use `assets/procedure-slice-preflight.md` as the scratch template for a
non-trivial service or API slice.

## Core Invariants

<invariants>
<invariant name="one-semantic-owner">Control, play, and MapGen-runs retain distinct facts, transitions, and correction laws.</invariant>
<invariant name="native-control-kernel">Control has exactly app/game/map/UI at its root; game nests explicit native subdomains whose leaves are observe, check, or single-dispatch send, never generic operation unions.</invariant>
<invariant name="public-client-private-router">Consumers call public service clients; complete service routers and implementation stay private.</invariant>
<invariant name="apps-compose">Qualified apps acquire providers and supply ready typed dependencies, bound clients, and API context.</invariant>
<invariant name="api-owns-caller-contract">An API owns its caller contract and delegates to bound public clients without copying service authority.</invariant>
<invariant name="play-depends-on-control">Play consumes only the public control capability and never receives a resource, provider, or private control source.</invariant>
<invariant name="uncertainty-survives">Dispatch is not acceptance; uncertainty and no-repeat reconciliation remain explicit.</invariant>
<invariant name="vendor-mechanism-is-source-gated">Concrete vendor APIs are selected only from the exact installed source, declarations, and discriminating fixtures.</invariant>
<invariant name="proof-stays-scoped">Contract, semantics, execution, projection, assembly, generated, installed, and live evidence are not interchangeable.</invariant>
</invariants>
