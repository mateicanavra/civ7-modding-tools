## 1. Report Model

- [ ] 1.1 Add private `RunAttributionReport` model.
- [ ] 1.2 Create report with request workspace/manifest.
- [ ] 1.3 Append generation, deployment, observation, and terminal sections.
- [ ] 1.4 Implement required-section completion semantics from
      `target-vocabulary.md`.

## 2. Diagnostics

- [ ] 2.1 Link attribution report from diagnostics record.
- [ ] 2.2 Include attribution report in copy-diagnostics lookup output.
- [ ] 2.3 Keep attribution out of public status/current/events.

## 3. Verification

- [ ] 3.1 Add behavior tests for report lifecycle and completion semantics.
- [ ] 3.2 Run and record live Studio endpoint checks that diagnostics lookup returns
      private attribution while public status/current/events do not expose it.
- [ ] 3.3 Register SA-13 `structure-studio-run-attribution-records`.
- [ ] 3.4 Record verification evidence for every declared gate in
      `workstream/verification-evidence.md`; this packet does not close with
      skipped gates.
- [ ] 3.5 Run and record the required TypeScript refactoring, code
      quality/structure, and oRPC/Effect/library correctness review lanes,
      including JSDoc and anchor-comment review.
