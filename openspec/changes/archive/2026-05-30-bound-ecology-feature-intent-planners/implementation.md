## Implementation Evidence

Implemented in the active Graphite worktree on `codex/ecology-feature-density-spec`.

The weak-positive category was repaired without creating generic shared
machinery:

- `features-plan-reefs/policies/admit-reef-intent.ts`
- `features-plan-wetlands/policies/admit-wetland-intent.ts`
- `features-plan-vegetation/policies/admit-vegetation-intent.ts`
- `features-plan-ice/policies/admit-ice-intent.ts`

Each planner strategy imports its family-local policy. The abandoned
`features-plan-shared` owner was removed. Generic score math remains in
`score-shared`, but score-to-intent policy does not live there; the former
`confidenceBeatsStress` admission helper and direct admission test were removed.

## Guard Evidence

- `mods/mod-swooper-maps/test/ecology/feature-planner-policies.test.ts`
  rejects weak positive scores across reef, wetland, vegetation, and ice
  planners, including non-default planner strategies.
- The same test proves each in-kind planner owns a local `policies/` directory
  and every concrete planner strategy imports the local policy. It also proves
  `features-plan-shared` plus `score-shared` admission are absent.
- `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts` runs the
  standard recipe/runtime/config and bounds ecology feature density without
  direct step wiring.

## Review Disposition

User correction superseded the earlier shared-admission design: policy logic
must stay close to the feature family it modulates unless it is truly
product-free MapGen core machinery. The implemented shape follows that
disposition.

Adversarial review P1/P2 findings were dispositioned by removing generic
`score-shared` admission and simplifying local policy contracts to the family
signal they actually use. A follow-up scan found the non-default ice planner
strategy still admitted any positive score; it now imports the ice-local policy,
and the guard scans all concrete strategy files in each planner family.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/no-fudging-static-scan.test.ts test/ecology/ecology-step-import-guardrails.test.ts test/ecology/score-shared-physics-selection.test.ts test/ecology/feature-planner-policies.test.ts test/ecology/feature-habitat-eligibility.test.ts test/ecology/earthlike-balance-smoke.test.ts test/ecology/op-contracts.test.ts`
  passed, 32/32 tests.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run lint:normalization-guardrails` passed.
- `bun run openspec -- validate bound-ecology-feature-intent-planners --strict`
  passed.
- `bun run openspec:validate` passed.
- `bun run build` passed.
- `bun run deploy:mods` passed and deployed `mod-swooper-maps`.
- `git diff --check` passed.
- Fresh `Scripting.log` evidence after deploy shows the standard recipe reached
  `[50/50] ok mod-swooper-maps.standard.placement.placement` and destroyed the
  `MapGeneration` context cleanly.
