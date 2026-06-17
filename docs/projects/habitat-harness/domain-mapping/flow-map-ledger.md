# Habitat Domain Mapping Flow Map Ledger

Use this ledger to trace each scenario end to end. A flow map is not complete
until it names the actor, command/interface, decision points, authority owner,
proof classes, failure path, and current implementation evidence.

## Row Contract

| Field | Required content |
| --- | --- |
| Flow ID | Stable key matching a scenario row. |
| Scenario | Link or key from `scenario-corpus.md`. |
| Entry point | Command, generator, hook, future authoring surface, or doc workflow. |
| Input normalization | How input becomes a structured request. |
| Selection / routing | How Habitat chooses owners, rules, targets, patterns, or topology. |
| Execution path | Current code/test/docs path that performs or describes the work. |
| Output contract | Report, diagnostics, proof, generated files, refusal, or handoff. |
| Authority decisions | Which owner decides each invariant. |
| Proof classes | Docs intent, current behavior, tests, command proof, generated diff, non-claims. |
| Failure path | Expected error/refusal/failing proof path. |
| Open questions | Evidence or authority gaps. |
| Domain implications | Candidate language or context implications. |

## Required Flow Rows

| Flow ID | Scenario | Entry point | Input normalization | Selection / routing | Execution path | Output contract | Authority decisions | Proof classes | Failure path | Open questions | Domain implications |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | S01-classify-path | `habitat classify` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F02 | S02-classify-diff | `habitat classify` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F03 | S03-check-rules | `habitat check` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F04 | S04-verify-proof | `habitat verify` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F05 | S05-fix-approved-apply | `habitat fix` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F06 | S06-run-hooks | `habitat hook` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F07 | S07-generate-project | `@internal/habitat-harness:project` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F08 | S08-draft-pattern | `@internal/habitat-harness:pattern` | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F09 | S09-promote-pattern | Pattern Authority promotion | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F10 | S10-generate-mapgen-authoring | future authoring generator | TODO | TODO | TODO | TODO | TODO | TODO | unsupported today | TODO | TODO |
| F11 | S11-describe-human-pattern | future pattern authoring workflow | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |
| F12 | S12-maintain-repo-with-habitat | combined workflow | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |

## Completion Gate

A flow row is not ready for synthesis until it has at least one current evidence
link for implemented behavior or an explicit hypothesis label for desired
authoring behavior.
