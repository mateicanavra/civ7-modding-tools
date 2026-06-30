# Tasks

## 1. Pre-Implementation Gate

- [x] 1.1 Read `$D10_SOURCE_PACKET`, this OpenSpec packet, `$D10_REVIEW_LEDGER`, `$D10_PHASE_RECORD`, and `$D10_DOWNSTREAM_LEDGER`.
- [x] 1.2 Confirm the source implementation branch is above the accepted D10 design/specification layer and starts clean.
- [x] 1.3 Confirm concrete D0 rows exist for touched surfaces: `D0-cli-cmd-check-flag-tool`, `D0-cli-cmd-check-flag-staged`, `D0-nx-target-target-generated-check`, the file-layer rule target rows, and `D0-hook-hook-pre-commit`.
- [x] 1.4 Confirm D1 output-family handling for check diagnostics/refusals, local feedback, transaction handoff, recovery instructions, and non-claims.
- [x] 1.5 Confirm live D2 generated-zone projection facts exist for file-layer rules before replacing current whole-row or optional-field consumption.
- [x] 1.6 Confirm accepted/live G-HOST host declarations exist before implementing host-owned generated/protected surfaces.
- [x] 1.7 Stop source implementation if any required D0/D1/D2/G-HOST prerequisite is absent for a touched surface.

## 2. Declaration And Projection Model

- [x] 2.1 Implement a D10 declaration catalog with closed variants for generated surfaces, host-owned generated/external surfaces, forbidden files, missing host declarations, and declaration conflicts. No touched surface has a missing D0 row in this layer.
- [x] 2.2 Parse repo-relative staged paths and matchers at the boundary before guard evaluation.
- [x] 2.3 Represent required non-empty facts for affected paths, missing declarations, forbidden filenames, recovery targets, and conflicts through TypeBox schemas and constructor parsing.
- [x] 2.4 Implement recovery instruction variants for host regeneration/workflow, forbidden-file removal, and declaration repair.
- [x] 2.5 Delete the old generic `generated-zones.ts` state after D7 and Grit scan-root consumers compile against D10 declarations/projections.

## 3. D2 And G-HOST Consumption

- [x] 3.1 Consume D2 `RuleFileLayerFacts` generated-zone and forbidden-file projections instead of whole `rules.json` rows or prose metadata.
- [x] 3.2 Block missing, contradictory, or unknown generated-zone references before staged guard execution.
- [x] 3.3 Consume G-HOST host declarations for host-owned paths, owners, regeneration/remediation actions, and missing-host-policy states.
- [x] 3.4 Remove generic Habitat ownership of Civ7, MapGen, resource, or host-specific path truth from D10 code; host-specific path truth remains in G-HOST declarations.

## 4. Staged Guard And Command Projection

- [x] 4.1 Implement the staged user-edit `ProtectedMutationGuard` path. Declared generator writes and transaction writes remain separate consumers: `generated:check` is the file-layer structural gate, and D9 continues to require protected-zone/host-policy refs before live writes.
- [x] 4.2 Evaluate Git name-status records by path action for added, modified, deleted, renamed-from, renamed-to, copied-from, and copied-to paths.
- [x] 4.3 Return closed `ProtectedMutationDecision` variants for not-applicable, refused, and blocked states used by this source layer; no allowed mutation lane is surfaced by D10 command output in this layer.
- [x] 4.4 Project D10 decisions into D1-compatible D7 diagnostics without changing CheckReport schemaVersion 1 shape.
- [x] 4.5 Model forbidden files separately from generated/protected surfaces.

## 5. Generated Drift Relation

- [x] 5.1 Keep generated drift checks separate from staged guard decisions.
- [x] 5.2 Treat the accepted current successor as `generated:check` resolving to the D10-backed file-layer structural gate; it is not a generated freshness/drift proof.
- [x] 5.3 Record resolved Nx target metadata for `generated:check`: `cache: false`, command `bun tools/habitat-harness/bin/dev.ts check --tool file-layer`, with file-layer rule aliases depending on that target.
- [x] 5.4 Delete the stale snapshot/restore drift script because it is not an active target and would preserve a parallel generated-zone authority. No snapshot/restore freshness proof is claimed by this source layer.

## 6. Downstream Consumers

- [x] 6.1 Wire D7 check execution to consume D10 decisions and render diagnostics without owning policy.
- [x] 6.2 Preserve the D9 live-write gate requiring protected-zone and host-policy refs before live writes; D9 remains transaction owner.
- [x] 6.3 Preserve D11 hook consumption of file-layer check output so D10-origin refusal stops before downstream hook work.
- [x] 6.4 Wire Grit scan-root validation through D10 scan-root protection projections where this layer touches scan-root behavior. Biome exclusions are not changed.
- [x] 6.5 Keep D8 apply admission and pattern governance ownership outside D10 while allowing D8/D9 to require D10 path authority where touched.

## 7. Tests And Bad Cases

- [x] 7.1 Add focused declaration/guard tests for generated, forbidden, unknown/missing-host, and clean states; G-HOST tests continue to cover host conflict states.
- [x] 7.2 Add staged guard tests for prefix match, name-status rename/copy path actions, unknown zone id, forbidden file, and clean staged state.
- [x] 7.3 Add D1-compatible diagnostic projection assertions through refused/blocked diagnostic output with recovery and non-claim-bearing decisions.
- [x] 7.4 Preserve Grit scan-root tests proving generated/protected roots are refused after scan-root behavior routes through D10 projection.
- [x] 7.5 Preserve hook tests proving file-layer refusal stops before Biome, Grit, generated publish, resource publish, and restaging.
- [x] 7.6 Preserve D9 transaction tests proving protected/generated writes are refused without D10/host-policy authority and remain D9-owned after authority references.
- [x] 7.7 Record `generated:check` target result checks as file-layer structural target checks only; no generation/comparison/restoration proof is claimed after deleting the stale drift script.

## 8. Validation

- [x] 8.1 Run D10 strict OpenSpec validation: `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict`.
- [x] 8.2 Run full OpenSpec validation: `bun run openspec:validate`.
- [x] 8.3 Run `git diff --check`.
- [x] 8.4 Run the focused D10 source tests introduced by this implementation.
- [x] 8.5 Run `habitat check --staged --tool file-layer --json --base agent-DRA-d9-transformation-transaction` for the stack-local clean state and focused tests for injected D10-refusal states. The unqualified main-base command is recorded as a baseline-integrity/base-schema non-claim, not the D10 closure oracle.
- [x] 8.6 Run the accepted generated drift successor and record expected target/cache/freshness stance: `generated:check` resolves to uncached `bun tools/habitat-harness/bin/dev.ts check --tool file-layer`; it is a file-layer structural gate, not generated freshness proof.
- [x] 8.7 Run focused hook and D9 transaction tests where D10 projections are consumed.

## 9. Review And Realignment

- [x] 9.1 Update `$D10_REVIEW_LEDGER` with implementation review findings and repair dispositions.
- [x] 9.2 Update `$D10_DOWNSTREAM_LEDGER` for D0, D1, D2, G-HOST, D7, D8, D9, D11, tests, and docs/examples after source facts are known.
- [x] 9.3 Update `$D10_CLOSURE_CHECKLIST` only after validation and review records agree.
- [x] 9.4 Update `$REMEDIATION_DIR/packet-index.md` only after final status evidence exists.
- [x] 9.5 Leave the Graphite layer and worktree clean.
