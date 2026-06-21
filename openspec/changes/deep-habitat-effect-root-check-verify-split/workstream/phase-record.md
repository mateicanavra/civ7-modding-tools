# Workstream Phase Record: Root Check Verify Split

## Context

Fresh check-duration review found that root `check` included repo-wide
build/test/verify work. This made local command intent unclear and made routine
structural checks pay for all package validation by default.

## Decision

Split the root command contract:

- `bun run check`: diagnostic Habitat structural aggregate
- `bun run check:graph`: affected graph build/check/lint/test plus structural
  validation
- `bun run verify`: heavier verification aggregate
- `bun run ci`: full repo-wide graph aggregate

## Result

The root scripts now communicate cost and purpose directly. CI remains
authoritative by composing both loops explicitly.
