# Rule Remediation: Existing Grit Rail Contexts

Status: closed on `codex/habitat-existing-grit-rail-contexts`

## Slice

Selected rules:

- `prohibit_morphology_runtime_continent_step_tokens`
- `prohibit_runtime_continent_contract_tokens`
- `prohibit_rng_callback_state_in_ops`
- `prohibit_studio_rpc_eventhub_lifecycle_leaks`

Action class: runtime/source validation.

## Decision

No authority-state mutation is required. These rows were still marked as
needing runtime/source validation, but the current packets already use exact
packet-local Habitat/Grit source-check rails over concrete recurrence-risk
contexts.

These are not package-test candidates and not Nx boundary candidates. They
guard source-shape recurrence that sits below project graph law and above
ordinary behavior tests.

## Rule Outcomes

| Rule | Outcome |
| --- | --- |
| `prohibit_morphology_runtime_continent_step_tokens` | Retain existing Grit rail over morphology implementation source for runtime continent identifiers and direct landmass marking calls. |
| `prohibit_runtime_continent_contract_tokens` | Retain existing Grit rail over morphology contract/artifact source for runtime continent identifiers. |
| `prohibit_rng_callback_state_in_ops` | Retain existing domain-operation blueprint Grit rail for ambient RNG callback/state surfaces in domain ops. |
| `prohibit_studio_rpc_eventhub_lifecycle_leaks` | Retain existing Studio server Grit rail for EventHub lifecycle leakage through daemon/context source. |

## Exclusions

| Row | Reason |
| --- | --- |
| `enforce_studio_rpc_eventhub_topology` | Positive Studio server mount/topology script; not equivalent to EventHub lifecycle leak source-token recurrence. |
| `prohibit_runtime_local_config_default_merging` | Runtime config/defaulting remainder row is broader and not an exact packet-local Grit recurrence rail. |
| `prohibit_ambient_rng_in_authored_generation` | Separate deterministic authored-generation positive authority candidate; do not collapse it into domain-operation RNG callback recurrence. |

## Proof

- `bun habitat check --rule prohibit_morphology_runtime_continent_step_tokens --json`
  passed.
- `bun habitat check --rule prohibit_runtime_continent_contract_tokens --json`
  passed.
- `bun habitat check --rule prohibit_rng_callback_state_in_ops --json`
  passed.
- `bun habitat check --rule prohibit_studio_rpc_eventhub_lifecycle_leaks --json`
  passed.
- Current source scans for the guarded token families produced no live
  violations.

## Proof Limit

This slice does not create positive tag/effect authority, positive deterministic
authored-generation authority, or Studio server topology authority. It only
repairs the canonical remediation matrix so already-correct Grit rails are not
kept in the packet-needed queue.
