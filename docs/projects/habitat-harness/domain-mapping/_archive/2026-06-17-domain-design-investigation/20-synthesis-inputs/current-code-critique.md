# Current Code Critique

This critique explains why current Habitat code is useful evidence but not a
valid domain model.

## Recovery-Era Composition

Current behavior is concentrated around command wrappers and adapters that
helped recover a structural toolkit surface quickly. That composition now
mixes concerns that scenarios and authority analysis separate:

- `command-engine.ts` contains selector validation, check orchestration,
  baseline application, baseline expansion, verify proof assembly, Nx affected
  routing, graph output, classify path/diff logic, and fix entry routing.
- Grit code includes both diagnostic acquisition and transformation-adjacent
  proof vocabulary, while Pattern Authority separately owns rule admission.
- Hook code coordinates resource state, staged paths, file-layer checks,
  formatter restage, Grit checks, and pre-push affected runs, but its product
  authority is only local feedback.
- Generators live together technically, but project scaffolding and pattern
  governance have different authority and proof contracts.

This is expected in a working toolkit, but it should not decide domain
boundaries.

## What The Code Proves

- The current commands exist and have exercised behavior.
- Diagnostics are normalized and baselines are applied through explicit
  contracts.
- Verify proof preserves non-claims and can truthfully skip Nx affected when
  check fails.
- Grit apply is guarded by clean-tree, approved-path, rollback, and handoff
  constraints.
- Hooks are intentionally local feedback, not CI authority.
- Project generation is intentionally narrow.
- Pattern promotion is authority-heavy and baseline-contract-dependent.

## What The Code Does Not Prove

- It does not prove `command-engine.ts` is one bounded context.
- It does not prove all Grit behavior belongs to one domain authority.
- It does not prove current generators are a complete authoring surface.
- It does not prove Habitat can generate MapGen domains, ops, stages, steps, or
  recipe wiring.
- It does not prove passing a local hook is equivalent to CI or runtime proof.

## Design Consequence

Domain design should target responsibilities and authority:

- orientation before editing;
- enforcement and baseline ratchets;
- graph-backed target truth;
- proof and non-claims;
- local feedback;
- guarded transformation;
- protected generated zones;
- narrow scaffolding;
- pattern governance;
- future authoring topology.

Implementation slices can later choose whether to extract modules, rename
commands, or split adapters, but those changes must follow the domain packet
instead of preceding it.
