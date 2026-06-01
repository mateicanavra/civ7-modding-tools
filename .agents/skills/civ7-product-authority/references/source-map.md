# Source Map

Use this file to decide what can support product and domain claims.

## Authority Source Order

Use this order when sources conflict:

1. Direct current user/project-owner decisions.
2. Root and subtree `AGENTS.md` plus repo process docs.
3. Accepted project baseline artifacts when they explicitly declare the active target for the work:
   - project specs, consolidated packets, decision packets, and review-disposition records under `docs/projects/<project>/`
   - accepted project-local deferrals and triage records
   - for MapGen / Swooper Maps normalization:
     `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
4. Canonical repo docs:
   - `docs/PRODUCT.md`
   - `docs/SYSTEM.md`
   - `docs/PROCESS.md`
   - `docs/system/ARCHITECTURE.md`
   - `docs/system/TESTING.md`
5. Canonical domain docs for the product area:
   - `docs/system/sdk/**`
   - `docs/system/cli/**`
   - `docs/system/libs/mapgen/**`
   - `docs/system/mods/swooper-maps/**`
6. Accepted ADRs and durable deferrals.
7. Active project notes and reviews after their status is classified.
8. Official Civ7 resources in `.civ7/outputs/resources` for game-data facts and examples.
9. Current package/mod/app source and tests for implementation behavior.
10. Generated artifacts as proof of generation only.
11. In-game validation as runtime behavior evidence for the exact mod/game setup checked.
12. OpenSpec artifacts under `openspec/` as downstream change-management
    records unless a completed promotion explicitly makes a spec canonical.
13. External examples, community knowledge, archived docs, and chat/session summaries as discovery material only.

## Evidence Classes

| Evidence | Can Support |
|---|---|
| User/project-owner decision | Product policy, priorities, ownership, or accepted behavior when recorded durably |
| Canonical docs/ADRs | Durable repo intent and accepted architecture/product decisions |
| Official resources | Game identifiers, XML shapes, schemas, and game-data relationships |
| Source code plus tests | Current implementation behavior |
| Generated output | That source generated a particular artifact at a point in time |
| In-game check | Runtime behavior for the checked mod/game version/config |
| Docs examples | Promised usage only when canonical and current |
| External examples | Discovery leads until promoted into repo docs or tests |

## Re-Grounding Procedure

1. Check branch, Graphite stack, and dirty state.
2. Read the relevant capability, flow, policy, and failure-pattern records.
3. Classify every input as product authority, game-data evidence, implementation evidence, generated-output proof, runtime proof, stale input, or discovery material.
4. If an input conflicts with this skill, controlling docs, or canonical docs, update authority or record a decision/deferral before dependent implementation proceeds.
5. Do not convert open questions into fallbacks, silent compatibility, or optional public behavior.
