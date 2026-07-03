---
level: error
---
# Require Sanctioned Direct-Control Session Owners

App and package code must not construct caller-local Civ7 direct-control
sessions outside the sanctioned session owner files.

```grit
language js(typescript)

`new Civ7DirectControlSession($args)` where {
  $filename <: r".*(?:apps|packages)/.*\.tsx?$",
  ! $filename <: includes "packages/studio-server/src/services/Civ7TunerSession.ts",
  ! $filename <: includes "packages/civ7-direct-control/src/session/session.ts",
  ! $filename <: includes "/test/",
  ! $filename <: includes "/tests/",
  ! $filename <: includes ".test.ts",
  ! $filename <: includes ".test.tsx"
}
```

## Matches fixture

```typescript
// @filename: apps/mapgen-studio/src/features/liveRuntime/session.ts
const session = new Civ7DirectControlSession({ host: "127.0.0.1" });

// @filename: apps/mapgen-studio/src/server/runInGame/session.ts
const session = new Civ7DirectControlSession();

// @filename: packages/cli/src/commands/game/session.ts
const session = new Civ7DirectControlSession({ port: 4318 });

// @filename: packages/studio-server/src/routes/session.ts
const session = new Civ7DirectControlSession(options);

// @filename: packages/civ7-control-orpc/src/modules/demo/procedure.ts
const session = new Civ7DirectControlSession(options);

// @filename: apps/mapgen-studio/src/features/liveRuntime/session.tsx
const session = new Civ7DirectControlSession({ host: "127.0.0.1" });
```

## Ignores fixture

```typescript
// @filename: packages/studio-server/src/services/Civ7TunerSession.ts
const session = new Civ7DirectControlSession(directControlOptions);

// @filename: packages/civ7-direct-control/src/session/session.ts
const session = new Civ7DirectControlSession(options);

// @filename: packages/civ7-direct-control/test/shared-session.test.ts
const session = new Civ7DirectControlSession({ host: "127.0.0.1" });

// @filename: packages/civ7-direct-control/tests/shared-session.ts
const session = new Civ7DirectControlSession({ host: "127.0.0.1" });

// @filename: tools/habitat/src/session.ts
const session = new Civ7DirectControlSession(options);

// @filename: apps/mapgen-studio/src/features/liveRuntime/session.ts
const sessionFactory = Civ7DirectControlSession;

// @filename: apps/mapgen-studio/src/features/liveRuntime/session.ts
const source = "new Civ7DirectControlSession()";

// @filename: apps/mapgen-studio/src/features/liveRuntime/session.ts
const session = withCiv7DirectControlSession(run);
```
