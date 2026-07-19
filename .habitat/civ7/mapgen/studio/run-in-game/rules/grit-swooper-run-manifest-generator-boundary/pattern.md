---
level: error
---
# Grit Swooper Run Manifest Generator Boundary

Packet 8 makes request-local Swooper generation manifest-only. The executable
command owns argument parsing only. The generator port owns reading the private
workspace manifest, deriving the `generated-mod` root from that manifest path,
rendering the request-local file plan, and routing writes through the shared
`@civ7/plugin-files/generated-file-plan` capability. Generated file bytes, row identity, script path, and
correlation markers are behavior-tested; this rule guards the durable topology.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-run-manifest\.ts$",
    ! $body <: contains `const manifestPath = parseSwooperRunManifestPathArg(process.argv.slice(2))`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-run-manifest\.ts$",
    ! $body <: contains `await generateSwooperRunGeneratedModFromManifestPath(manifestPath)`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$",
    ! $body <: contains `export async function generateSwooperRunGeneratedModFromManifestPath($manifestPath): $returnType { $... }`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$",
    ! $body <: contains `const generatedModRoot = resolveSwooperRunGeneratedModRoot(manifestPath, $manifest)`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$",
    ! $body <: contains `buildSwooperRunGeneratedModFilePlan`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$",
    ! $body <: contains `import { $..., applyGeneratedFilePlan, $... } from "@civ7/plugin-files/generated-file-plan"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$",
    ! $body <: contains `await applyGeneratedFilePlan(plan, { outputRoot: generatedModRoot })`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/project\.json$",
    ! $body <: contains `"gen:run-manifest"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/project\.json$",
    ! $body <: contains `"command": "bun ./scripts/generate-run-manifest.ts"`
  },
  or {
    `import { $..., writeFile, $... } from "node:fs"`,
    `import { $..., writeFileSync, $... } from "node:fs"`,
    `import { $..., appendFile, $... } from "node:fs"`,
    `import { $..., appendFileSync, $... } from "node:fs"`,
    `import { $..., mkdir, $... } from "node:fs"`,
    `import { $..., mkdirSync, $... } from "node:fs"`,
    `import { $..., rm, $... } from "node:fs"`,
    `import { $..., rmSync, $... } from "node:fs"`,
    `import { $..., rmdir, $... } from "node:fs"`,
    `import { $..., rmdirSync, $... } from "node:fs"`,
    `import { $..., unlink, $... } from "node:fs"`,
    `import { $..., unlinkSync, $... } from "node:fs"`,
    `import { $..., rename, $... } from "node:fs"`,
    `import { $..., renameSync, $... } from "node:fs"`,
    `import { $..., copyFile, $... } from "node:fs"`,
    `import { $..., copyFileSync, $... } from "node:fs"`,
    `import { $..., cp, $... } from "node:fs"`,
    `import { $..., cpSync, $... } from "node:fs"`,
    `import { $..., writeFile, $... } from "node:fs/promises"`,
    `import { $..., appendFile, $... } from "node:fs/promises"`,
    `import { $..., mkdir, $... } from "node:fs/promises"`,
    `import { $..., rm, $... } from "node:fs/promises"`,
    `import { $..., rmdir, $... } from "node:fs/promises"`,
    `import { $..., unlink, $... } from "node:fs/promises"`,
    `import { $..., rename, $... } from "node:fs/promises"`,
    `import { $..., copyFile, $... } from "node:fs/promises"`,
    `import { $..., cp, $... } from "node:fs/promises"`,
    `import * as $fs from "node:fs"`,
    `import * as $fs from "node:fs/promises"`
  } where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$"
  },
  or {
    `writeFile($...)`,
    `writeFileSync($...)`,
    `appendFile($...)`,
    `appendFileSync($...)`,
    `mkdir($...)`,
    `mkdirSync($...)`,
    `rm($...)`,
    `rmSync($...)`,
    `rmdir($...)`,
    `rmdirSync($...)`,
    `unlink($...)`,
    `unlinkSync($...)`,
    `rename($...)`,
    `renameSync($...)`,
    `copyFile($...)`,
    `copyFileSync($...)`,
    `cp($...)`,
    `cpSync($...)`,
    `$fs.writeFile($...)`,
    `$fs.writeFileSync($...)`,
    `$fs.appendFile($...)`,
    `$fs.appendFileSync($...)`,
    `$fs.mkdir($...)`,
    `$fs.mkdirSync($...)`,
    `$fs.rm($...)`,
    `$fs.rmSync($...)`,
    `$fs.rmdir($...)`,
    `$fs.rmdirSync($...)`,
    `$fs.unlink($...)`,
    `$fs.unlinkSync($...)`,
    `$fs.rename($...)`,
    `$fs.renameSync($...)`,
    `$fs.copyFile($...)`,
    `$fs.copyFileSync($...)`,
    `$fs.cp($...)`,
    `$fs.cpSync($...)`
  } where {
    $filename <: r".*mods/mod-swooper-maps/scripts/run-manifest-generator\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/scripts/generate-run-manifest.ts
await generateSwooperRunGeneratedModFromManifestPath(process.argv[2]);

// @filename: mods/mod-swooper-maps/scripts/run-manifest-generator.ts
import { writeFile } from "node:fs/promises";

export async function generateSwooperRunGeneratedModFromManifestPath(path: string) {
  await writeFile("mods/mod-swooper-maps/mod/maps/stale.js", "wrong root");
}

// @filename: mods/mod-swooper-maps/project.json
{}
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/scripts/generate-run-manifest.ts
import { generateSwooperRunGeneratedModFromManifestPath } from "./run-manifest-generator.js";

const manifestPath = parseSwooperRunManifestPathArg(process.argv.slice(2));
await generateSwooperRunGeneratedModFromManifestPath(manifestPath);

// @filename: mods/mod-swooper-maps/scripts/run-manifest-generator.ts
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";

export async function generateSwooperRunGeneratedModFromManifestPath(
  manifestPath: string
) {
  const manifest = await readStudioRunGenerationManifest(manifestPath);
  const verifiedManifest = verifySwooperStandardRunManifest(manifest).manifest;
  const generatedModRoot = resolveSwooperRunGeneratedModRoot(manifestPath, verifiedManifest);
  const plan = buildSwooperRunGeneratedModFilePlan({ manifest });
  await applyGeneratedFilePlan(plan, { outputRoot: generatedModRoot });
}

// @filename: mods/mod-swooper-maps/project.json
{
  "targets": {
    "gen:run-manifest": {
      "command": "bun ./scripts/generate-run-manifest.ts"
    }
  }
}
```
