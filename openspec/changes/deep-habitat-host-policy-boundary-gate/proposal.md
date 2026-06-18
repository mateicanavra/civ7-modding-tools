# Proposal: Host Policy Boundary Gate

## Summary

Open the Host Policy Boundary Gate OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing G-HOST domino packet into a review-gated
OpenSpec packet scaffold. It resolves scope, owner, public surface impact,
validation gates, downstream realignment, and stop conditions before any
TypeScript implementation resumes.

## Authority

- Current user decision to restart OpenSpec packet preparation from square one.
- Remediation frame: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md.
- Phase 2 packet suite: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets.
- Root AGENTS.md Graphite/OpenSpec workflow guidance.
- Domain Design and Information Design skills as mandatory language and artifact gates.
- Current Habitat Toolkit code and tests as present-behavior evidence only.
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md.

## Product Scenario

Habitat stays generic while host-specific repos such as Civ/MapGen declare protected paths, generated zones, and supported/refused host behavior through an explicit boundary.

## What Changes

- Define host policy declaration and refusal boundary.
- Move Civ/MapGen-specific assumptions out of generic Habitat authority.
- Gate D10/D13 generic closure on host-policy separation.

## What Does Not Change

- No host-specific implementation hidden in generic code.
- No MapGen authoring implementation.
- No generated-zone rewrite before D10.

## Requires

- D0
- D1

## Enables

- D10
- D13

G-HOST is parallel host-policy boundary work. It is not enabled by D2. D10 is the packet where D2 generated-zone registry facts and G-HOST host-policy declarations meet.

## Affected Owners

- Domain owner: Host Policy Boundary.
- OpenSpec change path: `openspec/changes/deep-habitat-host-policy-boundary-gate/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Host Policy Boundary authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Generic Habitat commands may report host policy facts or refusals only through explicit host policy records.

## Stop Conditions

- Civ/MapGen paths justify generic Habitat behavior.
- Protected-zone rules cannot name their host policy owner.
- Unsupported host scenarios fail without refusal guidance.

## Verification Gates

- bun run habitat classify mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json
- bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict
- `bun run openspec:validate`
- `git diff --check`
