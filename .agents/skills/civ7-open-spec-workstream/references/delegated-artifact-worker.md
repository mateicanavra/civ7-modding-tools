# Delegated Artifact Worker

Use this reference when a workstream owner wants one grounded worker agent to
keep OpenSpec and workstream artifacts current while the owner stays focused on
implementation, architecture synthesis, and proof.

The repo-local agent file for this role is
`.agents/agents/openspec-workstream-artifact-worker.md`. Use the asset prompt
when launching through Codex multi-agent tooling or any system that does not
auto-discover repo-local agent files.

## Purpose

The artifact worker is not a second DRA and not a reviewer by default. It is a
context-preserving document operator for the phase-control layer:

- `proposal.md`, `design.md`, `tasks.md`;
- `workstream/phase-record.md`;
- `workstream/review-disposition-ledger.md`;
- `workstream/downstream-realignment-ledger.md`;
- `workstream/closure-checklist.md`;
- `workstream/next-packet.md`.

The owner still decides what is true. The worker makes the truth durable on
disk, flags contradictions, and preserves handoff quality.

## Information Shape

Design this pattern for a future DRA or workstream owner who needs to resume or
delegate quickly while under implementation pressure.

| Artifact | Reader Task | Navigation Shape |
|---|---|---|
| `SKILL.md` hook | Decide whether the workstream should use the pattern | Short trigger/routing entry |
| This reference | Understand when and how to operate the worker | Random-access sections by concern |
| Launch prompt asset | Start a worker without reconstructing instructions | Copy-forward checklist |
| Repo-local agent file | Run a reusable bounded role when the runner exposes agents | Self-contained system prompt |

Keep durable operating rules here. Put phase-specific facts in the active
OpenSpec change. Put copyable launch text in the asset. Do not duplicate the
same instruction across all layers unless the worker must see it without loading
this reference.

## When To Use

Use the worker when any of these are true:

- the phase will run through multiple implementation passes;
- the owner is repeatedly stopping to update routine artifact state;
- review findings or verification evidence need ledger updates;
- compaction risk is rising and state must be written before continuing;
- several OpenSpec changes are active and artifact drift is likely.

Do not use the worker for:

- architecture or product decisions;
- code implementation;
- generated output edits;
- Graphite merge/drain choices;
- final closure claims without owner review.

## Role Split

| Concern | Workstream Owner | Artifact Worker |
|---|---|---|
| Objective and scope | Owns | Mirrors |
| Authority synthesis | Owns | Names refs and flags conflicts |
| Implementation | Owns or delegates separately | Does not implement |
| Artifact edits | Reviews and accepts | Drafts and patches |
| Review findings | Dispositions | Records disposition text |
| Verification proof | Owns claim | Records commands/results |
| Closure | Owns | Prepares checklist and next packet |
| Graphite commits | Owns | Does not commit unless explicitly told |

## Launch Workflow

1. **Ground yourself first.** The owner reads the relevant skills and current
   phase artifacts before launching the worker. Do not use the worker to avoid
   understanding the workstream.
2. **Choose one standing worker.** Prefer one long-lived worker per workstream
   stack so it can tail the phase without rediscovering context every edit.
3. **Use a high-intelligence model.** In Codex multi-agent tooling, omit model
   overrides so the worker inherits the current frontier model. If an explicit
   override is required, prefer a frontier/high-reasoning coding model for
   ambiguous workstream artifacts. Do not use fast or mini models for this role
   unless the task is a purely mechanical checkbox update.
4. **Launch with the repo-local role when available.** Use
   `.agents/agents/openspec-workstream-artifact-worker.md` when the agent
   runner exposes repo-local agents. Otherwise launch a default worker with the
   full asset prompt. Keep the first prompt role-specific instead of asking for
   general help.
5. **Send the grounding packet.** Use
   `../assets/openspec-artifact-worker-prompt.md` and fill in the phase
   variables. Include the concrete write set and stop conditions.
6. **Keep the first pass read-only.** Ask the worker to inspect files and return
   an artifact plan before granting edits, unless the edit is small and
   unambiguous.
7. **Delegate bounded edits.** Give exact paths and facts to record. Avoid
   asking the worker to infer unsettled truth from chat.
8. **Review diffs.** The owner inspects the worker patch, runs validation, and
   stages/commits through the normal Graphite workflow.

## Grounding Packet Requirements

Every worker launch should include:

- repo path, branch, and parent;
- phase/change id and artifact directory;
- authority refs and skills to read;
- current objective and non-goals;
- exact write set;
- protected files/paths;
- current implementation facts to record;
- validation commands the worker may run;
- context budget instruction;
- output format.

The worker may inspect the owning thread or session transcript when the tooling
exposes it and the owner asks it to recover context. Treat thread context as a
secondary source: disk artifacts, git state, validation output, and explicit
owner facts outrank chat history.

For Civ7 OpenSpec workstreams, tell the worker to read at least:

- `.agents/skills/civ7-open-spec-workstream/SKILL.md`;
- `references/source-map.md`;
- `references/phase-loop.md`;
- `references/team-and-review-lanes.md`;
- `references/artifact-contracts.md`;
- `references/validation-checks.md`;
- the active `openspec/changes/<change-id>/` files;
- root `AGENTS.md` and any closest subtree router for edited files.

Add `dra-structural-watcher` only when the worker is also asked to audit
closure drift or watcher findings. Otherwise keep the role as artifact worker,
not watcher.

## Edit Protocol

The owner should delegate edits in this shape:

```text
Update these files only:
- openspec/changes/<change-id>/tasks.md
- openspec/changes/<change-id>/workstream/phase-record.md

Record these facts:
- <fact 1>
- <fact 2>

Do not infer additional completion.
Do not edit code.
Return a summary of changed paths and any ambiguity you found.
```

The worker should:

1. inspect `git status --short --branch`;
2. read the assigned artifact files before editing;
3. patch only the assigned files;
4. avoid changing task checkboxes unless the owner supplied the proof fact or
   the proof is present on disk;
5. preserve the artifact's existing voice and table shape;
6. run targeted validation only when asked or when the edit can break OpenSpec;
7. return changed paths, validation results, and unresolved ambiguity.

## Context Budget

The worker is responsible for its own context hygiene.

- Around 50% context use, it must write or return a compaction-safe handoff
  before reading more.
- It should prefer disk artifacts over chat replay.
- It should ask the owner for a compact facts packet rather than reading the
  whole session when a narrow update would suffice.
- If the tool supports a `/compact` or equivalent compaction command, the owner
  may send that before the next delegated edit.

A compaction-safe handoff must include:

- active phase/change id and artifact path;
- authority refs read;
- completed and open tasks;
- open findings and dispositions;
- latest gate results;
- dirty-file ownership;
- agent fleet state;
- downstream realignment state;
- exact next action.

If any field is unknown, the worker should say `unknown` rather than fabricate
state.

## Validation Gates

Before accepting worker edits, the owner should run the smallest gate that
matches the touched files:

- `bun run openspec -- validate <change-id> --strict` for a changed OpenSpec
  change;
- `bun run openspec:validate` before committing broad OpenSpec changes;
- `git diff --check` for all artifact edits;
- targeted searches when a ledger claims deletion or absence;
- focused app/package gates when the artifact records implementation proof.

The worker may run these gates, but the owner owns whether they are sufficient.

## Review Loop Fit

Use the smallest review loop that matches the risk of the worker output.
Routine artifact edits do not need review theater; closure-affecting edits do.

| Concern / Risk | Review Lane | Evidence Base | Forbidden Scope | Required Output |
|---|---|---|---|---|
| Worker edits could make future resumption slower | Information shape | Edited artifact diff plus this reference | Redesigning phase scope | P1/P2/P3 findings on reader/task/navigation fit, hierarchy, scent, signal-to-noise, progressive disclosure, multi-artifact placement, and handoff fields |
| Worker records findings or proof | Proof ledger | Review ledger, phase record, command output, searches | Re-running implementation | Findings on claim strength, missing evidence homes, or overclaim |
| Worker closes tasks or checklists | Closure readiness | Tasks, closure checklist, git status, validation output | Merging/draining branches | Findings on incomplete disposition, dirty state, or unproven closure |
| Worker changes generic guidance | Canonicality boundary | Skill/reference/agent diff | Adding phase-specific rules | Findings on generic-vs-subject drift and duplicate truth |

Disposition every material finding before accepting the worker patch. Use the
existing review disposition rules in `team-and-review-lanes.md` and the active
review ledger. Accepted P1/P2 findings block dependent work and closure until
repaired, rejected with source evidence, invalidated with later evidence, or
resolved by a user/authority decision. Use `waived` or `deferred` only for
P3/nonblocking findings unless higher authority explicitly changes that rule.

Accepted material findings must become repair demands naming the artifact/path,
evidence, expected change, owner, and whether closure is blocked.

## Failure Modes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Worker marks tasks complete from vibes | Completion proof was underspecified | Revert the checkbox, supply proof facts, and require evidence links |
| Worker turns into reviewer | Role boundary unclear | Split review into a separate watcher/reviewer lane |
| Worker edits code | Write set too broad | Stop the worker and relaunch with artifact-only scope |
| Worker bloats phase docs | No artifact contract anchor | Re-ground in `artifact-contracts.md` and request terse patch |
| Worker output is hard to resume from | Information shape lane was skipped | Review headers, first sentences, and handoff fields before accepting |
| Worker findings stay unresolved | Review-loop disposition was skipped | Classify each finding and repair, waive, reject, invalidate, or defer it |
| Owner trusts unreviewed patch | Delegation confused with ownership transfer | Owner reviews diff and validates before staging |
| Worker loses thread context | No budget rule or handoff | Ask for a compaction-safe handoff before new work |

## Relationship To Structural Watchers

The structural watcher finds violations and writes correction demands. The
artifact worker records accepted facts and keeps phase-control files current.
One agent can perform both roles only when explicitly launched with both
instructions and a clear mode boundary:

- **artifact-worker mode:** patch assigned artifacts, do not escalate unless
  ambiguity blocks the edit;
- **watcher mode:** inspect and report material violations, do not implement
  repairs.

Do not let a single delegated agent silently switch modes.
