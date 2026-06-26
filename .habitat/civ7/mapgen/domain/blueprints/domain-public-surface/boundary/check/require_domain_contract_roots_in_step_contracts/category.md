# Require Domain Contract Roots In Step Contracts

Subject ID: `require_domain_contract_roots_in_step_contracts`

Title: Require Domain Contract Roots In Step Contracts

Blueprint: `domain-public-surface`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_domain_contract_roots_in_step_contracts`

Files:
- `require_domain_contract_roots_in_step_contracts.baseline.json`
- `require_domain_contract_roots_in_step_contracts.pattern.md`
- `require_domain_contract_roots_in_step_contracts.rule.json`
- `require_domain_contract_roots_in_step_contracts.rule.mjs`

Evidence: The pattern allows step contracts to import only domain contract roots, not runtime or private domain files.

Notes:
- none
