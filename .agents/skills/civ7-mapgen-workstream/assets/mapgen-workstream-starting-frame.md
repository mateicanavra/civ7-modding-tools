# Civ7 MapGen Workstream Starting Frame

Replace `<<<OBJECTIVE_OR_TASK>>>` and use this frame for a substantial Swooper
Physics request.

## Mission

`<<<OBJECTIVE_OR_TASK>>>`

## Actor Outcome

- Actor: `<map author | playtester | release operator | Studio user>`
- Desired outcome: `<observable capability or behavior>`
- Explicit non-goals: `<...>`
- Falsifier: `<what evidence would show the current framing is wrong>`

## Durable Owners

Hold these boundaries throughout the work:

- Swooper portable definition:
  `plugins/mod/map/swooper-physics`.
- Reusable MapGen mechanics: `packages/mapgen-*` by named package authority.
- Static Civ7 map policy: `packages/civ7-map-policy`.
- Deployable Swooper realization and engine-bound map script:
  `apps/mods/map/swooper-physics`.
- Save & Deploy / Run in Game intent, state, ordering, correlation,
  reconciliation, and semantic outcome: `services/mapgen-runs`.
- Exact physical host effects and receipts: qualified app adapters.
- Tuner and window acquisition: selected resource providers.
- Typed Civ7 app/game/map/UI facts: `services/civ7-control`.
- Actor-facing gameplay meaning: `services/civ7-play`.
- Caller interaction and presentation: CLI/API/web projections.
- Provider selection, client binding, mounting, and disposal: qualified apps.

Read the accepted platform packet before changing an owner boundary:
`docs/projects/civ7-capability-realization/{destination-platform-reference.md,
PRODUCT-AUTHORITY.md,SYSTEM-MODEL.md,TOPOLOGY.md,CORPUS.md}`.

## Orientation

Before editing:

1. Read the nearest `AGENTS.md` files and current repository workflow docs.
2. Inspect the current Nx projects and targets for every owner in scope.
3. Read the relevant `civ7-mapgen-workstream` references and
   `civ7-product-authority`/`civ7-operational-debugging` overlays.
4. Re-derive stage, operation, artifact, config, and consumer inventories from
   current source; do not import an inventory from another workstream.
5. Record current evidence, assumptions, stop conditions, and proof needs in
   one living workstream document.

## Working Lens

Every behavioral decision must satisfy both:

- **Planet:** causal physical coherence across foundation, morphology,
  hydrology, ecology, placement, and resources.
- **Player:** legality, fairness, legibility, strategic diversity, and
  explainability.

A physically elegant but unplayable map is wrong. A legal map with arbitrary
geography is also wrong.

## Investigation Shape

Carry independent questions far enough to discriminate:

- Which causal artifact or operation first becomes wrong?
- Is the symptom definition truth, browser projection, realization output,
  installation, MapGen-runs state, or live readback?
- Which official/static/runtime Civ7 facts constrain the solution?
- What is modeled, approximated, and absent?
- What would a structurally different alternative look like?
- Which proof class can close the actor claim?

Coordinate live mutation in one lane because the installed Mods tree, Civ7
process, resource epochs, and current run are shared mutable state.

## Gates

1. **Frame:** actor outcome, owner, non-goals, and falsifier are explicit.
2. **Diagnosis:** generation versus projection/realization is proven with raw
   evidence, not inferred from pixels.
3. **Design:** at least one meaningful alternative is considered.
4. **Behavioral declaration:** expectation ledger and collateral guards are
   filled before tuning.
5. **Implementation:** every fact, effect, policy, state transition, and outcome
   has one owner.
6. **Deterministic proof:** exact config/seeds/cohort and evidence ids recorded.
7. **Realization proof:** generated, installed, loader, and live claims remain
   separate.
8. **Run proof:** MapGen-runs phases, adapter receipts, correlation,
   reconciliation, and terminal outcome remain visible.
9. **Closure:** proof labels and unresolved links are honest.

## Execution Rules

- Prefer one complete behavior per slice.
- Use current Nx target discovery instead of remembered commands.
- Never edit generated or installed files.
- Never use provider access or raw execution as a shortcut around control,
  play, or MapGen-runs.
- Never import one app as another app's runtime implementation.
- Preserve uncertain mutation outcomes and reconcile before retry.
- Keep task state out of skills and `AGENTS.md`; store it in the workstream.

## Final Record

- outcome and owner changes;
- exact definition/config/build/run identities;
- targets/commands discovered and run;
- deterministic, projection, generated, installed, loader, and live evidence;
- consumer impact;
- unresolved links and lawful next action;
- intentionally excluded work.
