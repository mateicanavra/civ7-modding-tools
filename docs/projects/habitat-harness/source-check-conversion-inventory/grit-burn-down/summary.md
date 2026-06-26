# Systematic Grit Adapter Burn-Down Summary

Status: implementation evidence

## Result

The team converted 25 additional active source-check rules to `grit-check` and deleted their matching central adapters. Together with the canary and final holdback split, active source-check state is now reduced from 29 rule-selected adapters to 0.

Final holdback closed:

- `require_explicit_mapgen_sdk_opt_in`

The residual was split: SDK opt-in authority remains in the SDK packet as `grit-check`, while the overlapping mapgen-core adapter-import ban is owned by `preserve_mapgen_core_runtime_neutrality`. The final adapter and `rule-runtime.policy.mjs` were deleted.

## Lane Outcomes

| Lane | Converted | Blocked | Proof file |
| --- | ---: | ---: | --- |
| `mapgen-domain` | 9 | 0 | `lanes/mapgen-domain.jsonl` |
| `mapgen-pipeline` | 10 | 0 | `lanes/mapgen-pipeline.jsonl` |
| `mapgen-other` | 4 | 0 | `lanes/mapgen-other.jsonl` |
| `platform-resources` | 2 | 0 | `lanes/platform-resources.jsonl` |
| `holdback-review` | 1 | 0 | `lanes/holdback-review.jsonl` |

## Important Finding

`prohibit_runtime_calls_to_runvalidated` initially reported `GritCommandFailed` during the pipeline lane. The row was re-tested during integration, passed `grit-check` and normal rule selection without pattern changes, and was converted. Treat that as a transient/concurrent-state proof failure, not evidence that the predicate cannot run in Grit.

## Next Domino

The source-check adapter/runtime surface is gone. Next work should target broad
command-check split rows and non-Grit ownership cleanup.
