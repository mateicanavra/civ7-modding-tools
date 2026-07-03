# Domino 083: Map Policy Import Independence Grit Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 83: Map Policy Import Independence Grit Rail

Status: closed on `codex/habitat-map-policy-import-independence-grit`.

Purpose: resume the cascade for one deterministic split-by-owner row and resolve
it as a packet-local Grit source rail rather than a semantic owner split.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `ensure_map_policy_dependency_independence` | Replaced Bun script runner with a Grit import-specifier rail; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-map-policy-import-independence-grit-rail.md` |

Moves it forward:

- Keeps `@civ7/map-policy` dependency independence in Habitat/Grit, not package
  tests.
- Separates package-specific import independence from the global Nx
  `kind:foundation` dependency plane.
- Reduces the split-by-owner packet-needed count by one without making a
  product/architecture semantic decision.

Closure note:

- Focused Habitat check passed with the Grit runner.
- A temporary `@swooper/mapgen-core` import probe failed at
  `packages/civ7-map-policy/src/index.ts:1` and was removed.
