# Rule Remediation: Map Policy Import Independence Grit Rail

Status: closed on `codex/habitat-map-policy-import-independence-grit`

## Slice

Selected rule:

- `ensure_map_policy_dependency_independence`

Input action class: split by owner.

## Decision

The row does not require a semantic owner split. The whole predicate is
package-local import independence for `@civ7/map-policy`.

Nx owns coarse project-kind dependency law. It intentionally permits
`kind:foundation` to depend on `kind:foundation`, so it cannot express this
package-specific constraint against importing MapGen core, adapter, mod, Studio,
or base-standard implementation surfaces.

The correct rail is a packet-local Grit import-specifier rule.

## Mutation

- Preserved rule id and authority placement.
- Replaced the Bun script runner with a Grit runner.
- Added `pattern.md` covering import declarations, side-effect imports,
  re-exports, export-all, and dynamic imports under
  `packages/civ7-map-policy/src`.
- Deleted the absorbed `check.ts` runner.

## Proof

- `bun habitat check --rule ensure_map_policy_dependency_independence --json`
  passed with the Grit runner.
- A temporary `import "@swooper/mapgen-core";` probe in
  `packages/civ7-map-policy/src/index.ts` failed the rule at line 1 and was
  removed.

## Proof Limit

This slice does not change the global Nx boundary taxonomy, does not add
package-owned tests, and does not alter `@civ7/map-policy` source behavior. It
only moves the existing static import predicate to the appropriate Grit rail.
