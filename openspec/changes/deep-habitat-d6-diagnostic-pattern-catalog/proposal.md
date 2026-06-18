# Proposal: D6 Diagnostic Pattern Catalog

## Summary

Open the D6 Diagnostic Pattern Catalog OpenSpec packet for Deep Habitat Phase 2 remediation. This
change converts the existing D6 domino packet into a review-gated
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
- Source domino packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md.

## Product Scenario

Structural checks use Grit/native diagnostics and need a catalog that identifies what each diagnostic can detect without making governance, baseline, or apply decisions.

## What Changes

- Define diagnostic acquisition/projection contracts.
- Separate pattern catalog entries from Pattern Authority admission.
- Specify native/Grit diagnostic normalization and failure states.

## What Does Not Change

- No governance admission.
- No apply transaction redesign.
- No proof artifact framework.

## Requires

- D0
- D1
- D2

## Enables

- D7
- D8
- D9
- D15 evaluation

## Affected Owners

- Domain owner: Diagnostic Pattern Catalog.
- OpenSpec change path: `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/**`.
- Expected Habitat implementation write set named in `design.md`; no code is
  authorized by this remediation packet itself.

## Forbidden Owners

- Adjacent dominoes may not redefine Diagnostic Pattern Catalog authority.
- Current code names may not become target-domain language without this packet
  accepting the term.
- Implementation agents may not add shims, fallbacks, dual paths, silent skips,
  optional target shape, or generated-output hand edits.

## Consumer Impact

Diagnostic command output may gain clearer labels but must stay within D0 compatibility rules.

## Stop Conditions

- Diagnostics imply rule admission.
- Grit failures are collapsed into pass/fail booleans.
- Pattern catalog language hides native vs Grit limitations.

## Verification Gates

- bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/diagnostics.test.ts
- bun run habitat check --json
- bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict
- `bun run openspec:validate`
- `git diff --check`
