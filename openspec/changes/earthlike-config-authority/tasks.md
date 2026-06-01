## 1. Investigation And Spec

- [x] 1.1 Confirm the intended canonical Earthlike source for shipped maps,
  presets, Studio defaults, and legacy realism tests.
- [x] 1.2 List every intentional Earthlike divergence, or remove the divergence.

## 2. Implementation

- [x] 2.1 Align Swooper Earthlike shipped config and standard preset.
- [x] 2.2 Remove internal projection/op config from Earthlike public posture
  where compilation owns it.
- [x] 2.3 Retire, rename, or replace stale `realismEarthlikeConfig` test usage.
- [x] 2.4 Reuse existing schema/config gates; do not add brittle one-off
  source parity tests for compiler-owned behavior.

## 3. Verification

- [x] 3.1 Run focused config schema/parity tests.
- [x] 3.2 Run `bun run openspec -- validate earthlike-config-authority --strict`.
- [x] 3.3 Run `bun run openspec:validate`.
- [x] 3.4 Run `git diff --check`.
