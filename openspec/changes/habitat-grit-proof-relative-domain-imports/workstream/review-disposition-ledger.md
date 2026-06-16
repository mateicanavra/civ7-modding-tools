# Review Disposition Ledger - Relative Domain Imports

| Finding id | Lane | Severity | Finding | Disposition | Repair / rationale | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RDI-R1 | product/proof | P2 | The six relative recipe-to-domain imports are live source reaches and should not remain as a native-only or record-only gap. | accepted | Source remediation plus active `grit-relative-domain-imports` registration, explicit empty baseline, wrapper proof, and injected proof close this recurrence class. | repaired |
| RDI-R2 | adversarial Grit predicate | P1 | A broad `(?:../)+domain/` source predicate overmatches any literal `domain` segment and does not prove repository `src/domain` reach. | accepted | Predicate now uses exact filename-depth arms for stage-root, direct-step, nested-step, and map-root files, with same-root short-depth controls in fixtures and injected proof. | repaired |
