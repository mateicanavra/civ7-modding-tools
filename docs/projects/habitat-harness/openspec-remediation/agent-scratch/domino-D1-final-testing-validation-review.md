# D1 Final Testing/Validation Review

## Verdict

Not accepted for design/specification yet.

D1 is close on the testing/validation lane: the repaired packet now names the right command families, expected statuses, bad cases, cache/freshness stances, non-claims, implementation stop conditions, and D0-before-source-edit boundary. It also covers the main requested risk families on paper: malformed check payloads, verify failure projections, hook local-feedback refusals, apply transaction contradictions, and adapter artifact safety.

Two P2 validation sharpness gaps remain. They are narrow repairs, but they still let implementation decide part of the oracle, so D1 should not be marked accepted until repaired.

## P1 Findings

None.

## P2 Findings

### P2 - The combined focused D1 test gate is not an exact command

References:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, section `6. Validation Gates`, item `6.6`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/phase-record.md`, section `Validation Gates`, row `Combined focused D1 tests`.

The individual focused gates are exact, but the combined gate says only "Run the combined focused D1 test set in one command" / "Combined focused D1 tests". That leaves the implementation agent to decide the exact file list and order.

Repair requirement:

Replace the label with the exact command, for example:

```bash
bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts
```

Keep the existing expected status, oracle, bad case, cache stance, and non-claims.

### P2 - Adapter artifact safety requires retention and bounded-output oracles, but the spec/gate only falsifies unsafe IDs

References:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, sections `Target Semantic Objects` and `Adapter Command Artifact`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md`, requirement `Adapter Command Artifacts Are Compatibility-Bounded`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, items `5.5` and `6.2`.
- Current test evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/proof-artifact.test.ts`.

D1 correctly says adapter artifacts must be path-safe, redacted, retention-bounded, bounded in raw output metadata, and non-claiming. The current named test file covers unsafe path IDs, secret redaction, non-claim merge, and writing under a controlled root. It does not currently assert retention semantics or bounded raw-output metadata. The OpenSpec requirement likewise has scenarios for unsafe ID, redaction, and legacy path, but not retention or bounded stdout/stderr/hash/byte/truncation metadata.

The gate therefore lets implementation decide what "retention-bounded" and "bounded raw output metadata" mean.

Repair requirement:

Add explicit adapter artifact scenarios and gate bad cases:

- Retention is from a closed set or a named replacement closed set.
- Raw stdout/stderr are represented by bounded metadata such as hashes, byte counts, and truncation flags, not unbounded persisted stream text.
- Missing/unknown retention state fails validation or construction.
- A command result with oversized or sensitive raw stream content cannot serialize an unbounded artifact body.

Then update `tasks.md` item `6.2` and the phase-record gate so the bad case is not only unsafe ID; it should also include retention/bounded-output failure.

## P3 Findings

### P3 - Current tests partially cover verify/apply contradiction claims, but D1 should keep the stronger implementation task wording

References:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/verify-proof.test.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/grit-apply.test.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, items `5.2`, `5.4`, `6.3`, and `6.5`.

The current verify test proves skipped Nx state when failed check is passed without an affected result. It does not directly inject the contradictory constructor state "failed check plus affected result". The current apply tests prove important failure states remain failures, but they do not directly construct `ok: true` with a failure tag.

D1's task/gate text already requires these contradictions to be impossible or rejected, so this is not a blocker by itself. Keep that wording during repair; do not weaken it to "current tests pass".

## Coverage Confirmation

- Malformed payloads: covered by D1 spec/tasks for contradictory `CheckReport.ok` and invalid diagnostic severity; current `habitat-entrypoints.test.ts` covers invalid selector JSON/human projections, but a semantic contradictory-payload test still must be added or preserved during implementation.
- Failure projections: covered by verify skipped-Nx scenarios, hook parse/resource failures, apply rollback/ambiguous dry-run failures, and explicit refusal scenarios.
- Hook local feedback: covered by D1 spec/tasks and current `hooks.test.ts` for resource-blocked, partial staging, malformed Grit JSON, local proof notice, pre-push affected failure, and command provenance.
- Apply transaction contradictions: covered by D1 spec/tasks and current `grit-apply.test.ts` for dirty live refusal, dirty dry-run, ambiguous dry-run failure, outside-root/create/delete refusal, missing export, rollback failure, Biome handoff failure, and gate failure.
- Adapter artifact safety: partially covered. Unsafe ID, redaction, non-claim merge, and controlled writes are covered by current tests; retention and bounded raw-output metadata need explicit oracles before acceptance.

## Gates That Still Let Implementation Decide The Oracle

1. `Combined focused D1 tests`: no exact command is specified, so the implementation agent can decide which focused tests are included in the combined gate.
2. `bun run --cwd tools/habitat test -- test/lib/proof-artifact.test.ts`: the oracle says retention-bounded / bounded raw-output metadata, but the bad case and current spec scenarios only falsify unsafe IDs and redaction. Retention and bounded raw-output semantics remain implementation-defined.

## Verification Performed

- `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict`: passed.
- `bun run openspec:validate`: passed across the full OpenSpec tree.
- `git diff --check`: passed.
- `git status --short --branch`: recorded a broad pre-existing remediation dirty state on `codex/deep-habitat-openspec-remediation`, including modified `AGENTS.md` and untracked remediation packet trees.
- `gt log --no-interactive --stack`: reported the current branch is not Graphite-tracked, while showing the nearby D0/D1 Graphite stack context.

## Non-Claims

- This review did not implement D1.
- This review did not run the Habitat focused test suite.
- This review does not accept D0 implementation matrix rows; D1 implementation remains blocked until those concrete rows exist.
- Passing OpenSpec validation proves packet shape only, not TypeScript behavior, CI, runtime behavior, apply safety, Graphite readiness, current-tree cleanliness, or rule correctness.

Skills used: domain-design, information-design, testing-design, solution-design, civ7-systematic-workstream, civ7-open-spec-workstream, typescript-refactoring.
