## ADDED Requirements

### Requirement: Runtime Config Merge Check Is Active After Source Remediation

Habitat SHALL register `grit-runtime-config-merge` as an active Grit check only
after the live runtime empty-object fallback candidates are remediated or
otherwise dispositioned.

#### Scenario: Source remediation removes previous live candidates

- **WHEN** Swooper runtime step or domain-op source previously used `?? {}` to
  hide absent config defaults at runtime call sites
- **THEN** the owning policy/helper boundary SHALL own the absent-config
  behavior
- **AND** current runtime step/domain-op source SHALL have zero
  current-predicate `?? {}` candidates after remediation

#### Scenario: Active predicate detects runtime config merge syntax

- **WHEN** native Grit proof runs `runtime_config_merge`
- **THEN** the rule SHALL report current-predicate runtime step/domain-op
  `?? {}` and `Value.Default(...)` samples
- **AND** it SHALL keep stage-root config shaping, `.tsx`, other-mod paths,
  non-empty object fallbacks, `|| {}`, qualified `Value.Default` lookalikes,
  and source strings as controls

#### Scenario: Parser inventory is recorded for runtime config merges

- **WHEN** the row records parser inventory for runtime config merge/defaulting
  syntax
- **THEN** the record SHALL name scan roots, exclusions, current predicate,
  broader retired-stage context, candidate buckets, counts, row id, and
  non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** zero current-source candidates SHALL be recorded only inside the
  current runtime step/domain-op predicate

### Requirement: Runtime Config Merge Shared Proof Classes Stay Separate

Habitat SHALL keep proof classes separate for `grit-runtime-config-merge`.

#### Scenario: Active rule has wrapper, baseline, and injected proof

- **WHEN** the rule is registered
- **THEN** Habitat SHALL prove per-rule wrapper selection, aggregate Grit wrapper
  health, explicit empty baseline ownership, and injected violation/path-control
  behavior as separate proof classes
- **AND** row records SHALL NOT treat native fixtures or parser inventory as
  substitutes for wrapper, baseline, or injected proof

#### Scenario: Runtime config merge non-claims remain explicit

- **WHEN** the active RCM checkpoint is recorded
- **THEN** row records SHALL state that raw direct Grit acquisition, broad
  retired parity, broad runtime-purity closure, apply safety,
  classify/generator behavior, and product/runtime proof are non-claims
- **AND** future work SHALL reopen the row only for new current-source
  candidates, architecture-boundary changes, retired parity proof, or a
  separately proven apply/product closure
