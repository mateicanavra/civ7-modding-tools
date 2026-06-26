# Tasks

## 1. Design-Time Grounding

- [x] 1.1 Read `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, D0, D1,
  and this OpenSpec packet.
- [x] 1.2 Confirm the active worktree and branch match
  `$ACTIVE_REMEDIATION_WORKTREE` and `$ACTIVE_REMEDIATION_BRANCH`.
- [x] 1.3 Import first-wave G-HOST review findings into
  `workstream/review-disposition-ledger.md` before status movement.
- [x] 1.4 Keep source implementation blocked until G-HOST final rereview records
  no unresolved P1/P2 findings and D0 rows exist for public surfaces touched by
  later source work.

## 2. Host Policy Contract Implementation Slices

- [x] 2.1 Add `$HABITAT_TOOL/src/lib/host-policy.ts` as the internal
  host-policy owner module and declaration parser/validator for
  `HostPolicyId`, `HostPolicyOwner`, `HostDeclarationId`,
  `HostPolicyDeclaration`, declaration states, and `HostRecoveryInstruction`.
- [x] 2.2 Move current generated/protected/external-resource host surface facts
  behind `HostSurfaceProjection` and remove Civ7/Swooper/MapGen path constants
  as generic Habitat authority.
- [x] 2.3 Move host-specific apply gate facts behind
  `HostApplyGateProjection`; D9 transaction code may sequence declared gates but
  must not own MapGen public-ops semantics.
- [x] 2.4 Move host-owned project creation support/refusal facts behind
  `HostProjectSupportProjection`; D13 may render/refuse from the projection but
  must not infer support locally.
- [x] 2.5 Add `HostAuthoringBoundaryProjection` only where D14 needs host-policy
  relation and non-claims; do not convert host policy into authoring readiness.
- [x] 2.6 Replace free-form recovery text with structured
  `HostRecoveryInstruction` values.
- [x] 2.7 Preserve D1 output-family/non-claim handling for every changed command
  or report surface.

## 3. Public Surface And Compatibility

- [x] 3.1 Cite concrete D0 rows before changing staged file-layer command output,
  apply/fix output, generator help/errors, public exports, docs, or examples;
  cite the D0 preserve/document-only row for the internal
  `$HABITAT_TOOL/src/lib/host-policy.ts` source location before source work
  starts.
- [x] 3.2 Record whether each touched public surface is preserve, version,
  facade, deprecate, refuse, document-only, or generated-only according to D0.
- [x] 3.3 Do not introduce public declaration/projection exports unless D0 and D1
  classify their compatibility and output-family handling.
- [x] 3.4 Do not introduce a user-authored host config, repo-authored declaration
  data file, documented declaration location, or public declaration export in this
  packet's first source implementation.

## 4. Validation

- [x] 4.1 Run host declaration parser/validator tests covering declared, missing,
  unavailable, malformed, conflicting, not-applicable states, and unsupported
  declaration/refusal outcomes through `test/lib/host-policy.test.ts`.
- [x] 4.2 Run D10-facing tests for generated/protected/external-resource surfaces,
  including missing and conflicting host declarations.
- [x] 4.3 Run G-HOST projection tests for declared and missing host-specific
  apply gates. D9 transaction sequencing/no-generic-run proof remains D9-owned.
- [x] 4.4 Run G-HOST projection tests for refused host-owned project requests.
  D13 generator no-write behavior remains D13-owned.
- [x] 4.5 Run command-surface tests for changed `habitat check --staged --tool
  file-layer --json`, `habitat fix`, generator output, or docs examples when
  those surfaces are touched.
- [x] 4.6 Run `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`.
- [x] 4.7 Run `bun run openspec:validate`.
- [x] 4.8 Run `git diff --check`.
- [x] 4.9 Run `git status --short --branch` after fixture-heavy tests to confirm
  no generated output or temporary declaration data remains.

## 5. Review And Closure

- [x] 5.1 Run fresh final domain/ontology, TypeScript/validation,
  OpenSpec/information, code/vendor topology, and cross-domino/product rereviews
  after packet repairs.
- [x] 5.2 Repair every accepted P1/P2 finding before packet acceptance.
- [x] 5.3 Update downstream realignment for D9, D10, D13, D14, packet index, and
  D15 trigger non-claims.
- [x] 5.4 Mark G-HOST source implementation ready for Graphite submission after
  final rereviews and validation pass on the same disk state.
- [x] 5.5 Keep D9/D10/D13/D14 source implementation packet-local wherever
  accepted/live G-HOST projections are consumed.
