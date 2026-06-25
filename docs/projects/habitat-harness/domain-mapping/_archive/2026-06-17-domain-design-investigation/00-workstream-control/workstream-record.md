# Habitat Domain Mapping Workstream Record

## Frame

- Objective: produce a scenario-driven Habitat domain design packet that maps
  what the Habitat Toolkit is responsible for, what it can do, what it refuses,
  and how humans and agents should use its structural tooling.
- Future state: Habitat has reviewed domain artifacts that explain scenarios,
  flows, language, authority, proof classes, candidate bounded contexts, and
  implementation-slice entry points.
- Non-goals: no refactor, no generator implementation, no final domain model in
  the harness branch, no broad MapGen redesign, no current-code-as-domain
  authority claim.
- Hard core:
  1. Current code is evidence, not domain authority.
  2. Scenarios are the primary unit of discovery.
  3. One owner per invariant.
  4. Platform substrate and authoring workflow are distinct product outcomes.
  5. Proof classes stay explicit.
- Exterior: Habitat implementation edits, generated-output edits, baseline
  mutation, Grit rule/apply additions, hook behavior changes, and MapGen product
  redesign.
- Falsifier: if proposed boundaries cannot explain scenario flows better than
  the current technical layout, the frame is invalid.
- Redesign trigger: if the work collapses into documenting `src/lib` and
  `src/commands` modules, return to the frame in
  `tools/habitat/docs/DOMAIN-MAPPING.md`.

## Status

- Last updated: 2026-06-17
- Current gate: Gate 12 - close and hand off from reviewed packet.
- Next gate: implementation-slice planning from one accepted authority row.
- Blocked by: no current blocker.
- Stop condition: implementation work begins before scenario, authority, and
  evidence artifacts are reviewed.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-domain-mapping-investigation-harness`
- Branch: `codex/habitat-domain-mapping-investigation-harness`
- Parent branch: `codex/habitat-domain-mapping-prework`
- Stack position: Graphite-tracked child of the prework branch.
- Dirty files and owner: this branch owns only the harness artifacts under
  `openspec/changes/habitat-domain-mapping-investigation/**` and
  `docs/projects/habitat-harness/domain-mapping/**`.
- Protected paths: primary checkout dirty files, Habitat implementation,
  MapGen implementation, generated outputs, baselines, Grit patterns, and hook
  code.
- Generated/read-only paths: no generated outputs are touched.

## Phase Plan

| Phase | Gate | Output | Status |
| --- | --- | --- | --- |
| 1. Grounding and source-order confirmation | 1-3 | Confirm source order and contradiction list. | complete |
| 2. Scenario corpus extraction | 4-5 | Supported, unsupported, and desired authoring scenarios. | complete |
| 3. Flow tracing | 3-5 | Flow maps across docs, commands, code, tests, and current behavior. | complete |
| 4. Language and authority analysis | 5-7 | Glossary notes and one-owner authority map. | complete |
| 5. Candidate context-map synthesis | 7-8 | Candidate bounded contexts and context relationships. | complete |
| 6. Domain critique and falsifier review | 11 | Review findings and frame stress tests. | complete |
| 7. Domain design packet assembly | 8 | Habitat domain design packet. | complete |
| 8. Review, realignment, and handoff | 11-12 | Reviewed packet and follow-up implementation-slice handoff. | complete |

## Corpus Gate

- Corpus source(s): `DOMAIN-MAPPING.md`, Habitat reference docs, Habitat
  project frames, current Habitat code/tests/rules/baselines, command behavior,
  and selected MapGen topology references for future authoring scenarios.
- Corpus shape: mixed scenario/action/proof/authority surfaces.
- Coverage ledger: `scenario-corpus.md`.
- Open uncertainty: future Authoring Topology remains hypothesis-labeled until
  a MapGen-specific convention and product acceptance investigation runs.

## Proof Gates

- Local stats: not applicable to harness setup; later flow maps may include
  command/result counts where useful.
- Generated/deploy proof: not applicable.
- Runtime proof: not required; Habitat domain mapping is structural/product
  design, not live Civ7 behavior.
- Product proof: domain packet reviewed against scenarios and falsifiers;
  implementation and runtime proof remain out of scope.
- Closure boundary: this branch proves the documented domain packet and review
  artifacts only, not any Habitat behavior change.

## Team

- Owner: DRA Habitat domain mapping owner.
- Evidence agents: reference synthesis, code-flow tracing, domain critique, and
  investigation review lanes as defined in `agent-operating-model.md`.
- Review agents: authority, evidence, domain critique, information-design, and
  closure review recorded in `review-disposition-ledger.md`. No callable
  multi-agent spawn tool was available, so review is lane-based self-review.
- Open findings: Authoring Topology requires the next MapGen-specific
  investigation before implementation.
