# Automation And Output

Use this when creating, continuing, or handing off a watcher automation.

## Automation Shape

Prefer a heartbeat automation attached to the current thread when the watcher
should continue a live DRA conversation. Use a cron/worktree automation only
when the watcher should run detached from the thread or across a workspace on a
regular schedule.

The automation prompt should be self-sufficient and include:

- watcher name and role;
- registered worktrees and branches;
- last known clean heads/tree hashes, clearly labeled as baseline context;
- current authority/correction invariants to enforce;
- required disk-first inventory;
- focused validation and search commands or concern lanes;
- ignored paths and retired worktrees;
- debounce rules for dirty implementer work;
- note and correction ledger protocol;
- output decision semantics.

Do not encode raw schedule mechanics inside the task prompt. Use the automation
tool fields for schedule, destination, workspace, and model settings.

## Heartbeat Output

Use the output format requested by the automation or user. If no richer report
is needed, keep the heartbeat decision compact:

```xml
<heartbeat>
  <automation_id>example-watcher</automation_id>
  <decision>DONT_NOTIFY</decision>
  <message>Watcher pass is quiet: registered worktrees are clean/synced, no live watcher notes appeared, TODO/conflict scans are historical-only, validation passed, and focused drift scans found only expected guard evidence.</message>
</heartbeat>
```

Use `NOTIFY` only when the user or owning DRA should act:

```xml
<heartbeat>
  <automation_id>example-watcher</automation_id>
  <decision>NOTIFY</decision>
  <message>Material watcher correction written: the archive branch now claims closure while a live NOTE-TO-DRA.md and blocking correction row remain unresolved.</message>
</heartbeat>
```

## Continuation Packet

For compaction-safe watcher handoff, record:

- current branch stack and registered worktrees;
- clean/dirty state and current heads;
- live watcher notes or absence of them;
- latest correction ledger entries and dispositions;
- validation/scans that were last observed;
- expected historical false positives;
- retired cleanup worktrees and paths not to touch;
- exact next pass commands or concern lanes.

## Notification Bar

Default to `DONT_NOTIFY` for quiet passes, stale baseline correction, expected
negative guard text, historical archive mentions, and active work that is still
being integrated.

Use `NOTIFY` for live conflicts, unresolved material violations, note/correction
creation, unexpected unmerged state, stack corruption, validation failure that
blocks closure, or a closure claim that outruns the evidence.
