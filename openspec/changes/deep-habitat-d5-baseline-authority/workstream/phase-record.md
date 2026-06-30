# Phase Record: D5 Baseline Authority

## State

- Status: D5 source implementation is submitted as draft PR #1840 on the D5
  Graphite layer and waiting for packet-boundary review.
- Implementation: authorized after concrete D0 row citation and live D2
  baseline/selector projection confirmation.
- Active checkout: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d5-baseline-authority`.
- Source packet: `$D5_SOURCE_PACKET`.
- OpenSpec change: `$D5_CHANGE`.
- Negative-control inputs: `$D5_NEGATIVE_REVIEW`, `$D5_DOMAIN_REVIEW`,
  `$D5_TOPOLOGY_REVIEW`, `$D5_TYPESCRIPT_REVIEW`,
  `$D5_OPENSPEC_TESTING_REVIEW`, `$D5_INFORMATION_REVIEW`, and
  `$D5_CROSS_DOMINO_REVIEW`.

## Objective

Implement the D5 Baseline Authority contract: accepted/refused baseline
authority states, shrink-only integrity, rule-introduction manifest
acceptance/refusal, external exception projection, D7/D8 consumer results,
public-surface compatibility updates, and validation gates.

## Current Acceptance State

Design/specification rereview gate is closed for D5. Source implementation has
replaced the broad baseline module with TypeBox-first baseline authority modules,
versioned package exports to D5 names/schema artifacts, and wired check command
consumers through D5 results. Fresh source implementation rereviews found P1/P2
blockers; accepted blockers were repaired before validation closure.

- `019edf41-25c5-7cd1-93b6-35351da9e592`: domain and TypeScript state-space
  source review.
- `019edf41-4570-74f1-8bee-e07daf79fb05`: product contract and public-surface
  source review.
- `019edf41-659f-7bc3-b1f7-72e977475123`: cross-record and schema adversarial
  source review.

The earlier D5 investigation files remain negative-control input and repair
guidance; they are not final acceptance evidence for the source implementation.
D5 source implementation was unblocked for D5-owned source surfaces because
concrete D0 rows are cited in `design.md`, including
`D0-durable-data-baselines-json-array`, and live D2 `ruleBaselineFacts` /
`activeRuleBaselineFacts` plus `ruleSelectorFacts` / `activeRuleSelectorFacts`
exist in source.

## Dependency State

| Dependency | Design use now | Source implementation state |
| --- | --- | --- |
| D0 command surface inventory | Accepted D0 design/specification guides D5 public-surface tables. | Concrete D0 rows are cited for every currently touched D5 surface in `design.md`. |
| D2 rule registry metadata contract | Accepted D2 design/specification guides the `ruleBaselineFacts` and `ruleSelectorFacts` consumer boundaries. | Live `RuleBaselineFactsSchema`, `ruleBaselineFacts`, `activeRuleBaselineFacts`, `RuleSelectorFactsSchema`, `ruleSelectorFacts`, and `activeRuleSelectorFacts` exist and are the D5 rule metadata sources. |
| D7 structural enforcement pipeline | D5 may define `BaselineApplicationResult` and `BaselineIntegrityResult` for D7. | D7 implementation remains blocked until D7's own packet closes; D5 does not implement D7 report construction. |
| D8 Pattern Governance | D5 may define the D5-published baseline authority projection/refusal result for D8. | D8 implementation remains blocked until D8's own packet closes; D5 does not implement lifecycle/admission. |

## Design-Time Gates

| Gate | Expected result | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict` | Exit 0. | Does not prove source behavior or D5 final review acceptance. |
| `bun run openspec:validate` | Exit 0 for the full OpenSpec corpus. | Does not prove implementation readiness. |
| `git diff --check` | Exit 0. | Checks diff hygiene only. |
| D5 wording audit over `$D5_CHANGE/**` and final D5 scratch | No active reduced-standard or ownership-leaking guidance. | Historical negative scratch may preserve findings when clearly not current guidance. |
| Fresh D5 final rereview | No unresolved P1/P2 findings across required review lanes. | Acceptance is design/specification only, not source implementation completion. |

## Current Validation Evidence

Recorded on 2026-06-19 after D5 source implementation and public-surface repair.

| Gate | Command / record | Result | Non-claim |
| --- | --- | --- | --- |
| TypeScript check | `bun run --cwd tools/habitat-harness check` | Exit 0 after accepted source-review repairs. | Package typecheck does not prove command behavior alone. |
| Baseline unit tests | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` | Exit 0, 14 tests passed. | Focused unit tests do not prove unrelated rules. |
| Baseline plus classify unit tests | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/classify.test.ts` | Exit 0, 27 tests passed. | Classify tests cover the no-`ScopedRule` routing shape, not D5 authority by themselves. |
| Command entrypoint and command adapter tests | `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts test/commands/habitat-commands.test.ts` | Exit 0, 18 tests passed. | Does not implement D7 report construction. |
| D8/D13 consumer gate | `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | Partial: Pattern Authority Manifest passed 14 tests; pattern-generator suite failed before tests because D13 generator CJS imports TS registry loader and resolves `schema.js` from source. | D5 does not repair D13 generator architecture; D13 must own the CJS-to-TS generator boundary. |
| Check command baseline-integrity carrier | `bun run habitat check --json --base agent-DRA-d4-orientation-routing` plus parser assertion | Exit 1 overall from non-D5 rule failures; `baseline-integrity` rule report was present with status `pass`, zero diagnostics, and `locked: true`. | Broad check failure does not make baseline-integrity fail; the explicit D4 base keeps D5 comparison on the accepted D2 registry schema while the stack is unmerged. D5 does not use D0-refused `--rule baseline-integrity`. |
| D5 strict OpenSpec validation | `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict` | Exit 0. | OpenSpec validity does not prove runtime behavior. |
| Full OpenSpec validation | `bun run openspec:validate` | Exit 0, 249/249 passed. | Corpus validity does not make D5 implementation-complete. |
| Diff hygiene | `git diff --check` | Exit 0. | Diff hygiene does not prove behavior. |
| Current status | `git status --short --branch` | Dirty D5 implementation layer; intended source and record files only, pending review/commit. | Status cleanliness is required before Graphite closure. |

## Implementation Gate Dispositions

| Gate | Disposition | Non-claim |
| --- | --- | --- |
| Concrete D0 row citations | Satisfied for touched D5 surfaces; D0 matrix now includes D5 durable-data and root package export rows for D5 names/schema artifacts. | Future newly touched surfaces still require rows before edit. |
| Live D2 baseline and selector projection availability | Satisfied: D5 consumes `ruleBaselineFacts` / `activeRuleBaselineFacts` and `ruleSelectorFacts` / `activeRuleSelectorFacts`. | Whole registry rows and file presence are not target authority. |
| D5 fixture/injection matrix | Satisfied by `test/lib/baseline.test.ts` for explicit empty/debt, missing/malformed/non-array/non-string/duplicate/unsorted/orphan, external unreadable/malformed/mismatch, parser-owned bypass, comparison/base failures, growth refusal, and manifest missing/mismatch. | Fixture checks do not prove unrelated Habitat rules. |
| D8/D13 consumer compatibility | Partially satisfied: Pattern Authority Manifest passes; pattern generator is blocked by a D13-owned CJS/TS loader boundary before D5 projections execute. | D5 does not implement D13 generator restructuring. |
| Graphite closure | Source rereview, TODO/control triage, validation, commit, submit as draft PR #1840, and clean status are complete. | No next domino starts before D5 packet-boundary review/approval. |

## Non-Claims

- This packet is not implementation-complete until D5 source, validation,
  review, Graphite submit, and packet-boundary closure are complete.
- D5 does not approve D7 enforcement pipeline implementation or D8 Pattern
  Governance lifecycle/admission.
- Historical code names are not target D5 language unless the current D5 design
  explicitly exports them.
