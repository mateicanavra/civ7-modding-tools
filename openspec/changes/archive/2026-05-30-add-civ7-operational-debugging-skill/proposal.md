## Why

Civ7 map failures are operationally diagnosed across source builds, generated
mod output, deployed Mods folders, and game logs. That evidence loop is durable
repo knowledge and should live in a generic repo-local skill, not in a chat or
feature-specific task note.

## Target Authority Refs

- `AGENTS.md`: preserve important durable repo knowledge in canonical docs or
  project-owned guidance.
- `.agents/skills/civ7-product-authority/SKILL.md`: build, generated output,
  deploy, logs, and in-game checks prove different claims.
- `.agents/skills/civ7-architecture-authority/SKILL.md`: generated artifacts
  and deployed output are evidence, not source authority.

## What Changes

- Add `.agents/skills/civ7-operational-debugging/`.
- Document operational paths, debugging workflow, and proof boundaries for
  Civ7 resources, build/deploy output, deployed mods, and logs.
- Keep the skill generic; no reef/marsh task notes or incident-specific status.

## Capabilities

### Modified Capabilities

- `change-management`: recognizes repo-local operational skills as durable
  process artifacts when they capture generic evidence loops.

## Verification Gates

- `bun run openspec -- validate add-civ7-operational-debugging-skill --strict`
- `bun run openspec:validate`
- `git diff --check`
