## 1. Outcome Contract

- [ ] 1.1 Define per-tile placement outcome schemas for resources and
  discoveries.
- [ ] 1.2 Define typed rejection reasons and mismatch categories.
- [ ] 1.3 Update adapter/test doubles to report outcomes.

## 2. Reconciliation

- [ ] 2.1 Update resource placement to reconcile plan intent against outcomes.
- [ ] 2.2 Update discovery placement to reconcile plan intent against outcomes.
- [ ] 2.3 Fail on unexplained drift, wrong type/location, or untyped rejection.
- [ ] 2.4 Avoid count-equality gates.

## 3. Authority Realignment

- [ ] 3.1 Update docs that describe resource/discovery official generator
  output as accepted truth.
- [ ] 3.2 Update affected ADR/deferral records.

## 4. Verification

- [ ] 4.1 Run resource/discovery reconciliation tests.
- [ ] 4.2 Run adapter outcome tests.
- [ ] 4.3 Run `bun run openspec -- validate normalize-placement-reconciliation --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
