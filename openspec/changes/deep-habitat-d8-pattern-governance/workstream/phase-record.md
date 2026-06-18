# Phase Record: D8 Pattern Governance

## State

- Status: accepted for design/specification only after final rereview; not
  implementation-complete.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D8_SOURCE_PACKET`.
- OpenSpec change: `$D8_CHANGE`.
- Implementation status: not started; source implementation remains blocked
  behind the dependency state below.

## Objective

Specify complete Pattern Governance lifecycle and admission before source
implementation. D8 must prevent candidate, diagnostic, local-feedback, apply,
refused, and retired pattern states from being inferred from file presence,
registry fields, baseline files, Grit metadata, generator options, or adjacent
domain behavior.

## Current Gate

Design/specification gate closed after final D8 domain/ontology,
TypeScript/validation, OpenSpec/information, code/vendor topology, and
cross-domino rereviews found no unresolved P1/P2 findings. Source
implementation remains a later phase.

## Investigation Inputs

| Input | Status | Use |
| --- | --- | --- |
| `$D8_DOMAIN_REVIEW` | imported negative-control findings | Domain language, ontology, naming, owner boundaries. |
| `$D8_TYPESCRIPT_REVIEW` | imported negative-control findings | Type-state collapse, write/protected set, validation. |
| `$D8_TOPOLOGY_REVIEW` | imported negative-control findings | Code topology, vendor ownership, public surfaces. |
| `$D8_INFORMATION_REVIEW` | imported negative-control findings | OpenSpec shape, requirements, closure gates. |
| `$D8_CROSS_DOMINO_REVIEW` | imported negative-control findings | Upstream dependencies and downstream handoffs. |

These files are not final acceptance evidence. They are the findings input for
this repaired packet.

## Dependency State

| Dependency | D8 use | Source blocker |
| --- | --- | --- |
| D0 | Public/durable compatibility rows. | Source edits stop wherever concrete D0 rows are missing. |
| D1 | User-facing refusal/output families. | Source edits stop wherever D8 changes command output without D1 citation. |
| D2 | `ruleGovernanceFacts`, `ruleGritFacts`, `ruleBaselineFacts`. | Source edits stop where live projections are absent and whole-row reads would be needed. |
| D5 | `BaselineAuthorityProjection` or baseline refusal. | Source edits stop where D8 would decide baseline truth locally. |
| D6 | Diagnostic capability and diagnostic projections. | Source edits stop where D8 would parse raw Grit or infer diagnostic identity locally. |
| D7 | Check/current-tree outcomes consumed as admission inputs. | Source edits stop where D7 projections are absent and current-tree outcome is needed. |
| D10/G-HOST | Protected/generated-zone and host-policy decisions. | Source edits stop where touched paths/gates require those authorities. |
| D9 | Apply transaction inputs and non-claims. | D8 may publish apply admission only; D9 owns transaction execution. |
| D13 | Candidate generation and generator refusal surfaces. | D13 creates candidates; D8 owns registration/admission. |

## Design-Time Validation

| Gate | Command or check | Expected result | Non-claim |
| --- | --- | --- | --- |
| D8 strict OpenSpec | `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | passed | Does not prove source behavior. |
| Full OpenSpec | `bun run openspec:validate` | passed, 249 items | Does not prove Habitat runtime behavior. |
| Diff hygiene | `git diff --check` | passed | Whitespace/path hygiene only. |
| Wording audit | `rg -n -i "<audit terms>" $D8_CHANGE $PACKET_INDEX $AGENT_SCRATCH/domino-D8-*.md` | returned only the D13 source packet title and slug in `$PACKET_INDEX`, classified as exact traceability text rather than D8 guidance | Historical findings may remain only as non-guidance. |
| Final rereview | `$D8_FINAL_DOMAIN_REVIEW`, `$D8_FINAL_TYPESCRIPT_VALIDATION_REVIEW`, `$D8_FINAL_OPENSPEC_INFORMATION_REVIEW`, `$D8_FINAL_CODE_TOPOLOGY_REVIEW`, `$D8_FINAL_CROSS_DOMINO_REVIEW` | all accepted for design/specification only; no unresolved P1/P2 | Design/specification acceptance only. |

## Later Implementation Validation

| Gate | Required scenario |
| --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts` | Candidate, manifest, registration, hook, baseline, collision, and no-write behaviors. |
| Focused D8 state/projection tests | Candidate, invalid, diagnostic, local-feedback, apply, refused, and retired states cannot be confused. |
| `bun run habitat check --rule baseline-integrity --json` | D5 baseline relation where D8 touches registered admission. |
| Native Grit sample tests for touched patterns | Vendor pattern syntax/behavior only. |
| `bun run habitat classify tools/habitat-harness/src/rules/rules.json` | Routing observation only. |
| `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts` | Routing observation only. |
| `git status --short --branch` and `gt status` | Stack/worktree hygiene. |

## Write Set

The later source write set is the one listed in `$D8_CHANGE/design.md`. All
other source, generated, baseline, apply, hook, command-engine, graph, product,
vendor, cache, lockfile, and generated-output paths are protected unless the
owning packet explicitly authorizes them.

## Non-Claims

- This packet does not implement Habitat source changes.
- D8 design acceptance does not make existing Grit rules complete Pattern
  Authority admissions.
- Manifest validation does not prove diagnostic capability, baseline authority,
  hook eligibility, apply admission, or current-tree behavior.
- Diagnostic admission does not prove apply admission.
- Apply admission does not execute or approve writes.
