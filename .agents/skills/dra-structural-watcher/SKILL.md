---
name: dra-structural-watcher
description: |
  Use when running or setting up a DRA structural watcher, "keep watching" loop, watcher heartbeat, DRA correction lane, branch/stack closure watcher, closure overclaim audit, watcher handoff, NOTE-TO-DRA scan, or recurring automation that monitors worktrees, OpenSpec/spec drift, TODO/conflict markers, correction ledgers, and authority invariants without becoming an implementer. Pair with civ7-open-spec-workstream, civ7-product-authority, and civ7-architecture-authority when the watched scope touches Civ7/OpenSpec architecture work.
---

# DRA Structural Watcher

## Goal

Run a dedicated DRA structural watcher for an active OpenSpec implementation
workstream. The watcher keeps the workstream honest between
implementation passes by inspecting disk first, comparing actual repo state to
the supplied watcher context, detecting material architecture/product/OpenSpec
drift, and writing durable correction demands only when the implementation
workstream needs intervention.

The user supplies the specific watch context: worktrees, branches, invariants,
active correction themes, validation commands, and stop conditions. This skill
supplies the reusable watcher baseline.

## When To Use

- A user asks to keep watching an OpenSpec workstream, branch stack,
  archive closure, DRA correction lane, or recurring heartbeat.
- A watcher automation wakes up and asks for another pass.
- You need to create a new watcher prompt or hand off watcher state to another
  agent.
- You are reviewing whether active implementation has violated a supplied
  authority invariant, correction entry, or OpenSpec closure claim.

## Non-Goals

- Do not implement the watched refactor.
- Do not commit implementer work.
- Do not delete watcher notes, TODOs, or correction entries until the owning
  workstream has integrated and resolved them.
- Do not turn historical correction entries into fresh violations without new
  disk evidence.
- Do not treat OpenSpec as architecture authority. It is downstream change
  management for the active authority source set.
- Do not keep a stale heartbeat baseline when disk, branch heads, or current
  worktree state disagree.

## Default Workflow

1. **Load authority posture.** In this repo use
   `civ7-open-spec-workstream`, `civ7-product-authority`, and
   `civ7-architecture-authority` when the watched scope touches their trigger
   areas.
2. **Inspect disk before reasoning.** Check worktree list, current branch,
   dirty state, upstream sync, latest commit, diff, and tree hash for each
   registered worktree.
3. **Scan live control artifacts.** Find live `NOTE-TO-DRA*.md`, `NEW.md`, and
   `UPDATED.md` outside ignored/generated/archive paths. Scan for active
   `TODO:` comments and conflict markers. Read the top entries in
   `dra-watcher-corrections.md` or the workstream's selected correction log,
   then scan the full ledger for unresolved statuses and read any relevant
   open entry in full before making closure claims.
4. **Run focused invariant checks.** Convert the user-supplied watch context
   into bounded searches, validations, and diff hygiene checks. Prefer exact
   concern lanes over broad repo trawls.
5. **Classify what changed.** Distinguish quiet state, active implementer work,
   new commits, stale watcher baseline, historical-only evidence, material
   class violations, and closure overclaims.
6. **Debounce active work.** If files are dirty or commits just landed, inspect
   enough to understand the lane before escalating. Do not interrupt normal
   implementer churn unless the material violation remains after the relevant
   evidence is available.
7. **Escalate only material violations.** When a real class violation remains,
   write or update the local `NOTE-TO-DRA.md` in the relevant tree and prepend
   the watcher correction log with violation, principle, rationale,
   necessary-and-sufficient repair demand, evidence, and status.
8. **Report the pass.** Return a concise watcher decision. Use `DONT_NOTIFY`
   for quiet or control-only passes. Use `NOTIFY` only when user action or DRA
   intervention is warranted.

## Progressive References

| Reference | Path | Open When |
|---|---|---|
| Pass loop | `references/pass-loop.md` | Running a watcher pass end to end |
| Automation and output | `references/automation-and-output.md` | Setting up or continuing a recurring watcher |
| Correction protocol | `references/correction-protocol.md` | Writing watcher notes or correction ledger entries |
| Invariant scan recipes | `references/invariant-scan-recipes.md` | Turning supplied watch context into bounded searches |
| Variants | `references/variants.md` | Handling dirty worktrees, new commits, archive branches, closure claims, or handoffs |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| DRA note template | `assets/note-to-dra-template.md` | Creating a watcher note for a material violation |
| Correction entry template | `assets/correction-entry-template.md` | Prepending a durable watcher correction entry |
| Heartbeat output template | `assets/heartbeat-output-template.md` | Reusing compact XML heartbeat decisions |

## Core Invariants

<invariants>
<invariant name="disk-first">Every pass starts from current disk and Git state. Heartbeat text is context, not authority over actual branch heads, dirty files, or notes.</invariant>
<invariant name="watcher-is-not-implementer">A watcher may write watcher notes and correction ledger entries. It does not edit implementation code, repair the refactor, or commit implementer changes.</invariant>
<invariant name="specific-context-supplied">The reusable watcher baseline does not decide what product or architecture to watch. The user or owning DRA supplies the concrete invariants, worktrees, branches, scans, and stop conditions.</invariant>
<invariant name="materiality-threshold">Watcher escalation is for material class violations, wrong-owner drift, closure overclaims, unresolved P1/P2 findings, live conflict markers, or active control artifacts. Historical mentions and expected negative guard text are not violations by themselves.</invariant>
<invariant name="durable-corrections">A correction is not understood until it is made durable in a note, correction ledger, OpenSpec/workstream artifact, repo routing rule, skill authority update, guard, test, or closure language.</invariant>
<invariant name="debounce-active-work">Dirty worktrees and fresh commits are inspected before escalation. The watcher should not race an implementer who is actively integrating the same correction.</invariant>
<invariant name="notes-are-control-inputs">`NOTE-TO-DRA*.md`, watcher TODOs, and watcher correction log entries are direction on the user's behalf, not incidental scratch.</invariant>
<invariant name="evidence-bound-reporting">Watcher reports name the evidence boundary: clean/synced, dirty/debounced, validated, historical-only, unresolved violation, or blocked by missing data. Do not claim closure from silence alone.</invariant>
<invariant name="clean-handoff">At handoff or closure, leave watcher-authored edits committed or explicitly owned, and leave implementation work untouched unless the user changes the role.</invariant>
</invariants>

## Quick Start

1. Read the user-provided watcher context and list registered worktrees.
2. Load the paired Civ7/OpenSpec authority skills for the watched concern.
3. Run the pass loop in `references/pass-loop.md`.
4. If the pass is quiet, respond with a short `DONT_NOTIFY` decision and the
   evidence checked.
5. If a material violation remains, follow `references/correction-protocol.md`
   before responding.
