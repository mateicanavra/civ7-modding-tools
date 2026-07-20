# Foundation Orogeny Public Config Surface

## Why

The rendered Run in Game path currently carries confusing public config state
because `foundation-orogeny` exposes an internal operation envelope through the
Studio/default config surface. That makes preset application look like Studio
is injecting strange values, and it keeps runtime debugging noisy before the
launch boundary is even reached.

This packet gives `foundation-orogeny` an author-facing public config and
compile boundary. Studio should only receive semantic config. Internal
`strategy/config` operation envelopes belong behind recipe compilation.

## Authority

- Direct user guidance to remove weird public config injection instead of
  masking it in Studio.
- `openspec/config.yaml` normalization frame: default stage config is flat and
  OpenSpec is downstream implementation control.
- `openspec/changes/foundation-authoring-surface-alignment/`.
- `openspec/changes/mapgen-public-config-boundary/`.
- `openspec/changes/studio-public-config-contract/`.
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`.
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`.

## Requires

- Existing standard recipe compile and validation paths.
- Completed Foundation authoring-surface alignment below this stack.
- Existing Studio generated recipe/default config artifacts.

## Enables Parallel Work

- Runtime Run in Game packets can debug setup-row visibility without public
  config envelope noise.
- Browser request harness can assert selected authoring config without accepting
  private operation envelopes.

## Affected Owners

- Swooper standard recipe Foundation stage authoring surface
- MapGen core authoring/compile contracts where `createStage` consumes public
  schemas
- Studio config override/default config builders
- Built-in config JSON validation
- Existing Habitat public authoring surface rule for the standard recipe

## Forbidden Owners

- Studio scrubbers that hide a stage authoring defect.
- Runtime Foundation domain algorithms.
- Compatibility lanes that keep raw public and semantic public config live
  together.
- Hand edits to generated dist artifacts.

## Write Set

Likely write set:

- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-public-config.ts`
- `mods/mod-swooper-maps/src/maps/configs/*.config.json` through normal
  generation or validation commands
- `mods/mod-swooper-maps/test/config/**`
- `apps/mapgen-studio/src/features/configOverrides/**`
- `apps/mapgen-studio/test/config/**`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/**`

## Consumer Impact

Authors and Studio users see semantic Foundation Orogeny fields. Runtime compile
still receives the internal `computeCrustEvolution` operation config it needs.

## Stop Conditions

- Public/default/preset config still exposes a raw `{ strategy, config }`
  envelope for Foundation Orogeny.
- A shipped config or preset fails schema validation.
- The old Foundation Orogeny test/Habitat exception remains as a live allowance.
- Studio gains a scrubber instead of the stage owner gaining a public surface.

## Before And After

Before:

- `foundation-orogeny` falls back to exposing
  `crust-evolution.computeCrustEvolution.strategy/config` publicly.
- Tests and Habitat authority contain a special allowance for that envelope.
- Studio preset/default config paths can carry internal operation detail.

After:

- `foundation-orogeny` declares a semantic public schema and compile function.
- Public Studio config and built-in presets contain author-facing fields only.
- Existing special allowances for the internal envelope are removed.
- Habitat continues to own the rule; no parallel authority tree or ad hoc
  topology script is introduced.

## Behavior Verification

Behavior tests validate recipe defaults, built-in config JSONs, and preset
application through Studio config builders. The tests assert semantic public
shape and compile output, not deleted implementation names.

## Structural Enforcement

Permanent positive assertion:

- standard recipe stages with internal operation steps expose a semantic public
  authoring surface and compile through the stage owner before Studio can see
  them.

The existing Habitat public-authoring-surface rule is updated in place if its
current allowance conflicts with this packet. Do not add a new script that
duplicates this rule.

## Verification Gates

- `bun run openspec -- validate foundation-orogeny-public-config-surface --strict`.
- `bun habitat classify` for the packet write set and every reported command.
- `nx run mapgen-studio:test` focused to default config and preset suites.
- `nx run mod-swooper-maps:build:studio-recipes`.
- `nx run mod-swooper-maps:test` or narrower classify-reported config tests.
- Standard recipe public authoring surface Habitat check.
- Built-in config validation for Swooper map configs.
- TypeScript refactoring, code quality/structure, library correctness, and
  Habitat/authority review lanes.
