id: LOCAL-TBD-PR-M2-001
title: Preflight: parity baselines + viz-key inventory gate
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M2-ecology-architecture-alignment
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: []
blocked: [LOCAL-TBD-PR-M2-002, LOCAL-TBD-PR-M2-014]
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Establish the deterministic parity posture that this milestone will use to prove “no behavior change.”

## Deliverables
- Extracted from the M2 milestone doc; see Implementation Details for the full preserved spec body.
- Execute in slice order as defined in the milestone index.

## Acceptance Criteria
- [ ] Gate G0 is green (build+tests).
- [ ] A fixed-seed ecology dump can be produced via `diag:dump` and inspected via `diag:list`.
- [ ] A baseline ecology `dataTypeKey` inventory is produced as a deterministic artifact (small text/JSON) suitable for diffing.

## Testing / Verification
- Run Gate G0.
- Run Gate G3.
- Run Gate G4.

## Dependencies / Notes
- Blocked by: (none)
- Blocks: `LOCAL-TBD-PR-M2-002`, `LOCAL-TBD-PR-M2-014`
- Paper trail:
  - `$SPIKE/HARDENING.md`
  - `$SPIKE/DECKGL-VIZ.md`

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Source (Extracted From Milestone, Preserved)

Establish the deterministic parity posture that this milestone will use to prove “no behavior change.”

**Acceptance Criteria**
- [ ] Gate G0 is green (build+tests).
- [ ] A fixed-seed ecology dump can be produced via `diag:dump` and inspected via `diag:list`.
- [ ] A baseline ecology `dataTypeKey` inventory is produced as a deterministic artifact (small text/JSON) suitable for diffing.

**Scope boundaries**
- In scope: diagnostics harness plumbing needed to make a stable inventory + diff gate.
- Out of scope: changing any domain behavior.

**Verification**
- Run Gate G0.
- Run Gate G3.
- Run Gate G4.

**Implementation guidance**
- Complexity: medium (tooling + determinism).

```yaml
files:
  - path: $MOD/src/dev/diagnostics/list-layers.ts
    notes: Confirm it can emit a stable machine-readable inventory (or add a small helper).
  - path: $MOD/src/dev/diagnostics/diff-layers.ts
    notes: Ensure ecology-owned layers are included and diffs are readable.
  - path: $MOD/src/dev/diagnostics/run-standard-dump.ts
    notes: Confirm stable labeling and output paths.
  - path: $SPIKE/HARDENING.md
    notes: Keep this doc aligned; it is the parity guide.
```

**Paper trail**
- `$SPIKE/HARDENING.md`
- `$SPIKE/DECKGL-VIZ.md`

### Prework Results (Resolved)

Decision: use a **diff-friendly, stable text inventory** derived from the viz dump `manifest.json`.

- Inventory format: newline-delimited UTF-8 text, sorted, one entry per unique key:
  - `<dataTypeKey>|<spaceId>|<kind>`
- Include prefixes (Ecology surface area per `$SPIKE/DECKGL-VIZ.md`):
  - `ecology.`
  - `map.ecology.`
  - `debug.heightfield.`
- Baseline generation (fixed seed, deterministic):
  1. Produce a run dir:
     - `bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label ecology-vizkeys-baseline`
  2. Extract keys from `<runDir>/manifest.json` (example; implement as a tiny script in `LOCAL-TBD-PR-M2-001`):
     - read `manifest.layers[]`
     - filter by prefixes above
     - emit sorted unique `<dataTypeKey>|<spaceId>|<kind>`
- CI posture: check in a baseline inventory file under test fixtures (e.g. `mods/mod-swooper-maps/test/fixtures/viz-keys/ecology-vizkeys-v1.txt`) and diff against the newly generated inventory.

 
