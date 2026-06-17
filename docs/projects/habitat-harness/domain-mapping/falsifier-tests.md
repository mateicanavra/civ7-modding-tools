# Habitat Domain Falsifier Tests

These tests are used to judge whether the candidate domain frame is valid. They
are design falsifiers, not automated test cases.

## Falsifier Results

| Test | Question | Result | Evidence | Disposition |
| --- | --- | --- | --- | --- |
| Scenario fit | Can the frame explain classify, check, verify, fix, hook, generator, pattern, and future authoring scenarios better than current file layout? | Pass | S01-S12, F01-F12, context map | Keep candidate contexts. |
| One owner per invariant | Does each invariant have one target authority? | Pass with watch item | A01-A12 | Watch A05/A10 and A06/A10 during implementation because Grit acquisition, pattern governance, and apply safety are easy to blur. |
| Proof clarity | Does each scenario preserve proof class and non-claims? | Pass | F03-F06, E05-E10 | Keep Proof Contract as a distinct context. |
| Substrate vs authoring | Does the frame prevent current structural substrate from being overclaimed as MapGen authoring? | Pass | S07, S10, S11, E12-E14 | Authoring Topology remains hypothesis-labeled. |
| Refusal handling | Are unsupported states product outputs rather than missing prose? | Pass | S07, S10, S11 | Preserve refusal as domain language. |
| Grit ambiguity | Does the frame avoid treating all Grit activity as one context? | Pass | A05, A06, A10 | Keep Diagnostic Pattern Catalog, Pattern Governance, and Transformation Transaction separate. |
| Hook authority | Does the frame avoid overstating local hooks as CI proof? | Pass | S06, E10 | Keep Local Feedback separate from Structural Enforcement and Proof Contract. |
| Current-code mirror | Does the packet merely mirror `src/lib` and `src/commands`? | Pass | current-code critique, context map rejected boundaries | No implementation refactor proposed here. |

## Stop Conditions For Future Work

- A proposed implementation slice changes Habitat behavior before citing the
  domain context and authority it serves.
- A generator slice treats project scaffolding as proof that MapGen authoring
  topology is implemented.
- A pattern slice registers enforcement from Grit prose or Nx options without
  accepted Pattern Authority evidence.
- A hook slice claims CI or product proof from local feedback.
- A proof slice drops explicit non-claims.

## Acceptance Tests For The Domain Packet

- A new agent can read the packet and know which Habitat surface to use before
  editing a path, checking a rule, proving a handoff, drafting a pattern, or
  refusing a MapGen authoring request.
- A reviewer can point each invariant to one authority row.
- A future implementation plan can be sliced by authority, not by current file
  placement.
- Desired authoring scenarios remain clearly separate from current supported
  substrate behavior.
