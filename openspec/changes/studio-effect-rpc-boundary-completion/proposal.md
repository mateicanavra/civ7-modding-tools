# Studio Effect RPC Boundary Completion

## Why

The Studio state-machine recovery frame requires every server RPC boundary to distinguish declared user/runtime failures from unexpected defects. Prior focused checks covered only part of the surface and missed `recipeDag.get`.

## What Changes

- Enumerate Studio read RPCs, live RPCs, stateful RPC mappings, `recipeDag.get`, and shared handler `onError` behavior.
- Preserve existing non-uniform status parity where it is product behavior, including `civ7.live.status` embedded field errors.
- Keep merged `@civ7/control-orpc` routes outside this packet except for shared handler behavior and downstream browser projection rows.

## Non-Goals

- No browser UI changes.
- No generated or deployed mod output edits.
- No live Civ7 success proof claim.

## Verification Gates

- `bun run openspec -- validate studio-effect-rpc-boundary-completion --strict`
- `nx run @civ7/studio-server:test --outputStyle=static`
- `nx run @civ7/studio-server:build --outputStyle=static`
