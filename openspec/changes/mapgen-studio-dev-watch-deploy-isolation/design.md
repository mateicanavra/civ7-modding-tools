# Design — dev-watch deploy isolation (S1.1a)

## D1. The failure is an import-graph self-trigger

`bun --watch` restarts the daemon when files in its import graph change. S1.1
made recipe DAG structural inside the one `/rpc` surface, and the app-side
`defaultRecipeDagService` imported:

```ts
import { STANDARD_STAGES } from "mod-swooper-maps/recipes/standard";
import { BROWSER_TEST_STAGES } from "mod-swooper-maps/recipes/browser-test";
```

Those package exports point at `mods/mod-swooper-maps/dist/recipes/*.js`.
Play/Save&Deploy runs the mod build, which rewrites the same `dist` tree. The
operation therefore changes a file the daemon has loaded, so the watcher
restarts the process that owns the operation registry.

## D2. Source recipe stages are the smallest correct ownership boundary

The recipe-DAG service needs stage contracts, not the deployable recipe
artifacts. Swooper recipe source owns stage order and authoring metadata;
`dist/recipes/**` is a generated distribution artifact. Loading the source
stage modules keeps the daemon aligned with authoring truth while removing
deploy-written `dist` files from the daemon's watch graph.

The source modules are loaded through a runtime provider rather than static
top-level imports. That keeps the Studio TypeScript project from becoming the
compiler owner of the whole mod source tree; the mod package keeps its own
typecheck rules and Studio pins the integration boundary.

The source recipe graph does not import `mods/mod-swooper-maps/src/maps/configs`
or `src/maps/generated`; those remain operation-written outputs, but not daemon
imports. Vite already ignores them for the frontend watcher.

## D3. Deploy builds only the mod package during operations

Turbo's default topological behavior runs `^build` and, on cache hits, may
replay dependency outputs into package `dist` directories. The daemon imports
workspace package outputs such as `@swooper/mapgen-core/authoring`, so operation
deploy must not replay dependency builds while the daemon is alive.

The deploy command adds `--only`:

```text
bun x turbo run build --filter=mod-swooper-maps --only
```

That keeps operation-time writes scoped to the mod package outputs. Dev startup
and normal package gates still build dependencies through the existing Turbo
graph; S1.1a does not weaken CI or package verification.

## D4. Rejected alternatives

- **Bun watch-ignore bandage:** would encode the current output paths in the
  runner instead of fixing the owner boundary, and Bun's import graph would
  still contain generated artifacts.
- **Lazy import of `dist` recipe modules:** only delays the restart. Once the
  Pipeline DAG tab is opened, `dist/recipes/**` is loaded and subsequent deploy
  can still restart the daemon.
- **Subprocess recipe projection:** valid but larger than needed. It adds an
  IPC/process boundary to read static authoring metadata that the daemon can
  safely import from source.

## D5. Verification shape

Unit pins prove the static invariants: no daemon recipe-DAG import from
`mod-swooper-maps/recipes/*`, deploy build args include `--only`, and Vite
ignores the operation-written mod outputs. Live proof must falsify the actual
bug class: start Play and Save&Deploy from the dev app, observe
`studio.serverInfo.serverInstanceId` before and after the deploy phase, and
confirm it does not change.
