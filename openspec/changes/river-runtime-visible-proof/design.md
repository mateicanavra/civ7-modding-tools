## Design

The visible proof runner emits one packet with:

- branch, commit, worktree, request id, config hash, envelope hash;
- generated/source/deployed script identity;
- setup row/readback, live map identity, seed, dimensions, game hash when
  available;
- final terrain parity and metadata status;
- sampled live river tile coordinates and native `MapRivers` object/plot
  membership for each closure camera target;
- direct-control camera focus proof with target, target index, `lookAt`
  result, center plot, plot cursor, zoom, and visibility/layer/graphics state;
- screenshot capture manifest with file path, hash, byte size, dimensions,
  target, capture mode, and camera-proof hash;
- visual verdict (`visible`, `not-visible`, `obscured`, `inconclusive`) with
  reviewer or classifier source.

Run identity is a closure input, not descriptive metadata. The packet must
reject missing or malformed branch/commit/worktree/request/config/envelope
identity, seed, map size, or map dimensions, and those fields must match the
final-surface parity proof for the same run when the parity proof exposes them.

Direct-control owns runtime map/camera operations. OS screenshots may be used
only as labeled debug evidence. The package-owned macOS appshot atom,
procedure, Studio endpoint, and CLI command produce a hashable manifest, but
the manifest is explicitly `proofBoundary: "debug-fallback"` and
`closureCapable: false` unless a later accepted proof slice changes the proof
boundary with explicit review disposition.

The native screenshot request surface is `@civ7/direct-control`
`captureCiv7Screenshot()`, which calls the resource-backed
`XR.World.takeScreenshot()` App UI API and records whether the API is available,
whether the request ran, and whether Civ returned a file path that can back the
closure capture manifest. Until live runtime proof shows `path-returned`, this
surface is proof support only; `path-unavailable`, `unsupported`, or `failed`
cannot satisfy `civ-rendered` closure.

The OS appshot surface is `@civ7/direct-control` `captureCiv7AppShot()`,
procedure `map.capture.appshot`, Studio endpoint `civ7.live.captureAppShot`,
and CLI command `game appshot`. It activates the Civ7 app by default, captures
the visible macOS display through `screencapture`, and records output path,
hash, byte size, PNG dimensions, target, and camera-proof hash. It is useful
for visual debugging and reviewer context when the native screenshot API is not
file-backed, but it cannot by itself close `civ-rendered`.

The visible proof runner owns one native live-capture mode:
`verify-river-visible-proof.ts --direct-control-capture`. It selects a camera
target from the same sampled live `TERRAIN_NAVIGABLE_RIVER` tiles and native
`MapRivers` plot membership used by the verifier, focuses the App UI camera via
`@civ7/direct-control`, requests `XR.World.takeScreenshot()`, writes the camera
proof and native screenshot request result, and writes a file-backed capture
manifest only if the native request returns an existing screenshot path. A
missing native path remains a blocked proof with recorded artifacts, not a
fallback pass.

Runtime river proof must record both current materialization surfaces:

- direct terrain stamping, which can prove live `TERRAIN_NAVIGABLE_RIVER`
  terrain rows;
- native bulk writer behavior, where `TerrainBuilder.modelRivers(...)` has been
  proven to author river metadata in a disposable run but has not yet been
  integrated or parity-bound to Hydrology truth.

The packet must therefore include a metadata/materialization disposition:
`terrain-only`, `native-writer-parity-pass`, `native-writer-parity-fail`,
`native-writer-not-run`, or `unsupported-writer-surface`. A visible proof row
cannot claim minor-river success from terrain-only evidence.

Closure-capable `civ-rendered` proof also requires:

- `exact-authorship=pass` for the same run before visible proof can pass;
- run identity seed, map size, and dimensions bound to the same final-surface
  parity proof, so wrong-map or wrong-seed screenshots fail closed;
- each camera target to be both live `TERRAIN_NAVIGABLE_RIVER` terrain and a
  plot returned by native `MapRivers.getRiverPlots(...)` in the same run;
- direct-control camera targeting/state capture from `@civ7/direct-control`,
  even when screenshot capture falls back to OS capture;
- rejection of caller-supplied camera source labels unless they are backed by
  the typed direct-control camera focus proof packet;
- rejection of caller-supplied capture mode labels unless they are backed by a
  capture manifest bound to the exact reviewed screenshot file and camera
  proof;
- manual-file screenshots to remain debug-only evidence rather than
  closure-capable proof.

## Review Lanes

- Direct-control runtime API review.
- Operational proof-boundary review.
- Product visual acceptance review.
