# ORCH-PLAN — M4 Second Leg (M4-004 lane split + M4-006 config/presets/docs parity)

## Goal and rails (non-negotiable)

**Milestone index:** `docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`

**Second leg scope (what remains):**
1. **M4-004 / S07**: hard-cut *map-facing Foundation projection artifacts* from `artifact:foundation.*` → `artifact:map.foundation*`, with complete downstream rewires and **no dual publish**.
2. **M4-006 / S08 + S09**: config taxonomy redesign + preset retuning (earthlike explicitly) + docs/comments/schema parity + final no-legacy token purge + verification.

**Architecture rails (must-read, treat as “laws”):**
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

**Locked posture:**
- No compatibility shims/bridges in final merged state.
- No dual publish for S07 (atomic cutover).
- Steps orchestrate; ops do not orchestrate peer ops.
- Truth vs projection boundary holds: projection artifacts are `artifact:map.*` (gameplay-owned) and truth remains engine-agnostic.
- Graphite-first workflow; work from the true stack tip; do not leave dirty worktrees.

**Search rails:**
- Use `$narsil-mcp` for semantic/structural search.
- **Do not use `hybrid_search`** (it crashes the server in this setup).
- Use `rg` for exact-string audits (artifact tags, legacy tokens, denylist scans).

## Stack / branch map (S07/S08/S09)

**Starting tip:** `codex/agent-ORCH-m4-reanchor-docs` (PR #1343).

Planned second-leg branches (one logical PR per branch):
- `codex/prr-m4-s07-lane-split-map-artifacts-rewire` (implements `LOCAL-TBD-PR-M4-004`)
- `codex/prr-m4-s08-config-redesign-preset-retune` (implements first half of `LOCAL-TBD-PR-M4-006`)
- `codex/prr-m4-s09-docs-comments-schema-legacy-purge` (implements second half of `LOCAL-TBD-PR-M4-006`)

Branch discipline:
- Keep each branch green independently (tests/build).
- Prefer one commit per branch; use `gt modify -a` for iteration.
- Submit with `gt submit --stack --publish --ai` (update with `--update`).

## Agent roster (owners + deliverables + check-in expectations)

**Maximum threads:** 6.

### S07 agents (run in parallel)

**Agent S07-A — Inventory + contract map (read-mostly)**
- Ownership: exhaustive consumer inventory for `artifact:foundation.{plates,tileToCellIndex,crustTiles,tectonicHistoryTiles,tectonicProvenanceTiles}` across runtime + tests + docs that will change in S07.
- Deliverable: checklist (paths + identifiers) and the “no matches remain” target scans.
- Check-in: scratchpad updates at least once per hour until done.

**Agent S07-B — Lane split implementer (primary coder)**
- Ownership: implement S07 end-to-end as an atomic change (artifacts, contracts, consumers, tests, docs).
- Deliverable: code changes staged on `codex/prr-m4-s07-lane-split-map-artifacts-rewire`, plus a proof block with verification commands run.
- Check-in: scratchpad updates at meaningful milestones (inventory confirmed, compile fixed, tests passing).

**Agent S07-C — Verification gatekeeper (tests/CI)**
- Ownership: run the verification suite for S07, fix failures caused by the cut, and prove green.
- Must include: `bun run --cwd mods/mod-swooper-maps build:studio-recipes`.
- Deliverable: proof transcript (commands + summary), plus any follow-up fixes staged into the S07 branch.

### S08/S09 agents (start once S07 is green or while S07 is stabilizing)

**Agent S08-A — Config taxonomy + schema**
- Ownership: implement config taxonomy redesign + preset retuning (earthlike) and schema/test updates.
- Deliverable: S08 branch green with the verification suite in `LOCAL-TBD-PR-M4-006`.

**Agent S09-A — Docs/parity + legacy purge**
- Ownership: docs/comments/schema parity sweep, minimal rewriting, enforce “truthful docs”.
- Deliverable: S09 branch green with `lint:mapgen-docs` and token denylist checks.

## Merge/submit protocol (Graphite)

1. Preflight: `gt log short` and `git status --porcelain=v1 -b` in the active worktree.
2. If tip moved: use `gt move` to put the active branch back on the stack tip before any new work.
3. Implement in small, self-contained branches (S07 then S08 then S09).
4. Submit stack: `gt submit --stack --publish --ai` (use `--update` for iteration).
5. Never leave worktrees dirty at handoff boundaries (commit or stash explicitly).

## Verification gates (commands + pass/fail expectations)

### S07 (M4-004) gates (must be green before submitting)
- `bun run lint`
- `bun run lint:adapter-boundary`
- `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
- `bun run check`
- `bun run test:architecture-cutover`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- Legacy projection ids must be absent:
  - `rg -n "artifact:foundation\\.(plates|tileToCellIndex|crustTiles|tectonicHistoryTiles|tectonicProvenanceTiles)" mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages/mapgen-core/src/core/types.ts`
  - Expectation: **no matches**

### S08/S09 (M4-006) gates (final closeout)
- `bun run test:ci`
- `bun run lint:mapgen-docs`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- Schema validation tests (per `LOCAL-TBD-PR-M4-006`)
- Earthlike probes (per `LOCAL-TBD-PR-M4-006`)
- Docs denylist scans (per `LOCAL-TBD-PR-M4-006`)

## Decision log triggers (when to stop + reopen design)

Stop and reopen design *only* if:
- The lane split cannot be implemented atomically without dual publish or fallback reads.
- A truth domain is forced to consume `artifact:map.*` or `effect:map.*` as an input (boundary violation).
- CI/Studio gates reveal compile/authoring contracts are not stable enough to proceed without architectural changes.

