# Studio Run Attribution Report

## Why

Developers need to know what authored source, manifest, generated mod,
deployment snapshot, and runtime observation corresponded to a Run in Game
operation. That is attribution, not public status. It should be one private
report assembled from records created by earlier packets.

## System Context

Affected owners:

- request workspace private records
- diagnostics lookup
- generation/deployment/observation record appenders
- copy-diagnostics output

This packet does not add new runtime observation. It synthesizes records already
created by earlier packets.

## Before And After

Before:

- attribution data can be embedded in public status or scattered across
  operation fields;
- marker scans and artifact identity can be exposed or inferred inconsistently.

After:

- `RunAttributionReport` is a private report in the request workspace;
- the report has sections for source, manifest, generation, deployment,
  observation, and terminal result;
- sections are appended as records become available;
- attribution status is `complete` or `incomplete`;
- required sections and failure behavior are defined by `target-vocabulary.md`.

## Behavior Verification

Behavior tests verify report creation, section appends, complete/incomplete
status, diagnostics lookup inclusion, and mismatch failure behavior.

## Structural Enforcement

Permanent positive assertions:

- attribution report assembly stays in the private runtime
  diagnostics/reporting boundary;
- public status references diagnostics id only and never embeds attribution;
- diagnostics lookup includes attribution through private lookup.

Structural authority row: SA-13
`grit-studio-run-attribution-report-boundary`. Request-workspace attribution
files are runtime evidence and are verified by behavior/live gates, not source
topology checks.

## Verification Gates

- Attribution report behavior tests.
- Diagnostics lookup behavior tests.
- Live Studio endpoint evidence that diagnostics lookup returns private
  attribution while public status/current/events do not expose it.
- SA-13 `grit-studio-run-attribution-report-boundary`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-attribution-report --strict`.
