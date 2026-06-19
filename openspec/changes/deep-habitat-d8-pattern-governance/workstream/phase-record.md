# Phase Record: D8 Pattern Governance

## State

- Status: D8 source slice implemented on `agent-DRA-d8-pattern-governance`;
  ready for final validation and Graphite submission.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D8_SOURCE_PACKET`.
- OpenSpec change: `$D8_CHANGE`.
- Implementation status: TypeBox-first Pattern Governance state, validation,
  refusal, admission-state constructor, and projection modules are implemented.
  Generator promotion, apply transactions, local-feedback hooks, protected-zone
  gates, and host policy remain owned by D13, D9, D11, D10, and G-HOST.

## Objective

Implement complete Pattern Governance lifecycle and admission boundaries. D8
must prevent candidate, diagnostic, local-feedback, apply,
refused, and retired pattern states from being inferred from file presence,
registry fields, baseline files, Grit metadata, generator options, or adjacent
domain behavior.

## Current Gate

D8 source is limited to Pattern Governance modules and the existing
`pattern-authority/manifest.ts` public facade. The implemented slice does not
edit generator CJS, `rules.json`, Grit pattern files, baselines, apply paths,
hooks, command output families, protected-zone policy, or host policy.

Concrete D0 rows cover the touched public/durable Pattern Authority exports:
`D0-package-export-symbol-candidatepatternauthoritymanifest`,
`D0-package-export-symbol-patternauthoritymanifest`,
`D0-package-export-symbol-patternauthorityrulereference`,
`D0-package-export-symbol-patternauthorityvalidationfailurereason`,
`D0-package-export-symbol-patternauthorityvalidationissue`,
`D0-package-export-symbol-patternauthorityvalidationoptions`,
`D0-package-export-symbol-patternauthorityvalidationresult`,
`D0-package-export-symbol-registeredpatternauthoritymanifest`,
`D0-package-export-symbol-patternauthoritymanifestschemaversion`, and
`D0-package-export-symbol-validatepatternauthoritymanifest`. D8 adds internal
module exports behind the same facade; no new package subpath or CLI surface is
introduced.

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

## Source Characterization

| Surface | Current behavior | D8 disposition |
| --- | --- | --- |
| Pattern Authority manifest validation | Previously concentrated public types, path helpers, shape checks, semantic checks, and acceptance result in one large module. | Replaced with small TypeScript modules under `src/rules/pattern-governance/`; the old import path is a re-export facade. |
| Candidate generator | Current CJS generator remains the candidate authoring path. | Not edited by D8; D13 owns generator/refusal wiring. |
| Registered promotion | Current CJS registration writes active Grit/rule artifacts. | Not edited by D8; active registration must flow through D8 projections before D13 work. |
| Active registry/Grit catalog | Existing registry and diagnostic facts are D2/D6-owned inputs. | D8 publishes projection/state boundaries and does not infer current active admission from file or registry presence. |

## Source Implementation

| Area | Source files | Product result |
| --- | --- | --- |
| Schema/type contract | `src/rules/pattern-governance/schema.ts` | TypeBox schemas and `Static<>` types define manifest, refusal, state, and projection contracts. |
| Manifest validation | `src/rules/pattern-governance/validation.ts` | External manifest data validates through TypeBox before semantic D8 checks; lifecycle no longer creates admission. |
| Lifecycle/refusal/admission state | `state.ts`, `refusal.ts`, `admission.ts` | D8 states are closed and constructed through TypeBox-validated functions. |
| Consumer projections | `projections.ts`, `rule-reference.ts` | Consumers receive named projections instead of whole Pattern Authority manifests. |
| Public facade | `src/rules/pattern-authority/manifest.ts` | Existing import path remains stable while the implementation moves behind the D8 module boundary. |

## Source Validation

| Gate | Required scenario |
| --- | --- |
| `bun run --cwd tools/habitat-harness check` | Passed; TypeScript source checks. |
| `bun run --cwd tools/habitat-harness build` | Passed; TypeScript build checks. |
| `bun run --cwd tools/habitat-harness test test/rules/pattern-authority-manifest.test.ts test/rules/pattern-governance-projections.test.ts` | Passed; 18 focused manifest/projection tests. |
| `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | Passed. |
| `bun run habitat classify tools/habitat-harness/src/rules/rules.json` | Passed; routing observation only, not admission proof. |
| `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts` | Passed; routing observation only, not admission proof. |
| `bun run openspec:validate` | Passed; 249 items. |
| `git diff --check` | Passed. |
| `git status --short --branch`, `gt status`, `gt log --stack` | Passed; D8 branch dirty with intended source/record files before staging, stack remains linear. |

## Write Set

D8 source changes stay inside Pattern Governance TypeScript modules, the
existing Pattern Authority facade, and focused tests/records. All generated,
baseline, apply, hook, command-engine, graph, product, vendor, cache, lockfile,
Grit pattern, registry JSON, and generated-output paths remain untouched unless
the owning packet explicitly authorizes them.

## Non-Claims

- D8 design acceptance does not make existing Grit rules complete Pattern
  Authority admissions.
- Manifest validation does not prove diagnostic capability, baseline authority,
  hook eligibility, apply admission, or current-tree behavior.
- Diagnostic admission does not prove apply admission.
- Apply admission does not execute or approve writes.
