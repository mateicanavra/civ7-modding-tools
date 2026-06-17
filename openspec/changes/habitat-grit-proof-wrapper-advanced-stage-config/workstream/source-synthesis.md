# Source Synthesis - Wrapper Advanced Stage Config

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `mods/mod-swooper-maps/AGENTS.md` | Swooper Maps source is game-facing mod code; generated `mod/` output is read-only. | Package router only; not proof of Grit behavior. |
| `mods/mod-swooper-maps/src/AGENTS.md` | `src/**` contains game-facing entrypoints and should stay small/declarative. | Source router only; this row does not mutate source. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-wrapper-advanced-stage-config` as enforced `grit-check`, scoped to standard recipe and map config source, forbidding wrapper-only `advanced` stage config surfaces. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` | D1/G9 normalization retires SDK-native nested `advanced` config in favor of flat step/domain config paths. | Architecture authority; retired parity remains unproven in this checkpoint. |
| `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md` | Records G9 as the wrapper-only `advanced` stage config guardrail owned by this Habitat Grit rule. | Policy lineage; not native Grit or wrapper proof. |
| `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` | Records that step overrides live at `<stageId>.<stepId>` and wrapper-only `advanced` stage surfaces were removed. | Reference authority; not current-tree proof. |
| `docs/system/libs/mapgen/explanation/ARCHITECTURE.md` | Points to the normalization packet as the active decision source and treats older `advanced` mentions as drift context. | Documentation drift remains outside this row's closure. |
| `openspec/changes/archive/2026-05-30-normalize-config-surface/implementation.md` | D1 implementation removed wrapper-only `public.advanced` and migrated first-party config to top-level step IDs without dual-shape compatibility. | Historical implementation record; not current proof. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current row records WASC active-check closure evidence for native fixtures, current inventory, wrapper selector, aggregate `grit-check`, explicit empty baseline, and row-specific injected proof. | Aggregate row does not prove broader config-surface closure or product/runtime behavior. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Current row records the WASC active-check proof boundary and preserves raw acquisition, broader config-surface, generator/migration, apply, retired parity, and product/runtime non-claims. | Aggregate row to keep aligned after final injected proof is rerun. |

## Current Predicate

The current Grit predicate reports exact object property syntax for:

- `advanced: $_`
- `"advanced": $_`

when the filename matches:

- `.*mods/mod-swooper-maps/src/(?:recipes/standard|maps)/.*\.(?:ts|json)$`

The registry scope is:

- standard recipe and map config source.

The current predicate is syntax/path scoped. It does not by itself prove
wrapper command behavior, raw acquisition, injected cleanup, baseline behavior,
retired parity, or broader config normalization closure.

## Fixture Plan

Positive/current-predicate classes:

- exact `advanced` object property in map source;
- exact `"advanced"` string-literal property in map source;
- exact `advanced` object property in standard recipe source;
- exact `"advanced"` string-literal property in standard recipe source;
- exact `advanced` / `"advanced"` key in in-scope `.test.ts` map or standard
  recipe source as a current-predicate fact.

Controls and parser-edge classifications:

- supported step-id/domain config keys;
- ordinary advanced words and identifiers such as `advancedStart`;
- non-standard recipe, domain, package, generated-output-shaped, `.tsx` /
  `.test.tsx`, and other-mod paths;
- broader config normalization examples outside the current predicate.

## Inventory Plan

Run a TypeScript/JSON parser inventory over:

- `mods/mod-swooper-maps/src/recipes/standard`
- `mods/mod-swooper-maps/src/maps`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan roots, exclusions, file counts, actual current
predicate counts, exact `advanced` property counts, exact `"advanced"` string
property counts, ordinary advanced-word lookalikes, live candidate paths, row
id, proof ids, blockers, and explicit non-claims. Temporary stdout or scratch
files are not durable proof.

Current closure inventory counts:

- 239 scanned TS/TSX/JSON files under the Swooper standard recipe and maps
  roots.
- 233 `.ts` files, 0 `.tsx` files, and 6 `.json` files.
- 239 current-predicate files: 233 current-predicate `.ts` files, 6
  current-predicate `.json` files, and 0 current-predicate `.tsx` files.
- 221 current-predicate standard recipe files and 18 current-predicate map
  files.
- 0 exact `advanced` identifier properties.
- 0 exact `"advanced"` string-literal properties.
- 0 total exact `advanced` properties.
- 0 exact JSON `advanced` properties.
- 0 exact TS `advanced` properties.
- 6 advanced-name lookalike properties and 39 advanced-name identifier
  references.
- 0 current-predicate files with exact `advanced` candidates.
- 5 current-predicate files with lookalike-only advanced names.
- 0 parse diagnostics.

The 6 lookalike properties are ordinary gameplay/config terms and not exact
wrapper `advanced` config-key candidates.

Current wrapper proof selects exactly WASC plus `baseline-integrity`; aggregate
`grit-check` proof includes WASC among 30 Grit rules; the committed baseline is
explicit `[]`. Row-specific injected proof is recorded separately from
aggregate injected-corpus closure.
