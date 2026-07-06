# Rule Remediation: Runtime Local Config Defaulting Rail

Status: closed on `codex/habitat-runtime-local-config-defaulting-rail`.

## Scope

This slice resolves `prohibit_runtime_local_config_default_merging`.

## Decision

Admit the rule from runtime `_remainder` into
`.habitat/civ7/mapgen/pipeline/runtime/rules/` as live runtime source
authority.

The rule is already scoped to runtime recipe step files and domain operation
files. It excludes stage compile helpers, where source evidence shows public
config is intentionally translated into canonical per-step/op config.

## Source Evidence

- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
  says config defaulting and canonicalization happen during recipe compilation,
  not runtime execution.
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`
  names op-local `Value.Default(...)` inside `run(...)` as a migration smell and
  keeps `compileExecutionPlan(...)` as the source of explicit runtime config.
- Current source uses `?? {}` in stage compile helpers such as
  `mods/mod-swooper-maps/src/recipes/standard/stages/**/index.ts`, which is
  outside this rule's runtime predicate.

## Disposition

| Rule id | Action | Reason |
| --- | --- | --- |
| `prohibit_runtime_local_config_default_merging` | moved from `_remainder` to runtime `rules/` | The current predicate is a precise runtime step/op source rail, not a broad config ontology or package-test assertion. |

## Proof

- `bun habitat check --rule prohibit_runtime_local_config_default_merging --json`
  passed after the move.
- A temporary `args ?? {}` probe in
  `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts` failed
  the rule and was removed.

## Non-Claims

- This does not create a config blueprint kind.
- This does not move config/defaulting assertions into package-owned behavior
  tests.
- This does not forbid stage compile helpers from translating public config
  into explicit runtime config.
