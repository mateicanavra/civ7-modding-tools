# CLI Play Corpus

This ledger has the completed agent topology findings merged. It is still not
an implementation closeout ledger: do not start a slice until its row names the
active single writer, duplicate-removal boundary, validation commands, and
fixture owner.

The current command/test inventory was re-grounded from:

- `rg -n "static id = 'game play" packages/cli/src/commands/game/play -g '*.ts'`
- `rg -n "import GamePlay|describe\\('game play" packages/cli/test/commands -g '*.ts'`
- root `test:cli:play`

## Current Play Command Owners

The corpus currently contains 45 `game play` command modules and 28 canonical
play test suites. These rows are ownership inventory only; they do not accept
Task 2.9.4 matrix rows, change CLI output shape, or claim runtime proof.

| Command | Source | Current Test Owner | Fixture Owner | Proof Class | Status |
|---|---|---|---|---|---|
| `game play advisor-warning` | `packages/cli/src/commands/game/play/advisor-warning.ts` | `packages/cli/test/commands/game.play.operation-wrappers.test.ts` | local operation wrapper fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play assign-worker` | `packages/cli/src/commands/game/play/assign-worker.ts` | `packages/cli/test/commands/game.play.population-placement.test.ts` | local population placement fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play battlefield-scan` | `packages/cli/src/commands/game/play/battlefield-scan.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play build-production` | `packages/cli/src/commands/game/play/build-production.ts` | `packages/cli/test/commands/game.play.production.test.ts` | local production fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play build-unit` | `packages/cli/src/commands/game/play/build-unit.ts` | `packages/cli/test/commands/game.play.production.test.ts` | local production fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play buy-attribute` | `packages/cli/src/commands/game/play/buy-attribute.ts` | `packages/cli/test/commands/game.play.attribute-tradition.test.ts` | local attribute/tradition fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play change-tradition` | `packages/cli/src/commands/game/play/change-tradition.ts` | `packages/cli/test/commands/game.play.attribute-tradition.test.ts` | local attribute/tradition fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play choose-celebration` | `packages/cli/src/commands/game/play/choose-celebration.ts` | `packages/cli/test/commands/game.play.celebration-government.test.ts` | local celebration/government fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play choose-culture` | `packages/cli/src/commands/game/play/choose-culture.ts` | `packages/cli/test/commands/game.play.culture.test.ts` | local culture fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play choose-government` | `packages/cli/src/commands/game/play/choose-government.ts` | `packages/cli/test/commands/game.play.celebration-government.test.ts` | local celebration/government fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play choose-narrative` | `packages/cli/src/commands/game/play/choose-narrative.ts` | `packages/cli/test/commands/game.play.narrative.test.ts` | local narrative fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play choose-tech` | `packages/cli/src/commands/game/play/choose-tech.ts` | `packages/cli/test/commands/game.play.technology.test.ts` | local technology fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play civilian-route-triage` | `packages/cli/src/commands/game/play/civilian-route-triage.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play consider-attributes` | `packages/cli/src/commands/game/play/consider-attributes.ts` | `packages/cli/test/commands/game.play.attribute-tradition.test.ts` | local attribute/tradition fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play consider-town-project` | `packages/cli/src/commands/game/play/consider-town-project.ts` | `packages/cli/test/commands/game.play.town-focus.test.ts` | local town-focus fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play consider-traditions` | `packages/cli/src/commands/game/play/consider-traditions.ts` | `packages/cli/test/commands/game.play.attribute-tradition.test.ts` | local attribute/tradition fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play destination-analysis` | `packages/cli/src/commands/game/play/destination-analysis.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play dismiss-notification` | `packages/cli/src/commands/game/play/dismiss-notification.ts` | `packages/cli/test/commands/game/play/notification/dismiss.test.ts` | local exact notification dismissal fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play dismiss-notification-queue` | `packages/cli/src/commands/game/play/dismiss-notification-queue.ts` | `packages/cli/test/commands/game/play/notification/dismiss-queue.test.ts` | local queue dismissal fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play end-turn` | `packages/cli/src/commands/game/play/end-turn.ts` | `packages/cli/test/commands/game.play.end-turn.test.ts` | local turn-completion fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play expand-city` | `packages/cli/src/commands/game/play/expand-city.ts` | `packages/cli/test/commands/game.play.population-placement.test.ts` | local population placement fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play formation-snapshot` | `packages/cli/src/commands/game/play/formation-snapshot.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play front-summary` | `packages/cli/src/commands/game/play/front-summary.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play notification-queue` | `packages/cli/src/commands/game/play/notification-queue.ts` | `packages/cli/test/commands/game/play/notification/queue.test.ts` | local notification queue fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play notifications` | `packages/cli/src/commands/game/play/notifications.ts` | `packages/cli/test/commands/game/play/notification/hud.test.ts` | local notification HUD fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play operation` | `packages/cli/src/commands/game/play/operation.ts` | `packages/cli/test/commands/game.play.operation-wrappers.test.ts` | local operation wrapper fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play priorities` | `packages/cli/src/commands/game/play/priorities.ts` | `packages/cli/test/commands/game/play/priorities.test.ts` | local priority HUD/read fixtures | test-only read/projection | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play progress-dashboard` | `packages/cli/src/commands/game/play/progress-dashboard.ts` | `packages/cli/test/commands/game.play.progression-read.test.ts` | local progression read fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play promotion-readiness` | `packages/cli/src/commands/game/play/promotion-readiness.ts` | `packages/cli/test/commands/game.play.promotion-readiness.test.ts` | local promotion fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play ready-city` | `packages/cli/src/commands/game/play/ready-city.ts` | `packages/cli/test/commands/game/play/ready-city.test.ts` | local ready-city fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play ready-unit` | `packages/cli/src/commands/game/play/ready-unit.ts` | `packages/cli/test/commands/game/play/ready-unit.test.ts` | local ready-unit fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play rehydrate` | `packages/cli/src/commands/game/play/rehydrate.ts` | `packages/cli/test/commands/game.play.rehydrate.test.ts` | local/existing | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play resettle-unit` | `packages/cli/src/commands/game/play/resettle-unit.ts` | `packages/cli/test/commands/game.play.operation-wrappers.test.ts` | local operation wrapper fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play respond-diplomacy` | `packages/cli/src/commands/game/play/respond-diplomacy.ts` | `packages/cli/test/commands/game.play.diplomacy-response.test.ts` | local diplomacy fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play respond-first-meet` | `packages/cli/src/commands/game/play/respond-first-meet.ts` | `packages/cli/test/commands/game.play.first-meet.test.ts` | local first-meet fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play set-culture-target` | `packages/cli/src/commands/game/play/set-culture-target.ts` | `packages/cli/test/commands/game.play.culture.test.ts` | local culture fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play set-tech-target` | `packages/cli/src/commands/game/play/set-tech-target.ts` | `packages/cli/test/commands/game.play.technology.test.ts` | local technology fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play set-town-focus` | `packages/cli/src/commands/game/play/set-town-focus.ts` | `packages/cli/test/commands/game.play.town-focus.test.ts` | local town-focus fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play settlement-recommendations` | `packages/cli/src/commands/game/play/settlement-recommendations.ts` | `packages/cli/test/commands/game.play.settlement-recommendations.test.ts` | local settlement fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play target-candidates` | `packages/cli/src/commands/game/play/target-candidates.ts` | `packages/cli/test/commands/game.play.tactical-read.test.ts` | local tactical read fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play topics` | `packages/cli/src/commands/game/play/topics.ts` | `packages/cli/test/commands/game.play.topics.test.ts` | local/existing | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play traditions` | `packages/cli/src/commands/game/play/traditions.ts` | `packages/cli/test/commands/game.play.progression-read.test.ts` | local progression read fake | test-only read | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play unit-move-preview` | `packages/cli/src/commands/game/play/unit-move-preview.ts` | `packages/cli/test/commands/game/play/unit-move-preview.test.ts` | local unit-move fake | test-only read | Covered by canonical `test:cli:play`; relationship-label guarded. |
| `game play unit-target` | `packages/cli/src/commands/game/play/unit-target.ts` | `packages/cli/test/commands/game.play.unit-target.test.ts` | local unit-target fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |
| `game play upgrade-unit` | `packages/cli/src/commands/game/play/upgrade-unit.ts` | `packages/cli/test/commands/game.play.operation-wrappers.test.ts` | local operation wrapper fake | test-only; mutation-facing fake | Covered by canonical `test:cli:play`; no runtime claim. |

## Current Play Test Owners

The root `test:cli:play` script is the canonical aggregate for these owner
files. It is not a semantic-envelope acceptance gate.

| Test Owner | Commands / Surface Owned |
|---|---|
| `packages/cli/test/commands/game.play.attribute-tradition.test.ts` | `buy-attribute`, `change-tradition`, `consider-attributes`, `consider-traditions` |
| `packages/cli/test/commands/game.play.celebration-government.test.ts` | `choose-celebration`, `choose-government` |
| `packages/cli/test/commands/game.play.culture.test.ts` | `choose-culture`, `set-culture-target` |
| `packages/cli/test/commands/game.play.diplomacy-response.test.ts` | `respond-diplomacy` |
| `packages/cli/test/commands/game.play.end-turn.test.ts` | `end-turn` |
| `packages/cli/test/commands/game.play.first-meet.test.ts` | `respond-first-meet` |
| `packages/cli/test/commands/game.play.narrative.test.ts` | `choose-narrative` |
| `packages/cli/test/commands/game.play.operation-wrappers.test.ts` | `advisor-warning`, `operation`, `resettle-unit`, `upgrade-unit` |
| `packages/cli/test/commands/game.play.population-placement.test.ts` | `assign-worker`, `expand-city` |
| `packages/cli/test/commands/game.play.production.test.ts` | `build-production`, `build-unit` |
| `packages/cli/test/commands/game.play.progression-read.test.ts` | `progress-dashboard`, `traditions` |
| `packages/cli/test/commands/game.play.promotion-readiness.test.ts` | `promotion-readiness` |
| `packages/cli/test/commands/game.play.rehydrate.test.ts` | `rehydrate` |
| `packages/cli/test/commands/game.play.settlement-recommendations.test.ts` | `settlement-recommendations` |
| `packages/cli/test/commands/game.play.tactical-read.test.ts` | `battlefield-scan`, `civilian-route-triage`, `destination-analysis`, `formation-snapshot`, `front-summary`, `target-candidates` |
| `packages/cli/test/commands/game.play.technology.test.ts` | `choose-tech`, `set-tech-target` |
| `packages/cli/test/commands/game.play.topics.test.ts` | `topics` |
| `packages/cli/test/commands/game.play.town-focus.test.ts` | `consider-town-project`, `set-town-focus` |
| `packages/cli/test/commands/game.play.unit-target.test.ts` | `unit-target` |
| `packages/cli/test/commands/game.play.watch.test.ts` | watch surface baseline |
| `packages/cli/test/commands/game/play/notification/dismiss-queue.test.ts` | `dismiss-notification-queue` |
| `packages/cli/test/commands/game/play/notification/dismiss.test.ts` | `dismiss-notification` |
| `packages/cli/test/commands/game/play/notification/hud.test.ts` | `notifications` HUD/materialization |
| `packages/cli/test/commands/game/play/notification/queue.test.ts` | `notification-queue` |
| `packages/cli/test/commands/game/play/priorities.test.ts` | `priorities` |
| `packages/cli/test/commands/game/play/ready-city.test.ts` | `ready-city` |
| `packages/cli/test/commands/game/play/ready-unit.test.ts` | `ready-unit` |
| `packages/cli/test/commands/game/play/unit-move-preview.test.ts` | `unit-move-preview` |

## Completed Slice Ledger

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
| Exact dismiss notification | Moved from `GamePlayDismissNotification` in `game.play.test.ts`: `dismisses reviewed notifications only with `; `does not verify dismissal from stale nonblocking front evidence`; `does not verify dismissal from train absence while engine queue still fronts the target`; `does not verify dismissal from dismissed flag while engine queue still fronts the target` | `game/play/notification/dismiss.test.ts` | local exact `notificationDismissal` fake | test-only, mutation-facing fake; no runtime claim | Passed: focused `bun run --cwd packages/cli test -- game/play/notification/dismiss.test.ts`; adjacent `bun run --cwd packages/cli test -- game.play.test.ts game/play/notification/dismiss.test.ts game/play/notification/dismiss-queue.test.ts -t "dismiss|bulk|priorit|notifications|materializes|classifies"`; `bun run check:cli`; `bun run test:cli:play`; ownership scan shows exact dismiss owner only in `game/play/notification/dismiss.test.ts`. | Completed in exact dismiss slice. |
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
