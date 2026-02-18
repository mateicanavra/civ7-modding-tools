id: LOCAL-TBD-PR-M4-006
title: config redesign + preset retuning + docs cleanup
state: planned
priority: 2
estimate: 16
project: pipeline-realism
milestone: M4-foundation-domain-axe-cutover
assignees: [codex]
labels: [pipeline-realism, config, docs]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M4-004, LOCAL-TBD-PR-M4-005]
blocked: []
related_to: [LOCAL-TBD-PR-M4-002, LOCAL-TBD-PR-M4-003]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Finalize the cutover with a physics-first config model, intent-fit preset retuning (including earth-like), and complete docs/comments/schema parity updates.

## Deliverables
- Config taxonomy distinguishing physics inputs vs internal math tuning values.
- Grouped high-level author knobs preserved and documented.
- Preset/default retuning matrix aligned to map intent (earth-like explicitly included).
- Documentation sweep: milestone/issue references, schema descriptions, inline comments (`js.comments` and adjacent inline docs), and canonical domain docs.

## Acceptance Criteria
- [ ] Dead/inert config fields are removed from target config surfaces.
- [ ] New config structure is documented with grouped author-facing knobs.
- [ ] Presets/defaults are audited and retuned by intent, including explicit earth-like fit checks.
- [ ] Docs/comments/schema descriptions are synchronized with final contracts.
- [ ] Earth-like measurable intent checks pass (`ELIKE-01` water balance, `ELIKE-02` landmass structure, `ELIKE-03` morphology presence, `ELIKE-04` ecology variety).
- [ ] Canonical `docs/system` mapgen references and project docs contain no stale legacy/sentinel terms for Foundation cutover.
- [ ] Final no-legacy scan and `bun run test:ci` are green.

## Testing / Verification
- `bun run test:ci`
- `bun run lint:mapgen-docs`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd mods/mod-swooper-maps test test/config/presets-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/config/maps-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/config/studio-presets-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/m11-config-knobs-and-presets.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/morphology/earthlike-coasts-smoke.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/ecology/earthlike-balance-smoke.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/mountains-nonzero-probe.test.ts`
- `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label m4-006-earthlike --configFile ./src/maps/configs/swooper-earthlike.config.json`
- `bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDir>`
- `rg -n "TODO|legacy|shim|dual|shadow" docs/projects/pipeline-realism/resources/spec docs/projects/pipeline-realism/milestones docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-* docs/system/libs/mapgen`
- `! rg -n -f scripts/lint/no-legacy-m4-foundation-tokens.txt docs/projects/pipeline-realism/resources/spec docs/projects/pipeline-realism/milestones docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-* docs/system/libs/mapgen mods/mod-swooper-maps/src`
- `rg -n "profile|knob|physics|earth-like" docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`
- `bun run --cwd mods/mod-swooper-maps check`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M4-004`, `LOCAL-TBD-PR-M4-005`
- Related: `LOCAL-TBD-PR-M4-002`, `LOCAL-TBD-PR-M4-003`
- Paper trail: `docs/projects/pipeline-realism/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Path map
```yaml
files:
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    notes: stage config compile surface
  - path: mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts
    notes: explicit earth-like intent fit target
  - path: docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md
    notes: contract/spec parity updates
  - path: docs/system/libs/mapgen/reference/domains
    notes: domain reference synchronization
```

### Prework Findings (Complete)
1. Retuning is explicitly sequenced after structural cutover.
2. Config redesign constraints are locked by planning decisions and spike findings.
