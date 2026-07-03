# Tasks

## 1. Architecture Packet

- [x] 1.1 Verify the target tree against current `tools/habitat-harness/src/**`.
- [x] 1.2 Record current-to-target movement for every current Habitat source
  module touched by the refactor.
- [x] 1.3 Record public-contract risks and parity gates.
- [x] 1.4 Record domain/provider ownership for every capability.
- [x] 1.5 Bind public-contract risks to concrete D0 `surface_id` rows.

## 2. Review Lanes

- [x] 2.1 Domain language review.
- [x] 2.2 Effect runtime/resource review.
- [x] 2.3 Public contract review.
- [x] 2.4 Vendor boundary review.
- [x] 2.5 TypeScript state-space review.
- [x] 2.6 Record P1/P2 findings and dispositions.

## 3. Verify

- [x] 3.1 `bun run openspec -- validate deep-habitat-effect-substrate-architecture --strict`
- [x] 3.2 `bun run openspec:validate`
- [x] 3.3 `git diff --check`
- [x] 3.4 Create dedicated Graphite layer `agent-DRA-effect-substrate-architecture`.
