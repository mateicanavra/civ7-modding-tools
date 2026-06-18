# Proposal: D8 Pattern Governance

## Summary

Open the D8 Pattern Governance OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D8 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md.

## Product Scenario

A maintainer promotes or rejects structural patterns through Pattern Authority without confusing draft generation, diagnostic catalog entries, and enforced rules.

## What Changes

- Define pattern lifecycle states and admission gates.
- Separate generated candidate drafts from registered enforcement.
- Connect governance to D2 facets and D5 baselines.

## What Does Not Change

- No Grit diagnostic execution ownership.
- No scaffold/generator product expansion.
- No baseline expansion by admission side effect.

## Requires

- D0
- D2
- D5
- D6

## Enables

- D9
- D13

## Affected Owners

- Domain owner: Pattern Governance.
- OpenSpec change path: `openspec/changes/deep-habitat-d8-pattern-governance/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Pattern Governance authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Generator and docs guidance may change to clarify candidate vs registered pattern status.

## Stop Conditions

- Generated pattern candidates become enforced rules automatically.
- Pattern status inferred from file presence.
- Governance states are unnamed or optional.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts
- bun run habitat classify tools/habitat-harness/src/rules/rules.json
- bun run openspec -- validate deep-habitat-d8-pattern-governance --strict
- `bun run openspec:validate`
- `git diff --check`
