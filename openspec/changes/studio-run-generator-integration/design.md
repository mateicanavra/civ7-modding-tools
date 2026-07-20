# Design

## Workflow

Run in Game source resolution writes the generation manifest. The workflow then
calls the manifest-only generator port with that manifest path and waits for a
generated mod record.

Generation failure maps to public category `artifact-generation` and writes
private diagnostics. Generation success records generated mod path, file count,
and digest privately for deployment.

## Data Flow

Request-specific data flows through the manifest. Environment variables may
still configure process-level tool behavior, but not source selection,
correlation identity, request id, or generated output root for Run in Game.

## Enforcement

Behavior verifies success/failure. SA-10
`grit-studio-run-generator-port-boundary` enforces the source wiring boundary:
the generator port accepts a `StudioRunGenerationManifestReference`, legacy
materialization naming stays retired, and request/prepared/output-root side
channels stay out of generator calls. Request-workspace filesystem topology
remains covered by SA-07/SA-08 Habitat structure authority.
