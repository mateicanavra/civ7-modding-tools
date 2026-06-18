# Proposal: D15 Execution Provenance Trigger

## Summary

Open the D15 Execution Provenance Trigger OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D15 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md.

## Product Scenario

A consuming packet reaches command orchestration complexity that local TypeScript cannot model cleanly, and Habitat needs an explicit trigger before adopting a heavier execution provenance substrate.

## What Changes

- Define trigger conditions for a provenance substrate decision.
- Require packet-local minimization before any standalone substrate migration.
- Document why D15 is a trigger, not default implementation.

## What Does Not Change

- No broad Effect migration.
- No standalone substrate unless a consuming packet proves necessity.
- No proof/evidence artifact expansion.

## Requires

- D6, D7, D9, or D11 consuming packet identifies impossible local states

## Enables

- A future packet-local substrate decision only when triggered

## Affected Owners

- Domain owner: Execution Provenance Trigger.
- OpenSpec change path: `openspec/changes/deep-habitat-d15-execution-provenance-trigger/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Execution Provenance Trigger authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

No public impact unless a triggered packet designs command provenance output through D0/D1 compatibility rules.

## Stop Conditions

- D15 becomes default architecture.
- Substrate is adopted to preserve current manual failure modes.
- Trigger lacks concrete state-space reduction and simpler alternative rejection.

## Verification Gates

- bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict
- `bun run openspec:validate`
- `git diff --check`
