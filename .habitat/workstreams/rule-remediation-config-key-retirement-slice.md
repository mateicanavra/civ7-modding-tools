# Rule Remediation Config-Key Retirement Slice

Status: closed

Canonical source of truth:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`

## Slice Boundary

Selected rows:

- `prohibit_hydrology_map_config_key_tokens`
- `prohibit_legacy_morphology_config_keys`

Excluded adjacent rows:

- none

Primary remediation objective:

Delete retired config-key lexical assertions without replacement. A valid
config pipeline is structurally owned by source schemas, TypeScript types, and
config compilation. Retired key literals do not need live Habitat assertions
unless there is concrete recurrence risk.

## Decision

The previous packet correctly found that current public config shape is owned
by strict source schemas and config compilation, but it overreached by trying
to replace Habitat lexical proxies with package negative tests. That is the
wrong proof owner.

The state-collapse correction is:

- retired config keys are retired;
- old literal forbids should disappear unless the exact literal is public,
  well-known, or likely to be recreated;
- package tests should not become storage for stale property blacklists;
- no source change is needed when the current source/type/config pipeline
  already owns valid config shape.

## Changes

Deleted packets:

- `.habitat/civ7/mapgen/domains/hydrology/_remainder/prohibit_hydrology_map_config_key_tokens/`
- `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_morphology_config_keys/`

Updated durable records:

- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`
- `.habitat/dominoes.md`

Updated method frames:

- `.habitat/frames/RULE-ACTION-CLASSIFICATION-FRAME.md`
- `.habitat/frames/RULE-DECISION-PACKET-FRAME.md`
- `.habitat/frames/RULE-REMEDIATION-SLICE-FRAME.md`

Regenerated execution-surface analytics:

- `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json`
- `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md`
- `docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md`

## Proof Boundary

This slice proves:

- the two retired-key Habitat rule manifests are no longer live;
- the canonical JSON live corpus count and ledger count reconcile at `120`;
- the deleted ids are retained only as retired-history/process evidence;
- no package negative tests or replacement Habitat lexical assertions were
  added.

This slice does not claim new config behavior. Existing source schemas,
TypeScript types, canonical map config validation, and config compilation
remain the behavior owners.

## Review Disposition

Fresh reviewers were asked to review:

- normative frame strength and generality;
- canonical JSON, domino receipt, and slice-record consistency.

Disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| Higher authority frame still allowed retired-literal pressure to route into package-local tests/validators. | P2 | repaired | `.habitat/FRAME.md` now qualifies package-local validation as live behavior/validation only and routes retired exact literals with no recurrence risk to `remove`. | none |
| Decision-packet frame introduced `source/type/config-pipeline authority; no live Habitat assertion` as a pseudo proof class. | P2 | repaired | Removed the pseudo proof class; retired-literal deletion now uses `source absence proof` plus record reconciliation, with source/type/config pipeline described as current-state owner rather than proof label. | none |
| Decision-packet frame had both `delete id` and `delete id without replacement`. | P3 | repaired | Normalized to `delete id without replacement`; replacement cases use `replace by native rail` or `replace by positive authority`. | none |
| Slice receipt left completed verification boxes unchecked. | P2 | repaired | Checklist now records live manifest/JSON count reconciliation, support/runner path check, `bun habitat classify .habitat`, and `git diff --check` evidence. | none |

## Closure Checklist

- [x] Rule packets deleted.
- [x] Canonical JSON updated.
- [x] Domino receipt updated.
- [x] Method frames updated with retired-literal state-collapse guidance.
- [x] Fresh reviewer findings dispositioned.
- [x] Live rule count reconciled: live manifests `120`, JSON `rules` `120`.
- [x] Support/runner references checked: `120` manifests scanned, no missing
  support or runner file refs.
- [x] `bun habitat classify .habitat` run: passed.
- [x] Execution-surface analytics regenerated: passed, reported `Surfaces:
  571; rule-json: 120; rule-module: 0`.
- [x] `git diff --check` run: passed.
- [x] Graphite commit created on branch `codex/habitat-config-key-retirement`.
