# morphology-overlay Round 2 Slice

Rules: `preserve_morphology_contracts_and_overlay_ownership`
Rows: 14

Owner counts: package-local-validator=2, grit-check=12
Status counts: ready-to-retain-or-move=2, ready-for-implementation=12

## Row Index

- hotspot-overlay-single-owner: package-local-validator / ready-to-retain-or-move
- legacy-morphology-config-key-bans: grit-check / ready-for-implementation
- legacy-morphology-effect-gating-bans: grit-check / ready-for-implementation
- legacy-morphology-module-imports: grit-check / ready-for-implementation
- legacy-plate-driver-and-plot-mountains-bans: grit-check / ready-for-implementation
- migrated-consumer-effect-gating-bans: grit-check / ready-for-implementation
- morphology-belt-driver-contract-currentness: package-local-validator / ready-to-retain-or-move
- morphology-dual-read-token-bans: grit-check / ready-for-implementation
- morphology-hotspot-overlay-ban: grit-check / ready-for-implementation
- morphology-overlay-implementation-ban: grit-check / ready-for-implementation
- morphology-stage-config-bag-ban: grit-check / ready-for-implementation
- morphology-story-overlay-contract-artifact-ban: grit-check / ready-for-implementation
- runtime-continent-contract-token-bans: grit-check / ready-for-implementation
- runtime-continent-step-token-bans: grit-check / ready-for-implementation

## Worker Notes

- Completed. All 12 Grit rows moved to narrow Grit packets.
- The hotspot overlay single-owner and morphology belt-driver contract
  currentness rows remain package-local/currentness residuals in the command
  script.
- Reviewer-requested syntax tightening changed import bans to
  `import_statement` patterns and overlay reads to import/call matching.
