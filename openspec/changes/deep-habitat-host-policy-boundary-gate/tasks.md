# Tasks

## 1. Design-Time Grounding

- [ ] 1.1 Read `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, D0, D1,
  and this OpenSpec packet.
- [ ] 1.2 Confirm the active worktree and branch match
  `$ACTIVE_REMEDIATION_WORKTREE` and `$ACTIVE_REMEDIATION_BRANCH`.
- [ ] 1.3 Import first-wave G-HOST review findings into
  `workstream/review-disposition-ledger.md` before status movement.
- [ ] 1.4 Keep source implementation blocked until G-HOST final rereview records
  no unresolved P1/P2 findings and D0 rows exist for public surfaces touched by
  later source work.

## 2. Host Policy Contract Implementation Slices

- [ ] 2.1 Add `$HABITAT_TOOL/src/lib/host-policy.ts` as the internal
  host-policy owner module and declaration parser/validator for
  `HostPolicyId`, `HostPolicyOwner`, `HostDeclarationId`,
  `HostPolicyDeclaration`, declaration states, and `HostRecoveryInstruction`.
- [ ] 2.2 Move current generated/protected/external-resource host surface facts
  behind `HostSurfaceProjection` and remove Civ7/Swooper/MapGen path constants
  as generic Habitat authority.
- [ ] 2.3 Move host-specific apply gate facts behind
  `HostApplyGateProjection`; D9 transaction code may sequence declared gates but
  must not own MapGen public-ops semantics.
- [ ] 2.4 Move host-owned project creation support/refusal facts behind
  `HostProjectSupportProjection`; D13 may render/refuse from the projection but
  must not infer support locally.
- [ ] 2.5 Add `HostAuthoringBoundaryProjection` only where D14 needs host-policy
  relation and non-claims; do not convert host policy into authoring readiness.
- [ ] 2.6 Replace free-form recovery text with structured
  `HostRecoveryInstruction` values.
- [ ] 2.7 Preserve D1 output-family/non-claim handling for every changed command
  or report surface.

## 3. Public Surface And Compatibility

- [ ] 3.1 Cite concrete D0 rows before changing staged file-layer command output,
  apply/fix output, generator help/errors, public exports, docs, or examples;
  cite the D0 preserve/document-only row for the internal
  `$HABITAT_TOOL/src/lib/host-policy.ts` source location before source work
  starts.
- [ ] 3.2 Record whether each touched public surface is preserve, version,
  facade, deprecate, refuse, document-only, or generated-only according to D0.
- [ ] 3.3 Do not introduce public declaration/projection exports unless D0 and D1
  classify their compatibility and output-family handling.
- [ ] 3.4 Do not introduce a user-authored host config, repo-authored declaration
  data file, documented declaration location, or public declaration export in this
  packet's first source implementation.

## 4. Validation

- [ ] 4.1 Run host declaration parser/validator tests covering declared, missing,
  unavailable, malformed, conflicting, not-applicable states, and unsupported
  declaration/refusal outcomes through `test/lib/host-policy.test.ts`.
- [ ] 4.2 Run D10-facing tests for generated/protected/external-resource surfaces,
  including missing and conflicting host declarations.
- [ ] 4.3 Run D9-facing apply-gate tests proving host-specific gates require
  `HostApplyGateProjection` and cannot run as generic transaction logic.
- [ ] 4.4 Run D13-facing project creation/refusal tests proving refused
  host-owned requests make no writes and return owner/recovery/non-claim data.
- [ ] 4.5 Run command-surface tests for changed `habitat check --staged --tool
  file-layer --json`, `habitat fix`, generator output, or docs examples when
  those surfaces are touched.
- [ ] 4.6 Run `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`.
- [ ] 4.7 Run `bun run openspec:validate`.
- [ ] 4.8 Run `git diff --check`.
- [ ] 4.9 Run `git status --short --branch` after fixture-heavy tests to confirm
  no generated output or temporary declaration data remains.

## 5. Review And Closure

- [ ] 5.1 Run fresh final domain/ontology, TypeScript/validation,
  OpenSpec/information, code/vendor topology, and cross-domino/product rereviews
  after packet repairs.
- [ ] 5.2 Repair every accepted P1/P2 finding before packet acceptance.
- [ ] 5.3 Update downstream realignment for D9, D10, D13, D14, packet index, and
  D15 trigger non-claims.
- [ ] 5.4 Mark G-HOST accepted for design/specification only after final
  rereviews and validation pass on the same disk state.
- [ ] 5.5 Keep D9/D10/D13/D14 source implementation blocked wherever accepted/live
  G-HOST projections are required but not implemented.
