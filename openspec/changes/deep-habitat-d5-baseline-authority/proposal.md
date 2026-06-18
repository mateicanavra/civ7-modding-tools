# Proposal: D5 Baseline Authority

## Summary

Open the D5 Baseline Authority OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D5 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md.

## Product Scenario

A repo maintainer manages structural debt and needs Habitat baselines to shrink intentionally, reject accidental expansion, and connect each debt row to owning rules and governance.

## What Changes

- Define baseline ownership, shrink-only behavior, introduction manifest relation, and stale-row handling.
- Connect baselines to D2 registry facets and D8 governance admission.
- Specify debt row lifecycle and refusal cases.

## What Does Not Change

- No rule execution redesign.
- No automatic baseline expansion.
- No Pattern Governance ownership collapse.

## Requires

- D0
- D2

## Enables

- D7
- D8

## Affected Owners

- Domain owner: Baseline Authority.
- OpenSpec change path: `openspec/changes/deep-habitat-d5-baseline-authority/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Baseline Authority authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Check output may report baseline decisions more precisely within D0 compatibility rules.

## Stop Conditions

- Baseline file presence is treated as admission authority.
- New violations are silently added.
- Debt rows lack owner/rule/governance relation.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts
- bun run habitat check --json
- bun run openspec -- validate deep-habitat-d5-baseline-authority --strict
- `bun run openspec:validate`
- `git diff --check`
