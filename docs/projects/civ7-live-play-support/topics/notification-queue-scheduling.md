# Notification Queue Scheduling

Status: `live-command-surface`.

## Frame

The play agent should be able to see the whole notification queue, decide an
order of work, and clear eligible informational reports in bulk. Volcanoes,
disasters, attacks, great works, and other informational notifications can
matter for strategy and tactics even when they do not expose a player
operation, so the bulk surface must classify before it acts.

`game play notification-queue` is the read-only scheduler:

- it reads the live notification HUD queue;
- it orders blockers before lower-priority queue items;
- it classifies each item as operation, ready-unit inspection,
  reviewed-dismissal candidate, handler inspection, or review-only;
- it emits command templates and guardrails;
- it does not send operations or dismiss notifications.

`game play dismiss-notification-queue` is the bulk closeout command:

- it reads the same fresh HUD queue;
- it selects only items classified as informational App UI dismissal
  candidates;
- it excludes gameplay operations, unit commands, progression, city,
  diplomacy, population, narrative, and unclassified notifications;
- it dry-runs by default;
- with `--send --reason`, it dismisses the eligible candidates up to
  `--max-dismissals` using the existing direct-control App UI dismissal wrapper.

## Command

```bash
bun packages/cli/bin/run.js game play notification-queue --json
bun packages/cli/bin/run.js game play dismiss-notification-queue --json
bun packages/cli/bin/run.js game play dismiss-notification-queue \
  --send \
  --reason "reviewed informational queue reports" \
  --json
```

Useful fields:

- `queueLength`: number of HUD queue items materialized.
- `schedule[].disposition`: one of `operate-with-live-inputs`,
  `reviewed-dismissal-candidate`, `inspect-ready-unit`, `inspect-handler`, or
  `review-only`.
- `schedule[].priority`: ordering score, with end-turn blockers highest.
- `schedule[].command`: next command template when one is known.
- `schedule[].guardrails`: why this item is not safe to blindly batch.
- `schedule[].safeToBatch`: true only for reviewed informational App UI
  dismissal candidates.

Bulk-dismiss output fields:

- `eligibleCount`: number of queue items that can be dismissed in this pass.
- `selectedCount`: number selected under `--max-dismissals`.
- `excluded[]`: queue items intentionally not dismissed and why.
- `results[]`: direct-control dismissal results when `--send` is used.
- `verified`: true only when every selected item returns a positive App UI
  dismissal result; a completed command with `result: false` still requires a
  fresh queue read.

## Norm

Use the scheduler when the HUD contains multiple notifications or when the
agent is at risk of spending too much time on low-risk informational items.

The desired loop is:

1. Read `game play notification-queue --json`.
2. Resolve the first end-turn blocker or consciously defer it.
3. Review informational notifications for tactical implications at the level
   the queue summary/location requires.
4. Run `game play dismiss-notification-queue --send --reason <reason>` to bulk
   clear eligible informational closeouts.
5. Re-read the queue after any send, dismissal, human input, or slow read.

## Why Bulk Dismissal Is Classified

Informational notifications are not empty. A river flood can change route
planning; an attack report can reveal a threatened Settler; a diplomatic report
can change relationship posture. But after the queue has classified them as App
UI informational closeouts, clearing them in bulk is the largest efficiency
gain.

The command therefore dismisses only the class we can defend from the live HUD:
`category == informational-notification`,
`operationFamily == app-ui-action`, and
`operationType == Game.Notifications.dismiss`. The direct-control dismissal
wrapper still checks the specific notification's live `canUserDismiss` and
after-state.

A broader bulk closeout class would need stronger preconditions:

- every target notification is still present in a fresh queue read;
- every item is classified as informational closeout or another proven
  closeout class;
- every item has a per-notification reason or a reviewed batch reason plus
  item-level summaries;
- no item is an end-turn blocker with an unhandled operation family;
- post-dismissal queue state is checked.

## Proof Boundary

The scheduler proves the current HUD queue and a conservative schedule derived
from the queue's live decision hints. The bulk-dismiss command proves that the
selected queue items were informational App UI dismissal candidates at read
time, then relies on the direct-control dismissal wrapper for per-notification
before/after proof when `--send` is used. Neither command proves that a gameplay
operation should be sent or that the queue will remain unchanged after the next
mutation.
