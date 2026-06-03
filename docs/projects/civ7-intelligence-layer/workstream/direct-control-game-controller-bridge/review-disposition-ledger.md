# Direct-Control Game Controller Bridge Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GCR-001 | P1 | User/product authority | Treating this as doc wording understates the material architecture change | authority/product | accepted | Open a real workstream, OpenSpec change, proof ledger, downstream realignment, and implementation-ready tasks | User correction on 2026-06-03; new phase artifacts | yes |
| GCR-002 | P1 | User/product authority | Literal Tuner deployment is not the success criterion | authority/product | accepted | Reframe baseline around `scope="game"` and optional `scope="shell"` native rails; leave Tuner as transport/state canary | Live probes and official resources | yes |
| GCR-003 | P1 | User/product authority | App UI game context parity means direct-control wrappers can move behind a baked controller | architecture | accepted | Promote controller to primary implementation candidate, not future direction | Live read-only parity and direct-control wrapper source | yes |
| GCR-004 | P1 | Proof audit | Controller can become baseline only through source-backed, live read-only, project-owned lifecycle, parity, and disposable mutation proof gates | verification | accepted | Add proof ledger and OpenSpec tasks separating proof classes | `proof-ledger.md`; Hume audit | yes |
| GCR-005 | P1 | Downstream audit | State-role/read/action OpenSpec records still encoded Tuner-default ownership | downstream | accepted | Patch state-role/read/action/capability/studio records or add supersession notes | Boyle audit; patched OpenSpec records | yes |
| GCR-006 | P1 | Implementation audit | Slice needs exact source paths and custom mod build because SDK lacks `UIScripts` action support | implementation | accepted | Add exact mod/direct-control paths and build/deploy commands to OpenSpec | Maxwell audit; patched `design.md` and `proposal.md` | yes |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
