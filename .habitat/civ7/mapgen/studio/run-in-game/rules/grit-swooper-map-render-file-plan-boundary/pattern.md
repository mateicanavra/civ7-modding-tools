---
level: error
---
# Grit Swooper Map Render File Plan Boundary

Swooper owns product-specific map artifact rendering and orchestration, while
`@civ7/plugin-files/generated-file-plan` owns reusable filesystem admission,
cleanup, and writes. The realization renderer remains a pure plan builder. The
build entrypoint may read authored configs and compile virtual sources, but it
must delegate plan application to the plugin capability instead of acquiring a
local writer. Behavior and
exact bytes belong to tests; this rule guards only that ownership boundary.

```grit
language js(typescript)

or {
  or {
    `import { $... } from "node:fs"`,
    `import { $... } from "node:fs/promises"`,
    `import $fs from "node:fs"`,
    `import $fs from "node:fs/promises"`,
    `import * as $fs from "node:fs"`,
    `import * as $fs from "node:fs/promises"`
  } where {
    $filename <: r".*apps/mods/map/swooper-physics/src/runtime/file-plan\.tsx?$"
  },
  `process.env` where {
    $filename <: r".*apps/mods/map/swooper-physics/src/runtime/file-plan\.ts$"
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
    `import { $..., truncate, $... } from "node:fs"`,
    `import { $..., truncateSync, $... } from "node:fs"`,
    `import { $..., mkdtemp, $... } from "node:fs"`,
    `import { $..., mkdtempSync, $... } from "node:fs"`,
    `import { $..., createWriteStream, $... } from "node:fs"`,
    `import { $..., writeFile, $... } from "node:fs/promises"`,
    `import { $..., appendFile, $... } from "node:fs/promises"`,
    `import { $..., mkdir, $... } from "node:fs/promises"`,
    `import { $..., rm, $... } from "node:fs/promises"`,
    `import { $..., rmdir, $... } from "node:fs/promises"`,
    `import { $..., unlink, $... } from "node:fs/promises"`,
    `import { $..., rename, $... } from "node:fs/promises"`,
    `import { $..., copyFile, $... } from "node:fs/promises"`,
    `import { $..., cp, $... } from "node:fs/promises"`,
    `import { $..., truncate, $... } from "node:fs/promises"`,
    `import { $..., mkdtemp, $... } from "node:fs/promises"`,
    `import * as $fs from "node:fs"`,
    `import * as $fs from "node:fs/promises"`,
    `import { $..., promises as $fs, $... } from "node:fs"`
  } where {
    $filename <: r".*apps/mods/map/swooper-physics/src/build\.ts$"
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
    `truncate($...)`,
    `truncateSync($...)`,
    `mkdtemp($...)`,
    `mkdtempSync($...)`,
    `createWriteStream($...)`,
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
    `$fs.cpSync($...)`,
    `$fs.truncate($...)`,
    `$fs.truncateSync($...)`,
    `$fs.mkdtemp($...)`,
    `$fs.mkdtempSync($...)`,
    `$fs.createWriteStream($...)`
  } where {
    $filename <: r".*apps/mods/map/swooper-physics/src/build\.ts$"
  },
  program(statements=$body) where {
    $filename <: r".*apps/mods/map/swooper-physics/src/build\.ts$",
    ! $body <: contains `import { $..., applyGeneratedFilePlan, $... } from "@civ7/plugin-files/generated-file-plan"`
  },
  program(statements=$body) where {
    $filename <: r".*apps/mods/map/swooper-physics/src/build\.ts$",
    ! $body <: contains `await applyGeneratedFilePlan(plan, { outputRoot: modOutputRoot })`
  }
}
```

## Matches Fixture

```typescript
// @filename: apps/mods/map/swooper-physics/src/runtime/file-plan.ts
import { writeFile } from "node:fs/promises";

export function buildSwooperCatalogModFilePlan(options) {
  return writeFile("src/maps/generated/example.ts", renderMap(options));
}
```

```typescript
// @filename: apps/mods/map/swooper-physics/src/build.ts
import { readFile, writeFile } from "node:fs/promises";

export async function loadSwooperMapConfigRegistry() {
  return JSON.parse(await readFile("config.json", "utf8"));
}

await writeFile("src/maps/generated/example.ts", "direct write");
```

## Ignores Fixture

```typescript
// @filename: apps/mods/map/swooper-physics/src/runtime/file-plan.ts
export function buildSwooperCatalogModFilePlan(options) {
  return { exclusiveSets: [], files: options.configs.map(renderArtifactIntent) };
}

// @filename: apps/mods/map/swooper-physics/src/build.ts
import { readFile } from "node:fs/promises";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";

export async function loadSwooperMapConfigRegistry() {
  return JSON.parse(await readFile("config.json", "utf8"));
}

const plan = buildSwooperCatalogModFilePlan({});
await applyGeneratedFilePlan(plan, { outputRoot: modOutputRoot });
```
