# Design

## Workspace

The request workspace root is `.mapgen-studio/run-in-game/<requestId>/`. It
contains manifest, generated mod, deployment snapshot, diagnostics, attribution,
and observations as later packets add them.

## Artifact Identity

`RunArtifactId` is a filesystem/XML-safe projection of request id:

```text
run-${sha256(requestId).slice(0, 20)}
```

Generated file names and map row ids use `RunArtifactId`. Logs and diagnostics
also carry the original request id.

## Manifest Shape

The unsigned manifest payload and persisted manifest are separate:

```ts
type StudioRunGenerationManifest = {
  payload: StudioRunGenerationManifestPayload;
  generationManifestDigest: string;
};
```

The digest input is exactly canonical sorted JSON of
`StudioRunGenerationManifestPayload`. The JSON pointer
`/generationManifestDigest` is not inside the payload and is never part of the
digest input.

## Correlation

`RunCorrelation` includes:

- request id;
- run artifact id;
- launch source digest;
- launch envelope digest;
- generation manifest digest.

Generated assets embed the full correlation tuple in later packets.
