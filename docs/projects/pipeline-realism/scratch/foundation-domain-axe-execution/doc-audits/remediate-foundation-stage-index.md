## 2026-02-15 — Foundation Stage Index Remediation (single-file ownership)

### Plan
1. Read required domain + architecture routers and treat stage compile as a strict compile-time lowering boundary.
2. Remove duplicated per-op defaults from stage compile and rely on compiler prefill (`prefillOpDefaults`) + op contract defaults.
3. Keep only author-surface lowering that belongs in this file: profile baseline selection and advanced-to-op transformations.
4. Preserve knobs-last posture by not applying knobs in stage compile (steps own knob transforms in `normalize`).
5. Run focused Foundation compile/guardrail tests.

### Evidence
```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
observations:
  - Steps are orchestration boundaries; compile-time normalization belongs in stage/step/op normalize hooks, not runtime merge shims.
  - Strategies must keep stable IO contracts; stage config should select/shape config, not duplicate algorithm internals.
  - Truth vs projection posture forbids cross-boundary hacks and dual-path compatibility branches.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
observations:
  - File is a router; canonical architecture points to explanation/reference docs.
  - Architecture layering confirms stage role is config compilation boundary, not algorithmic implementation surface.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/AGENTS.md
observations:
  - `src/**` entry surfaces should stay small/declarative.
  - Use package-local bun checks/tests for validation.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/compiler/normalize.ts
observations:
  - `prefillOpDefaults` auto-injects missing op envelopes from op contract defaults.
  - This makes stage-side re-declaration of default op config unnecessary and architecture-smelly.
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
observations:
  - Prior implementation duplicated many op defaults and applied knob-related logic in stage compile.
  - Prior return payload included full default envelopes for most ops where compiler already prefilled defaults.
```

### Edits summary
- Replaced broad duplicated constants (`COMMON_MANTLE_*`, `COMMON_PLATE_MOTION`, `COMMON_TECTONIC_*`, profile crust/mantle default bags) with minimal stage-owned profile baseline data.
- Removed stage compile sentinel fallback (`config.profiles ?? ...`) and knob-driven plate count lowering in compile.
- Added focused lowering helpers:
  - `buildMantlePotentialOverride(...)`
  - `buildCrustOverride(...)`
  - `buildEraPlateMembershipOverride(...)`
- Stage compile now emits only needed overrides:
  - Always profile baseline for `mesh` and `plate-graph`.
  - Conditional advanced overrides for `mantle-potential`, `crust`, `tectonics.computeEraPlateMembership`.
  - Conditional balanced-profile override for `projection`.
- Relied on framework prefill/normalization for all untouched op defaults.
- Verification run:
  - `bun --cwd mods/mod-swooper-maps test test/m11-config-knobs-and-presets.test.ts test/foundation/contract-guard.test.ts`
  - Result: 15 passing, 0 failing.

### Proposed target
- Foundation stage compile remains a thin author-surface lowering boundary.
- No runtime-style merge behavior, no sentinel profile branches, and no duplicated internal/public schema translation layers for unchanged defaults.
- Knobs stay normalize-time concerns in step modules.

### Changes landed
- Single-file remediation completed at:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Compile payload is now minimal and truthful to framework/domain posture.
- Focused compile/guardrail tests pass after change.

### Open risks
- Advanced mantle override schema currently allows `0..128` for counts while lowering clamps to `2..16` for stage policy; this existing policy remains intentionally unchanged but is stricter than schema range.
- `projection` baseline override remains profile-specific (`balanced`) and relies on op defaults for other profiles; behavior is equivalent to prior defaults but now more implicit.

### Decision asks
- Confirm whether advanced mantle count policy should stay stage-clamped (`2..16`) or be aligned to op/schema limits in a follow-up slice.
- Confirm whether projection profile tuning should remain only for `balanced` or be made explicit for all profiles for readability (behaviorally equivalent today).

## 2026-02-15 — Hard-correction rewrite (stage compile as pure routing/lowering)

### Plan
1. Rewrite `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` so compile is routing-only.
2. Remove stage-local normalization/derivation helpers and clamp/lerp logic.
3. Keep compile signature clean in `createStage` (`compile: compileFoundationStage`) and avoid inline manual config typing there.
4. Preserve contract/type compatibility for existing authoring surfaces, then run required checks/tests.

### YAML evidence
```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
removed:
  - clamp imports and clamp/derive normalization helpers
  - stage-local numeric normalization of mantle amplitude/radius selectors
  - stage-local era weight/drift derivation helpers
  - inline compile signature type annotation inside createStage
added:
  - direct advanced->op lowering fields for mantle/crust/tectonics routing
  - explicit era preset routing table for budgets selector (5..8)
  - external compile function binding (`compile: compileFoundationStage`)
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts
compatibility_reason:
  - keeps `advanced.mantleForcing.potentialAmplitude01` typed surface present
  - compile lowers legacy selectors directly (without stage normalization) to preserve authoring DX/tests
```

```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
alignment:
  - steps/ops own normalization behavior
  - stage compile performs compile-time routing/lowering only
```

### Exact rationale for each moved concern
- Concern: numeric clamps/normalization for mantle selectors (`potentialAmplitude01`, `lengthScale01`)
  - Previous behavior: stage converted selector ranges with clamp+lerp.
  - New posture: stage performs field lowering only; selector values route directly into op envelope fields (`plumeAmplitude`, `downwellingAmplitude`, `plumeRadius`, `downwellingRadius`). Any strict range semantics now resolve via schema/op surfaces, not stage math.

- Concern: tectonic era array derivation from `eraCount`
  - Previous behavior: stage derived and normalized `eraWeights`/`driftStepsByEra` programmatically.
  - New posture: stage routes `eraCount` via fixed compile-time preset table (`ERA_MEMBERSHIP_PRESETS`) and passes direct history overrides unchanged. No dynamic normalization helper remains in stage.

- Concern: mesh/lithosphere numeric normalization in stage compile
  - Previous behavior: stage applied clamp-based sanitization.
  - New posture: stage routes authored values + profile defaults directly; constraints/normalization are expected from schema + op/step normalize surfaces.

- Concern: inline compile config typing annotation in createStage signature
  - Previous behavior: manual annotation inside `compile: (...) => ...`.
  - New posture: typed external function (`compileFoundationStage`) is referenced from createStage (`compile: compileFoundationStage`), keeping createStage compile signature free of inline manual typing.

### Edits summary
- Rewrote `foundation/index.ts` around a routing-only compile function and removed stage normalization helpers.
- Kept the surface compatible with type tests by retaining legacy selector keys while lowering without stage math normalization.
- Preserved profile defaults and conditional lowering for `mantle-potential`, `crust`, `tectonics.computeEraPlateMembership`, and balanced projection defaults.

### Verification
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps check`
  - result: pass (`tsc --noEmit` clean)
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test -- test/m11-config-knobs-and-presets.test.ts test/foundation/contract-guard.test.ts`
  - result: 15 passed, 0 failed

### Proposed target
- Foundation stage compile stays declarative and routing-only.
- No stage-local normalization helpers; ops/steps own normalization semantics.

### Changes landed
- Single-file rewrite at:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Scratch audit updated with rationale/evidence at:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/doc-audits/remediate-foundation-stage-index.md`

### Open risks
- Legacy selectors (`potentialAmplitude01`, `lengthScale01`) are now routed directly without stage-range remapping; behavioral scaling differs from previous clamp+lerp implementation.
- Era preset routing keeps deterministic lengths but may differ numerically from prior derived distributions for some counts.

### Decision asks
- Confirm whether legacy mantle selectors should be deprecated in favor of direct op fields only (to remove dual-path lowering).
- Confirm whether era-count preset numbers should remain fixed in stage routing or be migrated to op/step-owned normalization in a dedicated follow-up slice.

## 2026-02-15 — Architecture-first simplification (public/compile removed)

### Applied change
- File rewritten to minimal stage shell:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Removed entirely:
  - stage `public` schema
  - stage `compile`
  - all stage-level defaults/routing/normalization helpers
- Kept:
  - `createStage` with inline `knobsSchema`
  - full original Foundation steps list + order

### YAML evidence
```yaml
path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
before:
  - defined public schema surface for version/profiles/advanced
  - implemented compile-time lowering and default routing
  - contained stage-local compatibility/default logic
after:
  - createStage only
  - inline knobs schema only
  - no public schema
  - no compile
  - no stage defaults/merges/normalization
steps:
  - mesh
  - mantlePotential
  - mantleForcing
  - crust
  - plateGraph
  - plateMotion
  - tectonics
  - crustEvolution
  - projection
  - plateTopology
```

### Rationale
- Enforces architecture-first posture: stage is now a pure container for knobs + step composition.
- Moves all config/default/normalization responsibility out of the stage file by construction.
- Accepts temporary authored config compatibility break as directed.
