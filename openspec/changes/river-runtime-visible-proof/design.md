## Design

The visible proof runner emits one packet with:

- branch, commit, worktree, request id, config hash, envelope hash;
- generated/source/deployed script identity;
- setup row/readback, live map identity, seed, dimensions, game hash when
  available;
- final terrain parity and metadata status;
- sampled live river tile coordinates and connected-chain ids;
- camera target, zoom, visibility/layer/graphics state;
- screenshot paths and hashes;
- visual verdict (`visible`, `not-visible`, `obscured`, `inconclusive`) with
  reviewer or classifier source.

The runner may use OS screenshot only as a labeled fallback. Direct-control
should own runtime map/camera operations.

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
- direct-control camera targeting/state capture, even when screenshot capture
  falls back to OS capture;
- manual-file screenshots to remain debug-only evidence rather than
  closure-capable proof.

## Review Lanes

- Direct-control runtime API review.
- Operational proof-boundary review.
- Product visual acceptance review.
