id: LOCAL-TBD-PR-M3-011
title: Canonical docs sweep: ecology architecture + config reference completeness post M3 cutover
state: planned
priority: 3
estimate: 8
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-010]
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Sweep and harden canonical ecology docs so the post-cutover architecture and config surfaces are accurate, complete, and directional.

## Deliverables
- Update canonical (non-archived) ecology docs to reflect current M3 architecture and invariants:
  - ops atomic; steps orchestrate; no ops calling ops
  - score-then-plan determinism posture (seeded tie-break only)
  - artifact contracts and stage boundaries after stage split
- Ensure config properties are documented:
  - every config property has description (schema) and JSDoc where appropriate
- Ensure default preset/config and documented defaults match (no drift).

## Acceptance Criteria
- [ ] Canonical docs updated (no new archives) and aligned with current code + presets.
- [ ] All ecology config surfaces that are exposed in recipe schemas have descriptions.
- [ ] Build is green (docs changes must not break schema builds).

## Testing / Verification
- `bun run build`
- (If docs changes touch schemas/contracts) `bun --cwd mods/mod-swooper-maps test test/ecology`

## Dependencies / Notes
- Blocked by: `LOCAL-TBD-PR-M3-010`
- Do not move durable spec detail into issues; keep canonical truth in `docs/system/**` and link from Linear.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

