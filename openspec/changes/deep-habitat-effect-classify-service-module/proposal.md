# Change: Deep Habitat Effect Classify Service Module

## Why

`habitat classify` is an owned Habitat orientation capability. It helps humans
and agents decide where a path, diff, or target belongs before editing. That
product behavior should sit behind the same Effect-oRPC service surface as the
other owned commands instead of having the CLI call `src/lib/classify` directly.

## What Changes

- Add a `classify` Habitat service module under
  `src/service/modules/classify/**`.
- Compose `classify` into the root Habitat service contract and router.
- Route `src/commands/classify.ts` through the in-process Habitat service
  client.
- Preserve the current `ClassifyResult` JSON contract and serializer.
- Add service and architecture tests that pin classify as owned service-module
  orchestration.

## What Does Not Change

- No classify output schema or command help contract change.
- No workspace graph domain migration in this slice.
- No public package export deletion in this slice; D0 public-surface drainage
  owns final export placement for classify DTOs/helpers.
- No provider owns classify product wording or target guidance decisions.

## Affected Owners

- `tools/habitat-harness/src/service/modules/classify/**`
- `tools/habitat-harness/src/service/{base,contract,router}.ts`
- `tools/habitat-harness/src/commands/classify.ts`
- `tools/habitat-harness/src/lib/classify-core/**` as implementation material
  only
- `tools/habitat-harness/test/service/**`
- `tools/habitat-harness/test/commands/habitat-commands.test.ts`

## Stop Conditions

- The classify CLI calls `classifyTargetResult` directly.
- The root service router contains classify handler logic instead of module
  composition.
- The service module changes classify JSON output shape.
- A provider imports classify service modules or owns Habitat orientation
  wording.
- This packet claims the deeper workspace-graph/domain/provider drain is
  complete.

## Verification

- Focused classify service and command tests.
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run biome:ci`
- `bun run openspec -- validate deep-habitat-effect-classify-service-module --strict`
- `bun run openspec:validate`
- `git diff --check`
