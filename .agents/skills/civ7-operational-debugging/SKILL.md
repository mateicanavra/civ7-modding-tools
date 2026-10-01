---
name: civ7-operational-debugging
description: |
  Use in the Civ7 Modding Tools repo for "check the deployed mod", "inspect Civ7 logs", "did Civ7 load this", "is the Tuner healthy", "capture the Civ7 window", "debug a live run", "why did Run in Game fail", "compare generated and deployed files", "what proof do we have", or "verify this in game". Routes evidence through resources/providers, public control and play capabilities, MapGen-runs, projections, and qualified apps.
---

# Civ7 Operational Debugging

## Purpose

Answer operational questions without confusing evidence with authority. The
durable live chain is:

```text
qualified app
  -> selects/acquires Tuner and window-capture providers
  -> binds provider-neutral resource values to foundational control
  -> optionally binds actor-facing play and MapGen-runs
  -> mounts CLI/API/web projections
  -> observes and disposes the process scope
```

Each owner reports only its facts:

- Tuner resource/provider: connection epoch, health, raw command, interruption,
  release, and foreign failures.
- Window-capture resource/provider: selected-window/image evidence and capture
  failures.
- Foundational control: Civ7 app/game/map/UI interpretation and closed native
  operations correlated to the resource epoch.
- Actor-facing play: gameplay checks, requests, reconciliation, no-repeat
  policy, and next-action meaning.
- MapGen-runs: Save & Deploy and Run in Game operation state, correlation,
  reconciliation, and semantic outcome.
- Qualified app adapters: exact filesystem/process effects and receipts.
- Projections: caller-shaped presentation of those public capabilities.

## Use This For

- Generated artifact, install, loader, log, capture, and live-behavior checks.
- Tuner connectivity or resource-epoch diagnosis.
- Window capture and Civ7 appshot diagnosis.
- Save & Deploy or Run in Game failures across operation and adapter receipts.
- Determining the strongest honest proof available for a claim.

## Non-Goals

- Do not make product or ownership decisions from logs.
- Do not edit generated output, deployed Mods trees, logs, or official-resource
  output by hand.
- Do not acquire Tuner or window capture inside a service, command, or test
  helper that should consume an app-bound capability.
- Do not interpret raw execution as gameplay success.
- Do not duplicate installed oRPC or Effect mechanics here; use owning source
  and the applicable global vendor skills.

## Default Workflow

1. **Name the claim.** Choose one: contract, deterministic execution,
   generated artifact, installation, loader, log, capture, live observation, or
   actor outcome.
2. **Name the owner.** Map the fact to resource/provider, control, play,
   MapGen-runs, adapter, projection, or app.
3. **Discover current surfaces.** Use Nx project descriptions and CLI `--help`;
   never begin from a remembered target or script.
4. **Bound the evidence window.** Record input identity, resource epoch where
   available, file digest/mtime, log offset or timestamp, operation/request id,
   and process/game identity.
5. **Run the narrowest owner gate.** Prefer a read-only check. Mutate only when
   the requested proof requires it and the selected public capability admits it.
6. **Reconcile across owners.** Keep accepted intent, physical effect receipt,
   dispatch, observation, and final outcome separate. Preserve ambiguity rather
   than retrying an uncertain mutation.
7. **Classify proof.** Apply `references/proof-boundaries.md` and state what the
   evidence does not prove.
8. **Recover at the owner.** Fix source/configuration at the semantic or effect
   owner, regenerate/redeploy through Nx, and repeat with a fresh evidence
   window.

## Discovery First

The following discovery commands are current and non-mutating:

```bash
bunx nx show projects
bunx nx show project civ7-cli --json
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js game play --help
```

For Swooper live work, also inspect `swooper-physics` and
`swooper-physics-mod`. Use the target names returned by Nx. Use exact CLI leaf
syntax only after its current `--help` confirms it.

## Reference Map

| Reference | Open when |
| --- | --- |
| `references/operational-paths.md` | Locating owner roots, generated/deployed evidence, logs, and resource/provider source |
| `references/debugging-workflow.md` | Running build/deploy, live-resource, MapGen-run, or projection diagnosis |
| `references/firetuner-runtime.md` | Diagnosing Tuner acquisition, scripting states, raw evidence, or native primitive discovery |
| `references/proof-boundaries.md` | Labeling claims and separating receipts from outcomes |

## Invariants

<invariants>
<invariant name="one-fact-one-owner">Raw resource facts, Civ7 semantic facts, gameplay outcomes, run outcomes, physical receipts, and projection results remain distinct.</invariant>
<invariant name="app-composes-live-capabilities">Qualified apps select providers, acquire resources, bind public clients, mount projections, and dispose the scope. Ordinary commands and services do not.</invariant>
<invariant name="generated-output-is-evidence">Generated and deployed files are evidence surfaces, never hand-edited source authority.</invariant>
<invariant name="deploy-does-not-prove-load">Installation proves the selected files were replaced. Loader acceptance and live behavior require separate evidence.</invariant>
<invariant name="correlation-is-required">A live claim records the resource epoch or other owner-issued identity, operation/request identity, exact inputs, and bounded observation window available for that capability.</invariant>
<invariant name="uncertain-mutations-are-not-repeated">An ambiguous dispatch is reconciled through fresh owner facts before any retry.</invariant>
<invariant name="commands-are-discovered">Nx and native CLI discovery are command authority; this skill does not preserve obsolete invocation syntax.</invariant>
</invariants>
