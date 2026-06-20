# Tasks

## 1. Inventory

- [x] 1.1 Inventory direct runtime/process/fs/env/time calls.
- [x] 1.2 Inventory generic throws and nullable failure channels.
- [x] 1.3 Inventory public/internal barrel exports and package exports.
- [x] 1.4 Inventory option bags and one-implementation abstractions.
- [x] 1.5 Inventory process and host/product vocabulary.

## 2. Guardrail Ownership

- [x] 2.1 Record owner and intended artifact path for `Effect.run*` guardrails outside runtime adapters.
- [x] 2.2 Record owner and intended artifact path for direct process/fs/env/time guardrails outside provider or host-adapter paths.
- [x] 2.3 Record owner and intended artifact path for broad public barrel and internal export leak guardrails.
- [x] 2.4 Record owner and intended artifact path for `.habitat` executable-code and product-language leak guardrails.

## 3. Verification

- [x] 3.1 Add or record pre-migration injected violation fixtures only for guardrails this packet explicitly enables.
- [x] 3.2 Run `bun run habitat check --tool habitat --json` successfully.
- [x] 3.3 Run `bun run openspec -- validate deep-habitat-effect-static-inventory-guardrails --strict`.
- [x] 3.4 Run `bun run openspec:validate`.
- [x] 3.5 Run `git diff --check`.
- [x] 3.6 Run root `bun run build` successfully after repairing the stale MapGen config drift in this stack.
