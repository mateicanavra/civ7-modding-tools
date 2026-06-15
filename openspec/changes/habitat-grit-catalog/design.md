# Design — Grit Catalog + File Layer

## Pattern layout

```text
.grit/patterns/habitat/
  checks/
    domain_deep_import.md
    recipe_domain_surface.md
    studio_recipe_artifacts.md
    step_contract_domain_surface.md
    recipe_runtime_domain_ops.md
    runtime_validation_imports.md
    runtime_run_validated.md
    runtime_helper_redeclarations.md
    empty_schema_default.md
    mapgen_core_runtime_civ7.md
    sibling_stage_step_imports.md
    domain_root_catalogs.md
    wrapper_advanced_stage_config.md
    placement_outcome_boundary.md
    adapter_base_standard_import.md
    control_orpc_contract_ownership.md
    viz_contract_ownership.md
    sdk_mapgen_entrypoint.md
    domain_ops_boundary_imports.md
    domain_ops_projection_effects.md
    domain_ops_root_config.md
  apply/
    deep_import_to_public_surface.md
```

Patterns are grit-CLI markdown patterns (frontmatter `level: error`, body =
failure message). Native samples live in each pattern markdown file and run
through `grit patterns test`; check samples use one code block for an expected
diagnostic and two identical code blocks for expected no-match cases. De-risk
gotchas baked in: non-capturing regex groups `(?:...)` only; no
`register_diagnostic` (Biome-only construct).

`grit:check` remains a Habitat/Nx gate, not a raw `grit check` target. Nx
routes to `habitat check --tool grit-check`; that command runs exactly one
native `grit check --json --level error` scan over declared audit roots,
parses the shared JSON report, maps findings to Habitat rule IDs, applies
locked empty baselines, and fails on unbaselined enforced findings. This thin
adapter is required because the pinned Grit CLI exits 0 on JSON findings; raw
`grit check` would be a report, not an enforcement gate. The adapter must not
copy source files, create temp workspaces, emulate native samples, or run Grit
once per rule.

## Parity discipline (the load-bearing verification)

Each ported rule declares its `parityWith` source (eslint block id or script
id from invariant-corpus.md). The harness runs both mechanisms during this
slice and asserts identical finding sets on the current tree. Parity evidence
is the precondition for retirement in `habitat-enforcement-consolidation` —
not this slice.

Known granularity notes:
- eslint `no-restricted-syntax` AST selectors (runValidated calls, helper
  redeclarations) map to grit code snippets — fixture both positive and
  negative cases (e.g. `runValidatedFoo` must NOT match).
- `lint-normalization-guardrails.mjs` G6/G7 (doc/code sync) are NOT grit
  rules; they stay habitat-native (semantic, cross-file). G2/G5/G8/G9
  (stage-isolation/contract), G10/G11 (ownership), and the G3 runtime-value
  ban (runtime-purity) port here. G1 milestone recipe IDs stay under the
  original guardrail after the H5 Grit parity stop.
- Studio artifact rule: worker-file exemptions (`pipeline.worker.ts`,
  `recipeRuntime.ts`) become pattern path excludes, mirrored from the eslint
  block, with the server recipe-DAG service also excluded as runtime/server
  code rather than browser UI.
- Value `export *` in contract/public-surface files stays under ESLint for
  now: `export-star-to-named` would require cross-file named export synthesis
  outside pure GritQL. Grit matching itself can distinguish value `export *`
  from allowed `export type *`, but native `grit patterns test` samples in the
  pinned CLI currently parse-error on `export type *` before the pattern
  executes. H5 does not add a custom temp-workspace regression around that
  parser edge; the suite stays on Grit's native Markdown sample contract and
  the original ESLint rule remains authoritative for retirement decisions.

## File layer

File-layer rules live in the rule pack (not grit): glob + allowedWriters +
remediation. Enforcement points:
- `habitat check --staged`: always fails on any staged path inside a protected
  zone, regardless of generator `--check` support; the failure message carries
  the owning regenerate command. The false-positive cost (committing
  regenerated output requires `--no-verify` or a harness-recognized regen
  marker) is accepted and recorded as a trade-off.
- CI: regenerate-and-diff for both repo-runnable generators — `gen:maps`
  outputs and `civ7-map-policy:gen-tables` (generator runs, diff must be
  empty) — drift detection, not just edit detection.
  `packages/civ7-types/generated/**` (external resources workflow) gets
  write-protection only; the regeneration gap is recorded in the phase record.

## Codemod rules (spec draft §8 made operational)

A grit-apply pattern ships only with: input/output fixtures, deterministic
rewrite, and a Biome format step after apply. `habitat fix` runs apply-mode
patterns only; check-only patterns emit diagnostics with remediation text.
Ambiguity = diagnostic, never rewrite. H5 approves only the mechanical
`@mapgen/domain/<domain>/ops/<private>` → `/ops` import rewrite, preserving
`import type`.
