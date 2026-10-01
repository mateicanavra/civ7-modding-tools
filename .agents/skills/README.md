# Repo-Local Skills

These skills encode durable Civ7-specific authority and operating guidance for
Civ7 Modding Tools. They are not project status, migration notes, chat
carry-forward, or local copies of published vendor or substrate guidance.
A repo-local skill must add durable Civ7 product, domain, runtime, or repository
authority.

For MapGen and the wider Civ7 platform, the skills route agents to the accepted
capability-realization packet, current owner source, and repository proof
surfaces. They shape ownership, proof, sequencing, and domain judgment; they do
not duplicate the packet or freeze a migration snapshot.

## Skills

| Skill | Use When |
|---|---|
| `civ7-mapgen-workstream` | Taking a map-generation request end-to-end (investigate → design → implement → verify in-game → review → finalize): routing between the technical (recipe structure) and behavioral (physical realism) arms and the generation-logic vs Studio-visualization problem classes. Composes cognition design skills + `civ7-*` skills + live mod source; adds physics/verification/Civ7-domain facets. |
| `civ7-architecture-authority` | Placing code, moving boundaries, changing MapGen stage/step/domain shape, separating core/mod/adapter/generated concerns, or reviewing architecture drift. |
| `civ7-product-authority` | Deciding product/domain ownership, public SDK/CLI/mod behavior, official game-data authority, consumer contract claims, or proof boundaries. |
| `civ7-operational-debugging` | Debugging build/deploy/log/in-game evidence across generated mod output, deployed Civ7 Mods folders, official resources, and proof boundaries. |
| `civ7-orpc-control-architecture` | Placing Civ7 control, play, MapGen-runs, API projection, app composition, and provider boundaries while delegating exact oRPC/Effect mechanics to the published vendor skills. |
| `civ7-play-game` | Playing a live, already-running Civ7 game turn-by-turn via the `civ7` CLI (`bun apps/cli/bin/run.js game …`) and FireTuner: reading priorities/notifications/ready entities and issuing unit, city, research, civic, diplomacy, and end-turn actions. Self-describing read→action loop for a small agent. Not for designing the control surface (`civ7-orpc-control-architecture`) or launching/log debugging (`civ7-operational-debugging`). |

## Global Skills

The following guidance is published by RAWR HQ. Load it from the global
provider under its exact skill name rather than recreating it locally:

- `habitat:workstream-runner`
- `habitat:systematic-workstream`
- `habitat:dual-role-workstream`
- `habitat:workstream-review-loops`
- `habitat:dra-structural-watcher`
- `dev:graphite`
- `dev:orpc`
- `dev:effect-orpc`
- `dev:effect-ts`
- `dev:inngest`
- `dev:effect-inngest`
- `dev:refactor-typescript`

## Operating Rules

- Read the root `AGENTS.md` first, then the closest subtree `AGENTS.md` for files being touched.
- Load the smallest skill set that covers the work.
- Create or retain a local skill only when it contributes Civ7-specific durable authority. Compose global skills for vendor, language, tooling, or Habitat substrate/workstream guidance instead of copying them.
- Keep `SKILL.md` files lean. Put deeper rules in `references/` and copy-forward templates in `assets/`.
- Do not store temporary workstream state in these skills. Use `docs/projects/<project>/...` for project state and phase artifacts.
- Use `openspec/` for implementation change records once a project slice becomes an OpenSpec workstream.
- Update a skill only when durable authority changes.
