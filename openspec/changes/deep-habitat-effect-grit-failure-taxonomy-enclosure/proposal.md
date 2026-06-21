# Change: Deep Habitat Effect Grit Failure Taxonomy Enclosure

## Why

Grit adapter failures are still modeled in two places: the Grit provider owns
failure tags and rendering, while the diagnostic-pattern catalog keeps a
parallel literal schema and renderer for the same Grit-specific vocabulary.
That makes Grit less self-contained and allows failure taxonomy drift.

## What Changes

- Make `adapters/grit/provider/failures.ts` export the TypeBox schema,
  literal list, type guard, and renderer for Grit adapter failures.
- Re-export that provider-owned vocabulary from the diagnostic-pattern catalog
  under the existing diagnostic names.
- Preserve the current public diagnostic contracts and rendered messages.

## Non-Goals

- Do not change Grit command execution behavior.
- Do not move generic diagnostic identity or scan-root policy into the Grit
  provider.
- Do not add compatibility shims or duplicate failure lists.
