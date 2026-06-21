# Tasks

## 1. Move Decisions

- [x] 1.1 Move reusable scaffold decisions into `src/domains/scaffolding/**`.
- [x] 1.2 Keep Nx generator host code in `src/generators/**` and `src/plugin/**`.
- [x] 1.3 Add typed unsupported-domain refusals for product authoring requests.
- [x] 1.4 Preserve current generator names and accepted options.

## 2. Verification

- [x] 2.1 Run generator unit/fixture tests.
- [x] 2.2 Run unsupported authoring refusal tests.
- [x] 2.3 Run `bun run --cwd tools/habitat-harness check`.
- [x] 2.4 Run `bun run openspec -- validate deep-habitat-effect-scaffolding-authoring-fence --strict`.
- [x] 2.5 Run `bun run openspec:validate`.
- [x] 2.6 Run `git diff --check`.
