# Control Surface Expansion Team Plan

## Objective

Convert the capability inventory into implemented, reviewed, and verified
first-class `@civ7/direct-control` APIs. The owner keeps synthesis, Graphite
stack shape, repo state, and final integration.

## Team Shape

This is a specified, tightly coupled, process-traced AI team. Agents work in
parallel evidence lanes first, then reviewed implementation lanes with disjoint
write sets.

| Agent | Accountable Output | Output Path | Consumes | Hands Off To |
|---|---|---|---|---|
| State-role architect | State-role architecture and OpenSpec slice proposal | `agent-state-role-architecture.md` | capability inventory, current package, OpenSpec | owner, reviewers |
| Read-surface designer | Read wrapper contracts and proof strategy | `agent-read-surface.md` | Tuner/App UI reports, package tests, official resources | owner, direct-control implementer |
| Action-surface designer | Mutating wrappers, safety contracts, live proof plan | `agent-action-surface.md` | automation/playability report, official UI code, runtime probes | owner, verification reviewer |
| Catalog/types designer | TypeBox catalog, runtime snapshot generator, types handoff | `agent-catalog-types.md` | type-generation report, `@civ7/types`, official resources | owner, type/catalog implementer |
| Integration/cleanup auditor | CLI/Studio integration and legacy cleanup manifest | `agent-integration-cleanup.md` | CLI, Studio, docs, existing cleanup specs | owner, docs implementer |
| Product/adversarial reviewer | P1/P2 findings across specs and product outcomes | `agent-review.md` | drafted OpenSpec changes and reports | owner |

## Coordination Contracts

- Agents write durable reports under this directory, not chat-only summaries.
- Each report must label evidence as source, official resource, recorded live
  proof, fresh live proof, inference, or unresolved.
- Agents may not reintroduce bridge/fallback language.
- Agent findings with P1/P2 severity block dependent implementation until the
  owner dispositions them in `review-disposition-ledger.md`.
- Implementation agents, if used later, receive disjoint write sets and must
  state changed paths in their final output.

## Feedback Loops

- Owner reads each report, consolidates conflicts into OpenSpec proposals, and
  updates this phase record.
- Review lane runs after spec draft and before implementation.
- Verification lane runs after implementation and checks claimed proof against
  actual gates.

## Failure Plan

- If an agent cannot prove a required mutating wrapper, it records the failed
  proof and closest truthful wrapper. The owner decides whether this triggers
  the user-specified reframe condition.
- If live Civ state is unavailable, source/mock tests may proceed, but runtime
  claims stay explicitly unproven.
