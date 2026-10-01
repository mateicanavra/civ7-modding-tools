---
name: civ7-orpc-control-architecture
description: |
  Use in the Civ7 Modding Tools repo when designing, migrating, or reviewing
  Civ7 oRPC service boundaries, service clients, API projections, app binding,
  or durable-workflow candidates. Trigger phrases include "where should this
  oRPC router live", "is this controller or Play", "should this service mount
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

- `docs/projects/civ7-capability-realization/PRODUCT-AUTHORITY.md`
- `docs/projects/civ7-capability-realization/SYSTEM-MODEL.md`
- `docs/projects/civ7-capability-realization/OUTCOME-MODEL.md`
- `docs/projects/civ7-capability-realization/TOPOLOGY.md`
- `docs/projects/civ7-capability-realization/WORKSTREAM.md`

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
The controller mod app constructs the in-engine service; qualified host apps
bind its public client through a narrow Tuner-backed transport and supply that
client to callers or API context. Ordinary consumers receive the client and do
not supply dependencies, extract private types, import router source, or know
the transport.

- `services/civ7-controller` owns typed native operations executed inside Civ7.
  Its root groups follow the official runtime realms and APIs; narrower gameplay
  nouns stay nested beneath the gameplay group.
- `services/civ7-play` owns actor-facing gameplay meaning in the modules proven
  by baseline behavior and consumes only the public controller client.
- `services/mapgen-runs` remains the separate request-correlated run-operation
  authority.

The controller's gameplay group composes explicit native subdomains such as `city`,
`diplomacy`, `notifications`, `player`, `progression`, `turn`, and `unit`; those nouns do
not become peer platform modules. Native leaves use `observe`, `check`, and
`send`. A `send` performs one fresh native check and at most one invocation,
then returns exact dispatch evidence and optional same-evaluation
`immediateAfter` readback. A generic operation union or caller-authored
operation name is the deleted facade under another spelling.

Those native action leaves do not own polling, gameplay postconditions,
no-repeat policy, actor-facing `request`, reconciliation, or next action. A
separately named controller operation may perform bounded observation
required by its own explicit contract, but cannot replay a mutation or decide
actor meaning. Play may preserve native evidence returned by the controller,
but only Play interprets it as a gameplay outcome. MapGen-runs owns run intent, ordering,
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
  through fresh controller facts before retry.
- Owner mismatch, proximity, or attack legality is not proof of
  hostile/enemy/opponent/threat status. Require official relationship, team,
  war, suzerain, or equivalent validator evidence.
- Raw Tuner health, epoch, and command facts remain owned by their
  resource/provider boundary. Window capture remains separate diagnostic/app
  evidence. Neither is a controller dependency.
- Type, schema, service, projection, assembly, installation, and live-game
  evidence prove different claims. Report only the strongest proof collected.

## Default Workflow

1. Read the sealed model and classify the actor outcome as Controller, Play,
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
<invariant name="one-semantic-owner">Controller, Play, and MapGen-runs retain distinct facts, transitions, and correction laws.</invariant>
<invariant name="native-controller-kernel">Controller TypeScript executes inside Civ7, exposes realm/boot identity, and nests explicit native gameplay subdomains whose leaves are observe, check, or single-dispatch send, never generic operation unions.</invariant>
<invariant name="public-client-private-router">Consumers call public service clients; complete service routers and implementation stay private.</invariant>
<invariant name="apps-compose">The controller mod app constructs the in-engine service; qualified host apps acquire providers and bind its public client without regenerating operation bodies.</invariant>
<invariant name="api-owns-caller-contract">An API owns its caller contract and delegates to bound public clients without copying service authority.</invariant>
<invariant name="play-depends-on-controller">Play consumes only the public controller client and never receives a resource, provider, transport, or private controller source.</invariant>
<invariant name="raw-execution-is-diagnostic">Caller-authored JavaScript exists only behind an explicit qualified diagnostic adapter and never implements a mature Controller, Play, or MapGen-runs operation.</invariant>
<invariant name="uncertainty-survives">Dispatch is not acceptance; uncertainty and no-repeat reconciliation remain explicit.</invariant>
<invariant name="vendor-mechanism-is-source-gated">Concrete vendor APIs are selected only from the exact installed source, declarations, and discriminating fixtures.</invariant>
<invariant name="proof-stays-scoped">Contract, semantics, execution, projection, assembly, generated, installed, and live evidence are not interchangeable.</invariant>
</invariants>
