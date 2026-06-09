# Restart Rehydration

Status: `promotable-reference`.

## Frame

After a game restart, reconnect, crash recovery, or human-side reload, the
agent's last remembered turn is only a hypothesis. The first job is not to
continue the old plan; it is to prove which live session the tuner is attached
to now.

Use `game play rehydrate --json` as the read-only restart snapshot. It composes
the live notification HUD with the current ready-unit view and optional
continuity expectations:

```bash
civ7 game play rehydrate --expected-turn <turn> --json
```

The command is deliberately a live runtime read. Local SQLite can label units,
types, notifications, and catalog facts, but it should not decide whether the
current turn, blocker, selected unit, ready unit, or validator result is still
fresh.

## What It Answers

`game play rehydrate` should be used whenever the active play thread may have
stale assumptions. It answers:

1. Which live turn/date is the game reporting now?
2. Is the expected turn/date/ready-unit still true?
3. What blocker and next HUD decision are currently present?
4. Which unit, if any, is currently first-ready and worth inspecting before
   tactical action?
5. Which follow-up shortcut is appropriate for the next read-only or validated
   step?

The important output is `snapshot.continuity.status`:

- `unchecked`: no expectations were supplied; treat the snapshot as a fresh
  baseline.
- `matches`: supplied expectations agree with the live HUD.
- `mismatch`: at least one expected turn/date/unit disagrees with the live HUD;
  discard stale plans and re-plan from this snapshot.

## Authority Boundary

This shortcut does not bypass the existing live control loop. It wraps it:

- `notifications`: live blocker, selected entity, first-ready unit, and
  decision HUD from direct-control.
- `readyUnit`: live unit summary, legal no-target operations, and nearby
  occupied plots when a ready unit is present.
- `continuity`: local comparison logic over caller-supplied expectations.
- `commonActions`: safe next reads or specialized shortcuts, not automatic
  sends.

SQLite and resource catalogs remain useful after the snapshot. Use them for
names, descriptions, costs, and static context. Before any mutation, still use
the live shortcut or validator matching the current blocker, and verify
postconditions after sends.

## Play-Agent Norm

When the active agent says the game restarted or live reads returned
`undefined`, run:

```bash
civ7 game play rehydrate \
  --expected-turn <last-known-turn> \
  --json
```

If the snapshot reports a mismatch, tell the play agent the concrete live
turn/date and current ready/blocker state. Do not ask it to continue a previous
tactical line unless the live state matches or a fresh read reconstructs the
same board.
