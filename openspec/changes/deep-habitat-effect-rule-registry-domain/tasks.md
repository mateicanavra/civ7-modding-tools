# Tasks

## 1. Move Domain

- [ ] 1.1 Move registry schemas and loaders into `src/domains/rule-registry/**`.
- [ ] 1.2 Move selector logic into `src/domains/rule-selection/**`.
- [ ] 1.3 Replace generic expected failures with tagged domain errors.
- [ ] 1.4 Replace direct filesystem/config access with services.

## 2. Compatibility

- [ ] 2.1 Preserve authored `.habitat/rules/**` schema parsing.
- [ ] 2.2 Preserve check/classify rule selection behavior.
- [ ] 2.3 Add public adapters only where the public-surface packet allows them.

## 3. Verification

- [ ] 3.1 Run registry malformed/graph/selection tests.
- [ ] 3.2 Run `bun run habitat:check -- --tool habitat --json`.
- [ ] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 3.4 Run `bun run openspec -- validate deep-habitat-effect-rule-registry-domain --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Run `git diff --check`.
