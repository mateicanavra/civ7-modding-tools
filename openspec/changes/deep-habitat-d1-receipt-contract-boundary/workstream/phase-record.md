# Phase Record: D1 Receipt And Command Record Boundary

## State

- Status: accepted for design/specification only after final per-domino review and re-review; implementation not started.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
- Branch: `codex/deep-habitat-openspec-remediation`.
- Source packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D1-proof-contract-boundary.md`.
- OpenSpec change: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/`.

## Objective

Resolve the D1 receipt/command-record boundary before implementation so execution agents do not invent product terminology, public compatibility handling, state models, validation oracles, or downstream ownership while coding.

## Current Gate

D1 is accepted for design/specification only. D1 implementation remains blocked until the D0 matrix contains concrete rows for all affected public and durable surfaces.

## Solution Frame

- Frame name: bounded command records, not proof artifacts.
- Aspiration threshold: every D1 surface names an owner, target family, D0 compatibility handling from the closed D0 action set, invalid state, non-claim, test oracle, and downstream consumer.
- Constraint reality: inherited proof-shaped terms are public in command JSON, package exports, tests, hooks, docs, and artifact paths.
- Refactor pattern: collapse optional/boolean/prose state into discriminated family-specific records and, where D0 chooses `preserve`, `version`, or `facade`, legacy-name wrapper implementations.

## Approved Write Set

The approved implementation write set is exactly the list in `proposal.md`. Any implementation diff outside that list blocks closure unless this packet is amended and re-reviewed.

## Protected Paths

Protected paths are exactly the list in `proposal.md`. D1 may cite D0 but may not repair D0. D1 may update downstream ledgers/index rows only for D1 acceptance status and contract dependencies.

## D0 Prerequisite State

- D0 design/specification status: accepted.
- D0 matrix implementation status: required before D1 source edits.
- D1 placeholder for missing concrete rows: `blocked-pending-d0-row`.
- Stop condition: no public surface handling action may occur without its D0 row, and that handling must be one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.

## Contract-Family Sequence

1. D0 row citation and D1 surface inventory.
2. Check report validation.
3. Verify receipt compatibility boundary.
4. Hook local-feedback boundary.
5. Adapter command artifact compatibility boundary.
6. Apply transaction boundary handoff to D9.
7. Docs/example terminology classification.
8. Downstream ledger/index updates.

## Validation Gates

| Gate | Expected status | Oracle | Bad case | Cache/freshness stance | Non-claims |
| --- | --- | --- | --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | 0 | Entrypoint forwarding and invalid selector JSON/human behavior remain correct. | Unknown selector produces `rule-selection-integrity`, `ok: false`, exit 1. | Vitest local execution. | Not rule correctness or current-tree cleanliness. |
| `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts` | 0 | Adapter command artifact compatibility is path-safe, redacted, retention-bounded, bounded in raw-output metadata, and non-claiming. | Unsafe artifact id throws; unknown retention is rejected; oversized or sensitive raw stream content cannot serialize an unbounded artifact body. | Temp paths/fake command records. | Not command semantic correctness. |
| `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts` | 0 | Verify receipt/compat wrapper bounds streams, records task-local cache state, and skips Nx after failed check. | Failed check cannot report executed Nx. | Fixture-derived cache text only. | Not CI, Graphite readiness, or apply safety. |
| `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` | 0 | Hooks remain local feedback with explicit refusal/failure states. | Dirty resources/partial staging/malformed Grit JSON stop later commands. | Fake runtime; no live hook execution. | Not CI or review readiness. |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts` | 0 | Apply states distinguish dry-run, live apply, rollback, formatter handoff, gate failure, and refusal. | Success with failure tag is impossible/rejected. | Fake Grit/temp copy. | Not all-pattern safety. |
| `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts` | 0 | Cross-family compatibility remains coherent. | Any bad case above fails. | Vitest local execution. | Not OpenSpec or CI. |
| `bun run habitat check --json` | 0 for implementation closure, or recorded nonzero current-tree diagnostic state | Valid schemaVersion 1 check report; `ok` matches rules. | Contradictory report rejected by unit test. | Fresh command. | Not rule correctness or runtime behavior. |
| `bun run habitat verify --json` | 0 for closure if check/Nx pass, or valid nonzero skipped-Nx receipt if check fails | D0-approved verify wrapper/receipt with non-claims. | Check failed cannot execute Nx affected. | Fresh command; task-local cache only. | Not CI or PR readiness. |
| `bun run habitat fix --dry-run` | 0 no-op/approved dry-run or explicit refusal | Dry-run and live apply not conflated. | Ambiguous dry-run fails closed. | Fresh command. | Not live apply safety. |
| `bun run habitat hook --help` | 0 | Help surface available without hook execution. | Unsupported hook covered by tests. | Fresh command. | Not hook pass. |
| `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` | 0 | D1 OpenSpec shape and scenarios are valid. | Missing required scenario blocks acceptance via checklist/review. | Fresh command. | Not TypeScript implementation. |
| `bun run openspec:validate` | 0 | Full OpenSpec tree remains valid. | Malformed spec delta fails. | Fresh command. | Not Habitat behavior. |
| `git diff --check` | 0 | Patch hygiene. | Whitespace errors fail. | Fresh git command. | Not semantic correctness. |
| `git status --short --branch` | Recorded | Dirty files are classified and inside write set. | Generated/unapproved files block closure. | Fresh git command. | Clean status is not validation. |

## Validation Results Recording Contract

Implementation must record actual validation results in this phase record as gates run. Each result row uses this shape:

| gate | command | expected_status | actual_status | evidence_path_or_summary | cache_freshness_observed | non_claims_confirmed | blocker_disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1-V1 | `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | 0 | pending | pending | Vitest local execution | pending | pending |
| D1-V2 | `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts` | 0 | pending | pending | Vitest temp paths/fake command records | pending | pending |
| D1-V3 | `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts` | 0 | pending | pending | fixture-derived cache text only | pending | pending |
| D1-V4 | `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` | 0 | pending | pending | fake runtime; no live hook execution | pending | pending |
| D1-V5 | `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts` | 0 | pending | pending | fake Grit/temp copy | pending | pending |
| D1-V6 | `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts` | 0 | pending | pending | Vitest local execution | pending | pending |
| D1-V7 | `bun run habitat check --json` | 0 or recorded current-tree diagnostic nonzero | pending | pending | fresh command | pending | pending |
| D1-V8 | `bun run habitat verify --json` | 0 or valid nonzero skipped-Nx receipt if check fails | pending | pending | fresh command; task-local cache only | pending | pending |
| D1-V9 | `bun run habitat fix --dry-run` | 0 no-op/approved dry-run or explicit refusal | pending | pending | fresh command | pending | pending |
| D1-V10 | `bun run habitat hook --help` | 0 | pending | pending | fresh command | pending | pending |
| D1-V11 | `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` | 0 | pending | pending | fresh command | pending | pending |
| D1-V12 | `bun run openspec:validate` | 0 | pending | pending | fresh command | pending | pending |
| D1-V13 | `git diff --check` | 0 | pending | pending | fresh git command | pending | pending |
| D1-V14 | `git status --short --branch` | recorded | pending | pending | fresh git command | pending | pending |

## Review Lanes

- Domain/ontology reviewer: target terms, inherited language, owner boundaries, relationship/state ontology.
- OpenSpec reviewer: proposal/design/tasks/spec consistency and executable clarity.
- Code/topology reviewer: current surfaces, write set, protected paths, D0 dependency.
- Testing/validation reviewer: falsifying gates, bad cases, cache stance, non-claims.
- Information-design reviewer: artifact readability and zero-guess execution.
- Cross-domino reviewer: D6-D14 dependencies and D15 trigger status.

## Non-Claims

- This packet does not implement D1.
- D1 design acceptance does not imply D0 matrix implementation.
- D1 design acceptance does not prove CI, runtime behavior, Graphite readiness, OpenSpec closure, apply safety, current-tree cleanliness, or rule correctness.
- Legacy names remain compatibility facts until D0 rows and D1 implementation tasks change them.
