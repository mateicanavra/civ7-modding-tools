id: LOCAL-TBD-PR-M3-001
title: Packet hardening: M3 ecology physics-first topology + contracts + gates (decision-complete)
state: planned
priority: 1
estimate: 8
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: []
blocked: [LOCAL-TBD-PR-M3-002, LOCAL-TBD-PR-M3-003, LOCAL-TBD-PR-M3-004, LOCAL-TBD-PR-M3-005, LOCAL-TBD-PR-M3-006, LOCAL-TBD-PR-M3-007, LOCAL-TBD-PR-M3-008, LOCAL-TBD-PR-M3-009]
related_to: [LOCAL-TBD-PR-M2-016]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Produce a decision-complete M3 packet (authority) that can be converted into a milestone and issue set with zero remaining "black ice".

## Deliverables
- Packet exists and is internally consistent:
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/README.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/VISION.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/ARCHITECTURE.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/TOPOLOGY.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/CONTRACTS.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/EXECUTION-PLAN.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/DECISIONS.md`
  - `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/M2-REMEDIATION-MAP.md`
- Milestone derived from packet:
  - `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
- Local M3 issue docs exist and have no prework prompts:
  - `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`

## Acceptance Criteria
- [ ] Packet locks (no TBD):
  - stage order + step topology
  - `artifact:ecology.scoreLayers` schema + layer inventory
  - occupancy/conflict model + ordering (ice -> reefs -> wetlands -> vegetation)
  - explicit bans: chance/multipliers, disabled strategies, silent skips, ops-calling-ops
- [ ] Packet explicitly addresses the "steps orchestrate; ops plan; steps may emit viz; no viz-only steps" posture.
- [ ] Packet is consistent with MapGen contract vocabulary (stage/step/op/artifact/tags/config compilation vs plan compilation).

## Testing / Verification
- Docs sanity:
  - `rg -n \"TBD\" docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first`
  - `rg -n \"^## Prework Prompt \\(Agent Brief\\)$\" docs/projects/pipeline-realism/issues | rg \"PR-M3\" || true`

## Dependencies / Notes
- Blocks: all M3 implementation issues.
- Related: M2 doc alignment pointers in `LOCAL-TBD-PR-M2-016`.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Tooling posture (for later issues)
- Prefer `$narsil-mcp` for semantic discovery when needed; do not use `hybrid_search`.
- Keep the primary checkout (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools`) on the latest commit to keep the index fresh (detached HEAD is OK).
