# Design: D13 Scaffolding And Refusal Contracts

## Frame

D13 Scaffolding And Refusal Contracts is a downstream implementation-control packet derived from
`D13-scaffolding-and-refusal-contracts.md`. The packet is complete only when it leaves the later execution
agent with no product, domain, naming, sequencing, public-surface, or validation
decision to invent.

The existing packet is input, not output. Current Habitat code is
present-behavior evidence. This design chooses target language from Habitat's
generic repo-maintenance product scenarios rather than preserving accidental
module or DTO names.

## Domain Boundary

- Owner: Scaffolding and Refusal.
- Primary scenario: An agent requests a new project, pattern, or structural shape and Habitat either scaffolds a supported uniform shape or refuses unsupported work with owner and recovery guidance.
- Adjacent domains consume this packet through explicit contracts and may not
  recreate its authority locally.

## Target Contract

- Define supported scaffold contracts and unsupported refusal shape.
- Separate project scaffolding from Pattern Governance candidate generation.
- Consume host policy for host-specific generator refusals.

## Non-Goals

- No new unsupported generator implementation.
- No automatic pattern registration.
- No Civ-specific generator assumptions in generic Habitat.

## Naming And Language Decisions

- Use standard engineering terms that name the actual workflow object:
  receipts, checks, diagnostics, guard decisions, transactions, refusals,
  recovery instructions, metadata projections, command outcomes, and handoff
  records.
- Treat legacy proof/evidence-shaped code names as compatibility facts unless
  this packet explicitly accepts them as target language.
- Do not create generic artifact machinery when a smaller command result,
  receipt, or diagnostic contract serves the scenario.

## Implementation Readiness

Before implementation starts, the executor must have:

- D0 compatibility disposition for every public command, JSON, export, script,
  target, generator, and hook surface touched by this packet.
- A concrete write set and protected path list.
- Tests and command gates from this packet copied into the phase record.
- Review findings dispositioned with accepted P1/P2 repaired.

## Review Lanes

- Domain-language adversary: names, owner, authority, and inherited terminology.
- OpenSpec packet review: proposal/design/tasks/spec consistency and shortcut
  language.
- TypeScript state-space review: invalid states removed without type machinery
  that exceeds the product need.
- Testing/validation review: gates are falsifying, scenario-grounded, and have
  exact command expectations.
- Cross-domino review: dependencies, public-surface compatibility, and
  downstream realignment.

## Structural Alternative Rejected

The rejected alternative is to implement the existing domino packet directly
and let the execution agent create missing proposal, design, spec, task, and
ledger details while coding. That path already caused design drift. This
OpenSpec packet resolves the execution-control layer before implementation.
