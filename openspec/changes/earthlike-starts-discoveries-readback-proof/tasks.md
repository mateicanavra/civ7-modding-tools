## 1. Activation

- [ ] 1.1 Link concrete failing or missing starts/discoveries proof row.
- [ ] 1.2 Classify whether the issue is placement truth, discovery planning,
  live materialization, or readback surface.

## 2. Proof Or Repair

- [ ] 2.1 Add package-owned readback wrapper only if current proof surface is
  insufficient.
- [ ] 2.2 Add focused failing-row diagnostic or test.
- [ ] 2.3 Repair the proven owner.

## 3. Verification

- [ ] 3.1 Re-run starts/discoveries acceptance rows.
- [ ] 3.2 Run focused package tests/checks for touched owners.
- [ ] 3.3 Run `bun run openspec -- validate earthlike-starts-discoveries-readback-proof --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
