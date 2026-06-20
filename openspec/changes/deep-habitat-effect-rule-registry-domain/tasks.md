# Tasks

## 1. Move Domain

- [x] 1.1 Move registry schemas and loaders into `src/domains/rule-registry/**`.
- [x] 1.2 Move selector logic into `src/domains/rule-selection/**`.
- [x] 1.3 Replace generic expected failures with tagged domain errors.
- [x] 1.4 Replace direct filesystem/config access with services.

## 2. Compatibility

- [x] 2.1 Preserve authored `.habitat/rules/**` schema parsing.
- [x] 2.2 Preserve check/classify rule selection behavior.
- [x] 2.3 Add public adapters only where the public-surface packet allows them.

## 3. Verification

- [x] 3.1 Run registry malformed/graph/selection tests.
- [x] 3.2 Run Habitat harness check for the package owner.
- [x] 3.3 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.4 Run `bun run openspec -- validate deep-habitat-effect-rule-registry-domain --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Run `git diff --check`.

## Notes

- The original packet command `bun run habitat:check -- --tool habitat --json` is stale: the current selector rejects `habitat` as an unknown tool id. The valid owner-scoped equivalent is `bun run habitat:check -- --owner @internal/habitat-harness --json`.
- The owner-scoped Habitat check now reaches the current-tree Grit pattern failures instead of failing this domino's format/type surface. Those pattern failures are outside the rule-registry ownership move and remain owned by the pattern/Grit cutover work.
