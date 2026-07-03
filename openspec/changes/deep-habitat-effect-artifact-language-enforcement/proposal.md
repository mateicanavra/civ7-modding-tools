# Change: Deep Habitat Effect Artifact Language Enforcement

## Why

The refactor must enforce the `.habitat` authored-artifact boundary and block
generic Habitat vocabulary drift after domain/provider migration.

## What Changes

- Add guardrails for authored authority data placement.
- Add guardrails for public/internal and domain/provider import boundaries.
- Add guardrails for host/product/process vocabulary in generic Habitat code and
  public surfaces.

## What Does Not Change

- No product authoring packet is opened.
- No executable code is moved into `.habitat`.

## Verification

- Injected violation fixtures for artifact and language guards.
- `bun run habitat check --tool habitat --json`
- `bun run openspec -- validate deep-habitat-effect-artifact-language-enforcement --strict`
- `git diff --check`
