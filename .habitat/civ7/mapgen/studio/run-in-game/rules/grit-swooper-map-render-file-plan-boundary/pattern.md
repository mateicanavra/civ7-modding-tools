---
level: error
---
# Grit Swooper Map Render File Plan Boundary

Packet 6 makes Swooper map artifact rendering produce pure file-plan data before
any filesystem mutation. The plan owns intended relative paths, artifact kinds,
content payloads, and marker metadata. The writer owns output-root resolution,
exclusive-set cleanup, directory creation, and file writes. The executable
generator script owns config discovery and orchestration only. Behavior
equivalence and public port availability belong to TypeScript and fixture
tests; this rule guards the structural ownership boundary by denying filesystem
authority to non-writer artifact owners and direct filesystem writer authority
to the generator. The scan roots intentionally name only
the current owner surface: the executable generator and the
`scripts/map-artifacts` renderer/writer modules. A future artifact owner outside
those paths must update this rule and the SA-06 authority record rather than
inheriting writer authority silently.

```grit
language js(typescript)

or {
  `import { $... } from "node:fs"` where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  },
  `import { $... } from "node:fs/promises"` where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  },
  `import * as $fs from "node:fs"` where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  },
  `import * as $fs from "node:fs/promises"` where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  },
  `process.env` where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  },
  or {
    `import { $... } from "node:fs"`,
    `import { $... } from "node:fs/promises"`,
    `import $fs from "node:fs"`,
    `import $fs from "node:fs/promises"`,
    `import * as $fs from "node:fs"`,
    `import * as $fs from "node:fs/promises"`
  } where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/.*\.tsx?$",
    not { $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/write-file-plan\.ts$" }
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
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-map-artifacts\.ts$"
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
    $filename <: r".*mods/mod-swooper-maps/scripts/(?:generate-map-artifacts\.ts|map-artifacts/.*\.tsx?)$",
    not { $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/write-file-plan\.ts$" },
    not { $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$" }
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
    `createWriteStream($...)`
  } where {
    $filename <: r".*mods/mod-swooper-maps/scripts/map-artifacts/file-plan\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/file-plan.ts
import { writeFile } from "node:fs/promises";

export type SwooperMapArtifactFileContent = Readonly<{ kind: "text"; text: string }>;
export type SwooperMapArtifactPlannedFile = Readonly<{
  relativePath: string;
  kind: "generated-map-entry";
  content: SwooperMapArtifactFileContent;
}>;
export type SwooperMapArtifactFilePlan = Readonly<{
  exclusiveSets: readonly unknown[];
  files: readonly SwooperMapArtifactPlannedFile[];
}>;

export function buildSwooperMapArtifactFilePlan(options) {
  writeFile("src/maps/generated/example.ts", renderMap(options));
  return { exclusiveSets: [], files: [] };
}
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/generate-map-artifacts.ts
import { readFile, writeFile } from "node:fs/promises";

export async function loadSwooperMapConfigRegistry() {
  return JSON.parse(await readFile("config.json", "utf8"));
}

await writeFile("src/maps/generated/example.ts", "direct write");
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/generate-map-artifacts.ts
import { promises as fs } from "node:fs";

await fs.writeFile("src/maps/generated/example.ts", "direct write");
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/file-plan.ts
export type SwooperMapArtifactFileContent = Readonly<{ kind: "text"; text: string }>;
export type SwooperMapArtifactPlannedFile = Readonly<{
  relativePath: string;
  kind: "generated-map-entry";
  content: SwooperMapArtifactFileContent;
}>;
export type SwooperMapArtifactFilePlan = Readonly<{
  exclusiveSets: readonly unknown[];
  files: readonly SwooperMapArtifactPlannedFile[];
}>;

export function buildSwooperMapArtifactFilePlan() {
  return process.env.SWOOPER_STUDIO_RUN_ID;
}
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/render-extra.ts
import { mkdir } from "node:fs/promises";

export function renderArtifact(plan: SwooperMapArtifactFilePlan) {
  mkdir("src/maps/generated");
  return plan;
}
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/render-extra.ts
import { writeFile as persist } from "node:fs/promises";

export async function renderArtifact(plan) {
  await persist("src/maps/generated/example.ts", plan.content);
}
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/render-extra.ts
import * as fs from "node:fs/promises";

export async function renderArtifact(plan) {
  await fs.writeFile("src/maps/generated/example.ts", plan.content);
}
```

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/render-extra.ts
import fs from "node:fs/promises";

export async function renderArtifact(plan) {
  await fs.writeFile("src/maps/generated/example.ts", plan.content);
}
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/scripts/map-artifacts/file-plan.ts
export function buildSwooperMapArtifactFilePlan(options) {
  return {
    files: options.configs.map((config) => renderArtifactIntent(config)),
  };
}

// @filename: mods/mod-swooper-maps/scripts/map-artifacts/write-file-plan.ts
export async function writeSwooperMapArtifactFilePlan(plan, options) {
  return applyArtifactPlan(plan, options.outputRoot);
}

// @filename: mods/mod-swooper-maps/scripts/generate-map-artifacts.ts
import { readdir, readFile } from "node:fs/promises";

export async function loadSwooperMapConfigRegistry(options) {
  const entries = await readdir("configs");
  return await Promise.all(entries.map((entry) => readFile(entry, "utf8")));
}

const artifactPlan = buildSwooperMapArtifactFilePlan({});
await writeSwooperMapArtifactFilePlan(artifactPlan, outputOptions);
```
