# Proposal: D4 Orientation And Routing

## Summary

Open the D4 Orientation And Routing OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D4 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md.

## Product Scenario

A human or agent asks Habitat what a path or diff means and receives owner, supported action, refusal, and next-command guidance that is trustworthy and generic.

## What Changes

- Define path/diff orientation contracts from D2 registry and D3 graph facts.
- Separate routing facts from enforcement results.
- Add refusal and recovery language for unsupported surfaces.

## What Does Not Change

- No new generator support.
- No structural enforcement pipeline rewrite.
- No Civ-specific routing authority.

## Requires

- D0
- D2
- D3

## Enables

- D14

## Affected Owners

- Domain owner: Orientation and Routing.
- OpenSpec change path: `openspec/changes/deep-habitat-d4-orientation-routing/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Orientation and Routing authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Classify/orientation JSON and human guidance may change only through D0 compatibility decisions.

## Stop Conditions

- Orientation emits commands not backed by D3 graph facts.
- Unsupported scenarios lack refusal reason and recovery path.
- Routing language depends on Civ/MapGen-only assumptions.

## Verification Gates

- bun run habitat classify tools/habitat-harness/src/plugin.js
- bun run habitat classify docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md
- bun run openspec -- validate deep-habitat-d4-orientation-routing --strict
- `bun run openspec:validate`
- `git diff --check`
