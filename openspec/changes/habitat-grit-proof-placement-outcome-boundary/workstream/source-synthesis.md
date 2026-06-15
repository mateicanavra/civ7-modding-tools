# Source Synthesis - Placement Outcome Boundary

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `mods/mod-swooper-maps/AGENTS.md` | Swooper Maps source is game-facing mod code; generated `mod/` output is read-only. | Package router only; not proof of Grit behavior. |
| `mods/mod-swooper-maps/src/AGENTS.md` | `src/**` contains game-facing entrypoints and should stay small/declarative. | Source router only; this row does not mutate source. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-placement-outcome-boundary` as enforced `grit-check`, scoped to placement apply implementation, forbidding direct official resource/discovery generation calls. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` | D3/D4 record placement product/effect boundaries and typed intent reconciliation instead of official generator output as truth. | Architecture authority; retired parity remains unproven in this checkpoint. |
| `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md` | Records G8 as the hidden placement sub-concerns guardrail owned by this Habitat Grit rule and placement reconciliation tests. | Policy lineage; not native Grit or wrapper proof. |
| `docs/system/libs/mapgen/reference/domains/PLACEMENT.md` | Records typed placement outcome artifacts and terminal placement apply semantics. | Reference authority; not current-tree proof. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive direct official generator calls, negative typed outcome use, current placement implementation scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed has 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate reports direct calls to:

- `generateOfficialResources($...)`
- `generateOfficialDiscoveries($...)`

when the filename matches:

- `.*mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply\.ts$`

The registry scope is:

- placement apply implementation.

The current predicate is syntax/path scoped. It does not by itself prove
wrapper command behavior, raw acquisition, injected cleanup, baseline behavior,
retired parity, source remediation, or product placement closure.

## Fixture Plan

Positive/current-predicate classes:

- direct `generateOfficialResources(...)` call;
- direct `generateOfficialDiscoveries(...)` call;
- direct calls with arguments, nested call position, or `await`.

Controls and parser-edge classifications:

- typed `resourcePlacement` and `discoveryPlacement` outcome artifact
  consumption;
- same-name property/member or string lookalikes;
- non-placement apply, generated-output-shaped, package, `.tsx`, and other-mod
  paths;
- broader placement product examples outside the current predicate.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan root, exclusions, file counts, actual current
predicate counts, direct `generateOfficialResources` and
`generateOfficialDiscoveries` call counts, member/property/string lookalikes,
typed outcome artifact references, live candidate paths, row id, proof ids,
blockers, and explicit non-claims. Temporary stdout or scratch files are not
durable proof.

Current checkpoint counts:

- 4 scanned TS/TSX files under the terminal placement step root, all `.ts`.
- 0 `.tsx` files.
- 1 current-predicate file: terminal placement `apply.ts`.
- 15 total call expressions inside the current-predicate file.
- 0 direct `generateOfficialResources` calls.
- 0 direct `generateOfficialDiscoveries` calls.
- 0 total direct official-generator calls.
- 0 member official-generator calls.
- 0 official-generator property references.
- 0 official-generator string lookalikes.
- 0 official-generator identifier references outside direct calls.
- 11 typed outcome identifier references.
- 3 typed outcome property accesses.
- 0 parse diagnostics.

Typed outcome references include `ResourcePlacementOutcomes`,
`DiscoveryPlacementOutcomes`, `resourcePlacement`, and `discoveryPlacement` in
`mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`.
