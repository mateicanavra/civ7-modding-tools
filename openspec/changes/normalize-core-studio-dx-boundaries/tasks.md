## 1. Boundary Inventory

- [x] 1.1 Inventory pure-core imports of Civ7 adapter values, runtime globals,
  or map runtime helpers.
- [x] 1.2 Inventory Studio recipe schema/default imports and generation
  assumptions.
- [x] 1.3 Identify public SDK or Studio consumers affected by moved exports.

## 2. Core Runtime Boundary

- [x] 2.1 Move Civ7-bound map helper implementation to an explicit runtime
  owner.
- [x] 2.2 Update imports and package exports without adding compatibility
  aliases unless an accepted consumer gate requires them.
- [x] 2.3 Add or update tests proving pure core does not import runtime values.

## 3. Studio Contract Source

- [x] 3.1 Choose and document the Studio recipe contract source.
- [x] 3.2 Update Studio imports and generation flow to use that source.
- [x] 3.3 Update Studio tests or typechecks for the new contract path.

## 4. Verification

- [x] 4.1 Run core, adapter/mod, and Studio checks affected by the move.
- [x] 4.2 Run a pure-core runtime-import search.
- [x] 4.3 Run `bun run openspec -- validate normalize-core-studio-dx-boundaries --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
