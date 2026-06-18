# Proposal: D14 Authoring Topology Fence

## Summary

Open the D14 Authoring Topology Fence OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D14 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D14-authoring-topology-fence.md.

## Product Scenario

Future authoring ambitions are visible without allowing current Habitat implementation to smuggle MapGen authoring topology into the generic structural toolkit.

## What Changes

- Define the fence between current structural substrate and future authoring topology.
- Convert unsupported authoring requests into D13 refusal criteria.
- Record trigger conditions for future design work.

## What Does Not Change

- No MapGen authoring implementation.
- No new authoring domain model in Phase 3.
- No generic Habitat coupling to Civ authoring concepts.

## Requires

- D0
- D4
- D12
- D13

## Enables

- None.

## Affected Owners

- Domain owner: Authoring Topology Fence.
- OpenSpec change path: `openspec/changes/deep-habitat-d14-authoring-topology-fence/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Authoring Topology Fence authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Only refusal/guidance language may change unless a later accepted authoring project starts.

## Stop Conditions

- Fence becomes an implementation packet without a concrete refusal need.
- Future authoring concepts leak into current command/types.
- D13 lacks refusal tests for authoring requests.

## Verification Gates

- bun run habitat classify mods/mod-swooper-maps/src/recipes/standard
- bun run openspec -- validate deep-habitat-d14-authoring-topology-fence --strict
- `bun run openspec:validate`
- `git diff --check`
