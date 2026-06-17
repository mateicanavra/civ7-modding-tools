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
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive wrapper advanced config, negative current step-id config, ordinary advanced-word false positives, current recipe/map config scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed has 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

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

Current checkpoint counts:

- 240 scanned TS/TSX/JSON files under the Swooper standard recipe and maps
  roots.
- 234 `.ts` files, 0 `.tsx` files, and 6 `.json` files.
- 240 current-predicate files: 234 current-predicate `.ts` files, 6
  current-predicate `.json` files, and 0 current-predicate `.tsx` files.
- 221 current-predicate standard recipe files and 19 current-predicate map
  files.
- 0 exact `advanced` identifier properties.
- 0 exact `"advanced"` string-literal properties.
- 0 total exact `advanced` properties.
- 0 exact JSON `advanced` properties.
- 0 exact TS `advanced` properties.
- 8 advanced-name lookalike properties and 39 advanced-name identifier
  references.
- 0 current-predicate files with exact `advanced` candidates.
- 7 current-predicate files with lookalike-only advanced names.
- 0 parse diagnostics.

The 8 lookalike properties are ordinary gameplay/config terms and not exact
wrapper `advanced` config-key candidates: `assign-advanced-starts`,
`advancedStartAssignment`, and `advancedStartsAssigned` across placement recipe,
artifact, step, and tag source.

The first attempted inventory command invoked `bun` with stdin and printed Bun
usage. That stdout was scratch only and is not durable proof. The durable
successful command shape is inline `node --input-type=module` with the
TypeScript compiler API.
