# Rule Authority Ledger Identity Reconciliation

Status: complete

Recorded: 2026-07-30

## Purpose

Restore the canonical cleanup ledger to exactly one current row per rule
identity discovered by Habitat. This is a Layer 1 operational reconciliation,
not a redesign or weakening of any governed rule.

## Outcome

| Fact | Before | After |
| --- | ---: | ---: |
| Live manifests | 121 | 122 |
| Current ledger rows | 120 | 122 |
| Live ids without rows | 46 | 0 |
| Current rows without manifests | 45 | 0 |
| Retired historical rows | 46 | 91 |
| Duplicate live/current ids | 0 / 0 | 0 / 0 |

The after-state includes the lifecycle-bound
`require_active_rule_authority_ledger_identity_parity` rule and its own current
ledger row.

## Live Admissions

All 46 omitted live identities received fresh evidence-backed classification:

| Decision | Rows |
| --- | ---: |
| Context admission | 32 |
| Boundary inversion | 4 |
| Split by owner | 5 |
| Runtime/source validation | 3 |
| No action | 2 |

Thirty-four rows require no decision packet. The following twelve retain an
explicit future owner/design packet:

- `require_map_mod_project_root_topology`
- `require_cli_command_module_semantics`
- `require_service_module_isolation`
- `require_service_proof_isolation`
- `require_service_effect_error_authority`
- `require_service_anchor_exports`
- `require_service_orpc_composition`
- `require_service_contract_authority`
- `require_service_contract_property_descriptions`
- `require_service_public_consumer_sealing`
- `require_service_boundary_platform_independence`
- `require_orpc_error_authority`

The canonical JSON ledger owns each row's evidence, expected remediation,
implementation readiness, and blocker or residual condition.

## Manifestless Rows

All 45 manifestless current rows were verified as deleted rule identities.
None warranted manifest restoration. Their prior rows moved to
`retiredRules[]` with deletion commit/date, retirement rationale, and surviving
authority destinations.

| Deletion commit | Rows | Disposition |
| --- | ---: | --- |
| `f1f4b03fde` | 16 | Foundation/domain positive-kind ratchet |
| `79f1db5e2d` | 11 | Nested domain/module authority ratchet |
| `b2a0d4dc39` | 5 | Generic authoring-kind ratchet |
| `d3cd35e68c` | 4 | Typed dependency/completion collapse |
| `f69af64fb6` | 3 | Map definition/realization and catalog split |
| `686b4d3cf0` | 3 | Domain/runtime ownership collapse |
| `dee89905a0` | 1 | Generic service-kind replacement |
| `824896bb22` | 1 | Obsolete realized-artifact namespace retirement |
| `a171d6492f` | 1 | Closed recipe-step authority |

Their final action classes are: 22 retirement/garbage-collection, 8 boundary
inversion, 5 split-by-owner, 5 closed-structure inversion, 3 runtime/source
validation, and 2 consolidation/dedup.

## Operational Queue Closure

Retirement also closes authorization. Eight nonterminal historical slices still
selected at least one now-retired identity; two active blocker records named
only retired identities. The slices are now explicitly superseded, their former
queue order and next action are historical fields, and the two obsolete
blockers are removed. Surviving live rules retain their individual evidence and
dispositions, but any future mutation requires fresh selection from the current
corpus.

## Contextual Guard

The parity rule compares Habitat's canonical discovered
`document.rules[].id` identities with the active ledger's
`rules[].ruleId` identities. It also validates current-row counts and duplicate
summaries. It does not scan paths independently, use physical placement as
identity, or infer semantic dispositions.

The rule is contextual because its subject is an active workstream ledger. It
must retire when that ledger retires. Permanent parity enforcement would first
require promoting the ledger contract out of `.habitat/.active`.

## Proof

- Focused parity rule: pass.
- Injected comparator corpus: 10/10 pass.
- Canonical registry/current-ledger set comparison: 122/122, zero differences.
- Current-path audit: all 122 current rows resolve to live manifests.
- Active queue audit: no nonterminal slice or blocker references a retired
  identity.
- Habitat TypeScript proof: pass on both rule and test projects.
- Habitat test graph: 44 files pass; 558 tests pass and 2 skip.
- Habitat hygiene: pass after repository formatter ownership was applied.
- Generated execution-surface currentness: 122 rule manifests and 17 check
  scripts recorded through `habitat:analyze:execution-surface`.

The broader workspace graph also reproduced two inherited, untouched baselines:
five Knip findings in root/Habitat packaging and the existing Habitat
project-boundary decomposition corpus. Neither contains a path changed by this
reconciliation, so neither is claimed as proof or absorbed into this semantic
layer.

## Non-Claims

- No packet-needed rule is accepted as permanent reusable-class law by this
  reconciliation.
- No current rule was rewritten, weakened, or restored from historical residue.
- The accepted capability-realization test law remains unchanged: every
  admitted test root is closed by kind around finite, disjoint confidence axes;
  generic kinds reuse generic layers and qualified/domain kinds refine them.
