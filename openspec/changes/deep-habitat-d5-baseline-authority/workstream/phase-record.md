# Phase Record: D5 Baseline Authority

## State

- Status: OpenSpec packet drafted for remediation review; implementation not
  started.
- Worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation.
- Branch: codex/deep-habitat-openspec-remediation.
- Source packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md.
- OpenSpec change: openspec/changes/deep-habitat-d5-baseline-authority/.

## Objective

Convert D5 into a review-gated OpenSpec packet scaffold for Baseline Authority
without reopening implementation or carrying forward lazy domain language.

## Current Gate

Design/preparation gate. The packet can authorize later implementation only
after review ledgers contain no accepted unresolved P1/P2 findings.

## Exact Validation Gates

- bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts
- bun run habitat check --json
- bun run openspec -- validate deep-habitat-d5-baseline-authority --strict
- bun run openspec:validate
- git diff --check

## Non-Claims

- This remediation packet does not implement Habitat source changes.
- This packet does not prove runtime behavior.
- This packet does not approve Graphite submission for later implementation.
- Legacy code names remain compatibility facts unless design.md accepts them as
  target language.
