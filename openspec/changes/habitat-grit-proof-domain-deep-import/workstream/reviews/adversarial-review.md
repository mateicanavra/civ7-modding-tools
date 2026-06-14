# Adversarial Review - Domain Deep Import

## Objective

Review the packet for false closure routes, hidden duplicate ownership, and
claims that current executable behavior does not support.

## Findings

### P1 - `ops-by-id` Is Claimed But Not Reported

The packet and rule metadata claim `@mapgen/domain/<domain>/ops-by-id` as a
forbidden family. A disposable Grit probe showed `ops/private` reports, while
`ops-by-id` import and re-export do not report.

Accepted repair: the packet now records this as a current semantic defect and
requires predicate repair, native positives, injected wrapper positives, and
lookalike negatives before closure.

### P2 - Test-Path Ownership Was Under-Specified

The effective filename predicate reaches recipe/map-local test paths such as
`__tests__` and `__type_tests__`. A disposable probe confirmed those paths
report for `ops/private`.

Accepted repair: the packet now requires an explicit ownership decision for
recipe/map-local tests and external test roots, with fixtures and current-tree
records proving the selected scope.

### P2 - Recovery Claim Ledger Was Missing From Downstream Realignment

The packet named recovery claims as authority but did not list the recovery
claim ledger as a downstream surface.

Accepted repair: the downstream ledger now names H5, H6, baseline, and
stale-record rows and blocks closure until aggregate proof ids exist.

### P3 - Baseline Expansion Proof Needed Its Shared Owner

This row can prove an explicit empty baseline and unbaselined injected
findings, but shared baseline mutation safety belongs to the accepted
scaffold/baseline contract repair.

Accepted repair: the packet now links expansion safety to that owner and does
not let this row independently claim shared mutation policy.

## Positive Review Notes

The packet correctly rejects closure from native samples or current zero-result
scans alone. It also keeps apply safety, runtime/product proof, and
generated-output repair separate from this check row.
