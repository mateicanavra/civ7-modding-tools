## 2026-02-15 — Tectonics step/contract remediation (decomposed ops alignment)

### Plan
1. Verify step-orchestrates rules and decomposed-op intent from required spec/issue docs.
2. Remove any step dependency on op-internal implementation defaults.
3. Ensure per-era op calls use the step’s declared contract config envelopes (truthful contract surface).
4. Keep contract aligned to actual usage; avoid adding/removing ops unless behavior demands it.
5. Run focused tests for decomposed-op guardrails and compile/contract behavior.

### Evidence
```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
observations:
  - Steps orchestrate ops; they should not import/call op internals.
  - Strategy selection belongs in op config envelopes surfaced through step contracts.
  - Compile-first posture expects explicit, truthful config surfaces (no hidden runtime config paths).
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md
observations:
  - Deliverable calls for step-owned orchestration and decomposed-op boundary clarity.
  - Contract surfaces should remove drift/dead config paths and reflect real decomposed usage.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
before:
  - Imported DEFAULT_PLATE_MOTION_CONFIG and DEFAULT_TECTONIC_SEGMENTS_CONFIG from an op-internal library path.
  - Era-loop computePlateMotion/computeTectonicSegments calls bypassed step config via local constant envelopes.
after:
  - Internal op-lib import removed.
  - Era-loop calls now use config.computePlateMotion and config.computeTectonicSegments.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts
observations:
  - Contract already declares the decomposed chain (computePlateMotion, computeTectonicSegments, computeEraPlateMembership, computeSegmentEvents, computeHotspotEvents, computeEraTectonicFields, computeTectonicHistoryRollups, computeTectonicsCurrent, computeTracerAdvection, computeTectonicProvenance).
  - No contract edits were required once step runtime stopped bypassing declared config.
```

### Edits
- File changed:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts`
- File intentionally unchanged (already aligned):
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts`

Concrete delta in `tectonics.ts`:
- Removed cross-op internal import of default configs.
- Removed local strategy constants that created a hidden runtime config lane.
- Rewired per-era recomputation to declared step config:
  - `ops.computePlateMotion(..., config.computePlateMotion)`
  - `ops.computeTectonicSegments(..., config.computeTectonicSegments)`

### Verification
Command:
- `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/m11-config-knobs-and-presets.test.ts`

Result:
- 16 passed, 0 failed.
- Includes contract guardrails, no-op-calls-op guardrails, and foundation compile/knob tests.

### Proposed target
- Tectonics step remains pure orchestrator of decomposed ops.
- Step runtime consumes only its declared op envelopes; no op-internal config imports.
- Contract surface remains truthful to actual runtime usage and compile-time envelopes.

### Changes landed
- Removed op-internal default import path from tectonics step.
- Era-loop op calls now use declared step config envelopes.
- Maintained existing decomposed contract surface without adding hidden paths.

### Open risks
- Era-loop now honors any authored override for `computePlateMotion`/`computeTectonicSegments`; this is desired for truthfulness but broad overrides can change both snapshot and history behavior together.

### Decision asks
- Confirm whether coupling snapshot + era-loop motion/segment config is the intended long-term behavior, or whether the product wants separate explicit envelopes for historical replay tuning in a future slice.
