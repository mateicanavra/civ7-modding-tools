# Civ7 Actor, Role, And Outcome Model

**Status:** Normative product lens
**Date:** 2026-08-06
**Owner:** Civ7 actor and outcome stewardship

This model walks external actors through the platform. Components are not
actors. Tuner, a controller, a service, a workflow, an API, and an app can own
facts or transitions, but they do not have product goals.

## Boundary Laws

1. An actor is external to the system and enters in a contextual role.
2. A role has a goal, not an implementation preference.
3. A state-changing task ends in an owner-issued result or refusal.
4. A fact-returning question identifies subject, source, time, and
   completeness.
5. Channel success does not impersonate product success.
6. A product scene crosses owners through public relationships only.
7. Raw diagnostics are a qualified operator role, not the default path for
   ordinary actors.

## Actors And Contextual Roles

| Actor | Contextual role | Goal |
| --- | --- | --- |
| Human developer | Official-data investigator | Establish what Civ7 exposes in an identified revision |
| Human developer | Platform maintainer | Extend or repair one owned capability without reviving a hybrid owner |
| Modder | Mod author | Express portable Civ7 content and inspect its rendered definition |
| Release operator | Mod realizer | Materialize, install, and prove one exact mod build |
| Map author | Swooper author | Author, preview, compare, and explain deterministic map behavior |
| Map playtester | Run operator | Realize one exact map config in Civ7 and follow its outcome |
| Human player | Player | Understand the current situation and pursue a lawful gameplay goal |
| Agent | Player-agent | Observe, decide, act, reconcile, and continue without unsafe repetition |
| Trusted developer | Diagnostic operator | Inspect Tuner or execute deliberate JavaScript without semantic promotion |

The same person may occupy several roles. Authority changes with the role; it
does not leak between them.

## Questions And Tasks

### Official-Data Investigator

- Which API, identifier, schema, runtime realm, or loader facility exists?
- From which official revision and evidence source was it derived?
- Is the generated API current, state-qualified, and provenance-complete?

Refusal is correct when the corpus, realm, or provenance cannot support the
claim.

### Mod Author

- Is this definition admitted?
- What exact tree and modinfo will it render?
- Which facts are portable, and which belong to target realization?

The author does not install files or claim loader acceptance through the
definition.

### Mod Realizer

- Which exact artifact was generated?
- Was the target replaced by that artifact?
- Did Civ7 load it?
- Which independent live oracle proves the intended behavior?

Installation without loader or behavior evidence remains incomplete.

### Swooper Author

- Is this config canonical and admitted?
- Which domains, operations, strategies, artifacts, and evidence produced the
  map?
- Is the result deterministic for the exact seeds and dimensions?
- How does a preview differ from Civ7 realization?

### Run Operator

- Was the exact config saved or only held transiently?
- Which operation owns the request and current phase?
- Which artifact and install receipts exist?
- Did the current controller launch the game and produce fresh readback?
- Is the operation confirmed, cancelled, refused, failed, or uncertain?

### Player Or Player-Agent

- What situation is currently observable?
- Which goal or action is lawful now, and why?
- Was the action refused before dispatch, dispatched once, later confirmed, or
  left uncertain?
- May it be repeated safely?
- What is the next lawful action?

The actor does not choose Tuner state, author JavaScript, or interpret provider
epochs. Those are system mechanics hidden behind public controller and Play
clients.

### Diagnostic Operator

- Which Tuner states and epoch exist?
- What exact JavaScript was submitted and what raw value returned?
- Did transport fail before or after possible execution?
- Should a proven prototype graduate into the controller?

Diagnostic output never claims a controller or gameplay result.

## Outcome Scenes

### Scene 1: Establish Official Truth

```text
investigator
  -> extraction/update projection
  -> exact installed official corpus
  -> published source revision
  -> generated state-scoped API and policy
  -> provenance/currentness result
```

The scene ends at generated authority. It does not prove a running game.

### Scene 2: Author And Preview A Map

```text
map author
  -> Swooper definition
  -> admitted canonical config
  -> deterministic MapGen execution
  -> artifacts, trace, metrics, visualization
  -> author explanation
```

The browser worker is a projection of this scene, not a second owner.

### Scene 3: Realize A Mod

```text
release operator
  -> portable definition
  -> qualified mod app
  -> exact generated artifact
  -> exact installation receipt
  -> Civ7 loader evidence
  -> independent behavior oracle
```

Each arrow has a separate receipt and refusal.

### Internal Handoff: Reach A Controller Instance

This is not an actor scene. It is the system handoff nested inside a Play, run,
or diagnostic scene.

```text
host app
  -> acquire Tuner provider
  -> discover current App UI state
  -> probe controller version, realm, and boot identity
  -> bind controller public client
  -> ready controller result
```

Shell-to-loading-to-game replaces the document. A new scene begins with fresh
discovery; stale controller identity is refused.

### Scene 5: Play One Decision

```text
player or agent
  -> CLI/API projection
  -> Play situation and check
  -> admitted actor request
  -> controller fresh native check
  -> at-most-once dispatch
  -> later Play observation and reconciliation
  -> next action or no-repeat refusal
```

The controller owns native facts. Play owns the actor result. The projection
only communicates it.

### Scene 6: Diagnose Or Prototype

```text
trusted developer
  -> explicit diagnostic command
  -> app-owned raw Tuner adapter
  -> exact JavaScript and raw response
  -> audit record
  -> either discard or graduate proven behavior into controller TypeScript
```

This scene is intentionally separate from ordinary control and Play.

### Scene 7: Run A Map In Civ7

```text
map playtester
  -> Studio API
  -> MapGen-runs accepted request
  -> canonical config and generated artifact
  -> qualified installation
  -> public controller client for launch/setup
  -> fresh logs and live readback
  -> terminal correlated outcome
```

The Studio web app may reload and adopt the operation, but it does not become
the operation owner.

## Channel Matrix

| Channel | May do | Must not do |
| --- | --- | --- |
| CLI | Compose public clients, expose diagnostics explicitly, format owner results | Acquire private routers, hide uncertainty, implement product semantics |
| Studio API | Own caller contract, auth/policy, transport metadata, projection | Own MapGen run state or native controller operations |
| Studio web | Present views, submit intent, adopt operations | Infer owner state from loose files or transport success |
| Controller mod | Realize controller router in Civ7 realms | Own Play policy or host lifecycle |
| Mod loader | Load declared scripts and content | Prove semantic behavior by itself |

## Actor-Lens Defects In The Baseline

- `packages/civ7-direct-control` grouped mechanics by implementation
  convenience rather than actor outcome.
- `services/civ7-control` contained both foundational native behavior and Play
  decisions because both used Tuner.
- CLI and Studio bypassed semantic owners for convenience reads and commands.
- A facade mirrored the mixed package instead of exposing owned service
  clients.
- Studio hosting, API projection, run state, and host effects were bundled into
  one package.
- Generated and installed map evidence could be reported before live behavior
  had been proven.

These are product-model defects, not folders to preserve.

## Smallest Refusals

- No actor or role: no product capability is admitted.
- No independent owner result: the scene is wiring, not an outcome.
- No source/time/completeness on a fact: the question is unanswered.
- No distinction between dispatch and outcome: the mutation contract is
  dishonest.
- No qualified diagnostic role: raw execution is refused.
- No current controller identity: live operation is refused before dispatch.

## Transition Test

Every preserved baseline behavior must fit one scene without adding a facade,
shared writer, hidden lifecycle, or alternate mature execution path. A
capability that cannot name its actor, role, owner result, and refusal is not
ready to drive source migration.
