# Phase Record: D4 Classify Orientation And Routing

## State

- Status: accepted for design/specification only after final D4 rereview found
  no unresolved accepted P1/P2 blockers.
- Worktree fixture: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch fixture: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D4_SOURCE_PACKET`.
- OpenSpec change: `$D4_CHANGE`.

## Objective

Specify the complete D4 `habitat classify` owner contract: a closed
`ClassifyResult` state model, D0 public-surface prerequisites, D2 rule-routing
projection consumption, D3 `GraphRefusal` consumption, TypeScript state-space
collapse strategy, validation oracles, and D14 example handoff.

## Current Gate

Design-time gate closed for specification acceptance. Final domain/ontology,
OpenSpec/testing, and topology/cross-domino rereview files record no unresolved
accepted P1/P2 findings. D4 remains blocked for source implementation behind
the prerequisites below.

## Source Implementation Blockers

- Concrete D0 matrix rows for every D4-touched classify command, command-json,
  human-output, package-export, docs-example, and generated surface.
- Live D2 `ruleRoutingFacts` implementation replacing raw `scope` prose as route
  authority.
- Live D3 graph facts for project ownership, target availability, unavailable
  targets, aggregate/workspace targets, and `GraphRefusal`.
- D1-aligned refusal, recovery instruction, command outcome, and non-claim
  vocabulary for classify refusal states.

Accepted D0/D1/D2/D3 design/specification packets are design authority only;
they are not source implementation evidence.

## Validation Gates For This Design Packet

- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`
- `bun run openspec:validate`
- `git diff --check`
- D4-local language audit for D4-owned graph-state wording, reduced-standard wording, and
  implementation-time decision leakage.

## Final Rereview Evidence

- `$AGENT_SCRATCH/domino-D4-final-domain-ontology-rereview.md`: accepted for
  design/specification only; no remaining P1/P2 domain or ontology blockers.
- `$AGENT_SCRATCH/domino-D4-final-openspec-testing-rereview.md`: accepted for
  design/specification only; no unresolved P1/P2 OpenSpec, testing, or
  implementation-readiness blockers.
- `$AGENT_SCRATCH/domino-D4-final-topology-crossdomino-rereview.md`: accepted
  for design/specification only; no remaining P1/P2 code-topology,
  TypeScript-state, dependency, or cross-domino blockers.

## Later Source Validation Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`
- command-adapter tests for `habitat classify` output/status behavior
- fixtures for `project-path`, `workspace-path`, `diff`,
  `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`
- fixtures for D2 unresolved routing and D3 missing-project, missing-target,
  malformed graph JSON, Nx read failure, and Nx daemon failure reason values

## Non-Claims

- This packet does not implement Habitat source changes.
- This packet does not make D0/D2/D3 source implementation complete.
- This packet does not run targets, prove rule correctness, prove apply safety,
  or admit authoring topology.
- Legacy code names remain compatibility facts unless D4 accepts them as target
  language and D0 records the public-surface handling.
