# Phase Record - Type-Only Import Owner Disposition

## Current State

The `habitat-grit-apply-type-only-imports` candidate is implemented as a
bounded owner-disposition checkpoint. The row records that broad value-to-type
import conversion belongs to Biome/TypeScript semantic tooling rather than a
Grit apply pattern.

This checkpoint is ready for supervisor review after local validation and
Graphite commit. It is not source remediation and it is not an active Habitat
rule.

## Completed Work

- Confirmed the corpus candidate and current lack of an existing packet.
- Confirmed Biome `lint/style/useImportType` is recommended and safe-fix
  capable.
- Recorded Biome's experimental-decorator caveat as a semantic policy boundary.
- Ran focused Biome inventory and deterministic TypeScript parser inventory.
- Updated row packet and aggregate records to prevent reopening a broad unsafe
  Grit apply row without semantic proof.

## Remaining Gates

- Supervisor review of this owner-disposition checkpoint.
- Future Biome/Habitat hygiene work if the project chooses to enable or wrap
  `useImportType`.
- Future narrow Grit slices only if they include TypeScript usage proof and
  safe-write validation.

## Non-Claims

No Grit pattern, Habitat apply registration, source rewrite, Biome config
change, baseline, injected probe, apply safety, broad import closure, or
product/runtime proof is claimed.
