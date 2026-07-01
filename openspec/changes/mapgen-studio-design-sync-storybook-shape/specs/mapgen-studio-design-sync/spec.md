## ADDED Requirements

### Requirement: The Design-Sync Verifies Components Against The Studio's Storybook

The studio design-sync SHALL run in `storybook` shape: each in-scope component's
preview is verified by a screenshot pair — the component's story rendered in a
reference Storybook beside the design-sync's generated preview — and SHALL be
accepted only when that pair is graded `match` or `close`.

#### Scenario: Story is screenshot-paired against the reference Storybook
- **WHEN** a component's preview is verified
- **THEN** its story is rendered in the reference Storybook and in the generated
  preview, and the two are graded from the images
- **AND** the preview is accepted only when the pair is `match` or `close` (each
  `close` carrying a recorded reason)

#### Scenario: Mismatch is fixed without editing the component
- **WHEN** a screenshot pair is graded `mismatch`
- **THEN** the fix is made in the preview, fixture, or config layer (an owned
  `.design-sync/previews/<Name>.tsx`, `provider`, `storyImports`, or `overrides`)
- **AND** the component implementation is not edited to make the pair match

#### Scenario: Story that cannot render statically is skipped, not crashed
- **WHEN** a story does not render in the reference Storybook (`sb-error`)
- **THEN** it is added to that component's `overrides.skip` with a recorded
  reason
- **AND** the verification run is not blocked by it

### Requirement: The Flip Reuses The Stage-1 Stories Without Re-Authoring

Stage 2 SHALL consume the 46 Stage-1 stories as the preview source as authored;
it SHALL NOT re-author them, and SHALL pair each story title to its design-sync
export name with no `titleMap` entry except where a title does not already match.

#### Scenario: Titles pair to export names by default
- **WHEN** the converter pairs story titles to design-sync export names
- **THEN** the Stage-1 titling resolves the pairing for the common case
- **AND** a `titleMap` entry is added only for a title that does not already
  match its export name

#### Scenario: Wholesale story rewrite is treated as a broken assumption
- **WHEN** producing a faithful preview appears to require rewriting a story
  wholesale
- **THEN** that is treated as a broken Stage-1 assumption and surfaced for
  reconciliation
- **AND** it is not resolved by silently re-authoring the story

### Requirement: The Flip Re-Syncs The Existing Project In Place

Stage 2 SHALL re-sync the existing claude.ai/design project `531d158d-…` through
the atomic re-sync path; it SHALL NOT create a new project, and SHALL preserve
the project's user-authored designs.

#### Scenario: Existing project is reused
- **WHEN** the flip uploads the storybook-shape artifacts
- **THEN** they are uploaded to the existing project `531d158d-…`
- **AND** no new project or `projectId` is created

#### Scenario: User-authored designs survive the re-sync
- **WHEN** the atomic-path upload reconciles the project's files
- **THEN** the user-authored `explorations/` design is preserved
- **AND** the delete scope never removes files the sync did not produce

#### Scenario: Upload waits for full verification and user approval
- **WHEN** the re-sync is ready to upload
- **THEN** every in-scope story is graded `match`/`close` (none left `mismatch`/
  `sb-error`/`unpaired`/`error` unresolved) before any bytes are uploaded
- **AND** the upload proceeds only after the `finalize_plan` approval

### Requirement: The Storybook ↔ Design-Sync Loop Is Documented As A Runbook

Stage 2 SHALL deliver a self-contained runbook that lets an agent or a human run
the workbench, perform a re-sync in both directions, and develop normally without
additional context.

#### Scenario: A reader can run the workbench and the sync from the runbook alone
- **WHEN** an agent or human reads the runbook
- **THEN** it states how Storybook works in this repo, how to run/use it, and the
  one-command re-sync flow including how to read and grade the compare sheets
- **AND** it states what re-verifies when a component, a story, or styling changes

#### Scenario: A reader knows the protected boundaries
- **WHEN** the runbook describes developing normally
- **THEN** it states the boundaries: no component edits to satisfy the sync, reuse
  the existing project, and never delete the project's user-authored designs
