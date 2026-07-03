# Closure Checklist: D1 Receipt And Command Record Boundary

## Design Readiness

- [x] Proposal cites controlling authority, D0 dependency, source packet, and D1 investigations.
- [x] Design resolves target language, owner map, term disposition, relationship ontology, state families, non-claims, write set, protected paths, and structural alternatives.
- [x] Tasks are ordered implementation actions with explicit stop conditions.
- [x] Spec delta uses separate normative requirements and scenarios for every contract family.
- [x] Review ledger imports prior D1 negative findings and records repair evidence.
- [x] Downstream realignment names D6-D14 consumers and D15 trigger rule.
- [x] Fresh final per-domino review has no accepted unresolved P1/P2 findings.
- [x] OpenSpec validation passes for `deep-habitat-d1-receipt-contract-boundary`.
- [x] Full OpenSpec validation passes.

## Implementation Prerequisites

- [x] Concrete D0 matrix rows exist for every affected D1 surface.
- [x] Every D1 inventory row cites a D0 `surface_id` or is explicitly internal/protected.
- [x] Implementation branch starts from the approved implementation stack and is clean before source edits.
- [x] Source changes stay inside the approved D1 write set as amended by the user-directed command-engine deletion/replacement path.
- [x] Protected paths are untouched, or residual changes are recorded as downstream-owned compatibility context rather than D1 source edits.

## Implementation Closure

- [x] Focused Habitat tests pass with D1 bad cases: `test/lib/verify-receipt.test.ts` covers skipped, executed, and failed Nx states; `test/commands/habitat-entrypoints.test.ts`, `test/lib/hooks.test.ts`, `test/lib/grit-apply.test.ts`, and the focused D1 suite pass.
- [x] Validation evidence is recorded in `phase-record.md` with D1 non-claims: package-local check and focused receipt/command tests are D1 closure evidence; broad current-tree `habitat check --json` and full `habitat verify --json` are not claimed as D1 closure proof.
- [x] Public-surface changes are dispositioned through D0 compatibility: proof/evidence artifact runtime surfaces were deleted as product-inappropriate; verify behavior is retained as a receipt boundary with D12 owning full workflow handoff.
- [x] Downstream docs/tests/specs are realigned only where D1 changed accepted contract facts; D15 remains untriggered.
- [x] Graphite layer is clean and reviewable: PR #1835 deletes the command-engine monolith and PR #1836 replaces it with focused command modules; PR #1836 v3 includes the D1 closure-record repairs.

## Residual Owners / Next Actions

- D11 owns hook help/local-feedback command-surface closure if it changes the historical `habitat hook --help` behavior.
- D12 owns full `habitat verify --json` workflow composition and handoff closure beyond the D1 receipt state model.
- D7/D12 or a later command-workflow packet owns broad current-tree `habitat check --json` performance/current-tree closure if it becomes a product requirement.
- D2 remains blocked for source implementation until it records exact D0 `surface_id` citations and D1 malformed-metadata/output-family citations for every D2-touched public/durable surface.
- Habitat still has command-surface architecture debt around manual command-string construction such as `buildHabitatCommand`; no accepted D0-D15 packet currently owns a full Oclif-native replacement. This must be handled by a deliberate command-surface repair packet or explicit expansion before later packets rely on those helpers as target architecture.

## Non-Claims

- D1 source implementation does not prove CI, runtime behavior, apply safety, Graphite readiness, current-tree cleanliness, product completion, rule correctness, broad `habitat check --json` freshness, or full `habitat verify --json` workflow handoff.
- D1 does not retain proof/evidence artifact runtime surfaces as target product behavior.
- D1 does not close D2 registry metadata, D11 hook behavior, D12 verify workflow composition, D15 execution provenance, or the separate Oclif-native command-surface repair.
