id: LOCAL-TBD-PR-M3-008
title: Projection strictness: features-apply stamping must not drop placements or randomly gate (add gates)
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M3-ecology-physics-first-feature-planning
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: [LOCAL-TBD-PR-M3-004, LOCAL-TBD-PR-M3-005, LOCAL-TBD-PR-M3-006, LOCAL-TBD-PR-M3-007]
blocked: [LOCAL-TBD-PR-M3-009]
related_to: [LOCAL-TBD-PR-M2-015]
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Make projection stamping (`map-ecology/features-apply`) a strict deterministic materialization layer: it must not probabilistically gate or silently drop truth placements, and it must be guarded by explicit gates.

## Deliverables
- `map-ecology/features-apply`:
  - no RNG usage
  - deterministic application order
  - explicit accounting of any rejected placements (fail gates)
- Gates exist to prevent projection from masking planner bugs:
  - if stamping rejects placements, the run fails in tests/diagnostics

## Acceptance Criteria
- [ ] `features-apply` does not contain chance/multiplier gating.
- [ ] Projection stamping either:
  - succeeds exactly, or
  - fails loudly (test/diag), with actionable rejection report.
- [ ] The gate is enforced in CI-style checks for the mod test suite.

## Testing / Verification
- `bun --cwd mods/mod-swooper-maps test test/ecology`
- Determinism probe:
  - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label m3-stamp`
  - rerun and `diag:diff` is empty
- Static scan:
  - `rg -n \"rollPercent|chance\\b|createLabelRng\\(\" mods/mod-swooper-maps/src/domain/ecology/ops/features-apply | cat`

## Dependencies / Notes
- Blocked by: all four family planners (needs truth plan artifacts).
- Blocks: final deletion and cleanup issue.

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Breadcrumbs

```yaml
files:
  - path: mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/**
    notes: Current application strategies may be RNG/weight based; M3 makes this pure stamping.
  - path: docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/TOPOLOGY.md
    notes: Projection semantics are locked here.
```

