# Habitat Domain Mapping Scenario Corpus

This ledger is the canonical scenario corpus for the Habitat domain mapping
investigation. Fill one row per supported, unsupported, or desired Habitat
scenario. Groups can organize rows, but they must not hide per-scenario
obligations.

## Row Contract

| Field | Required content |
| --- | --- |
| Scenario ID | Stable short key, e.g. `S01-classify-path`. |
| Status | supported / unsupported / desired / unresolved. |
| Actor | Human maintainer, coding agent, DRA owner, hook, CI, or generator caller. |
| Trigger | What starts the scenario. |
| Interface | Command, generator, hook, API, doc workflow, or future authoring surface. |
| Input | Path, diff, staged files, rule id, pattern, topology request, or other input. |
| Output | Report, diagnostics, proof artifact, generated files, refusal, or handoff. |
| Domain concepts | Candidate ubiquitous language surfaced by the scenario. |
| Authority | Which owner decides truth or refusal. |
| Proof need | Evidence required to trust the output. |
| Failure/refusal modes | Expected failures, refusals, or unsupported states. |
| Current evidence | Docs, code, tests, commands, generated diffs, or historical records. |
| Flow map | Link to row in `flow-map-ledger.md`. |
| Evidence status | verified / reference intent / historical / hypothesis / unresolved. |

## Required Seed Rows

| Scenario ID | Status | Actor | Trigger | Interface | Input | Output | Domain concepts | Authority | Proof need | Failure/refusal modes | Current evidence | Flow map | Evidence status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01-classify-path | supported | coding agent | Before editing a file | `habitat classify` | repo path | owner, tags, rules, targets, unavailable targets | orientation, routing, target truth | classify / Nx metadata | command output plus code/test trace | missing path, unavailable target | TODO | TODO | unresolved |
| S02-classify-diff | supported | DRA owner or agent | Before handoff or review | `habitat classify` | diff or patch | per-path classification | diff routing, multi-path ownership | classify / Nx metadata | command output plus diff parser trace | unparseable diff, mixed ownership | TODO | TODO | unresolved |
| S03-check-rules | supported | maintainer or CI | Structural check | `habitat check` | rule/tool/owner selection | normalized diagnostics and baselines | enforcement, diagnostics, baseline | rule registry / baseline authority | command output, rule tests, baseline files | unknown selector, unbaselined finding | TODO | TODO | unresolved |
| S04-verify-proof | supported | DRA owner | Proof before handoff | `habitat verify` | base ref | check result plus Nx affected proof artifact | proof, affected graph, non-claims | verify / Nx graph | JSON proof artifact and command behavior | failing check, affected task failure | TODO | TODO | unresolved |
| S05-fix-approved-apply | supported limited | maintainer or agent | Approved structural repair | `habitat fix` | clean worktree and allowlisted apply pattern | dry-run/apply proof and Biome handoff | transformation transaction, guarded repair | Grit apply / Biome | dry-run, changed-path approval, rollback/gate proof | dirty tree, unapproved path, apply mismatch | TODO | TODO | unresolved |
| S06-run-hooks | supported local | Git hook | pre-commit or pre-push | `habitat hook` | staged files or push range | local feedback | local feedback, staged scope | hook orchestration | hook command trace and side-effect proof | partial staging, generated-zone mutation | TODO | TODO | unresolved |
| S07-generate-project | supported limited | agent | Need uniform workspace project | Nx generator | kind/name/root | new project scaffold or refusal | scaffolding, uniform project | project generator / Nx | scratch generation and Nx discovery | unsupported kind, mismatched root | TODO | TODO | unresolved |
| S08-draft-pattern | supported | maintainer or agent | Need candidate structural rule | pattern generator | rule id and metadata | candidate Pattern Authority artifacts | pattern candidate, rule admission | Pattern Authority | generated candidate and manifest validation | missing metadata, authority gap | TODO | TODO | unresolved |
| S09-promote-pattern | supported constrained | DRA owner | Accepted pattern authority | pattern generator promotion | accepted candidate | registered advisory/enforced rule artifacts | admission, promotion, enforcement | Pattern Authority / rule registry | manifest, tests, rule registry proof | unaccepted candidate, hook-scope mismatch | TODO | TODO | unresolved |
| S10-generate-mapgen-authoring | desired gap | agent | Need new MapGen domain/op/stage/step | future Habitat authoring generator | topology request | generated topology plus proof loop | authoring topology, recipe wiring | future authoring context and MapGen owners | generator proof, classify, checks, recipe compile | unsupported state today | TODO | TODO | hypothesis |
| S11-describe-human-pattern | desired gap | human maintainer | Need recurring structural rule or transform | future pattern authoring workflow | pattern description and examples | accepted executable pattern/check/apply/generator path | human pattern description, admission, transform | future pattern governance | example corpus, authority, fixtures, proof class | ambiguous authority, unsafe transform | TODO | TODO | hypothesis |
| S12-maintain-repo-with-habitat | desired | human and agents | Ongoing repository maintenance | combined Habitat workflow | paths, diffs, patterns, generated structures | reduced ambiguity and repeatable proof | structural operating surface | Habitat domain as designed | scenario chain proof and design packet | overbroad claims, missing proof class | TODO | TODO | hypothesis |

## Coverage Summary

- Total required seed rows: 12.
- Rows filled with current evidence: 0.
- Supported rows needing trace: 9.
- Desired/gap rows needing acceptance framing: 3.
- Open uncertainty: all seed rows require Phase 2 extraction and Phase 3 flow
  tracing before domain synthesis.
