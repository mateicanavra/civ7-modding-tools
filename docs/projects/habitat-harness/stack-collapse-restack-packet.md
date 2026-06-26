# Habitat Graphite Stack Collapse Packet

## Summary

Collapse the Habitat DRA Graphite stack from 300 branches to 17 semantic branches, then restack once against current `main`. The existing draft PRs `#1831` through `#1883` are superseded review surfaces. Their branch intent is preserved in `stack-collapse-fold-map.json`, but the replacement stack is the review surface after folding.

Current baseline:

- Main stack: `agent-DRA-deep-habitat-prep-frame` through `agent-DRA-habitat-final-source-check-runtime-delete`.
- Original stack length: 300 linear branches.
- Stack base: `74363efe54`.
- Current `main`: `921075e9c6`.
- Trunk flow-in set: `#1811`, `#1812`, `#1851`, `#1852`, and `#1884` through `#1924`.
- Conflict hotspots: `package.json`, `docs/process/CONTRIBUTING.md`, Swooper package/test/generated outputs, MapGen Core export shape, and repo-local skill routing.

## Fold Matrix

Fold top-down from group 17 to group 1. Use plain `gt fold` so each group collapses into its original bottom branch. After all folds, rename the 17 survivors to the final semantic names.

| # | Original Range | Original Survivor | Final Branch Name | Semantic Boundary |
|---|---:|---|---|---|
| 1 | 1-24 | `agent-DRA-deep-habitat-prep-frame` | `codex/habitat-d0-d15-implementation-frame` | D0-D15/G-HOST authority frame, public-surface compatibility, proof discipline |
| 2 | 25-38 | `agent-DRA-effect-first-repair-backlog` | `codex/habitat-effect-substrate-service-roots` | Effect-first backlog, substrate, service module roots |
| 3 | 39-51 | `agent-DRA-effect-grit-apply-cutover` | `codex/habitat-effect-domain-public-guardrails` | Domain cutovers, public facade, public guards |
| 4 | 52-70 | `agent-DRA-effect-native-platform-resource-drain` | `codex/habitat-effect-provider-test-drains` | Provider/resource/test drains |
| 5 | 71-90 | `agent-DRA-effect-root-check-verify-split` | `codex/habitat-effect-graph-sourcecheck-routing` | Graph, source-check, routing, validation target policy |
| 6 | 91-120 | `agent-DRA-effect-source-check-file-planner` | `codex/habitat-effect-validation-prepush-sourcecheck` | Source-check planning, pre-push, validation lanes |
| 7 | 121-133 | `agent-DRA-effect-root-check-graph-validation-closure` | `codex/habitat-effect-runtime-provider-closure` | Effect runtime/provider closeout |
| 8 | 134-147 | `agent-DRA-habitat-service-consolidation` | `codex/habitat-service-orpc-router-model` | Habitat service consolidation, oRPC, router/model shift |
| 9 | 148-164 | `agent-DRA-habitat-workspace-model-kinds` | `codex/habitat-model-kinds-router-imports` | Model kinds, router import shape, service wrapper removal |
| 10 | 165-180 | `agent-DRA-habitat-hook-reporter-resource` | `codex/habitat-service-context-resources` | Hook/service context and resource threading |
| 11 | 181-197 | `agent-DRA-habitat-source-check-policy-drain` | `codex/habitat-policy-reporoot-baseline-context` | Policy, repo-root, baseline, source-scope context |
| 12 | 198-223 | `agent-DRA-habitat-rule-facts-context` | `codex/habitat-rule-registry-graph-context` | Rule facts, registry/path, graph/worktree context |
| 13 | 224-242 | `agent-DRA-habitat-verify-policy-ports` | `codex/habitat-ports-provider-config-output` | Ports, provider/config, module result/output surfaces |
| 14 | 243-265 | `agent-DRA-habitat-service-model-note-hygiene` | `codex/habitat-service-model-execution-ratchets` | Service-model ratchets, actions, execution lanes |
| 15 | 266-275 | `agent-DRA-habitat-authority-tooling-aggregation` | `codex/habitat-authority-tree-relocation` | Authority tooling, triage hierarchy, rule/layer/script relocation |
| 16 | 276-288 | `agent-DRA-node24-lts-upgrade-plan` | `codex/habitat-package-taskgraph-embedded-authority` | Node/package/task graph cleanup, embedded authority migration |
| 17 | 289-300 | `agent-DRA-habitat-universal-subject-categories` | `codex/habitat-authority-physicalization-sourcecheck-burn` | Authority tree physicalization, pruning, final source-check/Grit burn |

## PR Disposition

Draft PRs `#1831` through `#1883` are superseded. Do not try to preserve old PR association through branch renames. The replacement stack should create 17 new PRs with the final semantic branch names, then the old draft PRs should be closed with a superseded-by note pointing to the replacement stack.

Open PR-backed survivor renames:

- `agent-DRA-deep-habitat-prep-frame` to `codex/habitat-d0-d15-implementation-frame`.
- `agent-DRA-effect-first-repair-backlog` to `codex/habitat-effect-substrate-service-roots`.
- `agent-DRA-effect-grit-apply-cutover` to `codex/habitat-effect-domain-public-guardrails`.

Use `gt branch rename --force --no-interactive` only for these PR-backed survivors. Non-PR-backed survivors should not need `--force`.

## Restack Lookahead

Integrate trunk PRs `#1811`, `#1812`, `#1851`, `#1852`, and `#1884` through `#1924` during the single post-fold restack. The stack should not repeatedly resolve the same trunk conflict across 300 layers.

Expected conflict policy:

- Root scripts and build workflow: root `AGENTS.md`, `docs/process/GRAPHITE.md`, Habitat `FRAME.md`, and Habitat taxonomy/Nx settlement win.
- Habitat package/tool rename and checks: Habitat frame, DRA takeover frame, and current source behavior win.
- Swooper generated/mod outputs: `mods/mod-swooper-maps/AGENTS.md` wins; regenerate generated output instead of hand-merging.
- MapGen Core exports: current MapGen architecture authority wins; do not resurrect `./lib/heightfield` unless folded Habitat code still requires it.
- Repo-local skills: trunk `#1924` wins; do not reintroduce removed globalized skill files.

## Execution Ledger

Preflight:

- `git status --short --branch`.
- `git worktree list --porcelain`.
- `gt --version`.
- `gt log short --reverse --all`.
- `gt submit --stack --dry-run --branch agent-DRA-habitat-final-source-check-runtime-delete --no-interactive`.
- `git config --get rerere.enabled`.
- `git rerere status`.

Mutation:

- Fold groups 17 through 1 with plain `gt fold`.
- After each group, inspect `gt log short --reverse --all`.
- Use dry-run submit checks as stack health proof, with full dry-run before and after the collapse.
- Rename survivors only after all folds.
- Restack once with `gt restack --branch codex/habitat-authority-physicalization-sourcecheck-burn --downstack --no-interactive`.

Stop conditions:

- Unexpected branch deletion outside the planned absorbed branch.
- An unledgered Graphite prompt.
- Any generated-output conflict requiring a hand merge.
- A dry-run mismatch that does not list exactly the intended survivor stack.
- Any branch outside the Habitat DRA root being pulled into the collapse.

## Review And Verification

Review lanes before submit:

- Topology/accounting: every original branch appears once in `stack-collapse-fold-map.json`.
- Semantic boundary: D0-D15/G-HOST, Effect, source-check/Grit, authority-tree, and build/tooling remain separate.
- Graphite state: dry-run includes exactly 17 survivor branches after rename.
- Restack: conflict resolutions are recorded in this packet if conflicts occur.
- Proof: spec validation, unit behavior, native tool behavior, Habitat wrapper behavior, generated-output proof, and Graphite state remain separate claims.

Minimum post-restack checks:

```bash
git status --short --branch
gt log short --reverse --all
bun run openspec:validate
bun run --cwd tools/habitat-harness check
bun run --cwd tools/habitat-harness test
git diff --check
```

## Assumptions And Exclusions

- Old draft PR fidelity is intentionally sacrificed; branch intent is preserved in the fold map and replacement PR bodies.
- `studio_runner_parked` is excluded from this collapse.
- `claude/*` branches are reference-only.
- `codex/recover-d0-public-surface-matrix` is adopted into group 1 only if its D0 rows are absent from the folded survivor.
- `.civ7/outputs/resources` is protected and must not be touched during this workstream.

## Conflict Resolution Notes

No post-fold restack conflicts have been recorded yet.
