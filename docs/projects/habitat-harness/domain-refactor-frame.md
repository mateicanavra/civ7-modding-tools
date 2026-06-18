# Habitat Toolkit Domain Refactor Frame

**Status:** active frame for the next Habitat Toolkit DRA planning phase
**Created:** 2026-06-17
**Owner:** Habitat Toolkit DRA workstream owner
**Durability:** standalone project-control frame
**Next phase:** design the full TypeScript/domain refactor workstream packet set

This document is the normative reference frame for the next Habitat Toolkit
planning phase. It exists to keep the upcoming refactor design grounded in the
reviewed domain model instead of the accidental shape of the current code.

It does not authorize implementation. Phase 2 designs the refactor packets.
Phase 3 executes accepted packets.

## Source Order

Use this order when sources disagree:

1. Direct current user instructions.
2. Root `AGENTS.md`, closest subtree `AGENTS.md`, and repo workflow docs.
3. `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
4. `docs/projects/habitat-harness/FRAME.md`.
5. `docs/projects/habitat-harness/dra-takeover-frame.md`, as historical
   recovery discipline.
6. Current code, tests, scripts, generated manifests, and fresh command
   behavior, for current-behavior claims.
7. Archived domain-mapping ledgers under
   `docs/projects/habitat-harness/domain-mapping/_archive/2026-06-17-domain-design-investigation/`,
   as audit evidence only. Archived ledgers never override fresh disk or
   command evidence for current behavior.
8. Active OpenSpec records.
9. Prior chat/session summaries as discovery aids only.

The June 17 domain design packet is the live target-domain input. Older Habitat
frames remain useful for recovery method, proof hygiene, and historical product
constraints, but they do not override the domain packet where they conflict.

## What Habitat Is For

Habitat is a generic repo-local structural toolkit for humans and agents
maintaining a codebase. Its product value is ambiguity reduction before and
during code changes. It answers:

- what owns a path or diff;
- which structural rules and targets apply;
- what proof is required before handoff;
- which local feedback can run early;
- which structural repair is approved and safe enough to apply;
- which generated or protected zones must not be edited directly;
- which scaffolds are supported and which requests must be refused.

Habitat is not a Civ-specific subsystem and is not a complete MapGen authoring
toolkit. It currently supports a structural operating surface: classify,
check, verify, graph integration, hooks, Grit diagnostics, guarded apply,
baselines, and narrow scaffolding. Authoring Topology for domain/op/stage/step,
recipe, contract, schema, registry, or Studio artifact creation is future work
and must stay separate from current structural substrate claims.

## Frame

### In

Habitat Toolkit domain redesign and TypeScript refactor planning, grounded in
the June 17 domain design packet, current repo evidence, and repo-local
workflow skills.

### Foreground

- Scenario responsibility: classify, check, verify, local feedback, guarded
  apply, pattern governance, scaffolding, protected zones, and refusal paths.
- Domain authority: one owner per responsibility and explicit relationships
  across adjacent contexts.
- Proof classes: OpenSpec validation, tests, command behavior, current-tree
  checks, runtime/product proof, and Graphite state remain separate claims.
- Public command and tool contracts: surfaces must follow consumer tasks and
  explicit guarantees, not internal file layout.
- TypeScript state-space reduction: refactor packets must reduce reachable
  states, delete unearned models, and preserve behavior unless a public
  contract change is intentionally designed.
- Clean handoff: each packet must have a bounded write set, review lanes,
  validation, downstream realignment, and Graphite/OpenSpec closure.

### Exterior

- Civ-specific coupling or product/runtime game behavior changes.
- MapGen authoring implementation.
- Runtime Civ7 control, Studio artifact behavior, generated game output, or
  live-game proof.
- Broad speculative rewrites or module-by-module cleanup disconnected from
  scenario authority.
- Implementation before Phase 2 packet design is complete.

## Hard Core

Violating any of these forces a reframe:

1. **Generic harness first.** Habitat remains generic repo harness
   infrastructure. Civ7 is the first host repo, not the domain boundary.
2. **Responsibility before files.** Domain boundaries follow product
   responsibilities, authority, proof classes, language, and change patterns,
   not current technical composition.
3. **Single owner per domain.** Every domain has one owner and explicit
   relationships to adjacent domains. Shared ownership is a defect unless a
   specific resolution mechanism is designed.
4. **Consumer-led public surfaces.** Command, tool, and library surfaces follow
   what agents and humans need to accomplish. They must specify guarantees,
   errors, proof boundaries, and non-claims explicitly.
5. **State-space reduction earns refactors.** TypeScript refactor work must
   reduce reachable states or delete unearned abstractions. Moving complexity
   to a new file is not enough.
6. **Behavior preservation by default.** Refactor packets preserve behavior and
   public types unless an intentional contract change is designed, recorded,
   and verified.
7. **Proof classes stay separate.** OpenSpec validation, unit tests, current
   command behavior, current-tree checks, injected violation proof, runtime or
   product proof, and Graphite state do not substitute for one another.

## Protective Belt

These may change without reframing if the hard core holds:

- exact Phase 2 packet names and order;
- whether a packet is OpenSpec-first or project-doc-first;
- exact file paths for temporary planning artifacts;
- which reviewer lanes are used for a packet;
- whether a packet starts as docs-only, check-only, or code-ready;
- exact Graphite branch names.

## Falsifier

Reframe if code inspection shows that the June 17 domain model fails to explain
major Habitat scenario flows, or if the first Phase 2 packet cannot name a
single owner, consumer, contract, and proof boundary.

Additional stop conditions:

- A proposed packet can only be described as "clean up this module" rather than
  a scenario/domain/proof move.
- A packet crosses public command/tool surfaces without an explicit API
  contract and compatibility story.
- A packet relies on Civ-specific behavior to justify a generic Habitat
  boundary.
- Two consecutive packet designs preserve the current code layout because it is
  convenient, despite conflicting with the domain packet.

## Structural Alternative Rejected

Alternative: clean up the current Habitat code module by module.

Rejected because it preserves the failure dynamic. The current code is useful
evidence for behavior, but it is not a valid domain model: it mixes orientation,
enforcement, baselines, proof, graph, classify, fix routing, Grit acquisition,
pattern governance, guarded apply, hooks, and scaffolding in ways that reflect
growth history rather than product authority. A module-by-module cleanup would
make the accidental structure neater while leaving the wrong boundaries intact.

The accepted structure is scenario-first and authority-first: each packet must
map from domain responsibility to TypeScript state-space reduction, public
surface impact, proof requirement, review lane, and closure record.

## Phase 2 Objective

Produce a standalone, evidence-grounded Phase 2 workstream design for Habitat
Toolkit that maps each refactor packet from domain responsibility to
TypeScript state-space reduction, public surface impact, proof requirements,
review lanes, and Graphite/OpenSpec closure, while preserving Habitat as a
generic repo-agnostic toolkit.

## Phase 2 Team and Accountability

Phase 2 uses an owner-led, reviewer-backed topology. The Habitat Toolkit DRA
workstream owner is the single accountable agent for synthesis, packet
coverage, proof claims, review disposition, Graphite state, and handoff
quality. Delegated agents may inspect, critique, or draft bounded artifacts,
but they do not own the final frame or closure claim.

Team shape:

| Lane | Accountable output | Reject condition |
| --- | --- | --- |
| DRA owner | Final Phase 2 packet set, objective coherence, review disposition, and handoff | Any packet lacks owner, consumer, contract, proof boundary, or closure path |
| Artifact worker | Packet files, ledgers, checklists, and compaction-safe summaries kept current with accepted decisions | Artifact text diverges from accepted owner synthesis or contains stale status |
| Domain-boundary reviewer | Findings on owner/context boundaries, generic Habitat scope, adjacent-domain relationships, and deferrals | A packet follows current file layout instead of domain responsibility |
| TypeScript state-space reviewer | Findings on type/API simplification, impossible-state removal, behavioral preservation, and migration risk | A packet only moves files or adds abstractions without reducing reachable states |
| Proof/evidence reviewer | Findings on proof-class separation, command evidence, non-claims, safe-write boundaries, and current-tree behavior | Validation commands are used as substitutes for proof labels |
| Command/API reviewer | Findings on public CLI/tool/library contracts, errors, compatibility, and consumer tasks | A public surface changes without explicit contract, migration, and proof story |

Relationships and handoffs:

- The DRA owner broadcasts the frame, current packet draft, and evidence index
  to reviewers.
- Reviewers return findings with severity, file or packet references,
  accepted/rejected rationale, and required repair shape.
- The artifact worker edits or prepares bounded artifacts only from accepted
  DRA-owner decisions.
- Accepted P1/P2 findings block dependent packet closure until repaired,
  explicitly rejected with evidence, or moved outside the closure claim.
- The DRA owner records each blocker disposition in the packet set or adjacent
  review ledger before Phase 2 can close.

## Phase 2 Investigation Contract

Phase 2 is a codebase deep dive and packet-design phase. It must produce enough
design detail that Phase 3 can implement without inventing boundaries.

Required inputs:

- the June 17 domain design packet;
- archived domain-mapping ledgers as audit evidence;
- current Habitat code, tests, scripts, package manifests, generated manifests,
  and command behavior;
- active OpenSpec Habitat records;
- repo-local Graphite, OpenSpec, Habitat DRA, systematic workstream, and
  TypeScript refactoring guidance.

Required outputs:

- a current-state diagnosis that separates behavior evidence from domain
  authority;
- a packet map covering every material refactor domino;
- a domain coverage and disposition matrix keyed to the June 17 domain design
  packet's candidate contexts, where every context is marked
  `implement`, `refactor`, `no-op`, `defer`, or `non-goal` with owner,
  consumer, boundary, proof classes, and rationale;
- for each packet: owner, consumer, public surface impact, write set,
  protected paths, state-space reduction target, proof classes, validation
  commands, review lanes, stop conditions, and downstream realignment;
- for each packet, proof labels separated into the exact classes they claim:
  native tool behavior, current-tree behavior, injected violation proof,
  safe-write proof, transaction/rollback or no-unintended-writes proof,
  OpenSpec validation, tests, command behavior, Graphite state, explicit
  non-claims, and validation commands;
- an explicit non-implementation boundary for any future Authoring Topology
  work;
- a handoff that can survive compaction without replaying chat.

Evidence policy:

- Fresh disk and command evidence beats historical claims for current behavior.
- The domain design packet beats current code for target boundaries unless the
  falsifier fires.
- Archived ledgers explain why a claim was made; they do not prove current
  behavior.
- Generated artifacts and lockfiles remain read-only unless regenerated through
  the owning command path.

## Phase Boundary

This document opens the preparation boundary for Phase 2. It does not start
Phase 2 itself.

Phase 2 starts only when the worktree is clean, dependencies are installed in
the active worktree, the required build/check command path has passed or has a
bounded failure disposition, and the DRA owner has accepted this frame as the
controlling planning input.

Phase 2 may read code, inspect command behavior, and write design packets. It
must not implement refactors, mutate generated output by hand, or change public
contracts except as proposed design.

Phase 3 starts only after Phase 2 packets are complete enough that each
implementation slice has no boundary, owner, proof, or API decision left to
invent.
