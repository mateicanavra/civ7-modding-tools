# Design

## Generator Input

The request generator accepts one argument: manifest path. It reads
`StudioRunGenerationManifest`, validates it, renders a file plan, and writes the
planned generated mod tree under the manifest's request workspace output root.

## Generated Mod

`StudioRunGeneratedMod` contains the generated mod required file classes defined
in `target-vocabulary.md` and is ready to be copied by deployment. Its map row
id is derived from `RunArtifactId`, and its runtime script path is
`maps/${runArtifactId}.js`.

The generated runtime assets embed the full `RunCorrelation` tuple for later
runtime observation and attribution.

## Enforcement Split

Generated content and validation behavior are behavior-tested. The single-input
and request-local-output topology is SA-08
`grit-swooper-run-manifest-generator-boundary`.
