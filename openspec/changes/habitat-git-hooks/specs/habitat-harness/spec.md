## ADDED Requirements

### Requirement: Hooks Run Harness Checks At Git Moments

Local Git hooks SHALL be thin delegators to `habitat hook <name>`: pre-commit
runs staged-scope hygiene, cheap structural checks, and the generated-zone
guard; pre-push runs merge-base affected verification. CI SHALL remain the
authoritative gate.

#### Scenario: Cheap mistake caught locally
- **WHEN** a commit stages an unformatted file or a generated-zone hand-edit
- **THEN** pre-commit fails (or fixes formatting) before the commit lands

#### Scenario: Hook bypass
- **WHEN** a contributor commits with `--no-verify`
- **THEN** the same rules still gate the change in CI

### Requirement: Pre-Commit Restages Only Formatter-Touched Files

The pre-commit hook SHALL re-stage exactly the files its formatter modified
and SHALL NOT stage, modify, or unstage any other file, including foreign
staged files present in shared worktrees.

#### Scenario: Foreign staged work is preserved
- **WHEN** the index contains staged files from another work lane and
  pre-commit formats the current change's staged files
- **THEN** only the formatter-touched paths are re-staged and the foreign
  staged entries are byte-identical afterward
