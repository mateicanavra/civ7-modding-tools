# Civ7 Outcome Model

**Status:** Normative project outcome model for the capability-realization cutover
**Date:** 2026-07-31
**Owner:** Civ7 product stewardship

This model defines what the system may honestly claim after an actor expresses
intent. It walks forward from admitted intent and backward from promised
outcome. It prevents transport success, generated output, dispatch, or an
incidental observation from masquerading as product completion.

This is an analytical model, not a public value specification. Status words,
phase names, and sequences below distinguish facts that must not be collapsed;
they are not exported enums, wire discriminants, error codes, or permission to
rename an existing result. The exact current owner contracts, declared errors,
owner reasons, inputs and revisions, and lawful next actions remain
authoritative. Any change to a public value requires a separate product decision
and its own consumer gate.

## Outcome Laws

1. **Intent is not admission.** Parsing or receiving a request does not prove
   the owning capability accepted it.
2. **Admission is not effect.** A valid plan or authorized transition does not
   prove an external mutation occurred.
3. **Dispatch is not acceptance.** A fire-and-forget Civ7 call, file write, or
   process start does not prove its consumer accepted the effect.
4. **Observation is not authority.** A readback supplies evidence. Only the
   owning capability decides what that evidence means.
5. **Local completion is bounded.** A package, service, projection, or qualified
   adapter may claim only the transition it owns.
6. **Refusal is a product result.** A lawful refusal preserves the deciding
   owner, that owner's exact reason, the exact input or revision, and the lawful
   next action. A projection does not normalize these into a generic failure.
7. **Uncertainty is durable enough to prevent harm.** When an unresolved effect
   could be unsafe or duplicative, the result remains explicit and its retry
   law prevents repetition until the named observation or reconciliation.
8. **Correction belongs to the fact owner.** Projections and consumers do not
   repair another owner's facts.
9. **Questions trace to facts.** Every answer exposed to an actor names the
   independent owner facts and proof classes that support it.
10. **No global success flag.** Product completion is a composition of
    owner-local facts, not a shared boolean or completion tag.

## Universal Outcome Shape

Not every capability performs every transition, but no transition may be
collapsed into its neighbor.

```text
actor intent
  -> request identity
  -> admission decision
  -> owner plan or accepted transition
  -> local effect attempt
  -> effect observation or receipt
  -> consumer acceptance or reconciliation
  -> owner-local product result
  -> actor question and next lawful action
```

Pure authoring may end at an admitted definition or deterministic artifact.
Live control may require dispatch and bounded postcondition evidence. Mod
realization may require generated, installed, loaded, and behaviorally verified
facts. Those facts can coexist, contradict, or be absent independently; they do
not collapse into one strongest status.

## Proof Composition

Proof is a set of independently supported facts, not a scalar level. A result
may include a deterministic artifact fact, an installation receipt, loader
evidence, a live observation, and behavior evidence, each with its own owner,
input or revision, environment, time or epoch, and proof class. Later evidence
does not rewrite an earlier fact, and an absent later fact does not weaken a
fact already proved within its boundary.

A projection may compose this set for an actor, but it must preserve the exact
fact identities and evidence scopes. It must not choose a single "strongest"
fact, manufacture a global success value, or translate owner-specific refusal
and uncertainty into projection-local vocabulary.

## Core Distinctions

| Concept | Owned meaning | Must not be used as |
| --- | --- | --- |
| Request | One actor intent with stable correlation | Admission or completion |
| Admission decision | Owner accepts or refuses exact intent | External effect receipt |
| Plan | Deterministic intended work over supplied facts | Proof that work happened |
| Artifact | Owner-published immutable product of one computation | Engine-current state unless the engine owns it |
| Dispatch | Effect was attempted through the selected capability | Consumer acceptance |
| Observation | Time/revision/epoch-scoped evidence | Owner policy decision |
| Receipt | Owner statement about one exact transition or offer | Broader product outcome |
| Reconciliation | Explicit unknown, stale, partial, or effect-uncertain state | Generic failure or silent retry |
| Product result | Owner-local fact that closes or advances a lawful future | Transport response or projection-local status |
| Question answer | Read projection of authoritative facts | A writer or expectation |

## Capability Outcome Cards

### Official Game Knowledge

**Intent:** refresh or inspect official Civ7 facts.

**Owned facts:**

- identified installation and source roots;
- extracted resource revision and digest;
- publication/submodule revision;
- generated types and policy revision;
- generated-currentness comparison.

**Analytical distinctions:** the currentness comparison may match, the selected
source evidence may have changed, the selected source may be unavailable, the
owning extractor or generator may reject its exact structure, or only a bounded
corpus may have been inspected. These descriptions do not prescribe public
result values. Any refusal preserves the exact owner reason, inspected input and
source revision, and lawful next action from the owning contract.

An identifier in generated TypeScript proves derivation from the selected
corpus. It does not prove that a running game currently exposes or accepts it.

### Mod Definition

**Intent:** author and build one mod definition.

**Owned facts:**

- stable mod identity and metadata;
- admitted authored content and configuration;
- deterministic file plan and `.modinfo`;
- source-to-artifact digest relation.

**Analytical distinctions:** definition admission, owner refusal, exact tree
rendering, and a reproducibility disagreement are separate facts. A refusal
preserves the deciding schema, identity, or policy owner, its exact reason, the
exact definition input or revision, and the lawful next action from that owner.
These distinctions do not rename the definition owner's current contract.

Rendered does not mean installed. Installed does not mean loaded.

### Swooper Map Definition

**Intent:** author or execute one portable recipe/configuration.

**Owned facts:**

- recipe and configuration identity;
- map size, map seed, game seed, and static initial setup;
- stage/step/operation selection and normalized configuration;
- published artifacts;
- trace, metrics, diagnostics, and visualization projections.

**Analytical distinctions:** admitted configuration/setup, owner refusal,
deterministic generation for exact inputs, metric evidence about a named target,
and diagnostic evidence explaining an observed product outcome remain separate.
The metric and diagnostic owners preserve their current exact contracts. A
refusal preserves the owning policy's exact reason, exact configuration or graph
revision, and lawful next action from that policy owner.

Map artifacts are pipeline truth. An engine readback is a separate observation
and may expose projection drift.

### Mod Realization

**Intent:** materialize and deploy one exact mod definition.

**Owned facts:**

- definition and config provenance;
- generated tree and manifest;
- installation plan and exact replacement receipt;
- loader/runtime evidence for the selected Civ7 setup.

**Independent proof facts:**

- a materialization fact identifies the exact definition, inputs, generated
  tree, and manifest;
- an installation fact identifies the exact tree and replacement receipt;
- loader evidence identifies the selected Civ7 setup and observed acceptance;
- behavior evidence identifies the exact build, configuration, environment,
  and observed behavior.

These facts may have prerequisite relationships, but they do not form one
scalar public status. Contrary or absent loader or behavior evidence does not
erase a materialization or installation fact. A surface reports the complete
supported set and each fact's evidence boundary rather than selecting a
"strongest completed" label.

### Live Observation

**Intent:** inspect the current running Civ7 state.

**Owned facts:**

- connection/session epoch;
- observation time and source;
- requested state or layer;
- completeness and freshness;
- exact payload or typed failure.

**Analytical distinctions:** an observation can be complete and fresh, stale,
partial, not ready at the selected epoch, unavailable from its source, or
rejected by the owning observation contract. The owner's current typed payload
and failure vocabulary remain exact; this sentence defines no replacement
status set. A refusal preserves the exact owner reason, exact requested input,
revision, epoch, or observation time, and lawful next action from the observation
owner.

Observation never mutates and never implies that a prior command caused the
observed state unless correlation evidence proves it.

### Live Decision

**Intent:** check or perform one semantic gameplay action.

**Owned facts:**

- check input and native legality result;
- request correlation and no-repeat key;
- exact native command attempted;
- dispatch classification;
- bounded postcondition evidence;
- next lawful action.

**Analytical distinctions:** the action may remain undispatched because
admission or the native check refused it; dispatch plus bounded evidence may
confirm the intended postcondition; dispatch may occur while owner policy guards
against further mutation; dispatch may remain unverified; or observation may
show the requested outcome already held without mutation. These are semantic
distinctions, not a replacement public union. Every refusal preserves the exact
service or native-check reason, request input/revision, and lawful next action;
every uncertain dispatch preserves the no-repeat instruction.

Check and request remain distinct operations. A caller may present both, but it
cannot turn a check into a mutation or treat dispatch as confirmation.

Raw transport execution, Tuner health, screenshot capture, restart, and other
diagnostic observations are not a generic capability card. Each remains
supporting evidence owned by its resource, provider, service, or qualified app
adapter and projected with that owner's exact contract. No shared diagnostic
status or semantic gameplay result is inferred from them.

### Authored Map Configuration

**Intent:** import, edit, save, or export one MapGen configuration.

**Owned facts:**

- canonical config identity and serialization;
- admitted values and defaults;
- prepared source write;
- exact write or rollback receipt.

**Analytical distinctions:** config admission, owner refusal, an exact source
write, an exact rollback, and uncertainty about a write are distinct facts.
They do not define a new public status set. A refusal or uncertain write
preserves the exact deciding owner, owner reason, config/source revision, and
lawful next action from that owner.

Saving source does not deploy or run the configuration.

### Map Realization Operation

**Intent:** Save & Deploy, Run in Game, autoplay, adopt, inspect, or cancel.

**Owned facts:**

- stable operation and request identity;
- admitted authored config and snapshot;
- current phase and timestamps;
- materialization, source-write, deployment, and setup provenance;
- correlated logs and live readback;
- cancellation, retention, and adoption state.

**Analytical phase distinctions:** an operation can separately perform
admission, preparation, source saving, materialization, deployment, startup,
observation, and reconciliation before reaching its owner-local terminal fact.
Not every operation performs every distinction, and this sequence is not a
public phase enum. The exact current MapGen-runs contract, phases, terminal
values, declared errors, and reasons remain authoritative. Every refusal
preserves the deciding owner, exact reason, config/snapshot/request revision,
and lawful next action. The UI may combine actions but must preserve each owner
receipt and rollback boundary.

## Negative-Space Review

The current product estate exposes these gaps or collapsed distinctions:

| Gap | Required correction |
| --- | --- |
| CLI or RPC return used as success | Project the owner-local result and the complete set of independently supported proof facts; transport success is invisible to product meaning |
| Dispatch used as gameplay acceptance | Preserve owner distinctions among refusal before dispatch, confirmed effect, guarded mutation, unverified dispatch, and no-repeat policy without renaming current values |
| Browser preview treated as Civ7 proof | Keep preview and realization evidence separate |
| Generated tree treated as deployment | Require a distinct exact installation receipt |
| Installed tree treated as loader acceptance | Require fresh loader/runtime evidence |
| Studio route owns operation state | Move facts, adoption, cancellation, and policy to MapGen-runs |
| Save & Deploy represented by one undifferentiated status | Preserve source-write, deployment, rollback, and final operation facts |
| Studio-specific live reads duplicate service facts | Project the control owner's observation contract |
| Owner-specific diagnostics collapsed into one result vocabulary | Keep each observation bound to its resource, provider, service, or qualified-adapter owner and exact contract |
| Completion/effect tags restate artifact or engine facts | Delete derived tags; retain only facts that change a lawful future |
| Static options read through live adapter | Admit initial setup once as immutable setup authority |
| A stale artifact mirrors mutable engine state | Read current engine layers through the qualified adapter instead |
| Retry follows uncertain external dispatch | Record reconciliation and prevent unsafe repetition |

These are not requests for a generic event ledger, global status enum, new
outcome service, or renamed owner contract. Each correction belongs to the
capability that owns the fact and preserves that owner's exact reason and lawful
next action.

## Effect And Event Closure

Artifacts remain declared write-once products of portable computation.
External effects remain owner-local transitions.

- A step declares the artifacts and engine capabilities it requires.
- Artifact publication is the only artifact admission transition.
- Engine method authorization does not prove semantic completion.
- A semantic completion fact exists only when it changes a downstream lawful
  future and cannot be derived from an artifact or owner observation.
- An adapter may record exact method execution evidence, but the semantic owner
  decides whether the multi-call action completed.
- No parallel effect/event tag ledger revalidates facts already admitted by the
  artifact store or engine observation owner.

This preserves useful semantic completions without turning every method call
into a second dependency graph.

## Question Surfaces

Every product question may require one or more of three independent views:

1. **Owner-local:** What fact, decision, phase, refusal, or uncertainty does the
   semantic owner currently hold?
2. **Vertical-chain:** Which upstream facts and downstream receipts establish
   the end-to-end result?
3. **Surface:** Can this channel faithfully present the same task and answer
   without changing ownership or meaning?

A surface may answer a vertical question by composing independently supported
facts. It may not rank them into one strongest result or create a missing owner
fact.

## Transition Test

The outcome model is stable enough for the actor/role pass when:

- every admitted intent ends in an owned result, lawful refusal,
  reconciliation state, or actionable question;
- every refusal preserves its exact owner, owner reason, input or revision, and
  lawful next action;
- every external effect distinguishes plan, dispatch, observation, and
  acceptance;
- generated, installed, loaded, and behavior-verified remain independent facts
  rather than a strongest scalar status;
- every uncertainty has a safe next action and retry law;
- every promised answer traces to owner facts and a named proof class;
- analytical labels do not replace or extend current public contracts without a
  separate product decision;
- no global success flag, completion tag, route response, or projection status
  substitutes for owner truth; and
- no new generic outcome machinery is needed to express the model.
