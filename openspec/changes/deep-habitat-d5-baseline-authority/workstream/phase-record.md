# Phase Record: D5 Baseline Authority

## State

- Status: accepted for design/specification only after fresh final rereview.
- Implementation: not started and not authorized.
- Active checkout: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D5_SOURCE_PACKET`.
- OpenSpec change: `$D5_CHANGE`.
- Negative-control inputs: `$D5_NEGATIVE_REVIEW`, `$D5_DOMAIN_REVIEW`,
  `$D5_TOPOLOGY_REVIEW`, `$D5_TYPESCRIPT_REVIEW`,
  `$D5_OPENSPEC_TESTING_REVIEW`, `$D5_INFORMATION_REVIEW`, and
  `$D5_CROSS_DOMINO_REVIEW`.

## Objective

Specify the complete D5 Baseline Authority contract before source
implementation: accepted/refused baseline authority states, shrink-only
integrity, rule-introduction manifest acceptance/refusal, external exception
projection, D7/D8 consumer results, public-surface compatibility blockers, and
implementation gates.

## Current Acceptance State

Design/specification rereview gate is closed for D5. Fresh final rereview lanes
read the current disk state and recorded no unresolved P1/P2 findings:

- `$AGENT_SCRATCH/domino-D5-final-domain-ontology-rereview.md`
- `$AGENT_SCRATCH/domino-D5-final-openspec-testing-rereview.md`
- `$AGENT_SCRATCH/domino-D5-final-topology-typescript-crossdomino-rereview.md`

The earlier D5 investigation files remain negative-control input and repair
guidance; they are not final acceptance evidence for the rewritten packet. D5
source implementation remains blocked behind concrete D0 rows and live D2
baseline facts/projections where source changes consume them.

## Dependency State

| Dependency | Design use now | Source implementation state |
| --- | --- | --- |
| D0 command surface inventory | Accepted D0 design/specification may guide D5 public-surface tables. | Blocked until concrete D0 rows exist and are cited for every touched D5 surface. |
| D2 rule registry metadata contract | Accepted D2 design/specification may guide the `ruleBaselineFacts` consumer boundary. | Blocked wherever live D2 `ruleBaselineFacts` or equivalent baseline projections are required. |
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

Recorded on 2026-06-18 after final D5 terminology and status-surface repair.

| Gate | Command / record | Result | Non-claim |
| --- | --- | --- | --- |
| D5 wording audit | Complete-standard phrasing audit over `$D5_CHANGE/**` and `$AGENT_SCRATCH/domino-D5-*.md`. | Exit 1, no matches. | Audit cleanliness does not authorize source implementation. |
| D5 strict OpenSpec validation | `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict` | Exit 0. | OpenSpec validity does not prove runtime behavior. |
| Full OpenSpec validation | `bun run openspec:validate` | Exit 0, 249/249 passed. | Corpus validity does not make D5 implementation-complete. |
| Diff hygiene | `git diff --check` | Exit 0. | Diff hygiene does not prove behavior. |
| Final rereview | Domain/ontology, OpenSpec/testing, and topology/TypeScript/cross-domino final rereview scratch records | No unresolved P1/P2 findings; D5 accepted for design/specification only. | D7, D8, D13, and D5 source implementation remain unaccepted. |

## Later Implementation Gates

| Gate | Expected result | Non-claim |
| --- | --- | --- |
| Concrete D0 row citations | Every touched D5 public/durable surface cites a D0 row and allowed compatibility handling. | D0 design acceptance alone does not authorize source edits. |
| Live D2 baseline projection availability | D5 consumes live `ruleBaselineFacts` or an explicitly D0/D2-compatible migration input. | Whole registry rows and file presence are not target authority. |
| `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` | Covers all D5 state/refusal and invalid-state cases. | Does not prove command output alone. |
| `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | Covers baseline command JSON/status and failure surfaces touched by D5. | Does not own broad D7 report construction. |
| `bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts` | Covers `--expand-baseline` adapter behavior. | Does not prove baseline integrity command output. |
| `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | Covers D5 projection/refusal compatibility where D8/D13 surfaces consume it. | Does not implement Pattern Governance lifecycle/admission. |
| `bun run habitat check --rule baseline-integrity --json` | Current tree reports the focused baseline-integrity command outcome. | Broad `bun run habitat check --json` is not a substitute for D5. |
| D5 fixture/injection matrix | Covers every state/refusal named in the D5 spec. | Fixture checks do not prove unrelated Habitat rules. |
| `git status --short --branch` | Only intended D5 implementation files are dirty before commit. | Does not prove behavior. |

## Non-Claims

- This remediation packet does not implement Habitat source changes.
- D5 accepted design/specification status, if later granted, is not
  implementation-complete status.
- D5 does not approve D7 enforcement pipeline implementation or D8 Pattern
  Governance lifecycle/admission.
- Legacy code names remain compatibility facts unless the current D5 design
  explicitly accepts them as target language.
