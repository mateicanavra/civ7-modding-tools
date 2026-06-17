# Design - Studio Recipe Artifacts Proof

## Frame

### Objective

Make `grit-studio-recipe-artifacts` truthful as a row-owned Habitat proof
checkpoint for the current Grit predicate.

### Product Movement

This row helps Habitat enforce an authoring boundary before agents modify
Studio UI code: the UI consumes generated recipe artifacts, and runtime recipes
stay behind worker/server boundaries.

### Selection

- Rule id: `grit-studio-recipe-artifacts`
- Grit pattern: `studio_recipe_artifacts`
- Pattern file: `.grit/patterns/habitat/checks/studio_recipe_artifacts.md`
- Owner layer: `grit-check`
- Registry scope: `apps/mapgen-studio/src/**/*.{ts,tsx}`
- Current predicate scope: Studio `.ts`/`.tsx` files excluding
  `apps/mapgen-studio/src/browser-runner/` and
  `apps/mapgen-studio/src/server/`
- Forbidden current sources:
  `mod-swooper-maps/recipes/standard` and
  `mod-swooper-maps/recipes/browser-test`
- Allowed current sources:
  `mod-swooper-maps/recipes/*-artifacts`,
  `mod-swooper-maps/recipes/standard-map-configs`, worker/runtime files, and
  server files.

### Hard Core

1. This is a check proof, not an apply proof.
2. ADR-004 is the policy authority: UI imports artifacts, worker imports
   runtime recipes.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. `browser-runner` and `server` path exceptions are part of the current
   predicate and must stay explicit.
5. Current predicate proof is not predicate repair or generated artifact proof.

### Exterior

- Recipe artifact generation.
- Runtime worker recipe execution.
- Studio server recipe DAG behavior.
- Generated output repair.
- Baseline mutation.
- Apply codemods.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims wrapper/current-tree enforcement from native
fixtures, if a live UI runtime import is found but recorded as a pass without
owner disposition, if temporary inventory artifacts are cited as durable proof,
or if worker/server runtime imports are treated as UI violations without
reviewed predicate repair.

## Source Synthesis

ADR-004 in `docs/system/ADR.md` says recipe packages expose artifacts
separately from runtime recipe code; the UI imports only artifacts, and the
worker imports runtime recipe modules.

`docs/projects/habitat-harness/invariant-corpus.md` records the retired
`eslint-studio-recipe-imports` invariant and assigns it to `grit-check` because
the artifact-vs-runtime distinction is inside one project and invisible to Nx
tags.

`rules.json` registers `grit-studio-recipe-artifacts` as an enforced
`grit-check` with scope `apps/mapgen-studio/src/**/*.{ts,tsx}`, message
"MapGen Studio UI must import recipe artifacts, not runtime recipe modules.",
and remediation "Use mod-swooper-maps/recipes/*-artifacts."

The current Grit predicate matches imports from two exact runtime module ids in
Studio `.ts`/`.tsx` files, excluding `browser-runner` and `server` paths.

Current source exemplars:

- `apps/mapgen-studio/src/recipes/catalog.ts` imports
  `mod-swooper-maps/recipes/browser-test-artifacts`,
  `mod-swooper-maps/recipes/standard-artifacts`, and
  `mod-swooper-maps/recipes/standard-map-configs`.
- `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts` imports runtime
  modules and artifact modules inside the worker exception path.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| UI default runtime import | Reports |
| UI named runtime import | Reports if matched by current snippet |
| UI namespace runtime import | Reports if matched by current snippet |
| UI type-only runtime import | Reports if matched by current snippet |
| UI side-effect runtime import | Reports |
| UI runtime re-export | Current predicate non-claim unless fixture proves it |
| UI artifact import | Does not report |
| UI map-config artifact import | Does not report |
| `browser-runner` runtime import | Does not report under current predicate |
| `server` runtime import | Does not report under current predicate |
| source lookalike | Does not report unless exact source literal matches |
| non-Studio path | Does not report |
| `.jsx`/`.js` path | Outside current TypeScript predicate unless proven otherwise |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live zero-candidate evidence over `apps/mapgen-studio/src`;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Current proof ids:

- `SRA-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for 8
  current-predicate positive classes and the recorded controls.
- `SRA-STUDIO-INVENTORY-2026-06-15`: parser inventory/live zero-candidate
  evidence over the current Studio root.

This row checkpoint must not record:

- Habitat wrapper selector/current-tree proof;
- raw Grit acquisition;
- baseline proof;
- injected violation/cleanup proof;
- Effect adapter proof;
- apply safety;
- product proof.

## Downstream Records

The aggregate proof matrix and corpus ledger are updated for this row's current
checkpoint. Recovery ledger, ADRs, and command docs remain unchanged unless the
implementation changes policy, diagnostics, or user-facing behavior.
