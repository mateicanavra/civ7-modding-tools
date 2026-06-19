# Tasks

## 1. Move Domains

- [ ] 1.1 Move diagnostic catalog source into `src/domains/diagnostic-pattern-catalog/**`.
- [ ] 1.2 Move pattern validation/admission source into `src/domains/pattern-governance/**`.
- [ ] 1.3 Preserve D14A authored artifact validation.
- [ ] 1.4 Replace expected governance throws with typed refusals/errors.

## 2. Verification

- [ ] 2.1 Run diagnostic catalog tests.
- [ ] 2.2 Run pattern authority/schema tests.
- [ ] 2.3 Run `bun run --cwd tools/habitat-harness validate:grit-patterns`.
- [ ] 2.4 Run `bun run openspec -- validate deep-habitat-effect-diagnostic-pattern-governance --strict`.
- [ ] 2.5 Run `bun run openspec:validate`.
- [ ] 2.6 Run `git diff --check`.
