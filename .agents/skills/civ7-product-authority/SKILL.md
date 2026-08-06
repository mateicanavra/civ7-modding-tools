---
name: civ7-product-authority
description: |
  Use in the Civ7 Modding Tools repo when deciding actor outcomes, product capability ownership, public behavior, consumer contracts, or honest proof claims. Trigger phrases include "what owns this product behavior", "is this control or play", "what does Swooper promise", "is this production or Studio realization", "who owns this MapGen operation", "does this surface change meaning", "can this proof support the claim", "what can the actor ask next", "does this break consumers", and "update product authority". Pair with civ7-architecture-authority for container placement, imports, lifecycle, and structural enforcement.
---

# Civ7 Product Authority

## Purpose

Use this durable local overlay to apply the sealed Civ7 product, system,
outcome, actor, topology, and destination models. It keeps actor outcomes,
semantic owners, caller projections, external evidence, and proof classes
separate. It does not restate project status or infer promises from the current
repository tree.

The overlay owns Civ7-specific product guardrails only. Law for selected shared
kinds stays upstream in Habitat, while Civ7 service law and qualified product
overlays stay repo-owned. Generic Effect/oRPC teaching stays in the global
vendor skills and exact installed source.

## When To Use

- Naming or changing a Civ7 actor Task, Question, capability, semantic owner, or
  owner-local result.
- Separating foundational native control from actor-facing play.
- Changing Swooper definition/generation, production realization, or Studio
  ephemeral realization behavior.
- Changing MapGen-runs admission, phase meaning, correlation, reconciliation,
  cancellation, or final operation outcome.
- Adding, reshaping, transferring, or deleting an SDK, CLI, API, web, docs, or
  mod-loader surface.
- Deciding what official facts, generated output, installation receipts,
  loader evidence, or live observations can honestly prove.

## Non-Goals

- Do not use this skill as a migration plan, readiness/admission ledger, or
  duplicate of the sealed project packet.
- Do not preserve public behavior merely because a current path or facade
  exposes it.
- Do not use package names, routes, framework APIs, tests, or generated output
  to define product meaning.
- Do not reproduce generic Habitat or vendor mechanics locally.
- Do not select implementation placement without
  `civ7-architecture-authority`.

## Default Workflow

1. **Resolve authority.** Read `references/source-map.md` and the exact sealed
   sections governing the capability.
2. **Name the actor lens.** State the external Actor, contextual Role, Goal,
   state-changing Task or fact-returning Question, and authorized channel.
3. **Assign fact writers.** Use `references/capability-map.md` to name the
   semantic owner, adjacent effect/evidence owners, and explicit non-owners.
4. **Trace the chain.** Use `references/flow-set.md` to separate definition,
   realization, construction, projection, and proof.
5. **Keep outcomes honest.** Preserve intent, admission, plan, effect attempt,
   receipt/observation, acceptance/reconciliation, and owner result as distinct
   facts.
6. **Apply policy.** Use `references/policy-map.md` for control/play,
   definition/realization, MapGen-runs, projection, consumer, and proof rules.
7. **Gate consumers.** Before reshaping or deleting a public surface, copy
   `assets/consumer-contract-gate-template.md` and close known and searched
   consumers.
8. **Update the real authority.** Follow
   `references/update-protocol.md` when a durable model changes; update this
   overlay only when its routing guardrails change.
9. **Close with bounded claims.** Report owner behavior, consumer effect,
   supported proof classes, uncertainty, and still-forbidden claims separately.

## Reference Map

| Reference | Path | Open When |
| --- | --- | --- |
| Source map | `references/source-map.md` | Resolving product authority and evidence classes |
| Capability map | `references/capability-map.md` | Naming semantic/effect owners and non-owners |
| Flow set | `references/flow-set.md` | Tracing actor intent through owners and projections |
| Policy map | `references/policy-map.md` | Applying durable product and proof laws |
| Update protocol | `references/update-protocol.md` | Changing accepted product authority or this overlay |
| Failure patterns | `references/failure-patterns.md` | A surface, path, or proof is starting to define meaning |

## Asset Map

| Asset | Path | Use When |
| --- | --- | --- |
| Capability record | `assets/capability-record-template.md` | Recording an actor outcome and its fact writers |
| Flow record | `assets/flow-record-template.md` | Recording an end-to-end capability chain |
| Consumer contract gate | `assets/consumer-contract-gate-template.md` | Retaining, transferring, reshaping, or deleting a public surface |
| Authority change note | `assets/authority-change-note.md` | Recording a durable model change in its owning authority artifact |

## Core Invariants

<invariants>
<invariant name="capability-before-container">Name the actor outcome and semantic capability before discussing paths, packages, endpoints, or frameworks.</invariant>
<invariant name="one-writer-per-fact">Every durable fact, policy decision, transition, correction law, effect receipt, and product result has one writer. A capability chain may traverse owners; projections never share their write authority.</invariant>
<invariant name="current-estate-is-evidence">Current source, routes, exports, and tests describe behavior and consumers. They do not define target authority.</invariant>
<invariant name="control-is-foundational">Foundational control owns closed app/game/map/UI native interpretation, admission, dispatch, readback, and uncertainty correlated to resource facts. It does not own actor intent or gameplay strategy.</invariant>
<invariant name="play-is-actor-facing">Play alone owns gameplay situation, checks, requests, reconciliation, no-repeat policy, and next lawful action over the public control capability.</invariant>
<invariant name="definition-and-realizations-differ">The Swooper definition owns portable authored/generation truth. The production realization app owns its deployable outcome. Studio's qualified adapter owns ephemeral physical effects and receipts only.</invariant>
<invariant name="mapgen-runs-is-semantic-owner">MapGen-runs owns operation intent, order, state, correlation, retention, cancellation, reconciliation, and final semantic outcome. It does not own Swooper truth or physical host effects.</invariant>
<invariant name="channels-preserve-meaning">CLI, API, web, SDK, docs, and loader surfaces project owner results without changing owner vocabulary, inventing success, or becoming a second semantic capability.</invariant>
<invariant name="facade-has-no-product-future">The legacy facade/direct-control shape is deletion evidence, not a compatibility promise or target public capability.</invariant>
<invariant name="outcomes-do-not-collapse">Intent, admission, plan, dispatch/effect, observation/receipt, consumer acceptance, reconciliation, and owner-local result remain distinct.</invariant>
<invariant name="proof-is-a-set">Contract, semantics, execution, projection, assembly, generated, installed, loader, and live-behavior evidence are independent facts; no strongest scalar status replaces them.</invariant>
<invariant name="external-law-does-not-own-product">Upstream Habitat and global vendor guidance may constrain realization mechanics; neither defines Civ7 product meaning.</invariant>
</invariants>

## Quick Start

1. Read `references/source-map.md`.
2. Locate the actor outcome in `references/capability-map.md`.
3. Trace its realization in `references/flow-set.md`.
4. Apply the relevant policy and consumer gate.
5. Close with owner-local facts and exact proof classes.
