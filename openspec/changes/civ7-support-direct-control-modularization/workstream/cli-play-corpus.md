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
| Exact dismiss notification | Moved from `GamePlayDismissNotification` in `game.play.test.ts`: `dismisses reviewed notifications only with explicit approval reason`; `does not verify dismissal from stale nonblocking front evidence`; `does not verify dismissal from train absence while engine queue still fronts the target`; `does not verify dismissal from dismissed flag while engine queue still fronts the target` | `game/play/notification/dismiss.test.ts` | local exact `notificationDismissal` fake | test-only, mutation-facing fake; no runtime claim | Passed: focused `bun run --cwd packages/cli test -- game/play/notification/dismiss.test.ts`; adjacent `bun run --cwd packages/cli test -- game.play.test.ts game/play/notification/dismiss.test.ts game/play/notification/dismiss-queue.test.ts -t "dismiss|bulk|priorit|notifications|materializes|classifies"`; `bun run check:cli`; `bun run test:cli:play`; ownership scan shows exact dismiss owner only in `game/play/notification/dismiss.test.ts`. | Completed in exact dismiss slice. |
| Notification HUD materialization | Moved from `GamePlayNotifications` in `game.play.test.ts`: materializes diplomacy response, technology, culture, celebration, government, narrative, stale command-units; reads materialized notifications without sending; classifies invalid-target notices and valid reports | `game/play/notification/hud.test.ts` | local HUD fake with named surface/mode builders only; no broad 24-mode catalog | test-only; no runtime claim | Passed: focused `bun run --cwd packages/cli test -- game/play/notification/hud.test.ts`; adjacent `bun run --cwd packages/cli test -- game.play.test.ts game/play/notification/hud.test.ts game/play/notification/queue.test.ts -t "materializes|classifies|notification HUD|schedules|priorit"`; `bun run check:cli`; `bun run test:cli:play`; ownership scan shows `GamePlayNotifications` only in `game/play/notification/hud.test.ts`, while monolith retains `GamePlayPriorities`, `readPlayNotifications`, and `playNotificationView` support. | Completed in HUD slice after parallel net-new candidate and DRA single-writer monolith/package integration. |
| Priorities | Moved from `GamePlayPriorities` in `game.play.test.ts`: 21 compact priority/routing tests across clean-read, unit-command, exact operations, chooser options, dismissal diagnostics, ready-city blockers, and stale command-units | `game/play/priorities.test.ts` | local priority HUD mode builder plus local ready-unit, ready-city, and battlefield scan fixtures; no broad shared catalog | test-only; no runtime claim; relationship-label guarded | Passed: focused `bun run --cwd packages/cli test -- game/play/priorities.test.ts`; adjacent notification/read-owner filter `bun run --cwd packages/cli test -- game/play/priorities.test.ts game/play/notification/hud.test.ts game/play/ready-city.test.ts game/play/ready-unit.test.ts game.play.tactical-read.test.ts -t "priorit|surfaces|routes|classifies|reads ready|relationship"`; `bun run check:cli`; `bun run test:cli:play`; ownership scan shows no remaining `game.play.test.ts`, `GamePlayPriorities` only in `game/play/priorities.test.ts`, and relationship-label scan limited to explicit negative assertions / `relationship-unproven` fixture policy. | Completed in priorities slice after parallel net-new candidate and DRA single-writer monolith/package integration. |

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
