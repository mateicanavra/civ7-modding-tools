# Review Disposition Ledger - Domain Deep Import Tests

## Current Review State

This row checkpoint is implemented as native/parser/source proof plus current
wrapper/current-tree and injected violation/path-control proof after the accepted
HR adapter projection repair. Supervisor review remains required before treating
this DDIT closure disposition as accepted.

| Finding id | Priority | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| `DDIT-INITIAL-TEST-EXCEPTION-2026-06-15` | P2 | Test policy could be read as allowing current deep imports without enforcement. | Repaired. Current live test deep imports were remediated to public surfaces or local public-type-derived shapes, and the row is registered with an explicit empty baseline. Future exceptions require explicit architecture disposition rather than silent deep import drift. | `DDIT-E1`; `DDIT-SOURCE-REMEDIATION-2026-06-15`; `DDIT-TEST-IMPORT-INVENTORY-2026-06-15` |
| `DDIT-DYNAMIC-SOURCE-CLASS-2026-06-15` | P3 | Dynamic imports and source strings are adjacent source classes that can look like deep imports. | Re-scoped. Native fixtures and parser inventory record them as controls/context only; this row proves static import/export declarations. | `DDIT-NATIVE-FIXTURES-2026-06-15`; `DDIT-TEST-IMPORT-INVENTORY-2026-06-15` |
| `DDIT-P2-STATIC-IMPORT-FORMS-2026-06-15` | P2 | The row claimed static test import enforcement, but the native fixture did not prove namespace imports or side-effect imports. | Repaired. The pattern now includes the documented side-effect import snippet form and the native fixture proves namespace and side-effect deep-domain positives while preserving dynamic import and source-string controls. | `DDIT-E1`; `DDIT-NATIVE-FIXTURES-2026-06-15` |
| `DDIT-P2-WRAPPER-TEST-SCAN-ACTIVATION-2026-06-15` | P2 | Native Grit can match DDIT-owned test files, but Habitat wrapper/injected projection did not scan those test roots before the adapter projection repair. | Repaired by accepted downstack HR adapter projection. The row now has per-rule wrapper, aggregate `grit-check`, and clean-start injected proof for the DDIT test-root projection; broad `.gritignore` test-ignore removal remains rejected and unclaimed. | `DDIT-HABITAT-GRIT-TOOL-2026-06-17`; `DDIT-PER-RULE-SELECTOR-2026-06-17`; `DDIT-INJECTED-PROBE-2026-06-17` |
