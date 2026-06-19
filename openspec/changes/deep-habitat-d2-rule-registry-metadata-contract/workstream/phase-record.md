# Phase Record: D2 Rule Registry Metadata Contract

## State

- Status: source implementation submitted as draft PR #1837 after final internal review and repair; focused D2 projection/parser/consumer gates pass. Structural adapter-domain enforcement is a Habitat-owned GritQL rule, not a manual architecture test. User-delegated temporary-supervisor review accepted D2 for D3 advancement after the D7 command-context carry-forward repair.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d2-rule-registry-metadata-contract`.
- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`.
- OpenSpec change: `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract`.

## Objective

Implement the D2 Rule Registry Metadata Contract: a versioned TypeBox-backed registry document, canonical parser, named consumer projections, current-registry projection consumers, D0/D1-compatible public facades, and downstream handoff records without taking over D3/D5/D8/D11/D12-owned behavior.

## Current Gate

D2 source implementation is submitted after the D0/D1 implementation-start gates were satisfied. The user-approved temporary-supervisor review path accepted D2 closure for D3 advancement after the D7 command-context carry-forward repair; D3 still starts under its own D0/D2 readiness gates.

## Dependency State

| Dependency | Status | D2 handling |
| --- | --- | --- |
| D0 command surface inventory | concrete public-surface matrix submitted in PR #1832 | D2 implementation-start inventory cites concrete rows for every public/durable surface class D2 may touch. |
| D1 receipt/command boundary | source implementation submitted through PR #1836 | D2 implementation-start inventory cites the D1 command/report/refusal family for malformed metadata and preserves D1 non-claims. |
| G-HOST host policy boundary | draft scaffold | Parallel host-policy prerequisite for D10, not a D2-enabled packet. Final D2 cross-domino review confirmed index/G-HOST metadata alignment. |

## D2 Implementation Start Gates

- [x] Current branch is on the linear Habitat implementation stack.
- [x] Concrete D0 `surface_id` citations are recorded in `workstream/implementation-start-inventory.md`.
- [x] D1 malformed-metadata output-family citations are recorded in `workstream/implementation-start-inventory.md`.
- [x] Current registry counts are refreshed from source: 53 rules, 33 Grit checks, 3 advisory rules, and 50 enforced rules.
- [x] The source boundary is TypeBox-first: `RuleRegistryDocumentV1` schemas, derived TypeScript types, TypeBox validation for serialized registry data, and named consumer projections under `tools/habitat-harness/src/rules/`.
- [x] Current D1 source topology is reflected: `rule-selection.ts`, `check-report.ts`, and `classify.ts` replace the deleted `command-engine.ts` as touched D2 consumer surfaces. `verify-receipt.ts` remains outside D2 scope.

## D2 Inventory Completion Gates

- [x] Current registry field inventory is recorded in `design.md`.
- [x] Target ontology and term disposition are recorded in `design.md`.
- [x] Facet contract and projection matrix are recorded in `design.md`.
- [x] D0/D1 dependency inventory is recorded in `design.md`.
- [x] Implementation write set and protected paths are recorded in `design.md`.
- [x] Spec requirement families and scenarios are recorded in `spec.md`.
- [x] Implementation task sequence is recorded in `tasks.md`.
- [x] Downstream projection handoffs are recorded in `downstream-realignment-ledger.md`.
- [x] Final D2 rereview accepts the repaired packet.

## Validation Results Recording Contract

Implementation validation results must use this shape:

| Gate ID | Command or check | Expected status | Actual status | Cache/freshness stance | Non-claims | Blocker disposition |
| --- | --- | --- | --- | --- | --- | --- |
| D2-REGISTRY | `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/projections.test.ts` | malformed rows fail before execution | exit 0; 16 tests passed | fresh test run | does not prove downstream packet closure | closed |
| D2-SELECTOR | `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts` | exit 0 | exit 0; 10 tests passed | fresh test run | does not prove every command execution path | closed |
| D2-CLASSIFY | `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts` and `bun run habitat classify tools/habitat-harness/src/rules/rules.json` | exit 0; no prose-scope authority | focused classify test exit 0; classify command previously exit 0 | fresh test/command runs | does not prove D4 orientation | closed |
| D2-GRAPH | `nx show project @internal/habitat-harness` plus graph-fact assertions | exit 0; structured target metadata observed | exit 0; plugin loaded canonical parser and projected targets | fresh Nx command | does not prove D3 graph truth | closed |
| D2-BASELINE | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` | exit 0 | exit 0; 13 tests passed | fresh test run | does not prove D5 shrink/growth policy | closed |
| D2-GRIT | `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts` | exit 0 | exit 0; 30 tests passed | fresh test run | does not prove D6 diagnostic catalog closure | closed |
| D2-GRITQL | `bun tools/habitat-harness/bin/dev.ts check --rule grit-habitat-adapter-domain-paths --json` | exit 0; generic adapter contains no hard-coded product/domain scan roots | exit 0; registered GritQL rule and baseline pass | fresh command run | enforces the D2 adapter-domain structural invariant only; does not prove all Grit rules | closed |
| D2-HOOK | `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` | exit 0 | exit 0; 28 tests passed | fresh test run | proves hook-facing D2 metadata compatibility only; does not prove D11 hook behavior closure | closed |
| D2-GENERATOR | `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | exit 0 | exit 0; 25 tests passed | fresh test run | does not prove D8 admission | closed |
| D2-COMMAND | `bun run habitat check -- --json` | expected command status recorded with D1 non-claims | failed: Oclif rejects extra `--`; `bun run habitat check --json` emits valid JSON and exits 1 with existing non-D2 findings | fresh command run | does not prove all rules semantically correct | recorded as historical command-shape mismatch; not a D2 source blocker |
| D2-OPENSPEC | `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` and `bun run openspec:validate` | exit 0 | exit 0 for D2 strict validation and full strict validation | fresh command runs | structural validation only | closed |
| D2-DIFF | `git diff --check` | exit 0 | exit 0 | fresh command run | whitespace only | closed |

## Non-Claims

- D2 does not close D3 resolved graph truth, D5 baseline authority, D6 diagnostic catalog semantics, D8 governance admission, D10/G-HOST protected-zone policy, D11 hook behavior, D12 verify workflow, or D13 scaffold/refusal behavior.
- D2 implementation does not make broad `habitat check --json` pass; existing non-D2 findings remain separately owned.
- D0 and D1 are consumed as submitted implementation-stack layers with D2-relevant source prerequisites cited, not as permission to change their packet-owned artifacts from the D2 layer.
- Legacy code names remain compatibility facts unless `design.md` accepts and narrows them.
- Current `check-report.ts` manual `CheckReport.command` construction is not D2-owned. The handoff is captured for D7/D12: D7 owns Oclif command context / request normalization for `habitat check`, and D12 owns verify affected-target argv construction after D3/D7 projections are live.
