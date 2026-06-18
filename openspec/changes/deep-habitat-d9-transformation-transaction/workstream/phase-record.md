# Phase Record: D9 Transformation Transaction

## State

- Status: Accepted for design/specification after fresh final rereview. Not
  implementation-complete and not source-ready.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D9_SOURCE_PACKET`.
- OpenSpec change: `$D9_CHANGE`.

## Objective

Specify D9 as the complete Transformation Transaction design/specification
authority: a closed transaction state model for D8-admitted structural rewrites,
with explicit upstream projections, vendor/tool boundaries, write-set approval,
handoffs, rollback, recovery, public compatibility blockers, and downstream
projections.

## Current Gate

Design/specification accepted. Fresh final D9 review lanes read the repaired
disk state and recorded no unresolved P1/P2 findings.

Source implementation remains blocked where concrete D0 rows, live D8 apply
admission projections, live D10 protected/generated-zone decisions, or live
G-HOST host-gate declarations are required and absent.

## First-Wave Investigation Inputs

| Lane | Scratch | Current disposition |
| --- | --- | --- |
| Domain/ontology | `$D9_DOMAIN_REVIEW` | Imported negative findings; repaired in proposal/design/spec/tasks/control records; accepted by final rereview. |
| TypeScript state-space | `$D9_TYPESCRIPT_REVIEW` | Imported negative findings; repaired with closed state model and TypeScript reduction requirements; accepted by final rereview. |
| Code/vendor topology | `$D9_TOPOLOGY_REVIEW` | Imported negative findings; repaired with write/protected surfaces, vendor boundary, and invalid `--json` gate correction; accepted by final rereview. |
| OpenSpec/information/testing | `$D9_INFORMATION_REVIEW` | Imported negative findings; repaired with expanded requirements/tasks and validation split; accepted by final rereview. |
| Cross-domino/product | `$D9_CROSS_DOMINO_REVIEW` | Imported negative findings; repaired with upstream/downstream projections and source blockers; accepted by final rereview. |

## Final Rereview Evidence

| Lane | Scratch | Result |
| --- | --- | --- |
| Domain/ontology | `$D9_FINAL_DOMAIN_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| TypeScript/validation | `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| OpenSpec/information | `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| Code/vendor topology | `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |
| Cross-domino/product | `$D9_FINAL_CROSS_DOMINO_REVIEW` | Accepted for design/specification; no unresolved P1/P2 findings. |

## Design-Time Validation Gates

| Gate | Expected status | Claim |
| --- | --- | --- |
| D9 wording audit over `$D9_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D9-*.md` | Pass before acceptance | Active D9 guidance avoids reduced-standard wording except canonical traceability. |
| `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict` | Pass before acceptance | OpenSpec shape for D9 is valid. |
| `bun run openspec:validate` | Pass before acceptance | Repository OpenSpec corpus remains valid. |
| `git diff --check` | Pass before acceptance | Diff hygiene is clean. |
| Fresh final D9 rereviews | Passed | D9 is accepted for design/specification only. |

## Later Implementation Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`
  plus D9-owned split tests introduced during implementation.
- `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts`
  when apply pattern invocation or fixtures change.
- `bun tools/habitat-harness/bin/dev.ts fix --dry-run`.
- `bun tools/habitat-harness/bin/dev.ts fix --help` or equivalent Oclif help
  command.
- `git status --short --branch` before and after live-write/rollback fixtures.
- Injected bad-case tests listed in `$D9_CHANGE/tasks.md`.

## Non-Claims

- This phase does not implement TypeScript source changes.
- This phase does not make D9 implementation-complete.
- This phase does not authorize `habitat fix --json`; that requires D0-backed
  public contract design and implementation.
- This phase does not complete D10/G-HOST path or host policy authority.
- This phase does not make D6 diagnostics, D8 admission, Biome, Grit, Git, Nx,
  hooks, generators, or product runtime behavior D9-owned.
