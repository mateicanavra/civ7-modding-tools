# D1 Rereview: Validation And OpenSpec Acceptance

## Verdict

Accepted for design/specification.

The repaired D1 packet clears the validation/OpenSpec blockers from the prior final testing review and preserves the earlier OpenSpec acceptance boundary: this is design/specification acceptance only, not implementation acceptance. D1 implementation remains blocked until concrete D0 matrix rows exist for every affected public or durable surface.

## Findings

### P1

None.

### P2

None.

### P3

None.

## Repaired Blocker Checks

| Blocker | Cleared? | Evidence |
| --- | --- | --- |
| Exact combined focused D1 test command | Yes | `openspec/changes/deep-habitat-d1-receipt-contract-boundary/tasks.md`, item 6.6, now names `bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts test/lib/hooks.test.ts test/lib/grit-apply.test.ts`; `workstream/phase-record.md`, Validation Gates row for the same command, matches it. |
| Adapter retention and bounded raw-output metadata oracles | Yes | `specs/habitat-harness/spec.md`, Adapter Command Artifacts scenarios now reject unknown adapter retention and require bounded metadata such as hashes, byte counts, and truncation flags instead of unbounded raw stream text. `tasks.md` items 5.5 and 6.2 and `workstream/phase-record.md` validation gate D1-V2 carry those bad cases into implementation validation. |
| Validation result recording contract | Yes | `workstream/phase-record.md`, `Validation Results Recording Contract`, defines the stable result table with `gate`, `command`, `expected_status`, `actual_status`, `evidence_path_or_summary`, `cache_freshness_observed`, `non_claims_confirmed`, and `blocker_disposition`. `tasks.md` item 6.15 requires recording results there. |
| Strict OpenSpec shape | Yes | `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` passed; `bun run openspec:validate` passed across the full tree. |
| No implementation-time oracle decisions | Yes | The remaining implementation gates specify command, expected status, oracle, bad case, cache/freshness stance, and non-claims in `tasks.md` and `workstream/phase-record.md`. The packet still blocks source edits until D0 rows replace `blocked-pending-d0-row`, so implementation cannot decide public compatibility or validation oracles locally. |

## Control Update Recheck

After the original rereview started, two narrow cleanup edits were made on disk. I re-opened the current packet before finalizing the verdict.

| Cleanup point | Acceptable? | Evidence |
| --- | --- | --- |
| Adapter retention/raw-output scenarios moved under `Requirement: Adapter Command Artifacts Are Compatibility-Bounded` | Yes | `openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md` now keeps `Adapter artifact retention is invalid` and `Adapter artifact raw output is unbounded` under the adapter artifact requirement, lines 124-147 on the rereviewed disk. This is the correct requirement owner and improves the OpenSpec shape versus placing adapter artifact oracles under typed relationships. |
| Protected-path language permits only narrow D10 dependency metadata edits | Yes | `proposal.md` Protected Paths permits only D10 `Requires`, dependency-gate task, and refusal-vocabulary dependency line edits, and explicitly says D1 does not authorize D10 behavior, design, spec, or validation repair. `design.md` repeats the same cross-packet exception boundary. `workstream/downstream-realignment-ledger.md` allows only D10 `proposal.md` dependency/refusal metadata and `tasks.md` dependency/vocabulary text, then forbids D10 behavior, design, spec, validation, write-set, protected-path, or review-ledger repair. Current D10 disk content reflects D1 metadata/dependency consumption without making D10 accepted. |

These cleanup points do not broaden D1 scope and do not change the verdict: D1 remains accepted for design/specification only, not implementation.

## Rationale

The repaired packet now has the missing execution inventory schema, explicit validation-result recording location, exact combined test command, adapter retention/raw-output bad cases, and strict OpenSpec validation. The validation design is falsifying rather than command-name-only: each required gate identifies the invalid state it must reject or make unrepresentable.

The packet also preserves authority boundaries. D1 owns shared command-record semantics, non-claims, typed relationships, and compatibility constraints. It does not absorb D6/D7 diagnostic taxonomy, D9 apply behavior, D11 hook behavior, D12 verify workflow composition, Graphite readiness, OpenSpec acceptance, or D15 shared provenance unless a later accepted packet triggers D15.

## Commands Run

From `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

| Command | Result |
| --- | --- |
| `git status --short --branch` | Exit 0. Recorded pre-existing dirty remediation state on `codex/deep-habitat-openspec-remediation`, including modified `AGENTS.md` and untracked remediation packet trees. |
| `gt status` | Exit 0. Passed through to `git status`; same dirty state recorded. |
| `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` | Exit 0. Output: `Change 'deep-habitat-d1-receipt-contract-boundary' is valid`. |
| `bun run openspec:validate` | Exit 0. Output: `Totals: 249 passed, 0 failed (249 items)`. |
| `git diff --check` | Exit 0. No whitespace errors reported. |
| Control-update rerun: `bun run openspec -- validate deep-habitat-d1-receipt-contract-boundary --strict` | Exit 0. Output: `Change 'deep-habitat-d1-receipt-contract-boundary' is valid`. |
| Control-update rerun: `git diff --check` | Exit 0. No whitespace errors reported. |

## Non-Claims

- This rereview did not implement D1.
- This rereview did not run the focused Habitat implementation test suite.
- This rereview does not accept D0 matrix implementation rows.
- Passing OpenSpec validation proves artifact shape only, not TypeScript implementation, Habitat behavior, CI, runtime behavior, Graphite readiness, apply safety, current-tree cleanliness, product completion, or rule correctness.

Skills used: domain-design, information-design, testing-design, solution-design, civ7-open-spec-workstream, civ7-systematic-workstream, typescript.
