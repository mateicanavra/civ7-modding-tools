# D0 Baseline Oracle Ledger

Date: 2026-06-14
Scope: falsification-first proof that the one-mount baseline is real enough for D1-D12 packet authoring.

## Oracle Matrix

| Oracle | Command / source | Result | Adequacy criterion |
| --- | --- | --- | --- |
| One `/rpc` handler serves all namespaces | `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts` | Passed: 2 files, 10 tests | A real handler serves studio, control, and recipe-DAG namespaces through one `/rpc` prefix. |
| Retired mounts are actively rejected | Same focused test command | Passed | `/api/civ7/rpc/*`, `/api/recipe-dag/rpc/*`, and unrelated paths return 404 rather than invoking satellite handlers. |
| Namespace collision guard exists | `apps/mapgen-studio/test/server/oneMount.test.ts` | Covered in focused test run | Studio `civ7.*` entries and control namespaces cannot shadow each other silently. |
| Structural session injection is pinned | `apps/mapgen-studio/test/server/oneMount.test.ts` | Covered in focused test run | Control calls receive the shared session object and timeout through the unified handler context. |
| Recipe-DAG typed error survives the move | `apps/mapgen-studio/test/server/oneMount.test.ts` | Covered in focused test run; stderr shows expected `RECIPE_DAG_RECIPE_NOT_FOUND` oRPC error | Recipe DAG not-found remains a declared typed error, not a generic transport failure. |
| Retired satellite client/path files are gone | `find apps/mapgen-studio/src -path '*civ7ControlOrpcClient*' -o -path '*studioServerClient*' -o -path '*nodeWebBridge*' -o -path '*shared/civ7ControlOrpc*' -o -path '*shared/recipeDagOrpc*' -o -path '*studioServer/rpcPath*' -o -path '*recipeDag/orpc*'` | No output | Deleted satellite modules do not exist in app source. |
| Retired satellite path references are only comments/tests | `rg -n "/api/civ7/rpc|/api/recipe-dag/rpc|shared/civ7ControlOrpc|shared/recipeDagOrpc|civ7ControlOrpcClient|studioServerClient|nodeWebBridge|isStudioServerRpcPath|recipeDagOrpc|CIV7_CONTROL_ORPC_PATH|RECIPE_DAG_ORPC_PATH" apps/mapgen-studio/src packages/studio-server/src packages/studio-server/test apps/mapgen-studio/test/server` | Matches only explanatory comments and tests that assert retired paths 404 | Active production code has no satellite clients, path constants, or alternate handler modules. |

## Generated Output Guard

Root build generated ignored outputs and rewrote one tracked generated UI bundle:

- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`

Disposition:

- The tracked generated bundle was reverted because D0 is documentation-only and generated artifacts are outside its write set.
- Closure requires `git status --short --branch` to show only D0 packet docs before commit.
- Future implementation packets that intentionally regenerate this bundle must own the generation command, review the diff, and name the implementation reason.

## Restack Adoption Limit

These June 14 oracles prove the accepted one-mount transport baseline from the packet-authoring branch. On 2026-06-15 the runtime Effect stack was restacked onto the accepted Habitat/Nx baseline and adopted in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-S-studio-runtime-effect-refactor`.

Current baseline proof recorded in `phase-record.md` shows local Nx `v22.7.5`, `mapgen-studio` project metadata, `mod-swooper-maps` project metadata, and strict D0 OpenSpec validation. That proof does not close D11: the current `mapgen-studio:dev` target still delegates to package `dev`, whose metadata runs `bun src/server/daemon/devLive.ts`. D11 owns deleting that supervisor and proving Nx-native continuous backend/frontend orchestration.
