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
| `civ7-architecture-authority` | Placing code, moving boundaries, changing MapGen stage/step/domain shape, separating core/mod/adapter/generated concerns, or reviewing architecture drift. |
| `civ7-product-authority` | Deciding product/domain ownership, public SDK/CLI/mod behavior, official game-data authority, consumer contract claims, or proof boundaries. |
| `civ7-open-spec-workstream` | Running a bounded spec/workstream phase from authority grounding through implementation, verification, downstream realignment, and handoff. |

## Operating Rules

- Read the root `AGENTS.md` first, then the closest subtree `AGENTS.md` for files being touched.
- Load the smallest skill set that covers the work.
- Keep `SKILL.md` files lean. Put deeper rules in `references/` and copy-forward templates in `assets/`.
- Do not store temporary workstream state in these skills. Use `docs/projects/<project>/...` for project state and phase artifacts.
- Use `openspec/` for implementation change records once a project slice becomes an OpenSpec workstream.
- Update a skill only when durable authority changes.
