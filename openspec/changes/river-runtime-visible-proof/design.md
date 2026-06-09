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

## Review Lanes

- Direct-control runtime API review.
- Operational proof-boundary review.
- Product visual acceptance review.
