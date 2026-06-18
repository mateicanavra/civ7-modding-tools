# Proposal: D7 Structural Enforcement Pipeline

## Summary

Open the D7 Structural Enforcement Pipeline OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D7 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md.

## Product Scenario

An agent runs Habitat check and receives a reliable structural result that composes registry metadata, diagnostics, baselines, generated-zone guards, and graph facts without false green paths.

## What Changes

- Define check pipeline ownership and inputs from D2/D3/D5/D6/D10.
- Specify result aggregation and failure/refusal states.
- Separate enforcement result from orientation and receipts.

## What Does Not Change

- No rule registry schema ownership.
- No baseline admission ownership.
- No hook-specific local feedback ownership.

## Requires

- D0
- D1
- D2
- D3
- D5
- D6
- D10

## Enables

- D11
- D12

## Affected Owners

- Domain owner: Structural Enforcement.
- OpenSpec change path: `openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Structural Enforcement authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Check JSON may change only through D0 compatibility and D1 receipt/non-claim decisions.

## Stop Conditions

- A diagnostic failure is reported as pass.
- Baseline/generated-zone/graph decisions are recomputed locally instead of consumed.
- Check owns hook or verify handoff semantics.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts
- bun run habitat check --json
- bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict
- `bun run openspec:validate`
- `git diff --check`
