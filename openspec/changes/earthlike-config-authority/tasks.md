## 1. Investigation And Spec

- [ ] 1.1 Confirm the intended canonical Earthlike source for shipped maps,
  presets, Studio defaults, and legacy realism tests.
- [ ] 1.2 List every intentional Earthlike divergence, or remove the divergence.

## 2. Implementation

- [ ] 2.1 Align Swooper Earthlike shipped config and standard preset.
- [ ] 2.2 Make omitted Earthlike step defaults explicit where they affect
  balance proof or runtime projection.
- [ ] 2.3 Retire, rename, or replace stale `realismEarthlikeConfig` test usage.
- [ ] 2.4 Add parity tests for Earthlike config sources.

## 3. Verification

- [ ] 3.1 Run focused config schema/parity tests.
- [ ] 3.2 Run `bun run openspec -- validate earthlike-config-authority --strict`.
- [ ] 3.3 Run `bun run openspec:validate`.
- [ ] 3.4 Run `git diff --check`.
