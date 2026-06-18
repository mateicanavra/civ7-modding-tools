# Proposal: D10 Protected Zone Authority

## Summary

Open the D10 Protected Zone Authority OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D10 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md.

## Product Scenario

Habitat prevents accidental edits to generated or protected regions while still allowing declared generators and host policies to own those files.

## What Changes

- Define protected-zone declaration, generated-zone relation, and guard decisions.
- Consume G-HOST policy and D2 registry facts.
- Expose refusal/recovery paths to check, hooks, and apply using D1 `RefusalRecord` and non-claim semantics.

## What Does Not Change

- No host-policy ownership.
- No transformation transaction ownership.
- No generated output hand edits.

## Requires

- D0
- D1
- D2
- G-HOST

## Enables

- D7
- D9
- D11

## Affected Owners

- Domain owner: Generated/Protected Zone Authority.
- OpenSpec change path: `openspec/changes/deep-habitat-d10-protected-zone-authority/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Generated/Protected Zone Authority authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Check/apply/hook output may report protected-zone refusals under D0 compatibility rules.

## Stop Conditions

- Host-specific zones are hard-coded as generic Habitat truth.
- Protected-zone violations are warnings only.
- Allowed generator paths cannot name their authority.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/generated-zones.test.ts
- bun run habitat check --json
- bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict
- `bun run openspec:validate`
- `git diff --check`
