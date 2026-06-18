# Proposal: D11 Local Feedback

## Summary

Open the D11 Local Feedback OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D11 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md.

## Product Scenario

A local hook gives fast feedback without pretending to be CI, full structural verification, product approval, or safe-apply completion.

## What Changes

- Define hook-local feedback scope and non-claims.
- Consume D7/D9/D10 decisions instead of recomputing them.
- Clarify human output and machine records for hook traces.

## What Does Not Change

- No CI authority.
- No verify handoff ownership.
- No rule/check/apply domain ownership.

## Requires

- D0
- D1
- D7
- D9
- D10

## Enables

- None.

## Affected Owners

- Domain owner: Local Feedback.
- OpenSpec change path: `openspec/changes/deep-habitat-d11-local-feedback/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Local Feedback authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Hook output and HookTrace may change under D0/D1 compatibility decisions.

## Stop Conditions

- Hooks claim CI or review completion.
- Hook traces collapse check/apply/protected-zone authority.
- Local failures are silently skipped.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts
- bun run habitat hook pre-commit -- --help
- bun run openspec -- validate deep-habitat-d11-local-feedback --strict
- `bun run openspec:validate`
- `git diff --check`

## D3 Dependency Note

Pre-push affected-target behavior depends on D3 Workspace Graph Boundary. D11 may
plan local hook feedback before D3, but it must not implement or close pre-push
target selection, base detection, or target-truth behavior until D3 graph facts
are stable.
