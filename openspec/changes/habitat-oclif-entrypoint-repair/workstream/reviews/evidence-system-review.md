# Evidence And System Review

## Verdict

blocked

## Findings

| ID | Severity | File/Section | Finding | Required Repair |
| --- | --- | --- | --- | --- |
| ESR-1 | P1 | `workstream/downstream-realignment-ledger.md` / Realignment Rows; `docs/projects/habitat-harness/research/local-stage0-claim-extraction.md` / Stale Record Risks | The realignment ledger is under-scoped for the stale-record failure this packet is meant to stop. It covers the old H4.5 phase record and `workstream-record.md`, but Stage 0 already identified additional current-proof hazards: `docs/projects/habitat-harness/review-disposition-ledger.md` still says all accepted repairs were applied and all eight changes revalidated; `docs/projects/habitat-harness/discrepancy-log.md` can still be read as "no code-violates-docs" current truth; and `docs/projects/habitat-harness/FRAME.md` still carries historical branch/status language. Leaving these outside the ledger lets future agents cite green historical records after this P0 repair, recreating the false-confidence loop. | Expand the downstream realignment ledger and tasks before implementation. Add explicit rows and dispositions for `review-disposition-ledger.md`, `discrepancy-log.md`, and `FRAME.md` status/branch language, or record a source-backed no-patch/deferred disposition for each. Add a stale-record scan gate that must be rerun before closure, and make closure block while any stale current-proof wording remains unresolved. |
| ESR-2 | P2 | `design.md` / Selector Boundary; `specs/habitat-harness/spec.md` / Requested Rule Selectors; `tasks.md` / Tests And Probes, Verification | The packet correctly names the "all individual selectors exist, but the combined selector set has no rule" case, but it only requires unit coverage. The OpenSpec scenarios and command verification list cover unknown owner/rule/tool and tool-as-rule, not a real CLI JSON/human proof for an empty intersection of valid selectors. That leaves one false-green selector path under-proven at the same command boundary that downstream aliases trust. | Add an OpenSpec scenario and verification command for a valid-selector empty intersection, including JSON mode `ok: false`, non-zero exit, no rule execution, and no green-only `baseline-integrity` report. Also cover the same condition for `--expand-baseline` with proof that no baseline file is created or modified. |
| ESR-3 | P2 | `proposal.md` / Consumer Impact and Verification Gates; `specs/habitat-harness/spec.md` / Canonical Habitat Entrypoints | Unknown-command behavior is a named P0 command-trust outcome in the proposal and tasks, but it is not represented as an OpenSpec requirement/scenario. Because the original bug is help flags being misclassified as unknown commands, the packet needs a spec-level guard that unknown commands still fail truthfully after help is repaired. | Add a spec scenario requiring `bun run habitat -- definitely-not-a-command` to exit non-zero with an unknown-command diagnostic, not help output and not a command-class mock. If production/dev unknown-command behavior is claimed, state which entrypoints must be proven and what output class is expected. |
| ESR-4 | P2 | `proposal.md` / Verification Gates; `design.md` / Entrypoint Repair and Test And Proof Design; `workstream/phase-record.md` / Verification | The packet says production-runner proof must come after a clean build and not from stale ignored artifacts, but the proof contract is still just "run build, then run `bin/run.js`." It does not require recording artifact freshness, manifest/build output provenance, cwd/argv/stdout/stderr/exit, or a clean generated-output boundary. This is weaker than the stale-artifact stop condition and could allow a passing production probe to be recorded without proving which build artifacts it exercised. | Add a production-runner proof record shape to the phase record or tasks: branch/commit, build command, cwd/env, generated artifact paths, manifest/dist mtime or hash after build, runner argv, exit code, stdout/stderr class, and explicit non-claims. Closure should fail if the production runner can only pass against pre-existing ignored output. |

## Positive Checks

- The packet separates the two observed failures: root/dev oclif dispatch belongs to the command shell, while invalid selector truth belongs to the check/report boundary.
- It does not treat OpenSpec validation as behavior proof; OpenSpec validation is listed alongside, not instead of, command and entrypoint gates.
- Command-class mocks are explicitly rejected as root/dev/production proof, and the packet requires real entrypoint tests or smoke probes.
- The selector repair preserves valid Grit tool selection while requiring unknown rule/tool/owner selectors to fail non-zero.
- Owner and protected-path boundaries are mostly clear: no generated `dist` or manifest hand edits, no Grit/baseline/hook/Nx scope creep, and no reusable-library `process.exit()`.
- The Effect decision is scoped to this P0 repair and records reopen triggers rather than globally rejecting Effect.
- The system feedback loop is named directly: stale closure records plus false-green command output become proof for future work, and the intended balancing loop is command-boundary validation plus real entrypoint proof.

## Open Questions

None beyond the findings above.
