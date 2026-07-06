# Rule Remediation: Runtime Helper Redeclaration Source Slice

Status: closed on `codex/habitat-runtime-helper-redeclaration-source`

Canonical record:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

## Purpose

Close the `prohibit_runtime_helper_redeclarations` source-validation packet.
The rule was already admitted as Habitat/Grit authority for shared MapGen core
helper redeclarations, but Layer 1 recorded a source/baseline contradiction:
`compute-shelf-mask` still carried an in-scope local `clamp01` helper while the
focused Habitat check passed.

## Decision

Keep this as one Grit rule. The predicate is static source-shape authority over
bounded recipe step and domain-operation strategy files:

- forbids local `clamp01`, `clampChance`, `normalizeRange`, and `rollPercent`
  declarations in the scoped runtime surfaces;
- does not belong in package-owned tests;
- does not require a Habitat script;
- does not require Nx, because the concern is intra-project source shape, not
  project graph dependency law.

The source repair uses `clampPct(config.activeClosenessThreshold, 0, 1, 0)`
instead of plain `clamp01` so the old non-finite fallback behavior is
preserved while using the shared MapGen core helper surface.

## Disposition Receipt

| Rule id | Action | Reason |
| --- | --- | --- |
| `prohibit_runtime_helper_redeclarations` | repaired/admitted | Removed the in-scope local helper redeclaration and repaired the Grit pattern to catch TypeScript return-typed helper declarations. |

## Exclusions

| Excluded surface | Reason |
| --- | --- |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | Foundation helper-surface consolidation remains positive-authority work, not this source-validation repair. |
| helper declarations under domain `*/rules/` | Outside the current rule scan scope; broad helper-kind consolidation would be a separate positive authority slice. |

## Proof Scope

- Focused Habitat check passes for clean source.
- A temporary in-scope probe with `function clamp01(value: number): number`
  failed the rule at the probe file, proving the repaired Grit pattern catches
  the TypeScript helper declaration form that previously slipped through.
- `nx run mod-swooper-maps:check` passes.

This proves the selected source-validation contradiction is closed. It does not
claim broad helper-kind consolidation or behavior proof for unrelated domain
`rules/` helper files.
