---
name: civ7-operational-debugging
description: |
  Use in the Civ7 Modding Tools repo when debugging operational behavior across official resources, generated mod output, deployed Mods folders, Civ7 logs, FireTuner, build/deploy scripts, or in-game verification. Trigger phrases include "check the deployed mod", "inspect Civ7 logs", "did deploy copy this", "is this in-game verified", "what did the game load", "verify build deploy logs", "debug mod runtime", "FireTuner", "restart from tuner", "autoplay", "compare resources to deployed output", and "what proof do we have from logs".
---

# Civ7 Operational Debugging

## Purpose

Use this skill when the question is operational: what was built, what was
deployed, what Civ7 loaded, what the logs say, and what can honestly be proven
from those observations.

This skill complements `civ7-architecture-authority` and
`civ7-product-authority`. Architecture/product skills decide ownership and
promises; this skill verifies runtime evidence without turning logs or generated
files into source authority.

## When To Use

- Inspecting `mods/<mod-slug>/mod/` output or the OS-level Civ7 `Mods/`
  directory.
- Checking whether `nx run <mod-project>:build`,
  `nx run <mod-project>:deploy`, or root `bun run deploy:mods` actually
  produced the expected files.
- Reading Civ7 `Logs/` files after launching the game or loading a map/mod.
- Using the direct Civ7 tuner socket to inspect a running Civ7 session, switch
  scripting states, restart a map, run autoplay, or inspect runtime JavaScript
  globals.
- Comparing official resources in `.civ7/outputs/resources` to repo modeling or
  generated mod behavior.
- Closing a claim that depends on build, deploy, log, or in-game evidence.

## Non-Goals

- Do not use this as a task log, design record, project plan, or issue ledger.
- Do not edit `dist/`, `mod/`, deployed Mods files, official resource outputs,
  or logs by hand.
- Do not use logs or deployed files to override source, architecture authority,
  product authority, ADRs, accepted project baselines, or OpenSpec records.
- Do not claim in-game correctness from build success, file presence, or a quiet
  log alone.
- Do not store task-specific debugging notes in this skill.

## Default Workflow

1. **Ground repo state.** Check branch, stack/worktree, dirty files, and the
   closest `AGENTS.md` for the source files involved.
2. **Name the operational question.** State whether you are proving build,
   generated output, deployment, log behavior, resource evidence, or in-game
   behavior.
3. **Locate the surfaces.** Use `references/operational-paths.md` for source
   mod paths, generated output, deployed mod locations, logs, and official
   resources.
4. **Run the narrow gate.** Use the smallest command or inspection that
   exercises the named surface: package build, package deploy, root deploy,
   deployed file inspection, log scan, direct tuner command, or in-game run.
5. **Compare source to output.** If inspecting generated or deployed files,
   connect every claim back to source inputs and scripts. Generated output is
   evidence, not the edit surface.
6. **Read logs after the action.** Use timestamps, file mtimes, or a before/after
   snapshot so stale log lines are not mistaken for the latest run.
7. **Classify proof.** Use `references/proof-boundaries.md` to label the result
   as build proof, deploy proof, log proof, in-game proof, resource evidence, or
   unresolved.
8. **Escalate to authority only when needed.** If the evidence implies a product
   or architecture change, switch to the corresponding authority skill before
   editing source or docs.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Operational paths | `references/operational-paths.md` | Finding repo output, deployed Mods, logs, official resources, or scripts |
| Proof boundaries | `references/proof-boundaries.md` | Closing claims from build, deploy, log, resource, or in-game evidence |
| Debugging workflow | `references/debugging-workflow.md` | Running an end-to-end operational pass without overclaiming |
| Tuner runtime | `references/firetuner-runtime.md` | Connecting through direct Civ7 control, choosing scripting states, restart/autoplay loops |

## Core Invariants

<invariants>
<invariant name="operation-before-theory">Name the exact runtime surface being inspected before drawing conclusions from files or logs.</invariant>
<invariant name="generated-output-is-evidence">`dist/`, `mod/`, deployed Mods folders, logs, and resource outputs are evidence surfaces. They are not hand-editable source authority.</invariant>
<invariant name="deploy-proves-copy-not-load">A successful deploy proves files were copied into the game data Mods directory. It does not prove Civ7 loaded or executed them.</invariant>
<invariant name="logs-prove-observation-not-absence">A log line proves an observed event. A quiet log only proves no matching line was found in the searched window.</invariant>
<invariant name="in-game-proof-requires-game-action">In-game proof requires launching Civ7 and exercising the relevant mod/map behavior, then tying the observation to logs or visible behavior from that run.</invariant>
<invariant name="tuner-state-matters">Direct tuner commands run against the selected Civ7 scripting state. Rediscover states and treat `App UI` and `Tuner` as separate API surfaces; `Network.restartGame()` and current autoplay control belong to `App UI` unless fresh evidence says otherwise.</invariant>
<invariant name="resource-evidence-stays-separate">Official resources describe game data facts. Repo source decides how those facts become SDK, adapter, MapGen, CLI, or mod behavior.</invariant>
<invariant name="proof-labels-are-mandatory">Close operational debugging by labeling each claim with the strongest evidence actually collected: built, generated, deployed, logged, in-game observed, or unresolved.</invariant>
</invariants>

## Anti-Patterns To Avoid

- Editing generated or deployed files to test a source hypothesis.
- Treating `bun run build` as proof that Civ7 can load the mod.
- Treating a copied mod directory as proof that the game selected the mod.
- Reading old log lines without bounding the run window.
- Treating official resources as proof of this repo's intended product contract.
- Turning a one-off incident into durable skill guidance.

## Quick Start

1. Open `references/operational-paths.md`.
2. State the proof surface: build, generated output, deploy, logs, resources, or
   in-game.
3. Run the matching gate from `references/debugging-workflow.md`.
4. Close with evidence-scoped claims from `references/proof-boundaries.md`.
