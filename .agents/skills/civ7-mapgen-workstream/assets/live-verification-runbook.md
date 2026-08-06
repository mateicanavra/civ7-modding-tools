# Swooper Live Verification Runbook

Use this checklist when a claim requires Civ7 loader or live-behavior proof.
Deterministic generation, browser rendering, generated output, and installation
are earlier evidence classes; none alone closes a live claim.

## 0. Declare The Claim

- Exact behavior to prove: `<...>`
- Recipe/config/map and game seeds/map size/player setup: `<...>`
- Definition source identity: `<commit/digest>`
- Required deterministic expectation rows: `<ledger ids>`
- Required live observation: `<log/readback/visual>`
- Correlation identities required for parity: `<...>`
- Stop/retry rule: `<...>`

## 1. Discover Current Owners And Targets

```bash
bunx nx show project swooper-physics --json
bunx nx show project swooper-physics-mod --json
bunx nx show project mapgen-studio --json
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js mapgen --help
```

Derive live, build, deployment, dependencies, outputs, and entrypoint targets
from the returned Nx project. Ask each selected entrypoint for `--help`; do not
reuse a target name or flag from an old proof record.

## 2. Prove The Definition First

1. Run focused contract/semantics checks on the changed definition owner.
2. Run the named metric study cohort from the expectation ledger.
3. Capture deterministic diagnostic evidence for the exact live inputs.
4. Confirm the ledger's target rows and `HOLD` guards pass.
5. Record deterministic run ids and artifact/diagnostic digests.

If deterministic truth is wrong, stop. Live execution will not repair it.

## 3. Build The Realization

1. Invoke the realization app's Nx `build` target so graph dependencies are
   respected.
2. Record the generated mod tree, map-script identity, digest, and runtime
   compatibility results.
3. Never edit generated output. Fix definition or realization source and rebuild.

This proves `generated`, not `installed` or `live-behavior`.

## 4. Install Through The Qualified App

1. Invoke the realization app's deployment target selected from the Nx project
   discovery result.
2. Record the qualified install adapter receipt: selected Mods root, mod id,
   source/destination tree identities, replacement result, and digest/counts.
3. Compare generated and installed identities only through that receipt.

Do not infer loader acceptance from file presence.

## 5. Prepare The Live Scope

1. Confirm Civ7 Tuner support is enabled.
2. Have the qualified app select/acquire the local-socket Tuner provider and
   generic window-capture provider when capture is needed.
3. Record the Tuner resource epoch and selected endpoint from provider facts.
4. Confirm foundational control reports the required app/game readiness.
5. Snapshot the relevant logs before any launch/mutation.
6. If Studio is involved, record the Studio app process identity and the
   MapGen-runs operation/request identity.

Raw resource health does not mean a game is mutation-ready. Foundational
control owns the semantic readiness interpretation.

## 6. Run The Live Operation

Choose the path that matches the claim.

### Realization-Owned Live Target

Use the realization-owned live-behavior target selected from the Nx project
discovery result. Obtain its exact arguments from the owning entrypoint's help.
Invoke through Nx so prerequisite build evidence stays in the graph.

Record:

- target and resolved arguments;
- exact generated and installed artifact identities;
- app/process and resource epoch;
- setup/map inputs;
- request/proof id;
- fresh log window;
- control admission, dispatch, and readback results;
- terminal status and exit code.

### Studio Save & Deploy / Run In Game

Use the public MapGen-runs operation through the selected Studio projection.
Record each owner-local stage:

```text
operation intent
  -> authored config prepare/write receipt
  -> materialization receipt
  -> installation receipt
  -> setup/control facts
  -> fresh run/log evidence
  -> reconciliation
  -> terminal MapGen-runs outcome
```

Do not call the Swooper realization app as Studio's implementation. The Studio
app constructs its own qualified realization adapter from the public Swooper
definition and pure packages.

## 7. Bound Logs And Readback

- Read only bytes/lines after the pre-action log snapshot.
- Record context creation/destruction and authored success/failure markers as
  log facts, not as a substitute for the complete outcome.
- Treat any current-run engine/runtime exception as a failed or unresolved live
  gate even when deterministic tests passed.
- Read the live map through the public foundational control `map` capability.
- Require the observation to stay on one resource epoch and one coherent map
  identity; if the owner reports stale or changed state, reacquire/reconcile.
- Keep window-capture evidence separate. A modal, occluded window, permission
  failure, or stale frame can block visual QA without invalidating unrelated
  log/readback evidence.

## 8. Run Parity Only With Honest Correlation

Use the realization-owned parity target selected from the Nx project discovery
result when the claim requires deterministic-versus-live surface comparison.
Obtain selectors and flags from the owning entrypoint's help.

Parity must join:

- exact authored config and deterministic run evidence;
- generation/materialization manifest;
- MapGen-runs operation or diagnostics identity;
- exact realization/install identity;
- one coherent foundational control map observation;
- resource epoch and game/map/process identity.

Report outcomes without weakening them:

- complete pass: every required comparison and identity link passed;
- complete failure: a required product comparison failed;
- blocked/unresolved: known comparisons remain visible, but a required identity
  or evidence link is missing;
- correlation failure: do not replay or read live state as though it belonged
  to the run.

Seeds, dimensions, turn, endpoint, or similar values are not substitutes for a
missing game/process identity.

## 9. Recovery

Route the first failed layer to its owner:

| Failure | Owner/action |
| --- | --- |
| Metric/artifact mismatch | Swooper definition; redesign or retune |
| Browser-only mismatch | web projection/UI over fixed diagnostic values |
| Generated artifact/runtime incompatibility | realization compiler/runtime |
| Installed-tree mismatch | qualified install adapter and app config |
| Tuner acquisition/epoch failure | Tuner provider/resource and app scope |
| Wrong Civ7 readiness/map/UI fact | foundational control module |
| Wrong operation phase/reconciliation | MapGen-runs |
| Wrong API/browser translation | projection plugin |
| Missing identity link | preserve unresolved; add owner-issued identity capability rather than guessing |

After a source fix, rebuild and redeploy before rerunning live proof. Never
repeat an uncertain mutation until fresh owner facts make repetition lawful.

## 10. Proof Record

- Definition/config/seeds/map size/setup: `<...>`
- Nx target and arguments discovered: `<...>`
- Generated artifact identity: `<...>`
- Installation receipt: `<...>`
- App/process identity: `<...>`
- MapGen-runs request/operation identity: `<...>`
- Tuner resource epoch: `<...>`
- Fresh log boundary and findings: `<...>`
- Foundational map/UI observation: `<...>`
- Window-capture evidence, if used: `<...>`
- Parity result and unresolved links: `<...>`
- Supported proof classes: `<...>`
- Generalization limits: `<...>`
- Retry lawful: `<yes/no and why>`
