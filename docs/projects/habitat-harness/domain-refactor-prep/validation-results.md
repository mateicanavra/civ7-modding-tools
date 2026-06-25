# Validation Results

This file records command grounding for goal attachment. Results are current-behavior evidence only; proof classes are not interchangeable.

## Context

- Date: 2026-06-17.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`
- Branch during validation: `codex/habitat-fast-lint-checks`
- HEAD during validation: `ca4db1e86`
- Graphite stack state during validation: current branch `codex/habitat-fast-lint-checks` on top of `codex/habitat-toolkit-domain-refactor-frame`; ancestor `06-13-keep_things` reports `needs restack`.
- Closure claim: local docs-prep commit only. No Graphite submit, PR creation, or clean-stack submit readiness is claimed.

## Results

| Command | CWD | Exit | Proof Class | Result | Disposition | Non-Claims |
| --- | --- | --- | --- | --- | --- | --- |
| `/Users/mateicanavra/.bun/bin/bun install` | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` | 0 | Dependency install/current lock proof | Checked 1699 installs across 1805 packages; no changes. | Pass. | Does not prove build, tests, or runtime. |
| `/Users/mateicanavra/.bun/bin/bun run build` | same | 0 | Root graph build proof | Nx built 21 projects and dependencies; cache used for 30 of 47 tasks. | Pass with cache caveat. | Does not prove tests, lint, current-tree Habitat check, or runtime/game behavior. |
| `/Users/mateicanavra/.bun/bin/bun run lint` | same | 0 | Root hygiene proof | `@habitat/cli:biome:ci` checked 2475 files in 855ms. | Pass. | Does not prove Habitat structural rules beyond Biome hygiene. |
| `/Users/mateicanavra/.bun/bin/bun run --cwd tools/habitat test` | same | 1 | Habitat leaf test proof | 210 passed, 1 failed. Failure: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/test/lib/enforcement-surface.test.ts:351`, expected wrapped-test command exit 0, got 1. | Current proof risk. Blocks Phase 2 packet proof closure until fixed or explicitly dispositioned. | Does not invalidate docs corpus; does not prove root graph test target. |
| `/Users/mateicanavra/.bun/bin/nx run @habitat/cli:test --outputStyle=static` | same | 1 | Nx-owned Habitat test target proof | Failed after about 82s. Failures: `test/generators/project-generator.test.ts` could not find generated project `hr-scratch-discovery-app`; `test/lib/classify.test.ts` hit Nx daemon project graph error `Cannot read properties of null (reading 'error')`. | Current proof risk. Blocks Phase 2 packet proof closure that depends on Nx-owned Habitat test target until fixed or explicitly dispositioned. | Does not invalidate docs corpus; does not prove root build/lint. |
| `/Users/mateicanavra/.bun/bin/bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat/src/plugin.js` | same | 0 | Orientation/routing command behavior | Classified as project `@habitat/cli`, targets `check`, `test`, and root `lint`; several Grit scopes unresolved. | Pass and reinforces D2/D4 scope metadata risk. | Does not execute targets. |
| `/Users/mateicanavra/.bun/bin/bun run habitat classify docs/projects/habitat-harness/domain-refactor-prep/README.md` | same | 0 | Orientation/routing command behavior | Classified as workspace-level path with root `lint` target. | Pass. | Does not prove docs semantic correctness. |
| `/Users/mateicanavra/.bun/bin/bun run habitat check -- --json` | same | 2 | Command-contract evidence | Oclif rejected extra separator: `Unexpected argument: --json`. | Current docs/command ambiguity. Phase 2 must normalize root/direct command invocation examples. | Does not run Habitat check. |
| `/Users/mateicanavra/.bun/bin/bun run habitat check --json` | same | 1 | Current-tree Habitat structural check | Failed `workspace-entrypoints` on `mods/mod-swooper-maps/package.json` script `migrate:configs`; advisory `doc-ambiguity` finding also present. | Current proof risk. Blocks any Phase 2 packet from claiming current-tree structural proof until fixed or explicitly non-claimed. | Does not prove runtime/product behavior or OpenSpec. |
| `/Users/mateicanavra/.bun/bin/nx show project @habitat/cli` | same | 0 | Workspace graph metadata proof | Returned inferred Habitat targets and package-local targets. Shows `habitat:rule:biome-ci` depends on missing project-style split `{"projects":["biome"],"target":"ci"}`. | Pass for graph read; false-green alias risk remains P1 stop condition. | Does not execute any target. |
| `git status --short --branch` | same | 0 | Git working-tree state | Prep docs untracked during validation. | Expected before commit. | Does not prove Graphite stack cleanliness. |
| `gt status` and `gt log --no-interactive` | same | 0 | Graphite stack state | Current branch clean except prep docs before commit; ancestor `06-13-keep_things` needs restack. | Record only. No submit readiness claimed. | Does not prove remote PR state or stack submitability. |

## Phase 2 Proof Stop Conditions

Phase 2 packet authors must stop if they try to claim closure while any of the following remains unresolved for the packet's proof class:

- Habitat leaf/full test target fails without an explicit non-claim or bounded current-risk disposition.
- Nx daemon/project-graph behavior causes intermittent or slow Habitat test failures and the packet claims graph/test robustness.
- `habitat check --json` fails and the packet claims current-tree structural proof.
- An Nx alias reports success while its `dependsOn` contains a missing project or target.
- A command invocation uses `--` forwarding without proving that the public root/direct command surface accepts it.
- Graphite submit/PR readiness is claimed while an ancestor still reports `needs restack`.
