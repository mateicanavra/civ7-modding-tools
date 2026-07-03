# Domino 069: Admit Service Module Shape Residual Context

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 69: Admit Service Module Shape Residual Context

Status: closed on `codex/habitat-service-module-shape-context`.

Purpose: repair the stale `closed structure inversion` label for the residual
Habitat Toolkit service-module file-shape rule.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `validate_habitat_service_module_file_shape` | reclassified to context admission | Root topology was already split into `validate_habitat_service_module_root_topology`; the residual script still owns recursive suffix, policy naming, and router-shape constraints that current structure TOML cannot express. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-service-module-shape-context.md` |

Moves it forward:

- Clears the final stale `closed structure inversion` packet-needed row.
- Keeps recursive service-module file-shape validation in Habitat instead of
  moving it into package-owned tests.
- Names the real future collapse point: a declarative file-tree/suffix
  allowlist runner that can subsume the residual script.

Closure note:

- No Toolkit rule behavior changed.
- This does not resolve the broader deferred Toolkit `_blueprints` pocket; it
  only repairs the current action classification for this residual rule.
