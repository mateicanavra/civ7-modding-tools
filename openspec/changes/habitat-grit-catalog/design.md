# Design — Grit Catalog + File Layer

## Pattern layout

```text
tools/habitat-harness/patterns/grit/
  domain-surface/
    no-deep-domain-import.md
    step-contract-entrypoint-only.md
    recipe-imports-ops-surface.md
    studio-imports-artifacts-only.md
    no-domain-root-export-star.md
  runtime-purity/
    no-typebox-runtime.md
    no-run-validated.md
    no-helper-redeclaration.md
    no-empty-schema-default.md
    no-runtime-config-merge.md
    no-civ7-runtime-import.md
  stage-isolation/
    no-sibling-stage-import.md
    no-milestone-recipe-id.md
    no-domain-root-catalog.md
    no-wrapper-only-stage-config.md
    placement-outcome-contract-boundary.md
  ownership/
    adapter-base-standard-isolation.md
    control-orpc-contract-ownership.md
    viz-contract-ownership.md
    sdk-mapgen-entrypoint-isolation.md
  codemods/
    export-star-to-named.md
    deep-import-to-public-surface.md
  fixtures/<pattern-name>/{input,output|match,nomatch}.ts
```

Patterns are grit-CLI markdown patterns (frontmatter `level: error`, body =
failure message). De-risk gotchas baked in: non-capturing regex groups
`(?:...)` only; no `register_diagnostic` (Biome-only construct); wrapper
parses `grit check --json` and fails on any `results[]` entry not in the
rule's baseline (grit exit code is not trusted).

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
  rules; they stay habitat-native (semantic, cross-file). G1/G2/G5/G8/G9
  (stage-isolation/contract), G10/G11 (ownership), and the G3 runtime-value
  ban (runtime-purity) port here per the corpus split.
- Studio artifact rule: worker-file exemptions (`pipeline.worker.ts`,
  `recipeRuntime.ts`) become pattern path excludes, mirrored from the eslint
  block.

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
rewrite, Biome format step after apply, and a rule-pack entry marking it
`mode: apply`. `habitat fix` runs apply-mode patterns only; check-only
patterns emit diagnostics with remediation text. Ambiguity = diagnostic, never
rewrite.
