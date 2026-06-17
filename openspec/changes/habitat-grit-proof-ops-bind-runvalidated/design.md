# Design - Ops Bind RunValidated Proof

## Frame

`grit-ops-bind-runvalidated` ports the retired full-profile guardrail slice
that scanned domain op runtime entrypoints for `ops.bind(` and
`runValidated(`. It deliberately avoids duplicating
`grit-runtime-run-validated`, which owns runtime recipe step and domain
strategy `runValidated` calls.

## Current Predicate

The current Grit predicate reports these call shapes only when `$filename`
matches:

`mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/index.ts`

Reported shapes:

- `ops.bind($...)`
- `runValidated($...)`

The native Grit parser also matches `ops?.bind($...)` through the same
`ops.bind($...)` pattern. This row classifies that as a positive
current-predicate fact because optional-chain op binding is still runtime
orchestration inside an op entrypoint.

## Fixture Matrix

| Class | Expected behavior |
| --- | --- |
| Domain op entrypoint `ops.bind(...)` | Reports |
| Domain op entrypoint `runValidated(...)` | Reports |
| Nested/callback direct `runValidated(...)` | Reports |
| Awaited `ops.bind(...)` | Reports |
| Optional-chain `ops?.bind(...)` | Reports as a native parser fact |
| `otherOps.bind(...)`, `ops.bindLater(...)`, property refs | Do not report |
| Member `op.runValidated(...)` and `runValidatedLater(...)` | Do not report |
| Domain strategies, recipe steps, tests, `.tsx`, other mods | Do not report under this row |
| Source strings | Do not report |

## Proof Contract

This checkpoint may claim native fixture proof, parser inventory/live
zero-candidate evidence, Habitat wrapper/per-rule selector proof, explicit
empty baseline proof, and registered injected probe proof if those commands
pass. It must keep raw direct Grit acquisition, export/dynamic closure, source
remediation, apply safety, classify/generator behavior, retired full-profile
parity, broader domain-refactor closure, and product/runtime proof separate.
