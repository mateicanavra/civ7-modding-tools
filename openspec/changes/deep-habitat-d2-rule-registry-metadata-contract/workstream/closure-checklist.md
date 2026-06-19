# Closure Checklist: D2 Rule Registry Metadata Contract

## Design Readiness

- [x] Proposal cites controlling authority, source packet, negative review, fresh investigations, D0, and D1.
- [x] Design records current diagnosis, target ontology, owner boundaries, term dispositions, field inventory, facet contract, projection matrix, D0/D1 dependencies, write set, protected paths, and refactor sequence.
- [x] Spec delta uses separate normative requirements and scenarios for schema, terms, projections, selectors, routing, graph, baseline, Grit, generated-zone, governance, malformed metadata, and downstream projection use.
- [x] Tasks are ordered implementation steps with explicit source blockers and validation gates.
- [x] Review ledger imports the prior D2 negative review and fresh investigation findings.
- [x] Downstream realignment names direct and indirect consumers with projection dependencies.
- [x] Fresh final D2 rereview has no accepted unresolved P1/P2 findings, including the final code/topology recheck for `grit-injected-probe.ts` and hook validation.
- [x] OpenSpec validation passes for `deep-habitat-d2-rule-registry-metadata-contract`.
- [x] Full OpenSpec validation passes.
- [x] Packet index is updated only after final D2 rereview acceptance.

## Implementation Prerequisites Later

- [x] Concrete D0 matrix rows exist for every D2-touched public or durable surface and are cited in `workstream/implementation-start-inventory.md`.
- [x] D1 output family is cited for every malformed metadata failure family in `workstream/implementation-start-inventory.md`.
- [x] Implementation branch starts from the approved implementation stack and was clean before D2 implementation-start edits.
- [x] Source changes stay inside the approved D2 write set.
- [x] Protected paths are untouched or the packet is amended and re-reviewed.
  - `verify-receipt.ts` was removed from the D2 write set; D2 does not own D12 verify receipt behavior.

## Implementation Closure Later

- [x] Registry parser/projection tests pass with malformed-row bad cases.
- [x] Selector, classify, baseline, Grit, injected-probe, hook, generator, Pattern Authority, registry, and Biome/plugin focused tests pass.
  - Focused suite: `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/lib/hooks.test.ts test/lib/rule-selection.test.ts test/lib/classify.test.ts test/lib/baseline.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts test/rules/registry/contract.test.ts test/rules/registry/projections.test.ts test/lib/biome-closure.test.ts` exits 0 with 149 tests passing.
- [x] Structural adapter-domain invariant is enforced through Habitat-owned GritQL, not a manual architecture test.
  - `grit-habitat-adapter-domain-paths` is registered in `rules.json` with exact adapter path coverage and an empty baseline; `bun tools/habitat-harness/bin/dev.ts check --rule grit-habitat-adapter-domain-paths --json` exits 0.
- [x] `habitat classify tools/habitat-harness/src/rules/rules.json`, `habitat check -- --json`, and `nx show project @internal/habitat-harness` results are recorded with expected/actual status and non-claims.
  - `nx show project @internal/habitat-harness` passes through the canonical parser-backed plugin. The documented `habitat check -- --json` shape is a historical command-shape mismatch because Oclif rejects the extra `--`; the D0-cited command shape `habitat check --json` emits valid CheckReport JSON and exits 1 with existing non-D2 findings.
- [x] Public-surface changes are dispositioned through D0 compatibility.
- [x] Downstream docs/tests/specs are realigned only where D2 changed accepted contract facts.
- [x] Fallback inference is deleted where D2 projections replace it.
- [ ] Graphite layer is clean, reviewable, and does not proceed past unresolved packet approval.

## Non-Claims

- D2 implementation does not close D3 resolved graph truth, D5 baseline authority, D8 governance admission, D11 hook behavior, D12 verify workflow, or D13 scaffold/refusal behavior.
- D2 implementation does not make broad `habitat check --json` pass; existing non-D2 findings remain separately owned.
- D2 is not packet-closure complete until final review and Graphite closure are resolved or explicitly accepted.
