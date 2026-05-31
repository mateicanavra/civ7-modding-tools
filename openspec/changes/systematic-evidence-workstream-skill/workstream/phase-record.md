# Phase Record: Systematic Evidence Workstream Skill

## Objective

Create a reusable repo-local skill that captures the systematic,
evidence-grounded method proven during resource distribution recovery while
remaining useful for future Civ7 domains such as features, biomes, brushing,
ecology, terrain, tile types, trees, and woodlands.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-systematic-workstream-skill-framing`
- Branch: `codex/systematic-evidence-workstream-skill`
- Parent slice: `codex/systematic-workstream-skill-framing`
- Base evidence branch: `codex/resource-runtime-proof`
- Existing main worktree dirty state: left untouched in
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`.
- In-app thread tool state: `codex_app.list_threads` was exposed but returned
  `No handler registered for tool: list_threads`; fallback evidence uses
  `rawr sessions` and repo records.

## Evidence Sources

- Session file:
  `/Users/mateicanavra/.codex/sessions/2026/05/31/rollout-2026-05-31T02-28-34-019e7cb8-51db-7d31-aa9a-83f862fef76b.jsonl`
- Request capture:
  `docs/projects/systematic-workstream-skill/request-capture.md`
- Resource planning:
  `openspec/changes/resource-distribution-planning/**`
- Resource runtime proof:
  `openspec/changes/resource-runtime-proof/**`
- Repo-local skill conventions:
  `.agents/skills/README.md` and `.agents/skills/*/SKILL.md`
- Skill authoring guidance:
  `/Users/mateicanavra/.agents/skills/skill-authoring/SKILL.md` and
  `/Users/mateicanavra/.codex/skills/.system/skill-creator/SKILL.md`

## Team

Fresh agents only. Prior resource agents from the transcript are not reusable in
this runtime; close attempts on known old IDs returned `not found`.

Active evidence wave:

- Ramanujan: session-method extractor.
- Peirce: repo skill prior-art reviewer.
- Aquinas: Civ7/OpenSpec workflow mapper.
- Dewey: information-design reviewer.
- Sagan: operational-risk and proof-boundary reviewer.
- Hegel: future-use stress tester.

Each prompt used a framing-design shape: objective, hard core, scope, exterior,
falsifier, and output contract.

## Agent Findings Integrated

- Ramanujan: extracted 12 primitives from the session and resource records:
  frame, isolate, plan first, diagnose, extract corpus, group rows, research
  expectations, translate into architecture, slice through OpenSpec/Graphite,
  verify stats, prove runtime separately, review, and close with proof labels.
- Peirce: recommended the repo-local target
  `.agents/skills/civ7-systematic-workstream/`, compact `SKILL.md`, one-hop
  references, copy-forward assets, no `agents/openai.yaml` because local prior
  art does not require it, and explicit boundary with
  `civ7-open-spec-workstream`.
- Aquinas: mapped the resource stack into a generic phase map and emphasized
  that `RESOURCE_*`, `55`, and `RESOURCE_PLACEMENT_V1` are examples, not the
  skill's organizing model.
- Dewey: warned not to create a second OpenSpec skill; this skill must own the
  corpus/expectation/stats/runtime-proof evidence loop and keep operator gates
  separate from reference detail.
- Sagan: supplied closure/proof invariants separating local commit, Graphite
  submit, PR delivery, runtime proof, and product proof, plus stale-record audit
  triggers.
- Hegel: stress-tested future domains and found the brushing/stamping weak
  case. The skill now says the canonical corpus may be entities, action
  surfaces, materialization targets, or effect matrices.

## Current Synthesis

The seed method has these load-bearing moves:

1. Frame the workstream before implementation.
2. Isolate repo state and Graphite stack position.
3. Diagnose root cause before tuning.
4. Extract the complete canonical corpus.
5. Group entities into reviewable slices.
6. Predeclare physical/ecological/earthlike expectations.
7. Translate expectations into architecture-aligned operations and artifacts.
8. Implement through OpenSpec/Graphite slices.
9. Verify against local statistics.
10. Prove required behavior through runtime/log evidence tied to exact branch,
    commit, command/path, request id, and bounded logs.
11. Treat agent review findings as phase gates.
12. Close with accurate local-commit, Graphite-submit, PR, runtime-proof, and
    product-proof boundaries.

## Review State

- Evidence wave: complete.
- Draft skill review: complete.
- Accepted P1/P2 findings: repaired.
- P1 findings after repair: none.

## Verification State

- `PYTHONPATH=/tmp/codex-pyyaml python3 /Users/mateicanavra/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/civ7-systematic-workstream`
  passed after installing `PyYAML` into `/tmp/codex-pyyaml` because the default
  Python environments did not include `yaml`.
- Manual frontmatter/link validation passed.
- Non-ASCII scan returned no findings.
- `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec -- validate systematic-evidence-workstream-skill --strict`
  passed.
- `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec:validate`
  passed: 31 items, 0 failed.
- `git diff --check` passed.

## Closure State

- Skill artifact path:
  `.agents/skills/civ7-systematic-workstream/**`.
- Local closure gates are satisfied for this slice.
- This record is included in the Graphite local commit for
  `codex/systematic-evidence-workstream-skill`.
- External Graphite submission/PR delivery remains unclaimed until `gt submit`
  or PR evidence exists.
