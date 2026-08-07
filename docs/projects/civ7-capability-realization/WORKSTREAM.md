# Civ7 Capability Realization Workstream

**Status:** Final descent; Controller Foundation admission active
**Date:** 2026-08-06
**Owner:** Civ7 migration director

## Objective

Realize the Civ7 modding platform on the shared Habitat substrate as one
cohesive set of product capability chains. Each container closes one complete
semantic story, removes the displaced mechanism, and leaves stronger ground for
the next container.

The destination authority is read in this order:

1. [Actor, Role, And Outcome](./ACTOR-ROLE-OUTCOME-MODEL.md)
2. [Product Authority](./PRODUCT-AUTHORITY.md)
3. [System Model](./SYSTEM-MODEL.md)
4. [Outcome Model](./OUTCOME-MODEL.md)
5. [Topology](./TOPOLOGY.md)
6. [Source Reconciliation](./SOURCE-RECONCILIATION.md)
7. [Public Surface Disposition](./PUBLIC-SURFACE-DISPOSITION.md)

## Director Frame

### Attractor Cubes

- Meaning: Actor. Intent. Outcome. Refusal. Trust.
- Structure: Owner. Boundary. Direction. Lifecycle. Closure.
- Descent: Ground. Chain. Ratchet. Delete. Seal.

### Layer Weight

The platform moves from slow, trusted foundations toward flexible interaction:

```text
official knowledge
  -> packages and resource contracts
  -> providers and services
  -> definitions and projections
  -> apps and workflows
  -> actor interaction
```

An upper layer may compose lower authority. It may not reinterpret ownership or
push actor policy downward for convenience.

## Stack Law

This initiative uses one active linear Graphite stack only:

```text
agent-root-civ7-habitat-051-ground
  -> ...
  -> agent-root-civ7-live-refusal-ground
  -> future semantic cuts
```

The Fluree branches and worktrees are external parked workstreams. They are not
restacked, edited, folded, or merged by this initiative. Review agents provide
evidence in the shared worktree; they do not create implementation branches.

Every branch is one sealed semantic cut. A branch is not created merely to
record motion, and Graphite is not synced between individual downstream merges.
The stack is swept after a contiguous merge run.

## Container 0: Model Ground

**Purpose:** prevent transition code from choosing the platform model.

**Inputs:** exact pre-substrate estate at
`fd60a16ad7605ad34c8afa9668aa847b52931022`, official Civ7 resources, current
vendor contracts, actor outcomes, and direct product-owner decisions.

**Outputs:** internally consistent Product, System, Outcome, Actor/Outcome,
Topology, Source Reconciliation, and exact Public Surface Disposition
authorities.

**Required decisions:**

- generated official knowledge, controller, host access, Play, and raw
  diagnostics are distinct authorities;
- controller TypeScript executes inside Civ7 shell/game App UI realms;
- Tuner owns foreign lifecycle and transports bounded envelopes;
- Play consumes only the public controller client;
- `packages/civ7-direct-control` and its facade have no destination;
- the deleted controller experiment is neither product nor implementation
  authority.

**Seal:** product, system, outcome, runtime-realm, vendor, and topology reviews
agree; every baseline behavior has one disposition; the owner graph is acyclic;
the final descent is resequenced against this model.

## Container 1: Controller Foundation

This is the structural Jenga piece. It proves the selected execution model
without first porting the entire live-control estate.

### 1.1 Official API Authority

Replace partial ambient knowledge with a systematic, state-scoped,
provenance-bearing Civ7 API generation chain. The complete accessible official
corpus is classified; unknown and runtime-only facts remain explicitly marked
rather than hidden behind wildcard `any`.

`apps/civ7-api-materializer` owns the one-shot host process: installed-root
selection, exact staged `Base`/`DLC` acquisition, source/install identity,
snapshot comparison, deterministic projection, and physical replacement. It is
an `app@1` realization, not a scripts drawer, CLI-topic owner, or reusable
package invented without a second consumer. `packages/civ7-api` owns only the
emitted static authority.

**Seal:** exact source revision, deterministic generation, provenance and
currentness proof, state-qualified exports, no competing handwritten API
authority. The complete production project is the first `runtime:civ7-v8`
member and activates the qualified closure with executable counterexample
proof; an API package mixing host generation code with emitted authority must
split before admission.

### 1.2 Controller Service Kernel

Construct the smallest complete service authority:

```text
contract -> private router/implementation -> public client
```

Its first operation set is identity/readiness only: API version, realm, boot
identity, lifecycle state, and a typed ping. It is not an empty scaffold and it
does not claim gameplay capability.

**Seal:** native oRPC/Effect construction under shared `service@1`, qualified
Civ7 contract and semantic proof, and an active `runtime:civ7-v8` closure. The
controller and generated API projects carry that tag. The same cut records and
proves the exact isolate-compatible vendor imports actually used by the
kernel; qualified Habitat/Grit law closes production source and categorically
refuses `node:` and `bun:` imports. Host/Tuner code cannot enter by omission or
by an ever-growing denylist.

### 1.3 Controller Mod Realization

Create the portable controller mod definition and qualified mod app. The
tagged definition owns the shell/game registrations, realm-local bootstrap,
and versioned global ingress around the controller router. The untagged host
app bundles that definition with the service, installs the exact artifact, and
keeps build, install, load, and live receipts separate.

The portable controller definition carries `runtime:civ7-v8` only when its
whole production project is isolate-admissible. The mod app does not: it owns
host build, install, and live proof. Any project mixing those two realms must
split before admission rather than receive an exception.

### 1.4 Host Typed Ingress

Bind the controller-owned public client to a narrow Tuner-backed transport in
each qualified host app. The transport carries envelopes, correlation,
realm/boot checks, and only the completion mechanism selected by live proof. It
does not contain operation implementations and is not a facade or new resource.

### 1.5 Live Realm Proof

Record shell publication, every loading observation, game publication,
return-to-shell behavior, all boot/global transitions, idempotent bootstrap
behavior, Tuner state discovery, Promise handling, continued async work, and
later global visibility. Select direct completion or a mailbox only from that
evidence.

**Container seal:** a caller invokes typed ping/identity through the public
client in both shell and game and receives exact realm evidence. The raw
diagnostic path remains separate.

## Transition Quarantine

Existing host-injected operations may remain temporarily while Container 1
lands. They are quarantined by these laws:

- they keep their old consumers until an entire capability slice migrates;
- they do not implement, wrap, or masquerade as the new controller client;
- no new mature operation is added there;
- no aggregate switchboard combines old and new implementations;
- each migrated vertical deletes its host-generated implementation and consumer
  edge in the same semantic cut;
- raw JavaScript survives only in the explicit diagnostic adapter after the
  last mature operation leaves.

Quarantine is sequencing, not architecture. It has a finite deletion receipt
and receives no new public law beyond containment.

## Container 2: Controller Capability Burndown

Port the already classified native capability verticals from
[PUBLIC-SURFACE-DISPOSITION.md](./PUBLIC-SURFACE-DISPOSITION.md) in dependency
order. Container 2 may refine implementation grouping from official Civ7
domains, but it may not defer or reopen semantic ownership.

Each vertical contains:

```text
generated official API evidence
  -> controller contract
  -> in-engine TypeScript implementation
  -> controller behavior proof
  -> typed host invocation proof
  -> complete consumer migration
  -> deletion of host-generated implementation
```

The descent proceeds from observation and readiness, through shell/game setup
and lifecycle, then map/UI evidence, then native gameplay operations. Gameplay
nouns remain nested below the controller's game authority.

**Per-vertical seal:** focused Habitat, TypeScript, Effect diagnostics, Biome,
behavior tests, import boundaries, and exact consumer/dead-code proof pass
before the next vertical begins.

**Container seal:** all mature native operations execute in Civ7; only the
audited raw diagnostic still sends caller-authored JavaScript.

## Container 3: Civ7 Play

Reconstruct Play from actor scenes rather than moving legacy service modules.
Play consumes only the public controller client.

The service owns situation, attention, actor checks, intent admission,
multi-operation coordination, post-dispatch observation, reconciliation,
no-repeat, and next action. City, diplomacy, government, narrative,
notifications, progression, strategy, turn, and unit are Play modules only
where baseline behavior proves an actor-facing capability.

**Seal:** every retained gameplay command reaches Play, every Play operation
uses public controller facts, uncertain dispatch cannot repeat, and no Play
source imports Tuner, provider state, raw execution, or private controller code.

## Container 4: Interactive Platform

### 4.1 Host Composition

The CLI and Studio apps select providers, acquire/release resources, bind
controller and Play clients, mount projections, and drain their scopes. Topic
plugins and APIs remain projections.

### 4.2 MapGen-Runs

Extract accepted operation intent, phase state, adoption, retention,
cancellation, autoplay exclusion, diagnostics, and terminal reconciliation from
the Studio hybrid. Qualified Studio adapters own source writes,
materialization, installation, process, and log effects.

### 4.3 Studio API And Web

Preserve the actual caller contract and one-host behavior while implementing
the owner assignments already frozen in
[PUBLIC-SURFACE-DISPOSITION.md](./PUBLIC-SURFACE-DISPOSITION.md). Remove
duplicate live observations and private router mounting; no route ownership is
decided during this container.

### 4.4 Live Run Closure

Re-run the failed Studio realization with the current Civ7 application and
resource revision. Separate setup admission, controller readiness, map loading,
map-generation behavior, logs, and readback. Repair the owner that actually
fails; do not compensate in the projection.

### 4.5 Direct-Control Deletion

Prove zero consumers, delete `packages/civ7-direct-control`, its facade,
compatibility types, old tests, stale rules, and all mature host-generated
operation bodies. Preserve only the qualified raw diagnostic surface.

**Container seal:** CLI and Studio use the same public semantic clients, the
live run has an honest terminal outcome, and the false package is absent.

## Container 5: Mod Products

### 5.1 Swooper Seal

Retain the already completed definition/realization split. Close remaining
live map behavior, generated API/currentness, adapter boundary, and Studio run
proof without reopening portable authorship.

### 5.2 Dacia Product

Apply the proven grammar: portable definition plugin, qualified realization
app, exact install receipt, loader evidence, and independent behavior proof.
Do not copy Swooper-specific policy.

## Container 6: Estate Reconciliation

Resolve remaining false packages, plugins, apps, stale authorities, duplicated
schemas, obsolete tests, local vendor guidance, and dead rules. Every subject
receives preserve, correct, retire, or explicit defer-with-trigger disposition.

This is semantic cleanup after normalized product planes exist. It is not an
opportunity to invent generic owners for isolated helpers.

## Container 7: Platform Seal

- update canonical product, system, process, and domain docs;
- remove consumed notes and superseded project artifacts;
- run complete Nx proof with Habitat, boundaries, TypeScript, Biome, Effect
  diagnostics, Knip, tests, builds, and generated-currentness;
- run product, system, outcome, testing, vendor, runtime, dead-code, and
  documentation reviews;
- run live controller, Play, Swooper, Studio, and mod-loader proofs at their
  honest confidence axes;
- submit and merge the single linear Graphite stack bottom to top;
- after the contiguous merge run, sweep merged branches and detached worktrees
  with the repository's documented non-interactive Graphite process.

## Continuous Ratchet

Habitat and the ordinary Nx graph run during construction, not only at the end.
Before each semantic branch is created:

1. the destination law is active;
2. the focused red corpus is exact;
3. implementation burns violations to zero;
4. product behavior and independent proof pass;
5. displaced code and guidance are deleted;
6. the worktree and branch tell one complete story.

If a generic check orchestration capability is missing, it is proposed to the
Habitat owner as a sealed upstream container. Civ7 does not fork the substrate
while waiting.

## Stop Conditions

Stop and return to the model when:

- a component cannot name one actor outcome or semantic authority;
- a resource has no real acquire/use/release lifecycle;
- a service edge becomes reciprocal;
- a projection needs private implementation access;
- controller and Play meaning begin to merge;
- old and new mature paths require a permanent switchboard;
- live proof contradicts the controller realm model;
- a shared Habitat limitation tempts a local copy of generic law.
