# Civ7 Model Progression

**Status:** Normative project method

## Purpose

The Civ7 platform migration is designed through four models before source
moves. Each model answers a different question and leaves a distinct receipt:

```text
meaning -> lawful structure -> lawful movement -> lived observation
```

This progression was recovered from the completed Magic Migration modeling
loop and translated into Civ7 authority. It adopts the method, not Magic's
product nouns, topology, or implementation machinery. Habitat remains the
sealed realization substrate; these models decide what Civ7 product
capabilities should be realized on it.

## 1. Meaning

**Question:** What product capabilities exist, who owns them, and what is
deliberately outside the product?

**Attention:** receive the existing estate as evidence of product meaning
before imagining its destination. Stay above files, endpoints, and framework
mechanics long enough for capabilities and exclusions to become obvious.

**Model:** [PRODUCT-AUTHORITY.md](./PRODUCT-AUTHORITY.md), supported by the
exact [migration corpus](./CORPUS.md).

**Gap pass:** classify observed capabilities, facts, owners, non-owners,
policies, refusals, unknowns, and preserve/repair/retire/defer dispositions.
Current package names and paths are evidence, not answers.

**Receipt:** every durable fact, policy decision, transition, and correction law
has one owner. Each capability chain names its owner-local split or one explicit
exclusion. Unknowns remain visible rather than becoming fallback behavior.

**Exit:** no inferred policy, unresolved fact owner, or capability preserved
merely because a legacy container exposes it.

## 2. Lawful Structure

**Question:** Where can each identity, fact, transition, writer, lifecycle, and
cross-owner edge lawfully live?

**Attention:** hold the settled product meaning still and give each concern one
place to exert authority. The desired feeling is relief: once an owner is
correct, compensating facades, reciprocal clients, and hybrid packages lose
their reason to exist.

**Model:** [SYSTEM-MODEL.md](./SYSTEM-MODEL.md), with
[TOPOLOGY.md](./TOPOLOGY.md) and
[KIND-LAW-MATRIX.md](./KIND-LAW-MATRIX.md) as structural projections.

**Gap pass:** attack cycles, reciprocal clients, shared writers, accidental
runtime authority, untyped edges, and destinations that the accepted Habitat
substrate cannot construct.

**Receipt:** every admitted concern has one qualified container and every
cross-owner dependency has one typed direction. Lifecycle, idempotency,
failure, replay, and correction laws remain with their real owner.

**Exit:** the destination can be stated positively without preserving a hybrid
container or inventing a local Habitat approximation.

## 3. Lawful Movement

**Question:** How does actor intent become owner-observed change, refusal,
reconciliation, or actionable attention?

**Attention:** animate the lawful structure. Follow intent forward and promises
backward without allowing an intermediate mechanism to impersonate a product
outcome.

**Model:** [OUTCOME-MODEL.md](./OUTCOME-MODEL.md).

**Gap pass:** walk each admitted intent forward and each promised result
backward. Split concepts when identity, clock, authority, correction, failure,
or lawful future differ. Keep request, dispatch, acceptance, completion, and
evidence distinct.

**Receipt:** every outcome path terminates in an owner result, an exact refusal,
a reconciliation state, or an actionable query. No global state machine or
transport receipt substitutes for domain authority.

**Exit:** the product can say what changed, who knows, and what remains unknown
without inflating proof.

## 4. Lived Observation

**Question:** Can an external actor, in a contextual role, pursue the same goal
through each authorized channel without the product changing the meaning of
the owner's result?

**Attention:** stand outside the system and inhabit the actor's situation.
Observe what the actor can actually know, not what an internal command,
workflow, transport, or local projection hopes happened.

**Model:** [ACTOR-ROLE-OUTCOME-MODEL.md](./ACTOR-ROLE-OUTCOME-MODEL.md), tested
against the [proof corpus](./PROOF-CORPUS.md).

The dynamic walk is:

```text
system boundary
  -> external actor
  -> contextual role
  -> goal
  -> channel-independent task
  -> leaf interaction
  -> owner-backed question
```

Services, workflows, APIs, runtimes, and Habitat remain inside the system
boundary. Roles grant no authority. Channels are abilities, not actors.
Questions observe; they do not write.

**Gap pass:** inspect owner-local, vertical-chain, and caller-surface questions.
Reject command success, transport success, workflow completion, or local state
as proof of owner acceptance.

**Receipt:** an applied actor oracle preserves owner meaning through every
already-authorized projection of the selected Task or Question and makes a
false success fail at the same owner boundary. A one-channel capability does
not manufacture a second projection. Explore Live Map is the first Civ7
receipt because two projections already exist:
`explored | already-explored | unverified` survives service, CLI, and Studio.

**Exit:** actors see stable product meaning across channels, every answer traces
to its authority, and the smallest useful falsifier passes.

## Feedback Law

A failed receipt returns to the earliest model that owns the defect:

- unclear capability or owner returns to **Meaning**;
- illegal placement or dependency returns to **Lawful Structure**;
- ambiguous transition or result returns to **Lawful Movement**;
- misleading actor-facing evidence returns through **Lived Observation** to
  whichever earlier model owns the defect: Meaning, Lawful Structure, or
  Lawful Movement.

The failure does not become a compatibility layer, local exception, broader
scan, or implementation task. Structural Habitat proof establishes lawful
shape; it never substitutes for product behavior proof.

## Migration Admission

The four models and exact corpora are sealed in the current product stack. The
Explore oracle supplies the first executable observation receipt; landing that
stack supplies the integration receipt. Structural burn-down remains closed
until the Template-owned, constructible Habitat successor is available to
Civ7 as a pinned consumer release. Once admitted, each capability moves as one
complete realization chain and closes with behavior parity, old-owner deletion,
positive law, and a clean Graphite receipt.
