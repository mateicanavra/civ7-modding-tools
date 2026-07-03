# D2 Final Domain/Ontology Review

## Verdict

Accepted for design/specification.

D2 now clears the prior domain/ontology P1/P2 blockers for design/specification acceptance. I found no unresolved P1 or P2 findings in the repaired packet for target ontology, term disposition, owner boundaries, standard engineering vocabulary, inherited lazy terms, or proof/evidence product modeling.

This is not implementation acceptance. D2 source implementation remains blocked until concrete D0 surface rows exist for every touched public/durable surface and D1 output families are cited for malformed metadata behavior.

## Scope Read

Mandatory skills and ontology references read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`

D2 artifacts read:

- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
- All fresh D2 investigation docs under `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-*-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- Workstream files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/`

## Domain/Ontology Acceptance Notes

The repaired proposal correctly frames D2 as design/specification work only and states that later source work remains blocked on concrete D0 rows (`proposal.md:5`). It also says the earlier missing field inventory, target ontology, projection matrix, D0/D1 semantics, validation oracle, downstream handoffs, and TypeScript state model are now resolved in the packet (`proposal.md:7`).

The owner boundary is now explicit. D2 owns identity metadata completeness, the versioned registry document, term dispositions, rule state model, projection contracts, field-to-facet mapping, malformed metadata categories, and D0 compatibility-facade requirements (`design.md:48-57`). Adjacent owners are separated with named handoffs: D0 for public surfaces, D1 for command/refusal/report families, D3 for graph truth, D4 for routing guidance, D5 for baseline authority, D6 for diagnostics, D8 for Pattern Governance, G-HOST/D10 for protected-zone authority, D11 for local feedback, and D13 for scaffolding/refusal (`design.md:61-73`).

The target ontology now uses standard engineering vocabulary and assigns ownership for the accepted concepts: `RuleDefinition`, `RuleOwner`, `ExecutionAdapter`, `PathCoverage`, `GraphTargetReference`, `BaselineReference`, `GritPatternReference`, `PatternAuthorityReference`, `ProtectedZoneReference`, `LocalFeedbackEligibility`, and `RuleProjection` (`design.md:75-91`). This clears the prior ontology blocker; these are operational concepts with consumers and boundaries, not harvested nouns.

The type-state model is no longer left to implementation. D2 chooses `RuleRegistryDocument` with `schemaVersion: 1`, a closed `RuleRegistryRecord` union, and `ownerTool` as compatibility selector vocabulary/internal discriminant (`design.md:93-115`). Variant constraints eliminate the old optional-field states for missing Grit pattern, file-layer policy ambiguity, wrapped-test graph target ambiguity, and hidden hook/prose fallbacks (`design.md:132-142`).

The field inventory and term disposition now classify inherited terms instead of carrying them lazily. Current fields such as `ownerProject`, `ownerTool`, `lane`, `scope`, `nxTarget`, `gritPattern`, `hookScope`, `manifestPath`, `generatedZone`, and `OWNER_ROOTS` are mapped to target facets/statuses with bad cases (`design.md:145-163`). The term table explicitly rejects or narrows legacy terms: `ownerTool` is an `ExecutionAdapter`, `ownerProject` is narrowed to `RuleOwner.id`, `lane` is an internal `enforcementDisposition`, `scope` is rejected as target authority, `nxTarget` becomes `GraphTargetReference`, and unqualified `manifestPath` is rejected (`design.md:197-215`).

Projection boundaries are operational. The facet contract names ownership, required fields, forbidden fields, failure modes, and consumers (`design.md:165-178`). The projection matrix names consumer-specific reads and exclusions for selector, report, execution, routing, graph, baseline, Grit, generated-zone, governance, and local-feedback facts (`design.md:180-195`). Whole-row leakage is forbidden unless D2 amends the matrix with a named exception and reason (`design.md:195`).

The proof/evidence product-model problem is resolved. Proposal non-claims reject a shared provenance or proof/evidence model (`proposal.md:42`). The domain boundary says D2 malformed metadata uses D1 output families and does not invent proof/evidence artifacts (`design.md:64`). Term disposition rejects `proof` and `evidence` as D2 product terms except source-evidence prose (`design.md:215`), and the D1 dependency inventory forbids a separate proof/evidence/generic artifact result shape (`design.md:243`).

The spec now reinforces the ontology instead of leaving it as prose. It requires a versioned faceted schema (`spec.md:3-21`), closed term dispositions (`spec.md:23-32`), projection-only cross-domain reads (`spec.md:34-45`), namespace-aware selector facts (`spec.md:47-59`), no prose-scope routing (`spec.md:61-78`), graph facts without `plugin.js` owner-root/colon parsing authority (`spec.md:80-92`), baseline/Grit/generated-zone/governance boundaries (`spec.md:94-146`), D1 malformed metadata handling (`spec.md:148-155`), and named downstream projection consumption (`spec.md:157-169`).

Downstream handoffs are sufficiently explicit for design/specification acceptance. The downstream ledger names direct consumers D3, D4, D5, D6, D7, D8, D10, and D13 with consumed projections and separate source implementation gates (`downstream-realignment-ledger.md:7-18`). It also marks G-HOST as parallel host-policy work, D9/D11/D12/D14 as indirect consumers, and D15 as not a D2 consumer (`downstream-realignment-ledger.md:20-29`).

## Prior Findings Disposition

- Prior P1, facet/projection contract unspecified: cleared by `design.md:165-195` and `spec.md:34-45`.
- Prior P1, public-surface/D0/D1 dependency unresolved: cleared for design/specification by `proposal.md:44-48`, `design.md:217-243`, and `downstream-realignment-ledger.md:31-41`; implementation remains blocked on concrete D0 rows.
- Prior P1, spec too thin: cleared by the requirement families in `spec.md:3-169`.
- Prior P2, validation gates not falsifying enough: cleared for design/specification by `proposal.md:90-100`, `phase-record.md:39-54`, and `tasks.md` validation items; implementation validation remains pending.
- Prior P2, downstream realignment generic: cleared by `downstream-realignment-ledger.md:7-49`.
- Prior P2, leaky domain owner/inherited terminology: cleared by `design.md:46-91` and `design.md:197-215`.
- Prior P2, tasks left open design work: cleared for design/specification by the ordered task slices in `tasks.md`; source execution remains a later phase.

## Validation Run

- `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict`: passed; `Change 'deep-habitat-d2-rule-registry-metadata-contract' is valid`.
- `bun run openspec:validate`: passed; `249 passed, 0 failed`.
- `git diff --check`: passed.

These are structural/whitespace checks only. They do not prove source implementation, runtime behavior, public compatibility, downstream implementation safety, or Graphite readiness.

## Packet Index Disposition

The packet index can mark D2 accepted for design/specification only. Recommended status wording:

`accepted for design/specification; final domain/ontology review found no unresolved P1/P2 blockers; not implementation-complete; source implementation remains blocked until concrete D0 rows exist for every D2-touched public/durable surface and D1 malformed-metadata output families are cited`

This acceptance should not be described as source implementation readiness or execution authority.

Skills used: domain-design, information-design, ontology-design.
