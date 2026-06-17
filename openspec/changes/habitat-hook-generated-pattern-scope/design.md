## Design

Pre-commit remains the hook owner. The generated pattern packet may write
rule-pack metadata, but hook execution decides what the staged hook runs.

The design uses the existing Habitat check engine as the staged Grit boundary:

- `habitat hook pre-commit` invokes `habitat check --staged --tool grit-check
  --json` for staged Grit work.
- `createCheckReport({ staged: true })` filters selected Grit rules to
  `hookScope: "pre-commit"`.
- staged Grit scan roots are exact staged JavaScript/TypeScript paths whose
  path shape is accepted by the existing Grit adapter scan-root policy.
- the Grit adapter remains responsible for native `grit --json check`
  execution, exact JSON parsing, adapter failure projection, and existence
  validation.

This keeps the hook from duplicating Grit parser logic and keeps staged scan
scope precise. A staged file under an approved root does not broaden to the
whole root; the exact file path is passed through the adapter.

## Failure Handling

The hook consumes normalized CheckReport JSON:

- malformed wrapper output from native Grit is represented as a Grit adapter
  parser failure and remains a hook parse failure;
- normalized Grit rule failures remain hook Grit findings;
- wrapper command failure without a valid CheckReport remains hook command
  failure.

## Non-Claims

This checkpoint does not prove generated pattern semantics, baseline writes,
HG row closure, CI execution, product/runtime behavior, or pre-commit hook
activation by metadata alone.
