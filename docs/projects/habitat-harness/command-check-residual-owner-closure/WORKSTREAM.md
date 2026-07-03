# Command-Check Residual Owner Closure

Status: implementation workstream

## Objective

Close the known residual `command-check` owner confusion after the 74-row extraction wave. This pass deletes stale shells, moves live executable validators to their real owner surface, and leaves remaining command-check packets labeled by residual owner class.

## Source Order

1. User plan: Command-Check Residual Owner Closure Plan.
2. `.habitat/FRAME.md` and `.habitat/AUTHORITY-TOOL-SEPARATION.md`.
3. Current `category.md` packet metadata and rule records.
4. Prior structure-check conversion closure and mechanical extraction ledgers.
5. Focused Habitat proofs and package/Nx proofs from this branch.

## Scope

- Retire `enforce_domain_refactor_boundary_profile`.
- Make `require_ecology_canonical_op_module_topology` green.
- Move MapGen docs anchor/reference validation implementation into docs-owned tooling.
- Remove Studio recipe artifact currentness from Habitat enforcement.
- Move boundary taxonomy execution into Habitat Toolkit workspace tooling.
- Audit remaining command-check packets and label their owner class.

## Non-Goals

- Convert every remaining command-check packet.
- Extend structure-check TOML semantics.
- Move Grit apply patterns or pattern fixtures.
- Rebuild the full package validator/Nx owner model.

## Closure Boundary

This workstream closes when the deleted packets are gone from current ledgers, focused proofs pass, remaining command-check packets identify their owner class in `category.md`, execution-surface analytics are regenerated, and aggregate Habitat checks are run with any residual reds explicitly labeled.
