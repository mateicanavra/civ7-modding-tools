# Downstream Realignment Ledger: D15 Execution Provenance Trigger

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D6 Diagnostic Pattern Catalog | dormant trigger consumer | D6 records D15 only if diagnostic command observations cannot be represented by D6-local contracts. Current D6 records do not accept a trigger. |
| D7 Structural Enforcement Pipeline | dormant trigger consumer | D7 records D15 only if an enforcement command/cache/cwd/env/output state cannot be represented by local check pipeline DTOs. Current D7 records do not accept a trigger. |
| D9 Pattern Apply | dormant trigger consumer | D9 records D15 only if a dry-run/apply/rollback command-observation state cannot be represented by transaction records. Current D9 records do not accept a trigger. |
| D11 Hook Runtime | dormant trigger consumer | D11 records D15 only if hook-runtime command observations cannot be represented by upstream local contracts. Current D11 records do not accept a trigger. |
| G-HOST Host Policy Boundary Gate | dormant trigger consumer | G-HOST records D15 only if host-policy implementation records a command-observation contradiction after local DTO modeling. Current G-HOST records do not accept a trigger. |
| D0 command surface inventory | source blocker | Any future D15 public command, JSON, export, script, target, generator, hook, doc, or example change must cite concrete D0 compatibility rows before source implementation. |
| D1 output-family boundary | source blocker | Any future D15 public receipt/diagnostic/transaction/handoff field must use D1 output-family handling and support-boundary language before source implementation. |
| Packet index | accepted design/specification status | Record D15 accepted for design/specification only after final rereviews found no unresolved P1/P2. D15 remains not implementation-complete and source work stays blocked unless a later accepted packet changes D15 from `dormant` to `trigger-accepted`. |
| Future trigger owner packet | sequential dependency | If more than one consuming packet triggers shared command-observation substrate work, create one sequential owner packet before implementation so adjacent packets consume a single contract. |
| Tests and command fixtures | later implementation only | Add command-observation fixtures only after a later accepted packet changes D15 from `dormant` to `trigger-accepted`. |
