# Habitat Authority Tool Separation

Status: active consumer reference

## Core Split

Habitat policy lives in `.habitat`. The installed Habitat CLI/SDK owns policy
resolution, shared blueprints, Grit and structure execution, Nx projection, and
hooks. Civ7 does not implement those mechanics locally.

## Proof Owners

| Concern | Owner | Habitat role |
| --- | --- | --- |
| Shared project-kind topology | Installed `@habitat-ai/sdk` blueprint | Select the released kind; never copy its structure |
| Qualified filesystem topology | Habitat `structure.toml` | Express a closed tree with required and explicitly allowed members |
| Source relationships | Grit through Habitat `pattern.md` | Express generic positive shape, imports, exports, calls, and exclusions over exact acquisition roots |
| Project graph and task order | Nx | Project direction, target dependencies, affected execution, and caching |
| Type and contract assignability | TypeScript / TypeBox | Static contracts and schema-derived types |
| Formatting and general lint | Biome / ESLint | Mechanical hygiene and project boundaries |
| Dead code and dependencies | Knip | Unused files, exports, and dependencies |
| Product and package behavior | Owning tests and runtime proof | Semantics, generated equivalence, integration, and live outcomes |

## Decision Rules

1. Use the selected shared blueprint for generic kind law.
2. Use `structure.toml` only for filesystem topology. Structures are closed by
   default; required members define the spine and allowed members are the full
   exception set.
3. Use Grit only for source relationships. Acquire the exact admitted roots;
   do not broad-scan and recover membership with filename predicates.
4. Use Nx for project direction and proof scheduling. Habitat's projected
   targets are leaves in that graph, never a second scheduler.
5. Keep runtime behavior and generated equivalence with the product owner.
6. Delete retired assertions that cannot recur through a live authoring rail.

Every local packet is closed to `rule.json`, `baseline.json`, and one of
`pattern.md` or `structure.toml`. Script, Nx, file-layer, mutation, and private
support runners are not admitted on the consumer face.
