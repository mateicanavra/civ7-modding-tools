# Design

## Source Inputs

`CatalogLaunchSource` contains a catalog source id and launch settings.
`EditorLaunchSource` contains the editor-authored config/envelope payload and
launch settings. The union is closed; extra public fields are rejected.

## Resolved Source

Server resolution produces:

- `ResolvedLaunchSource`: normalized source content;
- `LaunchEnvelope`: complete launch input used by downstream manifest creation;
- `LaunchSourceDigest`: digest of source content;
- `LaunchEnvelopeDigest`: digest of the launch envelope.

Digest calculation uses canonical sorted JSON for structured payloads.

## Ownership

The Studio app constructs a launch-source request. It does not decide source
paths, write catalog configs, or provide source snapshots. The server resolves
the request, and Swooper owns catalog index data and reading.
