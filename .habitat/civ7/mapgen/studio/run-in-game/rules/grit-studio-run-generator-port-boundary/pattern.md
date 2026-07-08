---
level: error
---
# Grit Studio Run Generator Port Boundary

Packet 10 makes the Studio runtime expose one manifest-only generated-mod port.
The workflow invocation itself is behavior-tested; this rule keeps the source
boundary from reopening side channels. Generated workspace topology remains
Habitat structure territory, and generation bytes are behavior-tested.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RunInGameArtifactGenerator\.ts$",
    ! $body <: contains `generateRunInGameMod`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/ports/RunInGameArtifactGenerator\.ts$",
    ! $body <: contains `generationManifest: StudioRunGenerationManifestReference`
  },
  `materializeRunInGame` as $match where {
    $filename <: r".*packages/studio-server/src/.*"
  },
  `materializeRunInGame` as $match where {
    $filename <: r".*apps/mapgen-studio/src/server/.*"
  },
  or {
    `args.ports.generateRunInGameMod({ $..., requestId: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., input: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., prepared: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., workspaceRoot: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., outputRoot: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., generatedModRoot: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., launchEnvelope: $value, $... })`,
    `args.ports.generateRunInGameMod({ $..., resolvedLaunchSource: $value, $... })`
  } where {
    $filename <: r".*packages/studio-server/src/workflows/RunInGameWorkflow\.ts$"
  },
  or {
    `generateSwooperRunMod({ $..., requestId: $value, $... })`,
    `generateSwooperRunMod({ $..., input: $value, $... })`,
    `generateSwooperRunMod({ $..., prepared: $value, $... })`,
    `generateSwooperRunMod({ $..., workspaceRoot: $value, $... })`,
    `generateSwooperRunMod({ $..., outputRoot: $value, $... })`,
    `generateSwooperRunMod({ $..., generatedModRoot: $value, $... })`,
    `generateSwooperRunMod({ $..., launchEnvelope: $value, $... })`,
    `generateSwooperRunMod({ $..., resolvedLaunchSource: $value, $... })`
  } where {
    $filename <: r".*apps/mapgen-studio/src/server/studio/engines\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-server/src/ports/RunInGameArtifactGenerator.ts
export type RunInGameArtifactGenerator = Readonly<{
  generateRunInGameMod(args: { prepared: RunInGamePreparedRequest }): Promise<RunInGameGeneratedMod>;
}>;

// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const ports = {
  generateRunInGameMod: async ({ prepared }) =>
    generateSwooperRunMod({ manifestPath: prepared.manifestPath }),
};
```

## Ignores Fixture

```typescript
// @filename: packages/studio-server/src/ports/RunInGameArtifactGenerator.ts
export type RunInGameArtifactGenerator = Readonly<{
  generateRunInGameMod(
    args: Readonly<{
      generationManifest: StudioRunGenerationManifestReference;
      signal?: AbortSignal;
    }>
  ): Promise<RunInGameGeneratedMod>;
}>;

// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const ports = {
  generateRunInGameMod: async ({ generationManifest, signal }) => {
    return generateSwooperRunMod({
      repoRoot,
      manifestPath: generationManifest.path,
      signal,
    });
  },
};
```
