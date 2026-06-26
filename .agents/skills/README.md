# Repo-Local Skills

These skills encode durable local operating guidance for Civ7 Modding Tools.
They are not project status, migration notes, or chat carry-forward.

For MapGen / Swooper Maps architecture normalization, the skills route agents
to the accepted normalization packet and OpenSpec workstreams. They should
shape how agents think about ownership, proof, sequencing, and refactor
discipline; they should not duplicate the packet as a parallel spec.

## Skills

| Skill | Use When |
|---|---|
| `civ7-mapgen-workstream` | Taking a map-generation request end-to-end (investigate → design → implement → verify in-game → review → finalize): routing between the technical (recipe structure) and behavioral (physical realism) arms and the generation-logic vs Studio-visualization problem classes. Composes cognition design skills + `civ7-*` skills + live mod source; adds physics/verification/Civ7-domain facets. |
| `civ7-architecture-authority` | Placing code, moving boundaries, changing MapGen stage/step/domain shape, separating core/mod/adapter/generated concerns, or reviewing architecture drift. |
| `civ7-product-authority` | Deciding product/domain ownership, public SDK/CLI/mod behavior, official game-data authority, consumer contract claims, or proof boundaries. |
| `civ7-open-spec-workstream` | Running a bounded spec/workstream phase from authority grounding through implementation, verification, downstream realignment, and handoff. |
| `civ7-operational-debugging` | Debugging build/deploy/log/in-game evidence across generated mod output, deployed Civ7 Mods folders, official resources, and proof boundaries. |
| `civ7-orpc-control-architecture` | Designing or reviewing oRPC/Effect procedure, router, middleware, and context surfaces for Civ7 direct-control, CLI game/play commands, Studio endpoints, and live-play support refactors (`@civ7/control-orpc`). |
| `civ7-play-game` | Playing a live, already-running Civ7 game turn-by-turn via the `civ7` CLI (`node packages/cli/bin/run.js game …`) and FireTuner: reading priorities/notifications/ready entities and issuing unit, city, research, civic, diplomacy, and end-turn actions. Self-describing read→action loop for a small agent. Not for designing the control surface (`civ7-orpc-control-architecture`) or launching/log debugging (`civ7-operational-debugging`). |

## Globalized Skills

The following previously repo-local skills now live in RAWR HQ and should be
loaded from the global provider when available:

- `habitat:systematic-workstream`
- `habitat:dra-structural-watcher`
- `dev:graphite-stack-drain`
- `dev:typescript-refactoring`

## Operating Rules

- Read the root `AGENTS.md` first, then the closest subtree `AGENTS.md` for files being touched.
- Load the smallest skill set that covers the work.
- Keep `SKILL.md` files lean. Put deeper rules in `references/` and copy-forward templates in `assets/`.
- Do not store temporary workstream state in these skills. Use `docs/projects/<project>/...` for project state and phase artifacts.
- Use `openspec/` for implementation change records once a project slice becomes an OpenSpec workstream.
- Update a skill only when durable authority changes.
