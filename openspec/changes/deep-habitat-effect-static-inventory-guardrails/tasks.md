# Tasks

## 1. Inventory

- [ ] 1.1 Inventory direct runtime/process/fs/env/time calls.
- [ ] 1.2 Inventory generic throws and nullable failure channels.
- [ ] 1.3 Inventory public/internal barrel exports and package exports.
- [ ] 1.4 Inventory option bags and one-implementation abstractions.
- [ ] 1.5 Inventory process and host/product vocabulary.

## 2. Guardrail Ownership

- [ ] 2.1 Record owner and intended artifact path for `Effect.run*` guardrails outside runtime adapters.
- [ ] 2.2 Record owner and intended artifact path for direct process/fs/env/time guardrails outside provider or host-adapter paths.
- [ ] 2.3 Record owner and intended artifact path for broad public barrel and internal export leak guardrails.
- [ ] 2.4 Record owner and intended artifact path for `.habitat` executable-code and product-language leak guardrails.

## 3. Proof

- [ ] 3.1 Add or record pre-migration injected violation fixtures only for guardrails this packet explicitly enables.
- [ ] 3.2 Run `bun run habitat:check -- --json`.
- [ ] 3.3 Run `bun run openspec -- validate deep-habitat-effect-static-inventory-guardrails --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `git diff --check`.
