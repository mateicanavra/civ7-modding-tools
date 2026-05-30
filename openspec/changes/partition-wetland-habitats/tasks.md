## 1. Wetland Diagnosis

- [x] 1.1 Identify near-river humid/fertile scoring plus weak planner
      admission as the current marsh saturation cause.
- [x] 1.2 Quantify current and repaired Earthlike wetland-family density from
      recipe-level execution.

## 2. Wetland Habitat Implementation

- [x] 2.1 Add named substrate eligibility fields only where multiple wetland
      ops share the invariant.
- [x] 2.2 Keep feature-specific wetland scoring config beside the owning op.
- [x] 2.3 Apply wetland eligibility during wetland intent planning.
- [x] 2.4 Add why/what comments for hydromorphic/intertidal policy logic.

## 3. Tests And Docs

- [x] 3.1 Add focused tests for humid highland near river rejection, mangrove
      coastal/intertidal eligibility, oasis arid isolated water eligibility,
      watering-hole arid/semi-arid local water plus fertility context, and
      tundra bog cold waterlogged terrain.
- [x] 3.2 Add recipe-level wetland density assertions that run `standardRecipe`
      through the standard runtime/config rather than direct step wiring.
- [x] 3.3 Update Ecology docs and implementation evidence.

## 4. Verification

- [x] 4.1 Run focused wetland/ecology tests.
- [x] 4.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.3 Run `bun run openspec -- validate partition-wetland-habitats --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `bun run build`.
- [x] 4.6 Run `bun run deploy:mods`.
- [x] 4.7 Run `git diff --check`.
