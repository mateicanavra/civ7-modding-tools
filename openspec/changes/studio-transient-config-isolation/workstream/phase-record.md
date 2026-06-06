# Phase Record: Studio Transient Config Isolation

## Status

Closed locally for the side-lane startup blocker; still part of the broader
stack-recovery workstream until committed.

## Evidence

- Restarting `bun run dev:mapgen-studio` failed because
  `studio-current.config.json` contained retired public config keys and was
  scanned as a standard shipped preset.
- `generate-map-artifacts.ts` already excluded `studio-current.config.json`;
  `generate-studio-recipe-types.ts` did not.

## Verification

- `bun run --cwd mods/mod-swooper-maps gen:studio-recipes-types` passed.
- `bun run --cwd mods/mod-swooper-maps gen:maps` passed and generated four
  shipped map configs.
- `bun test apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`
  passed.
- `curl -I http://127.0.0.1:5174/` returned `HTTP/1.1 200 OK` after restart.
