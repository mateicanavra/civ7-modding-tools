# Proposal: D9 Transformation Transaction

## Summary

Specify D9 as the complete Transformation Transaction contract for Habitat
structural rewrites. D9 owns the transaction envelope around a D8-admitted
rewrite: request construction, dry-run inventory, write-set approval, isolated
copy check, live write, rollback, formatter handoff, declared gate handoff,
terminal outcome, recovery instruction, and public command projection.

This packet remains design/specification only. It does not authorize source
implementation until its final per-domino rereview gates pass and source
blockers from D0, D8, D10, and G-HOST are satisfied where touched.

## Authority

- Remediation router: `$REMEDIATION_DIR/context.md`.
- Remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`.
- Source domino packet: `$D9_SOURCE_PACKET`.
- Accepted design inputs: D0, D1, D6, D7, and D8 accepted design/specification
  packets.
- Dependency inputs not yet implementation-ready: D10 Protected Zone Authority
  and G-HOST Host Policy Boundary Gate.
- Current code and tests under `$HABITAT_TOOL` as present-behavior evidence,
  not target-domain authority.
- Required skill anchors: Domain Design, Information Design, Solution Design,
  TypeScript refactoring, and Civ7 OpenSpec Workstream.

## Product Scenario

An agent or human asks Habitat to apply a known structural repair. Habitat must
show what would change, refuse unsafe or unauthorized writes, execute only
approved write sets, run declared hygiene and gate handoffs, roll back after
write-stage failures, and report recoverable terminal states without implying
diagnostic cleanliness, product runtime correctness, or vendor semantics that
Habitat does not own.

## What Changes

- Defines `Transformation Transaction` as the D9 owner and `ApplyTransactionRecord`
  as the target public meaning inherited from D1.
- Replaces optional/boolean transaction state with closed request, dry-run,
  write-set, live-write, formatter, gate, rollback, refusal, outcome, recovery,
  and non-claim state families.
- Requires D8 `ApplyAdmissionProjection` before D9 evaluates any apply pattern.
- Requires D10/G-HOST path and host-gate projections before D9 approves writes
  into protected/generated or host-specific surfaces.
- Treats Grit, Biome, Git, and Nx as vendor/tool owners whose command outcomes
  D9 records without reimplementing their semantics.
- Removes `GritApply*` exports and proof-shaped names from the D9 implementation
  surface.

## What Does Not Change

- No TypeScript source implementation in this remediation layer.
- No D6 diagnostic catalog ownership.
- No D8 Pattern Governance lifecycle/admission ownership.
- No D10 generated/protected-zone policy ownership.
- No G-HOST host policy ownership, including Civ7/MapGen public-ops semantics.
- No D11 hook sequencing or staged-file behavior.
- No D13 generator or candidate creation behavior.
- No D15 command-provenance substrate unless D9 records a concrete state that
  cannot be represented inside D9-owned transaction records.

## Requires

- D0 for every public command, package export, JSON/human output, script, docs
  example, or durable behavior surface touched by D9.
- D1 for `ApplyTransactionRecord`, D1 non-claim identifiers, and refusal record
  relationships.
- D6 for diagnostic identity and limitations only; D6 diagnostics do not
  authorize writes.
- D8 for `ApplyAdmissionProjection` and apply-refusal projections.
- D10/G-HOST for protected/generated path decisions and host-specific apply
  gate declarations where touched.

## Enables

- D11 Local Feedback may consume D9 local-feedback-safe transaction projections
  for refused, dry-run, applied, rolled-back, rollback-failed, and recovery
  states.
- D13 may consume D9 transaction-input prerequisites for future apply-capable
  candidates, while D13 still owns candidate generation.
- Future apply packet work may rely on the D9 closed state model instead of
  parsing process-shaped proof/result objects.

## Affected Public And Durable Surfaces

These surfaces require D0 row citation before source implementation may change
or remove them:

- `habitat fix` and `habitat fix --dry-run` CLI behavior, human output, exit
  status, and Oclif help text.
- Any new `habitat fix --json` flag or JSON output. D9 does not treat JSON as a
  current command surface; adding it requires an explicit D0-backed public
  contract.
- Removed package exports from `$HABITAT_TOOL/src/index.ts`: `GritApplyTransactionOptions`,
  `GritApplyTransactionProof`, `GritApplyTransactionResult`,
  `GritApplyRewriteInventoryEntry`, `classifyApplyRewriteInventory`,
  `parseApplyRewriteInventory`, and `runGritApplyTransaction`.
- Command/process DTOs that appear in apply transaction output:
  `HabitatCommandResult`, `HabitatProcessRequest`, command `kind` strings, and
  gate/formatter/rollback command records.
- Apply pattern paths under `.grit/patterns/habitat/apply/**` when D9 changes
  their transaction invocation or inventory expectations.
- Habitat docs/examples that show fix/apply output or recovery behavior.

## Write Set For Later Implementation

Later D9 source work may touch only the D9-owned transaction and adjacent
projection surfaces:

- `$HABITAT_TOOL/src/lib/grit-apply.ts` and D9-owned extracted modules for
  transaction state, write-set approval, formatter handoff, gate handoff, and
  rollback/recovery.
- `$HABITAT_TOOL/src/lib/command-engine.ts` and `$HABITAT_TOOL/src/commands/fix.ts`
  only to construct explicit D9 request variants and render D9 outcomes.
- `$HABITAT_TOOL/src/index.ts` only to remove old D9 transaction exports or add
  a future D0-backed public record surface.
- `$HABITAT_TOOL/test/lib/transformation-transaction.test.ts` and D9-specific
  follow-on test files. The implementation should keep product behavior tests
  close to the transaction module and avoid reviving deleted monolith fixtures.
- Grit apply pattern fixture tests only when the D9 transaction contract changes
  invocation or inventory expectations; Grit pattern semantics remain Grit/D8
  owned.

Protected from D9 implementation: D6 diagnostic behavior, D8 governance and
manifest lifecycle, D10/G-HOST policy definitions, D11 hooks, D13 generators,
generated outputs, lockfiles, baseline JSON edits, and product mod source
changes not justified as isolated D9 fixtures.

## Verification Gates

Design-time gates before D9 acceptance:

- D9 complete-standard wording audit over `$D9_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D9-*.md`.
- `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`
- `bun run openspec:validate`
- `git diff --check`
- Fresh D9 final rereview lanes for domain/ontology, TypeScript/validation,
  OpenSpec/information, code/vendor topology, and cross-domino/product.

Later implementation gates:

- `bun run --cwd tools/habitat-harness test -- test/lib/transformation-transaction.test.ts`
  plus any future D9-owned split tests introduced by the implementation.
- `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts`
  when apply pattern invocation or fixtures change.
- `bun tools/habitat-harness/bin/dev.ts fix --dry-run` with
  `git status --short --branch` before and after.
- Native Grit pattern tests for every apply pattern whose transaction inventory
  or fixture contract D9 touches.
- Injected bad-case tests for missing D8 admission, missing D10/G-HOST
  projection, dirty live worktree, dry-run parse mismatch, unapproved paths,
  create/delete refusal, unexpected live changed path, formatter failure,
  gate failure, rollback success, rollback failure, and post-handoff path drift.

## Stop Conditions

- A live write can be constructed without D8 apply admission.
- A planned write can bypass D10/G-HOST protected/generated or host-gate
  decisions where those surfaces are touched.
- `ok: boolean` plus nullable command/proof fields remains the target model.
- D9 embeds Civ7/MapGen public-ops validation as generic transaction policy
  instead of consuming a declared host gate.
- `habitat fix --json` appears as a gate or output without an explicit D0
  public contract decision.
- Formatter, gate, rollback, or vendor command success is reported as product
  correctness, current-tree diagnostic cleanliness, or runtime proof.
