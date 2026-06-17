## ADDED Requirements

### Requirement: Helper Redeclaration Apply Preserves Helper Semantics

Habitat SHALL treat exact runtime helper remediation as valid only when the
replacement preserves the original helper behavior for finite and non-finite
inputs.

#### Scenario: Plain clamp helper uses canonical clamp01

- **WHEN** a runtime recipe/domain helper redeclares `clamp01` as
  `Math.max(0, Math.min(1, value))`
- **THEN** the remediation may replace the local helper with a canonical
  `clamp01` import
- **AND** existing one-argument call sites may remain one-argument calls

#### Scenario: Non-finite clamp helper uses explicit clampPct fallback

- **WHEN** a runtime recipe/domain helper redeclares `clamp01` with
  `Number.isFinite` fallback-to-zero behavior
- **THEN** the remediation SHALL NOT alias `clampPct` as `clamp01` while
  leaving one-argument call sites intact
- **AND** the remediation SHALL rewrite call sites to
  `clampPct(value, 0, 1, 0)` or an equivalent proven canonical form

#### Scenario: Helper body is not equivalent

- **WHEN** an exact helper-like declaration uses a different fallback or body
- **THEN** the apply pattern SHALL leave it unchanged
- **AND** the row SHALL NOT claim semantic remediation for that helper

### Requirement: Helper Remediation Does Not Register A Shared Apply Adapter

Habitat SHALL keep `helper_redeclarations_to_imports` as a row-owned direct Grit
remediation unless the shared apply adapter supports multiple apply workflows
with reviewed transaction proof.

#### Scenario: Current adapter cannot route multiple apply workflows

- **WHEN** adding the helper apply workflow to the shared `habitat fix` allowlist
  makes Grit treat the second workflow file as an input path
- **THEN** the helper row SHALL NOT register that workflow in the shared adapter
- **AND** it SHALL record direct Grit remediation proof separately from Habitat
  apply selector proof

### Requirement: Runtime Helper Check Returns Clean After Remediation

After source remediation, Habitat SHALL prove the active
`grit-runtime-helper-redeclarations` check no longer reports the remediated live
helpers.

#### Scenario: Current source no longer redeclares runtime helpers

- **WHEN** the row has removed the three live helper redeclarations
- **THEN** parser inventory SHALL report zero current-predicate helper
  redeclaration candidates
- **AND** `habitat:check -- --rule grit-runtime-helper-redeclarations` SHALL
  pass with zero diagnostics
