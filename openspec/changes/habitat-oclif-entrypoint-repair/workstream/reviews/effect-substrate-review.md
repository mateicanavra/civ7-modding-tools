# Effect Substrate Review

## Verdict

accepted-with-findings

## Findings

| ID | Severity | File/Section | Finding | Required Repair |
| --- | --- | --- | --- | --- |
| EFR-1 | P2 | `openspec/changes/habitat-oclif-entrypoint-repair/design.md` Selector Boundary / Effect Decision | The proposed typed selector result is directionally correct, but the failure payload still leaves decisive facts in `message`. The design must prove `--rule grit-check` as "known tool, wrong selector namespace", unknown owner/rule/tool, and valid-individuals-empty-intersection without relying on rendered text. As written, an implementation could satisfy the union with `{ reason, message }` while tests only assert strings, preserving the same untyped-control-flow root cause in a compact shape. | Strengthen the selector outcome contract with structured failure facts: selector kind, requested value, matched namespace when any, matched/known status per requested selector, and empty-intersection participants. Require unit tests to assert those structured fields directly, then separately test human/JSON rendering. |
| EFR-2 | P2 | `proposal.md` Effect Decision; `design.md` Effect Decision; `tasks.md` Tests And Probes | The packet says non-adoption is allowed only if current TypeScript provides service-test seams, but the implementation tasks only require child-process smoke tests and selector/report unit tests. That repairs the missed entrypoint proof, but it does not define the non-Effect alternative to Effect Layers/service injection for the central `createCheckReport()` path, which currently owns rule registry access, execution, baselines, clock, and report assembly. | Add a bounded service-seam contract for this slice or constrain the non-adoption claim. Required content: specify how selector/report unit tests can provide a fake rule registry and avoid real baseline/tool execution, and whether `Clock`, `RuleRegistry`, `RuleRunner`, and `BaselineStore` stay as simple injected functions/interfaces for P0. If that seam is rejected as out of scope, make it an explicit trigger for `habitat-effect-check-pipeline` before adding further check-pipeline failures. |
| EFR-3 | P2 | `proposal.md` Effect Decision; `spec.md` Command Proof Uses Real Entrypoints; `tasks.md` Tests And Probes / Verification | Command provenance is required by the Effect evaluation and by this packet's own non-adoption gate, but the spec/tasks only require exit code plus output class for entrypoint tests. Current `SpawnResult` only carries exitCode/stdout/stderr, and the packet does not define where argv, cwd, env delta, duration, failure class, build provenance, and stdout/stderr excerpts are recorded. This can leave production proof and stale-record repair under-specified while still passing the listed tests. | Add a command-proof/provenance record shape for this slice. It can be test metadata or phase-record entries, but it must record argv, cwd, relevant env delta, exit code, stdout/stderr class or excerpt, duration or timing source, failure class, and production build/manifest provenance for `bin/run.js` proof. Update tasks so verification records this shape, not just "output class". |
| EFR-4 | P2 | `design.md` Effect Decision; `phase-record.md` Effect Decision | The future Effect trigger is not concrete enough. "If selector, baseline, or command-runner failures keep accumulating in the central imperative `createCheckReport()` path" has no threshold, owner, or stop point, and it is weaker than the proposal's more actionable triggers around string/throwing control flow, broader command-runner redesign, and provenance capture. Implementers could add one or two more manual branches and still claim the trigger has not fired. | Replace the prose trigger with an objective trigger matrix. Examples: any new non-selector typed failure added to `createCheckReport()`, any command proof requiring richer than current `SpawnResult`, any second check-pipeline policy outcome modeled as message/string/throw, or any unit test requiring whole-engine mocks for selector/baseline/runner behavior opens `habitat-effect-check-pipeline` or `habitat-effect-command-runner` before dependent work. |

## Positive Checks

- Non-adoption for the localized P0 help repair is justified: direct source oclif help works, and the observed help failure is in the manual root/dev dispatcher.
- The packet correctly keeps oclif as the outer command shell and does not use Effect as a CLI-framework migration excuse.
- The selector repair is placed before report construction and explicitly forbids green-only `baseline-integrity` reports for requested invalid selectors.
- JSON selector failure compatibility is preserved through schemaVersion 1 CheckReport rendering instead of unstructured throws.
- Root/dev/production proof must use real entrypoints; command-class mocks are explicitly demoted to unit-test support.
- `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict` passes in this worktree.

## Open Questions

None. The material readiness issues are captured as required repairs above.
