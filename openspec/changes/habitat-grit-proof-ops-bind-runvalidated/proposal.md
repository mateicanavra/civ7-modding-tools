# Proposal: Ops Bind RunValidated Proof

## Summary

Add and prove `grit-ops-bind-runvalidated` as a Habitat Grit check for
Swooper domain op runtime entrypoints. The rule reports direct `ops.bind(...)`
and direct `runValidated(...)` orchestration calls in
`mods/mod-swooper-maps/src/domain/**/ops/*/index.ts`.

## Product Movement

Domain ops stay atomic runtime units. Cross-op orchestration and validation
wrapping belong in step/stage composition or authoring-time normalization, not
inside op runtime entrypoints.

## Scope

- Pattern: `.grit/patterns/habitat/checks/ops_bind_runvalidated.md`
- Rule id: `grit-ops-bind-runvalidated`
- Owner layer: `grit-check`
- Current predicate: Swooper domain op runtime `index.ts` files.
- Non-apply row: no source remediation or codemod safety is claimed.

## Non-Claims

This row does not prove recipe-step/domain-strategy `runValidated` behavior
owned by `grit-runtime-run-validated`, export-from or dynamic-import closure,
raw direct Grit acquisition, source remediation, apply safety,
classify/generator behavior, retired full-profile parity, broader
domain-refactor closure, or product/runtime behavior.
