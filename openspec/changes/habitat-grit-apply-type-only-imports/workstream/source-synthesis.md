# Source Synthesis - Type-Only Import Owner Disposition

## Authority

Biome's `lint/style/useImportType` rule is the current executable semantic
authority for converting imports used only as types. It is recommended and
safe-fix capable, and its documentation explains both the runtime-import
motivation and the decorator caveat.

## Current Corpus

Focused Biome inventory reports 242 `useImportType` warnings in the current
workspace. TypeScript parser inventory over `packages`, `mods`, `apps`, and
`tools` counts 5,281 named-only value imports and 1,060 default-or-namespace
value imports. The named-only import set contains obvious runtime values, so a
Grit pattern that rewrites by import syntax would create false positives.

## Owner Decision

The broad candidate is closed as Biome-owned. A future row may still prove a
narrow Grit slice, but it must carry TypeScript usage evidence and safe-write
validation rather than relying on names, import form, or lint-warning counts.
