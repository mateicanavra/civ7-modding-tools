---
name: civ7-architecture-authority
description: |
  Use in the Civ7 Modding Tools repo when deciding architecture authority, package or module ownership, MapGen stage/step/domain boundaries, generated artifact boundaries, adapter/core/mod separation, docs authority routing, or "where should this logic live". Trigger phrases include "what owns this code", "where should this logic live", "is this MapGen core or mod code", "can adapter import this", "is this generated output", "does this belong in docs/system or docs/projects", "fix architecture drift", and "before refactoring this boundary". Pair with civ7-product-authority when product/domain behavior or consumer-facing contracts are changing.
---

# Civ7 Architecture Authority

## Purpose

Use this skill before and during structural changes in Civ7 Modding Tools. It keeps agents aligned to the repo's durable ownership model: controlling docs and accepted project baselines route authority, packages own distinct concerns, generated artifacts are outputs, official game resources are evidence, and current code is implementation evidence rather than target architecture.

For MapGen / Swooper Maps normalization work, the active baseline is
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md`. This
skill frames implementation against that packet; it should not restate it as a
second spec.

This skill is not a task list and does not replace the active project plan. It is the architecture guardrail layer for code and docs changes.

## When To Use

- Moving code between packages, mods, apps, or domain folders.
- Changing MapGen stages, steps, recipes, artifacts, domains, or config contracts.
- Touching `@swooper/mapgen-core`, `@civ7/adapter`, `@civ7/sdk`, CLI/plugin packages, MapGen Studio, or generated mod output boundaries.
- Reconciling stale docs, routers, or stage ids with live architecture.
- Responding to guard, lint, typecheck, or test failures that appear to imply a structural change.

## Non-Goals

- Do not use this as a migration plan or project status log.
- Do not use it to preserve current file topology when canonical docs or accepted decisions say otherwise.
- Do not use it to justify behavior changes without product/domain authority.
- Do not hand-edit generated artifacts to satisfy an architecture claim.

## Default Workflow

1. **Ground repo state.** Check branch, Graphite stack, dirty files, and relevant `AGENTS.md` routers.
2. **Resolve authority.** Read `references/source-map.md` and the controlling docs or accepted project baseline for the affected owner.
3. **Classify the concern.** Name whether each concern belongs to SDK, CLI, plugin library, config, Civ7 types, adapter, MapGen core, MapGen viz, app runtime, Swooper Maps mod, generated output, docs, OpenSpec change management, or official resource evidence.
4. **Name forbidden owners.** State where the concern must not live.
5. **Design before editing.** For structural work, write the intended owner/import/export/file shape and verification gates before code.
6. **Implement the bounded slice.** Move by authority, not by current containers.
7. **Use enforcement honestly.** Tool failures are evidence. They do not authorize shims, broad barrels, hand-edits to generated output, or boundary collapse.
8. **Disposition review findings.** Accepted material findings block dependent implementation until repaired or rejected with source evidence.
9. **Close with evidence labels.** State what is implemented, locally verified, in-game verified, documented, deferred, or excluded.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Source map | `references/source-map.md` | Resolving authority order, stale inputs, and evidence classes |
| Mental model | `references/mental-model.md` | You need first-principles architecture rules |
| Ownership boundaries | `references/ownership-boundaries.md` | Placing logic across packages, mods, apps, docs, generated outputs, and resources |
| Implementation gates | `references/implementation-gates.md` | Before structural edits, review, verification, or closure |
| Failure patterns | `references/failure-patterns.md` | Work feels awkward, wrappers appear, or stale docs/code are pulling the shape |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| Structural slice preflight | `assets/structural-slice-preflight.md` | Copy into a project/workstream packet before architecture implementation |

## Core Invariants

<invariants>
<invariant name="authority-before-path">Name the owning boundary before moving or creating a file. Current paths are evidence, not architecture.</invariant>
<invariant name="authority-records-route-work">Root and subtree AGENTS route agents to controlling docs, accepted project baselines, and canonical docs; they do not store task status or volatile implementation notes.</invariant>
<invariant name="generated-output-is-read-only">Generated artifacts such as `dist/`, `mod/`, resource outputs, generated manifests, and lockfiles are outputs. Regenerate them through scripts instead of hand-editing them.</invariant>
<invariant name="official-resources-are-evidence">`.civ7/outputs/resources` is official game-data evidence. It does not by itself define SDK, MapGen, adapter, or mod architecture.</invariant>
<invariant name="core-stays-substrate">`packages/mapgen-core` owns the MapGen authoring/compiler/executor/artifact/trace substrate and generic primitives. Swooper owns its domains and recipes; purity or possible reuse alone never transfers N=1 product ownership into Core. Core must not import Civ7 engine globals or game runtime APIs directly.</invariant>
<invariant name="adapter-is-engine-boundary">Civ7 engine globals, `base-standard` APIs, and runtime-specific calls belong behind `packages/civ7-adapter` or explicit mod runtime integration.</invariant>
<invariant name="truth-and-projection-separate">MapGen truth products and game-engine projection/materialization are separate concerns. If current behavior delegates a surface to the engine, do not describe it as deterministic pipeline truth without a controlling decision.</invariant>
<invariant name="recipe-owns-ordering">MapGen recipes own stage order and enablement. Independent stage lists or docs must be checked against live recipe authority.</invariant>
<invariant name="steps-have-explicit-contracts">Steps should expose explicit config, dependencies, artifacts/effects, and verification boundaries instead of hidden sub-pipelines.</invariant>
<invariant name="stage-needs-stage-surface">Promote a stage only for a real authoring, input/handoff, placement, enablement, trace, helper-ownership, or projection surface. Do not promote for implementation variants, Studio grouping, debug navigation, or plausible future knobs alone.</invariant>
<invariant name="flat-stage-config-default">The default stage config surface is flat: `{ knobs?, [stepId]?: stepConfig }`. Persisted SDK-native `advanced` wrappers require a real surface transform, not boilerplate unwrap compiles.</invariant>
<invariant name="map-stages-project">`map-*` stages are projection/materialization/effects lanes. They do not own upstream truth, scoring, planning, or Studio-only grouping.</invariant>
<invariant name="no-dumping-ground">`shared`, `common`, `utils`, `internal`, `support`, and broad barrels are not owners. Cross-owner support needs a named invariant and concrete consumers.</invariant>
<invariant name="tooling-enforces-not-designs">Lint/type/test failures identify mismatch. They do not design the target shape.</invariant>
<invariant name="proof-is-observation">Doc lint, unit tests, generated XML, local mod builds, and in-game checks each prove only the boundary they actually exercised.</invariant>
</invariants>

## Anti-Patterns To Avoid

- Preserving a mixed legacy file by adding wrappers, aliases, compatibility paths, or broad exports.
- Moving Civ7-bound code into pure core because it is convenient.
- Treating a generated `dist/` or `mod/` file as source authority.
- Treating old docs, archived project notes, or stale stage ids as current architecture.
- Creating a `shared` folder before naming the real owner.
- Using official game-resource shape as a reason to leak adapter/runtime concerns into SDK or MapGen core.
- Splitting stages because variants or helper families exist rather than because the recipe needs separate stage-level surfaces.
- Keeping `map-ecology` or other `map-*` stages for Studio grouping when SDK/Studio metadata would satisfy presentation needs.
- Claiming in-game correctness from TypeScript checks alone.

## Quick Start

1. Read `references/source-map.md`.
2. Read `references/ownership-boundaries.md` for the owner rows involved.
3. Fill `assets/structural-slice-preflight.md` for structural work.
4. Run the relevant review axes in `references/implementation-gates.md`.
5. Implement, verify, update adjacent docs/tests, and close with evidence-scoped claims.
