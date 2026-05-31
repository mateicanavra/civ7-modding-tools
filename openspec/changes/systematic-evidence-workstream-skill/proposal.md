## Why

The resource-distribution recovery succeeded because it stopped treating a broad
map-quality regression as a tuning task. The workstream framed the objective,
isolated a clean Graphite stack, diagnosed the root cause, extracted the full
official corpus, predeclared physically grounded expectations, translated those
expectations into architecture-aligned operations, verified local statistics,
proved runtime behavior through the current FireTuner socket/API restart path,
and closed each slice with explicit review and proof boundaries.

That method is durable repo knowledge. It should be captured in a reusable
repo-local skill so future systematic tasks, including features, biomes,
brushing, ecology, terrain, tile types, trees, and woodlands, can reuse the same
operational pattern without rewriting a resource-specific prompt.

## Target Authority Refs

- Direct user objective for this workstream: create a generic, operationally
  specific repo-local skill seeded by the resource-distribution session and
  reviewed by fresh framed agents.
- Root `AGENTS.md`: keep durable process knowledge in canonical docs or
  project-owned guidance; use Graphite stacks; keep worktrees clean.
- `.agents/skills/README.md`: repo-local skills are durable operating guidance,
  not project status.
- `.agents/skills/civ7-open-spec-workstream/SKILL.md`: bounded workstreams
  require phase records, review disposition, downstream realignment, validation,
  and clean closure.
- `openspec/changes/resource-distribution-planning/**` and
  `openspec/changes/resource-runtime-proof/**`: seed evidence for the method.
- `docs/projects/systematic-workstream-skill/request-capture.md`: parsed user
  intent and framed objective.

## What Changes

- Add `.agents/skills/civ7-systematic-workstream/` as a repo-local skill.
- Keep `SKILL.md` compact and route detailed procedures into references.
- Add a copy-forward frame template for future systematic workstream openings.
- Update `.agents/skills/README.md` so future agents can discover the skill.
- Record this skill-creation effort as an OpenSpec workstream with review,
  validation, and closure records.

## Requires

- Work remains on `codex/systematic-evidence-workstream-skill` above
  `codex/systematic-workstream-skill-framing`.
- Existing resource-distribution records remain available under
  `openspec/changes/resource-*`.
- Fresh peer agents provide evidence/review; prior resource-workstream agents
  are not reused.

## Enables Parallel Work

- Future systematic feature, biome, brushing, terrain, tile-type, ecology, and
  resource workstreams can invoke one durable skill rather than reconstructing
  the method from chat history.
- The resource-distribution method becomes reviewable and updateable as a
  repo-local process artifact.

## Write Set

- `.agents/skills/civ7-systematic-workstream/**`
- `.agents/skills/README.md`
- `openspec/changes/systematic-evidence-workstream-skill/**`

## Protected Paths

- Production source and generated output.
- `.civ7/outputs/resources/**`
- Existing resource-distribution OpenSpec records, except read-only evidence.
- Main worktree dirty files.

## Stop Conditions

- The draft collapses into vague "be systematic" advice.
- The draft becomes resource-only and cannot apply to features, biomes, or
  brushing without rewriting.
- Required proof boundaries blur local commit, Graphite submit, PR state,
  runtime proof, and final product proof.
- Fresh-agent review returns accepted P1/P2 findings that remain unrepaired.

## Verification Gates

- Fresh framed-agent evidence/review is recorded in the phase record.
- Skill frontmatter and links pass local validation by inspection/search.
- `bun run openspec -- validate systematic-evidence-workstream-skill --strict`
- `bun run openspec:validate`
- `git diff --check`
- Graphite local commit leaves the worktree clean.
