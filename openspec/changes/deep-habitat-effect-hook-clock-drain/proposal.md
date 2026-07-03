# deep-habitat-effect-hook-clock-drain

## Why

Hook runtime traces still defaulted to `Date.now()` inside
`core/domains/hook-runtime/runtime.ts`. That kept ambient time in reusable
domain code and made hooks an exception to the Effect-first clock/resource
substrate. Habitat hooks should keep explicit test/request clock overrides,
but live default time belongs to Effect `Clock`.

## What Changes

- Change hook timestamp acquisition to return an Effect using
  `HookRuntime.nowMs` when provided and Effect `Clock` otherwise.
- Update hook service trace recording to yield timestamps from Effect programs.
- Move command trace duration recording onto effectful timestamp helpers.
- Update the Habitat guard so hook runtime is no longer a direct `Date` edge
  and is an approved native `Clock` edge.

## Non-Goals

- Do not change hook CLI output, trace schema, command phases, staged-file
  behavior, provider routing, or hook exit semantics.
- Do not add a second clock abstraction, compatibility time helper, fallback
  `Date` path, or test-only topology check.
