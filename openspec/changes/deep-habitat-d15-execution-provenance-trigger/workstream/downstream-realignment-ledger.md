# Downstream Realignment Ledger: D15 Execution Provenance Trigger

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D6 Diagnostic Pattern Catalog | dormant trigger consumer | D6 is accepted for design/specification only and remains source-blocked behind D0/D1/D2 implementation facts. D15 is triggered only if D6 records a diagnostic command-observation state that D6-local projections cannot represent. |
| D7 Structural Enforcement Pipeline | dormant trigger consumer | D7 remains source-blocked behind live D2/D3/D5/D6/D10 projections. D15 is triggered only if D7 records an enforcement command/cache/cwd/env/output state that local check pipeline DTOs cannot represent. |
| D9 Transformation Transaction | dormant trigger consumer | D9 remains source-blocked behind live D8/D10/G-HOST projections. D15 is triggered only if D9 records a dry-run/apply/rollback command-observation state that transaction records cannot represent. |
| D11 Local Feedback | dormant trigger consumer | D11 remains source-blocked behind live D3/D6/D7/D9/D10 projections. D15 is triggered only if D11 records a hook/local-feedback command observation that those upstream projections cannot represent. |
| G-HOST Host Policy Boundary Gate | dormant trigger consumer | G-HOST remains accepted for design/specification only. D15 is triggered only if host-policy implementation records a command/projection observation contradiction after local DTO/projection modeling. |
| D0 command surface inventory | source blocker | Any future D15 public command, JSON, export, script, target, generator, hook, doc, or example change must cite concrete D0 compatibility rows before source implementation. |
| D1 output-family boundary | source blocker | Any future D15 public receipt/diagnostic/transaction/handoff field must use D1 output-family handling and non-claim language before source implementation. |
| Packet index | accepted design/specification status | Record D15 accepted for design/specification only after final rereviews found no unresolved P1/P2. D15 remains not implementation-complete and source work stays blocked unless a later accepted packet changes D15 from `dormant` to `trigger-accepted`. |
| Future trigger owner packet | sequential dependency | If more than one consuming packet triggers shared command-observation substrate work, create one sequential owner packet before implementation so adjacent packets consume a single authority. |
| Tests and command fixtures | later implementation only | Add command-observation fixtures only after a later accepted packet changes D15 from `dormant` to `trigger-accepted`. |
