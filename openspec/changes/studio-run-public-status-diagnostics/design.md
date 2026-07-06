# Design

## Public Contract

`PublicRunStatus` is the only public status shape. It contains request id,
phase, status, timestamps, safe failure category when failed or cancelled,
diagnostics id when allocated, and typed recovery actions. It does not contain
raw request data, command text, filesystem paths, generated artifact records,
attribution records, developer stacks, or open unknown fields.

Declared public errors for Run in Game use the same safe failure projection as
status. A request that fails before operation admission still returns a closed
public error category and, when a diagnostics record exists, a diagnostics id.

## Diagnostics Record

`RunDiagnosticsRecord` is private durable server/runtime data. Packet 1 creates
the request diagnostics workspace before later packets add manifest and
generated-mod sections:

```text
.mapgen-studio/run-in-game/<requestId>/diagnostics/diagnostics.json
```

Any emitted diagnostics id resolves through explicit diagnostics lookup across
daemon restart until retention deletes the record. The record may contain
bounded developer sections, including command summaries, paths, internal reason
codes, raw causes, and attribution fragments. It is never embedded in public
status.

## Structural Assertion

The permanent topology assertion is SA-01:
`grit-studio-run-public-contract-closed`. Public Run in Game schemas are closed
public DTOs owned by `@civ7/studio-contract`, and private diagnostics are served
by explicit lookup.
