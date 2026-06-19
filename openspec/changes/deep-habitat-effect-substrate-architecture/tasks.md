# Tasks

## 1. Architecture Packet

- [ ] 1.1 Verify the target tree against current `tools/habitat-harness/src/**`.
- [ ] 1.2 Record current-to-target movement for every current Habitat source
  module touched by the refactor.
- [ ] 1.3 Record public-contract risks and parity gates.
- [ ] 1.4 Record domain/provider ownership for every capability.

## 2. Review Lanes

- [ ] 2.1 Domain language review.
- [ ] 2.2 Effect runtime/resource review.
- [ ] 2.3 Public contract review.
- [ ] 2.4 Vendor boundary review.
- [ ] 2.5 TypeScript state-space review.

## 3. Verify

- [ ] 3.1 `bun run openspec -- validate deep-habitat-effect-substrate-architecture --strict`
- [ ] 3.2 `bun run openspec:validate`
- [ ] 3.3 `git diff --check`
