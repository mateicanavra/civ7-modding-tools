# Foundation Helper Rail Admission

Status: closed on `codex/habitat-foundation-helper-rail-admission`

## Purpose

Admit `prohibit_foundation_duplicate_math_helper_redefinitions` from Foundation
`_remainder` into the live Foundation rules lane. The rule is already a narrow
Grit source rail over duplicate helper declarations in Foundation tectonics
ops; it does not need a new blueprint authority before it can stand as current
Foundation context authority.

## Selected Row

| Rule id | Outcome |
| --- | --- |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | Moved from `foundation/_remainder` to `foundation/rules` with id and predicate preserved. |

## Decision

This row is not a clean positive-kind assertion. Its predicate governs one
Foundation implementation recurrence risk: local redeclarations of canonical
clamp/math helpers inside Foundation tectonics operation source.

The honest home is the Foundation rules lane. The canonical helper surface
already exists in Foundation and MapGen core source; this packet only prevents
known local helper redefinition drift in the scoped Foundation files.

During the admission proof, a temporary TypeScript-annotated helper declaration
showed the prior AST pattern was too narrow. The runner remains Grit, but the
pattern now uses a narrow source-shape regex over the same helper names and
file scope so typed helper declarations are caught.

## Exclusions

| Rule id | Reason |
| --- | --- |
| `prohibit_ambient_rng_in_authored_generation` | Still needs deterministic authored-generation authority plus official-discovery exception policy. |
| `validate_ecology_op_contract_quality` | Still needs general domain-operation contract-quality authority. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | Still a mixed-owner split row. |

## Verification

- Pre-move `bun habitat check --rule prohibit_foundation_duplicate_math_helper_redefinitions --json`
- Temporary `function clampByte(value: number): number` probe failed the moved
  Grit rule.
- Post-move `bun habitat check --rule prohibit_foundation_duplicate_math_helper_redefinitions --json`
- Support-file and runner-path reconciliation across live manifests
- Live manifest/current JSON/process ledger coverage reconciliation
- `bun habitat classify .habitat`
- `bun run --cwd tools/habitat analyze:execution-surface`
- `git diff --check`

## Record

The canonical operational record is
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`; this receipt
does not duplicate the action matrix.
