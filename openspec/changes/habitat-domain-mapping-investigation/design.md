# Design: Habitat Domain Mapping Investigation

## Frame

The workstream treats Habitat as a product/domain to be mapped through
scenarios, language, authority, proof needs, and user outcomes. Current code is
required evidence, but it is not the domain model.

The investigation is complete when it can produce a reviewed domain design
packet for Habitat that explains what the domain is, what it can do, what it
refuses, which tools and proof surfaces it exposes, and how humans can define
patterns that agents use to build, modify, and maintain repositories.

## Phase Structure

| Phase | Gate | Output |
| --- | --- | --- |
| 1. Grounding and source-order confirmation | 1-3 | Confirmed source order, frame carry-forward, and contradiction list. |
| 2. Scenario corpus extraction | 4-5 | `scenario-corpus.md` rows for supported, unsupported, and desired authoring scenarios. |
| 3. Flow tracing | 3-5 | `flow-map-ledger.md` rows grounded in docs, code, tests, command behavior, and failure paths. |
| 4. Language and authority analysis | 5-7 | Ubiquitous language notes and `authority-map-ledger.md` rows. |
| 5. Candidate context-map synthesis | 7-8 | Candidate bounded contexts and relationships, explicitly labeled as hypotheses. |
| 6. Domain critique and falsifier review | 11 | Review findings against the hard core and falsifiers in `DOMAIN-MAPPING.md`. |
| 7. Domain design packet assembly | 8 | Habitat domain design packet with evidence-backed claims and non-claims. |
| 8. Review, realignment, and handoff | 11-12 | Reviewed packet and implementation-slice handoff only for accepted follow-up work. |

## Investigation Rail

- Type: doc-vs-code reconciliation plus codebase deep dive plus corpus-building.
- Evidence standard: verified for current behavior; corroborated for domain
  claims; hypothesis-labeled for future MapGen authoring.
- Search geometry: scenario corpus first, graph-tracing second, falsification
  throughout.
- Rail coupling: rail-neutral ledgers with codebase deep-dive and manual
  synthesis as the likely first execution rails.
- Artifact durability: durable project workstream records and a source-of-truth
  candidate design packet only after review.

## Code-Vs-Doc Rule

Docs define intent and accepted frames. Current code, tests, command behavior,
and generated diffs prove implemented behavior. Historical ledgers explain why
the implementation is shaped the way it is. None of those inputs may turn
current technical placement into target domain authority without scenario and
authority analysis.

## Artifact Model

The OpenSpec change is the downstream control record. The durable investigation
assets live under `docs/projects/habitat-harness/domain-mapping/` because this
slice is project-control and domain-design setup, not a Habitat implementation
change.

The artifact set is deliberately small:

- `workstream-record.md`: current gate, source order, branch state, write set,
  proof classes, team state, and next action.
- `investigation-brief.md`: rail-neutral brief carrying the frame, questions,
  evidence policy, artifact contract, and stop conditions.
- `scenario-corpus.md`: scenario rows that preserve per-scenario obligations.
- `flow-map-ledger.md`: end-to-end flow trace contract for each scenario.
- `authority-map-ledger.md`: one-owner-per-invariant and authority conflict
  ledger.
- `evidence-ledger.md`: claim-to-source ledger with strength labels and
  unresolved states.
- `agent-operating-model.md`: operating instructions for owner and read-only
  lanes.

## Agent Operating Model

One DRA owner owns synthesis, proof claims, scope, write set, review
disposition, and closure. Evidence lanes may inspect and report, but they do
not define competing plans or write implementation code.

Standing lanes:

- Reference synthesis: product outcomes, supported scenarios, unsupported
  states, and source conflicts from docs.
- Code-flow tracing: scenario paths through commands, libraries, tests, graph,
  baselines, Grit, hooks, generators, and Pattern Authority.
- Domain critique: language, authority, duplicated ownership, and technical
  decomposition traps.
- Investigation review: evidence class, falsifiers, scope control, and artifact
  sufficiency.

## Structural Alternative Rejected

The rejected alternative is to start from the current Habitat directory layout
and document `commands`, `lib`, `rules`, `generators`, and `tests` as the
domain. That path would preserve recovery-era composition and mechanism names.
The accepted path starts from scenarios and tests whether any candidate context
explains user and agent outcomes better than the current technical layout.

## Closure Boundary

This change closes only when the harness artifacts exist, validate, classify
under Habitat, and are locally committed. It does not close the domain mapping
investigation or produce the domain design packet.
