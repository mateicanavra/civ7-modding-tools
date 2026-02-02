# Status: Project seam doc (MapGen Studio)

This page documents an implementation seam and may drift.
It is **not** canonical MapGen visualization documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

# agent-dump-viewer — dump replay mode seam (MapGen Studio)

## 1) Files reviewed

- `apps/mapgen-studio/src/App.tsx`
  - dump mode state + folder/file selection (`openDumpFolder`, `onDirectoryFiles`)
  - `FileMap` normalization (`stripRootDirPrefix`)
  - manifest decode (`loadManifestFromFileMap`)
  - dump-time payload loading via `fileMap` (lazy `readFileAsArrayBuffer` + `decodeScalarArray`)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts`
  - V0 dump writer: `manifest.json` + `data/*.bin` + `trace.jsonl`
  - path conventions for `path` / `positionsPath` / `segmentsPath`
- `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts`
  - where dumps land by default: `dist/visualization/<runId>/...`
- `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
  - in-browser “streamed layer” equivalent of the V0 manifest layer model (in-memory `ArrayBuffer`s)
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
  - canonical intent for dump folder structure + viewer contract (note: doc is more aspirational than current V0)
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md`
  - prior art: suggested extraction folders (`studio/dump/*` or `features/dump-viewer/*`)

---

## 2) Dump viewer responsibilities today (as embedded in `App.tsx`)

**A. Acquire a “dump folder” worth of files**

- Primary: `window.showDirectoryPicker()` (File System Access API), then recursive walk to build an in-memory `Map<path, File>`.
- Fallback: hidden `<input type="file" webkitdirectory>` upload, then build the same `Map<path, File>` from `FileList`.

**B. Normalize file paths into a `FileMap`**

- `stripRootDirPrefix(path)` strips exactly one leading path segment (`a/b/c` → `b/c`).
- Directory picker path handling stores *both* keys for each file:
  - the raw `walk()` path, and
  - the “one-segment stripped” alias.
- Upload path handling stores *only* the stripped key for each file (derived from `webkitRelativePath`).

**C. Decode `manifest.json`**

- `loadManifestFromFileMap(fileMap)`:
  - requires `fileMap.get("manifest.json")`,
  - reads text, `JSON.parse`, and blindly casts to `VizManifestV0` (no runtime validation).

**D. Wire manifest → UI selection defaults**

- On load, picks the “first step” by sorting `manifest.steps` by `stepIndex`, resets selected layer, and resets view bounds.
- A separate effect ensures `selectedStepId` stays valid when `manifest` changes.

**E. Load layer payloads on demand (dump mode)**

- Converts `VizLayerEntryV0` → deck.gl layers, lazily reading binary files when the layer entry uses `*Path` fields.
- Uses `decodeScalarArray` + `ArrayBufferView` formats to interpret `.bin` payloads.

---

## 3) Subtle behaviors worth preserving

### 3.1 Path/naming expectations (dump output ↔ viewer)

- **Manifest location:** viewer expects `manifest.json` at the “logical root” of the chosen folder.
  - For dumps produced by `mods/mod-swooper-maps/src/dev/viz/dump.ts`, the run folder layout is:
    - `<outputRoot>/<runId>/manifest.json`
    - `<outputRoot>/<runId>/data/*.bin`
    - `<outputRoot>/<runId>/trace.jsonl`
- **Path separators:** dump writer emits forward-slash relative paths (e.g. `data/<slug>.bin`); viewer keys are also forward-slash paths.
- **Layer payload lookup is string-exact:** the viewer does `fileMap.get(pathFromManifest)` with no additional normalization (beyond precomputed alias keys).

### 3.2 “Strip one leading segment” aliasing (and why it exists)

This is the core compatibility trick between the two selection mechanisms:

- File input (`webkitdirectory`) typically yields paths like `<selectedFolderName>/manifest.json` even when the user selects the run folder.
  - Always stripping one segment produces `manifest.json` and makes loads work.
- Directory picker walk yields paths relative to the selected handle (no implicit leading folder name).
  - Adding the stripped alias allows selecting an extra parent directory:
    - selecting `<outputRoot>` yields `runId/manifest.json` (raw) and `manifest.json` (aliased).

Preserve the intent: **support both “exact run folder” selection and “one parent above” selection**.

### 3.3 Collision and ambiguity behavior (currently implicit)

- When directory picker aliasing is enabled, selecting a parent folder that contains *multiple* run folders can silently collide:
  - `runA/manifest.json` and `runB/manifest.json` both alias to `manifest.json`; last write wins.
  - Same for `run*/data/...` aliasing to `data/...`.
- The current UX doesn’t detect or warn about collisions; it just loads whatever `manifest.json` ends up in the map.

This is a “subtle behavior” because some users may rely on “pick a broad folder and hope it works”, but it’s also a correctness hazard.

### 3.4 Manifest parsing assumptions

- Viewer assumes `VizManifestV0` shape without validating:
  - `version: 0` is assumed but not checked.
  - `steps[]` are assumed present and contain usable `stepIndex`.
  - `layers[]` entries are assumed to have either embedded buffers (`values`, `positions`, `segments`) or `*Path` pointers plus the required formats.
- Dump writer (`mods/mod-swooper-maps/src/dev/viz/dump.ts`) writes:
  - `layers[]` entries with only `*Path` (no embedded buffers),
  - `steps[]` is populated only on `step.start` events, and `stepIndex` is derived from “first time we see stepId”.

### 3.5 Large file / perf behavior

- **Binary reads are whole-file reads** (`file.arrayBuffer()`), so memory use spikes proportional to selected layer payload.
- **No explicit payload cache:** switching away/back can re-read payloads (browser may cache, but it’s not a contract).
- **Grid rendering builds per-tile polygons and scans the entire scalar field** to compute min/max, which is OK for ~7k tiles (MAPSIZE_HUGE: 106×66) but will get expensive as sizes scale.

---

## 4) Extraction proposal (boundary + stable API)

### 4.1 Proposed folder structure

Create a feature slice under:

`apps/mapgen-studio/src/features/dumpViewer/`

Suggested modules (names are indicative; prefer existing app conventions):

- `apps/mapgen-studio/src/features/dumpViewer/types.ts`
  - `DumpSource`, `DumpLoadResult`, `DumpWarning`, `DumpErrorCode`
- `apps/mapgen-studio/src/features/dumpViewer/fileIndex.ts`
  - `buildDumpFileIndex(...)`
  - `resolveDumpPath(...)` (alias strategy lives here)
- `apps/mapgen-studio/src/features/dumpViewer/pickers.ts`
  - `pickDumpDirectory()` (File System Access API path)
  - `filesFromDirectoryHandle(handle)` (recursive walk)
  - (optional) helpers for `webkitdirectory` path quirks
- `apps/mapgen-studio/src/features/dumpViewer/manifest.ts`
  - `loadDumpManifest(fileIndex)` (reads + parses `manifest.json`)
  - `validateVizManifestV0(...)` (even if it’s “minimal validation”: version, required keys)
- `apps/mapgen-studio/src/features/dumpViewer/reader.ts`
  - `DumpReader` interface (read text/binary by logical path)
  - optional memoized `readArrayBufferCached(path)`
- `apps/mapgen-studio/src/features/dumpViewer/useDumpLoader.ts`
  - React-facing state machine + actions, returning `{ state, actions }`

This keeps `App.tsx` as composition:
- “Mode switch + controls” call into `useDumpLoader()`.
- The viz builder consumes a `DumpReader` (not `FileMap`) so dump loading can evolve independently.

### 4.2 Extraction boundary (what moves, what stays)

**Moves into dumpViewer feature:**

- Directory selection (`showDirectoryPicker` + recursion), file input ingestion (`FileList` → entries)
- Path canonicalization + alias policy (`stripRootDirPrefix` + any future rules)
- Manifest reading/parsing/validation
- Dump-oriented errors/warnings (missing manifest, collisions, unsupported API, etc.)

**Stays outside (for now):**

- `VizManifestV0` / `VizLayerEntryV0` *as the shared domain model* (ideally extracted once for both browser + dump).
- deck.gl layer building + palette/legend logic (belongs to a `features/viz/*` slice per the refactor plan)
- step/layer selection logic (UI behavior; separate from dump IO)

### 4.3 Proposed stable API surface

Two complementary surfaces work well here:

#### Option A: `useDumpLoader()` hook (UI-friendly)

```ts
export type DumpLoadState =
  | { status: "idle" }
  | { status: "loading"; source: "directoryPicker" | "fileInput" }
  | { status: "loaded"; manifest: VizManifestV0; reader: DumpReader; warnings: DumpWarning[] }
  | { status: "error"; message: string; code?: DumpErrorCode };

export type UseDumpLoader = {
  state: DumpLoadState;
  actions: {
    openViaDirectoryPicker(): Promise<void>;
    loadFromFileList(files: FileList): Promise<void>;
    reset(): void;
  };
};
```

Notes:
- Keep `openViaDirectoryPicker()` responsible for emitting “unsupported browser” as a structured error code.
- Ensure both load paths share the same normalization + manifest parsing implementation.

#### Option B: `DumpLoader` service + `DumpReader` (testable core)

```ts
export type DumpSource =
  | { kind: "directoryHandle"; handle: FileSystemDirectoryHandle }
  | { kind: "fileList"; files: FileList };

export interface DumpReader {
  has(path: string): boolean;
  readText(path: string): Promise<string>;
  readArrayBuffer(path: string): Promise<ArrayBuffer>;
}

export type DumpLoadResult = {
  manifest: VizManifestV0;
  reader: DumpReader;
  warnings: DumpWarning[];
};

export interface DumpLoader {
  load(source: DumpSource): Promise<DumpLoadResult>;
}
```

Notes:
- The viz code should only depend on `DumpReader` for reading referenced payloads by path.
- `DumpReader` owns the alias rules (e.g., “try as-is, then try strip-one-segment”) so callers don’t duplicate path heuristics.
- `warnings` provides a place to surface collision detection and “multiple candidate manifests” without making the happy-path verbose.

---

## 5) Risks + validation checklist

### Risks

- **Silent path collisions** when aliasing is enabled (especially for parent-folder picks).
- **Browser support variance** (`showDirectoryPicker` availability, permissions, recursive traversal support).
- **Manifest drift**: viewer accepts “casted JSON”; a future manifest version could fail in confusing ways unless version-checked.
- **Performance cliffs** if map sizes or payload sizes increase (arrayBuffer reads + per-tile polygon materialization).
- **Race conditions**: multiple concurrent load attempts can interleave `setState` without a dump-mode “run token”.

### Validation (what to test when extracting)

- Load via directory picker:
  - selecting the run folder directly
  - selecting one directory above the run folder
- Load via file input upload:
  - selecting the run folder directly
  - confirm that selecting a parent folder either (a) works intentionally or (b) produces a clear error
- Missing/invalid manifest cases:
  - no `manifest.json`
  - non-JSON or wrong `version`
- Data path failures:
  - missing `data/*.bin` referenced by manifest
  - mismatched `valueFormat` (decode errors / wrong typed array)
- Collision detection behavior (if added):
  - selecting a folder containing multiple runs should warn or force disambiguation
