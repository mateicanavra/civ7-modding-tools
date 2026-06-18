# Proposal: Host Policy Boundary Gate

## Summary

Specify the Host Policy Boundary Gate for Deep Habitat Phase 2 remediation.
This change converts the G-HOST domino input into a complete OpenSpec
design/specification packet for the host-policy boundary. It separates generic
Habitat behavior from host-owned repo policy before any TypeScript source
implementation proceeds.

## Authority

- Remediation frame: `$REPO_ROOT/docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Phase 2 source packet: `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`.
- Packet index and context: `$REMEDIATION_DIR/packet-index.md` and
  `$REMEDIATION_DIR/context.md`.
- Accepted upstream boundaries: D0 public-surface compatibility and D1
  output-family/non-claim handling.
- Accepted consumer packets: D9 Transformation Transaction, D10 Protected Zone
  Authority, D13 Project Creation And Refusal Contracts, and D14 Authoring
  Topology Fence.
- Current Habitat code and tests as current-behavior records, not target-domain
  authority.

## Product Scenario

Habitat remains a generic repo-local structural toolkit while a concrete host
repo declares its generated surfaces, protected surfaces, host-specific apply
gates, and unsupported host-owned creation requests through an explicit
host-policy boundary.

## What Changes

- Define the complete host declaration and refusal contract for the bounded
  host-policy surface currently consumed by D9, D10, D13, and D14.
- Require host-owned surface, apply-gate, recovery, and project-creation support
  facts to come from G-HOST declarations instead of generic Habitat constants.
- Make missing, unavailable, malformed, conflicting, and not-applicable
  declaration-source states explicit, and model unsupported host shapes as
  declaration/refusal outcomes.
- Define consumer projections for D9, D10, D13, and D14 so those packets cannot
  infer host policy locally.
- Keep source implementation blocked behind D0 public-surface rows, D1
  output-family handling, and this packet's accepted/live declarations.

## What Does Not Change

- No Host Policy Boundary source implementation is authorized by this packet.
- No MapGen authoring implementation is authorized.
- No generated output is edited by hand.
- No D9 transaction, D10 path guard, D13 project creation, or D14 authoring
  behavior becomes implementation-ready until those packets consume accepted/live
  G-HOST projections.

## Requires

- D0 Command Surface Inventory for every touched public command, JSON, export,
  script, target, generator, hook, and documented host declaration surface.
- D1 Receipt Contract Boundary for output-family and non-claim handling.

D2 is not a G-HOST design prerequisite. D10 may later combine D2 generated-zone
registry projections with G-HOST host declarations.

## Enables

- D10 consumes `HostSurfaceProjection` for generated/protected/external-resource
  path decisions.
- D9 consumes `HostApplyGateProjection` for host-specific transaction gates such
  as MapGen public-ops validation.
- D13 consumes `HostProjectSupportProjection` for host-owned supported/refused
  creation requests.
- D14 may consume `HostAuthoringBoundaryProjection` only to state host-policy
  relation and non-claims; G-HOST does not make authoring topology supported.

## Affected Owners

- Domain owner: Host Policy Boundary.
- OpenSpec change path: `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/**`.
- Later candidate implementation write set is specified in `design.md`; no source
  files are edited by this packet.

## Forbidden Owners

- D10 may not author host path lists, regeneration instructions, or host owners.
- D9 may not inspect MapGen public-ops semantics as generic transaction logic.
- D13 may not infer host support from package names, schema enum values, path
  conventions, or current thrown strings.
- D14 may not treat host policy as authoring readiness.
- Implementation agents may not add shims, fallbacks, dual paths, unreported bypass states,
  optional target shapes, or generated-output hand edits.

## Public Surface Impact

Potentially affected public/durable surfaces require concrete D0 rows before
source implementation:

- `habitat check --staged --tool file-layer --json` and human output.
- `habitat fix` / apply transaction JSON and human output when host apply gates
  affect refusal or rollback reporting.
- Generator schema/help/errors when host-owned creation requests are refused or
  routed.
- Any user-authored or documented host declaration file.
- The internal `$HABITAT_TOOL/src/lib/host-policy.ts` source location through a
  preserve/document-only row before source work starts.
- Package exports if host declaration or projection types become public.
- Docs/examples that mention generated/protected/host-owned behavior.

## Stop Conditions

- Civ7, Swooper, or MapGen path literals remain generic Habitat source truth.
- A consumer can decide host policy without a named G-HOST projection.
- Missing, unavailable, malformed, conflicting, not-applicable, or unsupported
  declaration/refusal outcomes can silently become pass/allow/not-applicable.
- Host recovery instructions remain free-form strings with no owner, retry
  condition, or non-claim.
- Generated outputs, lockfiles, `dist/**`, `mod/**`, or external resource outputs
  are hand-edited to satisfy validation.

## Validation Gates

Design-time gates:

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`
- `bun run openspec:validate`
- `git diff --check`
- G-HOST wording/control audit over `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`,
  `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/**`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and
  `$AGENT_SCRATCH/host-policy-boundary-*.md`.

Later implementation gates are specified in `tasks.md` and `design.md`.
