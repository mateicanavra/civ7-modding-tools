# Design: Deep Habitat Effect Command Result Model

## Domain Boundary

Owner: command observation model.

This packet owns generic command execution observations. Grit, Biome, Nx, Git,
and Husky providers may extend or project from the generic model, but they do not
redefine generic command fields.

## Exact Target Files

```text
tools/habitat-harness/src/providers/command/request.ts
tools/habitat-harness/src/providers/command/result.ts
tools/habitat-harness/src/providers/command/observation.ts
tools/habitat-harness/src/providers/command/errors.ts
tools/habitat-harness/src/errors/provider-errors.ts
```

## Required Model

Use discriminated unions for command observations:

- `not-run`
- `completed`
- `failed`
- `interrupted`
- `tool-unavailable`
- `output-parse-failed`
- `schema-drift`

Each variant owns only the fields valid for that state. Do not model this as
optional soup on one interface.

## Field Owners

| Field | Owner |
| --- | --- |
| argv/cwd/env redaction | command model |
| stdout/stderr bounds and digest | command model |
| duration and timestamps | `HabitatClock` plus command model |
| before/after Git state | `GitProvider` |
| cache observation | provider that owns the cache |
| parse status | adapter that parses output |
| rendered message | boundary renderer |

## Stop Conditions

- Generic command model includes Grit-specific names.
- A command result has mutually exclusive optional fields instead of variants.
- Feature code string-matches stderr to classify expected failures.

## Follow-On Boundary

`CommandRunner` still captures before/after Git snapshots through the existing
`readGitState` helper. Moving that snapshot acquisition fully behind
`GitProvider` must be a separate branch because the current `GitProvider` is
itself command-runner-backed for live Git commands; doing both in one step would
create a provider cycle instead of a cleaner command model.
