# CLI Play Corpus

This ledger has the completed agent topology findings merged. It is still not
an implementation closeout ledger: do not start a slice until its row names the
active single writer, duplicate-removal boundary, validation commands, and
fixture owner.

| Owner | Current Tests | Target Owner File | Fixture Owner | Proof Class | Validation / Stop Condition | Status |
|---|---|---|---|---|---|---|
| Tactical read | extracted | `game.play.tactical-read.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Watch | extracted | `game.play.watch.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Topics | extracted | `game.play.topics.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Promotion readiness | extracted | `game.play.promotion-readiness.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Rehydrate | extracted | `game.play.rehydrate.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Settlement recommendations | extracted | `game.play.settlement-recommendations.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Ready city | extracted | `game/play/ready-city.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Unit move preview | extracted | `game/play/unit-move-preview.test.ts` | local/existing | test-only | Baseline evidence only; preserve host/port user note. | Completed before this change. |
| Ready unit | extracted | `game/play/ready-unit.test.ts` | local/existing | test-only | Baseline evidence only. | Completed before this change. |
| Notification queue | extracted | `game/play/notification/queue.test.ts` | local fake | test-only | Baseline evidence only. | Completed before this change. |
| Dismiss notification queue | extracted | `game/play/notification/dismiss-queue.test.ts` | local fake | test-only | Baseline evidence only. | Completed before this change. |
| Exact dismiss notification | `GamePlayDismissNotification` in `game.play.test.ts`: `dismisses reviewed notifications only with explicit approval reason`; `does not verify dismissal from stale nonblocking front evidence`; `does not verify dismissal from train absence while engine queue still fronts the target`; `does not verify dismissal from dismissed flag while engine queue still fronts the target` | `game/play/notification/dismiss.test.ts` | start local with exact `notificationDismissal` fake; promote only if reused by queue/direct-control atom tests | test-only, mutation-facing fake; no runtime claim | Focused filter: `dismisses reviewed notifications|does not verify dismissal`; adjacent with `game/play/notification/dismiss-queue.test.ts`; ownership scan for `GamePlayDismissNotification`, `readNotificationDismissal`, and test names. | Planned next CLI slice after fixture strategy. |
| Notification HUD materialization | `GamePlayNotifications` in `game.play.test.ts`: materializes diplomacy response, technology, culture, celebration, government, narrative, stale command-units; reads materialized notifications without sending; classifies invalid-target notices and valid reports | `game/play/notification/hud.test.ts` | named notification HUD fixture split by surface/mode; no broad 24-mode catalog | test-only | Focused filter: `materializes|classifies .* notices|classifies valid diplomatic`; adjacent with `notification/queue.test.ts`; scan `GamePlayNotifications`, `readPlayNotifications`, `playNotificationMode`. | Planned after exact dismiss. |
| Priorities | `GamePlayPriorities` in `game.play.test.ts`: 21 compact priority/routing tests across clean-read, unit-command, exact operations, chooser options, dismissal diagnostics, ready-city blockers, and stale command-units | `game/play/priorities.test.ts` or deeper split after fixture strategy | named priority scenario builder only after HUD/ready/dismiss fixtures have owners | test-only; high relationship-label risk | Focused filter: `priorit|surfaces|routes|classifies stale`; adjacent with ready-city, ready-unit, tactical-read; scan relationship-label terms and duplicate coverage. | Planned last; do not extract before HUD. |

## Fixture Strategy From Agent Reports

- Keep `packages/cli/test/commands/fixtures/tuner-socket-server.ts` as the
  shared transport fake.
- Split monolith-local notification HUD builders by named surface/mode before
  HUD extraction; do not import a broad 24-mode catalog into every suite.
- Keep command-specific send validation/postcondition fakes local until two or
  more owners require the same fixture.
- Keep tactical/relationship fixtures isolated and preserve
  `relationship-unproven`, `relationshipProof: none`, and no
  `enemy|hostile|opponent|threat|war|ally|suzerain` wording without official
  evidence.
