# Design

## File Plan

`SwooperMapArtifactFilePlan` is pure data. It contains every file the renderer
intends to write, including relative output path, content bytes/text, artifact
kind, and correlation marker metadata where applicable.

The renderer has no access to filesystem writes. Writers take a file plan and an
output root.

## Content Scope

The file plan covers:

- modinfo and mod configuration files;
- localized text files;
- data/config XML or SQL files used by the mod;
- map row records;
- runtime map script entries;
- marker-bearing runtime assets used by later attribution.

## Verification Split

Rendered content behavior belongs in tests. Required render/write ownership
shape is enforced by SA-06 `grit-swooper-map-render-file-plan-boundary`.
