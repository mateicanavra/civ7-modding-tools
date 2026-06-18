# Proposal: D9 Transformation Transaction

## Summary

Open the D9 Transformation Transaction OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D9 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D9-transformation-transaction.md.

## Product Scenario

An agent applies a structural rewrite and needs dry-run, live write, rollback, formatting, and refusal behavior to be explicit and recoverable.

## What Changes

- Define apply transaction states and rollback boundaries.
- Separate Grit diagnostic input from write transaction output.
- Use D1 receipt terms only for transaction handoff records that serve recovery.

## What Does Not Change

- No diagnostic catalog ownership.
- No generated-zone policy ownership.
- No generic command provenance substrate unless D15 trigger passes.

## Requires

- D0
- D1
- D6
- D8
- D10

## Enables

- D11

## Affected Owners

- Domain owner: Transformation Transaction.
- OpenSpec change path: `openspec/changes/deep-habitat-d9-transformation-transaction/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Transformation Transaction authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Apply/fix output may change for transaction clarity under D0 compatibility rules.

## Stop Conditions

- Dry-run and live apply share ambiguous state.
- Rollback failure is hidden.
- Protected-zone violations become best-effort skips.
- Transaction records become generic proof artifacts.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts
- bun run habitat fix --help
- bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict
- `bun run openspec:validate`
- `git diff --check`
