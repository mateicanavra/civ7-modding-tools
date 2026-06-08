## 1. Activation

- [ ] 1.1 Link concrete map-size latitude mismatch row.
- [ ] 1.2 Record current Standard/Huge verified policy as non-regression
  constraints.

## 2. Policy Extraction And Repair

- [ ] 2.1 Extract live row-latitude facts for the affected map size.
- [ ] 2.2 Encode verified policy in the adapter/map-policy owner.
- [ ] 2.3 Add focused non-regression tests for the affected size and existing
  verified sizes.

## 3. Verification

- [ ] 3.1 Re-run final-surface parity proof for the affected size.
- [ ] 3.2 Run focused adapter/map-policy tests/checks.
- [ ] 3.3 Run `bun run openspec -- validate civ7-map-size-latitude-policy-completion --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
