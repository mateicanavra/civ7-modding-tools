# Rule Remediation: G9 Advanced Guard Context Slice

Status: closed

Branch: `codex/habitat-g9-advanced-guard-context`

Canonical source:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

## Purpose

Close the G9 wrapper-only `advanced` guard packet without deleting the guard or
moving stale key pressure into package tests.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `prohibit_wrapper_only_advanced_config` | Moved from `pipeline/config/_remainder` to the standard recipe rules lane as live context authority. |

## Decision

The row is not garbage. Current guardrail docs explicitly retain G9 as a
Habitat guard for standard recipe source and map configs:
standard recipe config must not reintroduce persisted SDK-native `advanced`
wrappers.

The row is also not ready to become a generic config blueprint. Source schemas,
TypeScript types, and config compilation own valid config behavior; this Grit
rule owns source-shape relapse detection for the current standard recipe/map
config surface.

## Review Disposition

| Finding | Disposition |
| --- | --- |
| Deleting the rule would drop an explicitly documented G9 guard. | Rejected. The guard remains live. |
| Moving the assertion into package tests would recreate the stale-key junk drawer problem. | Rejected. No package tests were added. |
| The `_remainder` placement was no longer honest after the current docs were re-read. | Accepted. The packet moved to the standard recipe rules lane. |

## Verification

- `bun habitat check --rule prohibit_wrapper_only_advanced_config --json`
  passed.
- Source scan found no current `advanced:` or `"advanced":` keys under standard
  recipe source or maps.
- Canonical JSON and live manifests reconcile at 118.
- No package-owned tests were introduced.

