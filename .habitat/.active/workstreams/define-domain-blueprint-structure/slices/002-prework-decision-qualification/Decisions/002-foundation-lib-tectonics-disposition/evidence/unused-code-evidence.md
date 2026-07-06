# Unused-Code Evidence

Status: closed evidence artifact

## Scope

Inspected source set:

- `mods/mod-swooper-maps/src/domain/foundation/lib/**/*.ts`
- collar:
  `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`

## Tool Availability

No installed repo-local unused-code analyzer was found:

```text
knip:
ts-prune:
depcheck:
unimported:
node_modules bins:
```

The deletion evidence is therefore `rg`/source-import evidence plus duplicate
operation-local implementation evidence. It is not Knip, ts-prune, compiler
graph, or runtime proof.

## Commands

Representative commands:

```bash
command -v knip
command -v ts-prune
command -v depcheck
command -v unimported
find node_modules/.bin -maxdepth 1 -type l -o -type f
bun habitat classify mods/mod-swooper-maps/src/domain/foundation/lib
bun habitat classify mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts
rg -n "from [\"'][^\"']*(foundation/(lib|ops/.*/lib)|lib/(tectonics|crust)|/lib/require|/lib/normalize|project-plates)(\\.js)?[\"']" mods/mod-swooper-maps packages apps tools docs -g '!**/mod/**' -g '!**/dist/**'
rg -n "lib/tectonics/(index|events|fields|membership|provenance|rollups|tracing)\\.ts|lib/tectonics/(index|events|fields|membership|provenance|rollups|tracing)\\.js|lib/tectonics/(events|fields|membership|provenance|rollups|tracing)" mods/mod-swooper-maps/src mods/mod-swooper-maps/test docs .habitat packages apps tools -g '!**/mod/**' -g '!**/dist/**'
```

`bun habitat classify` accepts one path; a two-path attempt failed with
`Unexpected argument` and was rerun separately.

## No Apparent Source/Test Importers

The following module paths had no apparent source/test importers:

```text
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/index.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/events.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/fields.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/membership.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/provenance.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/rollups.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/tracing.ts
```

Relevant non-source references:

```text
docs/projects/crust-relief/WORKSTREAM.md: lib/tectonics/fields.ts is a stale clone of compute-era-tectonic-fields/rules
docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-I-integration-checkpoint.md: migration/checkpoint references to lib/tectonics files
```

## Deletion Confidence

| File | Confidence | Basis | Required later proof |
| --- | --- | --- | --- |
| `lib/tectonics/index.ts` | high | No source/test importers; only re-exports unused modules. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/events.ts` | high | No importers; live logic split into segment-events and hotspot-events operation rules. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/fields.ts` | high | No importers; active era-field rules own same exported symbols; project doc calls it stale clone. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/membership.ts` | high | No importers; active era-plate-membership rules own computation. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/provenance.ts` | high | No importers; active provenance rules own computation. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/rollups.ts` | high | No importers; active history/current rules split the concerns; `computeEraGain` has no importer. | Delete in source slice and run relevant check/test. |
| `lib/tectonics/tracing.ts` | high | No importers; active tracer-advection rules own computation. | Delete in source slice and run relevant check/test. |

## Limits

- Dynamic import strings, generated outputs, and external consumers are not
  exhaustively proven by this pass.
- Deletion candidates should be removed only in a follow-up write pass with at
  least the relevant foundation typecheck/test target.
- Symbol-name search alone is not deletion proof because the same symbols exist
  in active operation-local files.
