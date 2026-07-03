# Tasks

## 1. Authored Artifact Guards

- [ ] 1.1 Add or update `.habitat/rules/habitat-effect-artifact-language/rule.json`.
- [ ] 1.2 Add or update `.habitat/patterns/checks/habitat-effect-artifact-language.grit`.
- [ ] 1.3 Add injected fixtures proving TypeScript/JavaScript managing code is rejected under `.habitat/{rules,patterns,baselines}/**`.

## 2. Source Language And Boundary Guards

- [ ] 2.1 Add or update `.habitat/rules/habitat-effect-public-internal-language/rule.json`.
- [ ] 2.2 Add or update `.habitat/patterns/checks/habitat-effect-public-internal-language.grit`.
- [ ] 2.3 Add injected fixtures for public/internal import leaks, domain/provider import leaks, and generic Habitat product vocabulary leaks.

## 3. Verification

- [ ] 3.1 Run `bun run habitat check --tool habitat --json`.
- [ ] 3.2 Run any Grit/Biome/Nx-owned checks named by the accepted guard artifacts.
- [ ] 3.3 Run `bun run openspec -- validate deep-habitat-effect-artifact-language-enforcement --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `git diff --check`.
