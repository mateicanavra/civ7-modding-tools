# Phase Record: D2 Rule Registry Metadata Contract

## State

- Status: accepted for design/specification after final D2 rereview and focused code/topology recheck; implementation-start grounding is active on the Habitat stack.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d2-rule-registry-metadata-contract`.
- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`.
- OpenSpec change: `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract`.

## Objective

Convert D2 into a complete OpenSpec design/specification packet for Rule Registry Metadata: a versioned registry document, closed TypeScript state model, target ontology, field inventory, projection matrix, D0/D1 dependency inventory, validation gates, and downstream projection handoffs.

## Current Gate

Design/specification gate is closed for D2. D2 source implementation may start only from the current Habitat stack after concrete D0 matrix rows exist for every D2-touched public/durable surface, D1 malformed-metadata output-family citations exist, and the TypeBox-first registry boundary is recorded.

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
- [x] Current registry counts are refreshed from source: 52 rules, 32 Grit checks, 3 advisory rules, and 49 enforced rules.
- [x] The source boundary is TypeBox-first: `RuleRegistryDocumentV1` schemas, derived TypeScript types, TypeBox validation for serialized registry data, and named consumer projections under `tools/habitat-harness/src/rules/`.
- [x] Current D1 source topology is reflected: `rule-selection.ts`, `check-report.ts`, `classify.ts`, and `verify-receipt.ts` replace the deleted `command-engine.ts` as touched D2 consumer surfaces.

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
| D2-REGISTRY | registry parser/projection tests | malformed rows fail before execution | pending | fresh test run | does not prove downstream packet closure | pending |
| D2-SELECTOR | `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts` | exit 0 | pending | fresh test run | does not prove execution behavior | pending |
| D2-CLASSIFY | `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts` and `bun run habitat classify tools/habitat-harness/src/rules/rules.json` | exit 0; no prose-scope authority | pending | fresh command/test run | does not prove D4 orientation | pending |
| D2-GRAPH | `nx show project @internal/habitat-harness` plus graph-fact assertions | exit 0; structured target metadata observed | pending | record Nx cache status if shown | does not prove D3 graph truth | pending |
| D2-BASELINE | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` | exit 0 | pending | fresh test run | does not prove D5 shrink/growth policy | pending |
| D2-GRIT | `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts` | exit 0 | pending | fresh test run; Grit cache status recorded if emitted | does not prove D6 diagnostic catalog closure | pending |
| D2-HOOK | `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` | exit 0 | pending | fresh test run | proves hook-facing D2 metadata compatibility only; does not prove D11 hook behavior closure | pending |
| D2-GENERATOR | `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | exit 0 | pending | fresh test run | does not prove D8 admission | pending |
| D2-COMMAND | `bun run habitat check -- --json` | expected command status recorded with D1 non-claims | pending | fresh command run | does not prove all rules semantically correct | pending |
| D2-OPENSPEC | `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` and `bun run openspec:validate` | exit 0 | pending | fresh command run | structural validation only | pending |
| D2-DIFF | `git diff --check` | exit 0 | pending | fresh command run | whitespace only | pending |

## Non-Claims

- D2 design repair did not implement Habitat source changes.
- D2 implementation-start grounding does not by itself close D2 source implementation.
- D2 design repair does not prove runtime behavior, current-tree cleanliness, Graphite readiness, public compatibility, downstream safety, or OpenSpec closure.
- D0 and D1 are consumed as submitted implementation-stack layers with D2-relevant source prerequisites cited, not as permission to change their packet-owned artifacts from the D2 layer.
- Legacy code names remain compatibility facts unless `design.md` accepts and narrows them.
