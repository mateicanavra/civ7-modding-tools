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

- [ ] Concrete D0 matrix rows exist for every D2-touched public or durable surface.
- [ ] D1 output family is cited for every malformed metadata failure family.
- [ ] Implementation branch starts from the approved implementation stack and is clean before source edits.
- [ ] Source changes stay inside the approved D2 write set.
- [ ] Protected paths are untouched or the packet is amended and re-reviewed.

## Implementation Closure Later

- [ ] Registry parser/projection tests pass with malformed-row bad cases.
- [ ] Selector, classify, baseline, Grit, injected-probe, hook, enforcement, generator, and Pattern Authority focused tests pass.
- [ ] `habitat classify tools/habitat-harness/src/rules/rules.json`, `habitat check -- --json`, and `nx show project @internal/habitat-harness` results are recorded with expected/actual status and non-claims.
- [ ] Public-surface changes are dispositioned through D0 compatibility.
- [ ] Downstream docs/tests/specs are realigned only where D2 changed accepted contract facts.
- [ ] Fallback inference is deleted where D2 projections replace it.
- [ ] Graphite layer is clean, reviewable, and does not proceed past unresolved packet approval.

## Non-Claims

- D2 design repair does not implement TypeScript source.
- D2 design/specification acceptance does not authorize source implementation.
- D2 design/specification acceptance does not prove public compatibility, downstream safety, runtime behavior, Graphite readiness, or product completion.
