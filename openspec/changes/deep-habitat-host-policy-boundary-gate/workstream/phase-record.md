# Phase Record: Host Policy Boundary Gate

## State

- Status: source implementation ready for Graphite submission on the inserted G-HOST Graphite branch; host-policy projections are implemented and validated for this layer.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `agent-DRA-host-policy-boundary-gate`.
- Source packet: `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`.
- OpenSpec change: `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/`.

## Objective

Implement G-HOST as the Host Policy Boundary packet that separates generic
Habitat behavior from host-owned repo policy facts for generated/protected
surfaces, external-resource surfaces, host-specific apply gates, and host-owned
creation support/refusal.

## Current Gate

Design/specification acceptance gate closed after first-wave findings and the
first final OpenSpec/information P2 findings were repaired. Source implementation
is now unblocked for G-HOST itself by concrete D0 row
`D0-package-export-source-host-policy-internal`, unchanged D1 output-family
handling, and the internal `$HABITAT_TOOL/src/lib/host-policy.ts` facade.

The current source layer implements TypeBox-first host policy schemas, bundled
host declarations, declaration state parsing, structured recovery instructions,
and named projections for host surfaces, scan roots, apply gates, project
support, and authoring-boundary relations. Existing generated-zone and Grit
scan-root consumers now consume host projections instead of a local generated
zone catalog. D9, D13, and D14 source implementation remains packet-local
downstream work; G-HOST provides the projections and does not claim those packets
are closed.

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

## Source Validation Gates

| Gate | Actual status | Purpose | Non-claims |
| --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness check` | pass | Type-checks the G-HOST source modules and consumers. | Does not prove every command path. |
| `bun run --cwd tools/habitat-harness build` | pass | Proves package build after the host-policy module split. | Does not generate or validate Oclif manifest behavior. |
| `bun run --cwd tools/habitat-harness test -- test/lib/host-policy.test.ts test/lib/generated-zones.test.ts test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts` | pass, 55 tests | Proves host declarations/projections, semantic conflict refusal, generated-zone consumption, scan-root refusal, and injected-probe generated-path refusal. | Does not close D9/D13/D14 source packets. |
| `bun run --cwd tools/habitat-harness test` | fail in this thread's latest full run: 27 files pass, 254 tests pass; `test/generators/pattern-generator.test.ts` fails importing `src/rules/registry/schema.js` from TS source. A temporary reviewer also observed an intermittent injected-probe full-suite failure, while the focused injected-probe suite passes. | Records broad package state after G-HOST repairs. | Failure is not a G-HOST host-policy regression; full package test is not used as the closure proof for this layer. |
| `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` | pass | Validates G-HOST OpenSpec structure. | Does not prove downstream consumer packet closure. |
| `bun run openspec:validate` | pass, 249 items | Validates the full OpenSpec corpus after G-HOST record updates. | Does not prove full package tests pass. |
| `git diff --check` | pass | Checks whitespace/diff hygiene. | Does not prove semantic correctness. |
| `git status --short --branch` | intended dirty files only after fixture-heavy tests | Confirms no generated output, lockfile, temporary probe, or external-resource output remains. | Dirty state remains until the G-HOST layer is committed. |

## Non-Claims

- This packet implements G-HOST source changes only.
- This packet does not prove generated files are current.
- This packet does not prove MapGen runtime/product behavior.
- This packet does not make authoring topology supported.
- This packet does not close D9, D13, or D14 source implementation.
- This packet does not authorize unbounded provenance/process-substrate migration.
