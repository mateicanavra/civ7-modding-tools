# Proposal: D15 Execution Provenance Trigger

## Summary

Open the D15 Execution Provenance Trigger OpenSpec packet as a dormant
command-observation trigger protocol for Deep Habitat Phase 2 remediation. This
change specifies when a consuming packet may ask for shared command-observation
substrate work, and when D15 remains non-implementing.

## Controlling Inputs

- Current user decision to restart OpenSpec packet preparation from square one.
- Remediation frame: `$REMEDIATION_FRAME`.
- Phase 2 packet suite: `$PHASE2_PACKET_DIR`.
- Root AGENTS.md Graphite/OpenSpec workflow guidance.
- Domain Design and Information Design skills as mandatory language and record
  gates.
- Current Habitat Toolkit code and tests as present-behavior records only.
- Source domino packet: `$D15_SOURCE_PACKET`.

## Product Scenario

A consuming packet reaches command-observation complexity that its local
TypeScript DTOs cannot model without contradictory states, and Habitat needs an
explicit trigger before introducing shared command-observation substrate work.

## What Changes

- Define trigger conditions for a shared command-observation substrate decision.
- Require packet-local DTO sufficiency review before any standalone substrate
  work.
- Record that D6, D7, D9, D11, and G-HOST do not currently trigger D15 by
  default.

## What Does Not Change

- No unbounded Effect migration.
- No standalone substrate unless a consuming packet proves necessity.
- No generic record expansion.

## Requires

- D6, D7, D9, D11, or G-HOST identifies a concrete command-observation state
  that its accepted local DTOs/contracts cannot represent.
- The requesting packet provides the local DTO sufficiency record required by
  `design.md`, including the attempted local type shape, contradiction fixture,
  required fields, field owners, proposed shared discriminants, D0 compatibility
  rows, and D1 output-family/support-boundary handling for public surfaces.

## Enables

- A future packet-local command-observation substrate decision only when
  triggered.

## Affected Owners

- Domain owner: Command Observation Trigger.
- OpenSpec change path: `openspec/changes/deep-habitat-d15-execution-provenance-trigger/**`.
- No Habitat implementation write set is authorized or expected while D15 is
  `dormant` or `trigger-requested`. A later accepted trigger owner must name the
  exact write/protected set before source work.

## Forbidden Owners

- Adjacent dominoes may not redefine the Command Observation Trigger contract.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, silent alternate paths, dual paths,
  unreported bypass states, optional target shape, or generated-output hand
  edits.

## Consumer Impact

No public impact unless a later triggered packet designs command-observation
output through concrete D0 compatibility rows and D1 output-family/support-boundary
handling.

## Stop Conditions

- D15 becomes default architecture.
- Substrate is adopted to preserve current manual failure modes.
- Trigger lacks concrete state-space reduction and local DTO alternative
  rejection.

## Verification Gates

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`
- `bun run openspec:validate`
- `git diff --check`
