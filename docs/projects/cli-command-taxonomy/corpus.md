# Command Corpus Ledger — `game` mount

Point-in-time corpus of the `civ7 game` CLI surface (greps and counts taken
2026-06-11 against this stack). Decisions reference the decision log in
`workstream-record.md` (D1–D7). Governing grammar:
`docs/projects/civ7-live-play-support/topics/command-surface-design.md`.

Column key:

- **Layer**: which control layer the command speaks (direct-control socket,
  control-oRPC service, GameInfo reads, filesystem).
- **State**: which Civ7 tuner scripting state it targets (App UI, Tuner,
  offline).
- **Consumer**: who depends on it (play-agent, maintainer, proof-tooling,
  RHQ).
- **Refs**: doc-reference blast radius (grep count across `docs/` at corpus
  time; approximate, point-in-time).
- **Decision**: taxonomy disposition (D1–D7).

## Flat Tier (session-control singletons)

| Id | Summary | Layer | State | Consumer | Refs | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `game status` | control-oRPC readiness | control-oRPC | App UI + Tuner | play-agent | 91 | stays flat (D1) |
| `game health` | direct-control socket + Tuner canary | direct-control | App UI + Tuner | maintainer | 16 | stays flat (D1) |
| `game watch` | direct-control HUD observer | direct-control | App UI | play-agent (passive) | 59 | stays flat (D1); future play-grammar candidate |
| `game restart` | direct-control `Network.restartGame` mutation | direct-control | App UI | maintainer / autoplay-reset | 20+ | stays flat (D1); NOTE: restart rerolls the map seed — live-verified 2026-06-11 |
| `game visibility` | direct-control read or disposable reveal mutation | direct-control | App UI | proof-tooling | 9 | MOVES to `game map visibility` (D5, FULL migration); old id removed, repo refs retargeted |
| `game inspect` | direct-control reflection | direct-control | App UI + Tuner | maintainer | 17 | stays flat (D1) |
| `game map` | control-oRPC `world.*` reads | control-oRPC | App UI | play-agent map awareness | 148 | becomes noun topic (D2); flag-multiplex preserved as topic index |
| `game operation` | direct-control mutation gateway escape hatch | direct-control | Tuner | play-agent | 14 | stays flat (D1, per design doc: generic escape hatch) |
| `game exec` | direct-control raw JS | direct-control | App UI + Tuner | maintainer / proof | 43 | stays flat (D1) |
| `game autoplay` | direct-control Autoplay state machine | direct-control | Tuner | play-agent / maintainer | 43 | stays flat (D1) |
| `game gameinfo` | direct-control GameInfo reads | direct-control | Tuner | maintainer / proof | 12 | stays flat (D1); GameInfo is already the NATIVE Civ7 noun |
| `game catalog` | direct-control capability reflection | direct-control | App UI + Tuner | maintainer / proof | 9 | stays flat (D1) |
| `game ai loaded-levers` | GameInfo AI policy reads | direct-control (GameInfo) | Tuner | proof / RHQ | — | stays nested under `ai` (D1) |
| `game local-data inspect` | filesystem forensics (SQLite, saves, logs) | filesystem | offline | maintainer | 0 | stays nested under `local-data` (D1) |

## In-Flight (this stack, pre-merge — no aliases needed)

| Id | Summary | Layer | State | Consumer | Decision |
| --- | --- | --- | --- | --- | --- |
| `game map starts` | direct-control founder-unit-derived start-position read | direct-control | Tuner | proof-tooling | D3 (renamed from unmerged `game starts`) |
| `game play screen dismiss` | direct-control App UI display-queue cinematic dismissal | direct-control | App UI | play-agent | D4 (renamed from unmerged `game dismiss-cinematics`) |
| `game play screen show` | read-only display-queue screen listing (selector count + titles) | direct-control exec (read-only) | App UI | play-agent | D4 (new phase-verb sibling) |

## Play Tier (`game play/*`, 43 commands — out of scope, D7)

Migration of these into the unit/city/progress/notifications/trade/turn
grammar is owned by the command-surface-design roadmap, not this workstream.
One-liners for corpus completeness:

| Id | Summary |
| --- | --- |
| `game play advisor-warning` | Validate or acknowledge an advisor warning blocker |
| `game play assign-worker` | Validate or assign a city growth worker |
| `game play battlefield-scan` | Read a tactical battlefield lens around one or more origins |
| `game play build-production` | Validate or choose city production |
| `game play buy-attribute` | Validate or buy an attribute tree node |
| `game play change-tradition` | Validate or change an active tradition |
| `game play choose-celebration` | Validate or choose a celebration bonus |
| `game play choose-culture` | Validate or choose a culture tree node |
| `game play choose-government` | Validate or choose a government |
| `game play choose-narrative` | Validate or choose a narrative story direction |
| `game play choose-tech` | Validate or choose a technology node |
| `game play civilian-route-triage` | Read civilian route risk from settlement, battlefield, and destination lenses |
| `game play consider-attributes` | Validate or close out attribute assignment review |
| `game play consider-town-project` | Validate or close out town project review |
| `game play consider-traditions` | Validate or close out tradition assignment review |
| `game play destination-analysis` | Read tactical pressure around an intended destination |
| `game play dismiss-notification-queue` | Bulk dismiss reviewed informational notifications from the live queue |
| `game play dismiss-notification` | Inspect or dismiss a reviewed notification |
| `game play end-turn` | Check or send Civ7 end turn |
| `game play expand-city` | Validate or send a city expansion placement |
| `game play formation-snapshot` | Read ready-unit formation, escort, and civilian-screen context |
| `game play front-summary` | Read a composed front and formation summary without sending operations |
| `game play notification-queue` | Read and schedule the current notification decision queue |
| `game play notifications` | Read live play blockers with operation hints |
| `game play priorities` | Read a turn-priority dashboard without sending operations |
| `game play progress-dashboard` | Read local victory, legacy, age, and reward progress |
| `game play promotion-readiness` | Read promotion spend readiness for the selected or first ready unit |
| `game play ready-city` | Read the selected or blocking city with legal closeout operations |
| `game play ready-unit` | Read the selected or first ready unit with legal operations |
| `game play rehydrate` | Read the live session after restart or reconnect |
| `game play resettle-unit` | Validate or send a population resettle command |
| `game play respond-diplomacy` | Validate or send a diplomacy response |
| `game play respond-first-meet` | Validate or send a first-meet diplomacy greeting |
| `game play set-culture-target` | Validate or set a culture tree target node |
| `game play set-tech-target` | Validate or set a technology tree target node |
| `game play set-town-focus` | Validate or change a town focus project |
| `game play settlement-recommendations` | Read official settlement recommendation hints |
| `game play target-candidates` | Read strategic target candidates from live city and unit summaries |
| `game play topics` | List live-play topic families and reference shortcuts |
| `game play traditions` | Read current tradition slots and available policy actions |
| `game play unit-move-preview` | Read official unit movement, target, path, and queued-destination preview |
| `game play unit-target` | Resolve a unit plot target through the official right-click action order |
| `game play upgrade-unit` | Validate or send a unit upgrade command |

### Design-Doc Accuracy Table

Status of the command-surface-design.md Compatibility Path table against the
current corpus (none of the designed play-agent paths exist yet; the design
doc remains the owner of this migration, D7):

| Existing command | Designed play-agent path | Corpus status |
| --- | --- | --- |
| `game play priorities` | `game play todo` | exists as `priorities`; `todo` not implemented |
| `game play ready-unit` | `game play unit show unit:next` | exists as `ready-unit`; `unit` noun not implemented |
| `game play unit-target` | `game play unit targets` / `unit send target` | exists as `unit-target`; split not implemented |
| `game play operation` | `game play unit/city/player operation` | generic `game operation` is the live escape hatch (flat tier) |
| `game play notifications` | `game play notifications list` | exists as flat `notifications` read |
| `game play notification-queue` | `game play notifications schedule` | exists as `notification-queue` |
| `game play dismiss-notification-queue` | `game play notifications dismiss-reviewed` | exists as `dismiss-notification-queue` |
| `game play ready-city` | `game play city show city:ready` | exists as `ready-city`; `city` noun not implemented |
| `game play build-production` | `game play city production send` | exists as `build-production` |
| `game play choose-tech` / `choose-culture` | `game play progress tech send` / `progress culture send` | exist as flat choosers; `progress` noun not implemented |
| `game play civilian-route-triage` | `game play trade preview` or `unit preview route` | exists as `civilian-route-triage`; `trade` noun not implemented |
| — (new, this stack) | `game play screen show|dismiss` | IMPLEMENTED (D4) — first play noun landed in the designed grammar |

## Rivers-Branch Planned Arrivals (not on `main` — designated only, D6)

| Planned command | Designated home | Notes |
| --- | --- | --- |
| `camera` | `game view camera` | presentation/capture noun; camera read/positioning |
| `screenshot` | `game view screenshot` | native screenshot capture |
| `appshot` | `game view appshot` | app-window capture proof tooling |

`game view` is reserved; nothing lands there in this workstream.

## oclif Conventions Found

- Directory = topic: `commands/game/play/` makes `game play` a topic;
  `topicSeparator: " "` gives space-separated ids while manifest keys stay
  colon-separated (`game:play:end-turn`).
- Command-file + topic-dir coexistence is valid: `game/map.ts` beside
  `game/map/` emits both `game:map` (runnable index) and `game:map:*`
  subcommands (verified via manifest build in slice 2). `game/map/index.ts`
  is the equivalent long-term shape (slice 4).
- Aliases: declared as `static aliases = ['link:push']` (colon-separated
  ids); the only aliases in the repo today are `mod git *` → `link:*`. They
  work across topics (verified during this workstream; D5 ultimately chose
  full migration instead). There are no aliases or hidden
  commands in the `game` mount before this workstream.
- Mutation gating: the established read-first pattern gates mutations behind
  explicit flags — `--send` (play commands), `--disposable` (visibility
  reveal), `--reveal`, `--dry-run` (exec). New subcommands preserve these
  contracts verbatim.
- Each command declares `static id` matching its path-derived id (decorative
  but consistent); class names concatenate the id segments
  (`GameMapStarts`, `GamePlayScreenDismiss`).
