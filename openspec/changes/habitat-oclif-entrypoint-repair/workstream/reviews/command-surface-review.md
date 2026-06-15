# Command Surface Review

## Verdict

accepted-with-findings

## Findings

| ID | Severity | File/Section | Finding | Required Repair |
| --- | --- | --- | --- | --- |
| CS-01 | P2 | `specs/habitat-harness/spec.md` / Command Proof Uses Real Entrypoints | The spec weakens the root/dev proof gate by saying a test or probe may execute the root package script **or** the development runner. The packet goal requires both canonical root script behavior and direct development runner behavior; proving only one can still leave `bun run habitat` or `bin/dev.ts` broken while records go green. | Change the scenario to require both root package script and direct development runner execution for root help and check help, with exit code and output-class assertions. Keep production as a separate after-build proof. |
| CS-02 | P2 | `specs/habitat-harness/spec.md`, `proposal.md` Verification Gates, `tasks.md` 4.3/5.9 | Unknown-command behavior is present as a verification command, but it is not specified as a required scenario with expected semantics. This leaves room for an implementation that exits non-zero but prints generic help, routes into check/report code, or preserves the manual `Unknown habitat command` path without making oclif own unknown-command lifecycle. | Add explicit unknown-command scenarios for the root script and direct development runner, and production runner after build if production command behavior is claimed. Require non-zero exit, oclif-owned unknown-command output class, no CheckReport emission, and no confusion with help flags. |
| CS-03 | P2 | `design.md` Selector Boundary, `tasks.md` 3.3/5.10-5.12 | Human-mode invalid selector behavior is required in prose but not proven by the verification matrix. The current gates cover JSON unknown rule/tool/owner and one `--expand-baseline` invalid rule path, but not normal human-mode `habitat check --rule/--tool/--owner ...` failures. | Add human-mode invalid selector smoke probes for unknown rule, unknown tool, and unknown owner. Assert non-zero exit and concise selector failure output that names whether the value was checked as owner, rule id, tool id, or combined selector set. |
| CS-04 | P2 | `design.md` Selector Boundary, `tasks.md` 3.4/4.5/5.15 | `--expand-baseline` is correctly brought into scope, but proof only names one invalid rule-id case. Since authoring mode is the write path, invalid owner, invalid tool, and valid-but-empty combined selectors must not silently do nothing or write baselines either. | Require `--expand-baseline` to use the same selector result boundary as check mode, and add unit or smoke proof for invalid owner, invalid tool, and combined empty-selection authoring requests with no baseline file creation, deletion, or rewrite. |
| CS-05 | P2 | `proposal.md` Verification Gates, `design.md` Entrypoint Repair, current `tools/habitat-harness` generated artifacts | The packet says production proof must not rely on stale generated artifacts, but it does not require root/dev proof to be run with generated `dist/**` and `oclif.manifest.json` absent. This worktree currently has ignored generated artifacts, so a naive dev-runner repair could pass by reading stale build output instead of source command discovery. | Add a source-runner proof gate: clean/remove harness generated artifacts before root script and direct `bin/dev.ts` help probes, then run the production build and prove `bin/run.js` after the fresh build. Record this ordering in tasks and phase proof labels. |
| CS-06 | P3 | `design.md` JSON mode, `specs/habitat-harness/spec.md` Requested Rule Selectors | Invalid selector JSON mode preserves `schemaVersion: 1`, but `--output` behavior is not specified. Existing check behavior writes the JSON report to `--output`; an invalid selector path that bypasses this would surprise machine consumers and weaken JSON/human mode parity. | Add a small scenario or task requiring invalid selector reports to honor `--output` consistently: write the failing CheckReport to the requested output path and preserve the selected stdout behavior. |

## Positive Checks

- The packet correctly separates command-shell help/unknown-command ownership from check/report selector truth.
- The selector model covers unknown owner, unknown rule, unknown tool, combined empty selection, and all-rules-with-no-filters as distinct states.
- JSON invalid selector behavior is specified as a failing schemaVersion 1 CheckReport and forbids the green-only `baseline-integrity` false positive.
- The valid `--tool grit-check` path is kept as a selector-truth proof without overclaiming broader Grit current-tree or apply safety.
- Production runner proof is explicitly tied to a clean build and forbids hand-editing generated `dist/**` or `oclif.manifest.json`.
- Stale H4.5/workstream-record realignment is in scope and tied to closure rather than left as a later documentation sweep.
- `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict` passes for the current packet.

## Open Questions

None.
