---
name: civ7-mapgen-workstream
description: |
  Use in the Civ7 Modding Tools repo for durable Swooper Physics map-generation work: "improve rivers", "make the map more Earth-like", "split a recipe stage", "add an operation strategy", "why is placement wrong", "compare MapGen runs", "the Studio visualization looks wrong", "verify this map in Civ7", or "run a mapgen workstream". Routes definition, realization, MapGen-runs, projection, and live-proof work through the accepted capability topology.
---

# Civ7 Map-Generation Workstream

## Purpose

Take a Swooper Physics request from symptom to an honestly proven outcome while
preserving the destination ownership model:

- `plugins/mod/map/swooper-physics` owns the portable map product: domains,
  recipe, authored configuration, diagnostics, metrics, trace, and
  visualization semantics.
- `packages/mapgen-core` owns reusable MapGen authoring and execution mechanics.
- `apps/mods/map/swooper-physics` owns the deployable Civ7 realization produced
  by its own Nx targets, including engine-bound map-script code and deployment.
- `services/mapgen-runs` owns Save & Deploy and Run in Game intent, operation
  state, ordering, correlation, reconciliation, and semantic outcomes.
- Qualified app adapters own physical host effects and receipts. Projections
  present public capabilities; they do not become product owners.
- The in-engine controller supplies typed native app/game/map/UI facts.
  Actor-facing Play supplies gameplay decisions. Neither is MapGen definition
  authority.

Read the accepted platform packet before changing an owner boundary:
`docs/projects/civ7-capability-realization/{destination-platform-reference.md,
PRODUCT-AUTHORITY.md,SYSTEM-MODEL.md,TOPOLOGY.md,CORPUS.md}`.

## Use This For

- Structural recipe work: domains, modules, operations, strategies, artifacts,
  stages, steps, and authored configuration.
- Behavioral work: terrain, climate, hydrology, ecology, placement, resource
  distribution, playability, and physical realism.
- Generation-versus-projection diagnosis.
- Deterministic diagnostics, metric studies, realization proof, and live Civ7
  verification.

## Do Not Use This For

- Generic MapGen engine changes with no Swooper product meaning.
- Tuner, window capture, logs, or deployed-file diagnosis by itself; use
  `civ7-operational-debugging`.
- Turn-by-turn gameplay; use `civ7-play-game`.
- Product-authority changes without reading `civ7-product-authority` and the
  sealed capability packet.
- Recreating service, projection, or vendor integration mechanics in skill
  prose. Follow the owning source and installed vendor guidance.

## Route The Request

| Request | Primary edit owner | Required evidence |
| --- | --- | --- |
| Change a physical or gameplay-facing map outcome | Swooper definition under `src/domain` and `src/recipes` | focused semantics, metric cohort, generated evidence, then live realization for engine-facing claims |
| Change recipe structure without changing output | Swooper definition | contract/type tests plus explicit identity and output invariants |
| Change reusable authoring/execution mechanics | `packages/mapgen-core` | package contract and deterministic execution proof across consumers |
| Change generated map-script or Civ7 engine integration | Swooper realization app | artifact/runtime proof, deploy receipt, then loader/live proof |
| Save & Deploy or Run in Game behavior | `services/mapgen-runs`; physical effects at the qualified app adapter | service semantics, adapter execution receipts, projection proof, live reconciliation where claimed |
| Wrong browser rendering with correct diagnostic values | Studio web projection or retained UI package | diagnostic-value comparison plus browser display/interaction proof |
| Wrong live map readback | controller `map` capability or realization proof | controller realm/boot plus host-access epoch correlation; never a caller-local Tuner script |

When a symptom could be generation or display, prove the branch before editing.
See `references/facet-verification.md`.

## Default Workflow

1. **Ground owners.** Read the accepted capability packet, the nearest
   `AGENTS.md`, and the three owning Nx project descriptions:
   `swooper-physics`, `swooper-physics-mod`, and any affected projection/app.
2. **Frame the claim.** Name the actor outcome, the proof class needed, and what
   would falsify the leading explanation.
3. **Re-derive the live pipeline.** Read the definition's domain contracts,
   recipe manifest, artifact owners, and tests. Do not preserve counts or stage
   inventories from this skill.
4. **Diagnose.** Compare causal artifacts and diagnostic layers before blaming
   rendering. For live disagreement, preserve correlation and use the public
   MapGen-runs/controller path.
5. **Design alternatives.** Carry at least one meaningfully different model or
   placement. For behavioral work, fill
   `assets/earthlike-expectation-ledger.md` before tuning.
6. **Implement at one owner.** Use `assets/recipe-scaffolds.md` for definition
   authoring. Keep engine globals and deployment inside the realization app;
   keep operation state inside MapGen-runs.
7. **Verify in layers.** Contract/semantics, deterministic run, metric cohort,
   generated artifact, deployment, logs/readback, and live behavior are
   separate claims. Use `assets/live-verification-runbook.md` when Civ7 proof is
   required.
8. **Review boundaries.** Confirm definition/realization, truth/projection,
   access/controller/Play, service/app, and evidence/outcome separation.
9. **Record the result.** Report what changed, exact inputs, proof labels,
   unresolved links, and the narrowest remaining risk.

## Command Currency

Do not freeze remembered commands in a workstream. Discover current
surfaces first:

```bash
bunx nx show project swooper-physics --json
bunx nx show project swooper-physics-mod --json
bunx nx show project cli-mapgen --json
bun apps/cli/bin/run.js mapgen --help
```

Select the required family and leaf from native help, then ask the leaf for
`--help` before recording flags. Invoke live proof through an owning Nx target,
not a remembered script path.

## Reference Map

| File | Open when |
| --- | --- |
| `references/pipeline-map.md` | Locating definition, realization, run, projection, and artifact boundaries |
| `references/facet-physics.md` | Designing or reviewing a physically grounded behavioral change |
| `references/facet-civ7-domain.md` | Resolving official-data, legality, runtime, and gameplay-intent evidence |
| `references/facet-verification.md` | Choosing proof, separating generation from display, or reading live evidence |
| `references/orchestration.md` | Running a substantial request end to end |
| `assets/recipe-scaffolds.md` | Copying current definition-authoring skeletons after checking live source |
| `assets/earthlike-expectation-ledger.md` | Pre-declaring behavioral expectations |
| `assets/live-verification-runbook.md` | Running the realization and live-proof gates |
| `assets/mapgen-workstream-starting-frame.md` | Starting a substantial workstream with a durable owner/proof frame |

## Invariants

<invariants>
<invariant name="definition-realization-split">Portable Swooper truth stays in `plugins/mod/map/swooper-physics`; engine-bound generation, generated artifacts, deployment, loader behavior, and live proof stay with qualified realization owners.</invariant>
<invariant name="mapgen-runs-owns-operations">MapGen-runs owns operation intent, ordering, state, correlation, reconciliation, and semantic outcome. Qualified app adapters own physical host effects and receipts.</invariant>
<invariant name="truth-before-projection">A deterministic artifact is MapGen truth; Studio pixels and Civ7 readback are projections. Neither silently replaces the other.</invariant>
<invariant name="source-before-snapshot">Re-derive paths, stage order, operation keys, target names, and command flags from current source, Nx, and CLI discovery.</invariant>
<invariant name="expectations-before-tuning">Behavioral changes declare target movements and hold guards before implementation.</invariant>
<invariant name="proof-stays-disjoint">Tests, generated files, deployment receipts, logs, readback, and live behavior support different claims.</invariant>
<invariant name="no-private-live-bypass">MapGen work consumes public controller, Play, run, definition, and diagnostic capabilities. It never acquires a provider or invents caller-local live control.</invariant>
</invariants>
