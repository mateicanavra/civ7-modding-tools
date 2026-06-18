# Phase Record: Host Policy Boundary Gate

## State

- Status: accepted for design/specification only after after-repair final rereview; not implementation-complete.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`.
- OpenSpec change: `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/`.

## Objective

Specify G-HOST as the Host Policy Boundary packet that separates generic Habitat
behavior from host-owned repo policy facts for generated/protected surfaces,
external-resource surfaces, host-specific apply gates, and host-owned creation
support/refusal.

## Current Gate

Design/specification acceptance gate closed after first-wave findings and the
first final OpenSpec/information P2 findings were repaired. After-repair final
rereview lanes read the repaired disk state and recorded no unresolved P1/P2
findings. Source implementation remains blocked behind concrete D0 rows, D1
output-family handling, internal `$HABITAT_TOOL/src/lib/host-policy.ts`
preserve/document-only handling, and accepted/live G-HOST projections.

## First-Wave Review Inputs

- `$AGENT_SCRATCH/host-policy-boundary-domain-ontology-review.md`
- `$AGENT_SCRATCH/host-policy-boundary-typescript-state-review.md`
- `$AGENT_SCRATCH/host-policy-boundary-code-vendor-topology-review.md`
- `$AGENT_SCRATCH/host-policy-boundary-openspec-information-testing-review.md`
- `$AGENT_SCRATCH/host-policy-boundary-cross-domino-product-review.md`

## After-Repair Final Rereview Evidence

- `$GHOST_AFTER_REPAIR_DOMAIN_REVIEW`
- `$GHOST_AFTER_REPAIR_TYPESCRIPT_VALIDATION_REVIEW`
- `$GHOST_AFTER_REPAIR_OPENSPEC_INFORMATION_REVIEW`
- `$GHOST_AFTER_REPAIR_CODE_VENDOR_TOPOLOGY_REVIEW`
- `$GHOST_AFTER_REPAIR_CROSS_DOMINO_PRODUCT_REVIEW`

## Design-Time Validation Gates

| Gate | Expected Status | Purpose | Non-Claims |
| --- | --- | --- | --- |
| G-HOST wording/control audit over source packet, change files, packet index, context, and G-HOST scratch | no active compactness, size-framing, or stale control wording; remaining audit hits are canonical D13 title/slug traceability only | Ensures final reviewers read current complete-standard guidance. | Does not prove runtime behavior. |
| `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` | exit 0 | Validates G-HOST OpenSpec structure. | Does not prove host declaration behavior. |
| `bun run openspec:validate` | exit 0 | Validates the full OpenSpec corpus. | Does not prove implementation readiness. |
| `git diff --check` | exit 0 | Checks diff hygiene. | Does not prove semantic correctness. |

## Later Implementation Gates

These gates are required only when a source implementation packet consumes this
design:

- focused host declaration parser/validator tests covering declared, missing,
  unavailable, malformed, conflicting, and not-applicable source states plus
  unsupported declaration/refusal outcomes;
- staged file-layer command tests for clean and injected host-owned surface
  mutations;
- D9 apply-gate tests for declared, missing, and invalid host apply gates;
- D10 generated/protected/external-resource consumer tests;
- D13 host-owned project support/refusal tests with no-write assertions;
- D14 authoring non-claim tests where host policy is mentioned;
- native-tool mirror checks for Nx/Biome/Grit/Git boundaries where touched;
- `git status --short --branch` after fixture-heavy tests.

## Non-Claims

- This packet does not implement Habitat source changes.
- This packet does not prove generated files are current.
- This packet does not prove MapGen runtime/product behavior.
- This packet does not make authoring topology supported.
- This packet does not authorize unbounded provenance/process-substrate migration.
