## 1. Failure Model

- [ ] 1.1 Read existing runtime-control, observation, diagnostics, and
      direct-control setup readback code.
- [ ] 1.2 Introduce or tighten the closed internal setup failure reason union.
- [ ] 1.3 Map setup failure reasons to existing safe public categories without
      adding private fields to public payloads.
- [ ] 1.4 Add direct-control active target mod-set readback for generated-mod
      enablement classification.
- [ ] 1.5 Add bounded private diagnostics context for row and mod-set failures.

## 2. Tests

- [ ] 2.1 Add behavior tests for row-not-visible, row-mismatched,
      generated-mod-not-enabled, setup-read-timeout, and tuner-unavailable.
- [ ] 2.2 Add projection tests proving public payloads stay safe while explicit
      diagnostics lookup returns private details.
- [ ] 2.3 Add tests that row absence cannot be classified as
      generated-mod-not-enabled without active mod-set readback.
- [ ] 2.4 Add a focused live or controlled endpoint check for the known
      generated-row-missing condition.

## 3. Verification

- [ ] 3.1 Run `bun run openspec -- validate studio-run-setup-failure-taxonomy --strict`.
- [ ] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [ ] 3.3 Run focused runtime-control diagnostics tests.
- [ ] 3.4 Run direct-control setup readback tests for active mod-set evidence.
- [ ] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [ ] 3.6 Record every gate in `workstream/verification-evidence.md`.
