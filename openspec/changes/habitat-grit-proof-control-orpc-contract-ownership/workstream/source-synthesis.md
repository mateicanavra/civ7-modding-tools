# Source Synthesis - Control oRPC Contract Ownership

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `packages/civ7-control-orpc/AGENTS.md` | Package owns native oRPC/Effect contracts, routers, typed context, typed errors, middleware, server-side clients, and service behavior over `@civ7/direct-control` runtime ports; runtime access stays in `@civ7/direct-control`. | Package router only; not proof of Grit behavior. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-control-orpc-contract-ownership` as enforced `grit-check`, scoped to module contracts and root index, forbidding direct-control imports in contracts or contract-local schemas from public root. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive transport/runtime import in contract, negative schema-private module use, current control-oRPC scan, empty baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row aligned by this checkpoint. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Historical design seed had 1 match and 1 ignore; current closure records repaired native fixtures, inventory, wrapper, baseline, and injected proof. | Aggregate row aligned by this checkpoint. |

## Current Predicate

The repaired Grit predicate reports:

- import declarations from `@civ7/direct-control` when the filename matches
  `.*packages/civ7-control-orpc/src/modules/.*/contract\.ts$`;
- exported const declarations in module `contract.ts` files when the const name
  matches `Civ7*InputSchema`, `Civ7*ResultSchema`, `Civ7*OutputSchema`, or
  `Civ7*StandardSchema`;
- root `index.ts` named export-from declarations from
  `./modules/<module>/contract` when a direct or aliased exported specifier
  matches `Civ7*InputSchema`, `Civ7*ResultSchema`, `Civ7*OutputSchema`, or
  `Civ7*StandardSchema`.

The repaired predicate is syntax/path scoped. It does not by itself prove raw
acquisition, source remediation, apply safety, Effect adapter behavior, broader
control-oRPC architecture, or product/runtime closure.

## Fixture Plan

Positive/current-predicate classes:

- direct-control value import in a module `contract.ts`;
- direct-control type-only import in a module `contract.ts`;
- exported `Civ7*InputSchema`, `Civ7*ResultSchema`,
  `Civ7*OutputSchema`, and `Civ7*StandardSchema` consts in module
  `contract.ts`;
- root `index.ts` module-contract schema re-exports, including direct and
  aliased named specifiers.

Controls and parser-edge classifications:

- private module contract input/result/standard schema consts;
- exported module contract schema lookalikes outside the private schema name
  class;
- direct-control imports in procedure/context/dependency files outside the
  module contract predicate;
- root index bridge/error/model schema exports from non-module-contract files;
- `.tsx`, source lookalikes, and dynamic import shapes.

## Inventory Plan

Run a TypeScript parser inventory over:

- `packages/civ7-control-orpc/src`

Exclusions:

- `node_modules`
- `dist`

Durable records include scan root, exclusions, file counts, actual current
predicate counts, contract import counts, direct-control split, exported/private
schema counts, root index export counts, live candidate paths, row id, proof
ids, blockers, and explicit non-claims. Stdout or scratch files are not durable
proof.

Current checkpoint counts:

- 97 scanned TS/TSX/JSON files under `packages/civ7-control-orpc/src`.
- 97 `.ts` files, 0 `.tsx` files, and 0 `.json` files.
- 14 module `contract.ts` files and 1 root `index.ts` file.
- 15 current-predicate files, all `.ts`.
- 94 import declarations in module contracts: 42 type-only, 52 value, and 0
  side-effect imports.
- 0 module-contract `@civ7/direct-control` imports.
- 9 `@civ7/direct-control` imports outside module contracts, in context,
  dependency, and procedure files.
- 142 exported const declarations in module contracts.
- 0 exported private-schema name matches in module contracts.
- 171 unexported private-schema name matches in module contracts.
- 100 exported schema lookalikes outside the private input/result/output/standard
  name class.
- 15 root index export declarations, all export-from declarations.
- 0 root index export-from declarations from `./modules/<module>/contract`.
- 0 root index module-contract schema specifier elements.
- 101 root index schema specifier elements from non-module-contract files.
- 0 dynamic imports in current-predicate files.
- 0 parse diagnostics.

Historical `COCO-ROOT-INDEX-PREDICATE-GAP-2026-06-15` is superseded by
`COCO-PREDICATE-REPAIR-2026-06-16` and
`COCO-NATIVE-FIXTURES-2026-06-16`. The repaired native fixture reports eight
positive matches: contract direct-control value import, contract direct-control
type-only import, exported `InputSchema`, exported `ResultSchema`, exported
`OutputSchema`, exported `StandardSchema`, direct root-index module-contract
schema re-export, and aliased root-index module-contract schema re-export.
Current control-oRPC source still has 0 live current-row candidates.

The 9 outside-contract direct-control imports are path controls, not current-row
contract candidates:

- `packages/civ7-control-orpc/src/context.ts`
- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/current.ts`
- `packages/civ7-control-orpc/src/modules/attention/procedures/priorities.ts`
- `packages/civ7-control-orpc/src/modules/display/procedures/explore-request.ts`
- `packages/civ7-control-orpc/src/modules/readiness/procedures/current.ts`
- `packages/civ7-control-orpc/src/modules/turn/procedures/complete-request.ts`
- `packages/civ7-control-orpc/src/modules/world/procedures/current.ts`
- `packages/civ7-control-orpc/src/modules/world/procedures/map-reads.ts`
