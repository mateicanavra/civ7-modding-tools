# Adversarial Review - Archimedes

Reviewer: `019ec59a-2a73-7663-ac47-8de08244a5ff`
Status: completed, findings accepted and patched.

## Findings

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| AR-A1 | P2 | Domain-root facade disposition could close by label without proof-linked sibling implementation or explicit downstream downgrade. | Accepted. Packet now requires predicate expansion proof, sibling implementation/proof ids, or blocked/unproven downstream downgrade with a named owner before any complete domain-surface export-star claim. |
| AR-A2 | P2 | Bounded raw acquisition over domain/recipe roots was not separated from the full Habitat Grit adapter scan roots. | Accepted. Packet now names wrapper roots and requires omitted-root projection proof or non-claims. |
| AR-A3 | P2 | `contract.ts` and `types.ts` proof was contingent even though the current predicate includes those files. | Accepted. Packet now requires those positive fixtures unless a reviewed scope-reduction packet changes pattern, registry metadata, aggregate proof matrix, and downstream records. |
| AR-A4 | P3 | `.tsx`, named type exports, non-index `rules/**` and `strategies/**`, matching-root test paths, and op-local `rules.ts` need explicit controls. | Accepted. Fixture matrix and tasks now include those controls. |

## Verification Reported By Reviewer

- `bun run openspec -- validate habitat-grit-proof-contract-export-all --strict`
- `bun run openspec:validate`
- `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter contract_export_all --json`
- `bun run habitat:check -- --json --rule grit-contract-export-all`
- bounded raw Grit acquisition returned `results: []`
