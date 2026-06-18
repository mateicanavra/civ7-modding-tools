# Tasks

## 1. Pre-Implementation Gate

- [ ] 1.1 Read `$D10_SOURCE_PACKET`, this OpenSpec packet, `$D10_REVIEW_LEDGER`, `$D10_PHASE_RECORD`, and `$D10_DOWNSTREAM_LEDGER`.
- [ ] 1.2 Confirm the source implementation branch is above the accepted D10 design/specification layer and starts clean.
- [ ] 1.3 Confirm concrete D0 rows exist for every touched command JSON, human output, hook output, export, script/Nx target, generated/help, and docs/example surface.
- [ ] 1.4 Confirm D1 output-family handling for check diagnostics/refusals, local feedback, transaction handoff, recovery instructions, and non-claims.
- [ ] 1.5 Confirm live D2 generated-zone projection facts exist for file-layer rules before replacing current whole-row or optional-field consumption.
- [ ] 1.6 Confirm accepted/live G-HOST host declarations exist before implementing host-owned generated/protected surfaces.
- [ ] 1.7 Stop source implementation if any required D0/D1/D2/G-HOST prerequisite is absent for a touched surface.

## 2. Declaration And Projection Model

- [ ] 2.1 Implement a D10 declaration catalog with closed variants for generated surfaces, protected surfaces, host-owned surfaces, forbidden artifacts, unknown zone references, declaration conflicts, missing host declarations, and public compatibility gaps.
- [ ] 2.2 Parse repo-relative paths and matchers at the boundary before guard evaluation.
- [ ] 2.3 Represent required non-empty facts for conflicts, affected paths, missing declarations, forbidden filenames, recovery targets, and missing D0 rows.
- [ ] 2.4 Implement recovery instruction variants for regeneration, host workflow, forbidden-artifact removal, declaration repair, and D0 row request.
- [ ] 2.5 Delete or facade the old generic `GeneratedZone[]` state only after consumers compile against D10 declarations or projections.

## 3. D2 And G-HOST Consumption

- [ ] 3.1 Consume D2 generated-zone projections instead of whole `rules.json` rows or prose metadata.
- [ ] 3.2 Block malformed, missing, contradictory, or unknown D2 generated-zone references before staged guard execution.
- [ ] 3.3 Consume G-HOST host declarations for host-owned paths, owners, regeneration/remediation actions, and missing-host-policy states.
- [ ] 3.4 Remove generic Habitat ownership of Civ7, MapGen, resource, or host-specific path truth once G-HOST live declarations exist.

## 4. Staged Guard And Command Projection

- [ ] 4.1 Implement `ProtectedMutationGuard` request variants for staged user edits, declared generator writes, transaction writes, and drift-check observations.
- [ ] 4.2 Evaluate Git name-status records by path action for added, modified, deleted, renamed-from, renamed-to, copied-from, and copied-to paths.
- [ ] 4.3 Return closed `ProtectedMutationDecision` variants for not-applicable, allowed, refused, and blocked states.
- [ ] 4.4 Project D10 decisions into D1-compatible D7 check output without changing public JSON or human output outside D0 handling.
- [ ] 4.5 Model forbidden artifacts separately from generated/protected surfaces, or stop until another accepted owner takes that state family.

## 5. Generated Drift Relation

- [ ] 5.1 Keep generated drift checks separate from staged guard decisions.
- [ ] 5.2 Consume D10 `GeneratedSurfaceProjection` from the generated drift target or accepted successor.
- [ ] 5.3 Record resolved Nx target metadata for generated drift behavior before changing `generated:check`.
- [ ] 5.4 Prove snapshot/restore behavior for tracked and preexisting untracked generated outputs without claiming mutation authorization.

## 6. Downstream Consumers

- [ ] 6.1 Wire D7 to consume `ProtectedMutationGuardProjection` and render D10 decisions without owning policy.
- [ ] 6.2 Wire D9 to require `TransactionPathAuthorityProjection` before protected/generated/host-owned/forbidden writes.
- [ ] 6.3 Wire D11 to consume local-feedback-safe D10/D7 output and stop before downstream hook work on D10-origin refusal.
- [ ] 6.4 Wire Grit/Biome scan or exclusion surfaces through D10 projections only where the accepted implementation design touches them.
- [ ] 6.5 Keep D8 apply admission and pattern governance ownership outside D10 while allowing D8/D9 to require D10 path authority where touched.

## 7. Tests And Bad Cases

- [ ] 7.1 Add focused declaration catalog tests for generated, protected, host-owned, forbidden, unknown, conflict, missing-host, and D0-missing states.
- [ ] 7.2 Add staged guard tests for prefix match, exact match, rename/copy/delete path actions, unknown zone id, missing host declaration, forbidden artifact, and clean staged state.
- [ ] 7.3 Add D1 projection tests proving every refused or blocked decision carries owner, recovery, and non-claim mapping.
- [ ] 7.4 Add Grit scan-root tests proving generated/protected/forbidden roots are refused through D10 projection where scan-root behavior is touched.
- [ ] 7.5 Add hook tests proving D10-origin file-layer refusal stops before Biome, Grit, generated publish, resource publish, and restaging.
- [ ] 7.6 Add D9 transaction tests proving protected/generated writes are refused without D10 path authority and remain D9-owned after D10 allowance.
- [ ] 7.7 Add generated drift tests or target result checks that separately exercise generation, comparison, restoration, and non-authorization semantics.

## 8. Validation

- [ ] 8.1 Run D10 strict OpenSpec validation: `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict`.
- [ ] 8.2 Run full OpenSpec validation: `bun run openspec:validate`.
- [ ] 8.3 Run `git diff --check`.
- [ ] 8.4 Run the focused D10 source tests introduced by this implementation.
- [ ] 8.5 Run `bun run habitat check --staged --tool file-layer --json` for clean and injected D10-refusal states.
- [ ] 8.6 Run the accepted generated drift target or successor and record expected target/cache/freshness stance.
- [ ] 8.7 Run focused hook and D9 transaction tests where D10 projections are consumed.

## 9. Review And Realignment

- [ ] 9.1 Update `$D10_REVIEW_LEDGER` with implementation review findings and repair dispositions.
- [ ] 9.2 Update `$D10_DOWNSTREAM_LEDGER` for D0, D1, D2, G-HOST, D7, D8, D9, D11, tests, and docs/examples after source facts are known.
- [ ] 9.3 Update `$D10_CLOSURE_CHECKLIST` only after validation and review records agree.
- [ ] 9.4 Update `$REMEDIATION_DIR/packet-index.md` only after final status evidence exists.
- [ ] 9.5 Leave the Graphite layer and worktree clean.
