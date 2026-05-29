# Validation Checks

## Skill Validation

- `SKILL.md` frontmatter contains only `name` and `description`.
- Trigger description is specific to Civ7 workstreams and OpenSpec-style phases.
- `SKILL.md` links every reference and asset.
- References provide depth without duplicating active project plans.
- Assets are copy-forward templates, not hidden documentation.
- The skill states that specs/OpenSpec artifacts are downstream of product and architecture authority.
- The skill routes implementation changes to `openspec/changes/<change-id>/` and repo validation through `bun run openspec:validate`.
- Failure patterns and ask/stop rules are explicit.

## Phase Readiness

Before implementation:

- controlling authority refs are named;
- owners and forbidden owners are explicit;
- write set and protected paths are explicit;
- tasks are implementation steps, not open questions;
- shortcut language is removed or explicitly authorized;
- review lanes have results or are declared not applicable;
- verification gates match the closure claim.

## Shortcut Scan

Reject phase artifacts before implementation when these appear as allowed strategy:

- shim;
- fallback;
- temporary;
- dual path;
- support both;
- compatibility until later;
- silent skip;
- optional target shape;
- only if needed;
- generated artifact hand-edit;
- shared/common/support dumping ground.

These words may appear in forbidden-language sections or failure-pattern docs.

## Closure Validation

Before close:

- tasks match implemented work;
- material findings are dispositioned;
- accepted blockers are repaired;
- focused gates ran and results are recorded;
- OpenSpec validation ran for changed OpenSpec artifacts;
- `git diff --check` passes;
- downstream realignment is complete;
- agent fleet state is complete;
- repo and Graphite state are recorded;
- repo is clean or dirty state is handed off in `next-packet.md`.
