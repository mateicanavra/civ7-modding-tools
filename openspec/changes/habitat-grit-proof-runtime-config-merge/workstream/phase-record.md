# Phase Record - Runtime Config Merge Active Check

## Current Gate

Gate: active check implementation, proof, and local Graphite checkpoint are
complete; supervisor review is pending. The prior five-candidate blocker is
resolved by source remediation; native fixture proof, parser zero-candidate
inventory, wrapper selector proof, aggregate wrapper proof, baseline inventory
proof, and clean-start RCM injected/path-control proof have passed. The
aggregate injected runner remains current-red only on the accepted DDIT adapter
activation gap.

## Scope

This checkpoint owns:

- source remediation for the five previous live `?? {}` runtime candidates;
- active `runtime_config_merge` native predicate and fixtures;
- parser inventory over Swooper recipe/domain roots;
- Habitat `rules.json`, explicit empty baseline, and injected-probe metadata;
- corpus ledger, proof matrix, command proof log, and row-packet alignment.

This checkpoint does not own:

- raw direct Grit acquisition;
- generic apply/codemod safety;
- HR classify/generator behavior;
- retired full-profile parity;
- broader runtime-purity closure;
- product/runtime proof.

## Evidence

- `RCM-SOURCE-REMEDIATION-2026-06-15`: source remediation and focused tests.
- `RCM-NATIVE-FIXTURES-2026-06-15`: focused native fixture proof.
- `RCM-NATIVE-CORPUS-REFRESH-2026-06-15`: full native corpus proof.
- `RCM-RUNTIME-INVENTORY-2026-06-15`: post-remediation parser inventory /
  live zero-candidate proof.
- `RCM-PER-RULE-SELECTOR-2026-06-15`: Habitat per-rule wrapper proof.
- `RCM-HABITAT-GRIT-TOOL-2026-06-15`: Habitat aggregate Grit wrapper proof.
- `RCM-BASELINE-FILES-2026-06-15`: explicit empty Grit baseline inventory.
- `RCM-INJECTED-PROBE-2026-06-15`: clean-start runner from the committed row
  head reported RCM with one diagnostic at the runtime-step probe path and a
  clean stage-root control path; the overall runner exit remains 1 because DDIT
  injected activation is still blocked separately.

## Review / Findings

`RCM-LIVE-CANDIDATE-BLOCKER-2026-06-15` is resolved locally by
`RCM-SOURCE-REMEDIATION-2026-06-15` and
`RCM-RUNTIME-INVENTORY-2026-06-15`: the five prior current-predicate candidates
are removed and the post-remediation parser inventory is empty for current
RCM candidates.

## Next Actions

1. Stop for supervisor review before selecting another HG row.
