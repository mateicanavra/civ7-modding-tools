# Command Surface Design

Status: `design-reference`.

## Frame

The `game play` surface grew out of live blocker fixes. That made useful tools
quickly, but it also left historical one-off names beside higher-level tactical
views. The design target is not a breaking rename. It is a stable play-agent
grammar that keeps current commands compatible while adding aliases and nested
subcommands around the domain model the play agent already uses.

The consumer is an AI play agent under turn pressure. It needs to discover the
next decision, preview legal choices, check validators, send approved actions,
and inspect postconditions without remembering raw Civ7 operation-family names
or writing component IDs by hand.

## Domain Grammar

Use domain nouns first, then phase verbs:

```text
game play status
game play todo
game play unit <show|targets|preview|check|send|operation>
game play city <show|production|growth|workers|check|send>
game play notifications <list|show|schedule|dismiss-reviewed>
game play progress <show|tech|culture|tradition|attribute|narrative>
game play trade <routes|preview|check|send>
game play objective <show|next|ledger>
game play map <summary|plot|grid|overlay>
game play turn <status|end>
```

The stable phase vocabulary is:

- `show`: compact current state;
- `targets` or `preview`: read-only choices and projected effects;
- `check`: validator/preflight without mutation;
- `send`: approved mutation with reason and postcondition;
- `operation`: generic escape hatch for raw Civ7 operation families;
- `debug`/`raw`: expansion modes, not default play surfaces.

This keeps `unit target`, `unit move`, `city production`, `progress tech`, and
`notifications schedule` in the agent's vocabulary while still allowing the
underlying direct-control layer to preserve `unit-operation`, `city-command`,
and `player-operation` contracts.

## Compatibility Path

Do not remove existing commands. Add wrappers or aliases first, and keep legacy
payloads behind `--raw` or an explicit compatibility contract while compact
play-agent output is introduced.

| Existing command | New play-agent path | Notes |
| --- | --- | --- |
| `game play priorities` | `game play todo` | Keep `priorities` as alias; `todo` should emphasize next actionable decision. |
| `game play ready-unit` | `game play unit show unit:next` | Also support structured IDs for exact units. |
| `game play unit-target` | `game play unit targets` and `game play unit send target` | Split read-only target enumeration from mutation. |
| `game play operation` | `game play unit operation`, `city operation`, `player operation` | Keep generic command as the escape hatch. |
| `game play notifications` | `game play notifications list` | Preserve raw notification read with `--raw`. |
| `game play notification-queue` | `game play notifications schedule` | Make scheduling a notifications subcommand. |
| `game play dismiss-notification-queue` | `game play notifications dismiss-reviewed` | Keep explicit reason and conservative categories. |
| `game play ready-city` | `game play city show city:ready` | City-specific grammar should own production/growth/worker decisions. |
| `game play build-production` | `game play city production send` | Add `preview` and `check` before send. |
| `game play choose-tech` / `choose-culture` | `game play progress tech send` / `progress culture send` | Keep `--closeout` until progress grammar owns closeout. |
| `game play civilian-route-triage` | `game play trade preview` or `game play unit preview route` by unit class | Route intent depends on whether the selected unit is a Merchant, Settler, or military unit. |

## Alias And Deprecation Policy

- Add aliases in one slice, then teach `game play topics` to prefer the new
  grammar.
- Keep old commands for live-play continuity until the active play thread and
  tests use the new names.
- Soft-deprecate only overloaded forms, not proven command behavior.
- Every new wrapper should call the existing direct-control package; do not add
  caller-local runtime control.
- Tests should assert both the alias and the canonical command until migration
  is complete.

## Priority Refactors

1. **Unit namespace.** Add `game play unit targets`, `unit preview move`,
   `unit check move`, and `unit send move`. This removes the current mix of
   `ready-unit`, `unit-target`, and generic `operation` from the main tactical
   loop. Risk: high until queued destination and movement postconditions are
   live-smoked.
2. **Notification namespace.** Move `notifications`, `notification-queue`, and
   dismiss queue behavior under one noun. Risk: medium because bulk dismissal
   must stay conservative and reason-gated.
3. **City namespace.** Group `ready-city`, `build-production`, `build-unit`,
   `assign-worker`, `expand-city`, and town focus workflows. Risk: medium; city
   operations have different arg shapes and placement requirements.
4. **Progress namespace.** Group tech, culture, traditions, attributes,
   narrative, and celebration. Risk: medium; node hashes and closeout behavior
   must stay visible.
5. **Summary-first output.** Apply the play-agent response contract to one read
   command and one mutation before flipping any defaults. Risk: medium because
   hidden raw fields can remove tactical evidence if expansion flags are weak.

## Design Checks

- Can the play agent find the next command from the noun it is thinking about?
- Does every mutation have a preview/check/send path?
- Is the default output enough to choose a next step without scanning large
  JSON?
- Is raw evidence still reachable when a decision is surprising or risky?
- Does the command name reflect the domain action rather than the implementation
  enum?
