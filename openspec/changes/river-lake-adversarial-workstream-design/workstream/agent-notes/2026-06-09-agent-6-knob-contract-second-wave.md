# 1. Framed objective

Redesign the river/lake contract so authored controls map to real product intent instead of current implementation accidents.

The target frame is:

- Hydrology truth owns how water accumulates, which channels count as rivers, and which terminal basins count as lakes.
- Map projection owns only Civ-facing materialization of that truth after recipe ordering requires it.
- Shared Civ facts live in `packages/civ7-map-policy`, not in mod-local knobs or duplicated stage heuristics.
- Verification and debug controls are operational surfaces, not map personality/config surfaces.

Hard core:

- One authored knob must not mutate both Hydrology truth classification and Civ projection heuristics.
- `minLength` / `maxLength`-style controls are not acceptable public authoring surfaces unless the product intent is literally “select chains of this length,” which it is not.
- Stage surfaces should expose author intent; domain ops/strategies should own the detailed internal parameters they compile to.

Primary falsifier for this frame: if a single user-facing “river density” concept can be shown to represent one legitimate product outcome across both Hydrology truth and navigable-river projection without hiding two different mechanisms, this framing is wrong. Current evidence does not support that.

# 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

## Questions

1. What are the actual user outcomes for rivers/lakes?
   - More or fewer hydrologic channels?
   - More or fewer terminal-basin lakes?
   - More or fewer Civ navigable-river gameplay tiles?
2. Which current surfaces change truth classification vs Civ materialization vs diagnostics?
3. Which current knobs are semantic macros, and which are leaked internals?
4. Which Civ constraints are durable shared facts and therefore belong in `packages/civ7-map-policy`?
5. Which map-stage surfaces are real authoring surfaces, and which exist only because the current algorithm needs tuning hooks?

## Exclusions

- Do not redesign climate knobs outside the river/lake contract.
- Do not redesign stage order; the standard recipe already establishes the truth/projection split.
- Do not redesign adapter APIs here.
- Do not treat current config fixtures or tests as target architecture; they are migration consumers.

## Falsifiers

- If downstream consumers actually depend on engine river/lake readback as truth rather than diagnostics/projection evidence, this owner map must change.
- If Civ policy requires author-configurable lake or navigable-river legality rules, policy ownership assumptions are incomplete.
- If `map-rivers` has no legitimate independent authoring surface after decoupling, the right answer is “delete the public surface,” not “rename the knobs.”

## Evidence hierarchy

1. User brief and repo instructions.
2. Root `AGENTS.md`.
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
4. `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`.
5. Live stage/domain code and tests as implementation evidence:
   - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/**`
   - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/**`
   - `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/**`
   - `mods/mod-swooper-maps/src/domain/hydrology/**`
   - `packages/civ7-map-policy/**`

## Stop conditions

- Every current river/lake control is placed into exactly one category: physical-model, classification, Civ-projection, verification/debug, or delete.
- Every surviving control has one clear owner.
- Coupled surfaces are identified with a concrete migration direction.
- Remaining ambiguity is explicitly reduced to a product decision, not left as config drift.

# 3. Current knob/contract audit

| Surface | What it currently does | Category | Assessment |
| --- | --- | --- | --- |
| `hydrology-hydrography.knobs.riverDensity` | In `steps/rivers.ts`, shifts `projectRiverNetwork` minor/major percentiles. | Classification macro | Legitimate category, wrong name, wrong coupling story. It does not change runoff truth; it changes which discharge levels earn river classes. |
| `hydrology-hydrography.knobs.lakeiness` | In `steps/lakes.ts`, rewrites `planLakes` sink percentile, lake land-fraction cap, and upstream expansion. | Truth-side lake classification macro | Closer to legitimate, but vague. It is not “generic lakeiness”; it is terminal-basin admission/expansion policy. |
| `hydrology-hydrography.runoff` | Configures `accumulateDischarge`. | Physical-model | Correct owner: Hydrology domain truth. |
| `hydrology-hydrography.riverNetwork` | Configures `projectRiverNetwork` thresholds. | Classification | Correct owner: Hydrology truth-side classification. |
| `hydrology-hydrography.lakes` | Configures `planLakes`. | Classification leaning truth semantics | Owner is right, label is not. The group describes terminal-basin selection, not all lake behavior. |
| `map-rivers.knobs.riverDensity` | In `steps/plotRivers.ts`, rewrites `minLength`/`maxLength` via shared hydrology presets. | Civ-projection macro | Wrong owner coupling. Same semantic word mutates a different mechanism in a different stage. |
| `map-rivers.riverProjection.minLength` / `maxLength` | Public authoring surface for trunk selection heuristics. | Internal algorithm control | Should not be public. These are implementation details of `materializeNavigableRiverMask`, not product intent. |
| `map-hydrology` internal `projectionReadback` | Compile constant controlling extra readback viz. | Verification/debug | Correctly not user-facing today; should stay out of authored config entirely. |
| `packages/civ7-map-policy` generated `lakeEligible` / `adjacentToLand` facts | Shared Civ placement/terrain facts from official resources. | Shared Civ policy | Right package, but river/lake projection contract has not fully routed through this owner yet. |

Most important coupling failure:

- Authored configs currently carry `riverDensity` in both `hydrology-hydrography` and `map-rivers`.
- Tests explicitly assert that one semantic knob currently drives both hydrology thresholds and map-river length bounds.
- That is architecture drift: one user word is doing two different jobs in two different owners.

# 4. Recommended knob taxonomy and owner map

| Category | Legitimate user intent | Owner | Allowed authored surface | Must not own |
| --- | --- | --- | --- | --- |
| Physical-model knobs | “How much water exists and how it moves before classification.” | Hydrology domain ops/strategies, surfaced through Hydrology stages | `runoff` and upstream climate/runoff controls | Civ legality, navigable-river terrain selection, debug toggles |
| Classification knobs | “Given Hydrology fields, what counts as a river or a lake truth artifact?” | Hydrology domain ops/strategies, surfaced through `hydrology-hydrography` | `riverNetwork`, `terminalBasins` (rename from `lakes`), plus optional semantic macros compiled only here | Civ projection heuristics, engine readback controls |
| Civ-projection knobs | “How should already-authored truth be materialized into Civ gameplay surfaces?” | Stage-local map projection strategy plus shared Civ facts in `packages/civ7-map-policy` | Ideally none for lakes; for rivers, only a semantic gameplay-facing group if the product proves it needs one | Hydrology truth thresholds, raw length bounds, policy tables in mod-local config |
| Verification/debug knobs | “What parity/readback evidence do I emit while developing or proving behavior?” | Runtime/dev profile, trace/viz settings, or fixed compile defaults | Non-authored operational surface | Shipped map personality config |
| Should-not-exist surfaces | Anything encoding current helper mechanics instead of intent | Delete or internalize | None | Public authoring contract |

Recommended owner map in concrete terms:

- `hydrology-hydrography`
  - keeps truth-side semantic knobs and truth-side public groups.
  - owns `riverNetwork*` and `terminalBasin*` semantic controls.
- `map-hydrology`
  - keeps no public knobs unless a real projection mode appears.
  - always records parity/readback as an implementation invariant or run-profile behavior, not authored config.
- `map-rivers`
  - should not mirror Hydrology classification knobs.
  - should either expose no user-facing controls, or expose one semantic gameplay-facing projection group that is independent from Hydrology classification.
- `packages/civ7-map-policy`
  - should own any reusable Civ facts for lake acceptance, water-terrain legality, or navigable-river terrain policy that multiple steps/verifiers need.

# 5. Knobs to delete / knobs to add / knobs to rename

## Delete

- `map-rivers.knobs.riverDensity`
- `map-rivers.riverProjection.minLength`
- `map-rivers.riverProjection.maxLength`
- Any authored/public pathway for `projectionReadback`
- Any future pattern where the same macro knob name is duplicated across truth and projection owners

## Add

- `hydrology-hydrography.knobs.riverNetworkDensity`
  - Semantic macro for truth-side river classification only.
- `hydrology-hydrography.knobs.lakeBasinDensity`
  - Semantic macro for truth-side terminal-basin admission/expansion only.
- `hydrology-hydrography.terminalBasins`
  - Public group replacing the overbroad `lakes` name.
- Shared policy helpers in `packages/civ7-map-policy` for any extracted lake/navigable-river Civ facts that should not remain buried in adapter behavior or mod-local heuristics.
- Optional only if product requires independent projection control:
  - `map-rivers.navigableRivers`
  - Semantic fields should express gameplay intent such as coverage/profile, not chain-length internals.

## Rename

- `hydrology-hydrography.knobs.riverDensity` -> `riverNetworkDensity`
- `hydrology-hydrography.knobs.lakeiness` -> `lakeBasinDensity`
- `hydrology-hydrography.lakes` -> `terminalBasins`
- If `map-rivers` retains a public group at all, `riverProjection` -> `navigableRivers`

Strong recommendation: do not preserve `riverProjection` and merely swap field names underneath it. The group name itself encodes the current implementation posture rather than a user-facing outcome.

# 6. Risks and migration implications

- Shipped configs currently author both Hydrology and map-river density surfaces; removing the duplicate will change schemas and fixtures.
- Tests currently codify the coupling. They will need to flip from “one knob drives both places” to “Hydrology classification and map-river projection are independent.”
- If `map-rivers` loses its public surface entirely, shipped maps that currently set `riverProjection` must migrate to defaults or to a new semantic `navigableRivers` group.
- If the current `riverDensity` behavior is relied on for world feel, replacing it with decoupled controls will require baseline calibration to preserve existing authored maps.
- `lakeiness` rename is conceptually correct but migration-noisy because existing maps use that label.
- Extracting Civ-facing lake/navigable-river facts into `packages/civ7-map-policy` may reveal hidden assumptions currently encoded in adapter/runtime behavior rather than explicit policy helpers.

# 7. Concrete next-slice implications

1. Make an authority decision first:
   - Hydrology truth knobs and map projection knobs are separate contracts.
2. Remove duplicated river-density authoring from `map-rivers`.
3. Delete public `minLength` / `maxLength` and replace them with either:
   - no public `map-rivers` surface, or
   - a single semantic `navigableRivers` projection group.
4. Rename truth-side lake surfaces from generic `lakes` / `lakeiness` to terminal-basin language.
5. Route reusable Civ lake/navigable-river facts into `packages/civ7-map-policy` before adding new projection controls.
6. Change tests so they prove decoupling:
   - Hydrology density changes hydrology compile output only.
   - Map-river projection controls, if any remain, change map-river compile output only.
   - Verification/readback controls are absent from authored config schemas.
7. Treat any need to keep `map-rivers` public controls as a product decision with explicit rationale, not as inertia from the current materialization helper.
