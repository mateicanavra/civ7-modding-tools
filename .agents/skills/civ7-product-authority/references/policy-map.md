# Policy Map

## Official Resource Policy

- Treat `.civ7/outputs/resources` as read-only official game-data evidence.
- Do not hand-edit resource outputs.
- When game data changes, update source modeling, tests, and generated outputs through documented scripts.
- Do not infer repo architecture from resource file layout alone.

## Generated Artifact Policy

- `dist/`, `mod/`, generated manifests, and generated resource outputs are outputs.
- Change source files and regenerate outputs through package scripts.
- Generated output can be cited only for the generation run and artifact inspected.

## Public Contract Policy

Before changing public SDK exports, CLI commands/flags, plugin APIs, docs tutorials, mod entrypoints, or recipe config contracts:

- identify consumers;
- record expected compatibility or breakage;
- update adjacent docs/tests;
- run focused verification;
- state whether the change is compatible, breaking, experimental, or internal.

For MapGen recipe config, the default accepted stage surface is flat:
`{ knobs?, [stepId]?: stepConfig }`. Treat persisted `advanced.<stepId>` as a
migration concern unless a controlling decision names a genuine public surface
transform.

## Native Control Primitive Policy

For live Civ7 play-control behavior, official native primitives are the first
authority. Before inventing a workaround, inspect the shipped App UI scripts,
official GameInfo/runtime APIs, FireTuner/dev-tool resources, and relevant
community mod scripts as evidence for the native state machine and control
surface.

- Prefer official operations, commands, UI managers, display queues, notification
  managers, and story/progression/city/unit controllers over caller-side
  reconciliation.
- A CLI mutation should be one forward player decision. If Civ7 uses multiple
  native primitives for that decision, compose them inside the command.
- Do not expose "closeout", duplicate verification, or manual state repair as
  the default play-agent task. Keep those as diagnostics or compatibility debt
  only until the native workflow is owned by one command.
- Verification exists to prove repo-owned composition, newly modeled surfaces,
  or non-native lenses. Do not build verification theater around native state
  transitions that Civ7 itself already owns and trusts.
- If no native primitive exists, state that proof boundary explicitly before
  adding repo-owned orchestration.

## MapGen Truth/Projection Policy

- Truth stages publish deterministic domain artifacts and fields.
- Projection/materialization stages write to Civ7 engine/mod surfaces.
- `map-*` stages are product-visible only as projection/materialization,
  effects, adapter writes, map artifacts, projection knobs, or parity evidence.
  Studio grouping and debug navigation are presentation needs, not truth-stage
  ownership.
- If current behavior delegates to a Civ7 engine generator for a surface, document that as projection/materialization or telemetry until a controlling decision gives the pipeline deterministic ownership.
- If the pipeline claims truth ownership, add deterministic artifacts and fail/verification gates that prove materialization matches.

## Adapter Policy

- Direct Civ7 engine imports and `base-standard` APIs belong behind the adapter or game-facing mod runtime.
- Adapter methods should stay thin and stable.
- MapGen algorithms and mod tuning do not move into the adapter.

## Documentation Policy

- Canonical evergreen docs live under `docs/`, `docs/system/**`, `docs/product/**`, and `docs/process/**`.
- Project specs, reviews, phase notes, and handoffs live under `docs/projects/<project>/`.
- Promote durable knowledge from project docs to canonical docs when it becomes stable.
- Move superseded docs to archive rather than leaving stale authority in live paths.

## Proof Policy

Label evidence precisely:

- typecheck/build;
- unit/integration test;
- generated XML/mod output;
- doc lint;
- local app/browser check;
- in-game validation;
- deployment/install verification.

Do not collapse one proof class into another.
