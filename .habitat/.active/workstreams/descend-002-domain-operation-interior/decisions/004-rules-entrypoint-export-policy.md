# Decision 004: Operation Entrypoint And Nested-Module Law

Status: sealed by later user authority

## Question And Provenance

What is the closed grammar for the operation root, `rules/`, `strategies/`,
and the current `policy/` support directories?

The opening draft considered requiring aggregation in both `rules/` and
`policy/`. Later authority settled a simpler topology: policy is not a first-
class operation container, root behavior is not admitted, and nested indices
are local export surfaces.

## Evidence

- 57 operations have `rules/`; four directories lack `index.ts`.
- Seven operations have `policy/` directories.
- 92 operations have `strategies/`; nine do not.
- Most current strategy and rule containers already use local `index.ts`
  aggregation.
- Foundation tectonics shim re-exports are absent.
- Zero operation-local `artifacts.ts` files exist, but the historical sentry
  remains because the current open grammar could admit recurrence elsewhere.

## Alternatives Considered

1. Preserve `policy/` and add required aggregation.
2. Allow root behavior and optional nested containers.
3. Require one assembly root plus closed rule and strategy containers.

The first two preserve multiple homes for the same behavior and weaken the
positive abstraction.

## Ruling

- Root `index.ts` is assembly-only.
- `rules/` and `strategies/` are required.
- Each requires an export-only `index.ts` that sources only local named files.
- `rules/index.ts` may be empty when the operation has no named rule.
- `strategies/` always contains at least one named strategy, per D1.
- `policy/`, root `types.ts`, helper buckets, schema/data buckets, nested
  directories, and other catchalls are not admitted operation interiors.
- Policy and type definitions move only to already-valid named modules or an
  exterior owner while behavior and public imports remain invariant.

The generic positive topology absorbs the ecology-only topology proxy,
`prohibit_domain_artifacts_modules`, and the Foundation tectonics shim sentry
only after representative injected violations fail the survivor.

## Boundary And Falsifier

An empty rules index is not permission for hidden root behavior. A named
strategy is always required. If current policy or type content has no
behavior-preserving destination under the asserted topology or an existing
exterior owner, stop that row before execution; do not restore a catchall as an
exception.
