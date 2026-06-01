## 1. Reef Diagnosis

- [x] 1.1 Identify broad positive water suitability plus weak planner
      admission as the current reef saturation cause.
- [x] 1.2 Quantify current and repaired Earthlike reef-family density from
      recipe-level execution.

## 2. Reef Habitat Implementation

- [x] 2.1 Add reef-family eligibility fields or scoring terms at the reef op
      owner.
- [x] 2.2 Apply reef-family eligibility during reef intent planning.
- [x] 2.3 Add why/what comments for reef physics tradeoffs.

## 3. Tests And Docs

- [x] 3.1 Add focused reef score/plan tests for broad warm shallow water
      without shelf/structure, cold-water eligibility, isolated atoll
      structure, and exact `FEATURE_LOTUS` calm-water habitat.
- [x] 3.2 Add recipe-level reef density assertions that run `standardRecipe`
      through the standard runtime/config rather than direct step wiring.
- [x] 3.3 Update Ecology docs and implementation evidence.

## 4. Verification

- [x] 4.1 Run focused reef/ecology tests.
- [x] 4.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 4.3 Run `bun run openspec -- validate constrain-reef-habitat-eligibility --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `bun run build`.
- [x] 4.6 Run `bun run deploy:mods`.
- [x] 4.7 Run `git diff --check`.
