# Habitat Domain Mapping Evidence Ledger

Every meaningful domain claim must land here or cite a row here. The ledger
keeps current behavior, reference intent, historical claims, hypotheses, and
non-claims separate.

## Claim Labels

- verified current behavior: supported by current code, tests, command output,
  generated diff, or structured proof.
- reference intent: supported by current docs but not yet proven by behavior.
- architecture target: accepted design or architecture source states the target.
- historical claim: older workstream record or closure claim, not current proof
  by itself.
- hypothesis: plausible domain claim awaiting scenario and authority proof.
- explicit non-claim: intentionally excluded or not proven.
- unresolved: evidence missing or conflicting.

## Row Contract

| Field | Required content |
| --- | --- |
| Evidence ID | Stable key. |
| Claim | Exact claim being made. |
| Label | One of the claim labels above. |
| Sources | Paths, commands, tests, records, or docs. |
| Scenario / authority links | Scenario, flow, and authority IDs using this claim. |
| Conflict check | Contradictions searched or still needed. |
| Confidence | verified / corroborated / plausible / speculative / unresolved. |
| Non-claims | What this evidence does not prove. |
| Next action | What would upgrade, downgrade, or retire the claim. |

## Seed Evidence Rows

| Evidence ID | Claim | Label | Sources | Scenario / authority links | Conflict check | Confidence | Non-claims | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Habitat is currently a repo-local structural toolkit for agents and maintainers. | reference intent | `DOMAIN-MAPPING.md`, `CAPABILITIES.md` | S01-S12 | TODO | plausible | final domain model | verify against code/commands |
| E02 | Current Habitat code composition is evidence, not target domain authority. | reference intent | `DOMAIN-MAPPING.md` | all | TODO | corroborated | current behavior details | preserve in every artifact |
| E03 | Habitat can classify paths/diffs into owner, tags, rules, targets, and unavailable target facts. | reference intent | `CAPABILITIES.md`, current classify code/tests TODO | S01, S02, A01 | TODO | plausible | target domain boundary | trace command and tests |
| E04 | Habitat is not yet a complete MapGen authoring toolkit. | reference intent | `AUTHORING-NEXT.md`, `GAPS.md`, `DOMAIN-MAPPING.md` | S10, S11 | TODO | corroborated | generator design | trace unsupported state |
| E05 | Current code directories are not sufficient domain boundaries. | hypothesis | `DOMAIN-MAPPING.md`, current code traces TODO | all | TODO | plausible | final context map | test against flow maps |

## Evidence Discipline

Do not upgrade a row to verified current behavior until the source proves the
exact behavior currently claimed. Passing OpenSpec validation proves artifact
shape only. Passing a hook proves local feedback only. A successful current
command proves the exercised command path only.
