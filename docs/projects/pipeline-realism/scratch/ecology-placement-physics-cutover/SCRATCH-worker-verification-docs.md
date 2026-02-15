# SCRATCH Worker E — Verification, Metrics, Docs

## Ownership
- Slice: S6
- Branch: `codex/prr-epp-s6-hardening-docs-tests`
- Focus: Determinism/replay metrics gates, no-legacy scans, docs+ADR finalization.

## Working Checklist
- [ ] Add seed matrix and earth metrics tests.
- [ ] Extend deterministic replay and parity tests.
- [ ] Extend static scan for scoped random/fudge bans.
- [ ] Update docs/system + project spec/plan docs.
- [ ] Add ADR for physics-first ecology+placement cutover.

## Decision Log
- None yet.

## Recent Audit Notes (2026-02-14)

### Determinism / parity surface
- `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts` already exercises the canonical pipeline: it runs `standardRecipe`/`runValidationHarness` twice per case from `test/support/determinism-suite.ts` and diffs `M1_TIER1_ARTIFACT_IDS` fingerprints, making it a good starting point for adding new ecology-specific cases.
- `mods/mod-swooper-maps/test/support/determinism-suite.ts` defines the `M1_DETERMINISM_CASES` seed/config matrix; extend this matrix with the seed+config combinations that target the new score-layers + planning stages so the fingerprint diff logic continues to cover them.
- `mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` already repeats `computeTectonicSegments.run` and asserts identical regime/polarity/compression/extension/shear arrays; this pattern can be reused to lock other physics-only ops that the ecology cutover now depends on.

### Static-scan / no-fudge posture
- `mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts` walks every `.ts`/`.json` file under the ecology stage roots and fails if it finds `rollPercent`, `coverageChance`, any `chance` (case-insensitive), or `multiplier` tokens; the set of roots includes every truth ecology stage plus `map-ecology` so the no-fudge policy already spans the core domain.
- `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md` acceptance criteria explicitly call out “static scan gates show no chance/multiplier gating in truth planning,” mapping nicely to the test and providing a location to document any future scan additions (e.g., new patterns or directories).
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/EXECUTION-PLAN.md` says “No-fudging is enforced by static scans + runtime invariants” and lists the diag dump/diff commands; consider referencing this file when describing the enforcement surface in higher-level docs.
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/RUNBOOKS/PHASE-7-prework-sweep.md` lists “GATES: propose the static scan allowlist approach for ‘no-fudging’ enforcement,” so keep this runbook in sync if the scan or patterns evolve.

### ADR locations needing updates for the physics-first cutover
- `docs/system/ADR.md` (global MapGen ADR log) should gain a short entry linking this cutover to the rest of the system. Add a decision (or extend the index) noting that the ecology M3 cutover is the “physics-first score-layers → deterministic planner → projection stamping” spine, reinforced by the new static scan and determinism gate requirements, so the global architecture log remembers the tight no-fudge/determinism posture.
- `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md` should reference the same addition: add a line to the index and a new ADR file (e.g., `adr-er1-037-ecology-physics-first-score-planning-gate.md`) capturing the decision to treat ecology planning as deterministic, to require `artifact:ecology.scoreLayers`, and to gate the cutover with existing static scans + diag diff runs.
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-014-core-principles-taskgraph-pipeline-context-owned-state-offline-determinism.md` would benefit from a short “Consequences” bullet that explicitly mentions the new slices: score-layers must be deterministic, planning steps must not rely on chance/multiplier gates, and the diag diff + static scan tooling are the enforcement mechanisms for this cutover.
