# Proposal: D13 Scaffolding And Refusal Contracts

## Summary

Open the D13 Scaffolding And Refusal Contracts OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D13 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md.

## Product Scenario

An agent requests a new project, pattern, or structural shape and Habitat either scaffolds a supported uniform shape or refuses unsupported work with owner and recovery guidance.

## What Changes

- Define supported scaffold contracts and unsupported refusal shape.
- Separate project scaffolding from Pattern Governance candidate generation.
- Consume host policy for host-specific generator refusals.

## What Does Not Change

- No new unsupported generator implementation.
- No automatic pattern registration.
- No Civ-specific generator assumptions in generic Habitat.

## Requires

- D0
- D2
- D8
- G-HOST

## Enables

- D14

## Affected Owners

- Domain owner: Scaffolding and Refusal.
- OpenSpec change path: `openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Scaffolding and Refusal authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Generator CLI output and schemas may change under D0 compatibility rules.

## Stop Conditions

- Unsupported kinds create files.
- Generated pattern candidates become registered rules.
- Refusals lack owner, reason, and recovery path.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts
- bun run habitat generate --help
- bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict
- `bun run openspec:validate`
- `git diff --check`
