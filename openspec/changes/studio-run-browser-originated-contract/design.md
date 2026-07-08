# Design

## Browser Admission Contract

The rendered UI owns only user input collection and public operation display.
It sends a closed public `runInGame.start` request through `/rpc` and receives
the admitted operation identity from the daemon. The browser never synthesizes
private diagnostics and never treats local in-progress state as runtime
authority.

## File Topology

Likely source write set:

- `apps/mapgen-studio/src/features/**/RunInGame*`
- `apps/mapgen-studio/src/features/operations/**`
- `apps/mapgen-studio/src/lib/orpc/**` or existing client boundary
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `packages/mapgen-studio-ui/src/components/panels/GameConsole.tsx`
- `packages/mapgen-studio-ui/src/components/panels/statusLabels.ts`
- `packages/mapgen-studio-ui/test/**`
- `apps/mapgen-studio/test/**` for UI/request construction tests
- `openspec/changes/studio-run-browser-originated-contract/workstream/**`

If reusable harness code is added, it belongs under the existing Studio test or
workstream harness location, not as a random root script.

## Evidence Shape

The packet introduces a durable distinction between:

- endpoint-originated request rows;
- browser-originated request rows;
- in-game observed rows.

This distinction is recorded in workstream evidence, not in public UI payloads.

## Comments

Anchor comments are appropriate at the operation-adoption boundary if they
explain why the browser follows daemon identity rather than owning operation
truth.
