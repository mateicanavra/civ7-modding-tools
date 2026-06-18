# Proposal: D12 Verify Handoff Receipt

## Summary

Open the D12 Verify Handoff Receipt OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D12 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D12-proof-handoff-verify-command.md.

## Product Scenario

A DRA owner asks Habitat to assemble a review handoff after check/graph work and needs the result to be a bounded receipt of command outcomes, not a broad proof artifact.

## What Changes

- Define verify command as handoff assembler over D1/D3/D7 outputs.
- Replace target-domain proof language with receipt/handoff terminology.
- Specify command streams, post-state, skipped states, and non-claims.

## What Does Not Change

- No check execution ownership.
- No graph target ownership.
- No product approval or Graphite submit claim.

## Requires

- D0
- D1
- D3
- D7

## Enables

- D14

## Affected Owners

- Domain owner: Verify Handoff.
- OpenSpec change path: `openspec/changes/deep-habitat-d12-verify-handoff-receipt/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Verify Handoff authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Verify JSON/human output may require compatibility-preserving receipt fields or explicit versioning.

## Stop Conditions

- Verify creates new authority instead of assembling consumed results.
- Receipt implies product approval, runtime behavior, or Graphite readiness.
- Skipped/failed upstream states can be represented as success.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts
- bun run habitat verify --help
- bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict
- `bun run openspec:validate`
- `git diff --check`
