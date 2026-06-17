# Phase Record - Control App Surface

## Current Gate

Native fixture expansion, parser inventory, active rule registration, explicit
empty baseline, injected-probe metadata, aggregate record alignment, and local
verification are implemented for `grit-control-app-surface`. Supervisor review
is the current gate before the next Grit row.

## Evidence Summary

- `CAS-NATIVE-FIXTURES-2026-06-15`: native Grit fixture proof passed with 6
  current-predicate matches and 0 ignore-sample matches.
- `CAS-CONTROL-SURFACE-INVENTORY-2026-06-15`: parser inventory over `apps`
  and `packages` found 849 current-predicate production `.ts`/`.tsx` files, 7
  total direct-control constructor expressions, 0 current-row candidates, 2
  sanctioned owner constructors, and 5 test-only constructors.
- `CAS-HABITAT-GRIT-TOOL-2026-06-15` and
  `CAS-PER-RULE-SELECTOR-2026-06-15`: Habitat wrapper and per-rule selector
  proof passed after CAS registration.
- `CAS-BASELINE-FILES-2026-06-15`: explicit empty Grit baseline inventory
  includes CAS.
- `CAS-INJECTED-PROBE-2026-06-15`: CAS-only injected probe/path-control proof
  passed from a clean start.

## Non-Claims

- Raw direct Grit acquisition remains
  `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- Full shared injected-corpus closure remains blocked by the accepted DDIT
  adapter scan-root/ignore activation gap; CAS-only injected proof is recorded
  separately.
- No broad direct-control import ban.
- No control-oRPC contract ownership proof.
- No source remediation.
- No baseline mutation or shrink behavior.
- No classify or generator behavior.
- No apply safety.
- No broader control architecture closure.
- No product/runtime proof.

## Next Actions

1. Await supervisor review of this bounded row checkpoint before opening the
   next Grit row.
