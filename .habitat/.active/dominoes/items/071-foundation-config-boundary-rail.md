# Domino 071: Foundation Config Boundary Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 71: Foundation Config Boundary Rail

Status: closed on `codex/habitat-foundation-config-boundary-rail`.

Purpose: implement the first queued boundary-inversion slice without moving
static source-pattern authority into package tests or MJS scripts.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_foundation_op_contract_config_bags` | Preserved in foundation domain rules and widened to executable Grit authority against root/foundation config facade imports in operation contracts. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-foundation-config-boundary-rail.md` |
| `prohibit_foundation_step_contract_config_bags` | Preserved in Swooper Maps standard recipe foundation-stage rules and widened to executable Grit authority against root/foundation config facade imports in step contracts. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-foundation-config-boundary-rail.md` |

Moves it forward:

- Repairs selected packet-local source Grit execution so rule packet patterns
  are actually run by native Grit.
- Captures the tool-separation correction: source syntax stays in Grit,
  project graph law stays in Nx, and package tests do not become junk drawers
  for retired static assertions.
- Removes the duplicate package-test config-bag assertions now owned by the
  two Habitat Grit rails.
- Closes two implementation-ready boundary rows in the canonical remediation
  JSON.

Closure note:

- Injected bad imports failed both rules, then the temporary probes were
  removed and focused clean checks passed.
- No product behavior changed.
