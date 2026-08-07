# Civ7 Outcome Model

**Status:** Normative destination model
**Date:** 2026-08-06
**Owner:** Civ7 outcome stewardship

This model defines what each capability may honestly claim. It prevents a
successful transport, generated file, installed mod, or native dispatch from
impersonating the product outcome an actor actually requested.

## Outcome Laws

1. An owner reports only facts it can directly establish.
2. Success, refusal, unavailability, failure, cancellation, staleness, and
   indeterminacy are first-class results, not logging detail.
3. Every live result carries enough source, epoch, realm, controller, request,
   and time identity to reject stale evidence.
4. Accepted intent is not dispatch. Dispatch is not engine acceptance. Engine
   acceptance is not later observation. Observation is not actor success.
5. A query never mutates. A mutation is never retried after an indeterminate
   result without a separate reconciliation decision.
6. Generated, installed, loaded, ready, executed, and behavior-confirmed proof
   compose; none implies the next.
7. Projections preserve the owner's result vocabulary rather than reducing it
   to `ok` or throwing away refusal evidence.

## Universal Outcome Shape

Every state-changing capability can be reasoned about through this sequence:

```text
intent
  -> admission
  -> readiness
  -> dispatch
  -> immediate evidence
  -> later observation
  -> reconciliation
  -> actor outcome
```

An owner may participate in only part of that sequence. It must stop where its
authority stops.

Every fact-returning capability identifies:

```text
subject + source + observation identity + observedAt + completeness
```

## Independent Proof Axes

| Axis | Proves | Does not prove |
| --- | --- | --- |
| Generated | Exact source or artifact was produced | It was installed or accepted |
| Installed | Exact tree reached the target | Civ7 loaded it |
| Loaded | Civ7 admitted the mod/script | The controller or map behavior is ready |
| Controller-ready | Expected version/realm/boot answers | Any operation succeeded |
| Admitted | Intent and operands satisfy owner policy | Dispatch occurred |
| Dispatched | One native invocation was attempted without synchronous throw | Engine acceptance or durable effect |
| Immediate evidence | Same-evaluation native readback was obtained | Later state remains true |
| Observed | Fresh later evidence matches the subject | The actor's broader goal succeeded |
| Reconciled | Owner classified available evidence and repetition policy | A missing fact was magically proven |
| Behavior-confirmed | External product oracle observed the promised result | Every other capability or environment works |

## Capability Outcome Cards

### Official Civ7 Knowledge

- **Success:** exact official source or controlled inventory-capture identity,
  extraction/publication receipt, generated API and policy digest, provenance
  tier, and currentness proof.
- **Refusal:** missing installation, unsupported source shape, ambiguous realm,
  conflicting extraction evidence, or uncommitted source provenance.
- **Never claims:** runtime availability, loader acceptance, or behavior.

### Mod Definition

- **Success:** admitted portable definition and deterministic rendered plan.
- **Refusal:** invalid schema, duplicate identity, missing payload authority, or
  target-specific effect hidden in the definition.
- **Never claims:** installation or loading.

### Mod Realization

- **Success sequence:** exact generated artifact -> install receipt -> loader
  observation -> capability-specific live proof.
- **Refusal:** source digest mismatch, non-wholesale target replacement,
  unqualified destination, loader rejection, stale observation, or missing
  behavior oracle.
- **Never collapses:** copied files into a loaded or working mod.

### Civ7 Controller Instance

- **Identity:** the mod-app bootstrap creates realm and boot identity; the
  controller contract exposes that identity and its API version.
- **Ready inside the realm:** the controller can answer in the current App UI
  document and admits the requested lifecycle state.
- **Refused inside the realm:** the native operation is not valid in the
  controller's current realm or lifecycle.
- **Never claims:** actor intent or gameplay recommendation.

### Controller Observation

- **Success:** typed native evidence correlated to current realm, boot,
  operation, and observation time.
- **Partial:** required fields or native authorities were unavailable but the
  returned subset is explicitly identified.
- **Refusal:** the operation is not valid in the current realm or lifecycle.
- **Failure:** the native API or controller implementation failed before a
  valid observation was produced.

### Controller Mutation

```text
fresh native check
  -> at most one native invocation
  -> dispatch receipt
  -> optional immediate native evidence
```

- **Refused:** the fresh native check rejects the exact operands; no invocation
  occurs.
- **Dispatched:** the native call returned without synchronous invocation
  failure. This does not mean accepted.
- **Indeterminate native outcome:** one invocation was dispatched but the
  controller cannot establish engine acceptance or later effect.
- **Failed before dispatch:** controller admission or the native invocation
  failed before any possible native effect.
- **Law:** controller mutations are not automatically replayed.

### Live Controller Access

- **Success:** ready Tuner epoch, discovered runtime state, verified controller
  identity, correlated envelope result, and clean scope status.
- **Refusal:** caller lacks diagnostic or operation authority, controller
  version is incompatible, or the requested realm is absent.
- **Unavailable:** socket, process, or controller instance is not present.
- **Indeterminate:** the wire cannot establish whether an admitted invocation
  reached the current controller.
- **Never claims:** native acceptance or gameplay outcome.

The current Tuner contract does not yet return an atomically epoch-qualified
command result; epoch is observed separately and listener correlation is
private. This card is destination law. Container 1 must either add an
owner-issued atomic result or define a before/after observation protocol that
refuses ambiguity.

### Civ7 Play

- **Situation:** fresh controller evidence plus the actor context needed for
  one admitted decision.
- **Check:** whether the requested goal/action is currently lawful and why.
- **Request:** accepted actor intent and the exact controller operation plan.
- **Outcome:** confirmed, refused, guarded, uncertain, or failed, with explicit
  next-action and no-repeat guidance.
- **Correction:** later observation may reconcile an uncertain dispatch; it
  does not rewrite the historical dispatch receipt.
- **Never claims:** raw transport success as play success.

### Raw Tuner Diagnostic

- **Refused:** the caller or command is not admitted to the diagnostic surface.
- **Success:** exact source, selected Tuner state, epoch, raw response, audit
  identity, and timestamp.
- **Not dispatched:** transport proves the command could not have executed.
- **Indeterminate:** transport failed after possible execution; the command is
  never retried automatically.
- **Never claims:** controller operation, engine acceptance, or gameplay
  success.

### Map Definition And Preview

- **Success:** admitted config, deterministic artifacts, trace, metrics, and
  visualization evidence for exact seeds and dimensions.
- **Refusal:** invalid config, missing declared dependency, artifact validation
  failure, or non-deterministic projection.
- **Never claims:** Civ7 loading or engine parity.

### Map Run Operation

- **Success sequence:** accepted request -> canonical config -> exact generated
  artifact -> install receipt -> controller-assisted launch/setup -> fresh log
  and live readback -> terminal outcome.
- **Refusal:** active-operation conflict, invalid config, unready controller,
  or unsupported target before effects begin.
- **Cancellation:** accepted cancellation plus the exact phase and effects that
  completed before drain.
- **Uncertain:** installed or launch-dispatched evidence exists, but fresh live
  proof is insufficient.
- **Adoption:** a later caller receives the same owner-issued operation record;
  it does not infer status from loose files.

## Actor Outcome Composition

The final result shown to a caller is a composition of owner-issued facts:

```text
resource evidence
  + controller evidence
  + Play or MapGen-runs policy
  + projection translation
  = caller-visible outcome
```

Composition may add context and presentation. It may not remove refusal,
staleness, uncertainty, correlation, or ownership.

## Event And Effect Boundary

A successful engine method call is native evidence, not automatically a
domain event. A domain completion marker exists only when a consumer needs a
fact that cannot be derived from an admitted artifact or owner-issued outcome.
Engine adapters may record method-level effects for diagnostics, but the owner
of a multi-call semantic operation emits its own completion result after
reconciliation.

This model therefore does not create a generic event ledger or duplicate
artifact presence with completion tags. Durable workflow events are admitted
only for work that crosses process/request lifetime.

## Proof Oracles

| Capability | Smallest meaningful oracle |
| --- | --- |
| Official knowledge | Regeneration from an exact source revision produces the committed digest and rejects unproven declarations |
| Controller loading | Shell publication, every loading observation, game publication, shell return, and all boot/global transitions are recorded without assuming absence or replacement |
| Controller mutation | A refused check dispatches zero times; an admitted check dispatches once; indeterminate transport never auto-replays |
| Play | A known situation yields the expected check, request classification, reconciliation, no-repeat, and next action |
| Raw diagnostic | Unauthorized use is refused; a pre-execution failure is `not-dispatched`; a post-possible-execution failure is `indeterminate` and never retried; success returns exact raw evidence without semantic promotion |
| Mod realization | Exact artifact is installed, loaded, and behavior is observed through an independent product oracle |
| Map preview | Exact seed/config produces deterministic artifacts and projection evidence |
| Map run | One request is correlated from config through artifact, install, launch, fresh log, live readback, and terminal state |

## Falsifiers

Reopen an outcome contract if its owner cannot directly establish a claimed
fact, if two owners can issue conflicting terminal truth for the same subject,
if a projection discards uncertainty or identity, or if a behavior test proves
the product requires a state currently labeled exterior.

## Transition Test

Implementation may move only when each preserved baseline behavior maps to one
outcome card and one independent oracle. Tests that merely re-prove wiring,
schema corruption excluded by a provider, or a relocated implementation shape
do not satisfy this gate.
