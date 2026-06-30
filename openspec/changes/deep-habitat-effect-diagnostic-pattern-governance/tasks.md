# Tasks

## 1. Move Domains

- [x] 1.1 Move diagnostic catalog source into `src/domains/diagnostic-pattern-catalog/**`.
- [x] 1.2 Move pattern validation/admission source into `src/domains/pattern-governance/**`.
- [x] 1.3 Preserve D14A authored authority data validation.
- [x] 1.4 Replace expected governance throws with typed refusals/errors.
- [x] 1.5 Keep Grit provider raw-output ownership below domains by moving
      diagnostic acquisition projection into the Grit adapter.

## 2. Verification

- [x] 2.1 Run diagnostic catalog tests.
- [x] 2.2 Run pattern authority/schema tests.
- [x] 2.3 Run `bun run --cwd tools/habitat-harness validate:grit-patterns`.
- [x] 2.4 Run `bun run openspec -- validate deep-habitat-effect-diagnostic-pattern-governance --strict`.
- [x] 2.5 Run `bun run openspec:validate`.
- [x] 2.6 Run `git diff --check`.
