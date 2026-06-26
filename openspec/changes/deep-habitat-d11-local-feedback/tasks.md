# Tasks

## 1. Preconditions

- [x] 1.1 Read the accepted D11 packet, D0 matrix rows, D1 command/output
  boundary, and live hook source before editing.
- [x] 1.2 Confirm touched public surfaces have D0 rows: hook command behavior,
  hook name refusal, pre-push base flag/output, local-feedback notice, partial
  staging refusal, package-internal trace surfaces, Husky delegators, and
  resource helper script surfaces.
- [x] 1.3 Keep D11 source work limited to local feedback behavior and adjacent
  schema/test/doc records. Do not use D11 to redesign path policy, diagnostic
  truth, rule registry truth, or transformation safety.

## 2. Runtime Model

- [x] 2.1 Replace boolean-correlated resource readiness with a TypeBox-backed
  discriminated resource decision.
- [x] 2.2 Keep hook trace data product-shaped: command state, resource decision,
  staged path facts, formatter/restage facts, check summaries, pre-push base
  resolution, and terminal outcome.
- [x] 2.3 Remove runtime fields that exist only for packet/process management:
  packet ids, owner labels, refactor-management fields, and process-only
  records.
- [x] 2.4 Preserve public compatibility through stable product behavior, not
  through compatibility shims or wrong DTO shapes.

## 3. Pre-Commit Behavior

- [x] 3.1 Refuse unavailable, locked, dirty, or unstaged resource states before
  checks, formatting, diagnostics, publishing, or restaging.
- [x] 3.2 Consume structural check summaries for local feedback without parsing
  human output as authority.
- [x] 3.3 Refuse protected/generated/forbidden mutation feedback before
  formatter, diagnostics, publish, or restage.
- [x] 3.4 Refuse partial staging before formatting or restaging.
- [x] 3.5 Restage only formatter-touched staged candidate paths.

## 4. Pre-Push Behavior

- [x] 4.1 Resolve pre-push base from explicit input, Graphite parent, or
  merge-base data.
- [x] 4.2 Refuse pre-push when no base can be resolved. Do not treat a literal
  branch name as a successful base.
- [x] 4.3 Preserve Nx affected failures as local feedback failures, not CI,
  review, Graphite, or graph authority.

## 5. Validation

- [x] 5.1 Run TypeScript check for `tools/habitat-harness`.
- [x] 5.2 Run focused product behavior tests for hooks, host policy,
  protected-zone decisions, transformation transactions, pattern governance,
  check projections, and rule selection.
- [x] 5.3 Run strict D11 OpenSpec validation after active records are aligned.
- [x] 5.4 Run final status, diff, and TODO/control-artifact triage before commit.

## 6. Closure

- [x] 6.1 Update D11 workstream records with the actual source state and
  validation results.
- [x] 6.2 Run an adversarial product/design review over the final D11 diff.
- [x] 6.3 Repair any accepted P1/P2 findings.
- [x] 6.4 Leave the Graphite layer clean and reviewable.
