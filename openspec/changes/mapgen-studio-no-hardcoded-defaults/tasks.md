## 1. Implementation

- [ ] 1.1 Delete `apps/mapgen-studio/src/ui/data/defaultConfig.ts`; confirm no
      remaining importers (app or tests) besides the retargeted shape tests.
- [ ] 1.2 Rewrite the two legacy-shape blocks in
      `test/config/defaultConfigSchema.test.ts` to assert against
      `STANDARD_RECIPE_CONFIG`, preserving the semantic-surface guards
      (expected key sets, no raw op envelopes, no legacy stage keys).

## 2. Verification

- [ ] 2.1 `bun run openspec -- validate mapgen-studio-no-hardcoded-defaults --strict`
- [ ] 2.2 tsc + mapgen-studio vitest green
- [ ] 2.3 `rg` sweep: no app-side literal pipeline-default duplicates remain.
