# Tasks

## 1. Move Decisions

- [ ] 1.1 Move reusable scaffold decisions into `src/domains/scaffolding/**`.
- [ ] 1.2 Keep Nx generator host code in `src/generators/**` and `src/plugin/**`.
- [ ] 1.3 Add typed unsupported-domain refusals for product authoring requests.
- [ ] 1.4 Preserve current generator names and accepted options.

## 2. Verification

- [ ] 2.1 Run generator unit/fixture tests.
- [ ] 2.2 Run unsupported authoring refusal tests.
- [ ] 2.3 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 2.4 Run `bun run openspec -- validate deep-habitat-effect-scaffolding-authoring-fence --strict`.
- [ ] 2.5 Run `bun run openspec:validate`.
- [ ] 2.6 Run `git diff --check`.
