id: LOCAL-TBD-PR-M4-007
title: earthlike studio typegen + preset schema fix
state: landed
priority: 2
estimate: 4
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, maps, studio, presets]
parent: null
children: []
blocked_by: []
blocked: []
related_to: [LOCAL-TBD-PR-M4-005, LOCAL-TBD-PR-M4-006]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Keep MapGen Studio + recipe typegen stable by ensuring authored presets (notably Earthlike) remain schema-valid after Foundation compile-surface changes.

This work exists because architecture-first Foundation changes removed legacy/sentinel compile paths and changed the expected authored config shape; Studio typegen and/or Studio boot paths surfaced crashes when presets drifted out of schema.

## Deliverables
- Earthlike preset/config is schema-valid under the current Standard recipe contract.
- Studio recipe build/typegen is green for `mods/mod-swooper-maps`.
- Verification commands are explicit and promoted into guardrail posture (owned by M4-005 / M4-006).

## Acceptance Criteria
- [ ] `bun run --cwd mods/mod-swooper-maps build:studio-recipes` passes.
- [ ] `bun run dev:mapgen-studio` boots without crashing due to recipe/preset schema drift.
- [ ] `bun run --cwd mods/mod-swooper-maps test test/config/studio-presets-schema-valid.test.ts` passes.
- [ ] Earthlike preset does not rely on legacy `foundation.*` keys (knobs-only + decomposed subtrees).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run dev:mapgen-studio` (smoke)
- `bun run --cwd mods/mod-swooper-maps test test/config/studio-presets-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`

## Dependencies / Notes
- This slice landed as `codex/prr-m4-s06e-earthlike-studio-typegen-fix` (PR #1333).
- Follow-on work (retuning + docs parity) remains under `LOCAL-TBD-PR-M4-006`.

