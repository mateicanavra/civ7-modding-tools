## Why

Huge map latitude policy was repaired from live row evidence, but other map
sizes may still contain policy uncertainty. Latitude policy affects terrain,
biomes, features, resources, and product parity.

## Activation Gate

This change is evidence-gated. Do not implement it until final-surface parity
or product acceptance records a map-size latitude policy gap outside already
verified Standard/Huge coverage.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-verification-and-runtime-proof.md`
- `packages/civ7-adapter/src/map-metadata.ts`
- `packages/civ7-map-policy/**`

## What Changes

- Extract or verify Civ row-latitude policy for the affected map size.
- Encode the verified policy in the adapter/map-policy owner.
- Add tests and parity proof for that map size.

## Requires

- A concrete map-size latitude mismatch row.

## Enables Parallel Work

- Final-surface parity and product acceptance across additional sizes.

## Affected Owners

- `packages/civ7-adapter/**`
- `packages/civ7-map-policy/**`
- Direct-control readback only if current map-grid reads cannot expose row facts

## Forbidden Owners

- No interpolation assumption without live evidence.
- No mapgen-domain workaround for adapter/map-policy latitude facts.

## Stop Conditions

- Live row-latitude facts cannot be extracted for the target size.
- A proposed repair conflicts with verified Standard/Huge behavior.

## Verification Gates

- Source evidence for row-latitude policy.
- Adapter/map-policy tests.
- Fresh parity proof for the affected size.
- OpenSpec strict validation.
