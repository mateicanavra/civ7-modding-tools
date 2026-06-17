# Adversarial Review - Domain Deep Import

## Objective

Review the packet for false closure routes, hidden duplicate ownership, and
claims that current executable behavior does not support.

## Findings

### P1 - `ops-by-id` Was Claimed But Not Reported In Seed Probes

The packet and rule metadata claim `@mapgen/domain/<domain>/ops-by-id` as a
forbidden family. A disposable Grit probe showed `ops/private` reports, while
`ops-by-id` import and re-export failed to report in the seed run.

Accepted repair: the native predicate now requires exact `ops-by-id` followed
by a string-literal terminator. `DDI-NATIVE-FIXTURES-2026-06-15` proves
native import and re-export positives for exact `ops-by-id`, plus lookalike
negatives for `ops-by-identity`, `ops-by-id-extra`, and `ops-by-id/private`.
Current restacked shared selector/injected proof is represented only through
`HGPR-PER-RULE-SELECTORS-2026-06-15` and
`HGPR-INJECTED-GRIT-ROWS-2026-06-15`; DDI-specific generated-output and
path-control closure remain non-claims.

### P2 - Test-Path Ownership Was Under-Specified

The effective filename predicate reaches recipe/map-local test paths such as
`__tests__` and `__type_tests__`. A disposable probe confirmed those paths
report for `ops/private`.

Accepted repair: the packet now records recipe/map-local test paths as
included by the current predicate, external test roots as excluded, and proves
that native boundary through fixture paths and parser inventory. Current
restacked Habitat selector/current-tree proof is inherited through
`HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
`HGPR-PER-RULE-SELECTORS-2026-06-15`; raw and DDI-specific closure remain
non-claims.

### P2 - Recovery Claim Ledger Was Missing From Downstream Realignment

The packet named recovery claims as authority but did not list the recovery
claim ledger as a downstream surface.

Accepted repair: the downstream ledger now names H5, H6, baseline, and
stale-record rows, cites inherited shared proof ids after restack, and keeps
closure blocked for raw direct acquisition, DDI-specific path-control,
neighboring-rule closure, and product/runtime proof.

### P3 - Baseline Expansion Proof Needed Its Shared Owner

This row can prove an explicit empty baseline and unbaselined injected
findings, but shared baseline mutation safety belongs to the accepted
scaffold/baseline contract repair.

Accepted repair: the packet now links baseline file/integrity proof to
`HGPR-BASELINE-FILES-2026-06-15` and
`HGPR-BASELINE-INTEGRITY-2026-06-15` and does not let this row independently
claim a separate mutation policy.

## Positive Review Notes

The packet correctly rejects closure from native samples or current zero-result
scans alone. It also keeps apply safety, runtime/product proof, and
generated-output repair separate from this check row.
