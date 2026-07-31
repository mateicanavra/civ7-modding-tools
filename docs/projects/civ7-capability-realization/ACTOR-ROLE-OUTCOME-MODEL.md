# Civ7 Actor, Role, And Outcome Model

**Status:** Normative project lens for falsifying product and system models
**Date:** 2026-07-31
**Owner:** Civ7 product stewardship

This model walks external actors through the stable product capabilities in
[PRODUCT-AUTHORITY.md](./PRODUCT-AUTHORITY.md), their system realization in
[SYSTEM-MODEL.md](./SYSTEM-MODEL.md), and the honest results in
[OUTCOME-MODEL.md](./OUTCOME-MODEL.md).

It is a product-outcome lens, not a production actor framework, Serenity/JS
adoption, test fixture taxonomy, or new source ontology.

## Boundary Laws

- An **Actor** is a person or external automation outside the selected Civ7
  Modding Tools boundary that pursues a goal through public product surfaces.
- A **Role** is the contextual posture an actor takes in one scene. It is not
  an actor type, identity, permission, service, or persistent account.
- A **Goal** names the actor outcome independently of channel or container.
- A **Task** changes or advances product state in business language.
- An **Interaction** is a channel-specific leaf action. It may perform a Task
  or obtain evidence for a Question, but those two intents remain distinct.
- A **Question** returns owner facts, typed owner errors, and their proof facts.
  It never creates state or embeds an assertion about what its answer should be.
- A **Supporting observation** is exact evidence supplied by its real resource,
  app, or capability owner. It does not become a generic diagnostic capability.
- An **Ability** is a test-side adapter to a channel. It is not a product
  capability.
- Proof is an independent set of owner facts. A later or live fact does not
  subsume an earlier contract, artifact, installation, or runtime fact.
- CLI, Studio, APIs, services, plugins, workflows, MapGen, providers, Tuner,
  adapters, and app runtimes are inside the system. They are not Actors.
- Civilization VII, the host operating system and filesystem, and remote
  repositories are external authorities or collaborating systems. They supply
  or accept evidence; they are not actors pursuing the product goals below.
- Channel-independent means that product meaning stays stable across
  authorized projections. It does not require every capability to exist in
  every channel.

## External Actors

| Actor | Relationship to the system |
| --- | --- |
| Human Civ7 modding practitioner | Authors, builds, runs, deploys, investigates, verifies, or learns |
| External tool or autonomous agent | Uses public contracts to author, batch, inspect, control, or integrate |

A human and external automation may perform the same Task and ask the same
Question through different authorized channels. Their role is selected by the
scene, not baked into the actor identity.

## Contextual Roles

| Role | Goal |
| --- | --- |
| Official-data investigator | Establish which Civ7 facts are supported by an identified official source |
| Mod author | Express a complete portable mod product |
| Map author | Express and evolve one stable map recipe/configuration |
| Map diagnostician | Explain deterministic map outcomes from artifacts, trace, metrics, and projections |
| Release operator | Materialize and install one exact mod build |
| Run operator | Realize one exact map configuration in Civ7 and follow its operation state |
| Playtester | Exercise one exact installed build in Civ7 and report loader, runtime, and behavior evidence without upgrading its proof class |
| Live observer | Obtain trustworthy current Civ7 evidence without mutation |
| Live decision-maker | Check and perform one lawful native game action |
| Integrator | Consume public contracts without depending on private topology |
| Steward or verifier | Prove currentness, compatibility, boundaries, and named runtime outcomes |
| Learner | Use docs and examples that resolve to current public behavior |

The same actor may change roles within or between scenes. A role does not imply
a permission model, account identity, or service.

## State-Changing Tasks

| Task | Transition owner | State advanced |
| --- | --- | --- |
| Refresh and publish official game facts | Qualified extraction/publication chain | Identified source revision, extracted corpus, publication, and derived generated contracts |
| Define or revise a mod | SDK plus matching mod definition | Admitted authored content and deterministic render plan |
| Define or revise a map | Swooper definition | Admitted recipe, configuration, setup, and seeds |
| Generate a map | Swooper definition plus MapGen core | Deterministic artifacts, trace, metrics, and projections |
| Save an authored map configuration | Swooper definition plus selected app source adapter | Canonical source and exact write or rollback receipt |
| Materialize a mod | Matching realization app | Generated files, manifest, and source-to-artifact digests |
| Install or replace a mod | Matching realization app | Exact installed tree and replacement receipt |
| Start, adopt, or cancel a map realization | MapGen-runs plus matching realization | Request-correlated operation state and effect receipts |
| Request a lawful live-game action | Civ7 control service | Owner-classified native mutation or explicit no-op/refusal/reconciliation |

Reading official facts, inspecting a generated map, observing live Civ7,
checking a native action, examining a receipt, and learning from an example are
Questions or supporting interactions. They do not become state-changing Tasks
to make a surface inventory look complete. A composite surface may perform
several Tasks, but it must preserve every owner-local result and error.

## Fact-Returning Questions

### Owner-Local Questions

Ask only the fact owner:

- Is this definition or configuration admitted?
- Which artifact, observation, operation, or receipt exists?
- Which phase, refusal, failure, or uncertainty is current?
- Which native action was checked, dispatched, or classified as uncertain?
- Is generated policy current for the selected official source?

The answer is the fact, typed owner error, and proof fact. A projection-local
success flag is not an answer.

### Vertical-Chain Questions

Compose facts without inventing a shared writer:

- Which definition and config produced this artifact?
- Which artifact and manifest produced this installed tree?
- Which installation and loader evidence support live acceptance?
- Which request, source write, deployment, setup, log, and readback belong to
  this MapGen operation?
- Which check, dispatch, and postcondition evidence support this live decision
  result?

### Surface Questions

Project only owner answers:

- What owner result fact did this surface return?
- What typed owner error did it return?
- Which owner proof facts and proof class are required to interpret that result
  on this surface?
- What owner refusal, failure, or reconciliation fact determines the next
  lawful action?

These Questions do not ask whether two channels agree. Agreement is an oracle
assertion applied outside the product result.

### Cross-Channel Oracle Assertions

Cross-channel parity is required only when more than one authorized projection
already exists for the same Task or Question. In that case an executable oracle
may assert that:

- the same owner result keeps the same classification in every projection;
- typed owner errors, refusal, and uncertainty are not restyled as success;
- each surface exposes the proof facts needed for the claim it presents, while
  an inspection-oriented surface may expose the full owner result; and
- no projection gains a writer, policy decision, or private transport
  authority.

A capability with one authorized projection needs owner-contract and surface
proof, not a manufactured second channel.

## Supporting Observations

Supporting interactions stay with their exact fact owner:

- Tuner connection health and raw execution return provider-emitted facts under
  the Tuner resource contract;
- Civ7 window capture returns provider-emitted facts under the window-capture
  resource contract;
- app restart and fresh-log reads return their qualified app adapters' attempt,
  readiness, snapshot, and read facts;
- generated artifacts and digests return matching-realization facts; and
- loader signals and engine readbacks remain external evidence interpreted
  only by the exact realization or live capability owner that requested them.

They may answer or qualify an owner Question. They do not form a generic
raw-diagnostic product capability, do not share a placeholder owner, and do
not inherit semantic gameplay-success language.

## Outcome Scenes

### Scene 1: Ground And Author

**Actor:** human practitioner or external automation.

**Roles:** official-data investigator, then mod or map author.

**Goal:** create an admitted definition grounded in current official facts.

```text
inspect or refresh official facts
  -> answer source/currentness Questions
  -> author a definition or configuration
  -> admit and canonically serialize it
  -> answer definition identity and completeness Questions
```

The scene ends at admitted authored truth. It does not claim generated,
installed, loaded, or live behavior. It closes with an admitted definition, an
owner refusal, or explicit unavailable/partial source evidence and the next
Question; it never fills an evidence gap with assumed official truth.

### Scene 2: Generate And Understand

**Actor:** human practitioner or external automation.

**Roles:** map author, map diagnostician.

**Goal:** produce and explain a deterministic map outcome.

```text
select admitted config, map size, map seed, game seed, and setup
  -> run the portable recipe or receive its owner refusal
  -> inspect artifacts, trace, metrics, diagnostics, and visualization
  -> compare targets or prior runs
  -> answer owner Questions about why the outcome occurred
  -> close generated/diagnosed/target-met/target-missed,
     non-deterministic, refused, or evidence-unresolved
```

Browser and static visualizations are projection Questions over MapGen truth.
They do not prove Civ7 realization. Refusal identifies the rejected config or
dependency fact. Contradictory or incomplete evidence remains unresolved with
the next owner Question instead of being styled as a successful diagnosis.

### Scene 3: Realize And Prove

**Actor:** human practitioner or external automation.

**Roles:** release operator, run operator, playtester.

**Goal:** realize one exact authored product in Civ7 and know exactly which
independent proof facts have closed.

```text
select an admitted definition/config
  -> materialize exact files or return the owning refusal/failure
  -> install or replace exact tree, or preserve the prior tree with a receipt
  -> start or adopt request-correlated realization, or refuse it
  -> observe loader/runtime and final-surface evidence
  -> return the independent artifact, installation, loader/runtime,
     and behavior facts that actually exist
  -> close complete, refused, failed-at-owner, or reconciliation-required
```

Save & Deploy and Run in Game may remain ergonomic composite interactions. The
actor still receives distinct source-write, deployment, operation, and live
facts. `materialized`, `installed`, loader/runtime evidence, and final-surface
parity are an independent proof set, not a ladder collapsed to a strongest
depth. A later failure does not erase an earlier receipt, and a later
observation does not manufacture a missing earlier fact. Unknown loader or
behavior acceptance closes as reconciliation with the next owner Question.

### Scene 4: Observe, Decide, Reconcile

**Actor:** human practitioner or external automation.

**Roles:** live observer, live decision-maker, steward or verifier.

**Goal:** make one informed native Civ7 decision without unsafe repetition.

```text
observe epoch-correlated live state
  -> check one semantic action
  -> request the action when lawful
  -> inspect bounded postcondition evidence
  -> accept confirmed/no-op/refused outcome or reconcile uncertainty
  -> choose the next lawful task
```

Tuner health/execution, window capture, app restart, and other supporting
interactions may investigate the boundary through their exact owners. They do
not replace or rewrite the semantic owner result.

## Channel Matrix

| Task family | In-process/SDK | CLI | Studio/API | Civ7 loader/live |
| --- | --- | --- | --- | --- |
| Official facts | Generated types/policy | Data topic | Studio cold read where authorized | Official source only |
| Mod authoring | SDK/definition | - | Authoring projection where selected | Loader is a later consumer |
| Map authoring/generation | Swooper definition/MapGen | MapGen topic | Studio web/API | Realization is separate |
| Mod realization | Realization target | Mod topic invokes target | MapGen-runs invokes target | Loader/live proof |
| Live observation/decision | Control client | Game topic | Studio API/web | Authoritative execution/state |

`-` is intentional: there is no current CLI mod-authoring channel. An empty
cell is allowed. A new projection must reuse the Task and Questions, not copy
private implementation or invent a different result, and it does not create a
parity obligation until more than one authorized projection exists.

## Mechanism Leaks Exposed By The Lens

| Leak | Why it fails the actor model |
| --- | --- |
| Product docs name SDK, CLI, and plugin libraries as capabilities | They are channels or construction roles, not actor outcomes |
| Semantic game commands expose Tuner host/port/provider flags | Provider selection leaks into a Task whose meaning is gameplay |
| Studio contracts expose FireTuner/direct-control payloads | Transport vocabulary replaces the owner Question |
| Merged Studio router appears to own control facts | One network host is mistaken for semantic authority |
| Save & Deploy exposes one undifferentiated success | Source mutation and deployment have different owners and corrections |
| Run in Game succeeds when the route returns | The interaction is mistaken for the realization outcome |
| Preview, generated, deployed, and loaded are used interchangeably | Four proof classes collapse into one claim |
| Tuner health, raw execution, window capture, or app restart uses semantic decision result language | Exact supporting evidence is mistaken for gameplay meaning |
| Check-or-choose interactions collapse Question and Task | Observation can accidentally become mutation |
| A facade extracts method parameters from another surface | Caller topology becomes contract authority |

These are model defects, not requests for additional facade, event, status, or
actor machinery.

## Immediate Executable Evidence Oracle

The first executable oracle is the existing **Explore Live Map** interaction.
It was selected because two authorized current projections already called the
same public owner procedure but disagreed with its honest uncertainty before
the repair:

| Projection | Exact interaction | Owner call |
| --- | --- | --- |
| CLI | `plugins/cli/topics/game/src/commands/game/map/visibility.ts` with `--explore --disposable` | `display.explore.request` |
| Studio | `apps/mapgen-studio/src/app/hooks/useSetupControls.ts#handleExplore` | `display.explore.request` |

The control owner now returns `explored | already-explored | unverified`, plus
its before/after and state-machine proof facts, or a typed owner error. It
reserves `already-explored` for the skipped pre-mutation full-map precondition,
classifies a full run as `explored` only when revealed evidence increases, and
otherwise preserves `unverified`.

Studio now presents `unverified` as uncertainty rather than a green success
toast. CLI structured output preserves the full owner result and derives its
`ok` field from the classification instead of equating a returned value with
success.

The bounded oracle proves this exact current-topology scene:

```text
actor requests Explore for one player
  -> CLI or Studio calls display.explore.request
  -> owner proves already-explored before mutation, explored after increased
     revealed evidence, or unverified when a full run lacks that proof
  -> projection preserves the exact classification
  -> explored/already-explored may be presented as success
  -> unverified is presented as uncertainty with inspect-before-retry guidance
  -> typed owner error is presented as failure, never as a result
```

Focused owner, CLI, and Studio tests assert the three classifications and owner
errors. CLI retains the complete result; Studio presents the classification
and only the evidence needed for its toast-sized claim. This oracle does not
manufacture a full Studio inspection panel. Parity applies here because both
projections were already authorized. The repair added no product entity,
package move, kind law, runtime wiring, alternate transport, or new result
vocabulary. It is a bounded current-topology outcome receipt for the four-model
packet, not an architecture migration and not permission to split the later
control cutover.

## First Structural Migration After Kind Admission

The first structural migration is the complete Swooper realization chain, and
it remains blocked until the usable upstream Habitat pin lands and the
qualified definition/realization kinds are constructible:

```text
admitted Swooper configuration
  -> generated map entrypoint and source/artifact digests
  -> materialized exact tree
  -> installation/replacement receipt
  -> Civ7 loader/runtime evidence
  -> final-surface parity
```

The portable `EngineAdapter` split and realization-local Civ7 adapter are
supporting changes inside that chain. Moving the adapter alone is not a product
migration and must not merge as one. The chain closes every touched consumer,
preserves each proof fact independently, deletes the old owners, and asserts
cross-channel parity only for any final surface with more than one authorized
projection.

The full live-control migration follows later as one whole resource, provider,
service, CLI, Studio API/web, app-runtime, consumer, and old-owner-deletion
chain. The bounded Explore repair neither pre-migrates nor authorizes isolated
pieces of that chain.

## Transition Test

The model is ready to open implementation when:

- each Actor is external to the fixed boundary;
- each Role is contextual and grants no authorization;
- each Task names a capability outcome rather than a route, command, or file;
- every Question traces to owner facts and a named proof class;
- the four scenes terminate in completion, refusal, reconciliation, or an
  actionable next Question;
- multiple authorized projections preserve Task and Question meaning;
- no internal component is treated as an Actor or product capability; and
- the immediate Explore oracle closes both current projections without source
  movement, while the first structural migration remains blocked until its
  whole Swooper chain and destination gates are constructible.
