# Lane Conversion Playbook

Status: active workstream reference

## Objective

Burn down source-check adapters only when a row already has accepted Grit pattern authority. The target move for each eligible row is:

1. prove the row still passes through source-check before editing;
2. switch `rule.json` from `source-check` to `grit-check`;
3. delete the matching central source-check adapter;
4. prove the row passes through grit-check and normal rule selection;
5. record row-owned evidence.

This playbook is deliberately row-level. A lane can batch commands, but it cannot hide a failed row inside a green lane.

## Sources To Read First

- `AGENTS.md`
- `docs/process/GRAPHITE.md`
- `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/habitat/1.0.0/skills/systematic-workstream/SKILL.md`
- `docs/projects/habitat-harness/source-check-conversion-inventory/canary-insights.md`
- `docs/projects/habitat-harness/source-check-conversion-inventory/grit-capability-notes.md`
- `docs/projects/habitat-harness/source-check-conversion-inventory/matrix.md`
- `docs/projects/habitat-harness/source-check-conversion-inventory/next-grit-extraction-slices.md`
- assigned lane rows in `docs/projects/habitat-harness/source-check-conversion-inventory/corpus.jsonl`

## Eligibility Gate

A row is eligible for conversion only when all of these are true:

- `ownerTool` is currently `source-check`.
- `primaryDisposition` is `grit_pattern_authority`.
- An adjacent `.pattern.md` or `.apply.pattern.md` exists.
- The matching central adapter exists under `.habitat/_support/execution/source-check/adapters/`.
- `bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool source-check --json` passes before editing.

Rows marked `needs_split`, `data_driven_import_path_rule`, `package_local_test_or_validator`, or `delete_or_demote` are not bulk-conversion rows in this workstream.

## Edit Contract

For each eligible row:

- In the row's `.rule.json`, change `"ownerTool": "source-check"` to `"ownerTool": "grit-check"`.
- In `detect`, change `["habitat", "check", "--tool", "source-check"]` to `["habitat", "check", "--tool", "grit-check"]`.
- Do not change `patternName`, `scanRoots`, `pathCoverage`, `hookCheck`, baseline files, `.pattern.md`, or `.apply.pattern.md`.
- Delete only `.habitat/_support/execution/source-check/adapters/<rule-id>.rule.mjs`.
- Do not edit `rule-runtime.policy.mjs` until all active adapters are gone and the final proof shows no runtime importers remain.

## Proof Contract

For each converted row, run:

```bash
bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool source-check --json
bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool grit-check --json
bun tools/habitat/bin/dev.ts check --rule <rule-id>
```

The first command is pre-edit proof. The second and third are post-edit proof.

If pre-edit source-check proof fails, do not convert that row. Record it as blocked.

If post-edit grit-check proof fails, revert that row's edit and adapter deletion only, then record the failure with the command output summary.

## Lane Output Contract

Each lane writes only:

- its assigned `.rule.json` files;
- its assigned adapter files;
- its assigned proof file under `grit-burn-down/lanes/`;
- no shared synthesized docs.

Use this JSONL shape for lane proof rows:

```json
{"ruleId":"<id>","lane":"<lane>","action":"converted|blocked|skipped","rulePath":"<path>","adapterPath":"<path|null>","preSourceCheck":"passed|failed|not_run","postGritCheck":"passed|failed|not_run","postNormalSelection":"passed|failed|not_run","notes":"<short evidence-backed note>"}
```

## Stop Conditions

Stop the lane and report immediately if:

- a row's `rule.json` no longer matches the expected source-check shape;
- a row has no adjacent Grit pattern authority;
- a converted row fails grit-check after source-check passed;
- a command mutates unrelated files outside the lane scope;
- a merge conflict or unrelated dirty file appears.

## Canary Lessons To Preserve

- Adapter deletion must stay coupled to owner conversion. Leaving adapters behind preserves the confusing execution surface.
- The scanner's expected adapter count is derived from active source-check records, so bulk conversion should not hard-code old counts.
- Grit can already carry simple import bans, multi-branch import/export/schema predicates, and helper-declaration predicates through normal Habitat rule selection.
- `rule-runtime.policy.mjs` is a deletion target only after the final active source-check adapter is gone.
