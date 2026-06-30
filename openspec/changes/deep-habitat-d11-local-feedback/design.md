# Design: D11 Local Feedback

## Frame

D11 specifies Habitat's local hook workflow. The product goal is a generic,
repo-local feedback loop that tells a developer or agent what blocks the current
commit or push and what recovery action is available. Runtime code must not
encode implementation packet ids, review status, refactor ownership, or other
process-only state.

The hook domain owns local orchestration only:

- pre-commit resource readiness;
- staged path collection and partial-staging refusal;
- structural check invocation and local rendering;
- formatter execution and restaging of formatter-touched staged files only;
- diagnostic feedback where a product diagnostic/check result is available;
- pre-push base selection and affected command execution;
- hook-local trace data that is useful for command behavior and debugging.

It does not own CI readiness, Graphite readiness, OpenSpec acceptance, product
runtime correctness, path policy, rule truth, diagnostic acquisition, or
transformation safety.

## Runtime Boundary

D11 source must use product-domain DTOs and TypeBox schemas. The runtime record
shape is allowed to contain hook state, command results, resource decisions,
check summaries, recovery text, base-selection state, and terminal outcomes.
It is not allowed to contain packet labels such as `D11`, process owners, or
refactor-management fields.

Compatibility is handled by preserving or versioning public surfaces named by
the D0 matrix. It is not handled by adding conversion shims or process
vocabulary to the toolkit.

## Product Terms

| Term | Meaning |
| --- | --- |
| `ResourcePreCommitDecision` | TypeBox-backed discriminated resource readiness state. Commit allowance is derived from the variant, not from a mutable boolean. |
| `LocalFeedbackCheckProjection` | Product check summary consumed by hooks to render structural feedback. It must not expose packet ownership or process metadata. |
| `PreCommitTrace` / `PrePushTrace` | Package-internal hook execution records for debugging and tests. They carry product hook facts only. |
| `FormatterRestageDecision` | Decision about which formatter-touched staged files can be restaged. |
| `VerifyBaseResolution` / pre-push base decision | Explicit base resolution or refusal. A literal branch name is not a success state when no base can be resolved. |

## Pre-Commit Flow

1. Render the local-feedback scope and record the initial repo snapshot.
2. Compute a resource decision. Refused resource states stop the hook before
   checks, formatter, diagnostics, publishing, or restaging.
3. Collect staged paths and normalize them to repo-relative paths.
4. Run the structural check path and consume its product check summary.
5. Refuse protected/generated/forbidden mutation feedback before formatter,
   diagnostics, publish, or restage.
6. Refuse partial staging before formatting or restaging.
7. Run Biome format/check only for formatter-supported staged paths.
8. Restage only files whose content changed due to the formatter and that were
   already eligible staged candidates.
9. Return success only when each required local step passed or was explicitly
   not applicable.

## Pre-Push Flow

1. Resolve the affected base from explicit input, Graphite parent, or merge-base
   data.
2. If no base can be resolved, refuse with recovery text instead of treating a
   literal branch name as a successful base.
3. Run the affected command with explicit base and `HEAD`.
4. A nonzero affected command is local feedback failure, not CI or review state.

## Refactoring Rules

- Keep hook modules small and responsibility-focused. Extract product helpers
  where they reduce state space; do not introduce a generic stage framework.
- Use TypeBox as the source of truth for schema-shaped inputs and outputs.
- Do not add runtime types whose only purpose is to model this refactor,
  packet closure, or review workflow.
- Do not preserve wrong architecture with compatibility shims.
  If a public surface must remain stable, keep the surface stable through a
  product-compatible implementation.
- Do not add tests that merely assert architectural structure. Structural
  invariants belong in tooling, lints, boundaries, and GritQL checks.

## Validation

Implementation validation must focus on product behavior:

- resource decisions refuse or allow correctly;
- protected/generated mutation feedback stops the hook before writes/restage;
- partial staging refuses before formatting;
- formatter restages only formatter-touched staged files;
- failed structural checks and failed affected commands block local success;
- unsupported hook names return stable command behavior;
- pre-push base refusal is explicit when no base is available;
- TypeScript and focused tests pass for the touched package.

OpenSpec validation checks packet shape only. It must not be encoded as runtime
process metadata.
