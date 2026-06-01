## Implementation Evidence

The repo-local operational skill was added at:

```text
.agents/skills/civ7-operational-debugging/
```

It documents Civ7 source/build/deploy/log/resource evidence loops generically,
without reef/marsh task status or feature-specific diagnosis. It routes
architecture, product, OpenSpec, and Graphite authority back to the existing
Civ7 skills instead of becoming a dumping ground.

## Verification

- `bun run openspec -- validate add-civ7-operational-debugging-skill --strict`
  passed.
- `bun run openspec:validate` passed.
- `git diff --check` passed.
