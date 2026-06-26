# Guardrail Owner Map

## Acceptance Boundary

This packet does not enable new blocking guardrails. It records owner decisions
and intended artifact paths so implementation packets can enable them with
injected violation fixtures and baselines in the correct layer.

Any guardrail enabled later must include:

- owner layer;
- artifact path;
- injected violation fixture;
- current-tree proof;
- baseline decision;
- non-claims.

## Owner Decisions

| Guardrail class | Owner layer | Intended artifact path | First enabling packet | Non-claims |
|---|---|---|---|---|
| `Effect.run*` outside host/runtime/test zones | GritQL pattern plus Habitat rule | `.habitat/patterns/checks/habitat_effect_runtime_edges.md`, `.habitat/rules/habitat-effect-runtime-edges/rule.json` | `deep-habitat-effect-runtime-config-errors` or static guardrail follow-up if split | Does not prove resource finalizers or typed error quality. |
| Direct process execution outside command provider/scripts/tests | GritQL pattern plus Habitat rule | `.habitat/patterns/checks/habitat_direct_process_execution.md`, `.habitat/rules/habitat-direct-process-execution/rule.json` | `deep-habitat-effect-command-result-model` | Does not prove command output parity. |
| Direct filesystem/temp use outside providers/resources/config/host adapters/tests | GritQL pattern plus Habitat rule | `.habitat/patterns/checks/habitat_direct_filesystem_resources.md`, `.habitat/rules/habitat-direct-filesystem-resources/rule.json` | `deep-habitat-effect-runtime-config-errors` | Does not prove path policy or protected-zone correctness. |
| Direct `process.env`/`process.cwd` outside config/providers/host adapters/tests | GritQL pattern plus Habitat rule | `.habitat/patterns/checks/habitat_direct_env_config.md`, `.habitat/rules/habitat-direct-env-config/rule.json` | `deep-habitat-effect-runtime-config-errors` | Does not prove config values are semantically valid. |
| Direct time outside clock provider/host adapters/tests | GritQL pattern plus Habitat rule | `.habitat/patterns/checks/habitat_direct_clock.md`, `.habitat/rules/habitat-direct-clock/rule.json` | `deep-habitat-effect-runtime-config-errors` | Does not prove duration precision compatibility. |
| Generic expected `throw new Error` in migrated modules | GritQL pattern plus targeted TypeScript tests | `.habitat/patterns/checks/habitat_expected_error_algebra.md`, `.habitat/rules/habitat-expected-error-algebra/rule.json` | domain cutover packets | Does not ban impossible invariant defects when explicitly classified. |
| Broad internal barrels and `export *` | Existing Grit pattern plus public facade packet | Existing `contract-export-all` plus Habitat-specific facade rows | `deep-habitat-effect-public-surface-facade` | Does not classify package export compatibility by itself. |
| Mixed `ownerTool` authority in internals | TypeScript tests plus Grit syntax guard once identity fields exist | future `test/lib/command-contract-owner-tool-facade.test.ts`, optional `.habitat/patterns/checks/habitat_owner_tool_internal_identity.md` | `deep-habitat-effect-rule-registry-domain` and `deep-habitat-effect-check-baseline-cutover` | Does not change `CheckReport` v1 field shape. |
| `.habitat` executable/managing-code files | Habitat file-layer rule | `.habitat/rules/file-layer-habitat-authored-data/rule.json` | `deep-habitat-effect-artifact-language-enforcement` | Does not validate authored JSON semantics. |
| Product/workstream vocabulary in generic Habitat runtime | GritQL pattern plus allowlist file | `.habitat/patterns/checks/habitat_generic_language_fence.md`, `.habitat/rules/habitat-generic-language-fence/rule.json` | `deep-habitat-effect-artifact-language-enforcement` | Does not apply to authored rule examples, host declarations, receipts, or docs. |

## Current Enabled Guardrails Reused By This Packet

| Existing guardrail | Owner | Relevance |
|---|---|---|
| `contract-export-all` | GritQL pattern | General `export *` guard; later public facade packet decides Habitat-specific export narrowing. |
| `file-layer-host-protected-surfaces` | Habitat file-layer | Existing protected surface guard; not a `.habitat` authored-data guard. |
| `docs-local-checkout-paths` | GritQL pattern | Catches local absolute docs paths in docs/pattern examples. |
| `import-boundaries` | Nx boundaries | Project-plane import guard; not a provider/domain direct-use guard. |

## Injected Fixture Decision

No new blocking guardrail is enabled by this packet, so no injected violation
fixture is added here. Adding fixtures without enabling the corresponding
rule would create false proof. Each enabling packet must add the fixture with
the rule and current-tree proof in the same layer.
