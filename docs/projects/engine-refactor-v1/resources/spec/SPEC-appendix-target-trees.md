# SPEC: Target Architecture (Canonical)

## 7. Appendix: Canonical Target Trees (Full)

### 7.1 Core SDK: `CORE_SDK_ROOT` (full)

```text
CORE_SDK_ROOT/
├─ AGENTS.md
├─ bunfig.toml
├─ package.json
├─ tsconfig.json
├─ tsconfig.paths.json
├─ tsconfig.tsup.json
├─ tsup.config.ts
├─ src/
│  ├─ AGENTS.md
│  ├─ index.ts
│  ├─ authoring/
│  │  ├─ index.ts
│  │  ├─ op/
│  │  │  ├─ contract.ts
│  │  │  ├─ strategy.ts
│  │  │  ├─ create.ts
│  │  │  └─ index.ts
│  │  ├─ step/
│  │  │  ├─ contract.ts
│  │  │  ├─ create.ts
│  │  │  └─ index.ts
│  │  ├─ recipe.ts
│  │  ├─ stage.ts
│  │  └─ types.ts
│  ├─ core/
│  │  ├─ index.ts
│  │  ├─ context/
│  │  │  ├─ index.ts
│  │  │  ├─ types.ts
│  │  │  ├─ createExtendedMapContext.ts
│  │  │  └─ writers.ts
│  │  └─ platform/
│  │     ├─ index.ts
│  │     ├─ PlotTags.ts
│  │     └─ TerrainConstants.ts
│  ├─ dev/
│  │  ├─ ascii.ts
│  │  ├─ flags.ts
│  │  ├─ histograms.ts
│  │  ├─ index.ts
│  │  ├─ introspection.ts
│  │  ├─ logging.ts
│  │  ├─ summaries.ts
│  │  └─ timing.ts
│  ├─ engine/
│  │  ├─ index.ts
│  │  ├─ errors.ts
│  │  ├─ types.ts
│  │  ├─ ExecutionPlan.ts
│  │  ├─ Observability.ts
│  │  ├─ PipelineExecutor.ts
│  │  ├─ StepConfig.ts
│  │  ├─ StepRegistry.ts
│  │  └─ TagRegistry.ts
│  ├─ lib/
│  │  ├─ collections/
│  │  │  ├─ freeze-clone.ts
│  │  │  ├─ index.ts
│  │  │  └─ record.ts
│  │  ├─ grid/
│  │  │  ├─ bounds.ts
│  │  │  ├─ distance/
│  │  │  │  └─ bfs.ts
│  │  │  ├─ index.ts
│  │  │  ├─ indexing.ts
│  │  │  ├─ neighborhood/
│  │  │  │  ├─ hex-oddq.ts
│  │  │  │  └─ square-3x3.ts
│  │  │  └─ wrap.ts
│  │  ├─ heightfield/
│  │  │  ├─ base.ts
│  │  │  ├─ index.ts
│  │  │  └─ sea-level.ts
│  │  ├─ math/
│  │  │  ├─ clamp.ts
│  │  │  ├─ index.ts
│  │  │  └─ lerp.ts
│  │  ├─ noise/
│  │  │  ├─ fractal.ts
│  │  │  ├─ index.ts
│  │  │  └─ perlin.ts
│  │  ├─ plates/
│  │  │  ├─ crust.ts
│  │  │  ├─ index.ts
│  │  │  └─ topology.ts
│  │  └─ rng/
│  │     ├─ index.ts
│  │     ├─ pick.ts
│  │     ├─ unit.ts
│  │     └─ weighted-choice.ts
│  ├─ polyfills/
│  │  └─ text-encoder.ts
│  ├─ shims/
│  │  └─ typebox-format.ts
│  └─ trace/
│     └─ index.ts
└─ test/
   ├─ authoring/
   │  └─ authoring.test.ts
   ├─ engine/
   │  ├─ execution-plan.test.ts
   │  ├─ hello-mod.smoke.test.ts
   │  ├─ placement-gating.test.ts
   │  ├─ tag-registry.test.ts
   │  ├─ tracing.test.ts
   │  └─ smoke.test.ts
   └─ setup.ts
```

### 7.2 Standard content package: `STANDARD_CONTENT_ROOT` (full)

```text
STANDARD_CONTENT_ROOT/
├─ AGENTS.md
├─ package.json
├─ tsconfig.json
├─ tsconfig.tsup.json
├─ tsup.config.ts
├─ mod/
│  ├─ config/
│  │  └─ config.xml
│  ├─ swooper-maps.modinfo
│  └─ text/
│     └─ en_us/
│        ├─ MapText.xml
│        └─ ModuleText.xml
├─ src/
│  ├─ AGENTS.md
│  ├─ mod.ts
│  ├─ maps/
│  │  ├─ gate-a-continents.ts
│  │  ├─ shattered-ring.ts
│  │  ├─ sundered-archipelago.ts
│  │  ├─ swooper-desert-mountains.ts
│  │  ├─ swooper-earthlike.ts
│  │  └─ _runtime/
│  │     ├─ helpers.ts
│  │     ├─ map-init.ts
│  │     ├─ run-standard.ts
│  │     ├─ standard-config.ts
│  │     └─ types.ts
│  ├─ domain/
│  │  ├─ config/
│  │  │  └─ schema/
│  │  │     ├─ index.ts
│  │  │     └─ <domain>.ts
│  │  ├─ <domain>/
│  │  │  ├─ index.ts
│  │  │  └─ ops/
│  │  │     └─ <op-slug>/
│  │  │        ├─ contract.ts
│  │  │        ├─ types.ts
│  │  │        ├─ rules/
│  │  │        │  ├─ <rule>.ts
│  │  │        │  └─ index.ts
│  │  │        ├─ strategies/
│  │  │        │  ├─ default.ts
│  │  │        │  ├─ <strategy>.ts
│  │  │        │  └─ index.ts
│  │  │        └─ index.ts
│  │  └─ **/*                         # other domain logic and shared helpers
│  └─ recipes/
│     └─ standard/
│        ├─ recipe.ts
│        ├─ runtime.ts
│        └─ stages/
│           └─ <stage-id>/             # exact kebab-case stage id
│              ├─ index.ts             # createStage + direct named step imports
│              ├─ viz.ts               # optional stage-shared visualization authoring
│              ├─ log.ts               # optional stage-shared diagnostics
│              └─ steps/
│                 └─ <step-id>/         # exact kebab-case step id
│                    ├─ config.ts       # named documented *StepContract via defineStep
│                    ├─ step.ts         # named documented *Step via createStep
│                    └─ <helper>.ts     # optional step-private support
└─ test/
   ├─ dev/
   │  └─ crust-map.test.ts
   ├─ foundation/
   │  ├─ plate-seed.test.ts
   │  ├─ plates.test.ts
   │  └─ voronoi.test.ts
   ├─ layers/
   │  └─ callsite-fixes.test.ts
   ├─ pipeline/
   │  └─ artifacts.test.ts
   ├─ story/
   │  ├─ corridors.test.ts
   │  ├─ orogeny.test.ts
   │  ├─ overlays.test.ts
   │  ├─ paleo.test.ts
   │  └─ tags.test.ts
   ├─ standard-recipe.test.ts
   └─ standard-run.test.ts
```
