# Readiness R3 Aggregate Check Runnability Receipt

Date: 2026-07-06

Slice: R3, aggregate Habitat check runnability.

Authority:
`.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`
R3.

## Changes

Path A was taken.

`executeSelectedRulesEffect` now runs the independent structural rule lanes
with bounded top-level concurrency and lane-local result maps, then merges the
lane maps into the report result map. Report ordering remains owned by the
selected rule list in `report.policy.ts`, not by result-map insertion order.

`tools/habitat/docs/CAPABILITIES.md` was refreshed from live manifests:

- registered rules: 112;
- runner/mode counts: 70 Grit, 5 structure, 5 file-layer, 31 script, 1 Nx;
- lane counts: 111 enforced, 1 advisory;
- owner counts updated to current tree.

## Accepted Gate

The accepted R3 runnability gate is:

```bash
bun habitat check --json --output <json-path>
```

It now returns parseable JSON in bounded time. The final paired proof runs
completed in 32.30s and 32.53s wall time and wrote
`/tmp/habitat-r3-agg-det-a.json` and `/tmp/habitat-r3-agg-det-b.json`.

The gate currently exits 1 because the current rule state is red. This receipt
does not claim whole-corpus pass/green.

## Proof

Native tool behavior:

```bash
bun run --cwd tools/habitat check
```

Output: exited 0 (`tsc -p tsconfig.json --noEmit`).

Native tool behavior:

```bash
bunx biome check tools/habitat/src/service/model/check/policy/structural/execution.policy.ts tools/habitat/docs/CAPABILITIES.md
```

Output: exited 0 for the touched TypeScript file; the Markdown doc is not a
Biome-checked source file.

Habitat wrapper behavior:

```bash
/usr/bin/time -p bun habitat check --json --output /tmp/habitat-r3-agg-det-b.json > /tmp/habitat-r3-agg-det-b.stdout
```

Output: exited 1, not a hang. Timing: `real 32.53`, `user 80.55`,
`sys 20.49`. `/tmp/habitat-r3-agg-det-b.json` parsed as JSON with
`schemaVersion: 1`, 111 reported rule ids, 111 unique reported rule ids, and
no duplicates.

Habitat wrapper behavior:

```bash
jq 'walk(if type == "object" then del(.durationMs, .timing, .startedAt, .command) else . end)' /tmp/habitat-r3-agg-det-a.json > /tmp/habitat-r3-agg-det-a.normalized.json
jq 'walk(if type == "object" then del(.durationMs, .timing, .startedAt, .command) else . end)' /tmp/habitat-r3-agg-det-b.json > /tmp/habitat-r3-agg-det-b.normalized.json
diff -u /tmp/habitat-r3-agg-det-a.normalized.json /tmp/habitat-r3-agg-det-b.normalized.json
```

Output: exited 0 with no diff. This proves deterministic report order and
content across two aggregate runs after stripping expected timing and command
path variance.

Record truth proof:

```bash
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json -exec jq -r '.id' {} + | sort -u > /tmp/habitat-r3-live.ids
jq -r '.rules[].ruleId' /tmp/habitat-r3-agg-det-b.json | sort -u > /tmp/habitat-r3-agg-det-b.ids
comm -23 /tmp/habitat-r3-live.ids /tmp/habitat-r3-agg-det-b.ids
comm -13 /tmp/habitat-r3-live.ids /tmp/habitat-r3-agg-det-b.ids
jq -r '.rules[].ruleId' /tmp/habitat-r3-agg-det-b.json | sort | uniq -d
```

Output: default aggregate is missing only
`enforce_workspace_import_boundaries`; extra and duplicate outputs were empty.
This matches current default-local semantics, where unqualified
`bun habitat check` selects Grit and Habitat runners and not the Nx runner.

Record truth proof:

```bash
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json -exec jq -r '.runner.name' {} + | sort | uniq -c
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json -exec jq -r '.ownerProject' {} + | sort | uniq -c
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json -exec jq -r '.lane' {} + | sort | uniq -c
```

Output backed the refreshed `CAPABILITIES.md` counts.

Native tool behavior:

```bash
git diff --check
```

Output: exited 0.

## Current Red State

The final aggregate report is parseable and trustworthy, but red. The failing
rules were:

```text
validate_generated_map_entrypoint_contracts
verify_runtime_stage_order_matches_contract_manifest
verify_standard_recipe_artifacts_match_source_stages
verify_standard_recipe_public_authoring_surface
preserve_mapgen_core_runtime_neutrality
verify_visualization_runtime_build_artifacts
ensure_studio_worker_bundle_is_browser_safe
require_explicit_mapgen_sdk_opt_in
enforce_adapter_only_base_standard_imports
preserve_transport_pure_orpc_contracts
require_sanctioned_direct_control_session_owners
ensure_map_policy_dependency_independence
validate_mapgen_docs_anchors_and_references
enforce_formatting_and_import_hygiene
```

The separate Nx selector also returns parseable JSON:

```bash
/usr/bin/time -p bun habitat check --json --runner nx --output /tmp/habitat-r3-nx-final.json
```

Output: exited 0 in 5.53s with `enforce_workspace_import_boundaries` passing.

## Review

Fresh review lane: Chandrasekhar (`019f39d8-74c1-78c0-b692-c6d346d2349c`).

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Potential blocker: red aggregate might fail R3 closure. | P1 | rejected | R3 acceptance requires bounded parseable JSON with exit reflecting real rule state; receipt keeps the aggregate-red non-claim. |
| Nx selector proof was stale and falsely claimed a red missing-dist state. | P2 | accepted | Re-ran `bun habitat check --json --runner nx --output /tmp/habitat-r3-nx-final.json`; it exited 0 and the receipt now records that. |
| `Typecheck/build proof` was not an exact proof-class label. | P2 | accepted | Relabeled the proof as `Native tool behavior`. |
| Determinism was asserted but not proven. | P2 | accepted | Added paired aggregate normalized-report diff proof; the diff was empty. |
| Stack layer needed disposition. | P2 | accepted | R3 is reviewed on the current top of stack and will be committed as `codex/readiness-r3-aggregate-check-runnability` above the closed R4 layer. |

No accepted unresolved P1/P2 findings remain for R3.

## Non-Claims

This does not change rule pass/fail semantics, selectors, baselines, manifests,
or generated artifacts. It does not claim the aggregate report is green. It
does not claim the default aggregate covers the Nx runner; the default gate
reports 111 of 112 live rule ids by current selector semantics, with the Nx
rule checked separately above.
