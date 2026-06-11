# Target Grammar — `civ7 game` mount

The full target tree for the `game` mount after this workstream's slices.
Decisions D1–D7 in `workstream-record.md`; grammar authority is
`docs/projects/civ7-live-play-support/topics/command-surface-design.md`
(noun-first, phase verbs `show|targets|preview|check|send`; native control
first; no casual breaking renames).

## Tree

```text
game                                  # the mount itself is the session noun (D1)
├── status                            # flat session tier (D1) — control-oRPC readiness
├── health                            # flat — socket + Tuner canary
├── watch                             # flat — HUD observer (future play-grammar candidate)
├── restart                           # flat — Network.restartGame (rerolls map seed)
├── autoplay                          # flat — Autoplay state machine
├── exec                              # flat — raw JS escape hatch
├── inspect                           # flat — reflection
├── operation                         # flat — mutation gateway escape hatch (per design doc)
├── catalog                           # flat — capability reflection
├── gameinfo                          # flat — GameInfo is already the native noun
├── ai
│   └── loaded-levers                 # GameInfo AI policy reads
├── local-data
│   └── inspect                       # offline filesystem forensics
├── map                               # noun topic (D2)
│   ├── (index)                       # current flag-multiplex preserved verbatim
│   │                                 #   --summary | --plot x,y | --bounds x,y,w,h
│   ├── summary                       # thin delegation: world.current
│   ├── plot                          # thin delegation: world.plot
│   ├── grid                          # thin delegation: world.grid
│   ├── starts                        # founder-unit-derived start positions (D3)
│   └── visibility                    # moved from `game visibility` (D5)
│                                     #   FULL migration: old id removed, refs retargeted
├── play                              # play-agent grammar (design-doc owned)
│   ├── screen                        # NEW play noun (D4)
│   │   ├── show                      # read-only: mounted display-queue screens
│   │   └── dismiss                   # drain cinematic moments (DisplayQueueManager)
│   ├── <43 existing flat commands>   # unchanged here; migration owned by
│   │                                 #   command-surface-design.md (D7):
│   │                                 #   unit/city/progress/notifications/trade/turn
│   └── (designed nouns, future)      # unit, city, notifications, progress,
│                                     #   trade, objective, map, turn — see design doc
└── view                              # RESERVED presentation/capture noun (D6)
    ├── camera                        # rivers-branch arrival (not on main)
    ├── screenshot                    # rivers-branch arrival (not on main)
    └── appshot                       # rivers-branch arrival (not on main)
```

## Tier Contracts

- **Flat session tier (D1).** Singletons that operate the session itself.
  They keep their ids forever-stable; no umbrella topics (`game session`,
  `game native`) are introduced. New session-control commands must argue for
  flatness explicitly (default is a noun home).
- **`game map` (D2/D3/D5).** Read-only world state. The index command is the
  compatibility surface — its flags never change semantics. Subcommands are
  thin delegations over the same control-oRPC/direct-control calls with
  focused flags. The only mutation under `map` is `visibility --reveal`,
  which keeps its `--disposable` gate verbatim.
- **`game play` (D4/D7).** The play-agent grammar. `screen` is the first
  noun landed in the designed shape: `show` (read) / `dismiss` (mutation by
  official close handler). All further noun gathering (unit, city, progress,
  notifications, trade, turn) follows the design doc's Priority Refactors —
  out of scope here, cross-linked as the D7 boundary.
- **`game view` (D6).** Reserved for presentation/capture commands arriving
  from the rivers branch (`camera`, `screenshot`, `appshot`). Nothing may
  squat on `view` in the meantime.

## Invariants

1. Pre-existing invocations on `main` keep working except where a decision
   record says otherwise: flat ids unchanged, `game map` flag-multiplex
   unchanged. `game visibility` is a recorded FULL migration to
   `game map visibility` (D5): old id removed, all repo references
   retargeted in the same slice.
2. Pre-merge commands may be renamed in place (D3/D4); merged commands move
   only with an explicit decision-logged migration that retargets every
   in-repo reference (D5) — removal is never silent.
3. New wrappers call `@civ7/direct-control` / `@civ7/control-orpc`; no
   caller-local runtime control. Read-only commands may compose one exec
   from exported selector/constant primitives (e.g. `game play screen
   show`).
4. Mutations stay flag-gated (`--send`, `--disposable`, `--reveal`) and
   keep the design doc's preview/check/send phase contract as nouns gather.
