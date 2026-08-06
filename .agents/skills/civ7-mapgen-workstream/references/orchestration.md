# MapGen Workstream Orchestration

Use this for a request substantial enough to require investigation, competing
designs, implementation slices, and layered proof.

## 1. Intake And Route

Classify the requested outcome before studying files:

- portable definition behavior;
- reusable MapGen mechanics;
- realization/build/deploy behavior;
- MapGen-runs operation behavior;
- foundational live observation;
- caller projection/display behavior.

If intent is ambiguous, use `cognition:inquiry-design`. The output is a
provisional owner, required proof class, and the first falsifier.

## 2. Frame

Use `cognition:framing-design` to record:

- actor and desired outcome;
- hard constraints and explicit non-goals;
- current evidence versus assumptions;
- owner boundaries that must not move accidentally;
- falsifier and stop condition.

For a symptom, include the generation-versus-display discriminator from
`facet-verification.md` immediately.

## 3. Design The Investigation

Use `cognition:investigation-design` to choose the minimum evidence that can
discriminate between plausible causes. A good brief names:

- exact recipe/config/seeds or run operation;
- artifacts, metrics, diagnostic layers, projections, and live facts to read;
- authoritative source for each fact;
- parallelizable lanes;
- stop conditions;
- evidence that would overturn the leading explanation.

Do not select an implementation before this brief can falsify it.

## 4. Analyze In Parallel

For meaningful behavioral work, use independent lanes:

| Lane | Question |
| --- | --- |
| Definition structure | Which domains, modules, operations, artifacts, stages, steps, configs, and tests are affected? |
| Physics/gameplay | Which process or player outcome is wrong, and what is modeled/approximated/absent? |
| Civ7 policy | Which official/static/runtime legality and intent facts constrain the solution? |
| Verification | Which proof could actually close the claim, and which identity/correlation links may remain? |
| Realization/run | Does the change cross generated artifact, installation, loader, MapGen-runs, or live-control boundaries? |
| Projection | Could correct values be rendered or translated incorrectly? |

Use `cognition:team-design` for lane ownership and synthesis mechanics. Keep
live mutation in one coordinated lane because the installed Mods tree, Civ7
process, and active run are shared mutable state.

## 5. Design Alternatives

Use `cognition:system-design` to carry at least two meaningful shapes when the
change affects model or ownership. Compare them by:

- earliest truthful causal locus;
- definition/realization separation;
- artifact and state ownership;
- reversibility and A/B testability;
- Civ7 legality and player value;
- proof cost and unresolved correlation risk;
- downstream consumers and public contracts.

For behavioral work, complete the expectation ledger before choosing tuning
values. For structural work, declare identities and outputs that must hold. For
display work, declare the raw-value and interaction truth the view must preserve.

## 6. Implement One Owner At A Time

Slice by complete behavior, not directory:

- definition slice: operation/strategy/artifact/step/stage plus focused proof;
- realization slice: compiler/runtime/artifact/deploy behavior plus receipts;
- run slice: MapGen-runs contract/semantics plus exact app adapter and
  projection changes;
- observation slice: foundational control operation plus public consumer;
- display slice: projection/UI behavior over fixed owner evidence.

Use `assets/recipe-scaffolds.md` for portable definition authoring after
checking the live source. Do not create a compatibility layer merely to retain
a superseded ownership shape.

## 7. Verify Each Slice

Run the narrowest graph-owned checks for the owner. Record target names from
`bunx nx show project <name> --json` at execution time.

Per slice:

- contract/structure;
- focused semantics;
- deterministic execution where behavior moves;
- projection proof where caller behavior moves;
- generated/install proof where physical output moves.

At a behavior milestone:

- stable metric cohort against the pre-declared ledger;
- exact realization build and install receipt;
- MapGen-runs operation/correlation evidence when involved;
- fresh logs and epoch-correlated foundational map readback;
- parity only when every required identity link is present.

Use `facet-verification.md` and `assets/live-verification-runbook.md`.

## 8. Adversarial Review

Before declaring the result complete, ask:

- Did the model improve the declared regime or merely the inspected seed?
- Did a downstream projection overwrite correct truth?
- Did the change move policy or state into the wrong owner?
- Did Civ7 legality or gameplay quality regress?
- Did any install, log, capture, or readback receipt get promoted into a
  stronger claim?
- Could an uncertain mutation be repeated by this workflow?
- Does the change depend on a path, command, or superseded component that is
  not part of the accepted destination?

Structure authority comes from the sealed capability packet, nearest
`AGENTS.md`, Habitat laws, Nx graph, TypeScript, and owner tests.

## 9. Refine

Return to the earliest failed layer:

- wrong physical hypothesis -> redesign;
- target moves but hold guard fails -> revise the model;
- deterministic values wrong -> definition;
- values right but display wrong -> projection;
- generated artifact wrong -> realization;
- physical receipt wrong -> app adapter;
- service phase/outcome wrong -> MapGen-runs;
- live observation stale/partial -> resource/control correlation;
- identity unresolved -> preserve the block rather than weakening parity.

Live-only compatibility fixes should be focused slices with their own proof.

## 10. Finalize

Use the repository's accepted OpenSpec/change-packet process for bounded work
and `habitat:systematic-workstream` when closure requires a corpus-wide repeated
evidence loop. Follow the repo's Graphite process with `dev:graphite`; this
skill does not duplicate branch mechanics.

The final record must name:

- actor outcome and owner changes;
- exact definition/config/build/run identities;
- targets and commands discovered and executed;
- proof class per claim;
- consumer impact;
- unresolved links and lawful next action;
- intentionally excluded work.

## Gate Summary

| Gate | Required before passing |
| --- | --- |
| Investigation | leading explanation can be falsified |
| Behavioral design | expectation ledger and hold guards declared |
| Structural design | invariant and consumer set declared |
| Implementation | one truthful owner per fact/effect/outcome |
| Deterministic verification | exact inputs and reproducible evidence captured |
| Realization | generated, installed, loader, and live claims remain distinct |
| Run operation | phases, receipts, correlation, reconciliation, and outcome remain visible |
| Closure | proof labels honest; no unresolved fact silently promoted |
