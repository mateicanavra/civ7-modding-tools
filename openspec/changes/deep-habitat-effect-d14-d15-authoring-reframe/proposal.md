# Change: Deep Habitat Effect D14 D15 Authoring Reframe

## Why

D14/D14A and D15 must remain distinct from the Effect substrate migration.
Authored artifact authority and execution provenance have their own trigger
conditions and should not be silently absorbed by runtime work.

## What Changes

- Reconfirm D14 as authoring fence/refusal authority.
- Reconfirm D14A as authored `.habitat` artifact placement authority.
- Reconfirm D15 as command-observation trigger protocol only.
- Define future authoring topology prerequisites in terms of accepted domain and
  provider services.

## What Does Not Change

- No execution provenance DTO expansion.
- No product-specific authoring parser.
- No `.habitat` placement change.

## Verification

- `bun run openspec -- validate deep-habitat-effect-d14-d15-authoring-reframe --strict`
- `bun run openspec:validate`
- `git diff --check`
