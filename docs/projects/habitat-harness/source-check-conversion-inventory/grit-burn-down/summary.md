# Systematic Grit Adapter Burn-Down Summary

Status: implementation evidence

## Result

The team converted 25 additional active source-check rules to `grit-check` and deleted their matching central adapters. Together with the canary, active source-check state is now reduced from 29 rule-selected adapters to 1.

Current residual:

- `require_explicit_mapgen_sdk_opt_in`

The residual remains intentionally because it mixes SDK opt-in authority with a mapgen-core adapter-import ban that overlaps `preserve_mapgen_core_runtime_neutrality`.

## Lane Outcomes

| Lane | Converted | Blocked | Proof file |
| --- | ---: | ---: | --- |
| `mapgen-domain` | 9 | 0 | `lanes/mapgen-domain.jsonl` |
| `mapgen-pipeline` | 10 | 0 | `lanes/mapgen-pipeline.jsonl` |
| `mapgen-other` | 4 | 0 | `lanes/mapgen-other.jsonl` |
| `platform-resources` | 2 | 0 | `lanes/platform-resources.jsonl` |
| `holdback-review` | 0 | 1 | `lanes/holdback-review.jsonl` |

## Important Finding

`prohibit_runtime_calls_to_runvalidated` initially reported `GritCommandFailed` during the pipeline lane. The row was re-tested during integration, passed `grit-check` and normal rule selection without pattern changes, and was converted. Treat that as a transient/concurrent-state proof failure, not evidence that the predicate cannot run in Grit.

## Next Domino

Split `require_explicit_mapgen_sdk_opt_in`:

- keep SDK entrypoint opt-in/source-shape authority as Grit pattern authority;
- remove or demote the overlapping mapgen-core adapter-import branch now covered by `preserve_mapgen_core_runtime_neutrality`;
- delete the final adapter and then `rule-runtime.policy.mjs` once no importers remain.
