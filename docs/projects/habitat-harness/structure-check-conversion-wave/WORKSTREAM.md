# Structure-Check Conversion Wave

Status: active wave on `codex/habitat-structure-check-conversion-wave`.

## Objective

Move pure file-tree topology assertions out of mixed command-check scripts and
into native `structure-check`, while routing source predicates to Grit and
leaving graph/currentness/package-runtime assertions out of structure-check.

This wave is assertion-driven. A command script is deleted or shrunk only when
every branch inside it has a recorded owner.

## Source Order

1. Current user direction for the structure-check conversion wave.
2. `.habitat/FRAME.md`.
3. `.habitat/AUTHORITY-TOOL-SEPARATION.md`.
4. `docs/projects/habitat-harness/structure-check/structure-check-runner-spec-shape.md`.
5. `openspec/changes/habitat-structure-check-runner/workstream/closure.md`.
6. `docs/projects/habitat-harness/command-check-split-canary/vertical-slice-reference.md`.
7. `docs/projects/habitat-harness/command-check-split-systematic-wave/`.
8. Direct rule packets and current package source.
9. Focused Habitat proof output.

## Team Shape

| Role | Owner | Output |
| --- | --- | --- |
| Orchestrator | Current thread | Integration, final owner decisions, proofs, docs, commit |
| Corpus/router agent | Peer agent | Current corpus gaps and stale prior rows |
| Domain lane agent | Peer agent | Domain topology/source/residual split recommendations |
| Pipeline/studio/toolkit lane agent | Peer agent | Structure/check command surfaces and TOML candidates |
| Docs/platform/resources lane agent | Peer agent | Docs/platform/resources routing recommendations |
| Structure/Grit reviewer | Orchestrator | Reject proof-class leaks into structure-check or Grit |
| Proof auditor | Orchestrator | JSONL, focused checks, aggregate labels, stale references |

## Owner Dispositions

| Disposition | Meaning |
| --- | --- |
| `structure-check` | Pure current-tree file/directory topology expressible in TOML v1. |
| `grit-check` | Forbidden source/Markdown/import/call/token shape expressible as Grit diagnostics. |
| `existing-rule` | Already owned by a narrower accepted rule. |
| `nx-data` | Package JSON, Nx target graph/order, workspace graph, or build-order metadata. |
| `package-local-validator` | Runtime/API/generated equivalence/evaluated config/required source-currentness proof. |
| `delete-demote` | Transitional wrapper, duplicate, stale, or not worth enforcing. |

## Stop Conditions

- Do not add structure-check semantics during conversion.
- Do not route source tokens, import/export rules, package JSON script shape,
  Nx dependencies, evaluated config, graph traversal, generated currentness, or
  runtime behavior into `structure-check`.
- Do not create a broad Grit regex when a branch is actually required presence,
  graph closure, or currentness.
- Do not shrink a command script unless each removed branch has a proof owner.
