## 1. Phase Opening

- [x] 1.1 Reproduce the adapter-boundary failure and capture the exact
  unapproved file.
- [x] 1.2 Inspect `river-type-metadata.source.ts` and confirm its
  `/base-standard/` strings are provenance metadata, not runtime imports.

## 2. Implementation

- [x] 2.1 Add `river-type-metadata.source.ts` to the existing map-policy
  provenance allowlist in `lint-adapter-boundary.sh`.
- [x] 2.2 Leave Habitat adapter-boundary ratchet baseline unchanged for the
  later shrink-only prune path.

## 3. Verification

- [x] 3.1 Run `bun run lint:adapter-boundary`.
- [x] 3.2 Run `bun run openspec -- validate
  adapter-boundary-river-metadata-provenance --strict`.
- [x] 3.3 Run `git diff --check`.
