# Wrapper Disposition

This record owns the current HESC wrapper/parser policy. It classifies
surviving wrapped mechanisms that still run through Habitat. It does not retire
wrappers, prove CI execution, prove Grit row semantics, prove baseline
semantics, or prove product/runtime behavior.

## Wrapped Scripts

| Rule | Direct command | Current direct output | Habitat projection policy | Retirement trigger |
| --- | --- | --- | --- | --- |
| `mapgen-docs` | `python3 ./scripts/lint/lint-mapgen-docs.py` | Exits 0 with warning text for `@mapgen/*` docs mentions. | Zero-exit warning text is outside the structural claim for this wrapper. Habitat reports pass with no diagnostics unless the script exits nonzero. | Replace with a Habitat-native docs rule or structured script diagnostics if the warning text becomes advisory or enforced Habitat output. |
| `adapter-boundary` | `./scripts/lint/lint-adapter-boundary.sh` | Exits 0 with allowlisted `/base-standard/` debt. | Habitat parses allowlisted debt as baselined diagnostics and fails closed on unapproved violations or unparseable nonzero output. | Move allowlisted debt to explicit Habitat baseline state or replace with a typed Habitat/native boundary rule. |
| `domain-refactor-guardrails` | `./scripts/lint/lint-domain-refactor-guardrails.sh` | Boundary profile exits 0 with progress output. | Zero-exit progress output is outside the structural claim. Habitat reports pass with no diagnostics unless the script exits nonzero. | Replace with typed Habitat/Grit rules for the covered domain-boundary semantics. |

## Wrapped Tests

| Rule | Direct command | Current direct output | Habitat projection policy | Retirement trigger |
| --- | --- | --- | --- | --- |
| `arch-test-core-purity` | `nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static` | Exits 0 with package test output. | Zero-exit test output is outside diagnostics; Habitat reports pass. | Retain while the package architecture test owns core-purity semantics. |
| `arch-test-rng-authority` | `nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static` | Exits 0 with package test output. | Zero-exit test output is outside diagnostics; Habitat reports pass. | Retain while the package architecture test owns RNG-authority semantics. |
| `arch-test-ecology-step-imports` | `nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static` | Exits 0 with package test output. | Zero-exit test output is outside diagnostics; Habitat reports pass. | Retain while the package architecture test owns ecology-step topology semantics. |
| `arch-test-m11-projection-band` | `nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static` | Exits 0 with package test output. | Zero-exit test output is outside diagnostics; Habitat reports pass. | Retain while the package architecture test owns projection-band semantics. |
| `arch-test-map-bundle-runtime-imports` | `bun test mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts` | Exits 0 when generated map bundle output is current; stale or missing generated bundle output remains a direct test failure. | Habitat projects this architecture test through the coarse wrapper. Generated-output freshness is proved by regenerating map artifacts through the owning generator and by the generated-zone drift gate, not by wrapper parser behavior. | Retain while built map bundle output freshness owns runtime-import semantics. |
| `arch-test-cutover` | `nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static` | Exits 0 with package test output. | Zero-exit test output is outside diagnostics; Habitat reports pass. | Retain while the package architecture test owns cutover semantics. |

## Legacy Script Inventory

| File | Disposition |
| --- | --- |
| `scripts/lint-adapter-boundary.sh` | Compatibility forwarder to the canonical lint wrapper. |
| `scripts/lint/lint-adapter-boundary.sh` | Wrapped rule detect command for `adapter-boundary`. |
| `scripts/lint/lint-domain-refactor-guardrails.sh` | Wrapped rule detect command for `domain-refactor-guardrails`. |
| `scripts/lint/lint-mapgen-docs.py` | Wrapped rule detect command for `mapgen-docs`. |

## Proof

- `enforcement-surface.test.ts` proves every current `wrapped-script` and
  `wrapped-test` rule has a disposition entry.
- The same test runs current direct wrapped-script commands through the Habitat
  projection function and proves the accepted parser policies for zero-exit
  warnings, baselined adapter debt, and zero-exit progress output.
- The same test runs current direct wrapped-test commands through the Habitat
  projection function and proves zero-exit output is not hidden as diagnostics.
  The map-bundle runtime-import rule remains a generated-output-owned
  architecture test; freshness is proved by the generated-zone gate and current
  Habitat wrapper command, not by changing the wrapper parser.
