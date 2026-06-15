## ADDED Requirements

### Requirement: Mod Build Writes Complete Before Return

The SDK `Mod.build()` workflow SHALL complete all generated file writes before
returning to the caller.

#### Scenario: Caller reads generated files immediately
- **WHEN** a caller invokes `Mod.build(<temp-dir>)`
- **THEN** the generated `.modinfo` and builder/import files are readable as
  soon as the call returns

#### Scenario: Test teardown removes the output directory immediately
- **WHEN** a test removes the output directory immediately after `Mod.build()`
  returns
- **THEN** no pending SDK filesystem callback attempts to write into the
  removed directory
