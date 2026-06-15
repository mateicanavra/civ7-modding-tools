## 1. Candidate Packet And Authority

- [x] 1.1 Open this per-candidate packet before any closure claim.
- [x] 1.2 Confirm the corpus ledger, retired full-profile guardrail, taxonomy,
  invariant corpus, and recovery references.
- [x] 1.3 Define proof classes, non-claims, and reopen trigger.

## 2. Predicate Design Disposition

- [x] 2.1 Test structural import-source predicate forms against value and
  type-only fixture classes.
- [x] 2.2 Test regex-based forms and record Grit lookaround support limits.
- [x] 2.3 Remove unsafe `.grit` pattern, `rules.json`, baseline, and injected
  probe surfaces after the predicate could not be made safe.
- [x] 2.4 Record `DEI-PREDICATE-BLOCKER-2026-06-15`.

## 3. Parser Inventory

- [x] 3.1 Run deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 3.2 Record scan root, exclusions, current predicate, counts, zero current
  exact engine-import candidates, and parser-edge non-claims.
- [x] 3.3 Record `DEI-DOMAIN-OPS-INVENTORY-2026-06-15`.

## 4. Shared Proof And Non-Claims

- [ ] 4.1 Register active Habitat Grit rule.
  - Blocked: no safe native Grit predicate is registered in this checkpoint.
- [ ] 4.2 Native positive fixture proof.
  - Blocked: the candidate has no safe registered pattern.
- [ ] 4.3 Habitat wrapper/current-tree proof.
  - Non-claim: shared wrapper proof covers current active registered Grit
    checks, not this unregistered candidate.
- [ ] 4.4 Raw direct Grit acquisition.
  - Non-claim: raw direct proof remains separate.
- [ ] 4.5 Baseline file/integrity proof.
  - Non-claim: no baseline is added for an unregistered candidate.
- [ ] 4.6 Injected violation and cleanup/path-control proof.
  - Non-claim: no injected probe is added for an unregistered candidate.
- [ ] 4.7 Apply safety, retired parity, classify/generator behavior, broader
  domain-refactor closure, and product/runtime proof.
  - Non-claims for this checkpoint.

## 5. Downstream Realignment

- [x] 5.1 Update the corpus ledger candidate row with the blocker disposition.
- [x] 5.2 Update the command proof log with predicate-blocker and inventory
  proof ids.
- [x] 5.3 Record no proof-matrix row because this candidate is not registered
  as an active Habitat Grit check.

## 6. Verification

- [x] 6.1 Deterministic TypeScript parser inventory over
  `mods/mod-swooper-maps/src/domain`.
- [x] 6.2 `bun run openspec -- validate habitat-grit-proof-domain-engine-imports --strict`
- [x] 6.3 `bun run openspec:validate`
- [x] 6.4 `git diff --check`
- [ ] 6.5 Supervisor review of this blocker checkpoint.
