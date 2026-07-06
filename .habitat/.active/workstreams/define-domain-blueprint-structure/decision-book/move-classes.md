# Move Classes

Status: active working reference

Move classes are reusable dispositions for red content. A slice inventory uses
these classes, then names exact current paths and exact destinations/actions.

| Move class | Applies when | Destination pattern |
| --- | --- | --- |
| Duplicate authority deletion | A file only repeats an authority surface already owned elsewhere. | Delete after import proof. |
| Domain model config decomposition | Content is a domain-owned authoring config object or object-local schema/default/compile transform. | `<domain>/model/config/<part>.config.ts` |
| Domain model policy promotion | Content is a named domain semantic policy concern. | `<domain>/model/policy/<concern>.ts` |
| Domain model data move | Content is domain-owned authored data or expectation tables. | `<domain>/model/data/<collection>/<clear-name>.ts` |
| Artifact contract extraction | Content defines a pipeline truth product contract. | `<domain>/artifacts/<artifact>.artifact.ts` |
| Operation contract consolidation | Operation config or contract fragments belong in one operation contract surface. | `<domain>/ops/<operation-id>/contract.ts` |
| Operation-local policy move | Content is policy for one operation only. | `<domain>/ops/<operation-id>/policy/<concern>.ts` |
| Operation-local implementation move | Content is pure implementation logic for one operation. | `<domain>/ops/<operation-id>/rules/<concern>.ts` or another operation-local slot named by the operation scope. |
| Operation-family decomposition | A shared operation-family folder mixes several ownership classes. | Split into the specific move classes above; no family-shared bucket remains. |
| Core mechanics extraction | Content is pure reusable math, grid, or algorithmic mechanics with no domain semantics. | `packages/mapgen-core/src/lib/**` |
| Official Civ7 policy/resource ownership | Content is reusable official-game policy, catalog, legality, or generated-table fact. | `@civ7/map-policy` accepted source path. |
| Civ7 runtime adapter ownership | Content is runtime engine/API behavior or adapter-specific materialization. | `@civ7/adapter` or explicit runtime integration. |
| Civ7 type ownership | Content is ambient engine/global TypeScript declaration authority. | `@civ7/types`. |
| Stage/projection ownership | Content is stage-facing projection config or recipe-stage binding. | Owning standard recipe stage. |
| Gameplay/narrative owner-law | Content belongs to Gameplay/story-artifact ownership. | Separate owner-law domino names the exact public surface and destinations. |

No move class creates a generic bucket. If none fits, the slice stops for a
narrow law update.
